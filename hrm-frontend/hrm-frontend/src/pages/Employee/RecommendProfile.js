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
  CircularProgress
} from '@mui/material';
import { jobService } from '../../services/jobService';

const RecommendProfile = () => {
  const { jobId } = useParams();
  const navigate = useNavigate();
  const [jobOffer, setJobOffer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  const [formData, setFormData] = useState({
    candidate_name: '',
    candidate_email: '',
    candidate_phone: '',
    relationship: '',
    recommendation_reason: ''
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    
    try {
      await jobService.recommendProfile(jobId, formData);
      setSuccess('Recommandation envoyée avec succès!');
      setTimeout(() => navigate('/dashboard'), 2000);
    } catch (error) {
      setError('Erreur lors de l\'envoi de la recommandation');
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
            Recommander un Profil
          </Typography>
          
          {jobOffer && (
            <Alert severity="info" sx={{ mb: 3 }}>
              <strong>Poste:</strong> {jobOffer.title}<br />
              <strong>Département:</strong> {jobOffer.department}
            </Alert>
          )}

          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
          {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}

          <Box component="form" onSubmit={handleSubmit}>
            <TextField
              fullWidth
              label="Nom du candidat *"
              value={formData.candidate_name}
              onChange={(e) => setFormData({...formData, candidate_name: e.target.value})}
              sx={{ mb: 3 }}
              required
            />
            
            <TextField
              fullWidth
              label="Email du candidat *"
              type="email"
              value={formData.candidate_email}
              onChange={(e) => setFormData({...formData, candidate_email: e.target.value})}
              sx={{ mb: 3 }}
              required
            />
            
            <TextField
              fullWidth
              label="Téléphone"
              value={formData.candidate_phone}
              onChange={(e) => setFormData({...formData, candidate_phone: e.target.value})}
              sx={{ mb: 3 }}
            />
            
            <TextField
              fullWidth
              label="Votre relation avec le candidat *"
              value={formData.relationship}
              onChange={(e) => setFormData({...formData, relationship: e.target.value})}
              sx={{ mb: 3 }}
              required
            />
            
            <TextField
              fullWidth
              multiline
              rows={4}
              label="Pourquoi recommandez-vous ce profil? *"
              value={formData.recommendation_reason}
              onChange={(e) => setFormData({...formData, recommendation_reason: e.target.value})}
              sx={{ mb: 3 }}
              required
            />

            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
              <Button 
                variant="outlined" 
                onClick={() => navigate('/dashboard')}
                disabled={submitting}
              >
                Annuler
              </Button>
              <Button 
                type="submit" 
                variant="contained" 
                disabled={submitting}
              >
                {submitting ? <CircularProgress size={24} /> : 'Recommander'}
              </Button>
            </Box>
          </Box>
        </CardContent>
      </Card>
    </Container>
  );
};

export default RecommendProfile;