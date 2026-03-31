import api from './api';

export const propertyService = {
  getProperties: async (status = 'active') => {
    const response = await api.get(`/projects?lifecycle_status=${status}`);
    return response.data;
  },

  getPropertyById: async (id) => {
    const response = await api.get(`/projects/${id}`);
    return response.data;
  }
};

export default propertyService;
