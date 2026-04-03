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
import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { getEmployeeDetail, updateEmployee, getDepartments, getPositions } from '../../services/hrService';

const EditEmployee = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [departments, setDepartments] = useState([]);
  const [positions, setPositions] = useState([]);
  const [employee, setEmployee] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const { register, handleSubmit, formState: { errors }, reset, setValue } = useForm();

  useEffect(() => {
    fetchData();
  }, [id]);

  const fetchData = async () => {
    try {
      const [employeeRes, departmentsRes, positionsRes] = await Promise.all([
        getEmployeeDetail(id),
        getDepartments(),
        getPositions()
      ]);
      
      const emp = employeeRes.data;
      setEmployee(emp);
      setDepartments(departmentsRes.data);
      setPositions(positionsRes.data);
      
      // Pré-remplir le formulaire
      setValue('first_name', emp.user?.first_name || '');
      setValue('last_name', emp.user?.last_name || '');
      setValue('email', emp.user?.email || '');
      setValue('phone', emp.user?.phone || '');
      setValue('matricule', emp.matricule || '');
      setValue('poste', emp.poste || '');
      setValue('service', emp.service || '');
      setValue('department', emp.department || '');
      setValue('date_embauche', emp.date_embauche || '');
      setValue('statut', emp.statut || 'actif');
      
    } catch (error) {
      setError('Erreur lors du chargement des données');
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (data) => {
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      await updateEmployee(id, data);
      setSuccess('Employé modifié avec succès!');
      setTimeout(() => {
        navigate(`/employees/${id}`);
      }, 2000);
    } catch (error) {
      setError(error.response?.data?.error || 'Erreur lors de la modification');
    } finally {
      setLoading(false);
    }
  };

  if (loading && !employee) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Breadcrumbs sx={{ mb: 3 }}>
        <Link color="inherit" href="/dashboard">Tableau de bord</Link>
        <Link color="inherit" href="/employees">Employés</Link>
        <Link color="inherit" href={`/employees/${id}`}>
          {employee?.user?.first_name} {employee?.user?.last_name}
        </Link>
        <Typography color="text.primary">Modifier</Typography>
      </Breadcrumbs>

      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" fontWeight="bold" gutterBottom>
          Modifier l'Employé
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Modifiez les informations de {employee?.user?.first_name} {employee?.user?.last_name}
        </Typography>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}
      {success && <Alert severity="success" sx={{ mb: 3 }}>{success}</Alert>}

      <Card elevation={0} sx={{ border: '1px solid #e0e0e0', borderRadius: 2 }}>
        <CardContent sx={{ p: 4 }}>
          <form onSubmit={handleSubmit(onSubmit)}>
            <Grid container spacing={3}>
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

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  select
                  label="Poste"
                  {...register('poste')}
                >
                  <MenuItem value="">Sélectionner un poste</MenuItem>
                  {positions.map((position) => (
                    <MenuItem key={position.id} value={position.name}>
                      {position.name}
                    </MenuItem>
                  ))}
                </TextField>
                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
                  Ou saisir un nouveau poste ci-dessous
                </Typography>
                <TextField
                  fullWidth
                  label="Nouveau poste (optionnel)"
                  {...register('poste_custom')}
                  placeholder="Nouveau poste (optionnel)"
                  sx={{ mt: 2 }}
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

              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  select
                  label="Statut"
                  {...register('statut')}
                >
                  <MenuItem value="actif">Actif</MenuItem>
                  <MenuItem value="inactif">Inactif</MenuItem>
                  <MenuItem value="suspendu">Suspendu</MenuItem>
                </TextField>
              </Grid>

              <Grid item xs={12}>
                <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end', mt: 3 }}>
                  <Button
                    variant="outlined"
                    onClick={() => navigate(`/employees/${id}`)}
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
                    {loading ? 'Modification...' : 'Modifier'}
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

export default EditEmployee;