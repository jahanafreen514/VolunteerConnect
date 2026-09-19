import api from './api';

export const getDashboardStats = () => api.get('/admin/stats').then(r => r.data);
export const getNGOs = (params) => api.get('/admin/ngos', { params }).then(r => r.data);
export const verifyNGO = (id, actionOrData, rejectionReason) => {
  let action = typeof actionOrData === 'string' ? actionOrData : (actionOrData?.action || (actionOrData?.status === 'approved' ? 'approve' : 'reject'));
  let reason = typeof actionOrData === 'object' ? (actionOrData?.adminNote || actionOrData?.rejectionReason) : rejectionReason;
  return api.patch(`/admin/ngos/${id}/verify`, { action, rejectionReason: reason }).then(r => r.data);
};
export const getUsers = (params) => api.get('/admin/users', { params }).then(r => r.data);
export const toggleUserActive = (id) => api.patch(`/admin/users/${id}/toggle`).then(r => r.data);
export const toggleUserStatus = (id) => toggleUserActive(id);
export const getAdminOpportunities = (params) => api.get('/admin/opportunities', { params }).then(r => r.data);
export const getReports = (params) => api.get('/admin/reports', { params }).then(r => r.data);
export const updateReport = (id, data) => api.patch(`/admin/reports/${id}`, data).then(r => r.data);
export const updateReportStatus = (id, data) => updateReport(id, data);
export const getAnalytics = () => api.get('/admin/analytics').then(r => r.data);

export const adminService = {
  getDashboardStats,
  getNGOs,
  verifyNGO,
  getUsers,
  toggleUserActive,
  toggleUserStatus,
  getAdminOpportunities,
  getReports,
  updateReport,
  updateReportStatus,
  getAnalytics
};

export default adminService;
