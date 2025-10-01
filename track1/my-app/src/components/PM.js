import React from "react";

export default function PredictiveMaintenance() {
  const url =
    (typeof process !== "undefined" && process.env && process.env.REACT_APP_PM_URL) ||
    (typeof import.meta !== "undefined" && import.meta.env && import.meta.env.VITE_PM_URL) ||
    "http://localhost:8501";
  return (
    <div className="card" style={{ padding: 0 }}>
      <div style={{ padding: 12, borderBottom: "1px solid var(--border)" }}>
        <h2 style={{ margin: 0 }}>Predictive Maintenance</h2>
        <small style={{ color: "var(--muted)" }}>Embedded Streamlit app at {url}</small>
      </div>
      <iframe
        title="Predictive Maintenance"
        src={url}
        style={{ width: "100%", height: "80vh", border: 0 }}
      />
    </div>
  );
}