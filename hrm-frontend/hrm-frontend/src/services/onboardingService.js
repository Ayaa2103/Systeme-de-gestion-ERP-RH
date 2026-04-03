import api from './api';

export const onboardingService = {
  getMyOnboarding: async () => {
    const response = await api.get('/onboarding/my-onboarding/');
    return response.data;
  }
};