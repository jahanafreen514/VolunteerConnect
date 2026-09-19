import api from './api';

export const register = (data) => api.post('/auth/register', data).then(res => res.data);
export const login = (data) => api.post('/auth/login', data).then(res => res.data);
export const getMe = () => api.get('/auth/me').then(res => res.data);
export const logout = () => api.post('/auth/logout').then(res => res.data).catch(() => ({}));
export const forgotPassword = (email) => api.post('/auth/forgot-password', { email }).then(res => res.data);
export const resetPassword = (token, password) => api.post(`/auth/reset-password/${token}`, { password }).then(res => res.data);
export const changePassword = (currentPassword, newPassword) => api.post('/auth/change-password', { currentPassword, newPassword }).then(res => res.data);

export const authService = {
  register,
  login,
  getMe,
  logout,
  forgotPassword,
  resetPassword,
  changePassword
};

export default authService;
