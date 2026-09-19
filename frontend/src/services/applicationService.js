import api from './api';

export const applyForOpportunity = (opportunityId, data) => {
  const message = typeof data === 'string' ? data : (data?.message || data?.notes || '');
  return api.post('/applications', { opportunityId, message }).then(r => r.data);
};

export const getMyApplications = (params) => api.get('/applications/my', { params }).then(r => r.data);
export const cancelApplication = (id) => api.delete(`/applications/${id}`).then(r => r.data);
export const getOpportunityApplications = (opportunityId, params) => api.get(`/applications/opportunity/${opportunityId}`, { params }).then(r => r.data);
export const reviewApplication = (id, status) => api.patch(`/applications/${id}/review`, { status }).then(r => r.data);
export const updateApplicationStatus = (id, status) => api.patch(`/applications/${id}/review`, { status }).then(r => r.data);
export const getNGOApplications = (params) => api.get('/applications/ngo', { params }).catch(() => api.get('/applications', { params })).then(r => r.data);
export const getAllApplications = (params) => api.get('/applications', { params }).then(r => r.data);

export const applicationService = {
  applyForOpportunity,
  getMyApplications,
  cancelApplication,
  getOpportunityApplications,
  reviewApplication,
  updateApplicationStatus,
  getNGOApplications,
  getAllApplications
};

export default applicationService;
