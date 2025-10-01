import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Card, CardContent, Typography, Button, Grid, Container } from '@mui/material';
import './LandingPage.css';

function LandingPage() {
  const navigate = useNavigate();

  return (
    <div className="landing-container">
      <div className="hero">
        <div className="hero-content">
          <Box sx={{ mb: 2, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 2 }}>
            <Box sx={{ fontSize: '3rem' }}>🏭</Box>
            <Typography variant="h6" sx={{ color: '#3b82f6', fontWeight: 600, letterSpacing: 1 }}>
              INDUSTRY 4.0 SOLUTIONS
            </Typography>
          </Box>
          <h1 className="hero-title">Welcome to the Future of Manufacturing</h1>
          <p className="hero-subtitle">Integrated Digital Twin & MES-ERP Platform</p>
          <p className="hero-description">
            Empowering industries with real-time monitoring, predictive analytics, and intelligent automation. 
            Choose your application to unlock the full potential of your operations.
          </p>
          <Box sx={{ mt: 4, display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Box sx={{ textAlign: 'center', px: 3 }}>
              <Typography variant="h3" sx={{ color: '#3b82f6', fontWeight: 700 }}>8+</Typography>
              <Typography variant="body2" sx={{ color: '#94a3b8' }}>Digital Twins</Typography>
            </Box>
            <Box sx={{ textAlign: 'center', px: 3 }}>
              <Typography variant="h3" sx={{ color: '#10b981', fontWeight: 700 }}>24/7</Typography>
              <Typography variant="body2" sx={{ color: '#94a3b8' }}>Monitoring</Typography>
            </Box>
            <Box sx={{ textAlign: 'center', px: 3 }}>
              <Typography variant="h3" sx={{ color: '#8b5cf6', fontWeight: 700 }}>AI</Typography>
              <Typography variant="body2" sx={{ color: '#94a3b8' }}>Powered</Typography>
            </Box>
          </Box>
        </div>
        <div className="hero-art" aria-hidden="true">
          <div className="glow glow-1"></div>
          <div className="glow glow-2"></div>
          <div className="grid"></div>
        </div>
      </div>

      <Container maxWidth="lg" sx={{ py: 6 }}>
        <Grid container spacing={4} sx={{ justifyContent: 'center' }}>
          {/* Oil-Gas Factory Card */}
          <Grid item xs={12} md={4}>
            <Card sx={{
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              background: 'linear-gradient(135deg, #1e293b 0%, #334155 100%)',
              border: '2px solid #3b82f6',
              borderRadius: 3,
              boxShadow: '0 10px 40px rgba(59, 130, 246, 0.3)',
              transition: 'all 0.3s ease',
              '&:hover': {
                transform: 'translateY(-8px)',
                boxShadow: '0 15px 50px rgba(59, 130, 246, 0.5)',
              }
            }}>
              <CardContent sx={{ flexGrow: 1, p: 4, textAlign: 'center' }}>
                <Box sx={{ fontSize: '4rem', mb: 2 }}>⛽</Box>
                <Typography variant="h4" sx={{ color: '#f1f5f9', fontWeight: 700, mb: 2 }}>
                  Oil-Gas Factory
                </Typography>
                <Typography variant="body1" sx={{ color: '#cbd5e1', mb: 3, lineHeight: 1.7 }}>
                  Comprehensive digital twin monitoring for oil and gas operations. Track upstream, midstream, and downstream assets in real-time with advanced analytics and predictive alerts.
                </Typography>
                <Typography variant="body2" sx={{ color: '#94a3b8', mb: 3 }}>
                  • Real-time asset monitoring<br/>
                  • Predictive maintenance alerts<br/>
                  • Performance analytics<br/>
                  • Historical trend analysis
                </Typography>
              </CardContent>
              <Box sx={{ p: 3, pt: 0 }}>
                <Button
                  fullWidth
                  variant="contained"
                  onClick={() => navigate('/login')}
                  sx={{
                    background: 'linear-gradient(90deg, #3b82f6 0%, #2563eb 100%)',
                    color: '#fff',
                    fontWeight: 700,
                    py: 1.5,
                    fontSize: '1rem',
                    '&:hover': {
                      background: 'linear-gradient(90deg, #2563eb 0%, #1d4ed8 100%)',
                      transform: 'scale(1.02)'
                    }
                  }}
                >
                  Access Dashboard
                </Button>
              </Box>
            </Card>
          </Grid>

          {/* MES-ERP Card */}
          <Grid item xs={12} md={4}>
            <Card sx={{
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              background: 'linear-gradient(135deg, #1e293b 0%, #334155 100%)',
              border: '2px solid #10b981',
              borderRadius: 3,
              boxShadow: '0 10px 40px rgba(16, 185, 129, 0.3)',
              transition: 'all 0.3s ease',
              '&:hover': {
                transform: 'translateY(-8px)',
                boxShadow: '0 15px 50px rgba(16, 185, 129, 0.5)',
              }
            }}>
              <CardContent sx={{ flexGrow: 1, p: 4, textAlign: 'center' }}>
                <Box sx={{ fontSize: '4rem', mb: 2 }}>🏭</Box>
                <Typography variant="h4" sx={{ color: '#f1f5f9', fontWeight: 700, mb: 2 }}>
                  MES-ERP
                </Typography>
                <Typography variant="body1" sx={{ color: '#cbd5e1', mb: 3, lineHeight: 1.7 }}>
                  Manufacturing Execution System integrated with Enterprise Resource Planning. Streamline production workflows, inventory management, and business operations.
                </Typography>
                <Typography variant="body2" sx={{ color: '#94a3b8', mb: 3 }}>
                  • Production planning & scheduling<br/>
                  • Inventory & supply chain management<br/>
                  • Quality control & compliance<br/>
                  • Resource optimization
                </Typography>
              </CardContent>
              <Box sx={{ p: 3, pt: 0 }}>
                <Button
                  fullWidth
                  variant="contained"
                  onClick={() => window.location.href = 'http://localhost:3001'}
                  sx={{
                    background: 'linear-gradient(90deg, #10b981 0%, #059669 100%)',
                    color: '#fff',
                    fontWeight: 700,
                    py: 1.5,
                    fontSize: '1rem',
                    '&:hover': {
                      background: 'linear-gradient(90deg, #059669 0%, #047857 100%)',
                      transform: 'scale(1.02)'
                    }
                  }}
                >
                  Access MES-ERP
                </Button>
              </Box>
            </Card>
          </Grid>

          {/* Predictive Analysis Card */}
          <Grid item xs={12} md={4}>
            <Card sx={{
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              background: 'linear-gradient(135deg, #1e293b 0%, #334155 100%)',
              border: '2px solid #8b5cf6',
              borderRadius: 3,
              boxShadow: '0 10px 40px rgba(139, 92, 246, 0.3)',
              transition: 'all 0.3s ease',
              '&:hover': {
                transform: 'translateY(-8px)',
                boxShadow: '0 15px 50px rgba(139, 92, 246, 0.5)',
              }
            }}>
              <CardContent sx={{ flexGrow: 1, p: 4, textAlign: 'center' }}>
                <Box sx={{ fontSize: '4rem', mb: 2 }}>🔮</Box>
                <Typography variant="h4" sx={{ color: '#f1f5f9', fontWeight: 700, mb: 2 }}>
                  Predictive Analysis
                </Typography>
                <Typography variant="body1" sx={{ color: '#cbd5e1', mb: 3, lineHeight: 1.7 }}>
                  Advanced AI-powered predictive maintenance and analytics. Leverage machine learning to forecast equipment failures and optimize maintenance schedules.
                </Typography>
                <Typography variant="body2" sx={{ color: '#94a3b8', mb: 3 }}>
                  • ML-based failure prediction<br/>
                  • Maintenance cost optimization<br/>
                  • Risk assessment & scoring<br/>
                  • Anomaly detection
                </Typography>
              </CardContent>
              <Box sx={{ p: 3, pt: 0 }}>
                <Button
                  fullWidth
                  variant="contained"
                  onClick={() => navigate('/login')}
                  sx={{
                    background: 'linear-gradient(90deg, #8b5cf6 0%, #7c3aed 100%)',
                    color: '#fff',
                    fontWeight: 700,
                    py: 1.5,
                    fontSize: '1rem',
                    '&:hover': {
                      background: 'linear-gradient(90deg, #7c3aed 0%, #6d28d9 100%)',
                      transform: 'scale(1.02)'
                    }
                  }}
                >
                  Access Analytics
                </Button>
              </Box>
            </Card>
          </Grid>
        </Grid>
      </Container>
    </div>
  );
}

export default LandingPage;
