import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box, Card, CardContent, Typography, TextField, Button,
  Grid, Alert, Avatar, Divider, Chip,
} from '@mui/material';
import {
  ArrowBack as BackIcon,
  BeachAccess as LeaveIcon,
  CalendarToday as CalendarIcon,
  CheckCircle as CheckIcon,
  Send as SendIcon,
  WbSunny as AnnualIcon,
  LocalHospital as SickIcon,
  Person as PersonalIcon,
  Print as PrintIcon,
} from '@mui/icons-material';
import { createLeaveRequest, downloadLeaveRequestTemplate } from '../../services/employeeService';
import { downloadBlobResponse } from '../../utils/downloadFile';
import { format, differenceInBusinessDays, differenceInCalendarDays } from 'date-fns';
import { fr } from 'date-fns/locale';

const LEAVE_TYPES = [
  { value: 'annual',   label: 'Congé annuel',   icon: <AnnualIcon />,   color: '#1976d2', bg: '#eff6ff',
    desc: 'Congé payé annuel' },
  { value: 'sick',     label: 'Congé maladie',  icon: <SickIcon />,     color: '#c62828', bg: '#ffebee',
    desc: 'Arrêt maladie avec justificatif' },
  { value: 'personal', label: 'Congé personnel', icon: <PersonalIcon />, color: '#7b1fa2', bg: '#f3e5f5',
    desc: 'Motif personnel' },
];

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

const CreateLeaveRequest = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [error,   setError]   = useState('');
  const [success, setSuccess] = useState('');
  const [form,    setForm]    = useState({ start_date: '', end_date: '', leave_type: 'annual', comment: '' });

  const set = (field, val) => setForm(p => ({ ...p, [field]: val }));

  const selectedType = LEAVE_TYPES.find(t => t.value === form.leave_type);

  const duration = form.start_date && form.end_date && new Date(form.end_date) > new Date(form.start_date)
    ? differenceInCalendarDays(new Date(form.end_date), new Date(form.start_date)) + 1
    : null;

  const businessDays = form.start_date && form.end_date && new Date(form.end_date) > new Date(form.start_date)
    ? differenceInBusinessDays(new Date(form.end_date), new Date(form.start_date)) + 1
    : null;

  const filled = [form.start_date, form.end_date, form.leave_type].filter(Boolean).length;

  const handleSubmit = async () => {
    if (!form.start_date || !form.end_date) {
      setError('Les dates de début et de fin sont obligatoires.'); return;
    }
    if (new Date(form.end_date) < new Date(form.start_date)) {
      setError('La date de fin doit être postérieure à la date de début.'); return;
    }
    setLoading(true); setError('');
    try {
      await createLeaveRequest(form);
      setSuccess('Demande de congé soumise avec succès !');
      setTimeout(() => navigate('/employee/requests'), 1800);
    } catch (e) {
      setError(e.response?.data?.error || 'Erreur lors de la soumission');
    } finally { setLoading(false); }
  };

  const handleDownloadTemplate = async () => {
    if (!form.start_date || !form.end_date) {
      setError('Renseignez les dates de début et de fin avant de télécharger le formulaire.'); return;
    }
    if (new Date(form.end_date) < new Date(form.start_date)) {
      setError('La date de fin doit être postérieure à la date de début.'); return;
    }
    setDownloading(true); setError('');
    try {
      const response = await downloadLeaveRequestTemplate(form);
      downloadBlobResponse(response, 'Demande_Conge.docx');
    } catch (e) {
      setError('Erreur lors de la génération du formulaire.');
    } finally { setDownloading(false); }
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
              <LeaveIcon sx={{ fontSize: 22, color: 'white' }} />
            </Box>
            <Box>
              <Typography variant="h5" fontWeight={700} color="white">Demande de congé</Typography>
              <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.65)', mt: 0.3 }}>
                Soumettez votre demande de congé pour validation
              </Typography>
            </Box>
          </Box>
          {/* Progress */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Box sx={{ display: 'flex', gap: 0.5 }}>
              {[1,2,3].map(i => (
                <Box key={i} sx={{ width: 24, height: 4, borderRadius: 2,
                  bgcolor: i <= filled ? '#60a5fa' : 'rgba(255,255,255,0.2)' }} />
              ))}
            </Box>
            <Typography sx={{ color: 'rgba(255,255,255,0.65)', fontSize: '0.78rem' }}>{filled}/3</Typography>
          </Box>
        </Box>
      </Card>

      <Grid container spacing={3}>

        {/* ── Formulaire ── */}
        <Grid item xs={12} lg={8}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>

            {error   && <Alert severity="error"   sx={{ borderRadius: 2 }} onClose={() => setError('')}>{error}</Alert>}
            {success && <Alert severity="success" sx={{ borderRadius: 2 }}>{success}</Alert>}

            {/* Type de congé */}
            <Card elevation={0} sx={{ border: '1px solid #e8ecf0', borderRadius: 3, overflow: 'hidden' }}>
              <NavHeader title="Type de congé *" icon={<LeaveIcon />} />
              <CardContent sx={{ p: 3 }}>
                <Grid container spacing={1.5}>
                  {LEAVE_TYPES.map(t => (
                    <Grid item xs={12} sm={4} key={t.value}>
                      <Box onClick={() => set('leave_type', t.value)}
                        sx={{ p: 1.75, borderRadius: 2, cursor: 'pointer', textAlign: 'center',
                          border: `2px solid ${form.leave_type === t.value ? t.color : '#e8ecf0'}`,
                          bgcolor: form.leave_type === t.value ? t.bg : 'white', transition: 'all 0.15s',
                          '&:hover': { borderColor: t.color, bgcolor: t.bg } }}>
                        <Avatar sx={{ bgcolor: t.bg, width: 38, height: 38, mx: 'auto', mb: 1 }}>
                          {React.cloneElement(t.icon, { sx: { color: t.color, fontSize: 18 } })}
                        </Avatar>
                        <Typography sx={{ fontSize: '0.85rem', fontWeight: 700,
                          color: form.leave_type === t.value ? t.color : '#1e293b' }}>
                          {t.label}
                        </Typography>
                        <Typography sx={{ fontSize: '0.7rem', color: form.leave_type === t.value ? t.color : '#94a3b8', mt: 0.2 }}>
                          {t.desc}
                        </Typography>
                      </Box>
                    </Grid>
                  ))}
                </Grid>
              </CardContent>
            </Card>

            {/* Dates */}
            <Card elevation={0} sx={{ border: '1px solid #e8ecf0', borderRadius: 3, overflow: 'hidden' }}>
              <NavHeader title="Période de congé" icon={<CalendarIcon />} />
              <CardContent sx={{ p: 3 }}>
                <Grid container spacing={2.5}>
                  <Grid item xs={12} sm={6}>
                    <SectionLabel label="Date de début" required />
                    <TextField fullWidth size="small" type="date" InputLabelProps={{ shrink: true }}
                      value={form.start_date} onChange={e => set('start_date', e.target.value)} sx={fieldSx} />
                    {form.start_date && (
                      <Typography sx={{ fontSize: '0.75rem', color: '#1976d2', mt: 0.5, textTransform: 'capitalize' }}>
                        {format(new Date(form.start_date), 'EEEE d MMMM yyyy', { locale: fr })}
                      </Typography>
                    )}
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <SectionLabel label="Date de fin" required />
                    <TextField fullWidth size="small" type="date" InputLabelProps={{ shrink: true }}
                      value={form.end_date} onChange={e => set('end_date', e.target.value)} sx={fieldSx}
                      inputProps={{ min: form.start_date }} />
                    {form.end_date && (
                      <Typography sx={{ fontSize: '0.75rem', color: '#1976d2', mt: 0.5, textTransform: 'capitalize' }}>
                        {format(new Date(form.end_date), 'EEEE d MMMM yyyy', { locale: fr })}
                      </Typography>
                    )}
                  </Grid>
                </Grid>

                {duration !== null && (
                  <Box sx={{ mt: 2, p: 1.5, bgcolor: '#eff6ff', borderRadius: 2, border: '1px solid #bfdbfe',
                    display: 'flex', alignItems: 'center', gap: 2 }}>
                    <CalendarIcon sx={{ fontSize: 18, color: '#1976d2' }} />
                    <Box>
                      <Typography sx={{ fontSize: '0.875rem', fontWeight: 700, color: '#1976d2' }}>
                        {duration} jour{duration !== 1 ? 's' : ''} calendaires
                      </Typography>
                      {businessDays !== null && (
                        <Typography variant="caption" color="text.secondary">
                          dont {businessDays} jour{businessDays !== 1 ? 's' : ''} ouvrable{businessDays !== 1 ? 's' : ''}
                        </Typography>
                      )}
                    </Box>
                  </Box>
                )}
              </CardContent>
            </Card>

            {/* Commentaire */}
            <Card elevation={0} sx={{ border: '1px solid #e8ecf0', borderRadius: 3, overflow: 'hidden' }}>
              <NavHeader title="Commentaire" icon={<CheckIcon />} />
              <CardContent sx={{ p: 3 }}>
                <TextField fullWidth multiline rows={3} size="small"
                  placeholder="Précisez la raison de votre demande si nécessaire…"
                  value={form.comment} onChange={e => set('comment', e.target.value)} sx={fieldSx} />
                <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
                  Optionnel — aide le RH à traiter votre demande plus rapidement
                </Typography>
              </CardContent>
            </Card>

          </Box>
        </Grid>

        {/* ── Récapitulatif ── */}
        <Grid item xs={12} lg={4}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, position: 'sticky', top: 24 }}>

            <Card elevation={0} sx={{ border: '1px solid #e8ecf0', borderRadius: 3, overflow: 'hidden' }}>
              <NavHeader title="Récapitulatif" icon={<CheckIcon />} />
              <CardContent sx={{ p: 2.5 }}>

                {/* Aperçu type */}
                {selectedType && (
                  <Box sx={{ p: 1.5, borderRadius: 2, bgcolor: selectedType.bg,
                    border: `1px solid ${selectedType.color}20`, mb: 2,
                    display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <Avatar sx={{ bgcolor: `${selectedType.color}15`, width: 32, height: 32 }}>
                      {React.cloneElement(selectedType.icon, { sx: { color: selectedType.color, fontSize: 16 } })}
                    </Avatar>
                    <Box>
                      <Typography sx={{ fontSize: '0.78rem', color: selectedType.color, fontWeight: 700 }}>
                        {selectedType.label}
                      </Typography>
                      <Typography variant="caption" sx={{ color: selectedType.color, opacity: 0.75 }}>
                        {selectedType.desc}
                      </Typography>
                    </Box>
                  </Box>
                )}

                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                  {[
                    { label: 'Type',      value: selectedType?.label },
                    { label: 'Début',     value: form.start_date ? format(new Date(form.start_date), 'dd MMM yyyy', { locale: fr }) : null },
                    { label: 'Fin',       value: form.end_date   ? format(new Date(form.end_date),   'dd MMM yyyy', { locale: fr }) : null },
                    { label: 'Durée',     value: duration ? `${duration} jour${duration !== 1 ? 's' : ''}` : null },
                  ].map((item, i) => (
                    <Box key={i} sx={{ display: 'flex', alignItems: 'center', gap: 1.25, p: 1,
                      borderRadius: 2, bgcolor: item.value ? '#f0fdf4' : '#f8fafc',
                      border: `1px solid ${item.value ? '#a7f3d030' : '#f1f5f9'}` }}>
                      <Box sx={{ width: 8, height: 8, borderRadius: '50%',
                        bgcolor: item.value ? '#2e7d32' : '#e2e8f0', flexShrink: 0 }} />
                      <Box sx={{ flex: 1, minWidth: 0 }}>
                        <Typography sx={{ fontSize: '0.68rem', color: '#94a3b8',
                          textTransform: 'uppercase', letterSpacing: '0.4px' }}>{item.label}</Typography>
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
                sx={{ py: 1.25, borderRadius: 2, textTransform: 'none', fontWeight: 700, fontSize: '0.9rem',
                  background: 'linear-gradient(135deg,#1e3a5f,#1e40af)',
                  '&:hover': { background: 'linear-gradient(135deg,#0f172a,#1e3a5f)' },
                  '&:disabled': { opacity: 0.5 } }}>
                {loading ? 'Envoi en cours…' : 'Soumettre la demande'}
              </Button>
              <Button fullWidth onClick={() => navigate('/employee/requests')} disabled={loading}
                sx={{ py: 1, borderRadius: 2, textTransform: 'none', color: '#94a3b8',
                  border: '1px solid #e2e8f0', '&:hover': { bgcolor: '#f8fafc' } }}>
                Annuler
              </Button>
            </Box>

            <Box sx={{ borderRadius: 3, border: '1.5px dashed #93c5fd90', bgcolor: '#eff6ff', p: 2.5 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1.25 }}>
                <Avatar sx={{ bgcolor: '#dbeafe', width: 38, height: 38, borderRadius: 2 }}>
                  <PrintIcon sx={{ color: '#1976d2', fontSize: 19 }} />
                </Avatar>
                <Box>
                  <Typography sx={{ fontSize: '0.84rem', fontWeight: 700, color: '#1e293b' }}>
                    Besoin d'une version papier ?
                  </Typography>
                  <Typography sx={{ fontSize: '0.7rem', color: '#1e40af', fontWeight: 600 }}>
                    À signer et remettre en main propre
                  </Typography>
                </Box>
              </Box>
              <Typography sx={{ fontSize: '0.76rem', color: '#1e3a5f', mb: 1.75, lineHeight: 1.5 }}>
                Téléchargez le formulaire Word pré-rempli avec vos informations, imprimez-le, signez-le et remettez-le au service RH.
              </Typography>
              <Button fullWidth variant="contained" startIcon={<PrintIcon />}
                onClick={handleDownloadTemplate} disabled={downloading}
                sx={{ py: 1, borderRadius: 2, textTransform: 'none', fontWeight: 700, boxShadow: 'none',
                  bgcolor: '#1976d2', '&:hover': { bgcolor: '#125ea8', boxShadow: 'none' } }}>
                {downloading ? 'Génération…' : 'Télécharger le formulaire'}
              </Button>
            </Box>

          </Box>
        </Grid>
      </Grid>
    </Box>
  );
};

export default CreateLeaveRequest;
