import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardActionArea, Typography, Collapse, Box, Button, Grid } from '@mui/material';
import { streamMap, streamTitles, streamDescriptions, twinNames } from './twinMeta';

const Dashboard = () => {
  const navigate = useNavigate();
  const [open, setOpen] = useState({});

  const toggle = (key) => setOpen(prev => ({ ...prev, [key]: !prev[key] }));

  return (
    <Box sx={{ 
      background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)', 
      minHeight: '100vh',
      pb: 4
    }}>
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
          🏭 Digital Twin Control Center
        </Typography>
        <Typography variant="subtitle1" sx={{ 
          textAlign: 'center', 
          color: '#cbd5e1'
        }}>
          Monitor and manage your industrial assets in real-time
        </Typography>
      </Box>
      <Box sx={{ maxWidth: 1100, mx: 'auto', px: 4 }}>
        <Grid container spacing={3} sx={{ justifyContent: 'center' }}>
          {Object.keys(streamMap).map((key) => (
            <Grid item xs={12} sm={6} md={6} key={key} sx={{ display: 'flex' }}>
              <Card sx={{ 
                minHeight: 200, 
                width: '100%',
                background: 'linear-gradient(135deg, #1e293b 0%, #334155 100%)', 
                border: '1px solid #475569', 
                borderRadius: 3, 
                boxShadow: '0 10px 30px rgba(0,0,0,.4)',
                transition: 'all 0.3s ease',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: '0 15px 40px rgba(59, 130, 246, 0.3)',
                  borderColor: '#3b82f6'
                }
              }}>
                <CardActionArea onClick={() => toggle(key)}>
                  <CardContent sx={{ p: 3 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                      <Box sx={{
                        width: 48,
                        height: 48,
                        borderRadius: 2,
                        background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '1.5rem'
                      }}>
                        {key === 'upstream' ? '⛽' : key === 'midstream' ? '🔧' : key === 'downstream' ? '🏪' : '⚡'}
                      </Box>
                      <Typography variant="h5" sx={{ fontWeight: 700, color: '#f1f5f9', flex: 1 }}>
                        {streamTitles[key]}
                      </Typography>
                      <Typography variant="caption" sx={{ 
                        color: '#94a3b8',
                        background: '#0f172a',
                        px: 1.5,
                        py: 0.5,
                        borderRadius: 1,
                        fontWeight: 600
                      }}>
                        {streamMap[key].length} assets
                      </Typography>
                    </Box>
                    <Typography variant="body2" sx={{ color: '#cbd5e1', lineHeight: 1.6, fontSize: '0.9rem' }}>
                      {streamDescriptions[key]}
                    </Typography>
                  </CardContent>
                </CardActionArea>
                <Collapse in={!!open[key]}>
                  <Box sx={{ px: 3, pb: 3, pt: 1, borderTop: '1px solid #475569' }}>
                    <Typography variant="subtitle2" sx={{ color: '#94a3b8', mb: 1.5, fontWeight: 600 }}>
                      Select an asset:
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap' }}>
                      {streamMap[key].map(twin => (
                        <Button 
                          key={twin} 
                          variant="contained"
                          onClick={() => navigate(`/twin/${twin}`)}
                          sx={{ 
                            background: 'linear-gradient(90deg, #3b82f6 0%, #2563eb 100%)',
                            color: '#fff',
                            fontWeight: 600,
                            px: 2.5,
                            py: 1,
                            textTransform: 'none',
                            '&:hover': {
                              background: 'linear-gradient(90deg, #2563eb 0%, #1d4ed8 100%)',
                              transform: 'scale(1.05)'
                            }
                          }}
                        >
                          {twinNames[twin] || twin}
                        </Button>
                      ))}
                    </Box>
                  </Box>
                </Collapse>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Box>
    </Box>
  );
};

export default Dashboard;


