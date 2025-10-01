const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

// Models
const User = require('./user');
const Token = require('./token');
const Alert = require('./alert');

// Auth middleware
const { authenticateJwt } = require('./authMiddleware');

// Auth routes
const authRouter = require('./routes_auth');
app.use('/api/auth', authRouter);

if (!process.env.MONGO_URI) {
  console.warn('Warning: MONGO_URI is not set. Set it in backend/.env');
}

mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/test', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(() => console.log('Mongo connected'))
  .catch(err => console.error('Mongo connection error', err.message));

app.get('/api/twin/:twinId', authenticateJwt, async (req, res) => {
  const { twinId } = req.params;
  try {
    const collection = mongoose.connection.collection(twinId);
    const data = await collection.find().sort({ ts: -1 }).limit(50).toArray();
    const latest = data[0] || {};
    const fields = Object.keys(latest).filter(k => !['_id', 'ts', 'twinId'].includes(k));
    
    // Store alerts in MongoDB for high-risk values
    if (latest && fields.length > 0) {
      const thresholds = {
        drillrig1: { torque: { min: 50, max: 150 }, pressure: { min: 10, max: 60 }, vibration: { min: 20, max: 100 } },
        wellhead1: { pressure: { min: 10, max: 60 }, temperature: { min: 50, max: 100 }, flowRate: { min: 100, max: 500 } },
        pipeline1: { pressure: { min: 10, max: 60 }, flowRate: { min: 100, max: 500 }, temperature: { min: 50, max: 100 } },
        compressor1: { energyConsumption: { min: 100, max: 1000 }, status: { min: 0, max: 1 } },
        refinery1: { temperature: { min: 50, max: 100 }, pressure: { min: 10, max: 60 }, throughput: { min: 100, max: 500 } },
        retail1: { fuelInventory: { min: 5000, max: 10000 }, sales: { min: 100, max: 600 } },
        turbine1: { temperature: { min: 50, max: 150 }, pressure: { min: 10, max: 60 }, vibration: { min: 20, max: 100 } },
        transformer1: { voltage: { min: 110, max: 120 }, current: { min: 5, max: 25 } }
      };
      
      const twinThresholds = thresholds[twinId];
      if (twinThresholds) {
        for (const field of fields) {
          const value = latest[field];
          const threshold = twinThresholds[field];
          if (threshold && value != null) {
            const isAbnormal = value < threshold.min || value > threshold.max;
            if (isAbnormal) {
              // Check for persistent alerts (>1 alert in last 5 minutes)
              const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
              const recentAlerts = await Alert.countDocuments({
                twinId,
                field,
                timestamp: { $gte: fiveMinutesAgo },
                resolved: false
              });
              
              const isPersistent = recentAlerts >= 1;
              
              await Alert.create({
                twinId,
                field,
                value,
                threshold,
                severity: 'high',
                description: `${field} value ${value} is outside normal range (${threshold.min}-${threshold.max})`,
                isPersistent,
                alertCount: recentAlerts + 1
              });
            }
          }
        }
      }
    }
    
    res.json({ fields, data });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch data' });
  }
});

// Get alerts endpoint
app.get('/api/alerts', authenticateJwt, async (req, res) => {
  try {
    const alerts = await Alert.find({ resolved: false }).sort({ timestamp: -1 }).limit(100);
    res.json(alerts);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch alerts' });
  }
});

// Get analytics endpoint - calculate averages for a twin
app.get('/api/analytics/:twinId', authenticateJwt, async (req, res) => {
  const { twinId } = req.params;
  try {
    const collection = mongoose.connection.collection(twinId);
    const data = await collection.find().toArray();
    
    if (data.length === 0) {
      return res.json({ averages: {}, totalRecords: 0, lastUpdated: new Date() });
    }
    
    // Get all numeric fields (exclude _id, ts, twinId, status)
    const latest = data[0] || {};
    const fields = Object.keys(latest).filter(k => 
      !['_id', 'ts', 'twinId', 'status'].includes(k) && 
      typeof latest[k] === 'number'
    );
    
    // Calculate averages
    const averages = {};
    fields.forEach(field => {
      const values = data
        .map(doc => doc[field])
        .filter(val => val != null && typeof val === 'number');
      
      if (values.length > 0) {
        const sum = values.reduce((acc, val) => acc + val, 0);
        averages[field] = sum / values.length;
      }
    });
    
    res.json({
      averages,
      totalRecords: data.length,
      lastUpdated: new Date()
    });
  } catch (err) {
    console.error('Analytics error:', err);
    res.status(500).json({ error: 'Failed to fetch analytics' });
  }
});

app.listen(5000, () => console.log('Backend running on port 5000'));
