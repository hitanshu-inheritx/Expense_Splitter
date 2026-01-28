import api from './api';

export const notificationService = {
  getNotifications: async () => {
    try {
      console.log('[NOTIFICATION SERVICE] Get notifications');
      const response = await api.get('/notifications');
      return response.data;
    } catch (error) {
      console.error('[NOTIFICATION SERVICE ERROR] Get notifications failed:', error);
      throw error.response?.data || { message: 'Failed to fetch notifications' };
    }
  },

  getUnreadCount: async () => {
    try {
      console.log('[NOTIFICATION SERVICE] Get unread count');
      const response = await api.get('/notifications/unread-count');
      return response.data;
    } catch (error) {
      console.error('[NOTIFICATION SERVICE ERROR] Get unread count failed:', error);
      throw error.response?.data || { message: 'Failed to fetch unread count' };
    }
  },

  markAsRead: async (notificationId) => {
    try {
      console.log('[NOTIFICATION SERVICE] Mark as read:', notificationId);
      const response = await api.put(`/notifications/${notificationId}/read`);
      return response.data;
    } catch (error) {
      console.error('[NOTIFICATION SERVICE ERROR] Mark as read failed:', error);
      throw error.response?.data || { message: 'Failed to mark as read' };
    }
  },

  markAllAsRead: async () => {
    try {
      console.log('[NOTIFICATION SERVICE] Mark all as read');
      const response = await api.put('/notifications/read-all');
      return response.data;
    } catch (error) {
      console.error('[NOTIFICATION SERVICE ERROR] Mark all as read failed:', error);
      throw error.response?.data || { message: 'Failed to mark all as read' };
    }
  },

  deleteNotification: async (notificationId) => {
    try {
      console.log('[NOTIFICATION SERVICE] Delete notification:', notificationId);
      const response = await api.delete(`/notifications/${notificationId}`);
      return response.data;
    } catch (error) {
      console.error('[NOTIFICATION SERVICE ERROR] Delete notification failed:', error);
      throw error.response?.data || { message: 'Failed to delete notification' };
    }
  },
};