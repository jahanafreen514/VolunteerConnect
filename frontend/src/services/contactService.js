import api from './api';

export const submitContact = (data) => api.post('/contact', data).then(res => res.data);

export const contactService = {
  submitContact
};

export default contactService;
