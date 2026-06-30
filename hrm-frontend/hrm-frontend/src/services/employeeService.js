import api from './api';

// Dashboard
export const getEmployeeDashboard = () => {
  return api.get('/dashboard/employee-data/');
};

// Requests
export const getMyRequests = () => {
  return api.get('/requests/my/');
};

export const createLeaveRequest = (data) => {
  return api.post('/requests/leave/create/', data);
};

export const downloadLeaveRequestTemplate = (data) => {
  return api.post('/requests/leave/template/', data, { responseType: 'blob' });
};

export const createAttestationRequest = (data) => {
  return api.post('/requests/attestation/create/', data);
};

export const downloadAttestationRequestTemplate = (data) => {
  return api.post('/requests/attestation/template/', data, { responseType: 'blob' });
};

export const createMissionRequest = (data) => {
  return api.post('/requests/mission/create/', data);
};

export const downloadMissionRequestTemplate = (data) => {
  return api.post('/requests/mission/template/', data, { responseType: 'blob' });
};

export const createPayslipRequest = (data) => {
  return api.post('/requests/payslip/create/', data);
};

export const downloadPayslipRequestTemplate = (data) => {
  return api.post('/requests/payslip/template/', data, { responseType: 'blob' });
};

// Profile
export const getMyProfile = () => {
  return api.get('/employees/profile/');
};

// Trainings
export const getMyTrainings = () => {
  return api.get('/employees/my-trainings/');
};

// Culture
export const getMySuggestions = () => {
  return api.get('/suggestions/');
};

export const createSuggestion = (data) => {
  return api.post('/suggestions/', data);
};

export const getCompanyPages = () => {
  return api.get('/company-pages/');
};

// Knowledge
export const getMySkills = () => {
  return api.get('/knowledge/my-skills/');
};

export const getMyRecommendations = () => {
  return api.get('/knowledge/my-recommendations/');
};

// Onboarding
export const getMyOnboarding = () => {
  return api.get('/onboarding/my-onboarding/');
};

export const completeTask = (taskId) => {
  return api.post(`/onboarding/task/${taskId}/complete/`);
};