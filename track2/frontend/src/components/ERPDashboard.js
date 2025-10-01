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
import { Bar, Pie } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
} from 'chart.js';
import axios from 'axios';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

function ERPDashboard({ user, onLogout }) {
  const [description, setDescription] = useState('');
  const [quantity, setQuantity] = useState('');
  const [material, setMaterial] = useState('');
  const [orders, setOrders] = useState([]);
  const [reports, setReports] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchOrders();
    fetchReports();
    fetchAnalytics();
    const interval = setInterval(() => {
      fetchOrders();
      fetchReports();
      fetchAnalytics();
    }, 10000); // Refresh every 10 seconds
    return () => clearInterval(interval);
  }, []);

  const fetchOrders = async () => {
    try {
      const res = await axios.get('/orders');
      setOrders(res.data);
    } catch (err) {
      console.error('Error fetching orders:', err);
    }
  };

  const fetchReports = async () => {
    try {
      const res = await axios.get('/reports');
      setReports(res.data);
    } catch (err) {
      console.error('Error fetching reports:', err);
    }
  };

  const fetchAnalytics = async () => {
    try {
      const res = await axios.get('/analytics');
      setAnalytics(res.data);
    } catch (err) {
      console.error('Error fetching analytics:', err);
    }
  };

  const handleCreateOrder = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!description || !quantity || !material) {
      setError('All fields are required');
      return;
    }

    if (quantity <= 0) {
      setError('Quantity must be greater than 0');
      return;
    }

    try {
      const res = await axios.post('/orders', {
        description,
        quantity: parseInt(quantity),
        material
      });

      setSuccess(`Order ${res.data.orderID} created successfully!`);
      setDescription('');
      setQuantity('');
      setMaterial('');
      fetchOrders();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to create order');
    }
  };

  const productionChartData = analytics ? {
    labels: analytics.productionByShopfloor.map(p => p._id),
    datasets: [
      {
        label: 'Produced',
        data: analytics.productionByShopfloor.map(p => p.produced),
        backgroundColor: '#3b82f6',
      },
      {
        label: 'Defective',
        data: analytics.productionByShopfloor.map(p => p.defective),
        backgroundColor: '#ef4444',
      }
    ]
  } : null;

  const orderStatusData = analytics ? {
    labels: ['Completed', 'In Progress'],
    datasets: [{
      data: [analytics.completedOrders, analytics.inProgressOrders],
      backgroundColor: ['#10b981', '#f59e0b'],
    }]
  } : null;

  return (
    <Box sx={{ minHeight: '100vh', background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)' }}>
      {/* Header */}
      <AppBar position="static" sx={{ background: 'linear-gradient(90deg, #1e293b 0%, #334155 100%)' }}>
        <Toolbar>
          <Typography variant="h6" sx={{ flexGrow: 1, fontWeight: 700 }}>
            🏢 ERP Dashboard
          </Typography>
          <Typography sx={{ mr: 2 }}>
            Welcome, <strong>{user.username}</strong> (ERP Owner)
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
          {/* Create Order Form */}
          <Grid item xs={12} md={6}>
            <Card sx={{
              background: 'linear-gradient(135deg, #1e293b 0%, #334155 100%)',
              border: '1px solid #475569',
              boxShadow: '0 10px 30px rgba(0,0,0,0.4)'
            }}>
              <CardContent>
                <Typography variant="h5" sx={{ color: '#f1f5f9', fontWeight: 700, mb: 3 }}>
                  📝 Create New Production Order
                </Typography>
                <form onSubmit={handleCreateOrder}>
                  <TextField
                    fullWidth
                    label="Order Description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
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
                    label="Quantity"
                    type="number"
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value)}
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
                    label="Material"
                    value={material}
                    onChange={(e) => setMaterial(e.target.value)}
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
                      '&:hover': {
                        background: 'linear-gradient(90deg, #2563eb 0%, #1d4ed8 100%)',
                      }
                    }}
                  >
                    Create Order
                  </Button>
                </form>
              </CardContent>
            </Card>
          </Grid>

          {/* Analytics Summary */}
          {analytics && (
            <Grid item xs={12} md={6}>
              <Card sx={{
                background: 'linear-gradient(135deg, #1e293b 0%, #334155 100%)',
                border: '1px solid #475569',
                boxShadow: '0 10px 30px rgba(0,0,0,0.4)'
              }}>
                <CardContent>
                  <Typography variant="h5" sx={{ color: '#f1f5f9', fontWeight: 700, mb: 3 }}>
                    📊 Production Analytics
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={6}>
                      <Box sx={{ textAlign: 'center', p: 2, background: '#0f172a', borderRadius: 2 }}>
                        <Typography variant="h3" sx={{ color: '#3b82f6', fontWeight: 700 }}>
                          {analytics.totalOrders}
                        </Typography>
                        <Typography sx={{ color: '#cbd5e1' }}>Total Orders</Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={6}>
                      <Box sx={{ textAlign: 'center', p: 2, background: '#0f172a', borderRadius: 2 }}>
                        <Typography variant="h3" sx={{ color: '#10b981', fontWeight: 700 }}>
                          {analytics.completedOrders}
                        </Typography>
                        <Typography sx={{ color: '#cbd5e1' }}>Completed</Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={6}>
                      <Box sx={{ textAlign: 'center', p: 2, background: '#0f172a', borderRadius: 2 }}>
                        <Typography variant="h3" sx={{ color: '#3b82f6', fontWeight: 700 }}>
                          {analytics.totalProduced}
                        </Typography>
                        <Typography sx={{ color: '#cbd5e1' }}>Total Produced</Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={6}>
                      <Box sx={{ textAlign: 'center', p: 2, background: '#0f172a', borderRadius: 2 }}>
                        <Typography variant="h3" sx={{ color: '#ef4444', fontWeight: 700 }}>
                          {analytics.totalDefective}
                        </Typography>
                        <Typography sx={{ color: '#cbd5e1' }}>Defective</Typography>
                      </Box>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            </Grid>
          )}

          {/* Orders List */}
          <Grid item xs={12}>
            <Card sx={{
              background: 'linear-gradient(135deg, #1e293b 0%, #334155 100%)',
              border: '1px solid #475569',
              boxShadow: '0 10px 30px rgba(0,0,0,0.4)'
            }}>
              <CardContent>
                <Typography variant="h5" sx={{ color: '#f1f5f9', fontWeight: 700, mb: 3 }}>
                  📋 All Orders
                </Typography>
                <TableContainer component={Paper} sx={{ background: '#0f172a' }}>
                  <Table>
                    <TableHead>
                      <TableRow sx={{ background: '#1e293b' }}>
                        <TableCell sx={{ color: '#f1f5f9', fontWeight: 700 }}>Order ID</TableCell>
                        <TableCell sx={{ color: '#f1f5f9', fontWeight: 700 }}>Description</TableCell>
                        <TableCell sx={{ color: '#f1f5f9', fontWeight: 700 }}>Material</TableCell>
                        <TableCell sx={{ color: '#f1f5f9', fontWeight: 700 }}>Quantity</TableCell>
                        <TableCell sx={{ color: '#f1f5f9', fontWeight: 700 }}>Status</TableCell>
                        <TableCell sx={{ color: '#f1f5f9', fontWeight: 700 }}>Created</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {orders.map((order) => (
                        <TableRow key={order._id} sx={{ '&:hover': { background: '#1e293b' } }}>
                          <TableCell sx={{ color: '#cbd5e1' }}>{order.orderID}</TableCell>
                          <TableCell sx={{ color: '#cbd5e1' }}>{order.description}</TableCell>
                          <TableCell sx={{ color: '#cbd5e1' }}>{order.material}</TableCell>
                          <TableCell sx={{ color: '#cbd5e1' }}>{order.quantity}</TableCell>
                          <TableCell>
                            <Chip
                              label={order.status}
                              color={order.status === 'Completed' ? 'success' : 'warning'}
                              size="small"
                            />
                          </TableCell>
                          <TableCell sx={{ color: '#cbd5e1' }}>
                            {new Date(order.createdAt).toLocaleString()}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </CardContent>
            </Card>
          </Grid>

          {/* Charts */}
          {analytics && productionChartData && orderStatusData && (
            <>
              <Grid item xs={12} md={8}>
                <Card sx={{
                  background: 'linear-gradient(135deg, #1e293b 0%, #334155 100%)',
                  border: '1px solid #475569',
                  boxShadow: '0 10px 30px rgba(0,0,0,0.4)'
                }}>
                  <CardContent>
                    <Typography variant="h6" sx={{ color: '#f1f5f9', fontWeight: 700, mb: 2 }}>
                      Production by Shopfloor
                    </Typography>
                    <Bar data={productionChartData} options={{ responsive: true }} />
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} md={4}>
                <Card sx={{
                  background: 'linear-gradient(135deg, #1e293b 0%, #334155 100%)',
                  border: '1px solid #475569',
                  boxShadow: '0 10px 30px rgba(0,0,0,0.4)'
                }}>
                  <CardContent>
                    <Typography variant="h6" sx={{ color: '#f1f5f9', fontWeight: 700, mb: 2 }}>
                      Order Status
                    </Typography>
                    <Pie data={orderStatusData} options={{ responsive: true }} />
                  </CardContent>
                </Card>
              </Grid>
            </>
          )}

          {/* Reports */}
          <Grid item xs={12}>
            <Card sx={{
              background: 'linear-gradient(135deg, #1e293b 0%, #334155 100%)',
              border: '1px solid #475569',
              boxShadow: '0 10px 30px rgba(0,0,0,0.4)'
            }}>
              <CardContent>
                <Typography variant="h5" sx={{ color: '#f1f5f9', fontWeight: 700, mb: 3 }}>
                  📄 Production Reports from MES
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
                        <TableCell sx={{ color: '#f1f5f9', fontWeight: 700 }}>Completed</TableCell>
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
                          <TableCell sx={{ color: '#cbd5e1' }}>
                            {report.completedAt ? new Date(report.completedAt).toLocaleString() : '-'}
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

export default ERPDashboard;
