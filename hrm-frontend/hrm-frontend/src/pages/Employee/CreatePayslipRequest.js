import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box, Card, CardContent, Typography, TextField, Button,
  Grid, FormControl, InputLabel, Select, MenuItem, Alert
} from '@mui/material';
import { ArrowBack, Send } from '@mui/icons-material';
import { createPayslipRequest } from '../../services/employeeService';

const CreatePayslipRequest = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [formData, setFormData] = useState({
    periode_mois: '',
    comment: ''
  });

  // Générer les options de mois (12 derniers mois)
  const generateMonthOptions = () => {
    const options = [];
    const currentDate = new Date();
    
    for (let i = 0; i < 12; i++) {
      const date = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1);
      const year = date.getFullYear();
      const month = date.getMonth() + 1;
      const monthName = date.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' });
      const value = `${month.toString().padStart(2, '0')}/${year}`;
      
      options.push({
        value: value,
        label: monthName.charAt(0).toUpperCase() + monthName.slice(1)
      });
    }
    
    return options;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.periode_mois) {
      setError('La période est obligatoire');
      return;
    }

    setLoading(true);
    setError('');
    
    try {
      await createPayslipRequest(formData);
      setSuccess('Demande de bulletin de paie soumise avec succès!');
      setTimeout(() => {
        navigate('/employee/requests');
      }, 2000);
    } catch (error) {
      setError(error.response?.data?.error || 'Erreur lors de la soumission');
    } finally {
      setLoading(false);
    }
  };

  const monthOptions = generateMonthOptions();

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <Button
          startIcon={<ArrowBack />}
          onClick={() => navigate('/employee/requests')}
          sx={{ mr: 2 }}
        >
          Retour
        </Button>
        <Typography variant="h4" fontWeight="bold">
          Demande de Bulletin de Paie
        </Typography>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}
      {success && <Alert severity="success" sx={{ mb: 3 }}>{success}</Alert>}

      <Card>
        <CardContent>
          <form onSubmit={handleSubmit}>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <FormControl fullWidth required>
                  <InputLabel>Période</InputLabel>
                  <Select
                    value={formData.periode_mois}
                    label="Période"
                    onChange={(e) => setFormData({ ...formData, periode_mois: e.target.value })}
                  >
                    {monthOptions.map((option) => (
                      <MenuItem key={option.value} value={option.value}>
                        {option.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Commentaire (optionnel)"
                  multiline
                  rows={4}
                  value={formData.comment}
                  onChange={(e) => setFormData({ ...formData, comment: e.target.value })}
                  placeholder="Précisez la raison de votre demande si nécessaire..."
                />
              </Grid>

              <Grid item xs={12}>
                <Box sx={{ display: 'flex', gap: 2 }}>
                  <Button
                    type="submit"
                    variant="contained"
                    startIcon={<Send />}
                    disabled={loading}
                    size="large"
                  >
                    {loading ? 'Soumission...' : 'Soumettre la Demande'}
                  </Button>
                  <Button
                    variant="outlined"
                    size="large"
                    onClick={() => navigate('/employee/requests')}
                  >
                    Annuler
                  </Button>
                </Box>
              </Grid>
            </Grid>
          </form>
        </CardContent>
      </Card>
    </Box>
  );
};

export default CreatePayslipRequest;