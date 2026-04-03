# Guide de Configuration React pour l'ERP RH

## ✅ APIs Django Prêtes

Les APIs Django REST Framework sont maintenant configurées et fonctionnelles :

- **Base URL**: `http://localhost:8000/api/v1/`
- **Authentication**: Token-based
- **CORS**: Configuré pour React (localhost:3000)

## 🚀 Démarrage du Serveur Django

```bash
cd c:\Users\HP\neRHee
py manage.py runserver
```

Le serveur sera accessible sur : `http://localhost:8000`

## 📋 APIs Disponibles

### Authentication
- `POST /api/v1/auth/login/` - Connexion
- `POST /api/v1/auth/logout/` - Déconnexion

### Core
- `GET /api/v1/dashboard/stats/` - Statistiques dashboard
- `GET /api/v1/kpi/dashboard/` - KPIs (Directeur RH)
- `GET|POST /api/v1/hr-policies/` - Politiques RH
- `GET|POST /api/v1/events/` - Événements

### Employees
- `GET|POST /api/v1/employees/` - Employés
- `GET|POST /api/v1/departments/` - Départements
- `GET|POST /api/v1/contracts/` - Contrats
- `GET|POST /api/v1/trainings/` - Formations

### Requests
- `GET|POST /api/v1/leave-requests/` - Demandes de congés
- `GET|POST /api/v1/attestation-requests/` - Demandes d'attestations
- `GET|POST /api/v1/mission-requests/` - Demandes de missions
- `GET|POST /api/v1/payslip-requests/` - Demandes de bulletins

### Recruitment
- `GET|POST /api/v1/job-offers/` - Offres d'emploi
- `GET|POST /api/v1/applications/` - Candidatures
- `GET|POST /api/v1/interviews/` - Entretiens

### Company Culture
- `GET|POST /api/v1/company-pages/` - Pages culture
- `GET|POST /api/v1/suggestions/` - Suggestions employés

## 🔧 Configuration React

### 1. Créer l'application React

```bash
npx create-react-app hrm-frontend
cd hrm-frontend
```

### 2. Installer les dépendances

```bash
npm install axios react-router-dom @mui/material @emotion/react @emotion/styled
npm install @mui/icons-material @mui/x-data-grid
npm install react-hook-form @hookform/resolvers yup
```

### 3. Configuration Axios

Créer `src/services/api.js` :

```javascript
import axios from 'axios';

const API_BASE_URL = 'http://localhost:8000/api/v1';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Intercepteur pour ajouter le token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Token ${token}`;
  }
  return config;
});

// Intercepteur pour gérer les erreurs
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;
```

### 4. Service d'authentification

Créer `src/services/auth.js` :

```javascript
import api from './api';

export const authService = {
  login: async (username, password) => {
    const response = await api.post('/auth/login/', { username, password });
    const { token, user, employee } = response.data;
    
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));
    if (employee) {
      localStorage.setItem('employee', JSON.stringify(employee));
    }
    
    return { token, user, employee };
  },

  logout: async () => {
    try {
      await api.post('/auth/logout/');
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

  isAuthenticated: () => {
    return !!localStorage.getItem('token');
  }
};
```

### 5. Context d'authentification

Créer `src/contexts/AuthContext.js` :

```javascript
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
      const emp = localStorage.getItem('employee');
      if (emp) {
        setEmployee(JSON.parse(emp));
      }
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
    loading
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
```

### 6. Composant de connexion

Créer `src/components/Login.js` :

```javascript
import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Paper,
  TextField,
  Button,
  Typography,
  Box,
  Alert
} from '@mui/material';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await login(username, password);
      navigate('/dashboard');
    } catch (err) {
      setError('Nom d\'utilisateur ou mot de passe incorrect');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="sm">
      <Box sx={{ mt: 8 }}>
        <Paper elevation={3} sx={{ p: 4 }}>
          <Typography variant="h4" align="center" gutterBottom>
            ERP RH - Connexion
          </Typography>
          
          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
          
          <form onSubmit={handleSubmit}>
            <TextField
              fullWidth
              label="Nom d'utilisateur"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              margin="normal"
              required
            />
            <TextField
              fullWidth
              label="Mot de passe"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              margin="normal"
              required
            />
            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ mt: 3, mb: 2 }}
              disabled={loading}
            >
              {loading ? 'Connexion...' : 'Se connecter'}
            </Button>
          </form>
        </Paper>
      </Box>
    </Container>
  );
};

export default Login;
```

### 7. Structure des dossiers recommandée

```
src/
├── components/
│   ├── common/
│   ├── auth/
│   ├── dashboard/
│   ├── employees/
│   ├── requests/
│   └── recruitment/
├── contexts/
├── services/
├── hooks/
├── utils/
└── pages/
```

## 🔐 Gestion des Rôles

Les rôles utilisateur sont :
- `employee` - Employé
- `hr_manager` - Responsable RH
- `hr_director` - Directeur RH
- `administrator` - Administrateur

Utilisez `user.role` pour conditionner l'affichage des fonctionnalités.

## 📝 Exemple d'utilisation des APIs

```javascript
// Récupérer les employés
const getEmployees = async () => {
  const response = await api.get('/employees/');
  return response.data;
};

// Créer une demande de congé
const createLeaveRequest = async (data) => {
  const response = await api.post('/leave-requests/', data);
  return response.data;
};

// Approuver une demande
const approveRequest = async (id) => {
  const response = await api.post(`/leave-requests/${id}/approve/`);
  return response.data;
};
```

## 🚀 Démarrage

1. Démarrer le serveur Django : `py manage.py runserver`
2. Créer et configurer l'app React selon ce guide
3. Démarrer React : `npm start`

Les deux applications communiqueront via les APIs REST avec authentification par token.