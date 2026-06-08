import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box, Card, CardContent, Typography, TextField, Button,
  Grid, Alert, Avatar, Divider, Skeleton,
} from '@mui/material';
import {
  ArrowBack as BackIcon,
  HowToReg as RecommendIcon,
  Person as PersonIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  Groups as RelationIcon,
  Lightbulb as ReasonIcon,
  CheckCircle as CheckIcon,
  Send as SendIcon,
  Work as WorkIcon,
} from '@mui/icons-material';
import { jobService } from '../../services/jobService';

const fieldSx = {
  '& .MuiOutlinedInput-root': {
    borderRadius: 2, fontSize: '0.875rem',
    '&:hover fieldset': { borderColor: '#0891b2' },
    '&.Mui-focused fieldset': { borderColor: '#0891b2' },
  },
  '& .MuiInputLabel-root.Mui-focused': { color: '#0891b2' },
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

const RecommendProfile = () => {
  const { jobId } = useParams();
  const navigate  = useNavigate();

  const [jobOffer,   setJobOffer]   = useState(null);
  const [loading,    setLoading]    = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error,      setError]      = useState('');
  const [success,    setSuccess]    = useState('');
  const [form,       setForm]       = useState({
    candidate_name: '', candidate_email: '', candidate_phone: '',
    relationship: '', recommendation_reason: '',
  });

  useEffect(() => {
    jobService.getPublicJobDetail(jobId)
      .then(r => setJobOffer(r.data))
      .catch(() => setError('Impossible de charger l\'offre.'))
      .finally(() => setLoading(false));
  }, [jobId]);

  const set = (field, val) => setForm(p => ({ ...p, [field]: val }));

  const filled = [form.candidate_name, form.candidate_email, form.relationship, form.recommendation_reason].filter(Boolean).length;

  const handleSubmit = async () => {
    if (!form.candidate_name.trim() || !form.candidate_email.trim() || !form.relationship.trim() || !form.recommendation_reason.trim()) {
      setError('Nom, email, relation et raison sont obligatoires.'); return;
    }
    setSubmitting(true); setError('');
    try {
      await jobService.recommendProfile(jobId, form);
      setSuccess('Recommandation envoyée avec succès !');
      setTimeout(() => navigate('/employee/recommend'), 1800);
    } catch (e) {
      setError(e.response?.data?.error || 'Erreur lors de l\'envoi de la recommandation');
    } finally { setSubmitting(false); }
  };

  if (loading) return (
    <Box sx={{ p: 3 }}>
      {[1,2,3].map(i => <Skeleton key={i} variant="rounded" height={80} sx={{ mb: 2, borderRadius: 3 }} />)}
    </Box>
  );

  return (
    <Box sx={{ width: '100%' }}>

      {/* Banner */}
      <Card elevation={0} sx={{ borderRadius: 3, border: '1px solid #e8ecf0', mb: 3, overflow: 'hidden' }}>
        <Box sx={{ background: 'linear-gradient(135deg,#0f172a 0%,#1e3a5f 60%,#1e40af 100%)',
          px: 3, py: 2.5, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Button startIcon={<BackIcon />} onClick={() => navigate('/employee/recommend')} size="small"
              sx={{ color: 'rgba(255,255,255,0.7)', textTransform: 'none', borderRadius: 2,
                '&:hover': { bgcolor: 'rgba(255,255,255,0.1)', color: 'white' } }}>
              Retour
            </Button>
            <Box sx={{ p: 1.25, borderRadius: 2, bgcolor: 'rgba(255,255,255,0.12)', display: 'inline-flex' }}>
              <RecommendIcon sx={{ fontSize: 22, color: 'white' }} />
            </Box>
            <Box>
              <Typography variant="h5" fontWeight={700} color="white">Recommander un profil</Typography>
              <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.65)', mt: 0.3 }}>
                {jobOffer ? `Pour : ${jobOffer.title}` : 'Chargement…'}
              </Typography>
            </Box>
          </Box>
          {/* Progress */}
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

        {/* ── Formulaire ── */}
        <Grid item xs={12} lg={8}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>

            {error   && <Alert severity="error"   sx={{ borderRadius: 2 }} onClose={() => setError('')}>{error}</Alert>}
            {success && <Alert severity="success" sx={{ borderRadius: 2 }}>{success}</Alert>}

            {/* Infos candidat */}
            <Card elevation={0} sx={{ border: '1px solid #e8ecf0', borderRadius: 3, overflow: 'hidden' }}>
              <NavHeader title="Informations du candidat" icon={<PersonIcon />} />
              <CardContent sx={{ p: 3 }}>
                <Grid container spacing={2.5}>
                  <Grid item xs={12} sm={6}>
                    <SectionLabel label="Nom complet" required />
                    <TextField autoFocus fullWidth size="small" value={form.candidate_name}
                      onChange={e => set('candidate_name', e.target.value)}
                      placeholder="Prénom et Nom du candidat" sx={fieldSx} />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <SectionLabel label="Email" required />
                    <TextField fullWidth size="small" type="email" value={form.candidate_email}
                      onChange={e => set('candidate_email', e.target.value)}
                      placeholder="email@exemple.com" sx={fieldSx}
                      InputProps={{ startAdornment: <Box sx={{ mr: 1, display: 'flex' }}><EmailIcon sx={{ fontSize: 16, color: '#94a3b8' }} /></Box> }} />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <SectionLabel label="Téléphone" />
                    <TextField fullWidth size="small" value={form.candidate_phone}
                      onChange={e => set('candidate_phone', e.target.value)}
                      placeholder="+212 6XX XXX XXX" sx={fieldSx}
                      InputProps={{ startAdornment: <Box sx={{ mr: 1, display: 'flex' }}><PhoneIcon sx={{ fontSize: 16, color: '#94a3b8' }} /></Box> }} />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <SectionLabel label="Votre relation" required />
                    <TextField fullWidth size="small" value={form.relationship}
                      onChange={e => set('relationship', e.target.value)}
                      placeholder="ex: Ami, Ancien collègue, Connaissance…" sx={fieldSx}
                      InputProps={{ startAdornment: <Box sx={{ mr: 1, display: 'flex' }}><RelationIcon sx={{ fontSize: 16, color: '#94a3b8' }} /></Box> }} />
                  </Grid>
                </Grid>
              </CardContent>
            </Card>

            {/* Raison de la recommandation */}
            <Card elevation={0} sx={{ border: '1px solid #e8ecf0', borderRadius: 3, overflow: 'hidden' }}>
              <NavHeader title="Pourquoi cette recommandation ?" icon={<ReasonIcon />} />
              <CardContent sx={{ p: 3 }}>
                <SectionLabel label="Raison de la recommandation" required />
                <TextField fullWidth multiline rows={5} size="small" value={form.recommendation_reason}
                  onChange={e => set('recommendation_reason', e.target.value)}
                  placeholder="Décrivez les points forts du candidat, pourquoi il convient à ce poste, ses expériences pertinentes…"
                  sx={fieldSx} />
                <Typography variant="caption" color="text.secondary" sx={{ mt: 0.75, display: 'block' }}>
                  {form.recommendation_reason.length} caractère{form.recommendation_reason.length !== 1 ? 's' : ''}
                  {form.recommendation_reason.length > 0 && form.recommendation_reason.length < 50 && (
                    <span style={{ color: '#f57c00' }}> — minimum recommandé : 50 caractères</span>
                  )}
                </Typography>
              </CardContent>
            </Card>
          </Box>
        </Grid>

        {/* ── Panneau droit ── */}
        <Grid item xs={12} lg={4}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, position: 'sticky', top: 24 }}>

            {/* Offre concernée */}
            {jobOffer && (
              <Card elevation={0} sx={{ border: '1px solid #e8ecf0', borderRadius: 3, overflow: 'hidden' }}>
                <NavHeader title="Offre concernée" icon={<WorkIcon />} />
                <CardContent sx={{ p: 2.5 }}>
                  <Box sx={{ p: 1.75, bgcolor: '#ecfeff', borderRadius: 2, border: '1px solid #a5f3fc' }}>
                    <Typography sx={{ fontSize: '0.9rem', fontWeight: 700, color: '#0e7490', mb: 0.3 }}>
                      {jobOffer.title}
                    </Typography>
                    {jobOffer.department && (
                      <Typography sx={{ fontSize: '0.78rem', color: '#0891b2' }}>
                        {jobOffer.department}
                      </Typography>
                    )}
                    {jobOffer.description && (
                      <Typography sx={{ fontSize: '0.75rem', color: '#475569', mt: 1, lineHeight: 1.6,
                        overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical' }}>
                        {jobOffer.description}
                      </Typography>
                    )}
                  </Box>
                </CardContent>
              </Card>
            )}

            {/* Récapitulatif */}
            <Card elevation={0} sx={{ border: '1px solid #e8ecf0', borderRadius: 3, overflow: 'hidden' }}>
              <NavHeader title="Récapitulatif" icon={<CheckIcon />} />
              <CardContent sx={{ p: 2.5 }}>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                  {[
                    { label: 'Candidat',  value: form.candidate_name },
                    { label: 'Email',     value: form.candidate_email },
                    { label: 'Relation',  value: form.relationship },
                    { label: 'Raison',    value: form.recommendation_reason ? `${form.recommendation_reason.length} car.` : null },
                  ].map((item, i) => (
                    <Box key={i} sx={{ display: 'flex', alignItems: 'center', gap: 1.25, p: 1, borderRadius: 2,
                      bgcolor: item.value ? '#ecfeff' : '#f8fafc',
                      border: `1px solid ${item.value ? '#a5f3fc' : '#f1f5f9'}` }}>
                      <Box sx={{ width: 8, height: 8, borderRadius: '50%', flexShrink: 0,
                        bgcolor: item.value ? '#0891b2' : '#e2e8f0' }} />
                      <Box sx={{ flex: 1, minWidth: 0 }}>
                        <Typography sx={{ fontSize: '0.68rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.4px' }}>
                          {item.label}
                        </Typography>
                        <Typography sx={{ fontSize: '0.78rem', fontWeight: 600,
                          color: item.value ? '#1e293b' : '#cbd5e1' }} noWrap>
                          {item.value || 'Non renseigné'}
                        </Typography>
                      </Box>
                      {item.value && <CheckIcon sx={{ fontSize: 14, color: '#0891b2', flexShrink: 0 }} />}
                    </Box>
                  ))}
                </Box>
                <Divider sx={{ my: 2 }} />
                <Box sx={{ p: 1.25, bgcolor: '#ecfeff', borderRadius: 2, border: '1px solid #a5f3fc' }}>
                  <Typography sx={{ fontSize: '0.75rem', color: '#0891b2' }}>
                    Votre recommandation sera transmise à l'équipe RH pour examen.
                  </Typography>
                </Box>
              </CardContent>
            </Card>

            {/* Boutons */}
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
              <Button fullWidth variant="contained" startIcon={<SendIcon />}
                onClick={handleSubmit} disabled={submitting}
                sx={{ py: 1.25, borderRadius: 2, textTransform: 'none', fontWeight: 700, fontSize: '0.9rem',
                  background: 'linear-gradient(135deg,#0c4a6e,#0891b2)',
                  '&:hover': { background: 'linear-gradient(135deg,#0f172a,#0c4a6e)' },
                  '&:disabled': { opacity: 0.5 } }}>
                {submitting ? 'Envoi en cours…' : 'Envoyer la recommandation'}
              </Button>
              <Button fullWidth onClick={() => navigate('/employee/recommend')} disabled={submitting}
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

export default RecommendProfile;
