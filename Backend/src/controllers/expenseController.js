const Expense = require('../models/Expense');
const Group = require('../models/Group');
const Notification = require('../models/Notification');
const logger = require('../config/logger');
const { NOTIFICATION_TYPES } = require('../config/constants');

// @desc    Add expense to group
// @route   POST /api/groups/:groupId/expenses
// @access  Private (Group members only)
const addExpense = async (req, res) => {
  try {
    console.log('[EXPENSE] Add expense request:', req.params.groupId);
    const { name, amount, paidBy, splitAmong } = req.body;
    const groupId = req.params.groupId;
    
    const group = req.group; // From middleware
    
    // Validate paidBy is a member
    const isPaidByMember = group.members.some(m => m.user.toString() === paidBy);
    if (!isPaidByMember) {
      console.log('[EXPENSE] PaidBy user is not a member');
      return res.status(400).json({
        success: false,
        message: 'Paid by user must be a group member'
      });
    }
    
    // Validate all splitAmong are members
    const memberIds = group.members.map(m => m.user.toString());
    const allMembersValid = splitAmong.every(userId => memberIds.includes(userId));
    
    if (!allMembersValid) {
      console.log('[EXPENSE] Some split users are not members');
      return res.status(400).json({
        success: false,
        message: 'All split users must be group members'
      });
    }
    
    // Calculate equal split
    const shareAmount = amount / splitAmong.length;
    
    const splitDetails = splitAmong.map(userId => ({
      user: userId,
      share: parseFloat(shareAmount.toFixed(2))
    }));
    
    // Create expense
    const expense = await Expense.create({
      group: groupId,
      name,
      amount,
      paidBy,
      splitAmong: splitDetails,
      addedBy: req.user._id
    });
    
    // Update balances
    splitDetails.forEach(split => {
      const member = group.members.find(m => m.user.toString() === split.user);
      if (member) {
        if (split.user === paidBy) {
          // Payer gets back their share minus what they paid
          member.balance += (amount - split.share);
        } else {
          // Others owe their share
          member.balance -= split.share;
        }
        member.balance = parseFloat(member.balance.toFixed(2));
      }
    });
    
    await group.save();
    
    // Create notifications for all members except the one who added
    const notifications = group.members
      .filter(m => m.user.toString() !== req.user._id.toString())
      .map(m => ({
        recipient: m.user,
        type: NOTIFICATION_TYPES.EXPENSE_ADDED,
        message: `${req.user.username} added expense "${name}" (₹${amount}) in "${group.name}"`,
        relatedGroup: group._id,
        relatedUser: req.user._id,
        metadata: { expenseId: expense._id, amount }
      }));
    
    if (notifications.length > 0) {
      await Notification.insertMany(notifications);
    }
    
    const populatedExpense = await Expense.findById(expense._id)
      .populate('paidBy', 'username email profileImage')
      .populate('splitAmong.user', 'username email profileImage')
      .populate('addedBy', 'username email profileImage');
    
    console.log('[EXPENSE] Expense added successfully:', expense._id);
    logger.business('Expense added', { 
      expenseId: expense._id, 
      groupId, 
      amount, 
      paidBy, 
      splitCount: splitAmong.length 
    });
    
    res.status(201).json({
      success: true,
      message: 'Expense added successfully',
      data: populatedExpense
    });
  } catch (error) {
    console.error('[EXPENSE ERROR] Add expense error:', error);
    logger.error('Add expense error', error);
    res.status(500).json({
      success: false,
      message: 'Error adding expense'
    });
  }
};

// @desc    Get all expenses for a group
// @route   GET /api/groups/:groupId/expenses
// @access  Private (Group members only)
const getGroupExpenses = async (req, res) => {
  try {
    console.log('[EXPENSE] Get group expenses:', req.params.groupId);
    
    const expenses = await Expense.find({ group: req.params.groupId })
      .populate('paidBy', 'username email profileImage')
      .populate('splitAmong.user', 'username email profileImage')
      .populate('addedBy', 'username email profileImage')
      .sort({ createdAt: -1 });
    
    console.log(`[EXPENSE] Found ${expenses.length} expenses`);
    
    res.json({
      success: true,
      data: expenses
    });
  } catch (error) {
    console.error('[EXPENSE ERROR] Get expenses error:', error);
    logger.error('Get expenses error', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching expenses'
    });
  }
};

module.exports = {
  addExpense,
  getGroupExpenses
};