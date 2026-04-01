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

  verifyOTP: async (otp, kyc_session_id) => {
    const response = await api.post('/kyc/verify-otp', { otp, kyc_session_id });
    return response.data;
  },

  verifyPAN: async (pan, kyc_session_id) => {
    const response = await api.post('/kyc/verify-pan', { pan, kyc_session_id });
    return response.data;
  }
};

export default kycService;
