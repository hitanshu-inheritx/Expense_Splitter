import api from './api';

export const dashboardService = {
  getDashboardSummary: async () => {
    try {
      console.log('[DASHBOARD SERVICE] Get dashboard summary');
      const response = await api.get('/users/dashboard');
      return response.data;
    } catch (error) {
      console.error('[DASHBOARD SERVICE ERROR] Get summary failed:', error);
      throw error.response?.data || { message: 'Failed to fetch dashboard summary' };
    }
  },
};