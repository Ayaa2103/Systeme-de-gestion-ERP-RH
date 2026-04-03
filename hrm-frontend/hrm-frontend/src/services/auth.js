import api from './api';

export const authService = {
  login: async (username, password) => {
    console.log('Auth service login called with:', { username, password: '***' });
    console.log('API URL:', '/auth/login/');
    
    try {
      const response = await api.post('/auth/login/', { username, password });
      console.log('Login response:', response.data);
      
      const { token, user, employee } = response.data;
      
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      if (employee) {
        localStorage.setItem('employee', JSON.stringify(employee));
      }
      
      return { token, user, employee };
    } catch (error) {
      console.error('Auth service error:', error);
      console.error('Error response data:', error.response?.data);
      console.error('Error status:', error.response?.status);
      throw error;
    }
  },

  logout: async () => {
    try {
      // Try to call logout endpoint, but don't fail if it doesn't exist
      await api.post('/auth/logout/');
    } catch (error) {
      // Ignore 404 errors for logout endpoint
      if (error.response?.status !== 404) {
        console.error('Logout error:', error);
      }
    } finally {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      localStorage.removeItem('employee');
    }
  },

  getCurrentUser: () => {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  },

  getCurrentEmployee: () => {
    const employee = localStorage.getItem('employee');
    return employee ? JSON.parse(employee) : null;
  },

  isAuthenticated: () => {
    return !!localStorage.getItem('token');
  },

  hasRole: (role) => {
    const user = authService.getCurrentUser();
    return user?.role === role;
  },

  hasAnyRole: (roles) => {
    const user = authService.getCurrentUser();
    return roles.includes(user?.role);
  }
};