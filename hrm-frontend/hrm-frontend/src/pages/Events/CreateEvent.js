import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box, Card, CardContent, Typography, TextField, Button, Grid,
  Alert, Avatar, Divider, Chip,
} from '@mui/material';
import {
  Event as EventIcon,
  ArrowBack as BackIcon,
  CalendarToday as CalendarIcon,
  LocationOn as LocationIcon,
  Description as DescIcon,
  Title as TitleIcon,
  CheckCircle as CheckIcon,
  Save as SaveIcon,
} from '@mui/icons-material';
import { createEvent } from '../../services/hrService';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

const fieldSx = {
  '& .MuiOutlinedInput-root': {
    borderRadius: 2, fontSize: '0.875rem',
    '&:hover fieldset': { borderColor: '#7b1fa2' },
    '&.Mui-focused fieldset': { borderColor: '#7b1fa2' },
  },
  '& .MuiInputLabel-root.Mui-focused': { color: '#7b1fa2' },
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

const CreateEvent = () => {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState('');
  const [form,    setForm]    = useState({ name: '', description: '', date: '', location: '' });

  const set = (field, val) => setForm(p => ({ ...p, [field]: val }));

  const filled  = [form.name, form.description, form.date, form.location].filter(Boolean).length;
  const progress = Math.round((filled / 4) * 100);

  const handleSubmit = async () => {
    if (!form.name || !form.description || !form.date || !form.location) {
      setError('Tous les champs sont obligatoires.'); return;
    }
    setLoading(true); setError('');
    try {
      await createEvent(form);
      navigate('/events');
    } catch (e) {
      setError(e.response?.data?.error || e.response?.data?.detail || 'Erreur lors de la création de l\'événement');
    } finally { setLoading(false); }
  };

  const dateLabel = form.date
    ? format(new Date(form.date), "EEEE d MMMM yyyy", { locale: fr })
    : null;

  return (
    <Box sx={{ width: '100%' }}>

      {/* Banner */}
      <Card elevation={0} sx={{ borderRadius: 3, border: '1px solid #e8ecf0', mb: 3, overflow: 'hidden' }}>
        <Box sx={{ background: 'linear-gradient(135deg,#0f172a 0%,#1e3a5f 60%,#1e40af 100%)',
          px: 3, py: 2.5, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Button startIcon={<BackIcon />} onClick={() => navigate('/events')} size="small"
              sx={{ color: 'rgba(255,255,255,0.7)', textTransform: 'none', borderRadius: 2,
                '&:hover': { bgcolor: 'rgba(255,255,255,0.1)', color: 'white' } }}>
              Retour
            </Button>
            <Box sx={{ p: 1.25, borderRadius: 2, bgcolor: 'rgba(255,255,255,0.12)', display: 'inline-flex' }}>
              <EventIcon sx={{ fontSize: 22, color: 'white' }} />
            </Box>
            <Box>
              <Typography variant="h5" fontWeight={700} color="white">Nouvel événement</Typography>
              <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.65)', mt: 0.3 }}>
                Planifiez un événement pour vos équipes
              </Typography>
            </Box>
          </Box>
          {/* Progression */}
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

            {error && <Alert severity="error" sx={{ borderRadius: 2 }} onClose={() => setError('')}>{error}</Alert>}

            {/* Infos principales */}
            <Card elevation={0} sx={{ border: '1px solid #e8ecf0', borderRadius: 3, overflow: 'hidden' }}>
              <NavHeader title="Informations de l'événement" icon={<EventIcon />} />
              <CardContent sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
                  <Box>
                    <SectionLabel label="Nom de l'événement" required />
                    <TextField fullWidth size="small"
                      placeholder="ex: Journée team building, Réunion trimestrielle…"
                      value={form.name} onChange={e => set('name', e.target.value)} sx={fieldSx} />
                  </Box>
                  <Box>
                    <SectionLabel label="Description" required />
                    <TextField fullWidth multiline rows={4} size="small"
                      placeholder="Décrivez l'objectif, le programme et les informations importantes de l'événement…"
                      value={form.description} onChange={e => set('description', e.target.value)} sx={fieldSx} />
                    <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
                      {form.description.length} caractère{form.description.length !== 1 ? 's' : ''}
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>

            {/* Date et lieu */}
            <Card elevation={0} sx={{ border: '1px solid #e8ecf0', borderRadius: 3, overflow: 'hidden' }}>
              <NavHeader title="Date et lieu" icon={<CalendarIcon />} />
              <CardContent sx={{ p: 3 }}>
                <Grid container spacing={2.5}>
                  <Grid item xs={12} sm={6}>
                    <SectionLabel label="Date de l'événement" required />
                    <TextField fullWidth size="small" type="date" InputLabelProps={{ shrink: true }}
                      value={form.date} onChange={e => set('date', e.target.value)} sx={fieldSx} />
                    {dateLabel && (
                      <Box sx={{ mt: 1, display: 'flex', alignItems: 'center', gap: 0.75 }}>
                        <CalendarIcon sx={{ fontSize: 14, color: '#7b1fa2' }} />
                        <Typography sx={{ fontSize: '0.78rem', color: '#7b1fa2', fontWeight: 600,
                          textTransform: 'capitalize' }}>
                          {dateLabel}
                        </Typography>
                      </Box>
                    )}
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <SectionLabel label="Lieu" required />
                    <TextField fullWidth size="small"
                      placeholder="ex: Salle de conférence A, 12 rue de la Paix…"
                      value={form.location} onChange={e => set('location', e.target.value)} sx={fieldSx}
                      InputProps={{ startAdornment: (
                        <Box sx={{ mr: 1, display: 'flex' }}>
                          <LocationIcon sx={{ fontSize: 16, color: '#94a3b8' }} />
                        </Box>
                      )}} />
                  </Grid>
                </Grid>
              </CardContent>
            </Card>

          </Box>
        </Grid>

        {/* ── Panneau droit ── */}
        <Grid item xs={12} lg={4}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, position: 'sticky', top: 24 }}>

            {/* Aperçu */}
            <Card elevation={0} sx={{ border: '1px solid #e8ecf0', borderRadius: 3, overflow: 'hidden' }}>
              <NavHeader title="Aperçu" icon={<EventIcon />} />
              <CardContent sx={{ p: 2.5 }}>

                {/* Aperçu visuel de l'événement */}
                <Box sx={{ p: 2, borderRadius: 2, border: '1px solid #e8ecf0',
                  background: 'linear-gradient(135deg,#fdf4ff,#f3e5f5)', mb: 2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1.5 }}>
                    <Box sx={{ width: 40, height: 40, borderRadius: 2, bgcolor: '#9c27b015',
                      display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <EventIcon sx={{ color: '#9c27b0', fontSize: 20 }} />
                    </Box>
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      <Typography sx={{ fontSize: '0.9rem', fontWeight: 700, color: '#1e293b' }} noWrap>
                        {form.name || 'Nom de l\'événement'}
                      </Typography>
                      <Chip label="En attente" size="small"
                        sx={{ mt: 0.3, bgcolor: '#fff8e1', color: '#f57c00', fontWeight: 700,
                          fontSize: '0.65rem', height: 18 }} />
                    </Box>
                  </Box>
                  {form.date && (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, mb: 0.5 }}>
                      <CalendarIcon sx={{ fontSize: 13, color: '#7b1fa2' }} />
                      <Typography sx={{ fontSize: '0.78rem', color: '#7b1fa2', fontWeight: 600,
                        textTransform: 'capitalize' }}>
                        {dateLabel}
                      </Typography>
                    </Box>
                  )}
                  {form.location && (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                      <LocationIcon sx={{ fontSize: 13, color: '#64748b' }} />
                      <Typography sx={{ fontSize: '0.78rem', color: '#475569' }} noWrap>{form.location}</Typography>
                    </Box>
                  )}
                </Box>

                {/* Checklist récapitulatif */}
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                  {[
                    { label: 'Nom',         value: form.name,        icon: <TitleIcon /> },
                    { label: 'Description', value: form.description ? `${form.description.length} car.` : null, icon: <DescIcon /> },
                    { label: 'Date',        value: form.date,        icon: <CalendarIcon /> },
                    { label: 'Lieu',        value: form.location,    icon: <LocationIcon /> },
                  ].map((item, i) => (
                    <Box key={i} sx={{ display: 'flex', alignItems: 'center', gap: 1.25, p: 1,
                      borderRadius: 2, bgcolor: item.value ? '#fdf4ff' : '#f8fafc',
                      border: `1px solid ${item.value ? '#e9d5ff' : '#f1f5f9'}` }}>
                      <Avatar sx={{ bgcolor: item.value ? '#9c27b012' : '#f1f5f9', width: 24, height: 24 }}>
                        {React.cloneElement(item.icon, { sx: { fontSize: 13, color: item.value ? '#9c27b0' : '#94a3b8' } })}
                      </Avatar>
                      <Box sx={{ flex: 1, minWidth: 0 }}>
                        <Typography sx={{ fontSize: '0.68rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.4px' }}>
                          {item.label}
                        </Typography>
                        <Typography sx={{ fontSize: '0.78rem', fontWeight: 600,
                          color: item.value ? '#1e293b' : '#cbd5e1' }} noWrap>
                          {item.value || 'Non renseigné'}
                        </Typography>
                      </Box>
                      {item.value && <CheckIcon sx={{ fontSize: 14, color: '#9c27b0', flexShrink: 0 }} />}
                    </Box>
                  ))}
                </Box>

                <Divider sx={{ my: 2 }} />

                {/* Barre progression */}
                <Box sx={{ mb: 0.5, display: 'flex', justifyContent: 'space-between' }}>
                  <Typography sx={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600 }}>Complétude</Typography>
                  <Typography sx={{ fontSize: '0.75rem', fontWeight: 700,
                    color: progress === 100 ? '#9c27b0' : '#f57c00' }}>
                    {progress}%
                  </Typography>
                </Box>
                <Box sx={{ height: 6, bgcolor: '#f3e5f5', borderRadius: 3, overflow: 'hidden' }}>
                  <Box sx={{ height: '100%', width: `${progress}%`, borderRadius: 3,
                    bgcolor: progress === 100 ? '#9c27b0' : progress >= 50 ? '#7b1fa2' : '#ba68c8',
                    transition: 'width 0.3s ease' }} />
                </Box>

                <Box sx={{ mt: 2, p: 1.25, bgcolor: '#fff8e1', borderRadius: 2, border: '1px solid #ffe0b2' }}>
                  <Typography sx={{ fontSize: '0.75rem', color: '#e65100' }}>
                    ⚠ L'événement sera soumis pour approbation au Directeur RH.
                  </Typography>
                </Box>
              </CardContent>
            </Card>

            {/* Boutons */}
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
              <Button fullWidth variant="contained" startIcon={<SaveIcon />}
                onClick={handleSubmit} disabled={loading}
                sx={{ py: 1.25, borderRadius: 2, textTransform: 'none', fontWeight: 700, fontSize: '0.9rem',
                  background: 'linear-gradient(135deg,#4a148c,#7b1fa2)',
                  '&:hover': { background: 'linear-gradient(135deg,#38006b,#6a1b9a)' },
                  '&:disabled': { opacity: 0.5 } }}>
                {loading ? 'Création en cours…' : 'Créer l\'événement'}
              </Button>
              <Button fullWidth onClick={() => navigate('/events')} disabled={loading}
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

export default CreateEvent;
