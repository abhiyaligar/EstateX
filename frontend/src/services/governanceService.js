import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1';

const getAuthHeader = () => {
  const token = localStorage.getItem('token');
  return { Authorization: `Bearer ${token}` };
};

const governanceService = {
  // Investor Routes
  getProposals: async (projectId) => {
    const response = await axios.get(`${API_URL}/governance/proposals/${projectId}`, {
      headers: getAuthHeader()
    });
    return response.data;
  },

  castVote: async (proposalId, optionIndex) => {
    const response = await axios.post(`${API_URL}/governance/proposals/${proposalId}/vote`, 
      { option_index: optionIndex },
      { headers: getAuthHeader() }
    );
    return response.data;
  },

  // Admin Routes
  getAllProposals: async () => {
    const response = await axios.get(`${API_URL}/governance/admin/proposals`, {
      headers: getAuthHeader()
    });
    return response.data;
  },

  createProposal: async (proposalData) => {
    const response = await axios.post(`${API_URL}/governance/admin/proposals`, 
      proposalData,
      { headers: getAuthHeader() }
    );
    return response.data;
  },

  updateProposalStatus: async (proposalId, status, resultIndex = null) => {
    const response = await axios.put(`${API_URL}/governance/admin/proposals/${proposalId}/status`, 
      null,
      { 
        params: { status, result_index: resultIndex },
        headers: getAuthHeader() 
      }
    );
    return response.data;
  }
};

export default governanceService;
