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

  // 🔧 Thresholds per twin (range-based)
  const thresholdsByTwin = {
    drillrig1: {
      torque: { min: 80, max: 120 },
      pressure: { min: 20, max: 40 },
      vibration: { min: 10, max: 70 },
    },
    wellhead1: {
      pressure: { min: 20, max: 40 },
      temperature: { min: 60, max: 90 },
      flowRate: { min: 300, max: 450 },
    },
    pipeline1: {
      pressure: { min: 20, max: 40 },
      flowRate: { min: 300, max: 450 },
      temperature: { min: 60, max: 90 },
    },
    compressor1: {
      energyConsumption: { min: 400, max: 800 },
      status: { min: 1, max: 1 }, // assuming 1 = OK
    },
    refinery1: {
      temperature: { min: 60, max: 90 },
      pressure: { min: 20, max: 40 },
      throughput: { min: 300, max: 450 },
    },
    retail1: {
      fuelInventory: { min: 6000, max: 10000 },
      sales: { min: 0, max: 500 },
    },
    turbine1: {
      temperature: { min: 80, max: 120 },
      pressure: { min: 20, max: 40 },
      vibration: { min: 10, max: 70 },
    },
    transformer1: {
      voltage: { min: 115, max: 125 },
      current: { min: 0, max: 20 },
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
    axios.get(`http://localhost:5000/api/twin/${twinId}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(res => {
        setFields(res.data.fields);
        setData(res.data.data);
      })
      .catch(err => console.error('Fetch twin failed', err?.response?.data || err.message));
  }, [twinId, token]);

  const filteredData = data.filter(entry => {
    const ts = new Date(entry.ts).getTime();
    const start = filters.start ? new Date(filters.start).getTime() : -Infinity;
    const end = filters.end ? new Date(filters.end).getTime() : Infinity;
    const vibrationMin = filters.vibrationMin ? parseFloat(filters.vibrationMin) : -Infinity;
    return ts >= start && ts <= end && (entry.vibration ?? 0) >= vibrationMin;
  });

  const latestEntry = filteredData[filteredData.length - 1];

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
    <div>
      <h2>{twinNames[twinId] || twinId} Data</h2>
      <TwinFilters filters={filters} setFilters={setFilters} />

      {latestEntry && (
        <Card sx={{ margin: 2, backgroundColor: '#1e1e1e', color: '#fff', maxWidth: 600, mx: 'auto' }}>
          <CardContent>
            <Typography variant="h6">Latest Snapshot</Typography>
            <Typography variant="body2">
              Timestamp: {new Date(latestEntry.ts).toLocaleString()}
            </Typography>
            {fields.map(field => {
              const value = latestEntry[field];
              const rule = thresholdsByTwin[twinId]?.[field];
              const abnormal = isAbnormal(value, rule);
              return (
                <Typography key={field} sx={{ color: abnormal ? 'red' : 'inherit' }}>
                  {field}: {value} {fieldUnits[field] ? ` ${fieldUnits[field]}` : ''} {abnormal && '⚠'}
                </Typography>
              );
            })}
            <Button
              variant="outlined"
              startIcon={showTable ? <ExpandLess /> : <ExpandMore />}
              onClick={() => setShowTable(prev => !prev)}
              sx={{ marginTop: 2 }}
            >
              {showTable ? 'Hide Full Table' : 'Show Full Table'}
            </Button>
          </CardContent>
        </Card>
      )}

      {alerts.length > 0 && (
        <div style={{ backgroundColor: '#ffe0e0', padding: '10px', margin: '10px' }}>
          <h4>⚠ Alerts</h4>
          <ul>
            {alerts.map((a, i) => (
              <li key={i}>
                {a.twinId} - {a.field} = {a.value} at {new Date(a.ts).toLocaleString()}
              </li>
            ))}
          </ul>
        </div>
      )}

      <Collapse in={showTable}>
        <TableContainer component={Paper} sx={{ margin: '20px auto', width: '90%' }}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Timestamp</TableCell>
                {fields.map(field => (
                  <TableCell key={field}>
                    {field}
                    {fieldUnits[field] ? ` (${fieldUnits[field]})` : ''}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredData.map(entry => (
                <TableRow key={entry._id}>
                  <TableCell>{new Date(entry.ts).toLocaleString()}</TableCell>
                  {fields.map(field => {
                    const value = entry[field];
                    const rule = thresholdsByTwin[twinId]?.[field];
                    const abnormal = isAbnormal(value, rule);
                    return (
                      <TableCell key={field} sx={{ backgroundColor: abnormal ? '#ffcccc' : 'inherit' }}>
                        {value} {abnormal && '⚠'}
                      </TableCell>
                    );
                  })}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Collapse>

      <TwinChart data={filteredData} fields={fields} />
    </div>
  );
}

export default TwinPage;
