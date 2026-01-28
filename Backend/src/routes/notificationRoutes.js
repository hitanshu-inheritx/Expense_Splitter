const express = require('express');
const router = express.Router();
const {
  getMyNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
  deleteNotification
} = require('../controllers/notificationController');
const { protect } = require('../middleware/authMiddleware');

router.get('/', protect, getMyNotifications);
router.get('/unread-count', protect, getUnreadCount);
router.put('/:notificationId/read', protect, markAsRead);
router.put('/read-all', protect, markAllAsRead);
router.delete('/:notificationId', protect, deleteNotification);

module.exports = router;