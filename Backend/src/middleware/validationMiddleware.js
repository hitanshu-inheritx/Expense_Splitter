const { body, param, validationResult } = require('express-validator');

const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    console.log('[VALIDATION] Validation errors:', errors.array());
    return res.status(400).json({ 
      success: false, 
      message: 'Validation failed', 
      errors: errors.array() 
    });
  }
  next();
};

const signupValidation = [
  body('username')
    .trim()
    .isLength({ min: 3 })
    .withMessage('Username must be at least 3 characters'),
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters'),
  body('phone')
    .optional()
    .matches(/^[0-9]{10}$/)
    .withMessage('Phone must be 10 digits'),
  validate
];

const loginValidation = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
  body('password')
    .notEmpty()
    .withMessage('Password is required'),
  validate
];

const createGroupValidation = [
  body('name')
    .trim()
    .isLength({ min: 3 })
    .withMessage('Group name must be at least 3 characters'),
  body('description')
    .optional()
    .trim(),
  validate
];

const addExpenseValidation = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Expense name is required'),
  body('amount')
    .isFloat({ min: 0.01 })
    .withMessage('Amount must be greater than 0'),
  body('paidBy')
    .notEmpty()
    .withMessage('Paid by user is required'),
  body('splitAmong')
    .isArray({ min: 1 })
    .withMessage('Split among must be an array with at least one member'),
  validate
];

const settlementValidation = [
  body('paidTo')
    .notEmpty()
    .withMessage('Paid to user is required'),
  body('amount')
    .isFloat({ min: 0.01 })
    .withMessage('Amount must be greater than 0'),
  body('paymentMode')
    .isIn(['cash', 'online'])
    .withMessage('Payment mode must be cash or online'),
  validate
];

module.exports = {
  signupValidation,
  loginValidation,
  createGroupValidation,
  addExpenseValidation,
  settlementValidation
};