import api from './api';

export const kycService = {
  getStatus: async () => {
    const response = await api.get('/kyc/status');
    return response.data;
  },

  initiateKYC: async (kycData) => {
    const response = await api.post('/kyc/initiate', kycData);
    return response.data;
  },

  verifyOTP: async (otp) => {
    const response = await api.post('/kyc/verify-otp', { otp });
    return response.data;
  },

  verifyPAN: async (pan) => {
    const response = await api.post('/kyc/verify-pan', { pan });
    return response.data;
  }
};

export default kycService;
