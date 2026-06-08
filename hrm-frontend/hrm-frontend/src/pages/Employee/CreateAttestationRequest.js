import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box, Card, CardContent, Typography, TextField, Button,
  Grid, Alert, Avatar, Divider,
} from '@mui/material';
import {
  ArrowBack as BackIcon,
  Description as AttestIcon,
  Work as WorkIcon,
  Payments as SalaryIcon,
  Star as ExpIcon,
  School as InternIcon,
  CheckCircle as CheckIcon,
  Send as SendIcon,
  Info as PurposeIcon,
} from '@mui/icons-material';
import { createAttestationRequest } from '../../services/employeeService';

const ATTEST_TYPES = [
  { value: 'employment', label: 'Travail',      icon: <WorkIcon />,   color: '#1976d2', bg: '#eff6ff',
    desc: 'Attestation de travail' },
  { value: 'salary',     label: 'Salaire',      icon: <SalaryIcon />, color: '#2e7d32', bg: '#e8f5e9',
    desc: 'Attestation de salaire' },
  { value: 'experience', label: 'Expérience',   icon: <ExpIcon />,    color: '#f57c00', bg: '#fff8e1',
    desc: 'Attestation d\'expérience' },
  { value: 'internship', label: 'Stage',        icon: <InternIcon />, color: '#7b1fa2', bg: '#f3e5f5',
    desc: 'Attestation de stage' },
];

const fieldSx = {
  '& .MuiOutlinedInput-root': {
    borderRadius: 2, fontSize: '0.875rem',
    '&:hover fieldset': { borderColor: '#7b1fa2' },
    '&.Mui-focused fieldset': { borderColor: '#7b1fa2' },
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

const CreateAttestationRequest = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState('');
  const [success, setSuccess] = useState('');
  const [form,    setForm]    = useState({ purpose: '', attestation_type: 'employment', comment: '' });

  const set = (f, v) => setForm(p => ({ ...p, [f]: v }));
  const selectedType = ATTEST_TYPES.find(t => t.value === form.attestation_type);
  const filled = [form.attestation_type, form.purpose].filter(Boolean).length;

  const handleSubmit = async () => {
    if (!form.purpose) { setError('L\'objectif est obligatoire.'); return; }
    setLoading(true); setError('');
    try {
      await createAttestationRequest(form);
      setSuccess('Demande d\'attestation soumise avec succès !');
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
              <AttestIcon sx={{ fontSize: 22, color: 'white' }} />
            </Box>
            <Box>
              <Typography variant="h5" fontWeight={700} color="white">Demande d'attestation</Typography>
              <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.65)', mt: 0.3 }}>
                Demandez un document officiel auprès des RH
              </Typography>
            </Box>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Box sx={{ display: 'flex', gap: 0.5 }}>
              {[1,2].map(i => (
                <Box key={i} sx={{ width: 24, height: 4, borderRadius: 2,
                  bgcolor: i <= filled ? '#60a5fa' : 'rgba(255,255,255,0.2)' }} />
              ))}
            </Box>
            <Typography sx={{ color: 'rgba(255,255,255,0.65)', fontSize: '0.78rem' }}>{filled}/2</Typography>
          </Box>
        </Box>
      </Card>

      <Grid container spacing={3}>
        <Grid item xs={12} lg={8}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            {error   && <Alert severity="error"   sx={{ borderRadius: 2 }} onClose={() => setError('')}>{error}</Alert>}
            {success && <Alert severity="success" sx={{ borderRadius: 2 }}>{success}</Alert>}

            {/* Type */}
            <Card elevation={0} sx={{ border: '1px solid #e8ecf0', borderRadius: 3, overflow: 'hidden' }}>
              <NavHeader title="Type d'attestation *" icon={<AttestIcon />} />
              <CardContent sx={{ p: 3 }}>
                <Grid container spacing={1.5}>
                  {ATTEST_TYPES.map(t => (
                    <Grid item xs={6} sm={3} key={t.value}>
                      <Box onClick={() => set('attestation_type', t.value)}
                        sx={{ p: 1.75, borderRadius: 2, cursor: 'pointer', textAlign: 'center',
                          border: `2px solid ${form.attestation_type === t.value ? t.color : '#e8ecf0'}`,
                          bgcolor: form.attestation_type === t.value ? t.bg : 'white', transition: 'all 0.15s',
                          '&:hover': { borderColor: t.color, bgcolor: t.bg } }}>
                        <Avatar sx={{ bgcolor: t.bg, width: 36, height: 36, mx: 'auto', mb: 0.75 }}>
                          {React.cloneElement(t.icon, { sx: { color: t.color, fontSize: 17 } })}
                        </Avatar>
                        <Typography sx={{ fontSize: '0.82rem', fontWeight: 700,
                          color: form.attestation_type === t.value ? t.color : '#1e293b' }}>
                          {t.label}
                        </Typography>
                        <Typography sx={{ fontSize: '0.68rem', color: form.attestation_type === t.value ? t.color : '#94a3b8', mt: 0.2 }}>
                          {t.desc}
                        </Typography>
                      </Box>
                    </Grid>
                  ))}
                </Grid>
              </CardContent>
            </Card>

            {/* Objectif + Commentaire */}
            <Card elevation={0} sx={{ border: '1px solid #e8ecf0', borderRadius: 3, overflow: 'hidden' }}>
              <NavHeader title="Détails de la demande" icon={<PurposeIcon />} />
              <CardContent sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
                  <Box>
                    <SectionLabel label="Objectif / Destination" required />
                    <TextField fullWidth size="small" value={form.purpose} onChange={e => set('purpose', e.target.value)}
                      placeholder="Ex: Demande de visa, dossier bancaire, appel d'offres…" sx={fieldSx} />
                  </Box>
                  <Box>
                    <SectionLabel label="Commentaire" />
                    <TextField fullWidth multiline rows={3} size="small" value={form.comment}
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
                {selectedType && (
                  <Box sx={{ p: 1.5, borderRadius: 2, bgcolor: selectedType.bg,
                    border: `1px solid ${selectedType.color}20`, mb: 2,
                    display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <Avatar sx={{ bgcolor: `${selectedType.color}15`, width: 30, height: 30 }}>
                      {React.cloneElement(selectedType.icon, { sx: { color: selectedType.color, fontSize: 15 } })}
                    </Avatar>
                    <Typography sx={{ fontSize: '0.82rem', fontWeight: 700, color: selectedType.color }}>
                      {selectedType.label}
                    </Typography>
                  </Box>
                )}
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                  {[
                    { label: 'Type',    value: selectedType?.label },
                    { label: 'Objectif', value: form.purpose || null },
                  ].map((item, i) => (
                    <Box key={i} sx={{ display: 'flex', alignItems: 'center', gap: 1.25, p: 1, borderRadius: 2,
                      bgcolor: item.value ? '#f0fdf4' : '#f8fafc',
                      border: `1px solid ${item.value ? '#a7f3d030' : '#f1f5f9'}` }}>
                      <Box sx={{ width: 8, height: 8, borderRadius: '50%',
                        bgcolor: item.value ? '#2e7d32' : '#e2e8f0', flexShrink: 0 }} />
                      <Box sx={{ flex: 1, minWidth: 0 }}>
                        <Typography sx={{ fontSize: '0.68rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.4px' }}>{item.label}</Typography>
                        <Typography sx={{ fontSize: '0.78rem', fontWeight: 600, color: item.value ? '#1e293b' : '#cbd5e1' }} noWrap>
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
                    Votre demande sera traitée par le Responsable RH.
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

export default CreateAttestationRequest;
