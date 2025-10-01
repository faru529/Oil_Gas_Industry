import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  TextField,
  Button,
  Typography,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Tabs,
  Tab,
  Alert
} from '@mui/material';
import axios from 'axios';

function RoleLogin({ onLogin }) {
  const [tab, setTab] = useState(0); // 0 = Login, 1 = Register
  const [role, setRole] = useState('user');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [email, setEmail] = useState('');
  const [shopfloor, setShopfloor] = useState('Shopfloor-1');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const res = await axios.post('/login', { username, password });
      onLogin(res.data.user);
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed');
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!email.includes('@')) {
      setError('Please enter a valid email');
      return;
    }

    try {
      await axios.post('/register', {
        username,
        password,
        email,
        role,
        shopfloor: role === 'user' ? shopfloor : null
      });
      setSuccess('Registration successful! Please login.');
      setTab(0);
      setPassword('');
    } catch (err) {
      setError(err.response?.data?.error || 'Registration failed');
    }
  };

  const handleGoogleLogin = () => {
    window.location.href = 'http://localhost:4000/auth/google';
  };

  const roleDescriptions = {
    user: 'Shopfloor Worker - View your assigned shopfloor orders and status',
    mes_manager: 'MES Manager - Manage order distribution and shopfloor capacities',
    erp_owner: 'ERP Owner - Create orders, view reports and analytics'
  };

  return (
    <Box sx={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
      padding: 3
    }}>
      <Card sx={{
        maxWidth: 500,
        width: '100%',
        background: 'linear-gradient(135deg, #1e293b 0%, #334155 100%)',
        border: '1px solid #475569',
        boxShadow: '0 20px 60px rgba(0,0,0,0.5)'
      }}>
        <CardContent sx={{ p: 4 }}>
          <Typography variant="h4" sx={{
            color: '#f1f5f9',
            fontWeight: 700,
            textAlign: 'center',
            mb: 1
          }}>
            🏭 MES-ERP System
          </Typography>
          <Typography variant="body2" sx={{
            color: '#94a3b8',
            textAlign: 'center',
            mb: 3
          }}>
            Manufacturing Execution & Enterprise Resource Planning
          </Typography>

          <Tabs
            value={tab}
            onChange={(e, newValue) => {
              setTab(newValue);
              setError('');
              setSuccess('');
            }}
            sx={{
              mb: 3,
              '& .MuiTab-root': { color: '#94a3b8' },
              '& .Mui-selected': { color: '#3b82f6' },
              '& .MuiTabs-indicator': { backgroundColor: '#3b82f6' }
            }}
          >
            <Tab label="Login" />
            <Tab label="Register" />
          </Tabs>

          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
          {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}

          {tab === 0 ? (
            // LOGIN FORM
            <form onSubmit={handleLogin}>
              <TextField
                fullWidth
                label="Username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                sx={{
                  mb: 2,
                  '& .MuiOutlinedInput-root': {
                    color: '#f1f5f9',
                    '& fieldset': { borderColor: '#475569' },
                    '&:hover fieldset': { borderColor: '#3b82f6' },
                  },
                  '& .MuiInputLabel-root': { color: '#cbd5e1' }
                }}
              />

              <TextField
                fullWidth
                label="Password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                sx={{
                  mb: 3,
                  '& .MuiOutlinedInput-root': {
                    color: '#f1f5f9',
                    '& fieldset': { borderColor: '#475569' },
                    '&:hover fieldset': { borderColor: '#3b82f6' },
                  },
                  '& .MuiInputLabel-root': { color: '#cbd5e1' }
                }}
              />

              <Button
                fullWidth
                type="submit"
                variant="contained"
                sx={{
                  background: 'linear-gradient(90deg, #3b82f6 0%, #2563eb 100%)',
                  color: '#fff',
                  fontWeight: 700,
                  py: 1.5,
                  mb: 2,
                  '&:hover': {
                    background: 'linear-gradient(90deg, #2563eb 0%, #1d4ed8 100%)',
                  }
                }}
              >
                Login
              </Button>

              <Button
                fullWidth
                variant="outlined"
                onClick={handleGoogleLogin}
                sx={{
                  borderColor: '#ef4444',
                  color: '#ef4444',
                  fontWeight: 600,
                  py: 1.5,
                  '&:hover': {
                    borderColor: '#dc2626',
                    backgroundColor: 'rgba(239, 68, 68, 0.1)'
                  }
                }}
              >
                🔐 Login with Google
              </Button>
            </form>
          ) : (
            // REGISTER FORM
            <form onSubmit={handleRegister}>
              <FormControl fullWidth sx={{ mb: 2 }}>
                <InputLabel sx={{ color: '#cbd5e1' }}>Select Your Role</InputLabel>
                <Select
                  value={role}
                  label="Select Your Role"
                  onChange={(e) => setRole(e.target.value)}
                  sx={{
                    color: '#f1f5f9',
                    '& .MuiOutlinedInput-notchedOutline': { borderColor: '#475569' },
                    '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#3b82f6' },
                    '& .MuiSvgIcon-root': { color: '#cbd5e1' }
                  }}
                >
                  <MenuItem value="user">👷 Shopfloor Worker (User)</MenuItem>
                  <MenuItem value="mes_manager">📊 MES Manager</MenuItem>
                  <MenuItem value="erp_owner">🏢 ERP Owner</MenuItem>
                </Select>
              </FormControl>

              <Alert severity="info" sx={{ mb: 2, fontSize: '0.85rem' }}>
                {roleDescriptions[role]}
              </Alert>

              {role === 'user' && (
                <FormControl fullWidth sx={{ mb: 2 }}>
                  <InputLabel sx={{ color: '#cbd5e1' }}>Assigned Shopfloor</InputLabel>
                  <Select
                    value={shopfloor}
                    label="Assigned Shopfloor"
                    onChange={(e) => setShopfloor(e.target.value)}
                    sx={{
                      color: '#f1f5f9',
                      '& .MuiOutlinedInput-notchedOutline': { borderColor: '#475569' },
                      '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#3b82f6' },
                      '& .MuiSvgIcon-root': { color: '#cbd5e1' }
                    }}
                  >
                    <MenuItem value="Shopfloor-1">Shopfloor-1</MenuItem>
                    <MenuItem value="Shopfloor-2">Shopfloor-2</MenuItem>
                    <MenuItem value="Shopfloor-3">Shopfloor-3</MenuItem>
                  </Select>
                </FormControl>
              )}

              <TextField
                fullWidth
                label="Username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                sx={{
                  mb: 2,
                  '& .MuiOutlinedInput-root': {
                    color: '#f1f5f9',
                    '& fieldset': { borderColor: '#475569' },
                    '&:hover fieldset': { borderColor: '#3b82f6' },
                  },
                  '& .MuiInputLabel-root': { color: '#cbd5e1' }
                }}
              />

              <TextField
                fullWidth
                label="Email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                sx={{
                  mb: 2,
                  '& .MuiOutlinedInput-root': {
                    color: '#f1f5f9',
                    '& fieldset': { borderColor: '#475569' },
                    '&:hover fieldset': { borderColor: '#3b82f6' },
                  },
                  '& .MuiInputLabel-root': { color: '#cbd5e1' }
                }}
              />

              <TextField
                fullWidth
                label="Password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                sx={{
                  mb: 3,
                  '& .MuiOutlinedInput-root': {
                    color: '#f1f5f9',
                    '& fieldset': { borderColor: '#475569' },
                    '&:hover fieldset': { borderColor: '#3b82f6' },
                  },
                  '& .MuiInputLabel-root': { color: '#cbd5e1' }
                }}
              />

              <Button
                fullWidth
                type="submit"
                variant="contained"
                sx={{
                  background: 'linear-gradient(90deg, #10b981 0%, #059669 100%)',
                  color: '#fff',
                  fontWeight: 700,
                  py: 1.5,
                  '&:hover': {
                    background: 'linear-gradient(90deg, #059669 0%, #047857 100%)',
                  }
                }}
              >
                Register
              </Button>
            </form>
          )}
        </CardContent>
      </Card>
    </Box>
  );
}

export default RoleLogin;
