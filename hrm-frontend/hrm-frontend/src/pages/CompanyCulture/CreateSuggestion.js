import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Alert,
  CircularProgress,
  Breadcrumbs,
  Link
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { createSuggestion } from '../../services/cultureService';

const CreateSuggestion = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const { register, handleSubmit, formState: { errors }, reset } = useForm();

  const onSubmit = async (data) => {
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      await createSuggestion(data);
      setSuccess('Suggestion soumise avec succès!');
      setTimeout(() => {
        navigate('/culture/suggestions');
      }, 2000);
    } catch (error) {
      setError(error.response?.data?.error || 'Erreur lors de la soumission');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box>
      {/* Breadcrumbs */}
      <Breadcrumbs sx={{ mb: 3 }}>
        <Link color="inherit" href="/dashboard">
          Tableau de bord
        </Link>
        <Link color="inherit" href="/culture">
          Culture d'entreprise
        </Link>
        <Link color="inherit" href="/culture/suggestions">
          Suggestions
        </Link>
        <Typography color="text.primary">Nouvelle suggestion</Typography>
      </Breadcrumbs>

      {/* En-tête */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" fontWeight="bold" gutterBottom>
          Soumettre une Suggestion
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Partagez vos idées pour améliorer notre entreprise
        </Typography>
      </Box>

      {/* Alertes */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}
      
      {success && (
        <Alert severity="success" sx={{ mb: 3 }}>
          {success}
        </Alert>
      )}

      {/* Formulaire */}
      <Card elevation={0} sx={{ border: '1px solid #e0e0e0', borderRadius: 2, maxWidth: 800 }}>
        <CardContent sx={{ p: 4 }}>
          <form onSubmit={handleSubmit(onSubmit)}>
            <Box sx={{ mb: 3 }}>
              <TextField
                fullWidth
                label="Titre de la suggestion"
                {...register('title', { required: 'Le titre est requis' })}
                error={!!errors.title}
                helperText={errors.title?.message}
              />
            </Box>

            <Box sx={{ mb: 3 }}>
              <TextField
                fullWidth
                multiline
                rows={6}
                label="Description détaillée"
                placeholder="Décrivez votre suggestion en détail..."
                {...register('suggestion_text', { required: 'La description est requise' })}
                error={!!errors.suggestion_text}
                helperText={errors.suggestion_text?.message}
              />
            </Box>

            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
              <Button
                variant="outlined"
                onClick={() => navigate('/culture/suggestions')}
                disabled={loading}
              >
                Annuler
              </Button>
              <Button
                type="submit"
                variant="contained"
                disabled={loading}
                startIcon={loading && <CircularProgress size={20} />}
              >
                {loading ? 'Soumission...' : 'Soumettre la Suggestion'}
              </Button>
            </Box>
          </form>
        </CardContent>
      </Card>

      {/* Conseils */}
      <Card elevation={0} sx={{ border: '1px solid #e3f2fd', borderRadius: 2, mt: 3, maxWidth: 800, backgroundColor: '#f8faff' }}>
        <CardContent>
          <Typography variant="h6" fontWeight="600" gutterBottom color="primary">
            💡 Conseils pour une bonne suggestion
          </Typography>
          <Box component="ul" sx={{ pl: 2, m: 0 }}>
            <Typography component="li" variant="body2" sx={{ mb: 1 }}>
              Soyez spécifique et détaillé dans votre description
            </Typography>
            <Typography component="li" variant="body2" sx={{ mb: 1 }}>
              Expliquez le problème que votre suggestion résout
            </Typography>
            <Typography component="li" variant="body2" sx={{ mb: 1 }}>
              Proposez des solutions concrètes et réalisables
            </Typography>
            <Typography component="li" variant="body2">
              Mentionnez les bénéfices attendus pour l'entreprise
            </Typography>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
};

export default CreateSuggestion;