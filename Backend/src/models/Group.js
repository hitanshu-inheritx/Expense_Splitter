const mongoose = require('mongoose');
const { ROLES, GROUP_STATUS, INVITATION_STATUS } = require('../config/constants');

const groupSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Group name is required'],
    trim: true,
    minlength: [3, 'Group name must be at least 3 characters']
  },
  description: {
    type: String,
    trim: true,
    default: ''
  },
  admin: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  members: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    role: {
      type: String,
      enum: Object.values(ROLES),
      default: ROLES.MEMBER
    },
    balance: {
      type: Number,
      default: 0
    },
    joinedAt: {
      type: Date,
      default: Date.now
    }
  }],
  pendingInvitations: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    status: {
      type: String,
      enum: Object.values(INVITATION_STATUS),
      default: INVITATION_STATUS.PENDING
    },
    invitedAt: {
      type: Date,
      default: Date.now
    }
  }],
  status: {
    type: String,
    enum: Object.values(GROUP_STATUS),
    default: GROUP_STATUS.ACTIVE
  }
}, { timestamps: true });

// Index for faster queries
groupSchema.index({ admin: 1 });
groupSchema.index({ 'members.user': 1 });

module.exports = mongoose.model('Group', groupSchema);