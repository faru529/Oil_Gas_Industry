import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import axios from 'axios';
import RoleLogin from './components/RoleLogin';
import ERPDashboard from './components/ERPDashboard';
import MESManager from './components/MESManager';
import ShopfloorUser from './components/ShopfloorUser';

// Configure axios defaults
axios.defaults.baseURL = 'http://localhost:4000';
axios.defaults.withCredentials = true;

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is already logged in
    axios.get('/me')
      .then(res => {
        setUser(res.data);
        setLoading(false);
      })
      .catch(() => {
        setUser(null);
        setLoading(false);
      });
  }, []);

  const handleLogin = (userData) => {
    setUser(userData);
  };

  const handleLogout = () => {
    axios.post('/logout')
      .then(() => {
        setUser(null);
      })
      .catch(err => {
        console.error('Logout error:', err);
        setUser(null);
      });
  };

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        color: '#fff',
        fontSize: '1.5rem'
      }}>
        Loading...
      </div>
    );
  }

  return (
    <Router>
      <Routes>
        <Route 
          path="/" 
          element={
            !user ? (
              <RoleLogin onLogin={handleLogin} />
            ) : (
              <Navigate to="/dashboard" replace />
            )
          } 
        />
        
        <Route 
          path="/dashboard" 
          element={
            !user ? (
              <Navigate to="/" replace />
            ) : user.role === 'erp_owner' ? (
              <ERPDashboard user={user} onLogout={handleLogout} />
            ) : user.role === 'mes_manager' ? (
              <MESManager user={user} onLogout={handleLogout} />
            ) : user.role === 'user' ? (
              <ShopfloorUser user={user} onLogout={handleLogout} />
            ) : (
              <div style={{ color: '#fff', padding: '20px' }}>Invalid role</div>
            )
          } 
        />
      </Routes>
    </Router>
  );
}

export default App;
