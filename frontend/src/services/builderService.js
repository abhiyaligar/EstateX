import api from './api';

export const builderService = {
  getProfile: async () => {
    const response = await api.get('/builders/profile');
    return response.data;
  },

  updateProfile: async (profileData) => {
    const response = await api.post('/builders/profile', profileData);
    return response.data;
  },

  submitForReview: async () => {
    const response = await api.post('/builders/submit-review');
    return response.data;
  },

  updateBankAccount: async (bankData) => {
    const response = await api.put('/builders/bank-account', bankData);
    return response.data;
  }
};

export default builderService;
