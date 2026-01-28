import { useNavigate } from 'react-router-dom';
import { FaUsers, FaArrowRight } from 'react-icons/fa';
import { formatCurrency, getBalanceStatus, getBalanceColor, getStatusBadgeColor } from '../../utils/helpers';

const GroupCard = ({ group }) => {
  const navigate = useNavigate();
  
  const status = getBalanceStatus(group.userBalance);
  const balanceColor = getBalanceColor(group.userBalance);
  const badgeColor = getStatusBadgeColor(status);

  const handleClick = () => {
    console.log('[GROUP CARD] Navigating to group:', group._id);
    navigate(`/group/${group._id}`);
  };

  return (
    <div
      onClick={handleClick}
      className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-lg hover:border-primary-300 transition-all cursor-pointer group"
      title={`View ${group.name} details`}
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-900 group-hover:text-primary-600 transition-colors">
            {group.name}
          </h3>
          {group.description && (
            <p className="text-sm text-gray-600 mt-1 line-clamp-2">{group.description}</p>
          )}
        </div>
        <span className={`px-3 py-1 rounded-full text-xs font-medium ${badgeColor}`}>
          {status === 'gets' ? 'Gets' : status === 'owes' ? 'Owes' : 'Settled'}
        </span>
      </div>

      <div className="flex items-center justify-between pt-4 border-t border-gray-100">
        <div className="flex items-center space-x-2 text-gray-600">
          <FaUsers className="text-sm" />
          <span className="text-sm">
            {group.members?.length || 0} member{group.members?.length !== 1 ? 's' : ''}
          </span>
        </div>

        <div className="flex items-center space-x-3">
          <div className="text-right">
            <p className="text-xs text-gray-500 mb-1">Your balance</p>
            <p className={`text-lg font-bold ${balanceColor}`}>
              {formatCurrency(Math.abs(group.userBalance || 0))}
            </p>
          </div>
          <FaArrowRight className="text-gray-400 group-hover:text-primary-600 transition-colors" />
        </div>
      </div>

      {group.status === 'completed' && (
        <div className="mt-4 pt-4 border-t border-gray-100">
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
            Completed
          </span>
        </div>
      )}
    </div>
  );
};

export default GroupCard;