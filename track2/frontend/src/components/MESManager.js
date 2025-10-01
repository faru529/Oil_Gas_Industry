import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  TextField,
  Grid,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  AppBar,
  Toolbar,
  Alert
} from '@mui/material';
import axios from 'axios';

function MESManager({ user, onLogout }) {
  const [capacities, setCapacities] = useState([]);
  const [heartbeats, setHeartbeats] = useState([]);
  const [orders, setOrders] = useState([]);
  const [reports, setReports] = useState([]);
  const [editingCapacity, setEditingCapacity] = useState({});
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 5000); // Refresh every 5 seconds
    return () => clearInterval(interval);
  }, []);

  const fetchData = async () => {
    try {
      const [capsRes, heartbeatsRes, ordersRes, reportsRes] = await Promise.all([
        axios.get('/capacities'),
        axios.get('/heartbeats'),
        axios.get('/orders'),
        axios.get('/reports')
      ]);
      setCapacities(capsRes.data);
      setHeartbeats(heartbeatsRes.data);
      setOrders(ordersRes.data);
      setReports(reportsRes.data);
    } catch (err) {
      console.error('Error fetching data:', err);
    }
  };

  const handleUpdateCapacity = async (shopfloor) => {
    setError('');
    setSuccess('');

    const newCapacity = editingCapacity[shopfloor];
    if (!newCapacity || newCapacity < 0) {
      setError('Please enter a valid capacity');
      return;
    }

    try {
      await axios.post('/capacities', {
        shopfloor,
        capacity: parseInt(newCapacity)
      });
      setSuccess(`Capacity for ${shopfloor} updated successfully`);
      setEditingCapacity({ ...editingCapacity, [shopfloor]: '' });
      fetchData();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to update capacity');
    }
  };

  const getHeartbeatStatus = (shopfloor) => {
    const heartbeat = heartbeats.find(h => h.shopfloor === shopfloor);
    if (!heartbeat) return { status: 'offline', color: '#ef4444', time: 'Never' };

    const now = new Date();
    const lastBeat = new Date(heartbeat.timestamp);
    const diffSeconds = (now - lastBeat) / 1000;

    if (diffSeconds < 30) {
      return { status: 'online', color: '#10b981', time: lastBeat.toLocaleTimeString() };
    } else {
      return { status: 'offline', color: '#ef4444', time: lastBeat.toLocaleTimeString() };
    }
  };

  return (
    <Box sx={{ minHeight: '100vh', background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)' }}>
      {/* Header */}
      <AppBar position="static" sx={{ background: 'linear-gradient(90deg, #1e293b 0%, #334155 100%)' }}>
        <Toolbar>
          <Typography variant="h6" sx={{ flexGrow: 1, fontWeight: 700 }}>
            📊 MES Manager Dashboard
          </Typography>
          <Typography sx={{ mr: 2 }}>
            Welcome, <strong>{user.username}</strong> (MES Manager)
          </Typography>
          <Button
            variant="outlined"
            onClick={onLogout}
            sx={{
              borderColor: '#ef4444',
              color: '#ef4444',
              '&:hover': { borderColor: '#dc2626', backgroundColor: 'rgba(239, 68, 68, 0.1)' }
            }}
          >
            Logout
          </Button>
        </Toolbar>
      </AppBar>

      <Box sx={{ maxWidth: 1400, mx: 'auto', p: 3 }}>
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}

        <Grid container spacing={3}>
          {/* Shopfloor Capacities */}
          <Grid item xs={12} md={6}>
            <Card sx={{
              background: 'linear-gradient(135deg, #1e293b 0%, #334155 100%)',
              border: '1px solid #475569',
              boxShadow: '0 10px 30px rgba(0,0,0,0.4)'
            }}>
              <CardContent>
                <Typography variant="h5" sx={{ color: '#f1f5f9', fontWeight: 700, mb: 3 }}>
                  ⚙️ Shopfloor Capacities
                </Typography>
                {capacities.map((cap) => (
                  <Box key={cap.shopfloor} sx={{ mb: 3, p: 2, background: '#0f172a', borderRadius: 2 }}>
                    <Typography variant="h6" sx={{ color: '#3b82f6', mb: 1 }}>
                      {cap.shopfloor}
                    </Typography>
                    <Grid container spacing={2} alignItems="center">
                      <Grid item xs={4}>
                        <Typography sx={{ color: '#cbd5e1', fontSize: '0.9rem' }}>
                          Capacity: <strong>{cap.capacity}</strong>
                        </Typography>
                      </Grid>
                      <Grid item xs={4}>
                        <Typography sx={{ color: '#f59e0b', fontSize: '0.9rem' }}>
                          Load: <strong>{cap.currentLoad || 0}</strong>
                        </Typography>
                      </Grid>
                      <Grid item xs={4}>
                        <Typography sx={{ color: '#10b981', fontSize: '0.9rem' }}>
                          Free: <strong>{cap.capacity - (cap.currentLoad || 0)}</strong>
                        </Typography>
                      </Grid>
                      <Grid item xs={8}>
                        <TextField
                          size="small"
                          type="number"
                          placeholder="New capacity"
                          value={editingCapacity[cap.shopfloor] || ''}
                          onChange={(e) => setEditingCapacity({
                            ...editingCapacity,
                            [cap.shopfloor]: e.target.value
                          })}
                          sx={{
                            width: '100%',
                            '& .MuiOutlinedInput-root': {
                              color: '#f1f5f9',
                              '& fieldset': { borderColor: '#475569' },
                            },
                          }}
                        />
                      </Grid>
                      <Grid item xs={4}>
                        <Button
                          fullWidth
                          size="small"
                          variant="contained"
                          onClick={() => handleUpdateCapacity(cap.shopfloor)}
                          sx={{
                            background: '#3b82f6',
                            '&:hover': { background: '#2563eb' }
                          }}
                        >
                          Update
                        </Button>
                      </Grid>
                    </Grid>
                  </Box>
                ))}
              </CardContent>
            </Card>
          </Grid>

          {/* Heartbeats */}
          <Grid item xs={12} md={6}>
            <Card sx={{
              background: 'linear-gradient(135deg, #1e293b 0%, #334155 100%)',
              border: '1px solid #475569',
              boxShadow: '0 10px 30px rgba(0,0,0,0.4)'
            }}>
              <CardContent>
                <Typography variant="h5" sx={{ color: '#f1f5f9', fontWeight: 700, mb: 3 }}>
                  💓 Shopfloor Heartbeats
                </Typography>
                {['Shopfloor-1', 'Shopfloor-2', 'Shopfloor-3'].map((sf) => {
                  const status = getHeartbeatStatus(sf);
                  return (
                    <Box key={sf} sx={{ mb: 2, p: 2, background: '#0f172a', borderRadius: 2 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <Typography variant="h6" sx={{ color: '#cbd5e1' }}>
                          {sf}
                        </Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Box
                            sx={{
                              width: 12,
                              height: 12,
                              borderRadius: '50%',
                              backgroundColor: status.color,
                              animation: status.status === 'online' ? 'pulse 2s infinite' : 'none',
                              '@keyframes pulse': {
                                '0%, 100%': { opacity: 1 },
                                '50%': { opacity: 0.5 }
                              }
                            }}
                          />
                          <Chip
                            label={status.status.toUpperCase()}
                            size="small"
                            sx={{
                              backgroundColor: status.color,
                              color: '#fff',
                              fontWeight: 700
                            }}
                          />
                        </Box>
                      </Box>
                      <Typography sx={{ color: '#94a3b8', fontSize: '0.85rem', mt: 1 }}>
                        Last heartbeat: {status.time}
                      </Typography>
                    </Box>
                  );
                })}
              </CardContent>
            </Card>
          </Grid>

          {/* Orders */}
          <Grid item xs={12}>
            <Card sx={{
              background: 'linear-gradient(135deg, #1e293b 0%, #334155 100%)',
              border: '1px solid #475569',
              boxShadow: '0 10px 30px rgba(0,0,0,0.4)'
            }}>
              <CardContent>
                <Typography variant="h5" sx={{ color: '#f1f5f9', fontWeight: 700, mb: 3 }}>
                  📦 All Orders
                </Typography>
                <TableContainer component={Paper} sx={{ background: '#0f172a' }}>
                  <Table>
                    <TableHead>
                      <TableRow sx={{ background: '#1e293b' }}>
                        <TableCell sx={{ color: '#f1f5f9', fontWeight: 700 }}>Order ID</TableCell>
                        <TableCell sx={{ color: '#f1f5f9', fontWeight: 700 }}>Description</TableCell>
                        <TableCell sx={{ color: '#f1f5f9', fontWeight: 700 }}>Quantity</TableCell>
                        <TableCell sx={{ color: '#f1f5f9', fontWeight: 700 }}>Status</TableCell>
                        <TableCell sx={{ color: '#f1f5f9', fontWeight: 700 }}>Distribution</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {orders.map((order) => (
                        <TableRow key={order._id} sx={{ '&:hover': { background: '#1e293b' } }}>
                          <TableCell sx={{ color: '#cbd5e1' }}>{order.orderID}</TableCell>
                          <TableCell sx={{ color: '#cbd5e1' }}>{order.description}</TableCell>
                          <TableCell sx={{ color: '#cbd5e1' }}>{order.quantity}</TableCell>
                          <TableCell>
                            <Chip
                              label={order.status}
                              color={order.status === 'Completed' ? 'success' : 'warning'}
                              size="small"
                            />
                          </TableCell>
                          <TableCell sx={{ color: '#94a3b8', fontSize: '0.85rem' }}>
                            {order.distribution && Object.entries(order.distribution).map(([sf, qty]) => (
                              <div key={sf}>{sf}: {qty}</div>
                            ))}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </CardContent>
            </Card>
          </Grid>

          {/* Reports */}
          <Grid item xs={12}>
            <Card sx={{
              background: 'linear-gradient(135deg, #1e293b 0%, #334155 100%)',
              border: '1px solid #475569',
              boxShadow: '0 10px 30px rgba(0,0,0,0.4)'
            }}>
              <CardContent>
                <Typography variant="h5" sx={{ color: '#f1f5f9', fontWeight: 700, mb: 3 }}>
                  📄 Production Reports
                </Typography>
                <TableContainer component={Paper} sx={{ background: '#0f172a' }}>
                  <Table>
                    <TableHead>
                      <TableRow sx={{ background: '#1e293b' }}>
                        <TableCell sx={{ color: '#f1f5f9', fontWeight: 700 }}>Order ID</TableCell>
                        <TableCell sx={{ color: '#f1f5f9', fontWeight: 700 }}>Shopfloor</TableCell>
                        <TableCell sx={{ color: '#f1f5f9', fontWeight: 700 }}>Assigned</TableCell>
                        <TableCell sx={{ color: '#f1f5f9', fontWeight: 700 }}>Produced</TableCell>
                        <TableCell sx={{ color: '#f1f5f9', fontWeight: 700 }}>Defective</TableCell>
                        <TableCell sx={{ color: '#f1f5f9', fontWeight: 700 }}>Status</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {reports.map((report) => (
                        <TableRow key={report._id} sx={{ '&:hover': { background: '#1e293b' } }}>
                          <TableCell sx={{ color: '#cbd5e1' }}>{report.orderID}</TableCell>
                          <TableCell sx={{ color: '#cbd5e1' }}>{report.shopfloor}</TableCell>
                          <TableCell sx={{ color: '#cbd5e1' }}>{report.assigned}</TableCell>
                          <TableCell sx={{ color: '#3b82f6', fontWeight: 600 }}>{report.produced}</TableCell>
                          <TableCell sx={{ color: '#ef4444', fontWeight: 600 }}>{report.defective}</TableCell>
                          <TableCell>
                            <Chip
                              label={report.status}
                              color={report.status === 'Completed' ? 'success' : 'info'}
                              size="small"
                            />
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Box>
    </Box>
  );
}

export default MESManager;
