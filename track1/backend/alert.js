const mongoose = require('mongoose');

const alertSchema = new mongoose.Schema({
  twinId: { type: String, required: true },
  field: { type: String, required: true },
  value: { type: Number, required: true },
  threshold: { 
    min: { type: Number },
    max: { type: Number }
  },
  severity: { type: String, enum: ['low', 'medium', 'high'], default: 'medium' },
  timestamp: { type: Date, default: Date.now },
  resolved: { type: Boolean, default: false },
  resolvedAt: { type: Date },
  description: { type: String },
  isPersistent: { type: Boolean, default: false },
  alertCount: { type: Number, default: 1 }
});

module.exports = mongoose.model('Alert', alertSchema);
