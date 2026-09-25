import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'https://volunteerconnect-api-wiyc.onrender.com/api',
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('vc_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('vc_token');
      const currentPath = window.location.pathname;
      const isPublic = [
        '/', 
        '/login', 
        '/register', 
        '/about', 
        '/contact', 
        '/forgot-password'
      ].includes(currentPath) || 
      currentPath.startsWith('/reset-password/');
      if (!isPublic) {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;
