import api from './api';

// Company Pages
export const getCompanyPages = () => {
  return api.get('/company-pages/');
};

export const getCompanyPage = (id) => {
  return api.get(`/company-pages/${id}/`);
};

export const updateCompanyPage = async (id, data) => {
  try {
    if (id === 0 || !id) {
      // Créer une nouvelle page
      return await api.post('/company-pages/', data);
    }
    return await api.put(`/company-pages/${id}/`, data);
  } catch (error) {
    console.error('Error updating company page:', error);
    throw error;
  }
};

export const createCompanyPage = (data) => {
  return api.post('/company-pages/', data);
};

// Suggestions
export const getSuggestions = () => {
  return api.get('/suggestions/');
};

export const createSuggestion = (data) => {
  return api.post('/suggestions/', data);
};

export const getSuggestionDetail = (id) => {
  return api.get(`/suggestions/${id}/`);
};

export const respondToSuggestion = (id, data) => {
  return api.post(`/suggestions/${id}/respond/`, data);
};

export const getCultureStats = async () => {
  try {
    const [pagesRes, suggestionsRes] = await Promise.all([
      getCompanyPages(),
      getSuggestions()
    ]);
    
    const pages = Array.isArray(pagesRes.data) ? pagesRes.data : [];
    const suggestions = Array.isArray(suggestionsRes.data) ? suggestionsRes.data : [];
    
    return {
      data: {
        totalPages: pages.length,
        totalSuggestions: suggestions.length,
        pendingSuggestions: suggestions.filter(s => s.status === 'new').length,
        answeredSuggestions: suggestions.filter(s => s.status === 'answered').length
      }
    };
  } catch (error) {
    return {
      data: {
        totalPages: 0,
        totalSuggestions: 0,
        pendingSuggestions: 0,
        answeredSuggestions: 0
      }
    };
  }
};