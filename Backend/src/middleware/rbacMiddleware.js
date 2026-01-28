const Group = require('../models/Group');
const logger = require('../config/logger');
const { ROLES } = require('../config/constants');

const checkGroupAdmin = async (req, res, next) => {
  try {
    const { groupId } = req.params;
    const userId = req.user._id;
    
    console.log(`[RBAC] Checking admin permissions for user ${userId} in group ${groupId}`);
    
    const group = await Group.findById(groupId);
    
    if (!group) {
      console.log('[RBAC] Group not found:', groupId);
      return res.status(404).json({ 
        success: false, 
        message: 'Group not found' 
      });
    }
    
    if (group.admin.toString() !== userId.toString()) {
      console.log('[RBAC] User is not admin:', userId);
      return res.status(403).json({ 
        success: false, 
        message: 'Only group admin can perform this action' 
      });
    }
    
    req.group = group;
    console.log('[RBAC] Admin permission granted');
    next();
  } catch (error) {
    console.error('[RBAC ERROR] Check admin middleware error:', error);
    logger.error('RBAC check admin error', error);
    return res.status(500).json({ 
      success: false, 
      message: 'Server error checking permissions' 
    });
  }
};

const checkGroupMember = async (req, res, next) => {
  try {
    const { groupId } = req.params;
    const userId = req.user._id;
    
    console.log(`[RBAC] Checking member status for user ${userId} in group ${groupId}`);
    
    const group = await Group.findById(groupId);
    
    if (!group) {
      console.log('[RBAC] Group not found:', groupId);
      return res.status(404).json({ 
        success: false, 
        message: 'Group not found' 
      });
    }
    
    const isMember = group.members.some(m => m.user.toString() === userId.toString());
    
    if (!isMember) {
      console.log('[RBAC] User is not a member:', userId);
      return res.status(403).json({ 
        success: false, 
        message: 'You are not a member of this group' 
      });
    }
    
    req.group = group;
    console.log('[RBAC] Member permission granted');
    next();
  } catch (error) {
    console.error('[RBAC ERROR] Check member middleware error:', error);
    logger.error('RBAC check member error', error);
    return res.status(500).json({ 
      success: false, 
      message: 'Server error checking membership' 
    });
  }
};

const checkBalanceZero = async (req, res, next) => {
  try {
    const { groupId, userId } = req.params;
    const targetUserId = userId || req.user._id;
    
    console.log(`[RBAC] Checking balance for user ${targetUserId} in group ${groupId}`);
    
    const group = await Group.findById(groupId);
    
    if (!group) {
      console.log('[RBAC] Group not found:', groupId);
      return res.status(404).json({ 
        success: false, 
        message: 'Group not found' 
      });
    }
    
    const member = group.members.find(m => m.user.toString() === targetUserId.toString());
    
    if (!member) {
      console.log('[RBAC] Member not found:', targetUserId);
      return res.status(404).json({ 
        success: false, 
        message: 'Member not found in group' 
      });
    }
    
    if (Math.abs(member.balance) > 0.01) {
      console.log('[RBAC] Balance is not zero:', member.balance);
      return res.status(400).json({ 
        success: false, 
        message: 'Cannot perform this action. Member has pending balance.' 
      });
    }
    
    req.group = group;
    console.log('[RBAC] Balance check passed');
    next();
  } catch (error) {
    console.error('[RBAC ERROR] Check balance middleware error:', error);
    logger.error('RBAC check balance error', error);
    return res.status(500).json({ 
      success: false, 
      message: 'Server error checking balance' 
    });
  }
};

module.exports = { 
  checkGroupAdmin, 
  checkGroupMember, 
  checkBalanceZero 
};