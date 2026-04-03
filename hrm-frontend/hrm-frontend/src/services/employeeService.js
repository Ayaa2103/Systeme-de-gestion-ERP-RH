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

export const createAttestationRequest = (data) => {
  return api.post('/requests/attestation/create/', data);
};

export const createMissionRequest = (data) => {
  return api.post('/requests/mission/create/', data);
};

export const createPayslipRequest = (data) => {
  return api.post('/requests/payslip/create/', data);
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