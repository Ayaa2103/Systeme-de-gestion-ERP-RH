import api from './api';

export const knowledgeService = {
  // Compétences de l'employé
  getEmployeeSkills: async () => {
    const response = await api.get('/knowledge/employee/skills/');
    return response.data;
  },

  // Documents accessibles à l'employé
  getEmployeeDocuments: async (params = {}) => {
    const response = await api.get('/knowledge/employee/documents/', { params });
    return response.data;
  }
};

// Fonctions pour les pages HR
export const getKnowledgeStats = async () => {
  const response = await api.get('/knowledge/dashboard/stats/');
  return response.data;
};

export const getSkills = async (params = {}) => {
  const response = await api.get('/knowledge/skills/', { params });
  return response.data;
};

export const getPositions = async (params = {}) => {
  const response = await api.get('/knowledge/positions/', { params });
  return response.data;
};

export const createSkill = async (skillData) => {
  const response = await api.post('/knowledge/skills/create/', skillData);
  return response.data;
};

export const createPosition = async (positionData) => {
  const response = await api.post('/knowledge/positions/create/', positionData);
  return response.data;
};

export const getSkillsMatrix = async (departmentId) => {
  const response = await api.get('/knowledge/skills-matrix/', { params: { department: departmentId } });
  return response.data;
};

export const updateEmployeeSkill = async (employeeId, skillId, data) => {
  const response = await api.put(`/knowledge/employees/${employeeId}/skills/${skillId}/`, data);
  return response.data;
};

export const getVersatilityMatrix = async (departmentId) => {
  const response = await api.get('/knowledge/versatility-matrix/', { params: { department: departmentId } });
  return response.data;
};

export const updateEmployeePosition = async (employeeId, positionId, data) => {
  const response = await api.put(`/knowledge/employees/${employeeId}/positions/${positionId}/`, data);
  return response.data;
};

export const getDocuments = async (params = {}) => {
  const response = await api.get('/knowledge/documents/', { params });
  return response.data;
};

export const uploadDocument = async (formData) => {
  const response = await api.post('/knowledge/documents/upload/', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });
  return response.data;
};