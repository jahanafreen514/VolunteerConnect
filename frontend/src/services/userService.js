import api from './api';

export const getProfile = () => api.get('/users/profile').then(r => r.data);
export const updateProfile = (data) => api.put('/users/profile', data).then(r => r.data);
export const uploadProfileImage = (formData) => api.post('/users/profile/image', formData, {
  headers: { 'Content-Type': 'multipart/form-data' }
}).then(r => r.data);
export const getVolunteerStats = () => api.get('/users/stats').then(r => r.data);
export const getUpcomingEvents = () => api.get('/users/upcoming').then(r => r.data);
export const getParticipationHistory = () => api.get('/users/history').then(r => r.data);

export const userService = {
  getProfile,
  updateProfile,
  uploadProfileImage,
  getVolunteerStats,
  getUpcomingEvents,
  getParticipationHistory
};

export default userService;
