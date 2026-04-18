import React, { useState, useEffect } from 'react';
import {
  Box, Card, CardContent, Typography, TextField, Button,
  Grid, MenuItem, Alert, CircularProgress, Avatar, Divider,
  IconButton, Chip,
} from '@mui/material';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { ArrowBack as ArrowBackIcon, Save as SaveIcon, Person as PersonIcon } from '@mui/icons-material';
import { getEmployeeDetail, updateEmployee, getDepartments } from '../../services/hrService';

const COLORS = ['#1976d2', '#9c27b0', '#2e7d32', '#e65100', '#0097a7', '#c62828'];
const avatarColor = (name = '') => COLORS[name.charCodeAt(0) % COLORS.length];

/* ─── Section label ──────────────────────────────────────────────── */
const SectionTitle = ({ children }) => (
  <Box sx={{ mb: 2.5 }}>
    <Typography variant="subtitle2" fontWeight={700} color="text.secondary" sx={{ textTransform: 'uppercase', letterSpacing: 0.8, fontSize: '0.7rem' }}>
      {children}
    </Typography>
    <Divider sx={{ mt: 0.75 }} />
  </Box>
);

const EditEmployee = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [departments, setDepartments] = useState([]);
  const [employee, setEmployee] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const { register, handleSubmit, formState: { errors }, setValue, watch } = useForm();

  const firstName = watch('first_name', '');
  const lastName = watch('last_name', '');
  const fullName = `${firstName} ${lastName}`.trim();

  useEffect(() => { fetchData(); }, [id]);

  const fetchData = async () => {
    try {
      const [empRes, deptRes] = await Promise.all([
        getEmployeeDetail(id),
        getDepartments(),
      ]);
      const emp = empRes.data;
      setEmployee(emp);
      setDepartments(deptRes.data.results || deptRes.data);

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
    } catch (_) {
      setError('Erreur lors du chargement des données.');
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (data) => {
    setSaving(true);
    setError('');
    setSuccess('');
    try {
      await updateEmployee(id, data);
      setSuccess('Modifications enregistrées avec succès.');
      setTimeout(() => navigate(`/employees/${id}`), 1500);
    } catch (err) {
      setError(err.response?.data?.error || 'Erreur lors de la modification.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 300 }}>
        <CircularProgress />
      </Box>
    );
  }

  const initials = `${employee?.user?.first_name?.[0] || ''}${employee?.user?.last_name?.[0] || ''}`.toUpperCase();

  return (
    <Box sx={{ width: '100%' }}>

      {/* En-tête */}
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3, gap: 1.5 }}>
        <IconButton size="small" onClick={() => navigate(`/employees/${id}`)} sx={{ border: '1px solid #e8ecf0' }}>
          <ArrowBackIcon fontSize="small" />
        </IconButton>
        <Box sx={{ flex: 1 }}>
          <Typography variant="h5" fontWeight={700}>Modifier l'employé</Typography>
          <Typography variant="body2" color="text.secondary">
            {employee?.user?.first_name} {employee?.user?.last_name} · {employee?.matricule}
          </Typography>
        </Box>
        <Avatar
          src={employee?.photo}
          sx={{ width: 42, height: 42, bgcolor: avatarColor(fullName || initials), fontWeight: 700 }}
        >
          {!employee?.photo && initials}
        </Avatar>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>{error}</Alert>}
      {success && <Alert severity="success" sx={{ mb: 2, borderRadius: 2 }}>{success}</Alert>}

      <form onSubmit={handleSubmit(onSubmit)}>
        <Grid container spacing={3}>

          {/* ── Informations personnelles ── */}
          <Grid item xs={12} md={6}>
            <Card elevation={0} sx={{ border: '1px solid #e8ecf0', borderRadius: 3, height: '100%' }}>
              <CardContent sx={{ p: 3 }}>
                <SectionTitle>Informations personnelles</SectionTitle>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth size="small" label="Prénom"
                      {...register('first_name', { required: 'Champ requis' })}
                      error={!!errors.first_name} helperText={errors.first_name?.message}
                      sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth size="small" label="Nom"
                      {...register('last_name', { required: 'Champ requis' })}
                      error={!!errors.last_name} helperText={errors.last_name?.message}
                      sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth size="small" label="Email" type="email"
                      {...register('email', {
                        required: 'Champ requis',
                        pattern: { value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i, message: 'Email invalide' }
                      })}
                      error={!!errors.email} helperText={errors.email?.message}
                      sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth size="small" label="Téléphone"
                      {...register('phone')}
                      sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                    />
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>

          {/* ── Informations professionnelles ── */}
          <Grid item xs={12} md={6}>
            <Card elevation={0} sx={{ border: '1px solid #e8ecf0', borderRadius: 3, height: '100%' }}>
              <CardContent sx={{ p: 3 }}>
                <SectionTitle>Informations professionnelles</SectionTitle>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth size="small" label="Matricule"
                      {...register('matricule', { required: 'Champ requis' })}
                      error={!!errors.matricule} helperText={errors.matricule?.message}
                      sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth size="small" label="Poste"
                      {...register('poste')}
                      sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth size="small" label="Service"
                      {...register('service')}
                      sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth size="small" select label="Département"
                      {...register('department')}
                      sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                    >
                      <MenuItem value=""><em>Aucun</em></MenuItem>
                      {departments.map((d) => (
                        <MenuItem key={d.id} value={d.id}>{d.name}</MenuItem>
                      ))}
                    </TextField>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth size="small" label="Date d'embauche" type="date"
                      InputLabelProps={{ shrink: true }}
                      {...register('date_embauche')}
                      sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth size="small" select label="Statut"
                      {...register('statut')}
                      sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                    >
                      <MenuItem value="actif">Actif</MenuItem>
                      <MenuItem value="inactif">Inactif</MenuItem>
                      <MenuItem value="suspendu">Suspendu</MenuItem>
                      <MenuItem value="congé">Congé</MenuItem>
                    </TextField>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>

          {/* ── Actions ── */}
          <Grid item xs={12}>
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
              <Button
                variant="outlined"
                onClick={() => navigate(`/employees/${id}`)}
                disabled={saving}
                sx={{ borderRadius: 2, textTransform: 'none', px: 3 }}
              >
                Annuler
              </Button>
              <Button
                type="submit"
                variant="contained"
                disabled={saving}
                startIcon={saving ? <CircularProgress size={16} color="inherit" /> : <SaveIcon />}
                sx={{ borderRadius: 2, textTransform: 'none', px: 3, fontWeight: 600 }}
              >
                {saving ? 'Enregistrement…' : 'Enregistrer'}
              </Button>
            </Box>
          </Grid>

        </Grid>
      </form>
    </Box>
  );
};

export default EditEmployee;
