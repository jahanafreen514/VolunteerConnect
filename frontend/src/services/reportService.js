import api from './api';

export const createReport = (data) => api.post('/reports', data).then(r => r.data);
export const getMyReports = () => api.get('/reports/my').then(r => r.data);

export const reportService = {
  createReport,
  getMyReports
};

export default reportService;
