import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    // Add auth token if available
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // Check if data is FormData
    const isFormData = config.data instanceof FormData || 
                       (config.data && typeof config.data.constructor === 'function' && 
                        config.data.constructor.name === 'FormData') ||
                       (config.data && typeof config.data.append === 'function' && 
                        typeof config.data.get === 'function');
    
    // Only set Content-Type for non-FormData requests
    // Axios will automatically set it with boundary for FormData
    if (isFormData) {
      delete config.headers['Content-Type'];
    } else if (!isFormData && !config.headers['Content-Type']) {
      config.headers['Content-Type'] = 'application/json';
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Handle unauthorized
      localStorage.removeItem('authToken');
    }
    return Promise.reject(error);
  }
);

export default api;
