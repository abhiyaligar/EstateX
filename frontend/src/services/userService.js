import api from './api';

export const userService = {
  getProfile: async () => {
    const response = await api.get('/users/profile');
    return response.data;
  },

  updateProfile: async (data) => {
    const response = await api.patch('/users/profile', data);
    return response.data;
  },

  getBankAccounts: async () => {
    const response = await api.get('/users/bank-accounts');
    return response.data;
  },

  addBankAccount: async (data) => {
    const response = await api.post('/users/bank-accounts', data);
    return response.data;
  },

  removeBankAccount: async (bankId) => {
    const response = await api.delete(`/users/bank-accounts/${bankId}`);
    return response.data;
  }
};

export default userService;
