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

  getBuilderWalletInfo: async () => {
    const response = await api.get('/wallet/builder');
    return response.data;
  },

  getDashboardData: async (isBuilder = false) => {
    const promises = [
      dashboardService.getWalletInfo(),
      dashboardService.getPortfolio()
    ];

    if (isBuilder) {
      promises.push(dashboardService.getBuilderWalletInfo().catch(() => ({ balance: 0, recent_transactions: [] })));
      promises.push(api.get('/builders/profile').then(res => res.data).catch(() => null));
    }

    const results = await Promise.all(promises);

    return {
      wallet: results[0],
      portfolio: results[1],
      builder_wallet: isBuilder ? results[2] : null,
      builder_profile: isBuilder ? results[3] : null
    };
  }
};

export default dashboardService;
