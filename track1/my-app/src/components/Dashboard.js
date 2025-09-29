import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardActionArea, Typography, Collapse, Box, Button, Grid } from '@mui/material';
import { streamMap, streamTitles, streamDescriptions, twinNames } from './twinMeta';

const Dashboard = () => {
  const navigate = useNavigate();
  const [open, setOpen] = useState({});

  const toggle = (key) => setOpen(prev => ({ ...prev, [key]: !prev[key] }));

  return (
    <Box sx={{ maxWidth: 1100, mx: 'auto', mt: 4, px: 2 }}>
      <Typography variant="h4" gutterBottom>Dashboard</Typography>
      <Grid container spacing={3}>
        {Object.keys(streamMap).map((key) => (
          <Grid item xs={12} md={6} key={key}>
            <Card sx={{ background: 'linear-gradient(180deg, rgba(17,24,39,.9), rgba(15,23,42,.8))', border: '1px solid rgba(148,163,184,.18)', borderRadius: 2, boxShadow: '0 10px 30px rgba(0,0,0,.25)' }}>
              <CardActionArea onClick={() => toggle(key)}>
                <CardContent>
                  <Typography variant="h5" sx={{ fontWeight: 600 }}>{streamTitles[key]}</Typography>
                  <Typography variant="body2" sx={{ color: '#9fb3c8', mt: .5 }}>
                    {streamDescriptions[key]}
                  </Typography>
                </CardContent>
              </CardActionArea>
              <Collapse in={!!open[key]}>
                <Box sx={{ px: 2, pb: 2, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                  {streamMap[key].map(twin => (
                    <Button key={twin} variant="outlined" onClick={() => navigate(`/twin/${twin}`)}>
                      {twinNames[twin] || twin}
                    </Button>
                  ))}
                </Box>
              </Collapse>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default Dashboard;


