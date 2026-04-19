import React, { useState, useEffect } from 'react';
import {
  Box, Card, CardContent, Typography, TextField,
  Button, Grid, MenuItem, Alert, CircularProgress, IconButton,
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  PersonAdd as PersonAddIcon,
  Person as PersonIcon,
  Lock as LockIcon,
  Work as WorkIcon,
  Save as SaveIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { createEmployee, getDepartments } from '../../services/hrService';

const SectionCard = ({ icon, title, children }) => (
  <Card elevation={0} sx={{ border: '1px solid #e8ecf0', borderRadius: 3, overflow: 'hidden', mb: 3 }}>
    <Box sx={{
      px: 3, py: 1.75,
      display: 'flex', alignItems: 'center', gap: 1.5,
      bgcolor: '#f8fafc', borderBottom: '1px solid #e8ecf0',
    }}>
      <Box sx={{ p: 0.75, borderRadius: 2, bgcolor: '#eff6ff', display: 'inline-flex' }}>
        {React.cloneElement(icon, { sx: { fontSize: 17, color: '#1976d2' } })}
      </Box>
      <Typography variant="subtitle2" fontWeight={700} color="text.primary">{title}</Typography>
    </Box>
    <CardContent sx={{ p: 3 }}>
      {children}
    </CardContent>
  </Card>
);

const fieldSx = {
  '& .MuiOutlinedInput-root': { borderRadius: 2 },
};

const CreateEmployee = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [departments, setDepartments] = useState([]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const { register, handleSubmit, formState: { errors } } = useForm();

  useEffect(() => { fetchDepartments(); }, []);

  const fetchDepartments = async () => {
    try {
      const res = await getDepartments();
      setDepartments(res.data);
    } catch (_) {}
  };

  const onSubmit = async (data) => {
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      await createEmployee(data);
      setSuccess('Employé créé avec succès !');
      setTimeout(() => navigate('/employees'), 2000);
    } catch (err) {
      setError(err.response?.data?.error || "Erreur lors de la création de l'employé");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ width: '100%' }}>

      {/* ── Banner ── */}
      <Card elevation={0} sx={{ borderRadius: 3, border: '1px solid #e8ecf0', mb: 3, overflow: 'hidden' }}>
        <Box sx={{
          background: 'linear-gradient(135deg, #0f172a 0%, #1e3a5f 60%, #1e40af 100%)',
          px: 3, py: 3,
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2.5 }}>
            <IconButton
              size="small" onClick={() => navigate('/employees')}
              sx={{ color: 'rgba(255,255,255,0.6)', '&:hover': { bgcolor: 'rgba(255,255,255,0.1)', color: 'white' } }}
            >
              <ArrowBackIcon fontSize="small" />
            </IconButton>
            <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.55)' }}>
              Retour aux employés
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Box sx={{ p: 1.5, borderRadius: 2.5, bgcolor: 'rgba(255,255,255,0.12)', flexShrink: 0 }}>
              <PersonAddIcon sx={{ fontSize: 28, color: 'white' }} />
            </Box>
            <Box>
              <Typography variant="h5" fontWeight={700} color="white" sx={{ lineHeight: 1.2 }}>
                Nouvel Employé
              </Typography>
              <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.65)', mt: 0.3 }}>
                Remplissez les informations pour créer un nouveau profil employé
              </Typography>
            </Box>
          </Box>
        </Box>
      </Card>

      {/* ── Alertes ── */}
      {error && (
        <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}
      {success && (
        <Alert severity="success" sx={{ mb: 3, borderRadius: 2 }}>
          {success}
        </Alert>
      )}

      <form onSubmit={handleSubmit(onSubmit)}>

        {/* ── Informations personnelles ── */}
        <SectionCard icon={<PersonIcon />} title="Informations personnelles">
          <Grid container spacing={2.5}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth size="small" label="Prénom"
                {...register('first_name', { required: 'Le prénom est requis' })}
                error={!!errors.first_name} helperText={errors.first_name?.message}
                sx={fieldSx}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth size="small" label="Nom"
                {...register('last_name', { required: 'Le nom est requis' })}
                error={!!errors.last_name} helperText={errors.last_name?.message}
                sx={fieldSx}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth size="small" label="Email" type="email"
                {...register('email', {
                  required: "L'email est requis",
                  pattern: { value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i, message: 'Email invalide' },
                })}
                error={!!errors.email} helperText={errors.email?.message}
                sx={fieldSx}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth size="small" label="Téléphone"
                {...register('phone')}
                sx={fieldSx}
              />
            </Grid>
          </Grid>
        </SectionCard>

        {/* ── Informations de connexion ── */}
        <SectionCard icon={<LockIcon />} title="Informations de connexion">
          <Grid container spacing={2.5}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth size="small" label="Nom d'utilisateur"
                {...register('username', { required: "Le nom d'utilisateur est requis" })}
                error={!!errors.username} helperText={errors.username?.message}
                sx={fieldSx}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth size="small" label="Mot de passe temporaire" type="password"
                {...register('password', { required: 'Le mot de passe est requis' })}
                error={!!errors.password}
                helperText={errors.password?.message || "L'employé devra changer ce mot de passe à la première connexion"}
                sx={fieldSx}
              />
            </Grid>
          </Grid>
        </SectionCard>

        {/* ── Informations professionnelles ── */}
        <SectionCard icon={<WorkIcon />} title="Informations professionnelles">
          <Grid container spacing={2.5}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth size="small" label="Matricule"
                {...register('matricule', { required: 'Le matricule est requis' })}
                error={!!errors.matricule} helperText={errors.matricule?.message}
                sx={fieldSx}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth size="small" label="Poste"
                {...register('poste', { required: 'Le poste est requis' })}
                error={!!errors.poste} helperText={errors.poste?.message}
                sx={fieldSx}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth size="small" label="Service"
                {...register('service')}
                sx={fieldSx}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth size="small" select label="Département"
                defaultValue=""
                {...register('department')}
                sx={fieldSx}
              >
                <MenuItem value=""><em>Aucun département</em></MenuItem>
                {departments.map((dept) => (
                  <MenuItem key={dept.id} value={dept.id}>{dept.name}</MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth size="small" label="Date d'embauche" type="date"
                InputLabelProps={{ shrink: true }}
                {...register('date_embauche')}
                sx={fieldSx}
              />
            </Grid>
          </Grid>
        </SectionCard>

        {/* ── Actions ── */}
        <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
          <Button
            variant="outlined" onClick={() => navigate('/employees')} disabled={loading}
            sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 600, px: 3 }}
          >
            Annuler
          </Button>
          <Button
            type="submit" variant="contained" disabled={loading}
            startIcon={loading ? <CircularProgress size={18} color="inherit" /> : <SaveIcon />}
            sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 600, px: 3 }}
          >
            {loading ? 'Création…' : "Créer l'employé"}
          </Button>
        </Box>

      </form>
    </Box>
  );
};

export default CreateEmployee;
