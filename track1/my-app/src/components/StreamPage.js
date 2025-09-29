import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Typography, Button, Box } from '@mui/material';
import { twinNames } from './twinMeta';

const streamMap = {
  upstream: ['drillrig1', 'wellhead1'],
  midstream: ['pipeline1', 'compressor1'],
  downstream: ['retail1', 'refinery1'],
  power: ['turbine1', 'transformer1'],
};

// using shared twinNames

function StreamPage() {
  const { streamId } = useParams();
  const navigate = useNavigate();
  const twins = streamMap[streamId] || [];

  return (
    <Box sx={{ textAlign: 'center', mt: 4 }}>
      <Typography variant="h4" gutterBottom>
        {streamId.charAt(0).toUpperCase() + streamId.slice(1)} Twins
      </Typography>
      <Box sx={{ display: 'flex', justifyContent: 'center', gap: 4 }}>
        {twins.map(twin => (
          <Button
            key={twin}
            variant="contained"
            onClick={() => navigate(`/twin/${twin}`)}
          >
            {twinNames[twin]}
          </Button>
        ))}
      </Box>
    </Box>
  );
}

export default StreamPage;
