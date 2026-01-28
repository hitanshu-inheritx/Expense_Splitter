const Group = require('../models/Group');
const Notification = require('../models/Notification');
const logger = require('../config/logger');
const { ROLES, GROUP_STATUS, INVITATION_STATUS, NOTIFICATION_TYPES } = require('../config/constants');

// @desc    Create new group
// @route   POST /api/groups
// @access  Private
const createGroup = async (req, res) => {
  try {
    console.log('[GROUP] Create group request:', req.user._id);
    const { name, description, inviteUsers } = req.body;
    
    const group = await Group.create({
      name,
      description,
      admin: req.user._id,
      members: [{
        user: req.user._id,
        role: ROLES.ADMIN,
        balance: 0
      }]
    });
    
    // Send invitations
    if (inviteUsers && inviteUsers.length > 0) {
      console.log(`[GROUP] Sending ${inviteUsers.length} invitations`);
      
      group.pendingInvitations = inviteUsers.map(userId => ({
        user: userId,
        status: INVITATION_STATUS.PENDING
      }));
      
      await group.save();
      
      // Create notifications
      const notifications = inviteUsers.map(userId => ({
        recipient: userId,
        type: NOTIFICATION_TYPES.GROUP_INVITATION,
        message: `${req.user.username} invited you to join "${name}"`,
        relatedGroup: group._id,
        relatedUser: req.user._id,
        metadata: { groupId: group._id }
      }));
      
      await Notification.insertMany(notifications);
    }
    
    const populatedGroup = await Group.findById(group._id)
      .populate('admin', 'username email profileImage')
      .populate('members.user', 'username email profileImage');
    
    console.log('[GROUP] Group created successfully:', group._id);
    logger.business('Group created', { groupId: group._id, adminId: req.user._id, name });
    
    res.status(201).json({
      success: true,
      message: 'Group created successfully',
      data: populatedGroup
    });
  } catch (error) {
    console.error('[GROUP ERROR] Create group error:', error);
    logger.error('Create group error', error);
    res.status(500).json({
      success: false,
      message: 'Error creating group'
    });
  }
};

// @desc    Get all groups for user
// @route   GET /api/groups
// @access  Private
const getMyGroups = async (req, res) => {
  try {
    console.log('[GROUP] Get my groups:', req.user._id);
    
    const groups = await Group.find({
      'members.user': req.user._id
    })
    .populate('admin', 'username email profileImage')
    .populate('members.user', 'username email profileImage')
    .sort({ updatedAt: -1 });
    
    // Add user's balance status to each group
    const groupsWithStatus = groups.map(group => {
      const member = group.members.find(m => m.user._id.toString() === req.user._id.toString());
      const balance = member ? member.balance : 0;
      
      let status = 'settled';
      if (balance > 0.01) status = 'gets';
      else if (balance < -0.01) status = 'owes';
      
      return {
        ...group.toObject(),
        userBalance: parseFloat(balance.toFixed(2)),
        userStatus: status
      };
    });
    
    console.log(`[GROUP] Found ${groups.length} groups`);
    
    res.json({
      success: true,
      data: groupsWithStatus
    });
  } catch (error) {
    console.error('[GROUP ERROR] Get my groups error:', error);
    logger.error('Get my groups error', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching groups'
    });
  }
};

// @desc    Get single group details
// @route   GET /api/groups/:groupId
// @access  Private
const getGroupById = async (req, res) => {
  try {
    console.log('[GROUP] Get group by ID:', req.params.groupId);
    
    const group = await Group.findById(req.params.groupId)
      .populate('admin', 'username email profileImage')
      .populate('members.user', 'username email profileImage')
      .populate('pendingInvitations.user', 'username email profileImage');
    
    if (!group) {
      console.log('[GROUP] Group not found:', req.params.groupId);
      return res.status(404).json({
        success: false,
        message: 'Group not found'
      });
    }
    
    // Check if user is member
    const isMember = group.members.some(m => m.user._id.toString() === req.user._id.toString());
    
    if (!isMember) {
      console.log('[GROUP] User is not a member:', req.user._id);
      return res.status(403).json({
        success: false,
        message: 'You are not a member of this group'
      });
    }
    
    console.log('[GROUP] Group found successfully');
    
    res.json({
      success: true,
      data: group
    });
  } catch (error) {
    console.error('[GROUP ERROR] Get group by ID error:', error);
    logger.error('Get group by ID error', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching group details'
    });
  }
};

// @desc    Update group name/description
// @route   PUT /api/groups/:groupId
// @access  Private (Admin only)
const updateGroup = async (req, res) => {
  try {
    console.log('[GROUP] Update group request:', req.params.groupId);
    const { name, description } = req.body;
    
    const group = req.group; // From middleware
    
    if (name) group.name = name;
    if (description !== undefined) group.description = description;
    
    await group.save();
    
    const updatedGroup = await Group.findById(group._id)
      .populate('admin', 'username email profileImage')
      .populate('members.user', 'username email profileImage');
    
    console.log('[GROUP] Group updated successfully:', group._id);
    logger.business('Group updated', { groupId: group._id, adminId: req.user._id });
    
    res.json({
      success: true,
      message: 'Group updated successfully',
      data: updatedGroup
    });
  } catch (error) {
    console.error('[GROUP ERROR] Update group error:', error);
    logger.error('Update group error', error);
    res.status(500).json({
      success: false,
      message: 'Error updating group'
    });
  }
};

// @desc    Invite users to group
// @route   POST /api/groups/:groupId/invite
// @access  Private (Admin only)
const inviteUsers = async (req, res) => {
  try {
    console.log('[GROUP] Invite users request:', req.params.groupId);
    const { userIds } = req.body;
    
    if (!userIds || !Array.isArray(userIds) || userIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Please provide user IDs to invite'
      });
    }
    
    const group = req.group; // From middleware
    
    // Filter out users already members or already invited
    const existingMemberIds = group.members.map(m => m.user.toString());
    const existingInvitationIds = group.pendingInvitations.map(i => i.user.toString());
    
    const newInvites = userIds.filter(id => 
      !existingMemberIds.includes(id) && !existingInvitationIds.includes(id)
    );
    
    if (newInvites.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'All selected users are already members or invited'
      });
    }
    
    // Add invitations
    newInvites.forEach(userId => {
      group.pendingInvitations.push({
        user: userId,
        status: INVITATION_STATUS.PENDING
      });
    });
    
    await group.save();
    
    // Create notifications
    const notifications = newInvites.map(userId => ({
      recipient: userId,
      type: NOTIFICATION_TYPES.GROUP_INVITATION,
      message: `${req.user.username} invited you to join "${group.name}"`,
      relatedGroup: group._id,
      relatedUser: req.user._id,
      metadata: { groupId: group._id }
    }));
    
    await Notification.insertMany(notifications);
    
    console.log(`[GROUP] ${newInvites.length} users invited successfully`);
    logger.business('Users invited to group', { groupId: group._id, count: newInvites.length });
    
    res.json({
      success: true,
      message: `${newInvites.length} user(s) invited successfully`
    });
  } catch (error) {
    console.error('[GROUP ERROR] Invite users error:', error);
    logger.error('Invite users error', error);
    res.status(500).json({
      success: false,
      message: 'Error inviting users'
    });
  }
};

// @desc    Accept group invitation
// @route   POST /api/groups/:groupId/accept-invitation
// @access  Private
const acceptInvitation = async (req, res) => {
  try {
    console.log('[GROUP] Accept invitation request:', req.params.groupId);
    
    const group = await Group.findById(req.params.groupId);
    
    if (!group) {
      console.log('[GROUP] Group not found:', req.params.groupId);
      return res.status(404).json({
        success: false,
        message: 'Group not found'
      });
    }
    
    // Find invitation
    const invitationIndex = group.pendingInvitations.findIndex(
      inv => inv.user.toString() === req.user._id.toString() && 
             inv.status === INVITATION_STATUS.PENDING
    );
    
    if (invitationIndex === -1) {
      console.log('[GROUP] No pending invitation found');
      return res.status(400).json({
        success: false,
        message: 'No pending invitation found'
      });
    }
    
    // Add user as member
    group.members.push({
      user: req.user._id,
      role: ROLES.MEMBER,
      balance: 0
    });
    
    // Remove invitation
    group.pendingInvitations.splice(invitationIndex, 1);
    
    await group.save();
    
    console.log('[GROUP] Invitation accepted successfully');
    logger.business('User accepted group invitation', { groupId: group._id, userId: req.user._id });
    
    res.json({
      success: true,
      message: 'Invitation accepted successfully'
    });
  } catch (error) {
    console.error('[GROUP ERROR] Accept invitation error:', error);
    logger.error('Accept invitation error', error);
    res.status(500).json({
      success: false,
      message: 'Error accepting invitation'
    });
  }
};

// @desc    Reject group invitation
// @route   POST /api/groups/:groupId/reject-invitation
// @access  Private
const rejectInvitation = async (req, res) => {
  try {
    console.log('[GROUP] Reject invitation request:', req.params.groupId);
    
    const group = await Group.findById(req.params.groupId);
    
    if (!group) {
      console.log('[GROUP] Group not found:', req.params.groupId);
      return res.status(404).json({
        success: false,
        message: 'Group not found'
      });
    }
    
    // Find and remove invitation
    const invitationIndex = group.pendingInvitations.findIndex(
      inv => inv.user.toString() === req.user._id.toString() && 
             inv.status === INVITATION_STATUS.PENDING
    );
    
    if (invitationIndex === -1) {
      console.log('[GROUP] No pending invitation found');
      return res.status(400).json({
        success: false,
        message: 'No pending invitation found'
      });
    }
    
    group.pendingInvitations.splice(invitationIndex, 1);
    await group.save();
    
    console.log('[GROUP] Invitation rejected successfully');
    logger.business('User rejected group invitation', { groupId: group._id, userId: req.user._id });
    
    res.json({
      success: true,
      message: 'Invitation rejected successfully'
    });
  } catch (error) {
    console.error('[GROUP ERROR] Reject invitation error:', error);
    logger.error('Reject invitation error', error);
    res.status(500).json({
      success: false,
      message: 'Error rejecting invitation'
    });
  }
};

// @desc    Remove member from group
// @route   DELETE /api/groups/:groupId/members/:userId
// @access  Private (Admin only, balance must be zero)
const removeMember = async (req, res) => {
  try {
    console.log('[GROUP] Remove member request:', req.params.groupId, req.params.userId);
    
    const group = req.group; // From middleware (balance already checked)
    const { userId } = req.params;
    
    if (group.admin.toString() === userId) {
      console.log('[GROUP] Cannot remove admin');
      return res.status(400).json({
        success: false,
        message: 'Cannot remove group admin'
      });
    }
    
    group.members = group.members.filter(m => m.user.toString() !== userId);
    await group.save();
    
    // Notify removed user
    await Notification.create({
      recipient: userId,
      type: NOTIFICATION_TYPES.MEMBER_REMOVED,
      message: `You have been removed from "${group.name}"`,
      relatedGroup: group._id,
      relatedUser: req.user._id
    });
    
    console.log('[GROUP] Member removed successfully');
    logger.business('Member removed from group', { groupId: group._id, userId, adminId: req.user._id });
    
    res.json({
      success: true,
      message: 'Member removed successfully'
    });
  } catch (error) {
    console.error('[GROUP ERROR] Remove member error:', error);
    logger.error('Remove member error', error);
    res.status(500).json({
      success: false,
      message: 'Error removing member'
    });
  }
};

// @desc    Leave group
// @route   POST /api/groups/:groupId/leave
// @access  Private (Balance must be zero)
const leaveGroup = async (req, res) => {
  try {
    console.log('[GROUP] Leave group request:', req.params.groupId);
    
    const group = req.group; // From middleware (balance already checked)
    
    if (group.admin.toString() === req.user._id.toString()) {
      console.log('[GROUP] Admin cannot leave group');
      return res.status(400).json({
        success: false,
        message: 'Admin cannot leave group. Transfer admin rights or delete the group.'
      });
    }
    
    group.members = group.members.filter(m => m.user.toString() !== req.user._id.toString());
    await group.save();
    
    console.log('[GROUP] User left group successfully');
    logger.business('User left group', { groupId: group._id, userId: req.user._id });
    
    res.json({
      success: true,
      message: 'You have left the group successfully'
    });
  } catch (error) {
    console.error('[GROUP ERROR] Leave group error:', error);
    logger.error('Leave group error', error);
    res.status(500).json({
      success: false,
      message: 'Error leaving group'
    });
  }
};

// @desc    Delete group
// @route   DELETE /api/groups/:groupId
// @access  Private (Admin only, all balances must be zero)
const deleteGroup = async (req, res) => {
  try {
    console.log('[GROUP] Delete group request:', req.params.groupId);
    
    const group = req.group; // From middleware
    
    // Check all balances are zero
    const hasNonZeroBalance = group.members.some(m => Math.abs(m.balance) > 0.01);
    
    if (hasNonZeroBalance) {
      console.log('[GROUP] Cannot delete group with pending balances');
      return res.status(400).json({
        success: false,
        message: 'Cannot delete group. Some members have pending balances.'
      });
    }
    
    await Group.findByIdAndDelete(group._id);
    
    console.log('[GROUP] Group deleted successfully');
    logger.business('Group deleted', { groupId: group._id, adminId: req.user._id });
    
    res.json({
      success: true,
      message: 'Group deleted successfully'
    });
  } catch (error) {
    console.error('[GROUP ERROR] Delete group error:', error);
    logger.error('Delete group error', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting group'
    });
  }
};

// @desc    Mark group as completed
// @route   POST /api/groups/:groupId/complete
// @access  Private (Admin only, all balances must be zero)
const completeGroup = async (req, res) => {
  try {
    console.log('[GROUP] Complete group request:', req.params.groupId);
    
    const group = req.group; // From middleware
    
    // Check all balances are zero
    const hasNonZeroBalance = group.members.some(m => Math.abs(m.balance) > 0.01);
    
    if (hasNonZeroBalance) {
      console.log('[GROUP] Cannot complete group with pending balances');
      return res.status(400).json({
        success: false,
        message: 'Cannot mark group as completed. Some members have pending balances.'
      });
    }
    
    group.status = GROUP_STATUS.COMPLETED;
    await group.save();
    
    console.log('[GROUP] Group marked as completed');
    logger.business('Group completed', { groupId: group._id, adminId: req.user._id });
    
    res.json({
      success: true,
      message: 'Group marked as completed'
    });
  } catch (error) {
    console.error('[GROUP ERROR] Complete group error:', error);
    logger.error('Complete group error', error);
    res.status(500).json({
      success: false,
      message: 'Error completing group'
    });
  }
};

module.exports = {
  createGroup,
  getMyGroups,
  getGroupById,
  updateGroup,
  inviteUsers,
  acceptInvitation,
  rejectInvitation,
  removeMember,
  leaveGroup,
  deleteGroup,
  completeGroup
};