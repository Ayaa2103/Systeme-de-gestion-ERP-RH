import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box, Card, CardContent, Typography, TextField, Button,
  Grid, Alert, Avatar, Divider,
} from '@mui/material';
import {
  ArrowBack as BackIcon,
  ReceiptLong as PayslipIcon,
  CheckCircle as CheckIcon,
  Send as SendIcon,
  CalendarMonth as MonthIcon,
  Print as PrintIcon,
} from '@mui/icons-material';
import { createPayslipRequest, downloadPayslipRequestTemplate } from '../../services/employeeService';
import { downloadBlobResponse } from '../../utils/downloadFile';

const fieldSx = {
  '& .MuiOutlinedInput-root': {
    borderRadius: 2, fontSize: '0.875rem',
    '&:hover fieldset': { borderColor: '#2e7d32' },
    '&.Mui-focused fieldset': { borderColor: '#2e7d32' },
  },
};

const NavHeader = ({ title, icon }) => (
  <Box sx={{ background: 'linear-gradient(135deg,#0f172a,#1e3a5f,#1e40af)',
    px: 2.5, py: 1.5, display: 'flex', alignItems: 'center', gap: 1.5, borderRadius: '12px 12px 0 0' }}>
    <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.12)', width: 28, height: 28, borderRadius: 1.5 }}>
      {React.cloneElement(icon, { sx: { fontSize: 14, color: 'white' } })}
    </Avatar>
    <Typography sx={{ color: 'white', fontWeight: 700, fontSize: '0.88rem' }}>{title}</Typography>
  </Box>
);

const generateMonthOptions = () => {
  const options = [];
  const now = new Date();
  for (let i = 0; i < 12; i++) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const value = `${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`;
    const label = d.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' });
    options.push({ value, label: label.charAt(0).toUpperCase() + label.slice(1) });
  }
  return options;
};

const MONTHS = generateMonthOptions();

const CreatePayslipRequest = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [error,   setError]   = useState('');
  const [success, setSuccess] = useState('');
  const [form,    setForm]    = useState({ periode_mois: '', comment: '' });

  const set = (f, v) => setForm(p => ({ ...p, [f]: v }));
  const filled = form.periode_mois ? 1 : 0;
  const selectedMonth = MONTHS.find(m => m.value === form.periode_mois);

  const handleSubmit = async () => {
    if (!form.periode_mois) { setError('La période est obligatoire.'); return; }
    setLoading(true); setError('');
    try {
      await createPayslipRequest(form);
      setSuccess('Demande de bulletin de paie soumise avec succès !');
      setTimeout(() => navigate('/employee/requests'), 1800);
    } catch (e) {
      setError(e.response?.data?.error || 'Erreur lors de la soumission');
    } finally { setLoading(false); }
  };

  const handleDownloadTemplate = async () => {
    if (!form.periode_mois) { setError('Sélectionnez une période avant de télécharger le formulaire.'); return; }
    setDownloading(true); setError('');
    try {
      const response = await downloadPayslipRequestTemplate(form);
      downloadBlobResponse(response, 'Demande_Bulletin.docx');
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
              <PayslipIcon sx={{ fontSize: 22, color: 'white' }} />
            </Box>
            <Box>
              <Typography variant="h5" fontWeight={700} color="white">Bulletin de paie</Typography>
              <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.65)', mt: 0.3 }}>
                Demandez une copie de votre bulletin de salaire
              </Typography>
            </Box>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Box sx={{ width: 24, height: 4, borderRadius: 2,
              bgcolor: filled ? '#60a5fa' : 'rgba(255,255,255,0.2)' }} />
            <Typography sx={{ color: 'rgba(255,255,255,0.65)', fontSize: '0.78rem' }}>{filled}/1</Typography>
          </Box>
        </Box>
      </Card>

      <Grid container spacing={3}>
        <Grid item xs={12} lg={8}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            {error   && <Alert severity="error"   sx={{ borderRadius: 2 }} onClose={() => setError('')}>{error}</Alert>}
            {success && <Alert severity="success" sx={{ borderRadius: 2 }}>{success}</Alert>}

            {/* Sélection du mois */}
            <Card elevation={0} sx={{ border: '1px solid #e8ecf0', borderRadius: 3, overflow: 'hidden' }}>
              <NavHeader title="Période souhaitée *" icon={<MonthIcon />} />
              <CardContent sx={{ p: 3 }}>
                <Typography sx={{ fontSize: '0.78rem', fontWeight: 700, color: '#475569',
                  textTransform: 'uppercase', letterSpacing: '0.5px', mb: 1.5 }}>
                  Sélectionnez le mois <span style={{ color: '#ef4444' }}>*</span>
                </Typography>
                <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: 1 }}>
                  {MONTHS.map(m => (
                    <Box key={m.value} onClick={() => set('periode_mois', m.value)}
                      sx={{ p: 1.25, borderRadius: 2, cursor: 'pointer', textAlign: 'center',
                        border: `2px solid ${form.periode_mois === m.value ? '#2e7d32' : '#e8ecf0'}`,
                        bgcolor: form.periode_mois === m.value ? '#e8f5e9' : 'white', transition: 'all 0.15s',
                        '&:hover': { borderColor: '#2e7d32', bgcolor: '#f0fdf4' } }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0.75 }}>
                        {form.periode_mois === m.value && (
                          <CheckIcon sx={{ fontSize: 14, color: '#2e7d32' }} />
                        )}
                        <Typography sx={{ fontSize: '0.82rem', fontWeight: form.periode_mois === m.value ? 700 : 500,
                          color: form.periode_mois === m.value ? '#2e7d32' : '#334155' }}>
                          {m.label}
                        </Typography>
                      </Box>
                    </Box>
                  ))}
                </Box>
              </CardContent>
            </Card>

            {/* Commentaire */}
            <Card elevation={0} sx={{ border: '1px solid #e8ecf0', borderRadius: 3, overflow: 'hidden' }}>
              <NavHeader title="Commentaire" icon={<PayslipIcon />} />
              <CardContent sx={{ p: 3 }}>
                <TextField fullWidth multiline rows={3} size="small" value={form.comment}
                  onChange={e => set('comment', e.target.value)}
                  placeholder="Précisez la raison de votre demande si nécessaire…" sx={fieldSx} />
                <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
                  Optionnel
                </Typography>
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

                {/* Aperçu du bulletin */}
                <Box sx={{ p: 2, borderRadius: 2, bgcolor: selectedMonth ? '#e8f5e9' : '#f8fafc',
                  border: `1px solid ${selectedMonth ? '#a5d6a7' : '#e8ecf0'}`, mb: 2,
                  display: 'flex', alignItems: 'center', gap: 1.5 }}>
                  <Avatar sx={{ bgcolor: selectedMonth ? '#2e7d3215' : '#f1f5f9', width: 38, height: 38, borderRadius: 2 }}>
                    <PayslipIcon sx={{ color: selectedMonth ? '#2e7d32' : '#94a3b8', fontSize: 18 }} />
                  </Avatar>
                  <Box>
                    <Typography sx={{ fontSize: '0.72rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.4px' }}>
                      Période
                    </Typography>
                    <Typography sx={{ fontSize: '0.9rem', fontWeight: 700,
                      color: selectedMonth ? '#2e7d32' : '#cbd5e1' }}>
                      {selectedMonth?.label || 'Non sélectionné'}
                    </Typography>
                  </Box>
                  {selectedMonth && <CheckIcon sx={{ color: '#2e7d32', ml: 'auto' }} />}
                </Box>

                <Divider sx={{ mb: 2 }} />
                <Box sx={{ p: 1.25, bgcolor: '#f0fdf4', borderRadius: 2, border: '1px solid #a7f3d030', mb: 2 }}>
                  <Typography sx={{ fontSize: '0.75rem', color: '#2e7d32', fontWeight: 500 }}>
                    Le bulletin sera mis à disposition une fois la demande approuvée par le RH.
                  </Typography>
                </Box>
                <Box sx={{ p: 1.25, bgcolor: '#fff8e1', borderRadius: 2, border: '1px solid #ffe0b2' }}>
                  <Typography sx={{ fontSize: '0.75rem', color: '#e65100' }}>
                    Votre demande sera traitée par le Responsable RH.
                  </Typography>
                </Box>
              </CardContent>
            </Card>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
              <Button fullWidth variant="contained" startIcon={<SendIcon />}
                onClick={handleSubmit} disabled={loading || !form.periode_mois}
                sx={{ py: 1.25, borderRadius: 2, textTransform: 'none', fontWeight: 700,
                  background: 'linear-gradient(135deg,#1b5e20,#2e7d32)',
                  '&:hover': { background: 'linear-gradient(135deg,#0f172a,#1b5e20)' },
                  '&:disabled': { opacity: 0.5 } }}>
                {loading ? 'Envoi…' : 'Soumettre la demande'}
              </Button>
              <Button fullWidth onClick={() => navigate('/employee/requests')} disabled={loading}
                sx={{ py: 1, borderRadius: 2, textTransform: 'none', color: '#94a3b8',
                  border: '1px solid #e2e8f0', '&:hover': { bgcolor: '#f8fafc' } }}>
                Annuler
              </Button>
            </Box>

            <Box sx={{ borderRadius: 3, border: '1.5px dashed #81c78490', bgcolor: '#e8f5e9', p: 2.5 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1.25 }}>
                <Avatar sx={{ bgcolor: '#c8e6c9', width: 38, height: 38, borderRadius: 2 }}>
                  <PrintIcon sx={{ color: '#2e7d32', fontSize: 19 }} />
                </Avatar>
                <Box>
                  <Typography sx={{ fontSize: '0.84rem', fontWeight: 700, color: '#1e293b' }}>
                    Besoin d'une version papier ?
                  </Typography>
                  <Typography sx={{ fontSize: '0.7rem', color: '#1b5e20', fontWeight: 600 }}>
                    À signer et remettre en main propre
                  </Typography>
                </Box>
              </Box>
              <Typography sx={{ fontSize: '0.76rem', color: '#1b4d1f', mb: 1.75, lineHeight: 1.5 }}>
                Téléchargez le formulaire Word pré-rempli avec vos informations, imprimez-le, signez-le et remettez-le au service RH.
              </Typography>
              <Button fullWidth variant="contained" startIcon={<PrintIcon />}
                onClick={handleDownloadTemplate} disabled={downloading}
                sx={{ py: 1, borderRadius: 2, textTransform: 'none', fontWeight: 700, boxShadow: 'none',
                  bgcolor: '#2e7d32', '&:hover': { bgcolor: '#1b5e20', boxShadow: 'none' } }}>
                {downloading ? 'Génération…' : 'Télécharger le formulaire'}
              </Button>
            </Box>
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
};

export default CreatePayslipRequest;
