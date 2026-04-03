import React, { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '../services/auth';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [employee, setEmployee] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      setUser(authService.getCurrentUser());
      setEmployee(authService.getCurrentEmployee());
    }
    setLoading(false);
  }, []);

  const login = async (username, password) => {
    const { user, employee } = await authService.login(username, password);
    setUser(user);
    setEmployee(employee);
    return user;
  };

  const logout = async () => {
    await authService.logout();
    setUser(null);
    setEmployee(null);
  };

  const value = {
    user,
    employee,
    login,
    logout,
    isAuthenticated: authService.isAuthenticated(),
    hasRole: authService.hasRole,
    hasAnyRole: authService.hasAnyRole,
    loading
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};