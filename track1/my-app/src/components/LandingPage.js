import React from 'react';
import { useNavigate } from 'react-router-dom';
import './LandingPage.css';

function LandingPage() {
  const navigate = useNavigate();

  return (
    <div className="landing-container">
      <div className="hero">
        <div className="hero-content">
          <h1 className="hero-title">Hi, Hello, Welcome</h1>
          <p className="hero-subtitle">to the Digital Twin Dashboard</p>
          <p className="hero-description">
            This project showcases real-time monitoring and insights across upstream, midstream,
            downstream, and power assets. Explore each twin to view the latest snapshots,
            historical trends, and intelligent alerts.
          </p>
          <div className="hero-actions">
            <button className="primary-btn" onClick={() => navigate('/login')}>Login</button>
            <button className="secondary-btn" onClick={() => navigate('/register')}>Register</button>
            <button className="secondary-btn" onClick={() => window.location.href = 'http://localhost:5000/api/auth/oauth/google'}>Sign in with Google</button>
          </div>
        </div>
        <div className="hero-art" aria-hidden="true">
          <div className="glow glow-1"></div>
          <div className="glow glow-2"></div>
          <div className="grid"></div>
        </div>
      </div>

      <div className="info-cards">
        <div className="info-card">
          <h3>Real-time Data</h3>
          <p>Stay up to date with the latest readings from your assets.</p>
        </div>
        <div className="info-card">
          <h3>Charts & Trends</h3>
          <p>Visualize historical performance and detect anomalies quickly.</p>
        </div>
        <div className="info-card">
          <h3>Actionable Alerts</h3>
          <p>Get notified when metrics drift beyond expected thresholds.</p>
        </div>
      </div>
    </div>
  );
}

export default LandingPage;
