import api from './api';

export const submitFeedback = (data) => api.post('/feedback', data).then(r => r.data);
export const getOpportunityFeedback = (id) => api.get(`/feedback/opportunity/${id}`).then(r => r.data);
export const getMyFeedback = () => api.get('/feedback/my').then(r => r.data);

export const feedbackService = {
  submitFeedback,
  getOpportunityFeedback,
  getMyFeedback
};

export default feedbackService;
