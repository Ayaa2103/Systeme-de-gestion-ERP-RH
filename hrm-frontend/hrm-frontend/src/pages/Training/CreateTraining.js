import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box, Card, CardContent, Typography, TextField, Button, Grid,
  Alert, Avatar, Chip, Divider, MenuItem, Select, OutlinedInput,
  FormControl, Skeleton, Checkbox, ListItemText, InputAdornment,
} from '@mui/material';
import {
  School as SchoolIcon,
  ArrowBack as BackIcon,
  People as PeopleIcon,
  CalendarToday as CalendarIcon,
  Description as DescIcon,
  CheckCircle as CheckIcon,
  Save as SaveIcon,
  Search as SearchIcon,
} from '@mui/icons-material';
import { createTraining, getEmployees } from '../../services/hrService';

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

const COLORS = ['#1976d2','#388e3c','#d32f2f','#7b1fa2','#f57c00','#0097a7'];
const avatarColor = (name = '') => COLORS[(name.charCodeAt(0) || 0) % COLORS.length];

const CreateTraining = () => {
  const navigate = useNavigate();

  const [loading,    setLoading]    = useState(false);
  const [employees,  setEmployees]  = useState([]);
  const [empSearch,  setEmpSearch]  = useState('');
  const [error,      setError]      = useState('');
  const [success,    setSuccess]    = useState('');

  const [form, setForm] = useState({
    name: '', description: '', start_date: '', end_date: '', employee_ids: [],
  });

  useEffect(() => {
    getEmployees({ status: 'actif' })
      .then(r => setEmployees(r.data.results || r.data))
      .catch(() => {});
  }, []);

  const set = (field, val) => setForm(p => ({ ...p, [field]: val }));

  const toggleEmployee = (id) => {
    setForm(p => ({
      ...p,
      employee_ids: p.employee_ids.includes(id)
        ? p.employee_ids.filter(e => e !== id)
        : [...p.employee_ids, id],
    }));
  };

  const filteredEmps = employees.filter(e => {
    const q = empSearch.toLowerCase();
    return !q || `${e.user?.first_name} ${e.user?.last_name} ${e.matricule}`.toLowerCase().includes(q);
  });

  const selectedEmps = employees.filter(e => form.employee_ids.includes(e.id));

  const filled = [form.name, form.description, form.start_date, form.end_date].filter(Boolean).length;
  const progress = Math.round((filled / 4) * 100);

  const duration = form.start_date && form.end_date
    ? Math.max(0, Math.round((new Date(form.end_date) - new Date(form.start_date)) / 86400000))
    : null;

  const handleSubmit = async () => {
    if (!form.name || !form.description || !form.start_date || !form.end_date) {
      setError('Nom, description et dates sont obligatoires.'); return;
    }
    if (form.end_date < form.start_date) {
      setError('La date de fin doit être après la date de début.'); return;
    }
    setLoading(true); setError('');
    try {
      await createTraining(form);
      setSuccess('Formation créée avec succès ! En attente de validation.');
      setTimeout(() => navigate('/manage-trainings'), 1800);
    } catch (e) {
      const data = e.response?.data;
      if (data?.error)  { setError(data.error);  }
      else if (data?.detail) { setError(data.detail); }
      else if (data && typeof data === 'object') {
        const msgs = Object.entries(data).map(([f, v]) => `${f}: ${Array.isArray(v) ? v[0] : v}`).join(' · ');
        setError(msgs || 'Erreur lors de la création de la formation');
      } else {
        setError('Erreur lors de la création de la formation');
      }
    } finally { setLoading(false); }
  };

  return (
    <Box sx={{ width: '100%' }}>

      {/* Banner */}
      <Card elevation={0} sx={{ borderRadius: 3, border: '1px solid #e8ecf0', mb: 3, overflow: 'hidden' }}>
        <Box sx={{ background: 'linear-gradient(135deg,#0f172a 0%,#1e3a5f 60%,#1e40af 100%)',
          px: 3, py: 2.5, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Button startIcon={<BackIcon />} onClick={() => navigate('/manage-trainings')} size="small"
              sx={{ color: 'rgba(255,255,255,0.7)', textTransform: 'none', borderRadius: 2,
                '&:hover': { bgcolor: 'rgba(255,255,255,0.1)', color: 'white' } }}>
              Retour
            </Button>
            <Box sx={{ p: 1.25, borderRadius: 2, bgcolor: 'rgba(255,255,255,0.12)', display: 'inline-flex' }}>
              <SchoolIcon sx={{ fontSize: 22, color: 'white' }} />
            </Box>
            <Box>
              <Typography variant="h5" fontWeight={700} color="white">Nouvelle formation</Typography>
              <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.65)', mt: 0.3 }}>
                Planifiez une formation pour vos employés
              </Typography>
            </Box>
          </Box>
          {/* Progress indicator */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Box sx={{ display: 'flex', gap: 0.5 }}>
              {[1,2,3,4].map(i => (
                <Box key={i} sx={{ width: 24, height: 4, borderRadius: 2,
                  bgcolor: i <= filled ? '#60a5fa' : 'rgba(255,255,255,0.2)' }} />
              ))}
            </Box>
            <Typography sx={{ color: 'rgba(255,255,255,0.65)', fontSize: '0.78rem' }}>{filled}/4 champs</Typography>
          </Box>
        </Box>
      </Card>

      <Grid container spacing={3}>

        {/* ── Formulaire ── */}
        <Grid item xs={12} lg={8}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>

            {error   && <Alert severity="error"   sx={{ borderRadius: 2 }} onClose={() => setError('')}>{error}</Alert>}
            {success && <Alert severity="success" sx={{ borderRadius: 2 }}>{success}</Alert>}

            {/* Informations */}
            <Card elevation={0} sx={{ border: '1px solid #e8ecf0', borderRadius: 3, overflow: 'hidden' }}>
              <NavHeader title="Informations de la formation" icon={<SchoolIcon />} />
              <CardContent sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
                  <Box>
                    <SectionLabel label="Nom de la formation" required />
                    <TextField fullWidth size="small" placeholder="ex: Formation React avancé, Sécurité informatique…"
                      value={form.name} onChange={e => set('name', e.target.value)} sx={fieldSx} />
                  </Box>
                  <Box>
                    <SectionLabel label="Description" required />
                    <TextField fullWidth multiline rows={4} size="small"
                      placeholder="Décrivez les objectifs, le contenu et les bénéfices de cette formation…"
                      value={form.description} onChange={e => set('description', e.target.value)} sx={fieldSx} />
                    <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
                      {form.description.length} caractère{form.description.length !== 1 ? 's' : ''}
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>

            {/* Planification */}
            <Card elevation={0} sx={{ border: '1px solid #e8ecf0', borderRadius: 3, overflow: 'hidden' }}>
              <NavHeader title="Planification" icon={<CalendarIcon />} />
              <CardContent sx={{ p: 3 }}>
                <Grid container spacing={2.5}>
                  <Grid item xs={12} sm={6}>
                    <SectionLabel label="Date de début" required />
                    <TextField fullWidth size="small" type="date" InputLabelProps={{ shrink: true }}
                      value={form.start_date} onChange={e => set('start_date', e.target.value)} sx={fieldSx} />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <SectionLabel label="Date de fin" required />
                    <TextField fullWidth size="small" type="date" InputLabelProps={{ shrink: true }}
                      value={form.end_date} onChange={e => set('end_date', e.target.value)} sx={fieldSx} />
                  </Grid>
                </Grid>
                {duration !== null && (
                  <Box sx={{ mt: 1.5, p: 1.25, bgcolor: '#eff6ff', borderRadius: 2, border: '1px solid #bfdbfe',
                    display: 'flex', alignItems: 'center', gap: 1 }}>
                    <CalendarIcon sx={{ fontSize: 15, color: '#1976d2' }} />
                    <Typography sx={{ fontSize: '0.82rem', color: '#1976d2', fontWeight: 600 }}>
                      Durée : {duration} jour{duration !== 1 ? 's' : ''}
                    </Typography>
                  </Box>
                )}
              </CardContent>
            </Card>

            {/* Participants */}
            <Card elevation={0} sx={{ border: '1px solid #e8ecf0', borderRadius: 3, overflow: 'hidden' }}>
              <NavHeader title={`Participants (${form.employee_ids.length} sélectionné${form.employee_ids.length !== 1 ? 's' : ''})`} icon={<PeopleIcon />} />
              <CardContent sx={{ p: 2.5 }}>

                {/* Search employees */}
                <TextField fullWidth size="small" placeholder="Rechercher un employé…" value={empSearch}
                  onChange={e => setEmpSearch(e.target.value)} sx={{ ...fieldSx, mb: 2 }}
                  InputProps={{ startAdornment: <InputAdornment position="start"><SearchIcon sx={{ fontSize: 16, color: '#94a3b8' }} /></InputAdornment> }} />

                {/* Employee list */}
                <Box sx={{ maxHeight: 260, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 0.5,
                  '&::-webkit-scrollbar': { width: 4 },
                  '&::-webkit-scrollbar-thumb': { bgcolor: '#e2e8f0', borderRadius: 2 } }}>
                  {filteredEmps.length === 0 ? (
                    <Box sx={{ textAlign: 'center', py: 3 }}>
                      <Typography variant="caption" color="text.secondary">Aucun employé trouvé</Typography>
                    </Box>
                  ) : filteredEmps.map(emp => {
                    const name = `${emp.user?.first_name || ''} ${emp.user?.last_name || ''}`.trim();
                    const selected = form.employee_ids.includes(emp.id);
                    return (
                      <Box key={emp.id} onClick={() => toggleEmployee(emp.id)}
                        sx={{ display: 'flex', alignItems: 'center', gap: 1.5, p: 1, borderRadius: 2,
                          cursor: 'pointer', transition: 'all 0.15s',
                          border: `1px solid ${selected ? '#bfdbfe' : '#f1f5f9'}`,
                          bgcolor: selected ? '#eff6ff' : 'white',
                          '&:hover': { bgcolor: selected ? '#dbeafe' : '#f8fafc' } }}>
                        <Checkbox size="small" checked={selected}
                          sx={{ p: 0, color: '#94a3b8', '&.Mui-checked': { color: '#1976d2' } }} />
                        <Avatar sx={{ bgcolor: avatarColor(name), width: 28, height: 28, fontSize: '0.7rem', fontWeight: 700 }}>
                          {name[0]?.toUpperCase() || '?'}
                        </Avatar>
                        <Box sx={{ flex: 1, minWidth: 0 }}>
                          <Typography sx={{ fontSize: '0.82rem', fontWeight: selected ? 600 : 500,
                            color: selected ? '#1976d2' : '#1e293b' }} noWrap>
                            {name}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">{emp.matricule} · {emp.poste || 'Poste non défini'}</Typography>
                        </Box>
                      </Box>
                    );
                  })}
                </Box>

                {/* Selected chips */}
                {selectedEmps.length > 0 && (
                  <>
                    <Divider sx={{ my: 1.5 }} />
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75 }}>
                      {selectedEmps.map(emp => {
                        const name = `${emp.user?.first_name || ''} ${emp.user?.last_name || ''}`.trim();
                        return (
                          <Chip key={emp.id} label={name} size="small" onDelete={() => toggleEmployee(emp.id)}
                            sx={{ bgcolor: '#eff6ff', color: '#1976d2', border: '1px solid #bfdbfe',
                              fontWeight: 600, fontSize: '0.72rem', height: 24 }} />
                        );
                      })}
                    </Box>
                  </>
                )}
              </CardContent>
            </Card>

          </Box>
        </Grid>

        {/* ── Panneau latéral ── */}
        <Grid item xs={12} lg={4}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, position: 'sticky', top: 24 }}>

            {/* Récapitulatif */}
            <Card elevation={0} sx={{ border: '1px solid #e8ecf0', borderRadius: 3, overflow: 'hidden' }}>
              <NavHeader title="Récapitulatif" icon={<CheckIcon />} />
              <CardContent sx={{ p: 2.5 }}>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.25 }}>
                  {[
                    { label: 'Nom',          value: form.name },
                    { label: 'Description',  value: form.description ? `${form.description.length} car.` : null },
                    { label: 'Début',        value: form.start_date },
                    { label: 'Fin',          value: form.end_date },
                    { label: 'Participants', value: form.employee_ids.length > 0 ? `${form.employee_ids.length} sélectionné${form.employee_ids.length !== 1 ? 's' : ''}` : null },
                  ].map((item, i) => (
                    <Box key={i} sx={{ display: 'flex', alignItems: 'center', gap: 1.25,
                      p: 1, borderRadius: 2,
                      bgcolor: item.value ? '#f0fdf4' : '#f8fafc',
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

                <Divider sx={{ my: 2 }} />

                <Box sx={{ mb: 0.5, display: 'flex', justifyContent: 'space-between' }}>
                  <Typography sx={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600 }}>Complétude</Typography>
                  <Typography sx={{ fontSize: '0.75rem', fontWeight: 700,
                    color: progress === 100 ? '#2e7d32' : '#f57c00' }}>{progress}%</Typography>
                </Box>
                <Box sx={{ height: 6, bgcolor: '#f1f5f9', borderRadius: 3, overflow: 'hidden' }}>
                  <Box sx={{ height: '100%', width: `${progress}%`, borderRadius: 3,
                    bgcolor: progress === 100 ? '#2e7d32' : progress >= 50 ? '#f57c00' : '#1976d2',
                    transition: 'width 0.3s ease' }} />
                </Box>

                {duration !== null && (
                  <Box sx={{ mt: 2, p: 1.25, bgcolor: '#f8fafc', borderRadius: 2, border: '1px solid #e8ecf0',
                    display: 'flex', justifyContent: 'space-between' }}>
                    <Typography sx={{ fontSize: '0.78rem', color: '#64748b' }}>Durée totale</Typography>
                    <Typography sx={{ fontSize: '0.78rem', fontWeight: 700, color: '#1e293b' }}>
                      {duration} jour{duration !== 1 ? 's' : ''}
                    </Typography>
                  </Box>
                )}

                <Box sx={{ mt: 1.5, p: 1.25, bgcolor: '#fff8e1', borderRadius: 2, border: '1px solid #ffe0b2' }}>
                  <Typography sx={{ fontSize: '0.75rem', color: '#e65100' }}>
                    ⚠ La formation sera soumise pour validation au Directeur RH après création.
                  </Typography>
                </Box>
              </CardContent>
            </Card>

            {/* Boutons */}
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
              <Button fullWidth variant="contained" startIcon={<SaveIcon />}
                onClick={handleSubmit} disabled={loading}
                sx={{ py: 1.25, borderRadius: 2, textTransform: 'none', fontWeight: 700, fontSize: '0.9rem',
                  background: 'linear-gradient(135deg,#1e3a5f,#1e40af)',
                  '&:hover': { background: 'linear-gradient(135deg,#0f172a,#1e3a5f)' } }}>
                {loading ? 'Création…' : 'Créer la formation'}
              </Button>
              <Button fullWidth onClick={() => navigate('/manage-trainings')} disabled={loading}
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

export default CreateTraining;
