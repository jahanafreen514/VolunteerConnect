import api from './api';

export const createProfile = (data) => api.post('/ngos/profile', data).then(r => r.data);
export const updateProfile = (data) => api.put('/ngos/profile', data).then(r => r.data);
export const getMyProfile = () => api.get('/ngos/profile').then(r => r.data);
export const uploadDocuments = (formData) => api.post('/ngos/profile/documents', formData, {
  headers: { 'Content-Type': 'multipart/form-data' }
}).then(r => r.data);
export const uploadLogo = (formData) => api.post('/ngos/profile/logo', formData, {
  headers: { 'Content-Type': 'multipart/form-data' }
}).then(r => r.data);
export const getNGOStats = () => api.get('/ngos/stats').then(r => r.data);
export const getPublicProfile = (userId) => api.get(`/ngos/public/${userId}`).then(r => r.data);

export const ngoService = {
  createProfile,
  updateProfile,
  getMyProfile,
  uploadDocuments,
  uploadLogo,
  getNGOStats,
  getPublicProfile
};

export default ngoService;
