import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Box,
  Alert,
  CircularProgress,
  Grid
} from '@mui/material';
import { jobService } from '../../services/jobService';

const ApplyJob = () => {
  const { jobId } = useParams();
  const navigate = useNavigate();
  const [jobOffer, setJobOffer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    cv: null,
    cover_letter: ''
  });

  useEffect(() => {
    fetchJobOffer();
  }, [jobId]);

  const fetchJobOffer = async () => {
    try {
      const response = await jobService.getPublicJobDetail(jobId);
      setJobOffer(response.data);
    } catch (error) {
      setError('Erreur lors du chargement de l\'offre');
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e) => {
    setFormData({...formData, cv: e.target.files[0]});
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    
    // Validation
    if (!formData.cv) {
      setError('Le CV est obligatoire');
      setSubmitting(false);
      return;
    }
    
    const applicationData = new FormData();
    applicationData.append('first_name', formData.first_name);
    applicationData.append('last_name', formData.last_name);
    applicationData.append('email', formData.email);
    applicationData.append('phone', formData.phone);
    applicationData.append('cover_letter', formData.cover_letter);
    applicationData.append('cv', formData.cv);
    
    try {
      await jobService.applyToJob(jobId, applicationData);
      setSuccess('Candidature envoyée avec succès!');
      setTimeout(() => navigate('/dashboard'), 2000);
    } catch (error) {
      console.error('Application error:', error);
      setError(error.response?.data?.detail || 'Erreur lors de l\'envoi de la candidature');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <Container maxWidth="md" sx={{ mt: 4, display: 'flex', justifyContent: 'center' }}>
        <CircularProgress />
      </Container>
    );
  }

  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
      <Card>
        <CardContent>
          <Typography variant="h4" gutterBottom>
            Postuler pour: {jobOffer?.title}
          </Typography>
          <Typography variant="subtitle1" color="text.secondary" gutterBottom>
            {jobOffer?.department}
          </Typography>

          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
          {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}

          <Box component="form" onSubmit={handleSubmit}>
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Prénom *"
                  value={formData.first_name}
                  onChange={(e) => setFormData({...formData, first_name: e.target.value})}
                  sx={{ mb: 3 }}
                  required
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Nom *"
                  value={formData.last_name}
                  onChange={(e) => setFormData({...formData, last_name: e.target.value})}
                  sx={{ mb: 3 }}
                  required
                />
              </Grid>
            </Grid>

            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Email *"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  sx={{ mb: 3 }}
                  required
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Téléphone *"
                  value={formData.phone}
                  onChange={(e) => setFormData({...formData, phone: e.target.value})}
                  sx={{ mb: 3 }}
                  required
                />
              </Grid>
            </Grid>
            
            <Box sx={{ mb: 3 }}>
              <Typography variant="body2" sx={{ mb: 1 }}>CV (PDF) *</Typography>
              <input
                type="file"
                accept=".pdf,.doc,.docx"
                onChange={handleFileChange}
                required
                style={{ 
                  width: '100%', 
                  padding: '8px',
                  border: '1px solid #ccc',
                  borderRadius: '4px'
                }}
              />
              <Typography variant="caption" color="text.secondary">
                Formats acceptés: PDF, DOC, DOCX (Max 5MB)
              </Typography>
            </Box>
            
            <TextField
              fullWidth
              multiline
              rows={4}
              label="Lettre de Motivation"
              value={formData.cover_letter}
              onChange={(e) => setFormData({...formData, cover_letter: e.target.value})}
              sx={{ mb: 3 }}
            />

            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
              <Button 
                variant="outlined" 
                onClick={() => navigate('/dashboard')}
                disabled={submitting}
              >
                Retour
              </Button>
              <Button 
                type="submit" 
                variant="contained" 
                color="success"
                disabled={submitting}
              >
                {submitting ? <CircularProgress size={24} /> : 'Envoyer ma Candidature'}
              </Button>
            </Box>
          </Box>
        </CardContent>
      </Card>
    </Container>
  );
};

export default ApplyJob;