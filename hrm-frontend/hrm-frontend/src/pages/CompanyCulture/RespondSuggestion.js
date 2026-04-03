import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  Divider
} from '@mui/material';
import { ArrowBack as ArrowBackIcon, Send as SendIcon } from '@mui/icons-material';
import { getSuggestionDetail, respondToSuggestion } from '../../services/cultureService';

const RespondSuggestion = () => {
  const { suggestionId } = useParams();
  const navigate = useNavigate();
  const [suggestion, setSuggestion] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [formData, setFormData] = useState({
    status: 'approved',
    response: ''
  });

  useEffect(() => {
    fetchSuggestion();
  }, [suggestionId]);

  const fetchSuggestion = async () => {
    try {
      const response = await getSuggestionDetail(suggestionId);
      setSuggestion(response.data);
    } catch (error) {
      setError('Erreur lors du chargement de la suggestion');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setError('');
      
      if (!formData.response.trim()) {
        setError('La réponse est obligatoire');
        return;
      }

      await respondToSuggestion(suggestionId, formData);
      setSuccess('Réponse envoyée avec succès!');
      setTimeout(() => {
        navigate('/culture/suggestions');
      }, 2000);
    } catch (error) {
      setError(error.response?.data?.error || 'Erreur lors de l\'envoi de la réponse');
    }
  };

  if (loading) return <Typography>Chargement...</Typography>;

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate('/culture/suggestions')}
          sx={{ mr: 2 }}
        >
          Retour
        </Button>
        <Typography variant="h4" fontWeight="bold">
          💬 Répondre à la Suggestion
        </Typography>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}
      {success && <Alert severity="success" sx={{ mb: 3 }}>{success}</Alert>}

      <Grid container spacing={3}>
        {/* Suggestion originale */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" color="primary" gutterBottom>
                Suggestion Originale
              </Typography>
              <Divider sx={{ mb: 2 }} />
              
              {suggestion && (
                <>
                  <Typography variant="h6" gutterBottom>
                    {suggestion.title}
                  </Typography>
                  <Typography variant="body1" paragraph sx={{ whiteSpace: 'pre-line' }}>
                    {suggestion.suggestion_text}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Par {suggestion.employee_name} le {new Date(suggestion.date).toLocaleDateString('fr-FR')} à {new Date(suggestion.date).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                  </Typography>
                </>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Formulaire de réponse */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" color="primary" gutterBottom>
                Votre Réponse
              </Typography>
              <Divider sx={{ mb: 2 }} />
              
              <form onSubmit={handleSubmit}>
                <Grid container spacing={3}>
                  <Grid item xs={12}>
                    <FormControl fullWidth>
                      <InputLabel>Statut</InputLabel>
                      <Select
                        value={formData.status}
                        onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                        label="Statut"
                        required
                      >
                        <MenuItem value="approved">Approuvée</MenuItem>
                        <MenuItem value="rejected">Rejetée</MenuItem>
                        <MenuItem value="under_review">En cours d'examen</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>

                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Réponse"
                      multiline
                      rows={6}
                      value={formData.response}
                      onChange={(e) => setFormData({ ...formData, response: e.target.value })}
                      placeholder="Écrivez votre réponse à cette suggestion..."
                      required
                    />
                  </Grid>

                  <Grid item xs={12}>
                    <Box sx={{ display: 'flex', gap: 2 }}>
                      <Button
                        type="submit"
                        variant="contained"
                        startIcon={<SendIcon />}
                        size="large"
                        color="success"
                      >
                        Envoyer la Réponse
                      </Button>
                      <Button
                        variant="outlined"
                        size="large"
                        onClick={() => navigate('/culture/suggestions')}
                      >
                        Annuler
                      </Button>
                    </Box>
                  </Grid>
                </Grid>
              </form>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default RespondSuggestion;