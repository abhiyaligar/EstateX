import api from './api';

export const propertyService = {
  getProperties: async (status = 'active') => {
    const response = await api.get(`/projects?lifecycle_status=${status}`);
    return response.data;
  },

  getPropertyById: async (id) => {
    const response = await api.get(`/projects/${id}`);
    return response.data;
  },

  createProject: async (projectData, images) => {
    const formData = new FormData();
    formData.append('project_data', JSON.stringify(projectData));
    
    if (images && images.length > 0) {
      images.forEach((image) => {
        formData.append('images', image);
      });
    }

    const response = await api.post('/projects', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  }
};

export default propertyService;
