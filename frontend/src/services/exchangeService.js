import api from './api';

export const exchangeService = {
  getPortfolio: async () => {
    const response = await api.get('/exchange/portfolio');
    return response.data;
  },

  subscribeToIPO: async (projectId, quantity) => {
    const response = await api.post(`/exchange/ipo/${projectId}/subscribe?quantity=${quantity}`);
    return response.data;
  },

  placeOrder: async (orderData) => {
    const response = await api.post('/exchange/orders', orderData);
    return response.data;
  },

  getOpenOrders: async (status = 'open') => {
    const response = await api.get(`/exchange/orders?status=${status}`);
    return response.data;
  },

  getTradeHistory: async (projectId) => {
    const response = await api.get(`/exchange/trades/${projectId}`);
    return response.data;
  },

  getPublicOrderBook: async (projectId) => {
    const response = await api.get(`/exchange/orders/public/${projectId}`);
    return response.data;
  },

  cancelOrder: async (orderId) => {
    const response = await api.post(`/exchange/orders/${orderId}/cancel`);
    return response.data;
  },

  getOHLCV: async (projectId, interval = '1h') => {
    const response = await api.get(`/exchange/trades/${projectId}/ohlcv?interval=${interval}`);
    return response.data;
  },

  getMacroAnalytics: async (pincode) => {
    const response = await api.get(`/analytics/macro/${pincode}`);
    return response.data;
  }
};

export default exchangeService;
