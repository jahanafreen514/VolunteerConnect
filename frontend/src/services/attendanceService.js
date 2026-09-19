import api from './api';

export const markAttendance = (idOrData, maybeData) => {
  if (typeof idOrData === 'string' && maybeData) {
    return api.post(`/attendance/${idOrData}`, maybeData).catch(() => api.post('/attendance', { attendanceId: idOrData, ...maybeData })).then(r => r.data);
  }
  return api.post('/attendance', idOrData).then(r => r.data);
};

export const getAttendance = (opportunityId) => api.get(`/attendance/${opportunityId}`).then(r => r.data);
export const getMyAttendance = () => api.get('/attendance/my/history').then(r => r.data);

export const attendanceService = {
  markAttendance,
  getAttendance,
  getMyAttendance
};

export default attendanceService;
