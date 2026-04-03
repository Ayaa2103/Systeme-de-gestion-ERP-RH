import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Button, 
  Paper, 
  Alert, 
  CircularProgress,
  Chip,
  Divider
} from '@mui/material';
import { useAuth } from '../contexts/AuthContext';

const ApiDiagnostic = () => {
  const { user } = useAuth();
  const [diagnostics, setDiagnostics] = useState({});
  const [loading, setLoading] = useState(false);

  const runDiagnostics = async () => {
    setLoading(true);
    const results = {};

    // Test 1: Vérifier la connectivité de base
    try {
      const response = await fetch('http://localhost:8000/api/v1/health/');
      if (response.ok) {
        const data = await response.json();
        results.connectivity = { success: true, data };
      } else {
        results.connectivity = { success: false, error: `HTTP ${response.status}` };
      }
    } catch (error) {
      results.connectivity = { success: false, error: error.message };
    }

    // Test 2: Vérifier l'authentification
    const token = localStorage.getItem('token');
    results.auth = {
      hasToken: !!token,
      token: token ? `${token.substring(0, 10)}...` : 'Aucun',
      user: user ? `${user.username} (${user.role})` : 'Non connecté'
    };

    // Test 3: Tester les endpoints avec authentification
    if (token) {
      const endpoints = [
        { name: 'Dashboard Stats', url: '/dashboard/stats/' },
        { name: 'New Employees', url: '/dashboard/new-employees-today/' },
        { name: 'Job Offers', url: '/dashboard/recent-job-offers/' }
      ];

      for (const endpoint of endpoints) {
        try {
          const response = await fetch(`http://localhost:8000/api/v1${endpoint.url}`, {
            headers: {
              'Authorization': `Token ${token}`,
              'Content-Type': 'application/json'
            }
          });

          if (response.ok) {
            const data = await response.json();
            results[endpoint.name] = { success: true, data };
          } else {
            const errorData = await response.text();
            results[endpoint.name] = { 
              success: false, 
              error: `HTTP ${response.status}`,
              details: errorData
            };
          }
        } catch (error) {
          results[endpoint.name] = { success: false, error: error.message };
        }
      }
    }

    setDiagnostics(results);
    setLoading(false);
  };

  useEffect(() => {
    runDiagnostics();
  }, []);

  const getStatusColor = (success) => success ? 'success' : 'error';
  const getStatusIcon = (success) => success ? '✅' : '❌';

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Diagnostic API
      </Typography>
      
      <Button 
        variant="contained" 
        onClick={runDiagnostics} 
        disabled={loading}
        sx={{ mb: 3 }}
      >
        {loading ? <CircularProgress size={20} sx={{ mr: 1 }} /> : null}
        {loading ? 'Diagnostic en cours...' : 'Relancer le diagnostic'}
      </Button>

      {/* Informations générales */}
      <Paper sx={{ p: 2, mb: 2 }}>
        <Typography variant="h6" gutterBottom>
          Informations générales
        </Typography>
        <Typography variant="body2">
          <strong>URL API:</strong> http://localhost:8000/api/v1
        </Typography>
        <Typography variant="body2">
          <strong>Utilisateur:</strong> {diagnostics.auth?.user || 'Chargement...'}
        </Typography>
        <Typography variant="body2">
          <strong>Token:</strong> {diagnostics.auth?.token || 'Chargement...'}
        </Typography>
      </Paper>

      {/* Résultats des tests */}
      {Object.entries(diagnostics).map(([testName, result]) => {
        if (testName === 'auth') return null; // Déjà affiché au-dessus
        
        return (
          <Paper key={testName} sx={{ p: 2, mb: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6" sx={{ mr: 2 }}>
                {testName}
              </Typography>
              <Chip 
                label={result.success ? 'Succès' : 'Échec'}
                color={getStatusColor(result.success)}
                size="small"
              />
            </Box>
            
            {result.success ? (
              <Alert severity="success" sx={{ mb: 2 }}>
                {getStatusIcon(result.success)} Test réussi
              </Alert>
            ) : (
              <Alert severity="error" sx={{ mb: 2 }}>
                {getStatusIcon(result.success)} {result.error}
              </Alert>
            )}
            
            <Typography variant="body2" component="pre" sx={{ 
              backgroundColor: '#f5f5f5', 
              p: 1, 
              borderRadius: 1,
              overflow: 'auto',
              maxHeight: 200,
              fontSize: '0.75rem'
            }}>
              {JSON.stringify(result.success ? result.data : result, null, 2)}
            </Typography>
          </Paper>
        );
      })}

      {/* Instructions de dépannage */}
      <Paper sx={{ p: 2, mt: 3 }}>
        <Typography variant="h6" gutterBottom>
          Instructions de dépannage
        </Typography>
        <Typography variant="body2" paragraph>
          1. <strong>Serveur Django:</strong> Vérifiez que le serveur Django fonctionne sur http://localhost:8000
        </Typography>
        <Typography variant="body2" paragraph>
          2. <strong>Authentification:</strong> Assurez-vous d'être connecté avec un compte valide
        </Typography>
        <Typography variant="body2" paragraph>
          3. <strong>CORS:</strong> Vérifiez la configuration CORS dans Django settings.py
        </Typography>
        <Typography variant="body2" paragraph>
          4. <strong>Permissions:</strong> Vérifiez que votre rôle a les permissions nécessaires
        </Typography>
      </Paper>
    </Box>
  );
};

export default ApiDiagnostic;