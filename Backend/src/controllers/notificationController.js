const Notification = require('../models/Notification');
const logger = require('../config/logger');

// @desc    Get all notifications for user
// @route   GET /api/notifications
// @access  Private
const getMyNotifications = async (req, res) => {
  try {
    console.log('[NOTIFICATION] Get notifications:', req.user._id);
    
    const notifications = await Notification.find({ recipient: req.user._id })
      .populate('relatedGroup', 'name')
      .populate('relatedUser', 'username email profileImage')
      .sort({ createdAt: -1 })
      .limit(50);
    
    console.log(`[NOTIFICATION] Found ${notifications.length} notifications`);
    
    res.json({
      success: true,
      data: notifications
    });
  } catch (error) {
    console.error('[NOTIFICATION ERROR] Get notifications error:', error);
    logger.error('Get notifications error', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching notifications'
    });
  }
};

// @desc    Get unread notification count
// @route   GET /api/notifications/unread-count
// @access  Private
const getUnreadCount = async (req, res) => {
  try {
    console.log('[NOTIFICATION] Get unread count:', req.user._id);
    
    const count = await Notification.countDocuments({
      recipient: req.user._id,
      isRead: false
    });
    
    console.log(`[NOTIFICATION] Unread count: ${count}`);
    
    res.json({
      success: true,
      data: { count }
    });
  } catch (error) {
    console.error('[NOTIFICATION ERROR] Get unread count error:', error);
    logger.error('Get unread count error', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching unread count'
    });
  }
};

// @desc    Mark notification as read
// @route   PUT /api/notifications/:notificationId/read
// @access  Private
const markAsRead = async (req, res) => {
  try {
    console.log('[NOTIFICATION] Mark as read:', req.params.notificationId);
    
    const notification = await Notification.findOneAndUpdate(
      { _id: req.params.notificationId, recipient: req.user._id },
      { isRead: true },
      { new: true }
    );
    
    if (!notification) {
      console.log('[NOTIFICATION] Notification not found');
      return res.status(404).json({
        success: false,
        message: 'Notification not found'
      });
    }
    
    console.log('[NOTIFICATION] Marked as read successfully');
    
    res.json({
      success: true,
      message: 'Notification marked as read'
    });
  } catch (error) {
    console.error('[NOTIFICATION ERROR] Mark as read error:', error);
    logger.error('Mark as read error', error);
    res.status(500).json({
      success: false,
      message: 'Error marking notification as read'
    });
  }
};

// @desc    Mark all notifications as read
// @route   PUT /api/notifications/read-all
// @access  Private
const markAllAsRead = async (req, res) => {
  try {
    console.log('[NOTIFICATION] Mark all as read:', req.user._id);
    
    await Notification.updateMany(
      { recipient: req.user._id, isRead: false },
      { isRead: true }
    );
    
    console.log('[NOTIFICATION] All notifications marked as read');
    
    res.json({
      success: true,
      message: 'All notifications marked as read'
    });
  } catch (error) {
    console.error('[NOTIFICATION ERROR] Mark all as read error:', error);
    logger.error('Mark all as read error', error);
    res.status(500).json({
      success: false,
      message: 'Error marking all notifications as read'
    });
  }
};

// @desc    Delete notification
// @route   DELETE /api/notifications/:notificationId
// @access  Private
const deleteNotification = async (req, res) => {
  try {
    console.log('[NOTIFICATION] Delete notification:', req.params.notificationId);
    
    const notification = await Notification.findOneAndDelete({
      _id: req.params.notificationId,
      recipient: req.user._id
    });
    
    if (!notification) {
      console.log('[NOTIFICATION] Notification not found');
      return res.status(404).json({
        success: false,
        message: 'Notification not found'
      });
    }
    
    console.log('[NOTIFICATION] Notification deleted successfully');
    
    res.json({
      success: true,
      message: 'Notification deleted successfully'
    });
  } catch (error) {
    console.error('[NOTIFICATION ERROR] Delete notification error:', error);
    logger.error('Delete notification error', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting notification'
    });
  }
};

module.exports = {
  getMyNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
  deleteNotification
};