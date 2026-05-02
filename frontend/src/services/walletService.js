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

  initiateWithdrawal: async (amount, bank_id) => {
    const response = await api.post('/wallet/withdraw/init', { amount, bank_id });
    return response.data;
  },

  verifyWithdrawal: async (otp_code) => {
    const response = await api.post('/wallet/withdraw/verify', { otp_code });
    return response.data;
  },
  
  getBuilderWalletContext: async () => {
    const response = await api.get('/wallet/builder');
    return response.data;
  },

  initiateBuilderWithdrawal: async (amount, bank_id) => {
    const response = await api.post('/wallet/builder/withdraw/init', { amount, bank_id });
    return response.data;
  },

  verifyBuilderWithdrawal: async (otp_code) => {
    const response = await api.post('/wallet/builder/withdraw/verify', { otp_code });
    return response.data;
  }
};

export default walletService;
