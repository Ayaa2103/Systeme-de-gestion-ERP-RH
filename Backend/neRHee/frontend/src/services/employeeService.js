import api from './api';

export const employeeService = {
  // Employés
  getEmployees: () => api.get('/employees/'),
  getEmployee: (id) => api.get(`/employees/${id}/`),
  updateEmployee: (id, data) => api.put(`/employees/${id}/`, data),
  deleteEmployee: (id) => api.delete(`/employees/${id}/`),
  
  // Contrats
  getContracts: () => api.get('/contracts/'),
  getContract: (id) => api.get(`/contracts/${id}/`),
  createContract: (data) => api.post('/contracts/', data),
  updateContract: (id, data) => api.put(`/contracts/${id}/`, data),
  renewContract: (id, data) => api.post(`/contracts/${id}/renew/`, data),
  convertToPermanent: (id) => api.post(`/contracts/${id}/convert_to_permanent/`),
  getExpiringContracts: () => api.get('/contracts/expiring/'),
  
  // Départements
  getDepartments: () => api.get('/departments/'),
};