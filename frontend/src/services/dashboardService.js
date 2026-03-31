import api from './api';

export const dashboardService = {
  getWalletInfo: async () => {
    const response = await api.get('/wallet');
    return response.data;
  },

  getPortfolio: async () => {
    const response = await api.get('/exchange/portfolio');
    return response.data;
  },

  getDashboardData: async () => {
    const [wallet, portfolio] = await Promise.all([
      dashboardService.getWalletInfo(),
      dashboardService.getPortfolio()
    ]);

    return {
      wallet,
      portfolio
    };
  }
};

export default dashboardService;
