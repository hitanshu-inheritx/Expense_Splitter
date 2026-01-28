const express = require('express');
const router = express.Router();
const {
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
} = require('../controllers/groupController');
const { protect } = require('../middleware/authMiddleware');
const { 
  checkGroupAdmin, 
  checkGroupMember, 
  checkBalanceZero 
} = require('../middleware/rbacMiddleware');
const { createGroupValidation } = require('../middleware/validationMiddleware');

// Group CRUD
router.post('/', protect, createGroupValidation, createGroup);
router.get('/', protect, getMyGroups);
router.get('/:groupId', protect, checkGroupMember, getGroupById);
router.put('/:groupId', protect, checkGroupAdmin, updateGroup);
router.delete('/:groupId', protect, checkGroupAdmin, deleteGroup);

// Group actions
router.post('/:groupId/invite', protect, checkGroupAdmin, inviteUsers);
router.post('/:groupId/accept-invitation', protect, acceptInvitation);
router.post('/:groupId/reject-invitation', protect, rejectInvitation);
router.post('/:groupId/complete', protect, checkGroupAdmin, completeGroup);

// Member management
router.delete(
  '/:groupId/members/:userId', 
  protect, 
  checkGroupAdmin, 
  checkBalanceZero, 
  removeMember
);
router.post(
  '/:groupId/leave', 
  protect, 
  checkGroupMember, 
  checkBalanceZero, 
  leaveGroup
);

module.exports = router;