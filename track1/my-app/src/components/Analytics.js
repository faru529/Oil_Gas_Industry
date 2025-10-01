import React, { useEffect, useState } from 'react';
import { 
  Box, Typography, Card, CardContent, FormControl, InputLabel, 
  Select, MenuItem, Grid, CircularProgress 
} from '@mui/material';
import { useAuth } from './AuthContext';
import { twinNames } from './twinMeta';

const Analytics = () => {
  const { token } = useAuth();
  const [selectedTwin, setSelectedTwin] = useState('');
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(false);
  const [twins] = useState([
    'compressor1', 'drillrig1', 'pipeline1', 'refinery1', 
    'retail1', 'transformer1', 'turbine1', 'wellhead1'
  ]);

  const fieldUnits = {
    temperature: '°C',
    pressure: 'bar',
    flowRate: 'm³/h',
    torque: 'Nm',
    vibration: 'mm/s',
    energyConsumption: 'kWh',
    voltage: 'V',
    current: 'A',
    throughput: 'units',
    fuelInventory: 'liters',
    sales: 'units',
    status: '',
  };

  useEffect(() => {
    if (!token || !selectedTwin) return;
    
    const fetchAnalytics = () => {
      setLoading(true);
      fetch(`http://localhost:5000/api/analytics/${selectedTwin}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then(res => res.json())
        .then(data => {
          setAnalytics(data);
          setLoading(false);
        })
        .catch(err => {
          console.error('Failed to fetch analytics', err);
          setLoading(false);
        });
    };
    
    fetchAnalytics();
    // Poll every 10 seconds for real-time updates
    const interval = setInterval(fetchAnalytics, 10000);
    return () => clearInterval(interval);
  }, [token, selectedTwin]);

  return (
    <Box sx={{ 
      background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)', 
      minHeight: '100vh',
      pb: 4
    }}>
      {/* Header */}
      <Box sx={{
        background: 'linear-gradient(90deg, #1e293b 0%, #334155 100%)',
        py: 4,
        mb: 4,
        borderBottom: '2px solid #3b82f6',
        boxShadow: '0 4px 6px rgba(0,0,0,0.3)'
      }}>
        <Typography variant="h3" sx={{ 
          textAlign: 'center', 
          color: '#f1f5f9', 
          fontWeight: 700,
          mb: 1
        }}>
          📊 Analytics Dashboard
        </Typography>
        <Typography variant="subtitle1" sx={{ 
          textAlign: 'center', 
          color: '#cbd5e1'
        }}>
          View average performance metrics for each digital twin
        </Typography>
      </Box>

      <Box sx={{ maxWidth: 1200, mx: 'auto', px: 4 }}>
        {/* Twin Selector */}
        <Card sx={{
          background: 'linear-gradient(135deg, #1e293b 0%, #334155 100%)',
          border: '1px solid #475569',
          borderRadius: 2,
          p: 3,
          mb: 4,
          boxShadow: '0 4px 12px rgba(0,0,0,0.3)'
        }}>
          <FormControl fullWidth>
            <InputLabel 
              id="twin-select-label"
              sx={{ color: '#cbd5e1' }}
            >
              Select Digital Twin
            </InputLabel>
            <Select
              labelId="twin-select-label"
              value={selectedTwin}
              label="Select Digital Twin"
              onChange={(e) => setSelectedTwin(e.target.value)}
              sx={{
                color: '#f1f5f9',
                '& .MuiOutlinedInput-notchedOutline': {
                  borderColor: '#475569'
                },
                '&:hover .MuiOutlinedInput-notchedOutline': {
                  borderColor: '#3b82f6'
                },
                '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                  borderColor: '#3b82f6'
                },
                '& .MuiSvgIcon-root': {
                  color: '#cbd5e1'
                }
              }}
            >
              {twins.map(twin => (
                <MenuItem key={twin} value={twin}>
                  {twinNames[twin] || twin}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Card>

        {/* Loading State */}
        {loading && (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
            <CircularProgress sx={{ color: '#3b82f6' }} />
          </Box>
        )}

        {/* Analytics Display */}
        {!loading && analytics && (
          <Box>
            <Card sx={{
              background: 'linear-gradient(135deg, #1e293b 0%, #334155 100%)',
              border: '1px solid #475569',
              borderRadius: 3,
              boxShadow: '0 10px 30px rgba(0,0,0,0.4)',
              mb: 3
            }}>
              <CardContent>
                <Typography variant="h5" sx={{ color: '#f1f5f9', fontWeight: 600, mb: 2 }}>
                  📈 Average Metrics for {twinNames[selectedTwin] || selectedTwin}
                </Typography>
                <Typography variant="body2" sx={{ color: '#94a3b8', mb: 3 }}>
                  Based on {analytics.totalRecords} data points • Last updated: {new Date(analytics.lastUpdated).toLocaleString()}
                </Typography>
                
                <Grid container spacing={2}>
                  {Object.entries(analytics.averages).map(([field, value]) => (
                    <Grid item xs={12} sm={6} md={4} lg={3} key={field}>
                      <Card sx={{
                        background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
                        border: '1px solid #334155',
                        transition: 'all 0.3s ease',
                        '&:hover': {
                          transform: 'translateY(-4px)',
                          boxShadow: '0 8px 20px rgba(59, 130, 246, 0.3)',
                          borderColor: '#3b82f6'
                        }
                      }}>
                        <CardContent sx={{ textAlign: 'center', py: 3 }}>
                          <Typography variant="subtitle2" sx={{ color: '#cbd5e1', fontSize: '0.85rem', mb: 1 }}>
                            {field.charAt(0).toUpperCase() + field.slice(1)}
                            {fieldUnits[field] ? ` (${fieldUnits[field]})` : ''}
                          </Typography>
                          <Typography variant="h4" sx={{ fontWeight: 700, color: '#3b82f6' }}>
                            {typeof value === 'number' ? value.toFixed(2) : value}
                          </Typography>
                        </CardContent>
                      </Card>
                    </Grid>
                  ))}
                </Grid>
              </CardContent>
            </Card>
          </Box>
        )}

        {/* Empty State */}
        {!loading && !analytics && selectedTwin && (
          <Card sx={{ background: '#1e293b', border: '1px solid #475569', py: 6 }}>
            <Typography variant="h6" sx={{ color: '#cbd5e1', textAlign: 'center' }}>
              No analytics data available for this twin
            </Typography>
          </Card>
        )}

        {/* Initial State */}
        {!selectedTwin && (
          <Card sx={{ background: '#1e293b', border: '1px solid #475569', py: 8 }}>
            <Typography variant="h6" sx={{ color: '#cbd5e1', textAlign: 'center', mb: 1 }}>
              👆 Select a digital twin to view analytics
            </Typography>
            <Typography variant="body2" sx={{ color: '#94a3b8', textAlign: 'center' }}>
              Choose from the dropdown above to see average performance metrics
            </Typography>
          </Card>
        )}
      </Box>
    </Box>
  );
};

export default Analytics;
