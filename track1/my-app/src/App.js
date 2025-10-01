import React, { useMemo } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { createTheme, ThemeProvider, CssBaseline } from '@mui/material';
import Navbar from './components/Navbar';
import TwinPage from './components/TwinPage';
import LandingPage from './components/LandingPage';
import Login from './components/Login';
import Register from './components/Register';
import ProtectedRoute from './components/ProtectedRoute';
import { AuthProvider } from './components/AuthContext';
import OAuthCallback from './components/OAuthCallback';
import Dashboard from './components/Dashboard';
import Alerts from './components/Alerts';
import Analytics from './components/Analytics';
import PredictiveMaintenance from './components/PM';

const AppContent = () => {
  const location = useLocation();
  const showNavbar = location.pathname !== '/';

  return (
    <>
      {showNavbar && <Navbar />}
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/oauth/callback" element={<OAuthCallback />} />
        <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="/alerts" element={<ProtectedRoute><Alerts /></ProtectedRoute>} />
        <Route path="/analytics" element={<ProtectedRoute><Analytics /></ProtectedRoute>} />
        <Route path="/twin/:twinId" element={<ProtectedRoute><TwinPage /></ProtectedRoute>} />
        <Route path="/pm" element={<ProtectedRoute><PredictiveMaintenance /></ProtectedRoute>} />
      </Routes>
    </>
  );
};

const App = () => {
  const darkTheme = useMemo(() => createTheme({
    palette: {
      mode: 'dark',
    },
  }), []);

  return (
    <ThemeProvider theme={darkTheme}>
      <CssBaseline />
      <AuthProvider>
        <Router>
          <AppContent />
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
};

export default App;
