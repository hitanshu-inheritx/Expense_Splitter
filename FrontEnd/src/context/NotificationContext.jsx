import { createContext, useState, useEffect, useContext } from 'react';
import { notificationService } from '../services/notificationService';
import { toast } from 'react-toastify';
import { useAuth } from './AuthContext';

const NotificationContext = createContext();

export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotification must be used within NotificationProvider');
  }
  return context;
};

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    if (isAuthenticated) {
      fetchNotifications();
      fetchUnreadCount();
      
      // Poll for new notifications every 30 seconds
      const interval = setInterval(() => {
        fetchUnreadCount();
      }, 30000);
      
      return () => clearInterval(interval);
    }
  }, [isAuthenticated]);

  const fetchNotifications = async () => {
    try {
      console.log('[NOTIFICATION CONTEXT] Fetching notifications');
      setLoading(true);
      const response = await notificationService.getNotifications();
      
      if (response.success) {
        setNotifications(response.data);
        console.log('[NOTIFICATION CONTEXT] Notifications fetched:', response.data.length);
      }
    } catch (error) {
      console.error('[NOTIFICATION CONTEXT ERROR] Fetch notifications failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchUnreadCount = async () => {
    try {
      console.log('[NOTIFICATION CONTEXT] Fetching unread count');
      const response = await notificationService.getUnreadCount();
      
      if (response.success) {
        setUnreadCount(response.data.count);
        console.log('[NOTIFICATION CONTEXT] Unread count:', response.data.count);
      }
    } catch (error) {
      console.error('[NOTIFICATION CONTEXT ERROR] Fetch unread count failed:', error);
    }
  };

  const markAsRead = async (notificationId) => {
    try {
      console.log('[NOTIFICATION CONTEXT] Marking as read:', notificationId);
      const response = await notificationService.markAsRead(notificationId);
      
      if (response.success) {
        setNotifications((prev) =>
          prev.map((n) =>
            n._id === notificationId ? { ...n, isRead: true } : n
          )
        );
        setUnreadCount((prev) => Math.max(0, prev - 1));
        console.log('[NOTIFICATION CONTEXT] Marked as read');
      }
    } catch (error) {
      console.error('[NOTIFICATION CONTEXT ERROR] Mark as read failed:', error);
      toast.error('Failed to mark as read');
    }
  };

  const markAllAsRead = async () => {
    try {
      console.log('[NOTIFICATION CONTEXT] Marking all as read');
      const response = await notificationService.markAllAsRead();
      
      if (response.success) {
        setNotifications((prev) =>
          prev.map((n) => ({ ...n, isRead: true }))
        );
        setUnreadCount(0);
        console.log('[NOTIFICATION CONTEXT] All marked as read');
        toast.success('All notifications marked as read');
      }
    } catch (error) {
      console.error('[NOTIFICATION CONTEXT ERROR] Mark all as read failed:', error);
      toast.error('Failed to mark all as read');
    }
  };

  const deleteNotification = async (notificationId) => {
    try {
      console.log('[NOTIFICATION CONTEXT] Deleting notification:', notificationId);
      const response = await notificationService.deleteNotification(notificationId);
      
      if (response.success) {
        const notification = notifications.find((n) => n._id === notificationId);
        setNotifications((prev) =>
          prev.filter((n) => n._id !== notificationId)
        );
        if (notification && !notification.isRead) {
          setUnreadCount((prev) => Math.max(0, prev - 1));
        }
        console.log('[NOTIFICATION CONTEXT] Notification deleted');
        toast.success('Notification deleted');
      }
    } catch (error) {
      console.error('[NOTIFICATION CONTEXT ERROR] Delete notification failed:', error);
      toast.error('Failed to delete notification');
    }
  };

  const value = {
    notifications,
    unreadCount,
    loading,
    fetchNotifications,
    markAsRead,
    markAllAsRead,
    deleteNotification,
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};