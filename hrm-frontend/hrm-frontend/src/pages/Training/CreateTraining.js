import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Grid,
  Alert,
  CircularProgress,
  Breadcrumbs,
  Link,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  OutlinedInput
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useForm, Controller } from 'react-hook-form';
import { createTraining, getEmployees } from '../../services/hrService';

const CreateTraining = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [employees, setEmployees] = useState([]);
  const [selectedEmployees, setSelectedEmployees] = useState([]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const { register, handleSubmit, formState: { errors }, control } = useForm();

  useEffect(() => {
    fetchEmployees();
  }, []);

  const fetchEmployees = async () => {
    try {
      const response = await getEmployees({ status: 'actif' });
      setEmployees(response.data.results || response.data);
    } catch (error) {
      console.error('Erreur lors du chargement des employés:', error);
    }
  };

  const onSubmit = async (data) => {
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const trainingData = {
        ...data,
        employee_ids: selectedEmployees
      };
      
      await createTraining(trainingData);
      setSuccess('Formation créée avec succès! En attente de validation.');
      setTimeout(() => {
        navigate('/manage-trainings');
      }, 2000);
    } catch (error) {
      setError(error.response?.data?.error || 'Erreur lors de la création de la formation');
    } finally {
      setLoading(false);
    }
  };

  const handleEmployeeChange = (event) => {
    const value = event.target.value;
    setSelectedEmployees(typeof value === 'string' ? value.split(',') : value);
  };

  return (
    <Box>
      {/* Breadcrumbs */}
      <Breadcrumbs sx={{ mb: 3 }}>
        <Link color="inherit" href="/dashboard">
          Tableau de bord
        </Link>
        <Link color="inherit" href="/manage-trainings">
          Formations
        </Link>
        <Typography color="text.primary">Nouvelle formation</Typography>
      </Breadcrumbs>

      {/* En-tête */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" fontWeight="bold" gutterBottom>
          Créer une Nouvelle Formation
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Planifiez une formation pour vos employés
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
              {/* Informations de base */}
              <Grid item xs={12}>
                <Typography variant="h6" fontWeight="600" gutterBottom>
                  Informations de la Formation
                </Typography>
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Nom de la formation"
                  {...register('name', { required: 'Le nom est requis' })}
                  error={!!errors.name}
                  helperText={errors.name?.message}
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  multiline
                  rows={4}
                  label="Description"
                  {...register('description', { required: 'La description est requise' })}
                  error={!!errors.description}
                  helperText={errors.description?.message}
                />
              </Grid>

              {/* Dates */}
              <Grid item xs={12}>
                <Typography variant="h6" fontWeight="600" gutterBottom sx={{ mt: 2 }}>
                  Planification
                </Typography>
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Date de début"
                  type="date"
                  InputLabelProps={{ shrink: true }}
                  {...register('start_date', { required: 'La date de début est requise' })}
                  error={!!errors.start_date}
                  helperText={errors.start_date?.message}
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Date de fin"
                  type="date"
                  InputLabelProps={{ shrink: true }}
                  {...register('end_date', { required: 'La date de fin est requise' })}
                  error={!!errors.end_date}
                  helperText={errors.end_date?.message}
                />
              </Grid>

              {/* Participants */}
              <Grid item xs={12}>
                <Typography variant="h6" fontWeight="600" gutterBottom sx={{ mt: 2 }}>
                  Participants
                </Typography>
              </Grid>

              <Grid item xs={12}>
                <FormControl fullWidth>
                  <InputLabel>Employés participants</InputLabel>
                  <Select
                    multiple
                    value={selectedEmployees}
                    onChange={handleEmployeeChange}
                    input={<OutlinedInput label="Employés participants" />}
                    renderValue={(selected) => (
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                        {selected.map((value) => {
                          const employee = employees.find(emp => emp.id === parseInt(value));
                          return (
                            <Chip 
                              key={value} 
                              label={employee ? `${employee.user?.first_name} ${employee.user?.last_name}` : value}
                              size="small"
                            />
                          );
                        })}
                      </Box>
                    )}
                  >
                    {employees.map((employee) => (
                      <MenuItem key={employee.id} value={employee.id}>
                        {employee.user?.first_name} {employee.user?.last_name} - {employee.matricule}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              {/* Boutons d'action */}
              <Grid item xs={12}>
                <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end', mt: 3 }}>
                  <Button
                    variant="outlined"
                    onClick={() => navigate('/manage-trainings')}
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
                    {loading ? 'Création...' : 'Créer la Formation'}
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

export default CreateTraining;