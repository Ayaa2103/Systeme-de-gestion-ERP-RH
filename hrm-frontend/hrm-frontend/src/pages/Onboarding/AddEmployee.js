import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box, Card, CardContent, Typography, Button, Grid, Avatar,
  Alert, Divider, Chip, TextField, InputAdornment, Skeleton,
} from '@mui/material';
import {
  PersonAdd as PersonAddIcon,
  ArrowBack as BackIcon,
  HowToReg as OnboardIcon,
  Search as SearchIcon,
  CalendarToday as CalendarIcon,
  CheckCircle as CheckIcon,
  Assignment as TaskIcon,
  School as TrainingIcon,
  Description as DocIcon,
  Schedule as FollowIcon,
  Email as EmailIcon,
  Work as WorkIcon,
  Badge as MatIcon,
} from '@mui/icons-material';
import api from '../../services/api';

const COLORS = ['#1976d2','#388e3c','#d32f2f','#7b1fa2','#f57c00','#0097a7','#c2185b','#5d4037'];
const avatarColor = (name = '') => COLORS[(name.charCodeAt(0) || 0) % COLORS.length];

const fieldSx = {
  '& .MuiOutlinedInput-root': {
    borderRadius: 2, fontSize: '0.875rem',
    '&:hover fieldset': { borderColor: '#1976d2' },
    '&.Mui-focused fieldset': { borderColor: '#1976d2' },
  },
};

const SectionLabel = ({ label, required }) => (
  <Typography sx={{ fontSize: '0.78rem', fontWeight: 700, color: '#475569',
    textTransform: 'uppercase', letterSpacing: '0.5px', mb: 0.75 }}>
    {label} {required && <span style={{ color: '#ef4444' }}>*</span>}
  </Typography>
);

const NavHeader = ({ title, icon }) => (
  <Box sx={{ background: 'linear-gradient(135deg,#0f172a,#1e3a5f,#1e40af)',
    px: 2.5, py: 1.5, display: 'flex', alignItems: 'center', gap: 1.5, borderRadius: '12px 12px 0 0' }}>
    <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.12)', width: 28, height: 28, borderRadius: 1.5 }}>
      {React.cloneElement(icon, { sx: { fontSize: 14, color: 'white' } })}
    </Avatar>
    <Typography sx={{ color: 'white', fontWeight: 700, fontSize: '0.88rem' }}>{title}</Typography>
  </Box>
);

const PLAN_ITEMS = [
  { icon: <CheckIcon />,   label: 'Checklist d\'intégration', sub: '12 étapes à compléter',          color: '#1976d2' },
  { icon: <TaskIcon />,    label: 'Tâches assignées',          sub: 'RH, IT, Manager, Employé',       color: '#7b1fa2' },
  { icon: <TrainingIcon />,label: 'Formations obligatoires',   sub: 'Sécurité, Qualité, Culture',     color: '#2e7d32' },
  { icon: <FollowIcon />,  label: 'Points de suivi',           sub: 'Semaine 1, Mois 1, Mois 3',      color: '#f57c00' },
  { icon: <DocIcon />,     label: 'Documents à signer',        sub: 'Contrat, règlement intérieur…',  color: '#0891b2' },
];

const AddEmployee = () => {
  const navigate = useNavigate();

  const [employees,  setEmployees]  = useState([]);
  const [loadingEmp, setLoadingEmp] = useState(true);
  const [search,     setSearch]     = useState('');
  const [selected,   setSelected]   = useState(null);
  const [startDate,  setStartDate]  = useState('');
  const [endDate,    setEndDate]    = useState('');
  const [loading,    setLoading]    = useState(false);
  const [error,      setError]      = useState('');
  const [success,    setSuccess]    = useState('');

  useEffect(() => {
    api.get('/onboarding/employees/')
      .then(r => setEmployees(Array.isArray(r.data) ? r.data : []))
      .catch(() => {})
      .finally(() => setLoadingEmp(false));
  }, []);

  const filteredEmps = employees.filter(e => {
    const q = search.toLowerCase();
    return !q || `${e.user_data?.first_name} ${e.user_data?.last_name} ${e.matricule} ${e.poste}`.toLowerCase().includes(q);
  });

  const duration = startDate && endDate
    ? Math.max(0, Math.round((new Date(endDate) - new Date(startDate)) / 86400000))
    : null;

  const filled = [selected, startDate, endDate].filter(Boolean).length;

  const handleStart = async () => {
    if (!selected || !startDate || !endDate) {
      setError('Veuillez sélectionner un employé et renseigner les deux dates.'); return;
    }
    if (endDate <= startDate) {
      setError('La date de fin doit être après la date de début.'); return;
    }
    setLoading(true); setError('');
    try {
      await api.post('/onboarding/start/', {
        employee_id: selected.id,
        start_date: startDate,
        expected_completion_date: endDate,
      });
      setSuccess('Plan d\'intégration créé avec succès ! Redirection…');
      setTimeout(() => navigate(`/onboarding/employee/${selected.id}`), 1800);
    } catch (e) {
      setError(e.response?.data?.error || 'Erreur lors du démarrage de l\'intégration');
    } finally { setLoading(false); }
  };

  const selName = selected
    ? `${selected.user_data?.first_name || ''} ${selected.user_data?.last_name || ''}`.trim()
    : '';

  return (
    <Box sx={{ width: '100%' }}>

      {/* Banner */}
      <Card elevation={0} sx={{ borderRadius: 3, border: '1px solid #e8ecf0', mb: 3, overflow: 'hidden' }}>
        <Box sx={{ background: 'linear-gradient(135deg,#0f172a 0%,#1e3a5f 60%,#1e40af 100%)',
          px: 3, py: 2.5, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Button startIcon={<BackIcon />} onClick={() => navigate('/onboarding')} size="small"
              sx={{ color: 'rgba(255,255,255,0.7)', textTransform: 'none', borderRadius: 2,
                '&:hover': { bgcolor: 'rgba(255,255,255,0.1)', color: 'white' } }}>
              Retour
            </Button>
            <Box sx={{ p: 1.25, borderRadius: 2, bgcolor: 'rgba(255,255,255,0.12)', display: 'inline-flex' }}>
              <PersonAddIcon sx={{ fontSize: 22, color: 'white' }} />
            </Box>
            <Box>
              <Typography variant="h5" fontWeight={700} color="white">Démarrer une intégration</Typography>
              <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.65)', mt: 0.3 }}>
                Sélectionnez un employé et planifiez son parcours d'intégration
              </Typography>
            </Box>
          </Box>
          {/* Progression */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Box sx={{ display: 'flex', gap: 0.5 }}>
              {[1, 2, 3].map(i => (
                <Box key={i} sx={{ width: 24, height: 4, borderRadius: 2,
                  bgcolor: i <= filled ? '#60a5fa' : 'rgba(255,255,255,0.2)' }} />
              ))}
            </Box>
            <Typography sx={{ color: 'rgba(255,255,255,0.65)', fontSize: '0.78rem' }}>{filled}/3 étapes</Typography>
          </Box>
        </Box>
      </Card>

      <Grid container spacing={3}>

        {/* ── Formulaire ── */}
        <Grid item xs={12} lg={7}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>

            {error   && <Alert severity="error"   sx={{ borderRadius: 2 }} onClose={() => setError('')}>{error}</Alert>}
            {success && <Alert severity="success" sx={{ borderRadius: 2 }}>{success}</Alert>}

            {/* Sélection employé */}
            <Card elevation={0} sx={{ border: '1px solid #e8ecf0', borderRadius: 3, overflow: 'hidden' }}>
              <NavHeader title="Sélection de l'employé *" icon={<PersonAddIcon />} />
              <CardContent sx={{ p: 2.5 }}>
                <TextField fullWidth size="small" placeholder="Rechercher par nom, matricule, poste…"
                  value={search} onChange={e => setSearch(e.target.value)} sx={{ ...fieldSx, mb: 2 }}
                  InputProps={{ startAdornment: <InputAdornment position="start"><SearchIcon sx={{ fontSize: 16, color: '#94a3b8' }} /></InputAdornment> }} />

                <Box sx={{ maxHeight: 280, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 0.5,
                  '&::-webkit-scrollbar': { width: 4 },
                  '&::-webkit-scrollbar-thumb': { bgcolor: '#e2e8f0', borderRadius: 2 } }}>
                  {loadingEmp ? (
                    [1,2,3].map(i => <Skeleton key={i} height={56} sx={{ borderRadius: 2 }} />)
                  ) : filteredEmps.length === 0 ? (
                    <Box sx={{ textAlign: 'center', py: 3 }}>
                      <Typography variant="caption" color="text.secondary">Aucun employé disponible</Typography>
                    </Box>
                  ) : filteredEmps.map(emp => {
                    const name = `${emp.user_data?.first_name || ''} ${emp.user_data?.last_name || ''}`.trim();
                    const isSelected = selected?.id === emp.id;
                    return (
                      <Box key={emp.id} onClick={() => setSelected(isSelected ? null : emp)}
                        sx={{ display: 'flex', alignItems: 'center', gap: 1.5, p: 1.25, borderRadius: 2,
                          cursor: 'pointer', transition: 'all 0.15s',
                          border: `2px solid ${isSelected ? '#1976d2' : '#f1f5f9'}`,
                          bgcolor: isSelected ? '#eff6ff' : 'white',
                          '&:hover': { bgcolor: isSelected ? '#dbeafe' : '#f8fafc', borderColor: isSelected ? '#1976d2' : '#e2e8f0' } }}>
                        <Avatar sx={{ bgcolor: avatarColor(name), width: 36, height: 36, fontSize: '0.85rem', fontWeight: 700, flexShrink: 0 }}>
                          {name[0]?.toUpperCase() || '?'}
                        </Avatar>
                        <Box sx={{ flex: 1, minWidth: 0 }}>
                          <Typography sx={{ fontSize: '0.875rem', fontWeight: isSelected ? 700 : 600,
                            color: isSelected ? '#1976d2' : '#1e293b' }} noWrap>
                            {name}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {emp.matricule} · {emp.poste || 'Poste non défini'}
                          </Typography>
                        </Box>
                        {isSelected && <CheckIcon sx={{ fontSize: 18, color: '#1976d2', flexShrink: 0 }} />}
                      </Box>
                    );
                  })}
                </Box>
              </CardContent>
            </Card>

            {/* Planification */}
            <Card elevation={0} sx={{ border: '1px solid #e8ecf0', borderRadius: 3, overflow: 'hidden' }}>
              <NavHeader title="Planification de l'intégration" icon={<CalendarIcon />} />
              <CardContent sx={{ p: 2.5 }}>
                <Grid container spacing={2.5}>
                  <Grid item xs={12} sm={6}>
                    <SectionLabel label="Date de début" required />
                    <TextField fullWidth size="small" type="date" InputLabelProps={{ shrink: true }}
                      value={startDate} onChange={e => setStartDate(e.target.value)} sx={fieldSx} />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <SectionLabel label="Date de fin prévue" required />
                    <TextField fullWidth size="small" type="date" InputLabelProps={{ shrink: true }}
                      value={endDate} onChange={e => setEndDate(e.target.value)} sx={fieldSx} />
                  </Grid>
                </Grid>
                {duration !== null && duration > 0 && (
                  <Box sx={{ mt: 1.5, p: 1.25, bgcolor: '#eff6ff', borderRadius: 2,
                    border: '1px solid #bfdbfe', display: 'flex', alignItems: 'center', gap: 1 }}>
                    <CalendarIcon sx={{ fontSize: 15, color: '#1976d2' }} />
                    <Typography sx={{ fontSize: '0.82rem', color: '#1976d2', fontWeight: 600 }}>
                      Durée : {duration} jour{duration !== 1 ? 's' : ''}
                      {duration >= 30 && ` (${Math.round(duration / 30)} mois)`}
                    </Typography>
                  </Box>
                )}
              </CardContent>
            </Card>

            {/* Ce qui sera créé */}
            <Card elevation={0} sx={{ border: '1px solid #e8ecf0', borderRadius: 3, overflow: 'hidden' }}>
              <NavHeader title="Plan d'intégration automatique" icon={<OnboardIcon />} />
              <CardContent sx={{ p: 2.5 }}>
                <Typography sx={{ fontSize: '0.82rem', color: '#64748b', mb: 2 }}>
                  Un plan complet sera généré automatiquement à la confirmation :
                </Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                  {PLAN_ITEMS.map((item, i) => (
                    <Box key={i} sx={{ display: 'flex', alignItems: 'center', gap: 1.5, p: 1.25,
                      borderRadius: 2, bgcolor: '#f8fafc', border: '1px solid #f1f5f9' }}>
                      <Avatar sx={{ bgcolor: `${item.color}12`, width: 32, height: 32 }}>
                        {React.cloneElement(item.icon, { sx: { color: item.color, fontSize: 15 } })}
                      </Avatar>
                      <Box>
                        <Typography sx={{ fontSize: '0.82rem', fontWeight: 600, color: '#1e293b' }}>{item.label}</Typography>
                        <Typography variant="caption" color="text.secondary">{item.sub}</Typography>
                      </Box>
                      <CheckIcon sx={{ fontSize: 15, color: '#2e7d32', ml: 'auto', flexShrink: 0 }} />
                    </Box>
                  ))}
                </Box>
              </CardContent>
            </Card>

          </Box>
        </Grid>

        {/* ── Panneau droite ── */}
        <Grid item xs={12} lg={5}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, position: 'sticky', top: 24 }}>

            {/* Aperçu employé */}
            {selected ? (
              <Card elevation={0} sx={{ border: '1px solid #e8ecf0', borderRadius: 3, overflow: 'hidden' }}>
                <Box sx={{ background: 'linear-gradient(135deg,#0f172a,#1e3a5f,#1e40af)',
                  px: 2.5, py: 2.5, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1.5 }}>
                  <Avatar sx={{ bgcolor: avatarColor(selName), width: 64, height: 64,
                    fontSize: '1.4rem', fontWeight: 700, border: '3px solid rgba(255,255,255,0.25)' }}>
                    {selName[0]?.toUpperCase() || '?'}
                  </Avatar>
                  <Box sx={{ textAlign: 'center' }}>
                    <Typography sx={{ color: 'white', fontWeight: 700, fontSize: '1rem' }}>{selName}</Typography>
                    <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.6)' }}>
                      {selected.poste || 'Poste non défini'}
                    </Typography>
                  </Box>
                </Box>
                <CardContent sx={{ p: 0 }}>
                  {[
                    { icon: <MatIcon />,   label: 'Matricule', value: selected.matricule },
                    { icon: <EmailIcon />, label: 'Email',     value: selected.user_data?.email },
                    { icon: <WorkIcon />,  label: 'Poste',     value: selected.poste },
                  ].map((row, i, arr) => (
                    <Box key={i} sx={{ display: 'flex', alignItems: 'center', gap: 1.5,
                      px: 2.5, py: 1.5, borderBottom: i < arr.length - 1 ? '1px solid #f1f5f9' : 'none' }}>
                      <Avatar sx={{ bgcolor: '#1976d212', width: 26, height: 26 }}>
                        {React.cloneElement(row.icon, { sx: { color: '#1976d2', fontSize: 13 } })}
                      </Avatar>
                      <Box sx={{ flex: 1, minWidth: 0 }}>
                        <Typography sx={{ fontSize: '0.68rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.4px' }}>
                          {row.label}
                        </Typography>
                        <Typography sx={{ fontSize: '0.82rem', fontWeight: 600, color: '#1e293b' }} noWrap>
                          {row.value || '—'}
                        </Typography>
                      </Box>
                    </Box>
                  ))}
                </CardContent>
              </Card>
            ) : (
              <Card elevation={0} sx={{ border: '2px dashed #e8ecf0', borderRadius: 3 }}>
                <CardContent sx={{ textAlign: 'center', py: 5 }}>
                  <PersonAddIcon sx={{ fontSize: 44, color: '#cbd5e1', mb: 1 }} />
                  <Typography variant="body2" color="text.secondary" fontWeight={500}>
                    Aucun employé sélectionné
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Choisissez un employé dans la liste
                  </Typography>
                </CardContent>
              </Card>
            )}

            {/* Récapitulatif */}
            <Card elevation={0} sx={{ border: '1px solid #e8ecf0', borderRadius: 3, overflow: 'hidden' }}>
              <NavHeader title="Récapitulatif" icon={<CheckIcon />} />
              <CardContent sx={{ p: 2 }}>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                  {[
                    { label: 'Employé',      value: selected ? selName : null },
                    { label: 'Date de début', value: startDate },
                    { label: 'Date de fin',   value: endDate },
                  ].map((item, i) => (
                    <Box key={i} sx={{ display: 'flex', alignItems: 'center', gap: 1.25, p: 1,
                      borderRadius: 2, bgcolor: item.value ? '#f0fdf4' : '#f8fafc',
                      border: `1px solid ${item.value ? '#a7f3d030' : '#f1f5f9'}` }}>
                      <Box sx={{ width: 8, height: 8, borderRadius: '50%', flexShrink: 0,
                        bgcolor: item.value ? '#2e7d32' : '#e2e8f0' }} />
                      <Box sx={{ flex: 1, minWidth: 0 }}>
                        <Typography sx={{ fontSize: '0.68rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.4px' }}>
                          {item.label}
                        </Typography>
                        <Typography sx={{ fontSize: '0.78rem', fontWeight: 600,
                          color: item.value ? '#1e293b' : '#cbd5e1' }} noWrap>
                          {item.value || 'Non renseigné'}
                        </Typography>
                      </Box>
                      {item.value && <CheckIcon sx={{ fontSize: 14, color: '#2e7d32', flexShrink: 0 }} />}
                    </Box>
                  ))}
                </Box>

                {duration !== null && duration > 0 && (
                  <>
                    <Divider sx={{ my: 1.5 }} />
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography sx={{ fontSize: '0.78rem', color: '#64748b' }}>Durée du parcours</Typography>
                      <Typography sx={{ fontSize: '0.78rem', fontWeight: 700, color: '#1e293b' }}>
                        {duration} jour{duration !== 1 ? 's' : ''}
                      </Typography>
                    </Box>
                  </>
                )}
              </CardContent>
            </Card>

            {/* Boutons */}
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
              <Button fullWidth variant="contained" startIcon={<PersonAddIcon />}
                onClick={handleStart} disabled={loading || !selected || !startDate || !endDate}
                sx={{ py: 1.25, borderRadius: 2, textTransform: 'none', fontWeight: 700, fontSize: '0.9rem',
                  background: 'linear-gradient(135deg,#1e3a5f,#1e40af)',
                  '&:hover': { background: 'linear-gradient(135deg,#0f172a,#1e3a5f)' },
                  '&:disabled': { opacity: 0.5 } }}>
                {loading ? 'Démarrage en cours…' : 'Démarrer l\'intégration'}
              </Button>
              <Button fullWidth onClick={() => navigate('/onboarding')} disabled={loading}
                sx={{ py: 1, borderRadius: 2, textTransform: 'none', color: '#94a3b8',
                  border: '1px solid #e2e8f0', '&:hover': { bgcolor: '#f8fafc' } }}>
                Annuler
              </Button>
            </Box>

          </Box>
        </Grid>
      </Grid>
    </Box>
  );
};

export default AddEmployee;
