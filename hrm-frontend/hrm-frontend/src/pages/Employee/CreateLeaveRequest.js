import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box, Card, CardContent, Typography, TextField, Button,
  Grid, FormControl, InputLabel, Select, MenuItem, Alert
} from '@mui/material';
import { ArrowBack, Send } from '@mui/icons-material';
import { createLeaveRequest } from '../../services/employeeService';

const CreateLeaveRequest = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [formData, setFormData] = useState({
    start_date: '',
    end_date: '',
    leave_type: 'annual',
    comment: ''
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.start_date || !formData.end_date) {
      setError('Les dates de début et fin sont obligatoires');
      return;
    }

    if (new Date(formData.end_date) <= new Date(formData.start_date)) {
      setError('La date de fin doit être postérieure à la date de début');
      return;
    }

    setLoading(true);
    setError('');
    
    try {
      await createLeaveRequest(formData);
      setSuccess('Demande de congé soumise avec succès!');
      setTimeout(() => {
        navigate('/employee/requests');
      }, 2000);
    } catch (error) {
      setError(error.response?.data?.error || 'Erreur lors de la soumission');
    } finally {
      setLoading(false);
    }
  };

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
          Demande de Congé
        </Typography>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}
      {success && <Alert severity="success" sx={{ mb: 3 }}>{success}</Alert>}

      <Card>
        <CardContent>
          <form onSubmit={handleSubmit}>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Date de Début"
                  type="date"
                  value={formData.start_date}
                  onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                  InputLabelProps={{ shrink: true }}
                  required
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Date de Fin"
                  type="date"
                  value={formData.end_date}
                  onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                  InputLabelProps={{ shrink: true }}
                  required
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <FormControl fullWidth required>
                  <InputLabel>Type de Congé</InputLabel>
                  <Select
                    value={formData.leave_type}
                    label="Type de Congé"
                    onChange={(e) => setFormData({ ...formData, leave_type: e.target.value })}
                  >
                    <MenuItem value="annual">Congé Annuel</MenuItem>
                    <MenuItem value="sick">Congé Maladie</MenuItem>
                    <MenuItem value="personal">Congé Personnel</MenuItem>
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

export default CreateLeaveRequest;