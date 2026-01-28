const express = require('express');
const router = express.Router();
const { addExpense, getGroupExpenses } = require('../controllers/expenseController');
const { protect } = require('../middleware/authMiddleware');
const { checkGroupMember } = require('../middleware/rbacMiddleware');
const { addExpenseValidation } = require('../middleware/validationMiddleware');

router.post(
  '/:groupId/expenses', 
  protect, 
  checkGroupMember, 
  addExpenseValidation, 
  addExpense
);
router.get(
  '/:groupId/expenses', 
  protect, 
  checkGroupMember, 
  getGroupExpenses
);

module.exports = router;