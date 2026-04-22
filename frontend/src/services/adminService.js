import api from './api';

export const adminService = {
  getDashboardStats: async () => {
    const response = await api.get('/admin/dashboard-stats');
    return response.data;
  },

  getKYCApplications: async (status = 'all', skip = 0, limit = 50) => {
    const response = await api.get(`/admin/kyc-applications?status=${status}&skip=${skip}&limit=${limit}`);
    return response.data;
  },

  claimKYC: async (kycId) => {
    const response = await api.post(`/admin/kyc-applications/${kycId}/claim`);
    return response.data;
  },

  releaseKYC: async (kycId) => {
    const response = await api.post(`/admin/kyc-applications/${kycId}/release`);
    return response.data;
  },

  reviewKYC: async (kycId, reviewData) => {
    const response = await api.post(`/admin/kyc-applications/${kycId}/review`, reviewData);
    return response.data;
  },

  verifyBuilder: async (builderId, verificationData) => {
    const response = await api.post(`/admin/builders/${builderId}/verify`, verificationData);
    return response.data;
  },

  getPendingBuilders: async () => {
    const response = await api.get('/admin/builders/pending');
    return response.data;
  },

  verifyMilestone: async (projectId, milestoneId, reviewData) => {
    const response = await api.post(`/admin/projects/${projectId}/milestones/${milestoneId}/verify`, reviewData);
    return response.data;
  },

  updateProjectStatus: async (projectId, statusData) => {
    const response = await api.post(`/admin/projects/${projectId}/status`, statusData);
    return response.data;
  },

  adjustWallet: async (userId, adjustData) => {
    const response = await api.post(`/admin/users/${userId}/wallet/adjust`, adjustData);
    return response.data;
  },

  approveIPO: async (projectId) => {
    const response = await api.post(`/admin/projects/${projectId}/approve_ipo`);
    return response.data;
  },

  triggerSecondaryMarket: async (projectId) => {
    const response = await api.post(`/admin/projects/${projectId}/trigger_ipo_completion`);
    return response.data;
  },

  // Macro Analytics Management
  getMacroData: async () => {
    const response = await api.get('/admin/analytics/macro');
    return response.data;
  },

  createMacroData: async (data) => {
    const response = await api.post('/admin/analytics/macro', data);
    return response.data;
  },

  updateMacroData: async (pincode, data) => {
    const response = await api.put(`/admin/analytics/macro/${pincode}`, data);
    return response.data;
  },

  deleteMacroData: async (pincode) => {
    const response = await api.delete(`/admin/analytics/macro/${pincode}`);
    return response.data;
  }
};

export default adminService;
