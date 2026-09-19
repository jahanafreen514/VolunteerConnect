import api from './api';

export const getMyCertificates = () => api.get('/certificates/my').then(r => r.data);
export const getCertificate = (id) => api.get(`/certificates/${id}`).then(r => r.data);
export const generateCertificate = (data) => api.post('/certificates', data).then(r => r.data);

export const certificateService = {
  getMyCertificates,
  getCertificate,
  generateCertificate
};

export default certificateService;
