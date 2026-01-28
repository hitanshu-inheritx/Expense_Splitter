const User = require('../models/User');
const Group = require('../models/Group');
const logger = require('../config/logger');

// @desc    Update user profile
// @route   PUT /api/users/profile
// @access  Private
const updateProfile = async (req, res) => {
  try {
    console.log('[USER] Update profile request:', req.user._id);
    const { username, phone, profileImage } = req.body;
    
    const user = await User.findById(req.user._id);
    
    if (!user) {
      console.log('[USER] User not found:', req.user._id);
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    // Update allowed fields only
    if (username) user.username = username;
    if (phone !== undefined) user.phone = phone;
    if (profileImage !== undefined) user.profileImage = profileImage;
    
    await user.save();
    
    console.log('[USER] Profile updated successfully:', user._id);
    logger.business('User profile updated', { userId: user._id });
    
    res.json({
      success: true,
      message: 'Profile updated successfully',
      data: {
        _id: user._id,
        username: user.username,
        email: user.email,
        phone: user.phone,
        profileImage: user.profileImage
      }
    });
  } catch (error) {
    console.error('[USER ERROR] Update profile error:', error);
    logger.error('Update profile error', error);
    res.status(500).json({
      success: false,
      message: 'Error updating profile'
    });
  }
};

// @desc    Search users by email or username
// @route   GET /api/users/search?query=
// @access  Private
const searchUsers = async (req, res) => {
  try {
    console.log('[USER] Search users request:', req.query.query);
    const { query } = req.query;
    
    if (!query || query.trim().length < 2) {
      return res.status(400).json({
        success: false,
        message: 'Search query must be at least 2 characters'
      });
    }
    
    const users = await User.find({
      $or: [
        { email: { $regex: query, $options: 'i' } },
        { username: { $regex: query, $options: 'i' } }
      ],
      _id: { $ne: req.user._id } // Exclude current user
    })
    .select('username email profileImage')
    .limit(10);
    
    console.log(`[USER] Found ${users.length} users`);
    
    res.json({
      success: true,
      data: users
    });
  } catch (error) {
    console.error('[USER ERROR] Search users error:', error);
    logger.error('Search users error', error);
    res.status(500).json({
      success: false,
      message: 'Error searching users'
    });
  }
};

// @desc    Get user dashboard summary
// @route   GET /api/users/dashboard
// @access  Private
const getDashboardSummary = async (req, res) => {
  try {
    console.log('[USER] Get dashboard summary:', req.user._id);
    
    const groups = await Group.find({
      'members.user': req.user._id
    });
    
    let totalPaid = 0;
    let totalToReceive = 0;
    let totalOwed = 0;
    
    groups.forEach(group => {
      const member = group.members.find(m => m.user.toString() === req.user._id.toString());
      if (member) {
        if (member.balance > 0) {
          totalToReceive += member.balance;
        } else if (member.balance < 0) {
          totalOwed += Math.abs(member.balance);
        }
      }
    });
    
    const netBalance = totalToReceive - totalOwed;
    
    console.log('[USER] Dashboard summary calculated');
    
    res.json({
      success: true,
      data: {
        totalPaid,
        totalToReceive: parseFloat(totalToReceive.toFixed(2)),
        totalOwed: parseFloat(totalOwed.toFixed(2)),
        netBalance: parseFloat(netBalance.toFixed(2)),
        groupCount: groups.length
      }
    });
  } catch (error) {
    console.error('[USER ERROR] Dashboard summary error:', error);
    logger.error('Dashboard summary error', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching dashboard summary'
    });
  }
};

module.exports = {
  updateProfile,
  searchUsers,
  getDashboardSummary
};