import api from './api';

const revenueService = {
  depositRental: async (data) => {
    const response = await api.post('/revenue/deposit', data);
    return response.data;
  },

  getPendingSettlements: async () => {
    const response = await api.get('/revenue/admin/pending');
    return response.data;
  },

  settleCycle: async (cycleId) => {
    const response = await api.post(`/revenue/admin/settle/${cycleId}`);
    return response.data;
  },

  rejectCycle: async (cycleId) => {
    const response = await api.delete(`/revenue/admin/reject/${cycleId}`);
    return response.data;
  },

  getProjectRevenueHistory: async (projectId) => {
    const response = await api.get(`/revenue/history/${projectId}`);
    return response.data;
  }
};

export default revenueService;
