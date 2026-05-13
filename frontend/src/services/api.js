import axios from 'axios';
import { supabase } from '../utils/supabaseClient';

// Update with backend URL or use environment variable
const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1';
const AUTH_BASE_URL = import.meta.env.VITE_AUTH_API_URL || BASE_URL;

export const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to attach JWT token and handle traffic splitting
api.interceptors.request.use(
  (config) => {
    // Traffic splitting: route auth requests to Vercel
    if (config.url && (config.url.startsWith('/auth') || config.url.startsWith('auth'))) {
      config.baseURL = AUTH_BASE_URL;
    } else {
      config.baseURL = BASE_URL;
    }

    const token = localStorage.getItem('token');
    if (token && !config.headers.Authorization) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors globally 
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  
  failedQueue = [];
};

api.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    // Handle unauthorized errors (e.g., redirect to login or refresh token)
    if (error.response && error.response.status === 401 && !originalRequest._retry) {
      
      if (isRefreshing) {
        return new Promise(function(resolve, reject) {
          failedQueue.push({ resolve, reject });
        }).then(token => {
          originalRequest.headers['Authorization'] = 'Bearer ' + token;
          return api(originalRequest);
        }).catch(err => {
          return Promise.reject(err);
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      const refreshToken = localStorage.getItem('refreshToken');
      
      if (!refreshToken) {
        // No refresh token, force logout
        localStorage.removeItem('token');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('user');
        
        try { await supabase.auth.signOut(); } catch (e) {}

        if (window.location.pathname !== '/login') {
          window.location.href = '/login';
        }
        return Promise.reject(error);
      }

      try {
        // Important: use a separate axios instance or a direct call to avoid interceptor loop
        const response = await axios.post(`${AUTH_BASE_URL}/auth/refresh`, {
          refresh_token: refreshToken
        });

        const { access_token, refresh_token } = response.data;
        
        localStorage.setItem('token', access_token);
        localStorage.setItem('refreshToken', refresh_token);
        
        api.defaults.headers.common['Authorization'] = 'Bearer ' + access_token;
        originalRequest.headers['Authorization'] = 'Bearer ' + access_token;
        
        processQueue(null, access_token);
        return api(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);
        
        // Refresh failed, logout
        localStorage.removeItem('token');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('user');
        
        try { await supabase.auth.signOut(); } catch (e) {}

        if (window.location.pathname !== '/login') {
          window.location.href = '/login';
        }
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }
    
    return Promise.reject(error);
  }
);

export default api;
