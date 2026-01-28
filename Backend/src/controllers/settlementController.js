const Settlement = require('../models/Settlement');
const Group = require('../models/Group');
const Notification = require('../models/Notification');
const logger = require('../config/logger');
const { NOTIFICATION_TYPES } = require('../config/constants');

// @desc    Record settlement
// @route   POST /api/groups/:groupId/settlements
// @access  Private (Group members only)
const recordSettlement = async (req, res) => {
  try {
    console.log('[SETTLEMENT] Record settlement request:', req.params.groupId);
    const { paidTo, amount, paymentMode } = req.body;
    const groupId = req.params.groupId;
    
    const group = req.group; // From middleware
    
    // Validate paidTo is a member
    const isPaidToMember = group.members.some(m => m.user.toString() === paidTo);
    if (!isPaidToMember) {
      console.log('[SETTLEMENT] PaidTo user is not a member');
      return res.status(400).json({
        success: false,
        message: 'Paid to user must be a group member'
      });
    }
    
    // Cannot settle with yourself
    if (req.user._id.toString() === paidTo) {
      console.log('[SETTLEMENT] Cannot settle with yourself');
      return res.status(400).json({
        success: false,
        message: 'Cannot settle payment with yourself'
      });
    }
    
    // Create settlement record
    const settlement = await Settlement.create({
      group: groupId,
      paidBy: req.user._id,
      paidTo,
      amount,
      paymentMode
    });
    
    // Update balances
    const payer = group.members.find(m => m.user.toString() === req.user._id.toString());
    const receiver = group.members.find(m => m.user.toString() === paidTo);
    
    if (payer) {
      payer.balance += amount;
      payer.balance = parseFloat(payer.balance.toFixed(2));
    }
    
    if (receiver) {
      receiver.balance -= amount;
      receiver.balance = parseFloat(receiver.balance.toFixed(2));
    }
    
    await group.save();
    
    // Create notification for receiver
    await Notification.create({
      recipient: paidTo,
      type: NOTIFICATION_TYPES.SETTLEMENT,
      message: `${req.user.username} has settled ₹${amount} with you in "${group.name}"`,
      relatedGroup: group._id,
      relatedUser: req.user._id,
      metadata: { settlementId: settlement._id, amount, paymentMode }
    });
    
    const populatedSettlement = await Settlement.findById(settlement._id)
      .populate('paidBy', 'username email profileImage')
      .populate('paidTo', 'username email profileImage');
    
    console.log('[SETTLEMENT] Settlement recorded successfully:', settlement._id);
    logger.business('Settlement recorded', { 
      settlementId: settlement._id, 
      groupId, 
      paidBy: req.user._id, 
      paidTo, 
      amount 
    });
    
    res.status(201).json({
      success: true,
      message: 'Settlement recorded successfully',
      data: populatedSettlement
    });
  } catch (error) {
    console.error('[SETTLEMENT ERROR] Record settlement error:', error);
    logger.error('Record settlement error', error);
    res.status(500).json({
      success: false,
      message: 'Error recording settlement'
    });
  }
};

// @desc    Get all settlements for a group
// @route   GET /api/groups/:groupId/settlements
// @access  Private (Group members only)
const getGroupSettlements = async (req, res) => {
  try {
    console.log('[SETTLEMENT] Get group settlements:', req.params.groupId);
    
    const settlements = await Settlement.find({ group: req.params.groupId })
      .populate('paidBy', 'username email profileImage')
      .populate('paidTo', 'username email profileImage')
      .sort({ createdAt: -1 });
    
    console.log(`[SETTLEMENT] Found ${settlements.length} settlements`);
    
    res.json({
      success: true,
      data: settlements
    });
  } catch (error) {
    console.error('[SETTLEMENT ERROR] Get settlements error:', error);
    logger.error('Get settlements error', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching settlements'
    });
  }
};

// @desc    Get settlement summary for user in group
// @route   GET /api/groups/:groupId/settlement-summary
// @access  Private (Group members only)
const getSettlementSummary = async (req, res) => {
  try {
    console.log('[SETTLEMENT] Get settlement summary:', req.params.groupId);
    
    const group = req.group; // From middleware
    const member = group.members.find(m => m.user.toString() === req.user._id.toString());
    
    if (!member) {
      return res.status(404).json({
        success: false,
        message: 'Member not found in group'
      });
    }
    
    const balance = member.balance;
    let summary = {
      balance: parseFloat(balance.toFixed(2)),
      status: 'settled',
      message: 'All settled up!',
      settlements: []
    };
    
    if (balance < -0.01) {
      // User owes money
      summary.status = 'owes';
      summary.message = `You owe ₹${Math.abs(balance).toFixed(2)}`;
      
      // Find who to pay
      const creditors = group.members
        .filter(m => m.balance > 0.01)
        .map(m => ({
          userId: m.user,
          amount: parseFloat(m.balance.toFixed(2))
        }))
        .sort((a, b) => b.amount - a.amount);
      
      summary.settlements = creditors;
    } else if (balance > 0.01) {
      // User is owed money
      summary.status = 'gets';
      summary.message = `You are owed ₹${balance.toFixed(2)}`;
      
      // Find who owes
      const debtors = group.members
        .filter(m => m.balance < -0.01)
        .map(m => ({
          userId: m.user,
          amount: parseFloat(Math.abs(m.balance).toFixed(2))
        }))
        .sort((a, b) => b.amount - a.amount);
      
      summary.settlements = debtors;
    }
    
    // Populate user details
    await Group.populate(summary.settlements, { 
      path: 'userId', 
      select: 'username email profileImage' 
    });
    
    console.log('[SETTLEMENT] Settlement summary calculated');
    
    res.json({
      success: true,
      data: summary
    });
  } catch (error) {
    console.error('[SETTLEMENT ERROR] Get settlement summary error:', error);
    logger.error('Get settlement summary error', error);
    res.status(500).json({
      success: false,
      message: 'Error calculating settlement summary'
    });
  }
};








module.exports = {
  recordSettlement,
  getGroupSettlements,
  getSettlementSummary
};