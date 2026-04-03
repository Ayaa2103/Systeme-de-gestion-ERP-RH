import api from './api';

export const getKpiData = () => {
  return api.get('/kpi/');
};