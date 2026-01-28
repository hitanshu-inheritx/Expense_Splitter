import api from './api';

export const expenseService = {
  addExpense: async (groupId, expenseData) => {
    try {
      console.log('[EXPENSE SERVICE] Add expense to group:', groupId);
      const response = await api.post(`/groups/${groupId}/expenses`, expenseData);
      return response.data;
    } catch (error) {
      console.error('[EXPENSE SERVICE ERROR] Add expense failed:', error);
      throw error.response?.data || { message: 'Failed to add expense' };
    }
  },

  getGroupExpenses: async (groupId) => {
    try {
      console.log('[EXPENSE SERVICE] Get group expenses:', groupId);
      const response = await api.get(`/groups/${groupId}/expenses`);
      return response.data;
    } catch (error) {
      console.error('[EXPENSE SERVICE ERROR] Get expenses failed:', error);
      throw error.response?.data || { message: 'Failed to fetch expenses' };
    }
  },
};