import React, { useEffect, useState } from 'react';
import { Box, Typography, Card, CardContent, Chip, Grid, Divider } from '@mui/material';
import { useAuth } from './AuthContext';
import { twinNames } from './twinMeta';

const Alerts = () => {
  const { token } = useAuth();
  const [alerts, setAlerts] = useState([]);
  const [persistentAlerts, setPersistentAlerts] = useState([]);

  useEffect(() => {
    if (!token) return;
    
    const fetchAlerts = () => {
      fetch('http://localhost:5000/api/alerts', {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then(res => res.json())
        .then(data => {
          setAlerts(data.slice(0, 18)); // Show latest 18 alerts
          setPersistentAlerts(data.filter(a => a.isPersistent));
        })
        .catch(err => console.error('Failed to fetch alerts', err));
    };
    
    fetchAlerts();
    // Poll every 10 seconds for real-time updates
    const interval = setInterval(fetchAlerts, 10000);
    return () => clearInterval(interval);
  }, [token]);

  return (
    <Box sx={{ maxWidth: 1400, mx: 'auto', mt: 4, px: 2 }}>
      <Typography variant="h4" gutterBottom sx={{ color: '#f1f5f9', fontWeight: 700 }}>
        ⚠️ Alert Management Center
      </Typography>
      
      {/* Persistent Alerts Section */}
      {persistentAlerts.length > 0 && (
        <Box sx={{ mb: 4 }}>
          <Card sx={{
            background: 'linear-gradient(135deg, #7f1d1d 0%, #991b1b 100%)',
            border: '2px solid #ef4444',
            boxShadow: '0 8px 25px rgba(239, 68, 68, 0.3)',
            mb: 3
          }}>
            <CardContent>
              <Typography variant="h5" sx={{ color: '#fca5a5', fontWeight: 700, mb: 2 }}>
                🔥 Persistent Alerts ({persistentAlerts.length})
              </Typography>
              <Typography variant="body2" sx={{ color: '#fecaca', mb: 2 }}>
                These parameters have triggered multiple alerts within 5 minutes
              </Typography>
              <Grid container spacing={2}>
                {persistentAlerts.map((alert, index) => (
                  <Grid item xs={12} sm={6} md={4} key={index}>
                    <Card sx={{ background: '#450a0a', border: '1px solid #7f1d1d' }}>
                      <CardContent sx={{ py: 2 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                          <Typography variant="subtitle1" sx={{ color: '#fca5a5', fontWeight: 600 }}>
                            {twinNames[alert.twinId] || alert.twinId}
                          </Typography>
                          <Chip 
                            label="PERSISTENT" 
                            size="small"
                            sx={{ 
                              background: '#ef4444',
                              color: '#fff',
                              fontWeight: 700,
                              fontSize: '0.7rem'
                            }}
                          />
                        </Box>
                        <Typography variant="body2" sx={{ color: '#fecaca', mb: 0.5 }}>
                          <strong>{alert.field}:</strong> {alert.value}
                        </Typography>
                        <Typography variant="caption" sx={{ color: '#cbd5e1' }}>
                          {alert.alertCount} alerts in 5 min
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
      
      <Typography variant="h5" sx={{ color: '#f1f5f9', fontWeight: 700, mb: 3 }}>
        🚨 Recent Alerts (Latest 18)
      </Typography>
      <Grid container spacing={2}>
        {alerts.map((alert, index) => (
          <Grid item xs={12} md={6} key={index}>
            <Card sx={{ backgroundColor: '#1e293b', color: '#fff' }}>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                  <Typography variant="h6">{twinNames[alert.twinId] || alert.twinId}</Typography>
                  <Chip 
                    label={alert.severity.toUpperCase()} 
                    color={alert.severity === 'high' ? 'error' : 'warning'}
                    size="small"
                  />
                </Box>
                <Typography variant="body2" sx={{ mb: 1 }}>
                  <strong>{alert.field}:</strong> {alert.value}
                </Typography>
                <Typography variant="body2" sx={{ color: '#94a3b8' }}>
                  {alert.description}
                </Typography>
                <Typography variant="caption" sx={{ color: '#64748b', mt: 1, display: 'block' }}>
                  {new Date(alert.timestamp).toLocaleString()}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
        {alerts.length === 0 && (
          <Grid item xs={12}>
            <Typography variant="body1" color="text.secondary" sx={{ textAlign: 'center', py: 4 }}>
              No high-risk alerts at this time.
            </Typography>
          </Grid>
        )}
      </Grid>
    </Box>
  );
};

export default Alerts;


