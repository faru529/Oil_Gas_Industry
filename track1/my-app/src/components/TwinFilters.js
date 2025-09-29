import React from 'react';
import { TextField, Box } from '@mui/material';
import { motion } from 'framer-motion';

function TwinFilters({ filters, setFilters }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Box sx={{ display: 'flex', gap: 2, margin: 2 }}>
        <TextField
          label="Start Date"
          type="datetime-local"
          InputLabelProps={{ shrink: true }}
          onChange={e => setFilters(f => ({ ...f, start: e.target.value }))}
        />
        <TextField
          label="End Date"
          type="datetime-local"
          InputLabelProps={{ shrink: true }}
          onChange={e => setFilters(f => ({ ...f, end: e.target.value }))}
        />
      </Box>
    </motion.div>
  );
}

export default TwinFilters;
