import { useState } from 'react';
import { FaUser, FaTrash, FaCrown } from 'react-icons/fa';
import { useAuth } from '../../context/AuthContext';
import { formatCurrency, getBalanceColor } from '../../utils/helpers';
import Modal from '../common/Modal';

const MemberList = ({ group, onRemoveMember }) => {
  const [showRemoveModal, setShowRemoveModal] = useState(false);
  const [selectedMember, setSelectedMember] = useState(null);
  const { user } = useAuth();
  const isAdmin = group.admin._id === user._id;

  const handleRemoveClick = (member) => {
    console.log('[MEMBER LIST] Remove member clicked:', member.user.username);
    setSelectedMember(member);
    setShowRemoveModal(true);
  };

  const handleRemove = async () => {
    if (selectedMember) {
      console.log('[MEMBER LIST] Removing member:', selectedMember.user._id);
      await onRemoveMember(selectedMember.user._id);
      setShowRemoveModal(false);
      setSelectedMember(null);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <h2 className="text-xl font-bold text-gray-900 mb-4">Members</h2>
      
      <div className="space-y-3">
        {group.members.map((member) => {
          const isCurrentUser = member.user._id === user._id;
          const isMemberAdmin = member.user._id === group.admin._id;
          const balanceColor = getBalanceColor(member.balance);

          return (
            <div
              key={member.user._id}
              className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg transition-colors"
            >
              <div className="flex items-center space-x-3 flex-1">
                {member.user.profileImage ? (
                  <img
                    src={member.user.profileImage}
                    alt={member.user.username}
                    className="w-10 h-10 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                    <FaUser className="text-primary-600" />
                  </div>
                )}
                <div className="flex-1">
                  <div className="flex items-center space-x-2">
                    <p className="font-medium text-gray-900">
                      {member.user.username}
                      {isCurrentUser && ' (You)'}
                    </p>
                    {isMemberAdmin && (
                      <FaCrown className="text-yellow-500" title="Group Admin" />
                    )}
                  </div>
                  <p className="text-sm text-gray-500">{member.user.email}</p>
                </div>
              </div>

              <div className="flex items-center space-x-4">
                <div className="text-right">
                  <p className={`font-semibold ${balanceColor}`}>
                    {formatCurrency(Math.abs(member.balance))}
                  </p>
                  <p className="text-xs text-gray-500">
                    {member.balance > 0.01 ? 'Gets' : member.balance < -0.01 ? 'Owes' : 'Settled'}
                  </p>
                </div>

                {isAdmin && !isMemberAdmin && !isCurrentUser && (
                  <button
                    onClick={() => handleRemoveClick(member)}
                    className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    title={`Remove ${member.user.username} from group (only if balance is zero)`}
                  >
                    <FaTrash />
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Pending Invitations */}
      {group.pendingInvitations && group.pendingInvitations.length > 0 && (
        <div className="mt-6 pt-6 border-t border-gray-200">
          <h3 className="text-sm font-semibold text-gray-700 mb-3">Pending Invitations</h3>
          <div className="space-y-2">
            {group.pendingInvitations.map((invitation) => (
              <div
                key={invitation.user._id}
                className="flex items-center justify-between p-2 bg-gray-50 rounded-lg"
              >
                <div className="flex items-center space-x-2">
                  <FaUser className="text-gray-400" />
                  <span className="text-sm text-gray-700">{invitation.user.username}</span>
                </div>
                <span className="text-xs text-gray-500 bg-yellow-100 px-2 py-1 rounded">
                  Pending
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Remove Confirmation Modal */}
      <Modal
        isOpen={showRemoveModal}
        onClose={() => setShowRemoveModal(false)}
        title="Remove Member"
        size="small"
      >
        <div className="space-y-4">
          <p className="text-gray-600">
            Are you sure you want to remove <strong>{selectedMember?.user.username}</strong> from this group?
            The member must have a zero balance to be removed.
          </p>
          <div className="flex justify-end space-x-3">
            <button
              onClick={() => setShowRemoveModal(false)}
              className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleRemove}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              Remove Member
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default MemberList;