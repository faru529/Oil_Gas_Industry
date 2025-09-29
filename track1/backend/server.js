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
    res.json({ fields, data });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch data' });
  }
});

app.listen(5000, () => console.log('Backend running on port 5000'));
