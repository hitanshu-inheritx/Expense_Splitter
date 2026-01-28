const express = require('express');
const router = express.Router();
const {
  recordSettlement,
  getGroupSettlements,
  getSettlementSummary
} = require('../controllers/settlementController');
const { protect } = require('../middleware/authMiddleware');
const { checkGroupMember } = require('../middleware/rbacMiddleware');
const { settlementValidation } = require('../middleware/validationMiddleware');

router.post(
  '/:groupId/settlements', 
  protect, 
  checkGroupMember, 
  settlementValidation, 
  recordSettlement
);
router.get(
  '/:groupId/settlements', 
  protect, 
  checkGroupMember, 
  getGroupSettlements
);
router.get(
  '/:groupId/settlement-summary', 
  protect, 
  checkGroupMember, 
  getSettlementSummary
);

module.exports = router;