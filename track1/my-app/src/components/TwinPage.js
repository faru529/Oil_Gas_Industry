import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import TwinChart from './TwinChart';
import TwinFilters from './TwinFilters';
import { useAuth } from './AuthContext';
import { twinNames } from './twinMeta';
import {
  Card, CardContent, Typography, Button, Collapse,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper
} from '@mui/material';
import { ExpandMore, ExpandLess } from '@mui/icons-material';

function TwinPage() {
  const { twinId } = useParams();
  const { token } = useAuth();
  const [fields, setFields] = useState([]);
  const [data, setData] = useState([]);
  const [filters, setFilters] = useState({});
  const [showTable, setShowTable] = useState(false);

  // 🔧 Thresholds matching simulator ranges (10-20% buffer for critical alerts)
  const thresholdsByTwin = {
    drillrig1: {
      torque: { min: 50, max: 150 }, // simulator: 50-150, buffer: 0%
      pressure: { min: 10, max: 60 }, // simulator: 10-60, buffer: 0%
      vibration: { min: 20, max: 100 }, // simulator: 20-100, buffer: 0%
    },
    wellhead1: {
      pressure: { min: 10, max: 60 }, // simulator: 10-60, buffer: 0%
      temperature: { min: 50, max: 100 }, // simulator: 50-100, buffer: 0%
      flowRate: { min: 100, max: 500 }, // simulator: 100-500, buffer: 0%
    },
    pipeline1: {
      pressure: { min: 10, max: 60 }, // simulator: 10-60, buffer: 0%
      flowRate: { min: 100, max: 500 }, // simulator: 100-500, buffer: 0%
      temperature: { min: 50, max: 100 }, // simulator: 50-100, buffer: 0%
    },
    compressor1: {
      energyConsumption: { min: 100, max: 1000 }, // simulator: 100-1000, buffer: 0%
      status: { min: 0, max: 1 }, // simulator: boolean
    },
    refinery1: {
      temperature: { min: 50, max: 100 }, // simulator: 50-100, buffer: 0%
      pressure: { min: 10, max: 60 }, // simulator: 10-60, buffer: 0%
      throughput: { min: 100, max: 500 }, // simulator: 100-500, buffer: 0%
    },
    retail1: {
      fuelInventory: { min: 5000, max: 10000 }, // simulator: 5000-10000, buffer: 0%
      sales: { min: 100, max: 600 }, // simulator: 100-600, buffer: 0%
    },
    turbine1: {
      temperature: { min: 50, max: 150 }, // simulator: 50-150, buffer: 0%
      pressure: { min: 10, max: 60 }, // simulator: 10-60, buffer: 0%
      vibration: { min: 20, max: 100 }, // simulator: 20-100, buffer: 0%
    },
    transformer1: {
      voltage: { min: 110, max: 120 }, // simulator: 110-120, buffer: 0%
      current: { min: 5, max: 25 }, // simulator: 5-25, buffer: 0%
    },
  };

  // 🔍 Alert logic
  function isAbnormal(value, rule) {
    if (!rule || value == null) return false;
    const { min, max } = rule;
    return value < min || value > max;
  }

  useEffect(() => {
    if (!token) return;
    
    const fetchData = () => {
      axios.get(`http://localhost:5000/api/twin/${twinId}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then(res => {
          setFields(res.data.fields);
          setData(res.data.data);
        })
        .catch(err => console.error('Fetch twin failed', err?.response?.data || err.message));
    };
    
    // Initial fetch
    fetchData();
    
    // Set up polling every 10 seconds for real-time updates
    const interval = setInterval(fetchData, 10000);
    
    return () => clearInterval(interval);
  }, [twinId, token]);

  const filteredData = data.filter(entry => {
    const ts = new Date(entry.ts).getTime();
    const start = filters.start ? new Date(filters.start).getTime() : -Infinity;
    const end = filters.end ? new Date(filters.end).getTime() : Infinity;
    const vibrationMin = filters.vibrationMin ? parseFloat(filters.vibrationMin) : -Infinity;
    return ts >= start && ts <= end && (entry.vibration ?? 0) >= vibrationMin;
  });

  const latestEntry = data[0]; // Get the first item (newest) since data is sorted by timestamp descending

  const alerts = filteredData.flatMap(entry =>
    fields
      .filter(field => isAbnormal(entry[field], thresholdsByTwin[twinId]?.[field]))
      .map(field => ({
        ts: entry.ts,
        field,
        value: entry[field],
        twinId,
      }))
  );

  // Units per field
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

  return (
    <div style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)', minHeight: '100vh', paddingBottom: '40px' }}>
      <div style={{ 
        background: 'linear-gradient(90deg, #1e293b 0%, #334155 100%)', 
        padding: '24px', 
        marginBottom: '20px',
        borderBottom: '2px solid #3b82f6',
        boxShadow: '0 4px 6px rgba(0,0,0,0.3)'
      }}>
        <Typography variant="h3" sx={{ color: '#f1f5f9', fontWeight: 700, textAlign: 'center' }}>
          🔍 {twinNames[twinId] || twinId} Analytics
        </Typography>
        <Typography variant="subtitle1" sx={{ color: '#cbd5e1', textAlign: 'center', mt: 1 }}>
          Real-time monitoring and performance metrics
        </Typography>
      </div>
      <TwinFilters filters={filters} setFilters={setFilters} />

      {latestEntry && (
        <div style={{ maxWidth: '1200px', margin: '20px auto', padding: '0 16px' }}>
          <Card sx={{ 
            background: 'linear-gradient(135deg, #1e293b 0%, #334155 100%)', 
            border: '1px solid #475569',
            borderRadius: 3,
            boxShadow: '0 10px 30px rgba(0,0,0,0.4)',
            mb: 3
          }}>
            <CardContent>
              <Typography variant="h5" sx={{ color: '#f1f5f9', fontWeight: 600, mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                📊 Latest Snapshot
                <Typography component="span" sx={{ color: '#94a3b8', fontSize: '0.9rem', fontWeight: 400, ml: 'auto' }}>
                  {new Date(latestEntry.ts).toLocaleString()}
                </Typography>
              </Typography>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '16px' }}>
                {fields.map(field => {
                  const value = latestEntry[field];
                  const rule = thresholdsByTwin[twinId]?.[field];
                  const abnormal = isAbnormal(value, rule);
                  return (
                    <Card 
                      key={field} 
                      sx={{ 
                        background: abnormal 
                          ? 'linear-gradient(135deg, #7f1d1d 0%, #991b1b 100%)' 
                          : 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
                        border: abnormal ? '2px solid #ef4444' : '1px solid #334155',
                        color: '#fff',
                        transition: 'all 0.3s ease',
                        '&:hover': {
                          transform: 'translateY(-4px)',
                          boxShadow: '0 8px 20px rgba(0,0,0,0.5)'
                        }
                      }}
                    >
                      <CardContent sx={{ textAlign: 'center', py: 2 }}>
                        <Typography variant="subtitle2" sx={{ color: '#cbd5e1', fontSize: '0.85rem', mb: 1 }}>
                          {(field.charAt(0).toUpperCase() + field.slice(1))}{fieldUnits[field] ? ` (${fieldUnits[field]})` : ''}
                        </Typography>
                        <Typography variant="h4" sx={{ fontWeight: 700, color: abnormal ? '#fca5a5' : '#3b82f6' }}>
                          {typeof value === 'number' ? value.toFixed(2) : value} {abnormal && '⚠️'}
                        </Typography>
                        {abnormal && (
                          <Typography variant="caption" sx={{ color: '#fca5a5', mt: 0.5, display: 'block' }}>
                            Out of range!
                          </Typography>
                        )}
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </CardContent>
          </Card>
          <Button
            variant="contained"
            startIcon={showTable ? <ExpandLess /> : <ExpandMore />}
            onClick={() => setShowTable(prev => !prev)}
            sx={{ 
              background: 'linear-gradient(90deg, #3b82f6 0%, #2563eb 100%)',
              color: '#fff',
              fontWeight: 600,
              px: 3,
              py: 1.5,
              '&:hover': {
                background: 'linear-gradient(90deg, #2563eb 0%, #1d4ed8 100%)'
              }
            }}
          >
            {showTable ? 'Hide Full Table' : 'Show Full Table'}
          </Button>
        </div>
      )}

      {alerts.length > 0 && (
        <div style={{ maxWidth: '1200px', margin: '20px auto', padding: '0 16px' }}>
          <Card sx={{ 
            background: 'linear-gradient(135deg, #7f1d1d 0%, #991b1b 100%)',
            border: '2px solid #ef4444',
            boxShadow: '0 8px 25px rgba(239, 68, 68, 0.3)'
          }}>
            <CardContent>
              <Typography variant="h5" sx={{ color: '#fca5a5', fontWeight: 700, mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                ⚠️ Active Alerts ({alerts.length})
              </Typography>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {alerts.map((a, i) => (
                  <Card key={i} sx={{ background: '#450a0a', border: '1px solid #7f1d1d' }}>
                    <CardContent sx={{ py: 1.5 }}>
                      <Typography sx={{ color: '#fecaca', fontSize: '0.95rem' }}>
                        <strong style={{ color: '#fca5a5' }}>{a.twinId}</strong> • 
                        <strong style={{ color: '#fca5a5' }}>{a.field}</strong> = 
                        <strong style={{ color: '#ef4444' }}> {a.value}</strong> • 
                        <span style={{ color: '#cbd5e1' }}>{new Date(a.ts).toLocaleString()}</span>
                      </Typography>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      <Collapse in={showTable}>
        <div style={{ maxWidth: '1200px', margin: '20px auto', padding: '0 16px' }}>
          <TableContainer 
            component={Paper} 
            sx={{ 
              background: '#1e293b',
              border: '1px solid #475569',
              boxShadow: '0 10px 30px rgba(0,0,0,0.4)'
            }}
          >
          <Table>
            <TableHead>
              <TableRow sx={{ background: 'linear-gradient(90deg, #334155 0%, #475569 100%)' }}>
                <TableCell sx={{ color: '#f1f5f9', fontWeight: 700, fontSize: '0.95rem' }}>Timestamp</TableCell>
                {fields.map(field => (
                  <TableCell key={field} sx={{ color: '#f1f5f9', fontWeight: 700, fontSize: '0.95rem' }}>
                    {field}
                    {fieldUnits[field] ? ` (${fieldUnits[field]})` : ''}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredData.map((entry, idx) => (
                <TableRow 
                  key={entry._id}
                  sx={{ 
                    backgroundColor: idx % 2 === 0 ? '#0f172a' : '#1e293b',
                    '&:hover': { backgroundColor: '#334155' }
                  }}
                >
                  <TableCell sx={{ color: '#cbd5e1', fontSize: '0.9rem' }}>
                    {new Date(entry.ts).toLocaleString()}
                  </TableCell>
                  {fields.map(field => {
                    const value = entry[field];
                    const rule = thresholdsByTwin[twinId]?.[field];
                    const abnormal = isAbnormal(value, rule);
                    return (
                      <TableCell 
                        key={field} 
                        sx={{ 
                          backgroundColor: abnormal ? '#7f1d1d' : 'inherit',
                          color: abnormal ? '#fca5a5' : '#e2e8f0',
                          fontWeight: abnormal ? 700 : 400,
                          fontSize: '0.9rem'
                        }}
                      >
                        {typeof value === 'number' ? value.toFixed(2) : value} {abnormal && '⚠️'}
                      </TableCell>
                    );
                  })}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
        </div>
      </Collapse>

      <div style={{ maxWidth: '1200px', margin: '20px auto', padding: '0 16px' }}>
        <TwinChart data={filteredData} fields={fields} />
      </div>
    </div>
  );
}

export default TwinPage;
