import api from './api';

const supportService = {
  // User Endpoints
  createTicket: async (ticketData) => {
    const response = await api.post('/support/tickets', ticketData);
    return response.data;
  },

  getMyTickets: async () => {
    const response = await api.get('/support/tickets');
    return response.data;
  },

  // Admin Endpoints
  getAllTickets: async (status = '', skip = 0, limit = 50) => {
    const response = await api.get(`/support/admin/tickets?status=${status}&skip=${skip}&limit=${limit}`);
    return response.data;
  },

  updateTicket: async (ticketId, updateData) => {
    const response = await api.put(`/support/admin/tickets/${ticketId}`, updateData);
    return response.data;
  }
};

export default supportService;
