import api from './api';

// Public job offers for employees
export const getPublicJobOffers = () => {
  return api.get('/recruitment/public-jobs/');
};

export const getEmployeeDashboardData = () => {
  return api.get('/dashboard/employee-data/');
};

export const getPublicJobDetail = (jobId) => {
  return api.get(`/recruitment/public-jobs/${jobId}/`);
};

export const applyToJob = (jobId, applicationData) => {
  return api.post(`/recruitment/public-jobs/${jobId}/apply/`, applicationData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
};

export const recommendProfile = (jobId, recommendationData) => {
  console.log('Sending recommendation:', recommendationData);
  return api.post(`/recruitment/public-jobs/${jobId}/recommend/`, recommendationData);
};

export const jobService = {
  getPublicJobOffers,
  getPublicJobDetail,
  applyToJob,
  recommendProfile,
  getEmployeeDashboardData
};