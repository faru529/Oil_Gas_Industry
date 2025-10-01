import os
import time
from datetime import datetime
from typing import List, Dict, Any

import numpy as np
import pandas as pd
import streamlit as st
import matplotlib.pyplot as plt
from pymongo import MongoClient
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split
from sklearn.metrics import classification_report

# --- Config ---
MONGO_URI = os.getenv("MONGO_URI", "mongodb://localhost:27017")
DB_NAME = os.getenv("DB_NAME", "digitalTwinsTelemetryDB")
COLLECTIONS = [
    "compressor1",
    "drillrig1",
    "pipeline1",
    "refinery1",
    "retail1",
    "transformer1",
    "turbine1",
    "wellhead1",
]

DEFAULT_COSTS = {
    "compressor1": {"revenue_per_hour": 41500.0, "maintenance_base": 207500.0},  # $500 = ₹41,500, $2500 = ₹207,500
    "drillrig1": {"revenue_per_hour": 99600.0, "maintenance_base": 664000.0},    # $1200 = ₹99,600, $8000 = ₹664,000
    "turbine1": {"revenue_per_hour": 124500.0, "maintenance_base": 830000.0},    # $1500 = ₹124,500, $10000 = ₹830,000
    "pipeline1": {"revenue_per_hour": 58100.0, "maintenance_base": 332000.0},    # $700 = ₹58,100, $4000 = ₹332,000
    "refinery1": {"revenue_per_hour": 166000.0, "maintenance_base": 1245000.0},  # $2000 = ₹166,000, $15000 = ₹1,245,000
    "retail1": {"revenue_per_hour": 24900.0, "maintenance_base": 124500.0},      # $300 = ₹24,900, $1500 = ₹124,500
    "transformer1": {"revenue_per_hour": 49800.0, "maintenance_base": 415000.0}, # $600 = ₹49,800, $5000 = ₹415,000
    "wellhead1": {"revenue_per_hour": 37350.0, "maintenance_base": 249000.0},    # $450 = ₹37,350, $3000 = ₹249,000
}


# --- Helpers ---
@st.cache_resource(show_spinner=False)
def get_mongo_client(uri: str):
    return MongoClient(uri)


def load_docs(client: MongoClient, db_name: str, coll: str, limit: int = 1000) -> List[Dict[str, Any]]:
    db = client[db_name]
    cursor = db[coll].find({}).sort("ts", -1).limit(limit)
    return list(cursor)


def to_df(docs: List[Dict[str, Any]]) -> pd.DataFrame:
    if not docs:
        return pd.DataFrame()
    df = pd.DataFrame(docs)
    # Normalize timestamp column to pandas datetime
    if "ts" in df.columns:
        try:
            df["ts"] = pd.to_datetime(df["ts"], errors="coerce")
        except Exception:
            pass
    # Drop non-feature columns we won't train on
    drop_cols = [c for c in ["_id", "status"] if c in df.columns]
    df = df.drop(columns=drop_cols, errors="ignore")
    # Keep numeric columns only (exclude sales); we will also carry ts separately
    num_df = df.select_dtypes(include=[np.number]).copy()
    for c in list(num_df.columns):
        lc = str(c).lower()
        if lc in ("sales", "lastsales"):
            num_df.drop(columns=[c], inplace=True, errors="ignore")
    # Add twinId if present (not as feature but to group/report)
    if "twinId" in df.columns:
        num_df["twinId"] = df["twinId"]
    # Carry timestamp for time-series plots
    if "ts" in df.columns:
        num_df["ts"] = df["ts"]
    return num_df


def build_labels(features: pd.DataFrame) -> pd.Series:
    # Unsup proxy: mark as 1 (at-risk) if any z-score > 3 or < -3 across metrics for that row
    feat_only = features.select_dtypes(include=[np.number]).drop(columns=[c for c in ("twinId",) if c in features.columns], errors="ignore")
    if feat_only.empty:
        return pd.Series([0] * len(features), index=features.index)
    z = (feat_only - feat_only.mean()) / (feat_only.std(ddof=0).replace(0, 1))
    risky = (np.abs(z) > 3).any(axis=1).astype(int)
    return risky


def train_model(features: pd.DataFrame, labels: pd.Series):
    """Train a classifier and return (model, feature_names) used for training.

    Ensures fallback training uses the same number of features as the
    available numeric columns to avoid n_features mismatch at predict time.
    """
    X = features.select_dtypes(include=[np.number]).drop(columns=[c for c in ("twinId",) if c in features.columns], errors="ignore")
    y = labels
    feature_names = list(X.columns)
    # If there are no numeric features, create a dummy single feature
    if X.shape[1] == 0:
        feature_names = ["f0"]
    if X.empty or len(np.unique(y)) == 1:
        # Fallback classifier with synthetic variability, matching feature width
        n_features = max(1, len(feature_names))
        model = RandomForestClassifier(n_estimators=50, random_state=42)
        X_syn_np = np.random.randn(max(20, len(X) or 20), n_features)
        # Fit using a DataFrame with explicit column names to avoid sklearn warnings
        X_syn = pd.DataFrame(X_syn_np, columns=[f for f in feature_names])
        y_syn = np.random.randint(0, 2, size=X_syn.shape[0])
        model.fit(X_syn, y_syn)
        return model, feature_names
    
    # Check if we have enough samples for stratified split
    min_class_count = min(np.bincount(y))
    if min_class_count < 2:
        # Not enough samples for stratified split, use regular split
        X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.25, random_state=42)
    else:
        X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.25, random_state=42, stratify=y)
    model = RandomForestClassifier(n_estimators=200, max_depth=None, random_state=42, n_jobs=-1)
    model.fit(X_train, y_train)
    return model, feature_names


def estimate_costs(prob: float, coll: str, hours_horizon: float) -> Dict[str, float]:
    cfg = DEFAULT_COSTS.get(coll, {"revenue_per_hour": 500.0, "maintenance_base": 2500.0})
    rev_per_hr = float(cfg["revenue_per_hour"])
    maint_base = float(cfg["maintenance_base"])
    # Assume expected downtime hours scales with probability over the horizon
    expected_downtime = hours_horizon * prob * 0.25
    revenue_loss = expected_downtime * rev_per_hr
    # Maintenance cost increases with probability
    maintenance_cost = maint_base * (0.5 + 1.5 * prob)
    return {
        "expected_downtime_hours": round(expected_downtime, 2),
        "revenue_loss": round(revenue_loss, 2),
        "maintenance_cost": round(maintenance_cost, 2),
    }


# --- UI ---
st.set_page_config(page_title="Predictive Maintenance", layout="wide", initial_sidebar_state="expanded")

# Custom dark theme CSS
st.markdown("""
<style>
    /* Main background */
    .stApp {
        background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
    }
    
    /* Headers */
    h1, h2, h3 {
        color: #f1f5f9 !important;
        font-weight: 700 !important;
    }
    
    /* Cards and containers */
    .stDataFrame, .stTable {
        background-color: #1e293b;
        border-radius: 8px;
        border: 1px solid #334155;
    }
    
    /* Sidebar */
    section[data-testid="stSidebar"] {
        background: linear-gradient(180deg, #0f172a 0%, #1e293b 100%);
        border-right: 1px solid #334155;
    }
    
    /* Sidebar labels and text */
    section[data-testid="stSidebar"] label {
        color: #f1f5f9 !important;
        font-weight: 600 !important;
        font-size: 0.95rem !important;
    }
    
    section[data-testid="stSidebar"] .stMarkdown {
        color: #f1f5f9 !important;
    }
    
    section[data-testid="stSidebar"] h2, section[data-testid="stSidebar"] h3 {
        color: #ffffff !important;
        font-weight: 700 !important;
    }
    
    section[data-testid="stSidebar"] p {
        color: #e2e8f0 !important;
    }
    
    /* Input fields in sidebar */
    section[data-testid="stSidebar"] input {
        color: #f1f5f9 !important;
        background-color: #1e293b !important;
    }
    
    /* Sidebar select boxes */
    section[data-testid="stSidebar"] .stSelectbox label,
    section[data-testid="stSidebar"] .stMultiSelect label,
    section[data-testid="stSidebar"] .stNumberInput label,
    section[data-testid="stSidebar"] .stSlider label {
        color: #ffffff !important;
    }
    
    /* Metrics */
    div[data-testid="stMetricValue"] {
        color: #3b82f6 !important;
        font-size: 2rem !important;
    }
    
    div[data-testid="stMetricLabel"] {
        color: #f1f5f9 !important;
        font-weight: 600 !important;
    }
    
    /* All text in main area */
    .main .stMarkdown {
        color: #f1f5f9 !important;
    }
    
    .main h1, .main h2, .main h3, .main h4, .main h5, .main h6 {
        color: #ffffff !important;
    }
    
    .main p {
        color: #e2e8f0 !important;
    }
    
    /* Expander */
    .streamlit-expanderHeader {
        background-color: #1e293b;
        border-radius: 4px;
    }
</style>
""", unsafe_allow_html=True)

st.title("🔧 Predictive Maintenance Dashboard")

with st.sidebar:
    st.header("⚙️ Connection Settings")
    mongo_uri = st.text_input("Mongo URI", value=MONGO_URI)
    db_name = st.text_input("Database", value=DB_NAME)
    
    st.header("📊 Data Configuration")
    selected_collections = st.multiselect("Choose collections", COLLECTIONS, default=COLLECTIONS)
    limit = st.number_input("Fetch last N docs per collection", min_value=100, max_value=5000, value=1000, step=50)
    
    st.header("🎯 Analysis Settings")
    horizon_hours = st.slider("Prediction Horizon (hours)", min_value=12, max_value=336, value=72, step=12)
    min_avg_risk = st.slider("Min Risk Threshold", min_value=0.0, max_value=1.0, value=0.0, step=0.01, help="Filter twins by minimum average risk")

    st.header("💰 Cost Configuration")
    cost_overrides = {}
    for coll in selected_collections:
        cfg = DEFAULT_COSTS.get(coll, {"revenue_per_hour": 41500.0, "maintenance_base": 207500.0})
        with st.expander(f"💵 {coll.title()}"):
            rph = st.number_input(f"Revenue per hour (₹)", min_value=0.0, value=float(cfg["revenue_per_hour"]), step=1000.0, key=f"rph_{coll}")
            mbase = st.number_input(f"Base maintenance cost (₹)", min_value=0.0, value=float(cfg["maintenance_base"]), step=5000.0, key=f"mbase_{coll}")
            cost_overrides[coll] = {"revenue_per_hour": rph, "maintenance_base": mbase}

    if st.button("💾 Apply Cost Settings", type="primary"):
        for k, v in cost_overrides.items():
            DEFAULT_COSTS[k] = v
        st.success("✅ Cost overrides applied successfully!")

# Connect
client = get_mongo_client(mongo_uri)

# Load and predict per collection
results_rows = []
summary_rows = []  # average risk per twin for summary scatter
time_rows = []     # time-series points: {collection, twinId, _ts, risk}
for coll in selected_collections:
    with st.spinner(f"Loading {coll}..."):
        docs = load_docs(client, db_name, coll, limit=limit)
    df = to_df(docs)
    if df.empty:
        st.warning(f"No data for {coll}")
        continue

    # Group by twinId if present, otherwise single group
    twins = df["twinId"].dropna().unique().tolist() if "twinId" in df.columns else [None]
    for twin in twins:
        if twin is None:
            subset = df
        else:
            subset = df[df["twinId"] == twin]
        if len(subset) < 30:
            continue
        # Compute per-row risk using z-score anomaly proxy for time series
        X_all = subset.select_dtypes(include=[np.number]).drop(columns=[c for c in ("twinId", "ts") if c in subset.columns], errors="ignore")
        if X_all.empty:
            row_risk = pd.Series([0.0] * len(subset), index=subset.index)
        else:
            z = (X_all - X_all.mean()) / (X_all.std(ddof=0).replace(0, 1))
            row_risk = (np.abs(z) > 3).mean(axis=1).fillna(0.0)  # fraction of metrics out-of-band per row
        # Add to time series rows
        if "ts" in subset.columns:
            for ts_val, r_val in zip(subset["ts"], row_risk):
                if pd.isna(ts_val):
                    continue
                time_rows.append({
                    "collection": coll,
                    "twinId": twin,
                    "ts": ts_val,
                    "risk": float(np.clip(r_val, 0.0, 1.0)),
                })
        # Use z-score based risk for both table and graph (consistent)
        avg_ts_risk = float(np.clip(row_risk.mean() if len(row_risk) else 0.0, 0.0, 1.0))
        risk = avg_ts_risk  # Use the same z-score risk for table
        # Severity
        severity = "high" if risk >= 0.66 else ("medium" if risk >= 0.33 else "low")
        # Costs
        costs = estimate_costs(risk, coll, horizon_hours)
        results_rows.append({
            "collection": coll,
            "twinId": twin,
            "risk": round(risk, 3),
            "severity": severity,
            "horizonHours": horizon_hours,
            **costs,
        })
        summary_rows.append({
            "collection": coll,
            "twinId": twin,
            "avgRisk": round(avg_ts_risk, 3),
        })

# Display results
if results_rows:
    res_df = pd.DataFrame(results_rows)
    # Sort by severity then risk desc
    order = {"high": 2, "medium": 1, "low": 0}
    res_df["sev_order"] = res_df["severity"].map(order)
    res_df = (
        res_df
        .sort_values(["sev_order", "risk"], ascending=[False, False])
        .drop(columns=["sev_order"]) 
        .reset_index(drop=True)
    )

    # Summary metrics at top
    col1, col2, col3, col4 = st.columns(4)
    high_risk = len(res_df[res_df["severity"] == "high"])
    med_risk = len(res_df[res_df["severity"] == "medium"])
    low_risk = len(res_df[res_df["severity"] == "low"])
    total_revenue_loss = res_df["revenue_loss"].sum()
    
    with col1:
        st.metric("🔴 Assets", high_risk)
    with col2:
        st.metric("🟡 Medium Risk Assets", med_risk)
    with col3:
        st.metric("🟢 Low Risk Assets", low_risk)
    with col4:
        st.metric("💸 Total Revenue at Risk", f"₹{total_revenue_loss:,.0f}")
    
    st.markdown("---")
    st.subheader("📋 Risk Predictions by Asset")
    
    # Color code the dataframe with lighter backgrounds and black text
    def highlight_severity(row):
        if row['severity'] == 'high':
            return ['background-color: rgba(239, 68, 68, 0.2); color: #000000'] * len(row)  # Light red with black text
        elif row['severity'] == 'medium':
            return ['background-color: rgba(245, 158, 11, 0.2); color: #000000'] * len(row)  # Light orange with black text
        else:
            return ['background-color: rgba(34, 197, 94, 0.2); color: #000000'] * len(row)  # Light green with black text
    
    styled_df = res_df.style.apply(highlight_severity, axis=1)
    st.dataframe(styled_df, use_container_width=True)
    
    # Healthy Assets Section (Low Risk)
    healthy_assets = res_df[res_df["severity"] == "low"]
    if not healthy_assets.empty:
        st.markdown("---")
        st.subheader("✅ Healthy Assets (Low Risk)")
        st.success(f"🎉 {len(healthy_assets)} asset(s) operating within normal parameters")
        
        # Show healthy assets in a nice grid
        cols_per_row = 3
        for i in range(0, len(healthy_assets), cols_per_row):
            cols = st.columns(cols_per_row)
            for j, (idx, asset) in enumerate(healthy_assets.iloc[i:i+cols_per_row].iterrows()):
                with cols[j]:
                    st.markdown(f"""
                    <div style="background: linear-gradient(135deg, #064e3b 0%, #065f46 100%); 
                                padding: 15px; border-radius: 10px; border: 2px solid #10b981;">
                        <h4 style="color: #86efac; margin: 0;">✅ {asset['twinId']}</h4>
                        <p style="color: #d1fae5; font-size: 24px; font-weight: bold; margin: 5px 0;">
                            {asset['risk']:.3f}
                        </p>
                        <p style="color: #a7f3d0; font-size: 14px; margin: 0;">
                            🟢 Operating Normally
                        </p>
                        <p style="color: #d1fae5; font-size: 12px; margin: 5px 0 0 0;">
                            No maintenance required
                        </p>
                    </div>
                    """, unsafe_allow_html=True)
    
    # Medium Risk Assets - Schedule Maintenance
    medium_risk_assets = res_df[res_df["severity"] == "medium"]
    if not medium_risk_assets.empty:
        st.markdown("---")
        st.subheader("🟡 Assets Requiring Attention (Medium Risk)")
        st.info(f"ℹ️ {len(medium_risk_assets)} asset(s) should be scheduled for preventive maintenance")
        
        for idx, asset in medium_risk_assets.iterrows():
            with st.expander(f"🟡 {asset['twinId']} - Risk: {asset['risk']:.3f}"):
                col_m1, col_m2, col_m3 = st.columns(3)
                
                with col_m1:
                    st.metric("📊 Risk Level", f"{asset['risk']:.3f}")
                    st.caption("Medium - Preventive action recommended")
                
                with col_m2:
                    st.metric("📅 Recommended Maintenance", "Within 7 days")
                    st.caption("Schedule during next maintenance window")
                
                with col_m3:
                    st.metric("💰 Potential Savings", f"₹{asset['revenue_loss']:,.0f}")
                    st.caption("By preventing escalation to high risk")
                
                st.markdown("**Recommended Actions:**")
                st.markdown("""
                - 📋 Schedule routine inspection
                - 🔧 Perform preventive maintenance
                - 📊 Monitor trends closely
                - 📝 Update maintenance logs
                """)
    
    # Failure Prediction for High-Risk Assets
    high_risk_assets = res_df[res_df["severity"] == "high"]
    if not high_risk_assets.empty:
        st.markdown("---")
        st.subheader("🚨 Failure Prediction for High-Risk Assets")
        st.warning(f"⚠️ {len(high_risk_assets)} asset(s) at high risk of failure")
        
        for idx, asset in high_risk_assets.iterrows():
            with st.expander(f"🔴 {asset['twinId']} - Risk: {asset['risk']:.3f}", expanded=True):
                col_f1, col_f2, col_f3 = st.columns(3)
                
                # Calculate failure probability (risk * 100)
                failure_prob = asset['risk'] * 100
                
                # Estimate time to failure based on risk level
                if asset['risk'] >= 0.9:
                    time_to_failure = "< 6 hours"
                    urgency = "🔴 CRITICAL"
                elif asset['risk'] >= 0.8:
                    time_to_failure = "6-12 hours"
                    urgency = "🔴 URGENT"
                elif asset['risk'] >= 0.7:
                    time_to_failure = "12-24 hours"
                    urgency = "🟠 HIGH"
                else:
                    time_to_failure = "24-48 hours"
                    urgency = "🟡 MODERATE"
                
                # Determine likely failure type based on collection
                failure_types = {
                    "drillrig1": ["Mechanical Wear", "Bearing Failure", "Hydraulic System"],
                    "wellhead1": ["Pressure Valve Failure", "Seal Degradation", "Flow Control Issue"],
                    "pipeline1": ["Corrosion", "Leak", "Pressure Drop"],
                    "compressor1": ["Motor Failure", "Overheating", "Energy Inefficiency"],
                    "refinery1": ["Heat Exchanger Failure", "Catalyst Degradation", "Process Upset"],
                    "retail1": ["Pump Failure", "Tank Leak", "Dispenser Malfunction"],
                    "turbine1": ["Blade Damage", "Vibration Excess", "Bearing Wear"],
                    "transformer1": ["Insulation Breakdown", "Overheating", "Voltage Fluctuation"]
                }
                
                likely_failures = failure_types.get(asset['collection'], ["General Equipment Failure"])
                
                with col_f1:
                    st.metric("💥 Failure Probability", f"{failure_prob:.1f}%")
                    st.caption("Based on current risk score")
                
                with col_f2:
                    st.metric("⏰ Estimated Time to Failure", time_to_failure)
                    st.caption(f"Urgency: {urgency}")
                
                with col_f3:
                    st.metric("🔧 Recommended Action", "Immediate Inspection")
                    st.caption(f"Schedule within {time_to_failure}")
                
                st.markdown("**Likely Failure Modes:**")
                for i, failure in enumerate(likely_failures, 1):
                    st.markdown(f"{i}. {failure}")
                
                st.markdown("**Recommended Actions:**")
                st.markdown(f"""
                - 🔍 Conduct immediate visual inspection
                - 📊 Review recent sensor data for anomalies
                - 🛠️ Prepare maintenance team and spare parts
                - 📞 Alert operations manager
                - 💰 Estimated cost if failure occurs: ₹{asset['revenue_loss']:,.0f} (revenue loss) + ₹{asset['maintenance_cost']:,.0f} (repairs)
                """)

    # Time-series line chart: risk evolution over time per twin (per collection)
    summary_df = pd.DataFrame(summary_rows) if summary_rows else pd.DataFrame(columns=["collection","twinId","avgRisk"])
    st.markdown("---")
    #st.subheader("📈 Risk Trend Over Time (Time Series)")
    
    ts_df = pd.DataFrame(time_rows) if time_rows else pd.DataFrame(columns=["collection","twinId","ts","risk"])
    if not ts_df.empty:
        ts_df = ts_df.dropna(subset=["ts"])  # ensure timestamps exist
        for coll in res_df["collection"].unique():
            # Only include twins that meet the min_avg_risk filter
            all_twins_in_coll = set(ts_df[ts_df["collection"] == coll]["twinId"].astype(str).unique())
            allowed = set(summary_df[(summary_df["collection"] == coll) & (summary_df["avgRisk"] >= min_avg_risk)]["twinId"].astype(str).tolist())
            sub = ts_df[ts_df["collection"] == coll]
            
            if len(allowed) > 0:
                sub = sub[sub["twinId"].astype(str).isin(allowed)]
                filtered_out = len(all_twins_in_coll) - len(allowed)
                if filtered_out > 0:
                    st.warning(f"⚠️ **{coll.title()}**: {filtered_out} twin(s) hidden due to min risk threshold {min_avg_risk:.2f}")
            
            if sub.empty:
                st.info(f"ℹ️ **{coll.title()}**: No time series data available for twins meeting threshold")
                continue
            
            st.markdown(f"### 📈 {coll.title()} • Risk Over Time")
            # Plot multiple lines by twin
            fig, ax = plt.subplots(figsize=(11, 4.5), facecolor='#1e293b')
            ax.set_facecolor('#0f172a')
            
            colors_palette = ['#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#06b6d4']
            for idx, (twin, grp) in enumerate(sub.groupby(sub["twinId"].astype(str))):
                g = grp.sort_values("ts")
                color = colors_palette[idx % len(colors_palette)]
                ax.plot(g["ts"], g["risk"], label=str(twin), linewidth=2.5, alpha=0.9, color=color)
            
            ax.set_ylim(0.0, 1.0)
            ax.set_ylabel("Risk Score", fontsize=11, color='#f1f5f9', fontweight='bold')
            ax.set_xlabel("Time", fontsize=11, color='#f1f5f9', fontweight='bold')
            ax.tick_params(colors='#cbd5e1')
            
            # Threshold overlays
            ax.axhline(0.33, color="#f59e0b", linestyle="--", linewidth=2, alpha=0.6, label='Medium Threshold')
            ax.axhline(0.66, color="#ef4444", linestyle="--", linewidth=2, alpha=0.6, label='High Threshold')
            
            ax.grid(True, axis="both", linestyle="--", alpha=0.2, color='#475569')
            ax.legend(loc="upper left", facecolor='#1e293b', edgecolor='#334155', fontsize=9, labelcolor='#f1f5f9', ncol=3)
            
            ax.spines['bottom'].set_color('#475569')
            ax.spines['top'].set_color('#475569')
            ax.spines['left'].set_color('#475569')
            ax.spines['right'].set_color('#475569')
            
            plt.tight_layout()
            st.pyplot(fig, clear_figure=True)

else:
    st.info("ℹ️ No results to display. Try increasing the data limit or selecting more collections.")

st.markdown("---")
col_a, col_b = st.columns([3, 1])
with col_a:
    st.caption(f"📅 Last updated: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
with col_b:
    st.caption("🔧 Powered by ML Analytics")


