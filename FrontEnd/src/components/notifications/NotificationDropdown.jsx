import { useEffect, useRef } from 'react';
import { FaBell, FaCheckDouble, FaInbox, FaTimes } from 'react-icons/fa';
import { useNotification } from '../../context/NotificationContext';
import { groupService } from '../../services/groupService';
import { toast } from 'react-toastify';
import NotificationItem from './NotificationItem';

const NotificationDropdown = ({ onClose }) => {
  const dropdownRef = useRef(null);
  const { notifications, markAsRead, markAllAsRead, deleteNotification, fetchNotifications } = useNotification();

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [onClose]);

  const handleAcceptInvitation = async (groupId, notificationId) => {
    try {
      console.log('[NOTIFICATION DROPDOWN] Accepting invitation:', groupId);
      const response = await groupService.acceptInvitation(groupId);
      
      if (response.success) {
        toast.success('Invitation accepted!');
        await deleteNotification(notificationId);
        await fetchNotifications();
      }
    } catch (error) {
      console.error('[NOTIFICATION DROPDOWN ERROR] Accept invitation failed:', error);
      toast.error(error.message || 'Failed to accept invitation');
    }
  };

  const handleRejectInvitation = async (groupId, notificationId) => {
    try {
      console.log('[NOTIFICATION DROPDOWN] Rejecting invitation:', groupId);
      const response = await groupService.rejectInvitation(groupId);
      
      if (response.success) {
        toast.info('Invitation rejected');
        await deleteNotification(notificationId);
        await fetchNotifications();
      }
    } catch (error) {
      console.error('[NOTIFICATION DROPDOWN ERROR] Reject invitation failed:', error);
      toast.error(error.message || 'Failed to reject invitation');
    }
  };

  const handleMarkAllRead = async () => {
    console.log('[NOTIFICATION DROPDOWN] Marking all as read');
    await markAllAsRead();
  };

  return (
    <>
      {/* Mobile Overlay - Only show on mobile */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
        onClick={onClose}
      />

      {/* Dropdown */}
      <div
        ref={dropdownRef}
        className="fixed md:absolute inset-x-0 top-16 md:top-auto md:right-0 md:left-auto md:inset-x-auto md:mt-2 w-full md:w-[420px] lg:w-[480px] bg-white md:rounded-xl shadow-2xl border-t md:border border-gray-200 z-50 animate-slide-in"
        style={{ maxHeight: 'calc(100vh - 5rem)' }}
      >
        {/* Header */}
        <div className="sticky top-0 bg-white md:rounded-t-xl z-10 border-b border-gray-200">
          <div className="flex items-center justify-between p-4 md:p-5">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-primary-100 rounded-lg">
                <FaBell className="text-primary-600 text-lg md:text-xl" />
              </div>
              <div>
                <h3 className="font-bold text-gray-900 text-base md:text-lg">Notifications</h3>
                <p className="text-xs text-gray-500 mt-0.5">
                  {notifications.filter(n => !n.isRead).length} unread
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              {notifications.length > 0 && (
                <button
                  onClick={handleMarkAllRead}
                  className="text-xs md:text-sm text-primary-600 hover:text-primary-700 font-semibold flex items-center space-x-1.5 px-2 md:px-3 py-2 hover:bg-primary-50 rounded-lg transition-colors"
                  title="Mark all notifications as read"
                >
                  <FaCheckDouble className="text-sm md:text-base" />
                  <span className="hidden sm:inline">Mark read</span>
                </button>
              )}
              <button
                onClick={onClose}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors md:hidden"
                title="Close notifications"
              >
                <FaTimes className="text-lg" />
              </button>
            </div>
          </div>
        </div>

        {/* Notifications List */}
        <div className="overflow-y-auto" style={{ maxHeight: 'calc(100vh - 12rem)' }}>
          {notifications.length === 0 ? (
            <div className="text-center py-12 md:py-16 px-4">
              <div className="inline-flex items-center justify-center w-16 md:w-20 h-16 md:h-20 bg-gray-100 rounded-full mb-3 md:mb-4">
                <FaInbox className="text-3xl md:text-4xl text-gray-400" />
              </div>
              <h4 className="text-base md:text-lg font-semibold text-gray-900 mb-1 md:mb-2">No notifications</h4>
              <p className="text-sm text-gray-500">You're all caught up!</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {notifications.map((notification) => (
                <NotificationItem
                  key={notification._id}
                  notification={notification}
                  onAccept={handleAcceptInvitation}
                  onReject={handleRejectInvitation}
                  onMarkRead={markAsRead}
                  onDelete={deleteNotification}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default NotificationDropdown;