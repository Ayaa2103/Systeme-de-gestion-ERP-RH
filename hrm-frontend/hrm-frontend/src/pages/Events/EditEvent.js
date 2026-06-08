import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box, Card, CardContent, Typography, TextField, Button,
  Grid, Alert, Avatar, Divider, Skeleton, MenuItem,
} from '@mui/material';
import {
  ArrowBack as BackIcon,
  Event as EventIcon,
  CalendarToday as CalendarIcon,
  LocationOn as LocationIcon,
  Description as DescIcon,
  CheckCircle as CheckIcon,
  Save as SaveIcon,
  Schedule as TimeIcon,
  Flag as StatusIcon,
} from '@mui/icons-material';
import { getEvents, updateEvent } from '../../services/hrService';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

const fieldSx = {
  '& .MuiOutlinedInput-root': {
    borderRadius: 2, fontSize: '0.875rem',
    '&:hover fieldset': { borderColor: '#9c27b0' },
    '&.Mui-focused fieldset': { borderColor: '#9c27b0' },
  },
  '& .MuiInputLabel-root.Mui-focused': { color: '#9c27b0' },
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

const STATUS_OPTIONS = [
  { value: 'pending',  label: 'En attente', color: '#f57c00', bg: '#fff8e1' },
  { value: 'approved', label: 'Approuvé',   color: '#2e7d32', bg: '#e8f5e9' },
  { value: 'cancelled',label: 'Annulé',     color: '#c62828', bg: '#ffebee' },
];

const EditEvent = () => {
  const { id }  = useParams();
  const navigate = useNavigate();

  const [form,    setForm]    = useState({ name: '', description: '', date: '', start_time: '', end_time: '', location: '', status: 'pending' });
  const [loading, setLoading] = useState(true);
  const [saving,  setSaving]  = useState(false);
  const [error,   setError]   = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    getEvents()
      .then(res => {
        const all = res.data?.results || res.data || [];
        const ev  = all.find(e => e.id === parseInt(id));
        if (ev) {
          setForm({
            name:        ev.name || ev.title || '',
            description: ev.description  || '',
            date:        ev.date         || '',
            start_time:  ev.start_time   || '',
            end_time:    ev.end_time     || '',
            location:    ev.location     || '',
            status:      ev.status       || 'pending',
          });
        }
      })
      .catch(() => setError('Impossible de charger l\'événement.'))
      .finally(() => setLoading(false));
  }, [id]);

  const set = (field, val) => setForm(p => ({ ...p, [field]: val }));

  const handleSave = async () => {
    if (!form.name.trim() || !form.date) {
      setError('Nom et date sont obligatoires.'); return;
    }
    setSaving(true); setError('');
    try {
      await updateEvent(parseInt(id), form);
      setSuccess('Événement mis à jour avec succès !');
      setTimeout(() => navigate('/events'), 1600);
    } catch (e) {
      const data = e.response?.data;
      if (data?.error)  { setError(data.error);  return; }
      if (data?.detail) { setError(data.detail); return; }
      setError('Erreur lors de la mise à jour.');
    } finally { setSaving(false); }
  };

  const dateLabel = form.date
    ? format(new Date(form.date), "EEEE d MMMM yyyy", { locale: fr })
    : null;

  const selectedStatus = STATUS_OPTIONS.find(s => s.value === form.status);

  if (loading) return (
    <Box sx={{ p: 3 }}>
      {[1,2,3].map(i => <Skeleton key={i} variant="rounded" height={100} sx={{ mb: 2, borderRadius: 3 }} />)}
    </Box>
  );

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
              <Typography variant="h5" fontWeight={700} color="white">Modifier l'événement</Typography>
              <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.65)', mt: 0.3 }} noWrap>
                {form.name || 'Chargement…'}
              </Typography>
            </Box>
          </Box>
          {selectedStatus && (
            <Box sx={{ px: 1.5, py: 0.5, borderRadius: 50,
              bgcolor: `${selectedStatus.color}25`, border: `1px solid ${selectedStatus.color}50` }}>
              <Typography sx={{ color: 'white', fontSize: '0.78rem', fontWeight: 700 }}>
                {selectedStatus.label}
              </Typography>
            </Box>
          )}
        </Box>
      </Card>

      <Grid container spacing={3}>

        {/* ── Formulaire ── */}
        <Grid item xs={12} lg={8}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>

            {error   && <Alert severity="error"   sx={{ borderRadius: 2 }} onClose={() => setError('')}>{error}</Alert>}
            {success && <Alert severity="success" sx={{ borderRadius: 2 }}>{success}</Alert>}

            {/* Informations principales */}
            <Card elevation={0} sx={{ border: '1px solid #e8ecf0', borderRadius: 3, overflow: 'hidden' }}>
              <NavHeader title="Informations de l'événement" icon={<EventIcon />} />
              <CardContent sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
                  <Box>
                    <SectionLabel label="Nom de l'événement" required />
                    <TextField fullWidth size="small" value={form.name}
                      onChange={e => set('name', e.target.value)}
                      placeholder="ex: Réunion d'équipe, Team building…" sx={fieldSx} />
                  </Box>
                  <Box>
                    <SectionLabel label="Description" />
                    <TextField fullWidth multiline rows={4} size="small" value={form.description}
                      onChange={e => set('description', e.target.value)}
                      placeholder="Décrivez l'objectif et le programme de l'événement…" sx={fieldSx} />
                    <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
                      {form.description.length} caractère{form.description.length !== 1 ? 's' : ''}
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>

            {/* Date, horaires et lieu */}
            <Card elevation={0} sx={{ border: '1px solid #e8ecf0', borderRadius: 3, overflow: 'hidden' }}>
              <NavHeader title="Date, horaires & lieu" icon={<CalendarIcon />} />
              <CardContent sx={{ p: 3 }}>
                <Grid container spacing={2.5}>
                  <Grid item xs={12} sm={4}>
                    <SectionLabel label="Date" required />
                    <TextField fullWidth size="small" type="date" InputLabelProps={{ shrink: true }}
                      value={form.date} onChange={e => set('date', e.target.value)} sx={fieldSx} />
                    {dateLabel && (
                      <Box sx={{ mt: 0.75, display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <CalendarIcon sx={{ fontSize: 13, color: '#9c27b0' }} />
                        <Typography sx={{ fontSize: '0.75rem', color: '#9c27b0', fontWeight: 600, textTransform: 'capitalize' }}>
                          {dateLabel}
                        </Typography>
                      </Box>
                    )}
                  </Grid>
                  <Grid item xs={12} sm={4}>
                    <SectionLabel label="Heure de début" />
                    <TextField fullWidth size="small" type="time" InputLabelProps={{ shrink: true }}
                      value={form.start_time} onChange={e => set('start_time', e.target.value)} sx={fieldSx} />
                  </Grid>
                  <Grid item xs={12} sm={4}>
                    <SectionLabel label="Heure de fin" />
                    <TextField fullWidth size="small" type="time" InputLabelProps={{ shrink: true }}
                      value={form.end_time} onChange={e => set('end_time', e.target.value)} sx={fieldSx} />
                  </Grid>
                  <Grid item xs={12}>
                    <SectionLabel label="Lieu" />
                    <TextField fullWidth size="small" value={form.location}
                      onChange={e => set('location', e.target.value)}
                      placeholder="ex: Salle de conférence A, Siège social…"
                      sx={fieldSx}
                      InputProps={{ startAdornment: (
                        <Box sx={{ mr: 1, display: 'flex' }}>
                          <LocationIcon sx={{ fontSize: 16, color: '#94a3b8' }} />
                        </Box>
                      )}} />
                  </Grid>
                </Grid>
              </CardContent>
            </Card>

            {/* Statut */}
            <Card elevation={0} sx={{ border: '1px solid #e8ecf0', borderRadius: 3, overflow: 'hidden' }}>
              <NavHeader title="Statut de l'événement" icon={<StatusIcon />} />
              <CardContent sx={{ p: 3 }}>
                <SectionLabel label="Statut" />
                <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap' }}>
                  {STATUS_OPTIONS.map(s => (
                    <Box key={s.value} onClick={() => set('status', s.value)}
                      sx={{ px: 2, py: 1, borderRadius: 2, cursor: 'pointer', transition: 'all 0.15s',
                        border: `2px solid ${form.status === s.value ? s.color : '#e8ecf0'}`,
                        bgcolor: form.status === s.value ? s.bg : 'white',
                        '&:hover': { borderColor: s.color, bgcolor: s.bg } }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: s.color }} />
                        <Typography sx={{ fontSize: '0.85rem', fontWeight: form.status === s.value ? 700 : 500,
                          color: form.status === s.value ? s.color : '#334155' }}>
                          {s.label}
                        </Typography>
                        {form.status === s.value && <CheckIcon sx={{ fontSize: 15, color: s.color, ml: 0.5 }} />}
                      </Box>
                    </Box>
                  ))}
                </Box>
              </CardContent>
            </Card>
          </Box>
        </Grid>

        {/* ── Panneau droit ── */}
        <Grid item xs={12} lg={4}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, position: 'sticky', top: 24 }}>

            {/* Récapitulatif */}
            <Card elevation={0} sx={{ border: '1px solid #e8ecf0', borderRadius: 3, overflow: 'hidden' }}>
              <NavHeader title="Récapitulatif" icon={<CheckIcon />} />
              <CardContent sx={{ p: 2.5 }}>

                {/* Aperçu de l'événement */}
                <Box sx={{ p: 1.75, borderRadius: 2, background: 'linear-gradient(135deg,#fdf4ff,#f3e5f5)',
                  border: '1px solid #e1bee7', mb: 2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.25, mb: 1 }}>
                    <Box sx={{ width: 38, height: 38, borderRadius: 1.5, bgcolor: '#f3e5f5',
                      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                      border: '1px solid #ce93d8', flexShrink: 0 }}>
                      {form.date ? (
                        <>
                          <Typography sx={{ fontSize: '0.55rem', color: '#9c27b0', fontWeight: 700,
                            textTransform: 'uppercase', lineHeight: 1 }}>
                            {format(new Date(form.date), 'MMM', { locale: fr })}
                          </Typography>
                          <Typography sx={{ fontSize: '0.9rem', color: '#9c27b0', fontWeight: 800, lineHeight: 1.2 }}>
                            {format(new Date(form.date), 'd')}
                          </Typography>
                        </>
                      ) : <EventIcon sx={{ fontSize: 16, color: '#9c27b0' }} />}
                    </Box>
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      <Typography sx={{ fontSize: '0.875rem', fontWeight: 700, color: '#1e293b' }} noWrap>
                        {form.name || 'Nom de l\'événement'}
                      </Typography>
                      {selectedStatus && (
                        <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.5, mt: 0.3,
                          px: 0.75, py: 0.2, borderRadius: 1,
                          bgcolor: selectedStatus.bg, border: `1px solid ${selectedStatus.color}25` }}>
                          <Box sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: selectedStatus.color }} />
                          <Typography sx={{ fontSize: '0.65rem', color: selectedStatus.color, fontWeight: 700 }}>
                            {selectedStatus.label}
                          </Typography>
                        </Box>
                      )}
                    </Box>
                  </Box>
                  {dateLabel && (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, mb: form.location ? 0.5 : 0 }}>
                      <CalendarIcon sx={{ fontSize: 12, color: '#9c27b0' }} />
                      <Typography sx={{ fontSize: '0.72rem', color: '#9c27b0', fontWeight: 600, textTransform: 'capitalize' }}>
                        {dateLabel}
                      </Typography>
                    </Box>
                  )}
                  {form.location && (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                      <LocationIcon sx={{ fontSize: 12, color: '#64748b' }} />
                      <Typography sx={{ fontSize: '0.72rem', color: '#475569' }} noWrap>{form.location}</Typography>
                    </Box>
                  )}
                </Box>

                {/* Checklist */}
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                  {[
                    { label: 'Nom',         value: form.name },
                    { label: 'Date',        value: form.date },
                    { label: 'Description', value: form.description ? `${form.description.length} car.` : null },
                    { label: 'Lieu',        value: form.location },
                  ].map((item, i) => (
                    <Box key={i} sx={{ display: 'flex', alignItems: 'center', gap: 1.25, p: 1, borderRadius: 2,
                      bgcolor: item.value ? '#fdf4ff' : '#f8fafc',
                      border: `1px solid ${item.value ? '#e9d5ff' : '#f1f5f9'}` }}>
                      <Box sx={{ width: 8, height: 8, borderRadius: '50%', flexShrink: 0,
                        bgcolor: item.value ? '#9c27b0' : '#e2e8f0' }} />
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
              </CardContent>
            </Card>

            {/* Boutons */}
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
              <Button fullWidth variant="contained" startIcon={<SaveIcon />}
                onClick={handleSave} disabled={saving}
                sx={{ py: 1.25, borderRadius: 2, textTransform: 'none', fontWeight: 700, fontSize: '0.9rem',
                  background: 'linear-gradient(135deg,#4a148c,#9c27b0)',
                  '&:hover': { background: 'linear-gradient(135deg,#38006b,#7b1fa2)' },
                  '&:disabled': { opacity: 0.5 } }}>
                {saving ? 'Enregistrement…' : 'Enregistrer les modifications'}
              </Button>
              <Button fullWidth onClick={() => navigate('/events')} disabled={saving}
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

export default EditEvent;
