import api from './api';

export const settlementService = {
  recordSettlement: async (groupId, settlementData) => {
    try {
      console.log('[SETTLEMENT SERVICE] Record settlement in group:', groupId);
      const response = await api.post(`/groups/${groupId}/settlements`, settlementData);
      return response.data;
    } catch (error) {
      console.error('[SETTLEMENT SERVICE ERROR] Record settlement failed:', error);
      throw error.response?.data || { message: 'Failed to record settlement' };
    }
  },

  getGroupSettlements: async (groupId) => {
    try {
      console.log('[SETTLEMENT SERVICE] Get group settlements:', groupId);
      const response = await api.get(`/groups/${groupId}/settlements`);
      return response.data;
    } catch (error) {
      console.error('[SETTLEMENT SERVICE ERROR] Get settlements failed:', error);
      throw error.response?.data || { message: 'Failed to fetch settlements' };
    }
  },

  getSettlementSummary: async (groupId) => {
    try {
      console.log('[SETTLEMENT SERVICE] Get settlement summary:', groupId);
      const response = await api.get(`/groups/${groupId}/settlement-summary`);
      return response.data;
    } catch (error) {
      console.error('[SETTLEMENT SERVICE ERROR] Get summary failed:', error);
      throw error.response?.data || { message: 'Failed to fetch settlement summary' };
    }
  },
};