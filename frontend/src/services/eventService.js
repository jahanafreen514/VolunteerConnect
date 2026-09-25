import api from './api';

export const eventService = {
  // Incident Queries
  getEvents: (params = {}) => api.get('/events', { params }).then(res => res.data),
  getEvent: (id) => api.get(`/events/${id}`).then(res => res.data),

  // Community Verification
  verifyEvent: (id, data) => api.post(`/events/${id}/verify`, data).then(res => res.data),

  // Comments & Discussions
  getComments: (id) => api.get(`/events/${id}/comments`).then(res => res.data),
  addComment: (id, data) => api.post(`/events/${id}/comments`, data).then(res => res.data),
  updateComment: (commentId, data) => api.patch(`/events/comments/${commentId}`, data).then(res => res.data),
  deleteComment: (commentId) => api.delete(`/events/comments/${commentId}`).then(res => res.data),
  reportComment: (commentId, data = {}) => api.post(`/events/comments/${commentId}/report`, data).then(res => res.data),
  toggleHelpful: (commentId) => api.post(`/events/comments/${commentId}/helpful`).then(res => res.data),

  // Event-based Chat
  joinChat: (id) => api.post(`/events/${id}/join-chat`).then(res => res.data),
  leaveChat: (id) => api.post(`/events/${id}/leave-chat`).then(res => res.data),
  getChatMessages: (id) => api.get(`/events/${id}/chat`).then(res => res.data),
  sendMessage: (id, data) => api.post(`/events/${id}/chat/messages`, data).then(res => res.data),
  reportMessage: (messageId, data = {}) => api.post(`/events/chat/messages/${messageId}/report`, data).then(res => res.data)
};

export default eventService;
