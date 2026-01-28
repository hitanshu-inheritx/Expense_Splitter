const mongoose = require('mongoose');
const { PAYMENT_MODES } = require('../config/constants');

const settlementSchema = new mongoose.Schema({
  group: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Group',
    required: true
  },
  paidBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  paidTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  amount: {
    type: Number,
    required: [true, 'Amount is required'],
    min: [0.01, 'Amount must be greater than 0']
  },
  paymentMode: {
    type: String,
    enum: Object.values(PAYMENT_MODES),
    required: true
  }
}, { timestamps: true });

// Index for faster queries
settlementSchema.index({ group: 1, createdAt: -1 });

module.exports = mongoose.model('Settlement', settlementSchema);