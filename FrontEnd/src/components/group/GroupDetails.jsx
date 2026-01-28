import { useState } from 'react';
import { FaEdit, FaUserPlus, FaTrash, FaCheck, FaDownload } from 'react-icons/fa';
import { useAuth } from '../../context/AuthContext';
import { formatDate } from '../../utils/helpers';
import Modal from '../common/Modal';
import InviteUsersForm from '../forms/InviteUsersForm';

const GroupDetails = ({ group, onUpdate, onDelete, onInvite, onExportPDF }) => {
  const [showEditModal, setShowEditModal] = useState(false);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [editData, setEditData] = useState({
    name: group.name,
    description: group.description || '',
  });
  const { user } = useAuth();
  const isAdmin = group.admin._id === user._id;

  const handleEdit = async (e) => {
    e.preventDefault();
    console.log('[GROUP DETAILS] Updating group');
    await onUpdate(editData);
    setShowEditModal(false);
  };

  const handleDelete = async () => {
    console.log('[GROUP DETAILS] Deleting group');
    await onDelete();
    setShowDeleteModal(false);
  };

  const handleInviteSuccess = () => {
    setShowInviteModal(false);
    onInvite();
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <div className="flex items-start justify-between mb-6">
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">{group.name}</h1>
          {group.description && (
            <p className="text-gray-600">{group.description}</p>
          )}
          <div className="flex items-center space-x-4 mt-3 text-sm text-gray-500">
            <span>Created {formatDate(group.createdAt)}</span>
            <span>•</span>
            <span>{group.members.length} members</span>
            {group.status === 'completed' && (
              <>
                <span>•</span>
                <span className="text-green-600 font-medium">Completed</span>
              </>
            )}
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={onExportPDF}
            className="p-2 text-gray-600 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
            title="Export group report as PDF"
          >
            <FaDownload className="text-lg" />
          </button>
          
          {isAdmin && (
            <>
              <button
                onClick={() => setShowInviteModal(true)}
                className="p-2 text-gray-600 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                title="Invite members to group"
              >
                <FaUserPlus className="text-lg" />
              </button>
              <button
                onClick={() => setShowEditModal(true)}
                className="p-2 text-gray-600 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                title="Edit group details"
              >
                <FaEdit className="text-lg" />
              </button>
              <button
                onClick={() => setShowDeleteModal(true)}
                className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                title="Delete group (only if all balances are zero)"
              >
                <FaTrash className="text-lg" />
              </button>
            </>
          )}
        </div>
      </div>

      {/* Admin Badge */}
      <div className="flex items-center space-x-2 text-sm">
        <span className="text-gray-600">Admin:</span>
        <span className="font-medium text-gray-900">{group.admin.username}</span>
      </div>

      {/* Edit Modal */}
      <Modal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        title="Edit Group"
        size="small"
      >
        <form onSubmit={handleEdit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Group Name
            </label>
            <input
              type="text"
              value={editData.name}
              onChange={(e) => setEditData({ ...editData, name: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              required
              minLength={3}
              title="Enter group name (min 3 characters)"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description (Optional)
            </label>
            <textarea
              value={editData.description}
              onChange={(e) => setEditData({ ...editData, description: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              rows={3}
              title="Enter group description (optional)"
            />
          </div>
          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={() => setShowEditModal(false)}
              className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
            >
              Save Changes
            </button>
          </div>
        </form>
      </Modal>

      {/* Invite Modal */}
      <Modal
        isOpen={showInviteModal}
        onClose={() => setShowInviteModal(false)}
        title="Invite Members"
        size="medium"
      >
        <InviteUsersForm
          groupId={group._id}
          existingMembers={group.members.map(m => m.user._id)}
          onSuccess={handleInviteSuccess}
          onCancel={() => setShowInviteModal(false)}
        />
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title="Delete Group"
        size="small"
      >
        <div className="space-y-4">
          <p className="text-gray-600">
            Are you sure you want to delete this group? This action cannot be undone.
            All members must have zero balance to delete the group.
          </p>
          <div className="flex justify-end space-x-3">
            <button
              onClick={() => setShowDeleteModal(false)}
              className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleDelete}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              Delete Group
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default GroupDetails;