import React, { useState, useEffect } from 'react';
import { Box, Typography, Button, Paper, Alert } from '@mui/material';
import api from '../services/api';

const ApiTest = () => {
  const [testResults, setTestResults] = useState({});
  const [loading, setLoading] = useState(false);

  const testEndpoints = async () => {
    setLoading(true);
    const endpoints = [
      { name: 'Dashboard Stats', url: '/dashboard/stats/' },
      { name: 'New Employees Today', url: '/dashboard/new-employees-today/' },
      { name: 'Recent Job Offers', url: '/dashboard/recent-job-offers/' }
    ];

    const results = {};

    for (const endpoint of endpoints) {
      try {
        const response = await api.get(endpoint.url);
        results[endpoint.name] = {
          success: true,
          data: response.data,
          status: response.status
        };
      } catch (error) {
        results[endpoint.name] = {
          success: false,
          error: error.response?.data || error.message,
          status: error.response?.status || 'Network Error'
        };
      }
    }

    setTestResults(results);
    setLoading(false);
  };

  useEffect(() => {
    testEndpoints();
  }, []);

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h5" gutterBottom>
        Test de Connectivité API
      </Typography>
      
      <Button 
        variant="contained" 
        onClick={testEndpoints} 
        disabled={loading}
        sx={{ mb: 3 }}
      >
        {loading ? 'Test en cours...' : 'Tester les APIs'}
      </Button>

      {Object.entries(testResults).map(([name, result]) => (
        <Paper key={name} sx={{ p: 2, mb: 2 }}>
          <Typography variant="h6" gutterBottom>
            {name}
          </Typography>
          
          {result.success ? (
            <Alert severity="success" sx={{ mb: 2 }}>
              ✅ Succès (Status: {result.status})
            </Alert>
          ) : (
            <Alert severity="error" sx={{ mb: 2 }}>
              ❌ Erreur (Status: {result.status})
            </Alert>
          )}
          
          <Typography variant="body2" component="pre" sx={{ 
            backgroundColor: '#f5f5f5', 
            p: 1, 
            borderRadius: 1,
            overflow: 'auto',
            maxHeight: 200
          }}>
            {JSON.stringify(result.success ? result.data : result.error, null, 2)}
          </Typography>
        </Paper>
      ))}
    </Box>
  );
};

export default ApiTest;