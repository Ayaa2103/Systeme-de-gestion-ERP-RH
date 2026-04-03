import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Grid,
  MenuItem,
  Alert,
  CircularProgress,
  Breadcrumbs,
  Link
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { createEmployee, getDepartments } from '../../services/hrService';

const CreateEmployee = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [departments, setDepartments] = useState([]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const { register, handleSubmit, formState: { errors }, reset } = useForm();

  useEffect(() => {
    fetchDepartments();
  }, []);

  const fetchDepartments = async () => {
    try {
      const response = await getDepartments();
      setDepartments(response.data);
    } catch (error) {
      console.error('Erreur lors du chargement des départements:', error);
    }
  };

  const onSubmit = async (data) => {
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      await createEmployee(data);
      setSuccess('Employé créé avec succès!');
      setTimeout(() => {
        navigate('/employees');
      }, 2000);
    } catch (error) {
      setError(error.response?.data?.error || 'Erreur lors de la création de l\'employé');
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
        <Link color="inherit" href="/employees">
          Employés
        </Link>
        <Typography color="text.primary">Nouvel employé</Typography>
      </Breadcrumbs>

      {/* En-tête */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" fontWeight="bold" gutterBottom>
          Créer un Nouvel Employé
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Remplissez les informations pour créer un nouveau profil employé
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
      <Card elevation={0} sx={{ border: '1px solid #e0e0e0', borderRadius: 2 }}>
        <CardContent sx={{ p: 4 }}>
          <form onSubmit={handleSubmit(onSubmit)}>
            <Grid container spacing={3}>
              {/* Informations personnelles */}
              <Grid item xs={12}>
                <Typography variant="h6" fontWeight="600" gutterBottom>
                  Informations Personnelles
                </Typography>
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Prénom"
                  {...register('first_name', { required: 'Le prénom est requis' })}
                  error={!!errors.first_name}
                  helperText={errors.first_name?.message}
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Nom"
                  {...register('last_name', { required: 'Le nom est requis' })}
                  error={!!errors.last_name}
                  helperText={errors.last_name?.message}
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Email"
                  type="email"
                  {...register('email', { 
                    required: 'L\'email est requis',
                    pattern: {
                      value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                      message: 'Email invalide'
                    }
                  })}
                  error={!!errors.email}
                  helperText={errors.email?.message}
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Téléphone"
                  {...register('phone')}
                />
              </Grid>

              {/* Informations de connexion */}
              <Grid item xs={12}>
                <Typography variant="h6" fontWeight="600" gutterBottom sx={{ mt: 2 }}>
                  Informations de Connexion
                </Typography>
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Nom d'utilisateur"
                  {...register('username', { required: 'Le nom d\'utilisateur est requis' })}
                  error={!!errors.username}
                  helperText={errors.username?.message}
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Mot de passe temporaire"
                  type="password"
                  {...register('password', { required: 'Le mot de passe est requis' })}
                  error={!!errors.password}
                  helperText={errors.password?.message || 'L\'employé devra changer ce mot de passe à la première connexion'}
                />
              </Grid>

              {/* Informations professionnelles */}
              <Grid item xs={12}>
                <Typography variant="h6" fontWeight="600" gutterBottom sx={{ mt: 2 }}>
                  Informations Professionnelles
                </Typography>
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Matricule"
                  {...register('matricule', { required: 'Le matricule est requis' })}
                  error={!!errors.matricule}
                  helperText={errors.matricule?.message}
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Poste"
                  {...register('poste', { required: 'Le poste est requis' })}
                  error={!!errors.poste}
                  helperText={errors.poste?.message}
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Service"
                  {...register('service')}
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  select
                  label="Département"
                  {...register('department')}
                >
                  <MenuItem value="">
                    <em>Aucun département</em>
                  </MenuItem>
                  {departments.map((dept) => (
                    <MenuItem key={dept.id} value={dept.id}>
                      {dept.name}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Date d'embauche"
                  type="date"
                  InputLabelProps={{ shrink: true }}
                  {...register('date_embauche')}
                />
              </Grid>

              {/* Boutons d'action */}
              <Grid item xs={12}>
                <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end', mt: 3 }}>
                  <Button
                    variant="outlined"
                    onClick={() => navigate('/employees')}
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
                    {loading ? 'Création...' : 'Créer l\'Employé'}
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

export default CreateEmployee;