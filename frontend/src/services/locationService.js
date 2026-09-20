import api from './api';

export const geocode = (data) => api.post('/location/geocode', data).then(res => res.data);
export const reverseGeocode = (lat, lng) => api.post('/location/reverse-geocode', { latitude: lat, longitude: lng }).then(res => res.data);
export const getNearby = (lat, lng, radius = 50, category = 'all') => 
  api.get('/location/nearby', { params: { lat, lng, radius, category } }).then(res => res.data);
export const getNewsEvents = (lat, lng) => 
  api.get('/location/news-events', { params: { lat, lng } }).then(res => res.data);
export const refreshNews = () => api.post('/location/refresh-news').then(res => res.data);
export const adoptEvent = (id) => api.post(`/location/adopt-event/${id}`).then(res => res.data);
export const rejectEvent = (id) => api.post(`/location/reject-event/${id}`).then(res => res.data);
export const requestSupport = (id) => api.post(`/location/request-support/${id}`).then(res => res.data);

export const locationService = {
  geocode,
  reverseGeocode,
  getNearby,
  getNewsEvents,
  refreshNews,
  adoptEvent,
  rejectEvent,
  requestSupport
};

export default locationService;
