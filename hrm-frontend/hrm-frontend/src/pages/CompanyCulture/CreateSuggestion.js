import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box, Card, CardContent, Typography, TextField, Button, Grid,
  Alert, Avatar, Divider,
} from '@mui/material';
import {
  Lightbulb as SuggestionIcon,
  ArrowBack as BackIcon,
  Title as TitleIcon,
  Description as DescIcon,
  CheckCircle as CheckIcon,
  Send as SendIcon,
  TipsAndUpdates as TipIcon,
} from '@mui/icons-material';
import { createSuggestion } from '../../services/cultureService';

const fieldSx = {
  '& .MuiOutlinedInput-root': {
    borderRadius: 2, fontSize: '0.875rem',
    '&:hover fieldset': { borderColor: '#0288d1' },
    '&.Mui-focused fieldset': { borderColor: '#0288d1' },
  },
  '& .MuiInputLabel-root.Mui-focused': { color: '#0288d1' },
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

const TIPS = [
  'Soyez spécifique et détaillé dans votre description',
  'Expliquez le problème que votre suggestion résout',
  'Proposez des solutions concrètes et réalisables',
  'Mentionnez les bénéfices attendus pour l\'entreprise',
];

const CreateSuggestion = () => {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState('');
  const [success, setSuccess] = useState('');
  const [form,    setForm]    = useState({ title: '', suggestion_text: '' });

  const set = (field, val) => setForm(p => ({ ...p, [field]: val }));

  const filled = [form.title, form.suggestion_text].filter(Boolean).length;

  const handleSubmit = async () => {
    if (!form.title || !form.suggestion_text) {
      setError('Titre et description sont obligatoires.'); return;
    }
    setLoading(true); setError('');
    try {
      await createSuggestion(form);
      setSuccess('Suggestion soumise avec succès ! Redirection…');
      setTimeout(() => navigate('/culture/suggestions'), 1800);
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
            <Button startIcon={<BackIcon />} onClick={() => navigate('/culture/suggestions')} size="small"
              sx={{ color: 'rgba(255,255,255,0.7)', textTransform: 'none', borderRadius: 2,
                '&:hover': { bgcolor: 'rgba(255,255,255,0.1)', color: 'white' } }}>
              Retour
            </Button>
            <Box sx={{ p: 1.25, borderRadius: 2, bgcolor: 'rgba(255,255,255,0.12)', display: 'inline-flex' }}>
              <SuggestionIcon sx={{ fontSize: 22, color: 'white' }} />
            </Box>
            <Box>
              <Typography variant="h5" fontWeight={700} color="white">Nouvelle suggestion</Typography>
              <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.65)', mt: 0.3 }}>
                Partagez vos idées pour améliorer l'entreprise
              </Typography>
            </Box>
          </Box>
          {/* Progress */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Box sx={{ display: 'flex', gap: 0.5 }}>
              {[1,2].map(i => (
                <Box key={i} sx={{ width: 24, height: 4, borderRadius: 2,
                  bgcolor: i <= filled ? '#60a5fa' : 'rgba(255,255,255,0.2)' }} />
              ))}
            </Box>
            <Typography sx={{ color: 'rgba(255,255,255,0.65)', fontSize: '0.78rem' }}>{filled}/2 champs</Typography>
          </Box>
        </Box>
      </Card>

      <Grid container spacing={3}>

        {/* Formulaire */}
        <Grid item xs={12} lg={8}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>

            {error   && <Alert severity="error"   sx={{ borderRadius: 2 }} onClose={() => setError('')}>{error}</Alert>}
            {success && <Alert severity="success" sx={{ borderRadius: 2 }}>{success}</Alert>}

            <Card elevation={0} sx={{ border: '1px solid #e8ecf0', borderRadius: 3, overflow: 'hidden' }}>
              <NavHeader title="Votre suggestion" icon={<SuggestionIcon />} />
              <CardContent sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
                  <Box>
                    <SectionLabel label="Titre" required />
                    <TextField fullWidth size="small" placeholder="ex: Améliorer le processus de feedback annuel…"
                      value={form.title} onChange={e => set('title', e.target.value)} sx={fieldSx} />
                  </Box>
                  <Box>
                    <SectionLabel label="Description détaillée" required />
                    <TextField fullWidth multiline rows={6} size="small"
                      placeholder="Décrivez votre suggestion en détail — le problème identifié, votre proposition et les bénéfices attendus…"
                      value={form.suggestion_text} onChange={e => set('suggestion_text', e.target.value)} sx={fieldSx} />
                    <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
                      {form.suggestion_text.length} caractère{form.suggestion_text.length !== 1 ? 's' : ''}
                      {form.suggestion_text.length > 0 && form.suggestion_text.length < 50 && (
                        <span style={{ color: '#f57c00' }}> — minimum recommandé : 50 caractères</span>
                      )}
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>

          </Box>
        </Grid>

        {/* Panneau droit */}
        <Grid item xs={12} lg={4}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, position: 'sticky', top: 24 }}>

            {/* Récapitulatif */}
            <Card elevation={0} sx={{ border: '1px solid #e8ecf0', borderRadius: 3, overflow: 'hidden' }}>
              <NavHeader title="Récapitulatif" icon={<CheckIcon />} />
              <CardContent sx={{ p: 2.5 }}>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                  {[
                    { label: 'Titre',       value: form.title,           icon: <TitleIcon /> },
                    { label: 'Description', value: form.suggestion_text ? `${form.suggestion_text.length} car.` : null, icon: <DescIcon /> },
                  ].map((item, i) => (
                    <Box key={i} sx={{ display: 'flex', alignItems: 'center', gap: 1.25, p: 1,
                      borderRadius: 2, bgcolor: item.value ? '#e1f5fe' : '#f8fafc',
                      border: `1px solid ${item.value ? '#b3e5fc' : '#f1f5f9'}` }}>
                      <Avatar sx={{ bgcolor: item.value ? '#0288d112' : '#f1f5f9', width: 24, height: 24 }}>
                        {React.cloneElement(item.icon, { sx: { fontSize: 13, color: item.value ? '#0288d1' : '#94a3b8' } })}
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
                      {item.value && <CheckIcon sx={{ fontSize: 14, color: '#0288d1', flexShrink: 0 }} />}
                    </Box>
                  ))}
                </Box>

                <Divider sx={{ my: 2 }} />

                <Box sx={{ mb: 0.5, display: 'flex', justifyContent: 'space-between' }}>
                  <Typography sx={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600 }}>Complétude</Typography>
                  <Typography sx={{ fontSize: '0.75rem', fontWeight: 700,
                    color: filled === 2 ? '#0288d1' : '#f57c00' }}>{filled === 2 ? '100' : '50'}%</Typography>
                </Box>
                <Box sx={{ height: 6, bgcolor: '#e1f5fe', borderRadius: 3, overflow: 'hidden' }}>
                  <Box sx={{ height: '100%', width: `${filled * 50}%`, borderRadius: 3,
                    bgcolor: filled === 2 ? '#0288d1' : '#4fc3f7', transition: 'width 0.3s ease' }} />
                </Box>

                <Box sx={{ mt: 2, p: 1.25, bgcolor: '#fff8e1', borderRadius: 2, border: '1px solid #ffe0b2' }}>
                  <Typography sx={{ fontSize: '0.75rem', color: '#e65100' }}>
                    Votre suggestion sera transmise au Directeur RH pour traitement.
                  </Typography>
                </Box>
              </CardContent>
            </Card>

            {/* Conseils */}
            <Card elevation={0} sx={{ border: '1px solid #e8ecf0', borderRadius: 3, overflow: 'hidden' }}>
              <Box sx={{ background: 'linear-gradient(135deg,#0f172a,#1e3a5f,#1e40af)',
                px: 2.5, py: 1.5, display: 'flex', alignItems: 'center', gap: 1.5, borderRadius: '12px 12px 0 0' }}>
                <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.12)', width: 28, height: 28, borderRadius: 1.5 }}>
                  <TipIcon sx={{ fontSize: 14, color: 'white' }} />
                </Avatar>
                <Typography sx={{ color: 'white', fontWeight: 700, fontSize: '0.88rem' }}>Conseils</Typography>
              </Box>
              <CardContent sx={{ p: 2.5 }}>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                  {TIPS.map((tip, i) => (
                    <Box key={i} sx={{ display: 'flex', gap: 1, alignItems: 'flex-start' }}>
                      <Box sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: '#0288d1',
                        mt: 0.7, flexShrink: 0 }} />
                      <Typography sx={{ fontSize: '0.8rem', color: '#475569', lineHeight: 1.6 }}>
                        {tip}
                      </Typography>
                    </Box>
                  ))}
                </Box>
              </CardContent>
            </Card>

            {/* Boutons */}
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
              <Button fullWidth variant="contained" startIcon={<SendIcon />}
                onClick={handleSubmit} disabled={loading}
                sx={{ py: 1.25, borderRadius: 2, textTransform: 'none', fontWeight: 700, fontSize: '0.9rem',
                  background: 'linear-gradient(135deg,#01579b,#0288d1)',
                  '&:hover': { background: 'linear-gradient(135deg,#003c78,#0277bd)' },
                  '&:disabled': { opacity: 0.5 } }}>
                {loading ? 'Envoi en cours…' : 'Soumettre la suggestion'}
              </Button>
              <Button fullWidth onClick={() => navigate('/culture/suggestions')} disabled={loading}
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

export default CreateSuggestion;
