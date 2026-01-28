const express = require('express');
const router = express.Router();
const { 
  updateProfile, 
  searchUsers, 
  getDashboardSummary 
} = require('../controllers/userController');
const { protect } = require('../middleware/authMiddleware');

router.put('/profile', protect, updateProfile);
router.get('/search', protect, searchUsers);
router.get('/dashboard', protect, getDashboardSummary);

module.exports = router;