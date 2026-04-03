import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box, Card, CardContent, Typography, TextField, Button,
  Grid, Alert
} from '@mui/material';
import { ArrowBack, Send } from '@mui/icons-material';
import { createMissionRequest } from '../../services/employeeService';

const CreateMissionRequest = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [formData, setFormData] = useState({
    destination: '',
    start_date: '',
    end_date: '',
    reason: '',
    comment: ''
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.destination || !formData.start_date || !formData.end_date) {
      setError('La destination et les dates sont obligatoires');
      return;
    }

    if (new Date(formData.end_date) <= new Date(formData.start_date)) {
      setError('La date de fin doit être postérieure à la date de début');
      return;
    }

    if (new Date(formData.start_date) < new Date().setHours(0,0,0,0)) {
      setError('La date de début ne peut pas être dans le passé');
      return;
    }

    setLoading(true);
    setError('');
    
    try {
      await createMissionRequest(formData);
      setSuccess('Demande de mission soumise avec succès!');
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
          Demande de Mission
        </Typography>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}
      {success && <Alert severity="success" sx={{ mb: 3 }}>{success}</Alert>}

      <Card>
        <CardContent>
          <form onSubmit={handleSubmit}>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Destination"
                  value={formData.destination}
                  onChange={(e) => setFormData({ ...formData, destination: e.target.value })}
                  placeholder="Ex: Paris, Casablanca, Tunis..."
                  required
                />
              </Grid>

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

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Motif de la Mission"
                  multiline
                  rows={4}
                  value={formData.reason}
                  onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                  placeholder="Décrivez l'objectif et la nature de votre mission..."
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Commentaire (optionnel)"
                  multiline
                  rows={3}
                  value={formData.comment}
                  onChange={(e) => setFormData({ ...formData, comment: e.target.value })}
                  placeholder="Informations supplémentaires..."
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

export default CreateMissionRequest;