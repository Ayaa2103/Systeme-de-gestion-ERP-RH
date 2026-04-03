import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box, Card, CardContent, Typography, TextField, Button,
  Grid, FormControl, InputLabel, Select, MenuItem, Alert
} from '@mui/material';
import { ArrowBack, Send } from '@mui/icons-material';
import { createAttestationRequest } from '../../services/employeeService';

const CreateAttestationRequest = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [formData, setFormData] = useState({
    purpose: '',
    attestation_type: 'employment',
    comment: ''
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.purpose) {
      setError('L\'objectif est obligatoire');
      return;
    }

    setLoading(true);
    setError('');
    
    try {
      await createAttestationRequest(formData);
      setSuccess('Demande d\'attestation soumise avec succès!');
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
          Demande d'Attestation
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
                  <InputLabel>Type d'Attestation</InputLabel>
                  <Select
                    value={formData.attestation_type}
                    label="Type d'Attestation"
                    onChange={(e) => setFormData({ ...formData, attestation_type: e.target.value })}
                  >
                    <MenuItem value="employment">Attestation de Travail</MenuItem>
                    <MenuItem value="salary">Attestation de Salaire</MenuItem>
                    <MenuItem value="experience">Attestation d'Expérience</MenuItem>
                    <MenuItem value="internship">Attestation de Stage</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Objectif de l'Attestation"
                  value={formData.purpose}
                  onChange={(e) => setFormData({ ...formData, purpose: e.target.value })}
                  placeholder="Ex: Demande de visa, dossier bancaire, etc."
                  required
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Commentaire (optionnel)"
                  multiline
                  rows={4}
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

export default CreateAttestationRequest;