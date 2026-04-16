import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Grid,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  LinearProgress,
  IconButton
} from '@mui/material';
import { ArrowBack as ArrowBackIcon } from '@mui/icons-material';
import { getEmployeeDetail, createContract } from '../../services/hrService';

const CreateContract = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [employee, setEmployee] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [formData, setFormData] = useState({
    type: 'CDI',
    date_debut: '',
    date_fin: '',
    salaire: ''
  });

  useEffect(() => {
    const fetchEmployee = async () => {
      try {
        const res = await getEmployeeDetail(id);
        setEmployee(res.data);
      } catch (err) {
        setError("Impossible de charger les informations de l'employé.");
      } finally {
        setLoading(false);
      }
    };
    fetchEmployee();
  }, [id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.date_debut) {
      setError('La date de début est obligatoire.');
      return;
    }
    if (formData.date_fin && formData.date_fin < formData.date_debut) {
      setError('La date de fin doit être postérieure à la date de début.');
      return;
    }

    setSubmitting(true);
    try {
      await createContract({
        employee: parseInt(id),
        type: formData.type,
        date_debut: formData.date_debut,
        date_fin: formData.date_fin || null,
        salaire: formData.salaire ? parseFloat(formData.salaire) : null,
        active: true
      });
      setSuccess('Contrat créé avec succès !');
      setTimeout(() => navigate(`/employees/${id}`), 1500);
    } catch (err) {
      setError(
        err.response?.data?.error ||
        err.response?.data?.message ||
        'Erreur lors de la création du contrat.'
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <Box sx={{ p: 3 }}>
        <LinearProgress />
        <Typography sx={{ mt: 2 }}>Chargement...</Typography>
      </Box>
    );
  }

  return (
    <Box>
      {/* En-tête */}
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <IconButton onClick={() => navigate(`/employees/${id}`)} sx={{ mr: 2 }}>
          <ArrowBackIcon />
        </IconButton>
        <Box>
          <Typography variant="h4" fontWeight="bold">
            Nouveau Contrat
          </Typography>
          {employee && (
            <Typography variant="body1" color="text.secondary">
              Pour : {employee.user?.first_name} {employee.user?.last_name} — {employee.matricule}
            </Typography>
          )}
        </Box>
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
      <Card elevation={0} sx={{ border: '1px solid #e0e0e0', borderRadius: 2 }}>
        <CardContent>
          <form onSubmit={handleSubmit}>
            <Grid container spacing={3}>
              {/* Type de contrat */}
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth required>
                  <InputLabel>Type de contrat</InputLabel>
                  <Select
                    value={formData.type}
                    label="Type de contrat"
                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                  >
                    <MenuItem value="CDI">CDI</MenuItem>
                    <MenuItem value="CDD">CDD</MenuItem>
                    <MenuItem value="Stage">Stage</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              {/* Salaire */}
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Salaire (€)"
                  type="number"
                  inputProps={{ min: 0, step: '0.01' }}
                  value={formData.salaire}
                  onChange={(e) => setFormData({ ...formData, salaire: e.target.value })}
                  helperText="Optionnel"
                />
              </Grid>

              {/* Date de début */}
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  required
                  label="Date de début"
                  type="date"
                  InputLabelProps={{ shrink: true }}
                  value={formData.date_debut}
                  onChange={(e) => setFormData({ ...formData, date_debut: e.target.value })}
                />
              </Grid>

              {/* Date de fin */}
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Date de fin"
                  type="date"
                  InputLabelProps={{ shrink: true }}
                  value={formData.date_fin}
                  onChange={(e) => setFormData({ ...formData, date_fin: e.target.value })}
                  helperText="Laisser vide pour un CDI sans limite"
                />
              </Grid>

              {/* Boutons */}
              <Grid item xs={12}>
                <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
                  <Button
                    variant="outlined"
                    onClick={() => navigate(`/employees/${id}`)}
                    disabled={submitting}
                  >
                    Annuler
                  </Button>
                  <Button
                    type="submit"
                    variant="contained"
                    disabled={submitting}
                  >
                    {submitting ? 'Création...' : 'Créer le Contrat'}
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

export default CreateContract;
