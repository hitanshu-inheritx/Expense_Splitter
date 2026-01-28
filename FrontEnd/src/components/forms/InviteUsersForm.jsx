import { useState } from 'react';
import { FaSearch, FaUser, FaPlus } from 'react-icons/fa';
import { groupService } from '../../services/groupService';
import { debounce } from '../../utils/helpers';
import { toast } from 'react-toastify';

const InviteUsersForm = ({ groupId, existingMembers, onSuccess, onCancel }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [searching, setSearching] = useState(false);
  const [loading, setLoading] = useState(false);

  const searchUsers = debounce(async (query) => {
    if (query.length < 2) {
      setSearchResults([]);
      return;
    }

    try {
      console.log('[INVITE FORM] Searching users:', query);
      setSearching(true);
      const response = await groupService.searchUsers(query);
      
      if (response.success) {
        // Filter out existing members
        const filtered = response.data.filter(
          (user) => !existingMembers.includes(user._id)
        );
        setSearchResults(filtered);
        console.log('[INVITE FORM] Found users:', filtered.length);
      }
    } catch (error) {
      console.error('[INVITE FORM ERROR]', error);
    } finally {
      setSearching(false);
    }
  }, 500);

  const handleSearchChange = (e) => {
    const query = e.target.value;
    setSearchQuery(query);
    searchUsers(query);
  };

  const handleToggleUser = (user) => {
    setSelectedUsers((prev) => {
      const isSelected = prev.find((u) => u._id === user._id);
      if (isSelected) {
        return prev.filter((u) => u._id !== user._id);
      } else {
        return [...prev, user];
      }
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log('[INVITE FORM] Form submitted');

    if (selectedUsers.length === 0) {
      toast.warning('Please select at least one user to invite');
      return;
    }

    try {
      setLoading(true);
      const userIds = selectedUsers.map((u) => u._id);
      const response = await groupService.inviteUsers(groupId, userIds);
      
      if (response.success) {
        console.log('[INVITE FORM] Users invited successfully');
        toast.success(response.message);
        onSuccess();
      }
    } catch (error) {
      console.error('[INVITE FORM ERROR]', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Search Box */}
      <div>
        <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-1">
          Search Users
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <FaSearch className="text-gray-400" />
          </div>
          <input
            id="search"
            type="text"
            value={searchQuery}
            onChange={handleSearchChange}
            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            placeholder="Search by name or email"
            title="Search users by name or email (min 2 characters)"
          />
        </div>
      </div>

      {/* Search Results */}
      {searchQuery.length >= 2 && (
        <div className="border border-gray-300 rounded-lg max-h-48 overflow-y-auto">
          {searching ? (
            <div className="p-4 text-center text-gray-500">Searching...</div>
          ) : searchResults.length === 0 ? (
            <div className="p-4 text-center text-gray-500">No users found</div>
          ) : (
            <div className="divide-y divide-gray-200">
              {searchResults.map((user) => {
                const isSelected = selectedUsers.find((u) => u._id === user._id);
                return (
                  <label
                    key={user._id}
                    className={`flex items-center justify-between p-3 cursor-pointer hover:bg-gray-50 ${
                      isSelected ? 'bg-primary-50' : ''
                    }`}
                    title={`Toggle ${user.username}`}
                  >
                    <div className="flex items-center space-x-3">
                      {user.profileImage ? (
                        <img
                          src={user.profileImage}
                          alt={user.username}
                          className="w-8 h-8 rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                          <FaUser className="text-gray-500 text-xs" />
                        </div>
                      )}
                      <div>
                        <p className="text-sm font-medium text-gray-900">{user.username}</p>
                        <p className="text-xs text-gray-500">{user.email}</p>
                      </div>
                    </div>
                    <input
                      type="checkbox"
                      checked={!!isSelected}
                      onChange={() => handleToggleUser(user)}
                      className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                    />
                  </label>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Selected Users */}
      {selectedUsers.length > 0 && (
        <div>
          <p className="text-sm font-medium text-gray-700 mb-2">
            Selected Users ({selectedUsers.length})
          </p>
          <div className="flex flex-wrap gap-2">
            {selectedUsers.map((user) => (
              <div
                key={user._id}
                className="flex items-center space-x-2 bg-primary-100 text-primary-800 px-3 py-1 rounded-full text-sm"
              >
                <span>{user.username}</span>
                <button
                  type="button"
                  onClick={() => handleToggleUser(user)}
                  className="hover:text-primary-900"
                  title={`Remove ${user.username}`}
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex justify-end space-x-3 pt-4">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={loading || selectedUsers.length === 0}
          className="flex items-center space-x-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <FaPlus />
          <span>{loading ? 'Inviting...' : `Invite ${selectedUsers.length} User${selectedUsers.length !== 1 ? 's' : ''}`}</span>
        </button>
      </div>
    </form>
  );
};

export default InviteUsersForm;