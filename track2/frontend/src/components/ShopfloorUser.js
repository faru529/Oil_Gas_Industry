import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
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
  Toolbar
} from '@mui/material';
import axios from 'axios';

function ShopfloorUser({ user, onLogout }) {
  const [orders, setOrders] = useState([]);
  const [heartbeat, setHeartbeat] = useState(null);
  const [stats, setStats] = useState({ totalProduced: 0, totalDefective: 0, successRate: 0 });

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 5000); // Refresh every 5 seconds
    return () => clearInterval(interval);
  }, []);

  const fetchData = async () => {
    try {
      const [ordersRes, heartbeatsRes] = await Promise.all([
        axios.get(`/shopfloor/${user.shopfloor}/orders`),
        axios.get('/heartbeats')
      ]);

      setOrders(ordersRes.data);
      
      const myHeartbeat = heartbeatsRes.data.find(h => h.shopfloor === user.shopfloor);
      setHeartbeat(myHeartbeat);

      // Calculate stats
      const totalProduced = ordersRes.data.reduce((sum, o) => sum + (o.produced || 0), 0);
      const totalDefective = ordersRes.data.reduce((sum, o) => sum + (o.defective || 0), 0);
      const successRate = totalProduced > 0 
        ? (((totalProduced - totalDefective) / totalProduced) * 100).toFixed(1)
        : 0;
      
      setStats({ totalProduced, totalDefective, successRate });
    } catch (err) {
      console.error('Error fetching data:', err);
    }
  };

  const getHeartbeatStatus = () => {
    if (!heartbeat) return { status: 'offline', color: '#ef4444', text: 'Offline' };

    const now = new Date();
    const lastBeat = new Date(heartbeat.timestamp);
    const diffSeconds = (now - lastBeat) / 1000;

    if (diffSeconds < 30) {
      return { status: 'online', color: '#10b981', text: 'Online' };
    } else {
      return { status: 'offline', color: '#ef4444', text: 'Offline' };
    }
  };

  const status = getHeartbeatStatus();

  return (
    <Box sx={{ minHeight: '100vh', background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)' }}>
      {/* Header */}
      <AppBar position="static" sx={{ background: 'linear-gradient(90deg, #1e293b 0%, #334155 100%)' }}>
        <Toolbar>
          <Typography variant="h6" sx={{ flexGrow: 1, fontWeight: 700 }}>
            👷 {user.shopfloor} Dashboard
          </Typography>
          <Typography sx={{ mr: 2 }}>
            Welcome, <strong>{user.username}</strong> (Worker)
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

      <Box sx={{ maxWidth: 1200, mx: 'auto', p: 3 }}>
        <Grid container spacing={3}>
          {/* Heartbeat Status */}
          <Grid item xs={12} md={4}>
            <Card sx={{
              background: 'linear-gradient(135deg, #1e293b 0%, #334155 100%)',
              border: `2px solid ${status.color}`,
              boxShadow: `0 10px 30px ${status.color}40`
            }}>
              <CardContent sx={{ textAlign: 'center', py: 4 }}>
                <Box
                  sx={{
                    width: 100,
                    height: 100,
                    borderRadius: '50%',
                    backgroundColor: status.color,
                    margin: '0 auto 20px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    animation: status.status === 'online' ? 'pulse 2s infinite' : 'none',
                    '@keyframes pulse': {
                      '0%, 100%': { transform: 'scale(1)', opacity: 1 },
                      '50%': { transform: 'scale(1.05)', opacity: 0.8 }
                    }
                  }}
                >
                  <Typography variant="h3" sx={{ color: '#fff' }}>
                    💓
                  </Typography>
                </Box>
                <Typography variant="h4" sx={{ color: status.color, fontWeight: 700, mb: 1 }}>
                  {status.text}
                </Typography>
                <Typography sx={{ color: '#cbd5e1' }}>
                  {user.shopfloor} Status
                </Typography>
                {heartbeat && (
                  <Typography sx={{ color: '#94a3b8', fontSize: '0.85rem', mt: 2 }}>
                    Last heartbeat: {new Date(heartbeat.timestamp).toLocaleTimeString()}
                  </Typography>
                )}
              </CardContent>
            </Card>
          </Grid>

          {/* Production Stats */}
          <Grid item xs={12} md={8}>
            <Card sx={{
              background: 'linear-gradient(135deg, #1e293b 0%, #334155 100%)',
              border: '1px solid #475569',
              boxShadow: '0 10px 30px rgba(0,0,0,0.4)'
            }}>
              <CardContent>
                <Typography variant="h5" sx={{ color: '#f1f5f9', fontWeight: 700, mb: 3 }}>
                  📊 Production Statistics
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={4}>
                    <Box sx={{ textAlign: 'center', p: 2, background: '#0f172a', borderRadius: 2 }}>
                      <Typography variant="h3" sx={{ color: '#3b82f6', fontWeight: 700 }}>
                        {stats.totalProduced}
                      </Typography>
                      <Typography sx={{ color: '#cbd5e1', mt: 1 }}>Total Produced</Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={4}>
                    <Box sx={{ textAlign: 'center', p: 2, background: '#0f172a', borderRadius: 2 }}>
                      <Typography variant="h3" sx={{ color: '#ef4444', fontWeight: 700 }}>
                        {stats.totalDefective}
                      </Typography>
                      <Typography sx={{ color: '#cbd5e1', mt: 1 }}>Defective</Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={4}>
                    <Box sx={{ textAlign: 'center', p: 2, background: '#0f172a', borderRadius: 2 }}>
                      <Typography variant="h3" sx={{ color: '#10b981', fontWeight: 700 }}>
                        {stats.successRate}%
                      </Typography>
                      <Typography sx={{ color: '#cbd5e1', mt: 1 }}>Success Rate</Typography>
                    </Box>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>

          {/* My Orders */}
          <Grid item xs={12}>
            <Card sx={{
              background: 'linear-gradient(135deg, #1e293b 0%, #334155 100%)',
              border: '1px solid #475569',
              boxShadow: '0 10px 30px rgba(0,0,0,0.4)'
            }}>
              <CardContent>
                <Typography variant="h5" sx={{ color: '#f1f5f9', fontWeight: 700, mb: 3 }}>
                  📦 My Orders ({user.shopfloor})
                </Typography>
                {orders.length === 0 ? (
                  <Box sx={{ textAlign: 'center', py: 6 }}>
                    <Typography variant="h6" sx={{ color: '#94a3b8' }}>
                      No orders assigned yet
                    </Typography>
                    <Typography sx={{ color: '#64748b', mt: 1 }}>
                      Orders will appear here when assigned by MES
                    </Typography>
                  </Box>
                ) : (
                  <TableContainer component={Paper} sx={{ background: '#0f172a' }}>
                    <Table>
                      <TableHead>
                        <TableRow sx={{ background: '#1e293b' }}>
                          <TableCell sx={{ color: '#f1f5f9', fontWeight: 700 }}>Order ID</TableCell>
                          <TableCell sx={{ color: '#f1f5f9', fontWeight: 700 }}>Assigned</TableCell>
                          <TableCell sx={{ color: '#f1f5f9', fontWeight: 700 }}>Produced</TableCell>
                          <TableCell sx={{ color: '#f1f5f9', fontWeight: 700 }}>Defective</TableCell>
                          <TableCell sx={{ color: '#f1f5f9', fontWeight: 700 }}>Status</TableCell>
                          <TableCell sx={{ color: '#f1f5f9', fontWeight: 700 }}>Completed</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {orders.map((order) => (
                          <TableRow key={order._id} sx={{ '&:hover': { background: '#1e293b' } }}>
                            <TableCell sx={{ color: '#cbd5e1', fontWeight: 600 }}>
                              {order.orderID}
                            </TableCell>
                            <TableCell sx={{ color: '#cbd5e1' }}>{order.assigned}</TableCell>
                            <TableCell sx={{ color: '#3b82f6', fontWeight: 600 }}>
                              {order.produced}
                            </TableCell>
                            <TableCell sx={{ color: '#ef4444', fontWeight: 600 }}>
                              {order.defective}
                            </TableCell>
                            <TableCell>
                              <Chip
                                label={order.status}
                                color={order.status === 'Completed' ? 'success' : 'info'}
                                size="small"
                              />
                            </TableCell>
                            <TableCell sx={{ color: '#cbd5e1', fontSize: '0.85rem' }}>
                              {order.completedAt 
                                ? new Date(order.completedAt).toLocaleString()
                                : 'In Progress'}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                )}
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Box>
    </Box>
  );
}

export default ShopfloorUser;
