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
  }
};

export default walletService;
