import { FaEnvelope, FaMoneyBill, FaReceipt, FaUserTimes, FaCheck, FaTimes } from 'react-icons/fa';
import { formatDateTime } from '../../utils/helpers';

const NotificationItem = ({ notification, onAccept, onReject, onMarkRead, onDelete }) => {
  const getIcon = () => {
    switch (notification.type) {
      case 'group_invitation':
        return <FaEnvelope className="text-primary-600 text-lg" />;
      case 'settlement':
        return <FaMoneyBill className="text-green-600 text-lg" />;
      case 'expense_added':
        return <FaReceipt className="text-blue-600 text-lg" />;
      case 'member_removed':
        return <FaUserTimes className="text-red-600 text-lg" />;
      default:
        return <FaEnvelope className="text-gray-600 text-lg" />;
    }
  };

  const handleMarkRead = () => {
    if (!notification.isRead) {
      console.log('[NOTIFICATION ITEM] Marking as read:', notification._id);
      onMarkRead(notification._id);
    }
  };

  return (
    <div
      className={`p-4 sm:p-5 border-b border-gray-200 hover:bg-gray-50 transition-colors cursor-pointer ${
        !notification.isRead ? 'bg-blue-50' : ''
      }`}
      onClick={handleMarkRead}
    >
      <div className="flex items-start space-x-3 sm:space-x-4">
        <div className="flex-shrink-0 mt-1 p-2 rounded-full bg-white shadow-sm">
          {getIcon()}
        </div>
        
        <div className="flex-1 min-w-0">
          <p className={`text-sm sm:text-base leading-relaxed ${notification.isRead ? 'text-gray-700' : 'text-gray-900 font-medium'}`}>
            {notification.message}
          </p>
          <p className="text-xs sm:text-sm text-gray-500 mt-2">{formatDateTime(notification.createdAt)}</p>

          {/* Group Invitation Actions */}
          {notification.type === 'group_invitation' && notification.metadata?.groupId && (
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 mt-4">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  console.log('[NOTIFICATION ITEM] Accepting invitation');
                  onAccept(notification.metadata.groupId, notification._id);
                }}
                className="flex items-center justify-center space-x-2 px-4 py-2.5 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 transition-colors shadow-sm"
                title="Accept invitation"
              >
                <FaCheck className="text-sm" />
                <span>Accept Invitation</span>
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  console.log('[NOTIFICATION ITEM] Rejecting invitation');
                  onReject(notification.metadata.groupId, notification._id);
                }}
                className="flex items-center justify-center space-x-2 px-4 py-2.5 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700 transition-colors shadow-sm"
                title="Reject invitation"
              >
                <FaTimes className="text-sm" />
                <span>Reject</span>
              </button>
            </div>
          )}
        </div>

        {!notification.isRead && (
          <div className="flex-shrink-0">
            <div className="w-3 h-3 bg-primary-600 rounded-full pulse" title="Unread notification"></div>
          </div>
        )}
      </div>
    </div>
  );
};

export default NotificationItem;