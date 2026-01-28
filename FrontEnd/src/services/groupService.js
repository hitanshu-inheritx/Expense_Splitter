import api from './api';

export const groupService = {
  createGroup: async (groupData) => {
    try {
      console.log('[GROUP SERVICE] Create group');
      const response = await api.post('/groups', groupData);
      return response.data;
    } catch (error) {
      console.error('[GROUP SERVICE ERROR] Create group failed:', error);
      throw error.response?.data || { message: 'Failed to create group' };
    }
  },

  getMyGroups: async () => {
    try {
      console.log('[GROUP SERVICE] Get my groups');
      const response = await api.get('/groups');
      return response.data;
    } catch (error) {
      console.error('[GROUP SERVICE ERROR] Get groups failed:', error);
      throw error.response?.data || { message: 'Failed to fetch groups' };
    }
  },

  getGroupById: async (groupId) => {
    try {
      console.log('[GROUP SERVICE] Get group by ID:', groupId);
      const response = await api.get(`/groups/${groupId}`);
      return response.data;
    } catch (error) {
      console.error('[GROUP SERVICE ERROR] Get group failed:', error);
      throw error.response?.data || { message: 'Failed to fetch group' };
    }
  },

  updateGroup: async (groupId, groupData) => {
    try {
      console.log('[GROUP SERVICE] Update group:', groupId);
      const response = await api.put(`/groups/${groupId}`, groupData);
      return response.data;
    } catch (error) {
      console.error('[GROUP SERVICE ERROR] Update group failed:', error);
      throw error.response?.data || { message: 'Failed to update group' };
    }
  },

  inviteUsers: async (groupId, userIds) => {
    try {
      console.log('[GROUP SERVICE] Invite users to group:', groupId);
      const response = await api.post(`/groups/${groupId}/invite`, { userIds });
      return response.data;
    } catch (error) {
      console.error('[GROUP SERVICE ERROR] Invite users failed:', error);
      throw error.response?.data || { message: 'Failed to invite users' };
    }
  },

  acceptInvitation: async (groupId) => {
    try {
      console.log('[GROUP SERVICE] Accept invitation:', groupId);
      const response = await api.post(`/groups/${groupId}/accept-invitation`);
      return response.data;
    } catch (error) {
      console.error('[GROUP SERVICE ERROR] Accept invitation failed:', error);
      throw error.response?.data || { message: 'Failed to accept invitation' };
    }
  },

  rejectInvitation: async (groupId) => {
    try {
      console.log('[GROUP SERVICE] Reject invitation:', groupId);
      const response = await api.post(`/groups/${groupId}/reject-invitation`);
      return response.data;
    } catch (error) {
      console.error('[GROUP SERVICE ERROR] Reject invitation failed:', error);
      throw error.response?.data || { message: 'Failed to reject invitation' };
    }
  },

  removeMember: async (groupId, userId) => {
    try {
      console.log('[GROUP SERVICE] Remove member:', groupId, userId);
      const response = await api.delete(`/groups/${groupId}/members/${userId}`);
      return response.data;
    } catch (error) {
      console.error('[GROUP SERVICE ERROR] Remove member failed:', error);
      throw error.response?.data || { message: 'Failed to remove member' };
    }
  },

  leaveGroup: async (groupId) => {
    try {
      console.log('[GROUP SERVICE] Leave group:', groupId);
      const response = await api.post(`/groups/${groupId}/leave`);
      return response.data;
    } catch (error) {
      console.error('[GROUP SERVICE ERROR] Leave group failed:', error);
      throw error.response?.data || { message: 'Failed to leave group' };
    }
  },

  deleteGroup: async (groupId) => {
    try {
      console.log('[GROUP SERVICE] Delete group:', groupId);
      const response = await api.delete(`/groups/${groupId}`);
      return response.data;
    } catch (error) {
      console.error('[GROUP SERVICE ERROR] Delete group failed:', error);
      throw error.response?.data || { message: 'Failed to delete group' };
    }
  },

  completeGroup: async (groupId) => {
    try {
      console.log('[GROUP SERVICE] Complete group:', groupId);
      const response = await api.post(`/groups/${groupId}/complete`);
      return response.data;
    } catch (error) {
      console.error('[GROUP SERVICE ERROR] Complete group failed:', error);
      throw error.response?.data || { message: 'Failed to complete group' };
    }
  },

  searchUsers: async (query) => {
    try {
      console.log('[GROUP SERVICE] Search users:', query);
      const response = await api.get(`/users/search?query=${query}`);
      return response.data;
    } catch (error) {
      console.error('[GROUP SERVICE ERROR] Search users failed:', error);
      throw error.response?.data || { message: 'Failed to search users' };
    }
  },
};