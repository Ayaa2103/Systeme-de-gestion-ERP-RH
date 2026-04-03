import api from './api';

export const eventsService = {
  getEvents: async () => {
    const response = await api.get('/events/');
    return response.data;
  }
};