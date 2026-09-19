import api from './api';

export const getNotifications = (params) => api.get('/notifications', { params }).then(r => r.data);
export const markAsRead = (id) => api.patch(`/notifications/${id}/read`).then(r => r.data);
export const markAllAsRead = () => api.patch('/notifications/read-all').then(r => r.data);
export const getUnreadCount = () => api.get('/notifications/unread-count').then(r => r.data);

export const notificationService = {
  getNotifications,
  markAsRead,
  markAllAsRead,
  getUnreadCount
};

export default notificationService;
