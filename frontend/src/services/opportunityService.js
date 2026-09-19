import api from './api';

export const getOpportunities = (params) => api.get('/opportunities', { params }).then(res => res.data);
export const getOpportunity = (id) => api.get(`/opportunities/${id}`).then(res => res.data);
export const getOpportunityById = (id) => api.get(`/opportunities/${id}`).then(res => res.data);
export const getPublicStats = () => api.get('/opportunities/public-stats').then(res => res.data);
export const createOpportunity = (data) => {
  const isFormData = data instanceof FormData;
  return api.post('/opportunities', data, {
    headers: isFormData ? { 'Content-Type': 'multipart/form-data' } : undefined
  }).then(res => res.data);
};
export const updateOpportunity = (id, data) => {
  const isFormData = data instanceof FormData;
  return api.put(`/opportunities/${id}`, data, {
    headers: isFormData ? { 'Content-Type': 'multipart/form-data' } : undefined
  }).then(res => res.data);
};
export const deleteOpportunity = (id) => api.delete(`/opportunities/${id}`).then(res => res.data);
export const updateOpportunityStatus = (id, status) => api.patch(`/opportunities/${id}/status`, { status }).then(res => res.data);
export const uploadOpportunityImage = (id, formData) => api.post(`/opportunities/${id}/image`, formData, {
  headers: { 'Content-Type': 'multipart/form-data' }
}).then(res => res.data);

export const opportunityService = {
  getOpportunities,
  getOpportunity,
  getOpportunityById,
  getPublicStats,
  createOpportunity,
  updateOpportunity,
  deleteOpportunity,
  updateOpportunityStatus,
  uploadOpportunityImage
};

export default opportunityService;
