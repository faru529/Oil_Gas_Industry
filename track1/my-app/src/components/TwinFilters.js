import React from 'react';
import { TextField, Box, Typography } from '@mui/material';
import { motion } from 'framer-motion';

function TwinFilters({ filters, setFilters }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Box sx={{ maxWidth: 1200, mx: 'auto', px: 2, mb: 3 }}>
        <Box sx={{ 
          background: 'linear-gradient(135deg, #1e293b 0%, #334155 100%)',
          border: '1px solid #475569',
          borderRadius: 2,
          p: 3,
          boxShadow: '0 4px 12px rgba(0,0,0,0.3)'
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 3, flexWrap: 'wrap' }}>
            <Box sx={{ 
              fontSize: '1.1rem', 
              fontWeight: 700, 
              color: '#f1f5f9',
              display: 'flex',
              alignItems: 'center',
              gap: 1
            }}>
              🔍 Filters
            </Box>
            <TextField
              label="Start Date"
              type="datetime-local"
              InputLabelProps={{ shrink: true }}
              onChange={e => setFilters(f => ({ ...f, start: e.target.value }))}
              sx={{
                '& .MuiOutlinedInput-root': {
                  color: '#f1f5f9',
                  '& fieldset': { borderColor: '#475569' },
                  '&:hover fieldset': { borderColor: '#3b82f6' },
                },
                '& .MuiInputLabel-root': { color: '#cbd5e1' }
              }}
            />
            <TextField
              label="End Date"
              type="datetime-local"
              InputLabelProps={{ shrink: true }}
              onChange={e => setFilters(f => ({ ...f, end: e.target.value }))}
              sx={{
                '& .MuiOutlinedInput-root': {
                  color: '#f1f5f9',
                  '& fieldset': { borderColor: '#475569' },
                  '&:hover fieldset': { borderColor: '#3b82f6' },
                },
                '& .MuiInputLabel-root': { color: '#cbd5e1' }
              }}
            />
          </Box>
        </Box>
      </Box>
    </motion.div>
  );
}

export default TwinFilters;
