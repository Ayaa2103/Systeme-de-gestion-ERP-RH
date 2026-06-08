import api from './api';

// Employees
export const getEmployees = (filters = {}) => {
  const params = new URLSearchParams(filters);
  return api.get(`/employees/?${params}`);
};

export const getEmployeeDetail = (id) => {
  return api.get(`/employees/${id}/`);
};

export const createEmployee = (data) => {
  return api.post('/employees/create/', data);
};

export const updateEmployee = (id, data) => {
  return api.put(`/employees/${id}/update/`, data);
};

export const deleteEmployee = (id) => {
  return api.delete(`/employees/${id}/delete/`);
};

export const getDepartments = () => api.get('/departments/');
export const createDepartment = (data) => api.post('/departments/create/', data);
export const updateDepartment = (id, data) => api.put(`/departments/${id}/update/`, data);
export const deleteDepartment = (id) => api.delete(`/departments/${id}/delete/`);

export const getPositions = () => api.get('/positions/');
export const createPosition = (data) => api.post('/positions/create/', data);
export const updatePosition = (id, data) => api.put(`/positions/${id}/update/`, data);
export const deletePosition = (id) => api.delete(`/positions/${id}/delete/`);

// Contracts
export const getContracts = (filters = {}) => {
  const params = new URLSearchParams(filters);
  return api.get(`/contracts/?${params}`);
};

export const createContract = (data) => {
  return api.post('/contracts/create/', data);
};

export const getExpiringContracts = () => {
  return api.get('/contracts/expiring/');
};

// Trainings
export const getTrainings = () => {
  return api.get('/trainings/');
};

export const createTraining = (data) => {
  return api.post('/trainings/create/', data);
};

export const approveTraining = (id) => {
  return api.post(`/trainings/${id}/approve/`);
};

export const rejectTraining = (id) => {
  return api.post(`/trainings/${id}/reject/`);
};

// Requests
export const getPendingRequests = () => {
  return api.get('/requests/pending/');
};

export const approveRequest = (type, id, comment = '') => {
  const url = `/requests/${type}/${id}/approve/`;
  console.log(`Approving request: ${type}/${id}`);
  console.log(`Full URL: ${url}`);
  console.log(`Comment:`, comment);
  return api.post(url, { comment });
};

export const rejectRequest = (type, id, comment = '') => {
  const url = `/requests/${type}/${id}/reject/`;
  console.log(`Rejecting request: ${type}/${id}`);
  console.log(`Full URL: ${url}`);
  console.log(`Comment:`, comment);
  return api.post(url, { comment });
};

// Recruitment - Job Offers
export const getJobOffers = (filters = {}) => {
  const params = new URLSearchParams(filters);
  return api.get(`/recruitment/job-offers/?${params}`);
};

export const getJobOfferDetail = (id) => {
  return api.get(`/recruitment/job-offers/${id}/`);
};

export const createJobOffer = (data) => {
  return api.post('/recruitment/job-offers/create/', data);
};

export const updateJobOffer = (id, data) => {
  return api.put(`/recruitment/job-offers/${id}/update/`, data);
};

export const publishJobOffer = (id) => {
  return api.post(`/recruitment/job-offers/${id}/publish/`);
};

export const closeJobOffer = (id) => {
  return api.post(`/recruitment/job-offers/${id}/close/`);
};

export const deleteJobOffer = (id) => {
  return api.delete(`/recruitment/job-offers/${id}/delete/`);
};

// Applications
export const getApplications = (filters = {}) => {
  const params = new URLSearchParams(filters);
  return api.get(`/recruitment/applications/?${params}`);
};

export const getApplicationDetail = (id) => {
  return api.get(`/recruitment/applications/${id}/`);
};

export const updateApplicationStatus = (id, data) => {
  return api.put(`/recruitment/applications/${id}/update-status/`, data);
};

// Interviews
export const createInterview = (applicationId, data) => {
  return api.post(`/recruitment/applications/${applicationId}/interviews/create/`, data);
};

export const getInterviewDetail = (id) => {
  return api.get(`/recruitment/interviews/${id}/`);
};

export const submitInterviewFeedback = (id, data) => {
  return api.post(`/recruitment/interviews/${id}/feedback/`, data);
};

// Profile Recommendations
export const getProfileRecommendations = () => {
  return api.get('/recruitment/profile-recommendations/');
};

export const updateRecommendationStatus = (id, status) => {
  return api.post(`/recruitment/profile-recommendations/${id}/update-status/`, { status });
};

export const createProfileRecommendation = (jobOfferId, data) => {
  return api.post(`/recruitment/job-offers/${jobOfferId}/recommend-profile/`, data);
};

// Stats
export const getRecruitmentStats = () => {
  return api.get('/recruitment/dashboard/stats/');
};

// Contract details and actions
export const getContractDetail = (id) => {
  return api.get(`/contracts/${id}/`);
};

export const updateContract = (id, data) => {
  return api.put(`/contracts/${id}/update/`, data);
};

export const renewContract = (id, data) => {
  return api.post(`/contracts/${id}/renew/`, data);
};

// Employee details
export const getEmployeeContracts = (employeeId) => {
  return api.get(`/employees/${employeeId}/contracts/`);
};

export const getEmployeeTrainings = (employeeId) => {
  return api.get(`/employees/${employeeId}/trainings/`);
};

export const getMyProfile = () => {
  return api.get('/employees/my-profile/');
};

// Events
export const getEvents = () => {
  return api.get('/events/');
};

export const createEvent = (data) => {
  return api.post('/events/create/', data);
};

export const approveEvent = (id) => api.post(`/events/${id}/approve/`);
export const rejectEvent  = (id) => api.post(`/events/${id}/reject/`);
export const updateEvent  = (id, data) => api.put(`/events/${id}/update/`, data);
export const deleteEvent  = (id) => api.delete(`/events/${id}/delete/`);

// Onboarding Plans
export const getOnboardingPlans = () => {
  return api.get('/onboarding/plans/');
};

export const createOnboardingPlan = (data) => {
  return api.post('/onboarding/plans/create/', data);
};

export const updateOnboardingPlan = (id, data) => {
  return api.put(`/onboarding/plans/${id}/update/`, data);
};

export const deleteOnboardingPlan = (id) => {
  return api.delete(`/onboarding/plans/${id}/delete/`);
};

// Onboarding Tasks
export const getOnboardingTasks = () => {
  return api.get('/onboarding/tasks/');
};

export const createOnboardingTask = (data) => {
  return api.post('/onboarding/tasks/create/', data);
};

export const updateOnboardingTask = (id, data) => {
  return api.put(`/onboarding/tasks/${id}/update/`, data);
};

export const deleteOnboardingTask = (id) => {
  return api.delete(`/onboarding/tasks/${id}/delete/`);
};

// Employee Onboarding Progress
export const getOnboardingFollowups = () => {
  return api.get('/onboarding/followups/');
};

export const getEmployeeOnboardingTasks = (employeeId) => {
  return api.get(`/onboarding/employees/${employeeId}/tasks/`);
};

export const updateOnboardingTaskStatus = (taskId, data) => {
  return api.put(`/onboarding/tasks/${taskId}/status/`, data);
};

export const startOnboarding = (data) => {
  return api.post('/onboarding/start/', data);
};

export const getOnboardingStats = () => {
  return api.get('/onboarding/stats/');
};

// User management (admin only)
export const getUsers = () => api.get('/users/');
export const createUser = (data) => api.post('/users/create/', data);
export const updateUser = (id, data) => api.put(`/users/${id}/update/`, data);
export const resetUserPassword = (id, newPassword) => api.post(`/users/${id}/reset-password/`, { new_password: newPassword });
export const toggleUserActive = (id) => api.post(`/users/${id}/toggle-active/`);

// Export all functions as hrService object
export const hrService = {
  // Employees
  getEmployees,
  getEmployeeDetail,
  createEmployee,
  updateEmployee,
  deleteEmployee,
  getDepartments,
  getPositions,
  getEmployeeContracts,
  getEmployeeTrainings,
  getMyProfile,
  
  // Contracts
  getContracts,
  createContract,
  getExpiringContracts,
  getContractDetail,
  updateContract,
  renewContract,
  
  // Trainings
  getTrainings,
  createTraining,
  approveTraining,
  rejectTraining,
  
  // Requests
  getPendingRequests,
  approveRequest,
  rejectRequest,
  
  // Recruitment
  getJobOffers,
  getJobOfferDetail,
  createJobOffer,
  updateJobOffer,
  publishJobOffer,
  closeJobOffer,
  getApplications,
  getApplicationDetail,
  updateApplicationStatus,
  createInterview,
  getInterviewDetail,
  submitInterviewFeedback,
  getProfileRecommendations,
  updateRecommendationStatus,
  createProfileRecommendation,
  getRecruitmentStats,
  
  // Events
  getEvents,
  createEvent,
  approveEvent,
  rejectEvent,
  
  // Onboarding
  getOnboardingPlans,
  createOnboardingPlan,
  updateOnboardingPlan,
  deleteOnboardingPlan,
  getOnboardingTasks,
  createOnboardingTask,
  updateOnboardingTask,
  deleteOnboardingTask,
  getOnboardingFollowups,
  getEmployeeOnboardingTasks,
  updateOnboardingTaskStatus,
  startOnboarding,
  getOnboardingStats,

  // User management (admin)
  getUsers,
  createUser,
  updateUser,
  resetUserPassword,
  toggleUserActive,
};