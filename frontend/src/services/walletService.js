import api from './api';

export const walletService = {
  getWalletContext: async () => {
    const response = await api.get('/wallet');
    return response.data;
  },

  depositFunds: async (amount, bank_id) => {
    const response = await api.post('/wallet/deposit', { amount, bank_id });
    return response.data;
  },

  withdrawFunds: async (amount, bank_id) => {
    const response = await api.post('/wallet/withdraw', { amount, bank_id });
    return response.data;
  },
  
  getBuilderWalletContext: async () => {
    const response = await api.get('/wallet/builder');
    return response.data;
  },

  withdrawBuilderFunds: async (amount, bank_id, otp) => {
    const response = await api.post('/wallet/builder/withdraw', { amount, bank_id, reference_id: otp });
    return response.data;
  }
};

export default walletService;
