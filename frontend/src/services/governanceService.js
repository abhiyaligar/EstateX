import api from './api';

const governanceService = {
  // Investor Routes
  getProposals: async (projectId) => {
    const response = await api.get(`/governance/proposals/${projectId}`);
    return response.data;
  },

  castVote: async (proposalId, optionIndex) => {
    const response = await api.post(`/governance/proposals/${proposalId}/vote`, { 
      option_index: optionIndex 
    });
    return response.data;
  },

  // Admin Routes
  getAllProposals: async () => {
    const response = await api.get('/governance/admin/proposals');
    return response.data;
  },

  createProposal: async (proposalData) => {
    const response = await api.post('/governance/admin/proposals', proposalData);
    return response.data;
  },

  updateProposalStatus: async (proposalId, status, resultIndex = null) => {
    const response = await api.put(`/governance/admin/proposals/${proposalId}/status`, null, {
      params: { status, result_index: resultIndex }
    });
    return response.data;
  }
};

export default governanceService;
