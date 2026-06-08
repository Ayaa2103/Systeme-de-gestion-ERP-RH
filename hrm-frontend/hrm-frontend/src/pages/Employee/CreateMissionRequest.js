import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box, Card, CardContent, Typography, TextField, Button,
  Grid, Alert, Avatar, Divider,
} from '@mui/material';
import {
  ArrowBack as BackIcon,
  FlightTakeoff as MissionIcon,
  LocationOn as LocationIcon,
  CalendarToday as CalendarIcon,
  Description as ReasonIcon,
  CheckCircle as CheckIcon,
  Send as SendIcon,
} from '@mui/icons-material';
import { createMissionRequest } from '../../services/employeeService';
import { format, differenceInCalendarDays } from 'date-fns';
import { fr } from 'date-fns/locale';

const fieldSx = {
  '& .MuiOutlinedInput-root': {
    borderRadius: 2, fontSize: '0.875rem',
    '&:hover fieldset': { borderColor: '#e65100' },
    '&.Mui-focused fieldset': { borderColor: '#e65100' },
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

const CreateMissionRequest = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState('');
  const [success, setSuccess] = useState('');
  const [form,    setForm]    = useState({ destination: '', start_date: '', end_date: '', reason: '', comment: '' });

  const set = (f, v) => setForm(p => ({ ...p, [f]: v }));

  const duration = form.start_date && form.end_date && new Date(form.end_date) >= new Date(form.start_date)
    ? differenceInCalendarDays(new Date(form.end_date), new Date(form.start_date)) + 1 : null;

  const filled = [form.destination, form.start_date, form.end_date, form.reason].filter(Boolean).length;

  const handleSubmit = async () => {
    if (!form.destination || !form.start_date || !form.end_date) {
      setError('La destination et les dates sont obligatoires.'); return;
    }
    if (new Date(form.end_date) < new Date(form.start_date)) {
      setError('La date de fin doit être postérieure à la date de début.'); return;
    }
    if (new Date(form.start_date) < new Date().setHours(0,0,0,0)) {
      setError('La date de début ne peut pas être dans le passé.'); return;
    }
    setLoading(true); setError('');
    try {
      await createMissionRequest(form);
      setSuccess('Demande de mission soumise avec succès !');
      setTimeout(() => navigate('/employee/requests'), 1800);
    } catch (e) {
      setError(e.response?.data?.error || 'Erreur lors de la soumission');
    } finally { setLoading(false); }
  };

  return (
    <Box sx={{ width: '100%' }}>
      {/* Banner */}
      <Card elevation={0} sx={{ borderRadius: 3, border: '1px solid #e8ecf0', mb: 3, overflow: 'hidden' }}>
        <Box sx={{ background: 'linear-gradient(135deg,#0f172a 0%,#1e3a5f 60%,#1e40af 100%)',
          px: 3, py: 2.5, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Button startIcon={<BackIcon />} onClick={() => navigate('/employee/requests')} size="small"
              sx={{ color: 'rgba(255,255,255,0.7)', textTransform: 'none', borderRadius: 2,
                '&:hover': { bgcolor: 'rgba(255,255,255,0.1)', color: 'white' } }}>
              Retour
            </Button>
            <Box sx={{ p: 1.25, borderRadius: 2, bgcolor: 'rgba(255,255,255,0.12)', display: 'inline-flex' }}>
              <MissionIcon sx={{ fontSize: 22, color: 'white' }} />
            </Box>
            <Box>
              <Typography variant="h5" fontWeight={700} color="white">Ordre de mission</Typography>
              <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.65)', mt: 0.3 }}>
                Demandez une autorisation de déplacement professionnel
              </Typography>
            </Box>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Box sx={{ display: 'flex', gap: 0.5 }}>
              {[1,2,3,4].map(i => (
                <Box key={i} sx={{ width: 20, height: 4, borderRadius: 2,
                  bgcolor: i <= filled ? '#60a5fa' : 'rgba(255,255,255,0.2)' }} />
              ))}
            </Box>
            <Typography sx={{ color: 'rgba(255,255,255,0.65)', fontSize: '0.78rem' }}>{filled}/4</Typography>
          </Box>
        </Box>
      </Card>

      <Grid container spacing={3}>
        <Grid item xs={12} lg={8}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            {error   && <Alert severity="error"   sx={{ borderRadius: 2 }} onClose={() => setError('')}>{error}</Alert>}
            {success && <Alert severity="success" sx={{ borderRadius: 2 }}>{success}</Alert>}

            {/* Destination */}
            <Card elevation={0} sx={{ border: '1px solid #e8ecf0', borderRadius: 3, overflow: 'hidden' }}>
              <NavHeader title="Destination *" icon={<LocationIcon />} />
              <CardContent sx={{ p: 3 }}>
                <TextField fullWidth size="small" value={form.destination} onChange={e => set('destination', e.target.value)}
                  placeholder="Ex: Paris, Casablanca, Rabat, Lyon…" sx={fieldSx} />
                {form.destination && (
                  <Box sx={{ mt: 1.5, display: 'flex', alignItems: 'center', gap: 0.75 }}>
                    <LocationIcon sx={{ fontSize: 15, color: '#e65100' }} />
                    <Typography sx={{ fontSize: '0.82rem', color: '#e65100', fontWeight: 600 }}>
                      {form.destination}
                    </Typography>
                  </Box>
                )}
              </CardContent>
            </Card>

            {/* Dates */}
            <Card elevation={0} sx={{ border: '1px solid #e8ecf0', borderRadius: 3, overflow: 'hidden' }}>
              <NavHeader title="Période de mission" icon={<CalendarIcon />} />
              <CardContent sx={{ p: 3 }}>
                <Grid container spacing={2.5}>
                  <Grid item xs={12} sm={6}>
                    <SectionLabel label="Date de départ" required />
                    <TextField fullWidth size="small" type="date" InputLabelProps={{ shrink: true }}
                      value={form.start_date} onChange={e => set('start_date', e.target.value)} sx={fieldSx} />
                    {form.start_date && (
                      <Typography sx={{ fontSize: '0.75rem', color: '#e65100', mt: 0.5, textTransform: 'capitalize' }}>
                        {format(new Date(form.start_date), 'EEEE d MMMM yyyy', { locale: fr })}
                      </Typography>
                    )}
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <SectionLabel label="Date de retour" required />
                    <TextField fullWidth size="small" type="date" InputLabelProps={{ shrink: true }}
                      value={form.end_date} onChange={e => set('end_date', e.target.value)} sx={fieldSx}
                      inputProps={{ min: form.start_date }} />
                    {form.end_date && (
                      <Typography sx={{ fontSize: '0.75rem', color: '#e65100', mt: 0.5, textTransform: 'capitalize' }}>
                        {format(new Date(form.end_date), 'EEEE d MMMM yyyy', { locale: fr })}
                      </Typography>
                    )}
                  </Grid>
                </Grid>
                {duration !== null && (
                  <Box sx={{ mt: 2, p: 1.5, bgcolor: '#fff7ed', borderRadius: 2, border: '1px solid #fed7aa',
                    display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <MissionIcon sx={{ fontSize: 18, color: '#e65100' }} />
                    <Typography sx={{ fontSize: '0.875rem', fontWeight: 700, color: '#e65100' }}>
                      {duration} jour{duration !== 1 ? 's' : ''} de mission
                    </Typography>
                  </Box>
                )}
              </CardContent>
            </Card>

            {/* Motif */}
            <Card elevation={0} sx={{ border: '1px solid #e8ecf0', borderRadius: 3, overflow: 'hidden' }}>
              <NavHeader title="Motif et commentaires" icon={<ReasonIcon />} />
              <CardContent sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
                  <Box>
                    <SectionLabel label="Objet de la mission *" />
                    <TextField fullWidth multiline rows={3} size="small" value={form.reason}
                      onChange={e => set('reason', e.target.value)}
                      placeholder="Décrivez l'objectif et la nature de votre déplacement…" sx={fieldSx} />
                  </Box>
                  <Box>
                    <SectionLabel label="Commentaire" />
                    <TextField fullWidth multiline rows={2} size="small" value={form.comment}
                      onChange={e => set('comment', e.target.value)}
                      placeholder="Informations supplémentaires…" sx={fieldSx} />
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Box>
        </Grid>

        {/* Récap */}
        <Grid item xs={12} lg={4}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, position: 'sticky', top: 24 }}>
            <Card elevation={0} sx={{ border: '1px solid #e8ecf0', borderRadius: 3, overflow: 'hidden' }}>
              <NavHeader title="Récapitulatif" icon={<CheckIcon />} />
              <CardContent sx={{ p: 2.5 }}>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                  {[
                    { label: 'Destination', value: form.destination },
                    { label: 'Départ',      value: form.start_date ? format(new Date(form.start_date), 'dd MMM yyyy', { locale: fr }) : null },
                    { label: 'Retour',      value: form.end_date   ? format(new Date(form.end_date),   'dd MMM yyyy', { locale: fr }) : null },
                    { label: 'Durée',       value: duration ? `${duration} jour${duration !== 1 ? 's' : ''}` : null },
                    { label: 'Objet',       value: form.reason ? `${form.reason.substring(0, 40)}…` : null },
                  ].map((item, i) => (
                    <Box key={i} sx={{ display: 'flex', alignItems: 'center', gap: 1.25, p: 1, borderRadius: 2,
                      bgcolor: item.value ? '#fff7ed' : '#f8fafc',
                      border: `1px solid ${item.value ? '#fed7aa' : '#f1f5f9'}` }}>
                      <Box sx={{ width: 8, height: 8, borderRadius: '50%',
                        bgcolor: item.value ? '#e65100' : '#e2e8f0', flexShrink: 0 }} />
                      <Box sx={{ flex: 1, minWidth: 0 }}>
                        <Typography sx={{ fontSize: '0.68rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.4px' }}>{item.label}</Typography>
                        <Typography sx={{ fontSize: '0.78rem', fontWeight: 600, color: item.value ? '#1e293b' : '#cbd5e1' }} noWrap>
                          {item.value || 'Non renseigné'}
                        </Typography>
                      </Box>
                      {item.value && <CheckIcon sx={{ fontSize: 14, color: '#e65100', flexShrink: 0 }} />}
                    </Box>
                  ))}
                </Box>
                <Divider sx={{ my: 2 }} />
                <Box sx={{ p: 1.25, bgcolor: '#fff8e1', borderRadius: 2, border: '1px solid #ffe0b2' }}>
                  <Typography sx={{ fontSize: '0.75rem', color: '#e65100' }}>
                    Votre demande sera examinée par le Responsable RH.
                  </Typography>
                </Box>
              </CardContent>
            </Card>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
              <Button fullWidth variant="contained" startIcon={<SendIcon />}
                onClick={handleSubmit} disabled={loading}
                sx={{ py: 1.25, borderRadius: 2, textTransform: 'none', fontWeight: 700,
                  background: 'linear-gradient(135deg,#1e3a5f,#1e40af)',
                  '&:hover': { background: 'linear-gradient(135deg,#0f172a,#1e3a5f)' } }}>
                {loading ? 'Envoi…' : 'Soumettre la demande'}
              </Button>
              <Button fullWidth onClick={() => navigate('/employee/requests')} disabled={loading}
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

export default CreateMissionRequest;
