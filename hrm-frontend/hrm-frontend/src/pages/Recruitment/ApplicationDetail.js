import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box, Card, CardContent, Typography, Button, Grid, Chip, Avatar,
  Divider, IconButton, Dialog, DialogContent, DialogActions,
  TextField, CircularProgress, Tooltip, Snackbar, Alert, LinearProgress,
} from '@mui/material';
import {
  ArrowBack as BackIcon,
  Person as PersonIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  Work as WorkIcon,
  Schedule as ScheduleIcon,
  GetApp as DownloadIcon,
  RateReview as FeedbackIcon,
  CheckCircle as AcceptIcon,
  Cancel as RejectIcon,
  CalendarToday as CalendarIcon,
  LocationOn as LocationIcon,
  Close as CloseIcon,
  Star as StarIcon,
  Description as NoteIcon,
  HowToReg as ReviewIcon,
} from '@mui/icons-material';
import {
  getApplicationDetail, updateApplicationStatus,
  createInterview, submitInterviewFeedback,
} from '../../services/hrService';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

const STATUS = {
  pending:   { label: 'En attente', color: '#f57c00', bg: '#fff8e1' },
  reviewed:  { label: 'Examiné',    color: '#0288d1', bg: '#e1f5fe' },
  interview: { label: 'Entretien',  color: '#7b1fa2', bg: '#f3e5f5' },
  accepted:  { label: 'Accepté',    color: '#2e7d32', bg: '#e8f5e9' },
  rejected:  { label: 'Rejeté',     color: '#c62828', bg: '#ffebee' },
};

const COLORS = ['#1976d2','#388e3c','#d32f2f','#7b1fa2','#f57c00','#0097a7','#c2185b','#5d4037'];
const avatarColor = (name = '') => COLORS[(name.charCodeAt(0) || 0) % COLORS.length];

const NavHeader = ({ title, icon, count }) => (
  <Box sx={{ background: 'linear-gradient(135deg,#0f172a,#1e3a5f,#1e40af)',
    px: 2.5, py: 1.5, display: 'flex', alignItems: 'center', gap: 1.5 }}>
    <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.12)', width: 28, height: 28, borderRadius: 1.5 }}>
      {React.cloneElement(icon, { sx: { fontSize: 14, color: 'white' } })}
    </Avatar>
    <Typography sx={{ color: 'white', fontWeight: 700, fontSize: '0.88rem', flex: 1 }}>{title}</Typography>
    {count !== undefined && (
      <Chip label={count} size="small"
        sx={{ bgcolor: 'rgba(255,255,255,0.15)', color: 'white', height: 20, fontSize: '0.7rem' }} />
    )}
  </Box>
);

const InfoRow = ({ icon, label, value }) => (
  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, py: 1.25,
    borderBottom: '1px solid #f1f5f9', '&:last-child': { borderBottom: 'none' } }}>
    <Avatar sx={{ bgcolor: '#1976d212', width: 28, height: 28 }}>
      {React.cloneElement(icon, { sx: { color: '#1976d2', fontSize: 14 } })}
    </Avatar>
    <Box sx={{ flex: 1, minWidth: 0 }}>
      <Typography sx={{ fontSize: '0.68rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.4px' }}>
        {label}
      </Typography>
      <Typography sx={{ fontSize: '0.82rem', fontWeight: 600, color: '#1e293b' }} noWrap>{value || '—'}</Typography>
    </Box>
  </Box>
);

const ApplicationDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [application, setApplication]   = useState(null);
  const [loading, setLoading]           = useState(true);
  const [saving, setSaving]             = useState(false);

  const [statusDialog,    setStatusDialog]    = useState(false);
  const [interviewDialog, setInterviewDialog] = useState(false);
  const [feedbackDialog,  setFeedbackDialog]  = useState(false);
  const [selectedInterview, setSelectedInterview] = useState(null);

  const [newStatus,      setNewStatus]      = useState('');
  const [notes,          setNotes]          = useState('');
  const [interviewData,  setInterviewData]  = useState({ scheduled_date: '', location: '' });
  const [feedbackData,   setFeedbackData]   = useState({ feedback: '', score: '' });
  const [snack,          setSnack]          = useState({ open: false, msg: '', severity: 'success' });

  useEffect(() => { load(); }, [id]);

  const load = async () => {
    setLoading(true);
    try {
      const res = await getApplicationDetail(id);
      setApplication(res.data);
    } catch (_) {}
    finally { setLoading(false); }
  };

  const handleUpdateStatus = async () => {
    setSaving(true);
    try {
      await updateApplicationStatus(id, { status: newStatus, notes });
      load(); setStatusDialog(false); setNotes('');
      setSnack({ open: true, msg: `Statut mis à jour : ${STATUS[newStatus]?.label}`, severity: 'success' });
    } catch (_) {
      setSnack({ open: true, msg: 'Erreur lors de la mise à jour', severity: 'error' });
    } finally { setSaving(false); }
  };

  const handleQuickStatus = async (status) => {
    try {
      await updateApplicationStatus(id, { status });
      load();
      setSnack({ open: true, msg: `Statut mis à jour : ${STATUS[status]?.label}`, severity: 'success' });
    } catch (_) {
      setSnack({ open: true, msg: 'Erreur lors de la mise à jour', severity: 'error' });
    }
  };

  const handleCreateInterview = async () => {
    setSaving(true);
    try {
      await createInterview(id, interviewData);
      load(); setInterviewDialog(false); setInterviewData({ scheduled_date: '', location: '' });
      setSnack({ open: true, msg: 'Entretien programmé avec succès', severity: 'success' });
    } catch (_) {
      setSnack({ open: true, msg: 'Erreur lors de la programmation', severity: 'error' });
    } finally { setSaving(false); }
  };

  const handleSubmitFeedback = async () => {
    setSaving(true);
    try {
      await submitInterviewFeedback(selectedInterview.id, feedbackData);
      load(); setFeedbackDialog(false); setFeedbackData({ feedback: '', score: '' });
      setSnack({ open: true, msg: 'Feedback enregistré', severity: 'success' });
    } catch (_) {
      setSnack({ open: true, msg: 'Erreur lors de l\'enregistrement', severity: 'error' });
    } finally { setSaving(false); }
  };

  if (loading) return (
    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 300 }}>
      <CircularProgress sx={{ color: '#1976d2' }} />
    </Box>
  );

  if (!application) return (
    <Box sx={{ textAlign: 'center', py: 8 }}>
      <PersonIcon sx={{ fontSize: 56, color: '#cbd5e1', mb: 1.5 }} />
      <Typography variant="h6" color="text.secondary">Candidature introuvable</Typography>
      <Button startIcon={<BackIcon />} onClick={() => navigate('/recruitment/applications')}
        sx={{ mt: 2, textTransform: 'none' }}>Retour aux candidatures</Button>
    </Box>
  );

  const sc   = STATUS[application.status] || STATUS.pending;
  const name = `${application.first_name || ''} ${application.last_name || ''}`.trim();
  const interviews = application.interviews || [];

  return (
    <Box sx={{ width: '100%' }}>

      {/* ── Banner ── */}
      <Card elevation={0} sx={{ borderRadius: 3, border: '1px solid #e8ecf0', mb: 3, overflow: 'hidden' }}>
        <Box sx={{ background: 'linear-gradient(135deg,#0f172a 0%,#1e3a5f 60%,#1e40af 100%)',
          px: 3, py: 3, position: 'relative', overflow: 'hidden' }}>
          <Box sx={{ position: 'absolute', top: -40, right: -40, width: 180, height: 180,
            borderRadius: '50%', bgcolor: 'rgba(255,255,255,0.03)', pointerEvents: 'none' }} />

          <Button startIcon={<BackIcon />} onClick={() => navigate('/recruitment/applications')}
            size="small" sx={{ color: 'rgba(255,255,255,0.6)', textTransform: 'none', borderRadius: 2, mb: 2,
              '&:hover': { bgcolor: 'rgba(255,255,255,0.08)', color: 'white' } }}>
            Retour aux candidatures
          </Button>

          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start',
            flexWrap: 'wrap', gap: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Avatar sx={{ width: 56, height: 56, bgcolor: avatarColor(name),
                fontSize: '1.2rem', fontWeight: 700, border: '2px solid rgba(255,255,255,0.25)', flexShrink: 0 }}>
                {name[0]?.toUpperCase() || '?'}
              </Avatar>
              <Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 0.4 }}>
                  <Typography variant="h5" fontWeight={700} color="white">{name}</Typography>
                  <Chip label={sc.label} size="small"
                    sx={{ bgcolor: `${sc.color}28`, color: 'white', fontWeight: 700, fontSize: '0.72rem',
                      border: `1px solid ${sc.color}50`, height: 22 }} />
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                  <WorkIcon sx={{ fontSize: 13, color: 'rgba(255,255,255,0.5)' }} />
                  <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.75)' }}>
                    {application.job_offer_title || 'Poste non défini'}
                  </Typography>
                  {application.applied_at && (
                    <>
                      <Typography sx={{ color: 'rgba(255,255,255,0.3)' }}>·</Typography>
                      <CalendarIcon sx={{ fontSize: 12, color: 'rgba(255,255,255,0.5)' }} />
                      <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.6)' }}>
                        {format(new Date(application.applied_at), 'dd MMM yyyy', { locale: fr })}
                      </Typography>
                    </>
                  )}
                </Box>
              </Box>
            </Box>

            <Button onClick={() => setStatusDialog(true)} size="small"
              sx={{ color: 'rgba(255,255,255,0.8)', border: '1px solid rgba(255,255,255,0.25)',
                borderRadius: 2, textTransform: 'none', fontWeight: 600,
                '&:hover': { bgcolor: 'rgba(255,255,255,0.1)' } }}>
              Changer le statut
            </Button>
          </Box>
        </Box>
      </Card>

      <Grid container spacing={3}>

        {/* ── Left ── */}
        <Grid item xs={12} md={8}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>

            {/* Informations personnelles */}
            <Card elevation={0} sx={{ border: '1px solid #e8ecf0', borderRadius: 3, overflow: 'hidden' }}>
              <NavHeader title="Informations personnelles" icon={<PersonIcon />} />
              <CardContent sx={{ p: 2.5 }}>
                <InfoRow icon={<EmailIcon />}    label="Email"              value={application.email} />
                <InfoRow icon={<PhoneIcon />}    label="Téléphone"          value={application.phone} />
                <InfoRow icon={<WorkIcon />}     label="Offre postulée"     value={application.job_offer_title} />
                <InfoRow icon={<CalendarIcon />} label="Date de candidature"
                  value={application.applied_at
                    ? format(new Date(application.applied_at), "dd MMMM yyyy 'à' HH'h'mm", { locale: fr })
                    : null} />
              </CardContent>
            </Card>

            {/* Lettre de motivation */}
            {application.cover_letter && (
              <Card elevation={0} sx={{ border: '1px solid #e8ecf0', borderRadius: 3, overflow: 'hidden' }}>
                <NavHeader title="Lettre de motivation" icon={<NoteIcon />} />
                <CardContent sx={{ p: 2.5 }}>
                  <Typography variant="body2" sx={{ whiteSpace: 'pre-line', lineHeight: 1.9,
                    color: '#475569', fontSize: '0.875rem' }}>
                    {application.cover_letter}
                  </Typography>
                </CardContent>
              </Card>
            )}

            {/* CV */}
            {application.cv && (
              <Card elevation={0} sx={{ border: '1px solid #e8ecf0', borderRadius: 3, overflow: 'hidden' }}>
                <NavHeader title="Curriculum Vitae" icon={<DownloadIcon />} />
                <CardContent sx={{ p: 2.5 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, p: 2,
                    bgcolor: '#f8fafc', borderRadius: 2, border: '1px solid #e8ecf0' }}>
                    <Avatar sx={{ bgcolor: '#1976d212', width: 42, height: 42, borderRadius: 2 }}>
                      <NoteIcon sx={{ color: '#1976d2', fontSize: 20 }} />
                    </Avatar>
                    <Box sx={{ flex: 1 }}>
                      <Typography sx={{ fontSize: '0.875rem', fontWeight: 600, color: '#1e293b' }}>
                        CV de {name}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">Document joint</Typography>
                    </Box>
                    <Button variant="contained" startIcon={<DownloadIcon sx={{ fontSize: 15 }} />}
                      href={application.cv.startsWith('http') ? application.cv : `${process.env.REACT_APP_API_URL || 'http://localhost:8000'}${application.cv}`}
                      target="_blank" rel="noopener noreferrer" download
                      sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 600, fontSize: '0.82rem',
                        bgcolor: '#1976d2', '&:hover': { bgcolor: '#1565c0' } }}>
                      Télécharger
                    </Button>
                  </Box>
                </CardContent>
              </Card>
            )}

            {/* Notes RH */}
            {application.notes && (
              <Card elevation={0} sx={{ border: '1px solid #e8ecf0', borderRadius: 3, overflow: 'hidden' }}>
                <NavHeader title="Notes RH" icon={<FeedbackIcon />} />
                <CardContent sx={{ p: 2.5 }}>
                  <Typography variant="body2" sx={{ whiteSpace: 'pre-line', lineHeight: 1.8,
                    color: '#475569', fontSize: '0.875rem' }}>
                    {application.notes}
                  </Typography>
                  {application.reviewed_by_name && (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1.5, pt: 1.5,
                      borderTop: '1px solid #f1f5f9' }}>
                      <Avatar sx={{ width: 22, height: 22, bgcolor: '#1976d212', fontSize: '0.6rem', fontWeight: 700, color: '#1976d2' }}>
                        {application.reviewed_by_name[0]}
                      </Avatar>
                      <Typography variant="caption" color="text.secondary">
                        {application.reviewed_by_name}
                        {application.reviewed_at && ` · ${format(new Date(application.reviewed_at), 'dd MMM yyyy', { locale: fr })}`}
                      </Typography>
                    </Box>
                  )}
                </CardContent>
              </Card>
            )}
          </Box>
        </Grid>

        {/* ── Right ── */}
        <Grid item xs={12} md={4}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, position: 'sticky', top: 24 }}>

            {/* Actions rapides */}
            <Card elevation={0} sx={{ border: '1px solid #e8ecf0', borderRadius: 3, overflow: 'hidden' }}>
              <NavHeader title="Actions rapides" icon={<ReviewIcon />} />
              <CardContent sx={{ p: 2 }}>

                {/* Statut actuel */}
                <Box sx={{ p: 1.5, borderRadius: 2, bgcolor: sc.bg, border: `1px solid ${sc.color}20`,
                  display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
                  <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: sc.color, flexShrink: 0 }} />
                  <Box>
                    <Typography sx={{ fontSize: '0.68rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.4px' }}>
                      Statut actuel
                    </Typography>
                    <Typography sx={{ fontSize: '0.875rem', fontWeight: 700, color: sc.color }}>
                      {sc.label}
                    </Typography>
                  </Box>
                </Box>

                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                  {application.status !== 'accepted' && application.status !== 'rejected' && (
                    <Button fullWidth variant="contained" startIcon={<AcceptIcon sx={{ fontSize: 16 }} />}
                      onClick={() => handleQuickStatus('accepted')}
                      sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 600,
                        bgcolor: '#2e7d32', '&:hover': { bgcolor: '#1b5e20' } }}>
                      Accepter la candidature
                    </Button>
                  )}

                  {application.status !== 'rejected' && application.status !== 'accepted' && (
                    <Button fullWidth variant="outlined" startIcon={<ScheduleIcon sx={{ fontSize: 16 }} />}
                      onClick={() => setInterviewDialog(true)}
                      sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 600,
                        borderColor: '#7b1fa2', color: '#7b1fa2',
                        '&:hover': { bgcolor: '#f3e5f5', borderColor: '#7b1fa2' } }}>
                      Programmer un entretien
                    </Button>
                  )}

                  {application.status !== 'rejected' && (
                    <Button fullWidth variant="outlined" startIcon={<RejectIcon sx={{ fontSize: 16 }} />}
                      onClick={() => handleQuickStatus('rejected')}
                      sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 600,
                        borderColor: '#e2e8f0', color: '#c62828',
                        '&:hover': { bgcolor: '#ffebee', borderColor: '#ffcdd2' } }}>
                      Rejeter
                    </Button>
                  )}

                  <Button fullWidth onClick={() => setStatusDialog(true)}
                    sx={{ borderRadius: 2, textTransform: 'none', color: '#64748b',
                      '&:hover': { bgcolor: '#f8fafc' } }}>
                    Changer le statut avec note
                  </Button>
                </Box>
              </CardContent>
            </Card>

            {/* Entretiens */}
            <Card elevation={0} sx={{ border: '1px solid #e8ecf0', borderRadius: 3, overflow: 'hidden' }}>
              <NavHeader title="Entretiens" icon={<ScheduleIcon />} count={interviews.length} />
              <CardContent sx={{ p: interviews.length === 0 ? 2.5 : 0 }}>
                {interviews.length === 0 ? (
                  <Box sx={{ textAlign: 'center', py: 3 }}>
                    <ScheduleIcon sx={{ fontSize: 36, color: '#cbd5e1', mb: 0.75 }} />
                    <Typography variant="caption" color="text.secondary" display="block">
                      Aucun entretien programmé
                    </Typography>
                  </Box>
                ) : (
                  interviews.map((iv, i) => {
                    const done = iv.status === 'completed';
                    return (
                      <React.Fragment key={iv.id}>
                        <Box sx={{ px: 2, py: 1.75 }}>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 0.75 }}>
                            <Box>
                              <Typography sx={{ fontSize: '0.82rem', fontWeight: 700, color: '#1e293b' }}>
                                {iv.scheduled_date
                                  ? format(new Date(iv.scheduled_date), "dd MMM yyyy 'à' HH'h'mm", { locale: fr })
                                  : '—'}
                              </Typography>
                              {iv.location && (
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 0.3 }}>
                                  <LocationIcon sx={{ fontSize: 12, color: '#94a3b8' }} />
                                  <Typography variant="caption" color="text.secondary">{iv.location}</Typography>
                                </Box>
                              )}
                            </Box>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <Chip label={done ? 'Terminé' : 'Programmé'} size="small"
                                sx={{ bgcolor: done ? '#e8f5e9' : '#e3f2fd',
                                  color: done ? '#2e7d32' : '#1976d2',
                                  fontWeight: 700, fontSize: '0.68rem', height: 20 }} />
                              {!done && (
                                <Tooltip title="Ajouter un feedback">
                                  <IconButton size="small"
                                    onClick={() => { setSelectedInterview(iv); setFeedbackDialog(true); }}
                                    sx={{ color: '#7b1fa2', bgcolor: '#f3e5f5', borderRadius: 1.5,
                                      width: 26, height: 26, '&:hover': { bgcolor: '#e1bee7' } }}>
                                    <FeedbackIcon sx={{ fontSize: 13 }} />
                                  </IconButton>
                                </Tooltip>
                              )}
                            </Box>
                          </Box>
                          {done && iv.score && (
                            <Box>
                              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                  <StarIcon sx={{ fontSize: 13, color: '#ffc107' }} />
                                  <Typography sx={{ fontSize: '0.75rem', color: '#64748b' }}>Score</Typography>
                                </Box>
                                <Typography sx={{ fontSize: '0.78rem', fontWeight: 700, color: '#1e293b' }}>
                                  {iv.score}/10
                                </Typography>
                              </Box>
                              <LinearProgress variant="determinate" value={iv.score * 10}
                                sx={{ height: 4, borderRadius: 2, bgcolor: '#f1f5f9',
                                  '& .MuiLinearProgress-bar': {
                                    bgcolor: iv.score >= 7 ? '#2e7d32' : iv.score >= 4 ? '#f57c00' : '#c62828',
                                    borderRadius: 2 } }} />
                              {iv.feedback && (
                                <Typography sx={{ fontSize: '0.75rem', color: '#64748b', mt: 0.75, fontStyle: 'italic' }}>
                                  "{iv.feedback.substring(0, 80)}{iv.feedback.length > 80 ? '…' : ''}"
                                </Typography>
                              )}
                            </Box>
                          )}
                        </Box>
                        {i < interviews.length - 1 && <Divider />}
                      </React.Fragment>
                    );
                  })
                )}
              </CardContent>
            </Card>

          </Box>
        </Grid>
      </Grid>

      {/* ── Dialog statut ── */}
      <Dialog open={statusDialog} onClose={() => setStatusDialog(false)} maxWidth="sm" fullWidth
        PaperProps={{ sx: { borderRadius: 3, overflow: 'hidden' } }}>
        <Box sx={{ background: 'linear-gradient(135deg,#0f172a,#1e3a5f,#1e40af)', px: 3, py: 2,
          display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.12)', width: 30, height: 30, borderRadius: 1.5 }}>
              <ReviewIcon sx={{ fontSize: 15, color: 'white' }} />
            </Avatar>
            <Typography sx={{ color: 'white', fontWeight: 700 }}>Changer le statut</Typography>
          </Box>
          <IconButton size="small" onClick={() => setStatusDialog(false)}
            sx={{ color: 'rgba(255,255,255,0.6)', '&:hover': { color: 'white' } }}>
            <CloseIcon fontSize="small" />
          </IconButton>
        </Box>
        <DialogContent sx={{ p: 3 }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, mb: 2 }}>
            {Object.entries(STATUS).map(([key, cfg]) => (
              <Box key={key} onClick={() => setNewStatus(key)}
                sx={{ p: 1.25, borderRadius: 2, cursor: 'pointer',
                  border: `2px solid ${newStatus === key ? cfg.color : '#e8ecf0'}`,
                  bgcolor: newStatus === key ? cfg.bg : 'white',
                  transition: 'all 0.15s', display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: cfg.color, flexShrink: 0 }} />
                <Typography sx={{ fontSize: '0.875rem', fontWeight: newStatus === key ? 700 : 500,
                  color: newStatus === key ? cfg.color : '#1e293b' }}>
                  {cfg.label}
                </Typography>
              </Box>
            ))}
          </Box>
          <TextField fullWidth multiline rows={2} label="Notes (optionnel)" value={notes}
            onChange={e => setNotes(e.target.value)} size="small"
            sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }} />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2.5, gap: 1 }}>
          <Button onClick={() => setStatusDialog(false)}
            sx={{ borderRadius: 2, textTransform: 'none', color: '#64748b' }}>Annuler</Button>
          <Button onClick={handleUpdateStatus} variant="contained" disabled={!newStatus || saving}
            sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 600,
              background: 'linear-gradient(135deg,#1e3a5f,#1e40af)' }}>
            Confirmer
          </Button>
        </DialogActions>
      </Dialog>

      {/* ── Dialog entretien ── */}
      <Dialog open={interviewDialog} onClose={() => setInterviewDialog(false)} maxWidth="sm" fullWidth
        PaperProps={{ sx: { borderRadius: 3, overflow: 'hidden' } }}>
        <Box sx={{ background: 'linear-gradient(135deg,#0f172a,#1e3a5f,#1e40af)', px: 3, py: 2,
          display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.12)', width: 30, height: 30, borderRadius: 1.5 }}>
              <ScheduleIcon sx={{ fontSize: 15, color: 'white' }} />
            </Avatar>
            <Typography sx={{ color: 'white', fontWeight: 700 }}>Programmer un entretien</Typography>
          </Box>
          <IconButton size="small" onClick={() => setInterviewDialog(false)}
            sx={{ color: 'rgba(255,255,255,0.6)', '&:hover': { color: 'white' } }}>
            <CloseIcon fontSize="small" />
          </IconButton>
        </Box>
        <DialogContent sx={{ p: 3 }}>
          <Box sx={{ p: 1.5, bgcolor: '#f8fafc', borderRadius: 2, border: '1px solid #e8ecf0', mb: 2.5,
            display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Avatar sx={{ bgcolor: avatarColor(name), width: 32, height: 32, fontSize: '0.75rem', fontWeight: 700 }}>
              {name[0]?.toUpperCase() || '?'}
            </Avatar>
            <Box>
              <Typography sx={{ fontSize: '0.875rem', fontWeight: 600 }}>{name}</Typography>
              <Typography variant="caption" color="text.secondary">{application.job_offer_title}</Typography>
            </Box>
          </Box>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Box>
              <Typography sx={{ fontSize: '0.78rem', fontWeight: 700, color: '#475569',
                textTransform: 'uppercase', letterSpacing: '0.5px', mb: 0.75 }}>
                Date et heure <span style={{ color: '#ef4444' }}>*</span>
              </Typography>
              <TextField fullWidth type="datetime-local" size="small"
                value={interviewData.scheduled_date}
                onChange={e => setInterviewData(p => ({ ...p, scheduled_date: e.target.value }))}
                InputLabelProps={{ shrink: true }}
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }} />
            </Box>
            <Box>
              <Typography sx={{ fontSize: '0.78rem', fontWeight: 700, color: '#475569',
                textTransform: 'uppercase', letterSpacing: '0.5px', mb: 0.75 }}>
                Lieu
              </Typography>
              <TextField fullWidth size="small" placeholder="Ex: Bureau 201, Google Meet…"
                value={interviewData.location}
                onChange={e => setInterviewData(p => ({ ...p, location: e.target.value }))}
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }} />
            </Box>
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2.5, gap: 1 }}>
          <Button onClick={() => setInterviewDialog(false)}
            sx={{ borderRadius: 2, textTransform: 'none', color: '#64748b' }}>Annuler</Button>
          <Button onClick={handleCreateInterview} variant="contained" disabled={saving}
            sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 600,
              background: 'linear-gradient(135deg,#1e3a5f,#1e40af)' }}>
            Programmer
          </Button>
        </DialogActions>
      </Dialog>

      {/* ── Dialog feedback ── */}
      <Dialog open={feedbackDialog} onClose={() => setFeedbackDialog(false)} maxWidth="sm" fullWidth
        PaperProps={{ sx: { borderRadius: 3, overflow: 'hidden' } }}>
        <Box sx={{ background: 'linear-gradient(135deg,#0f172a,#1e3a5f,#1e40af)', px: 3, py: 2,
          display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.12)', width: 30, height: 30, borderRadius: 1.5 }}>
              <FeedbackIcon sx={{ fontSize: 15, color: 'white' }} />
            </Avatar>
            <Typography sx={{ color: 'white', fontWeight: 700 }}>Feedback d'entretien</Typography>
          </Box>
          <IconButton size="small" onClick={() => setFeedbackDialog(false)}
            sx={{ color: 'rgba(255,255,255,0.6)', '&:hover': { color: 'white' } }}>
            <CloseIcon fontSize="small" />
          </IconButton>
        </Box>
        <DialogContent sx={{ p: 3 }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Box>
              <Typography sx={{ fontSize: '0.78rem', fontWeight: 700, color: '#475569',
                textTransform: 'uppercase', letterSpacing: '0.5px', mb: 0.75 }}>
                Commentaires
              </Typography>
              <TextField fullWidth multiline rows={4} size="small"
                placeholder="Vos impressions sur l'entretien, points forts, axes d'amélioration…"
                value={feedbackData.feedback}
                onChange={e => setFeedbackData(p => ({ ...p, feedback: e.target.value }))}
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }} />
            </Box>
            <Box>
              <Typography sx={{ fontSize: '0.78rem', fontWeight: 700, color: '#475569',
                textTransform: 'uppercase', letterSpacing: '0.5px', mb: 0.75 }}>
                Score (sur 10)
              </Typography>
              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                {[1,2,3,4,5,6,7,8,9,10].map(n => (
                  <Box key={n} onClick={() => setFeedbackData(p => ({ ...p, score: n }))}
                    sx={{ width: 36, height: 36, borderRadius: 2, display: 'flex', alignItems: 'center',
                      justifyContent: 'center', cursor: 'pointer', fontWeight: 700, fontSize: '0.875rem',
                      border: `2px solid ${feedbackData.score === n
                        ? (n >= 7 ? '#2e7d32' : n >= 4 ? '#f57c00' : '#c62828')
                        : '#e8ecf0'}`,
                      bgcolor: feedbackData.score === n
                        ? (n >= 7 ? '#e8f5e9' : n >= 4 ? '#fff3e0' : '#ffebee')
                        : 'white',
                      color: feedbackData.score === n
                        ? (n >= 7 ? '#2e7d32' : n >= 4 ? '#e65100' : '#c62828')
                        : '#64748b',
                      transition: 'all 0.15s' }}>
                    {n}
                  </Box>
                ))}
              </Box>
            </Box>
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2.5, gap: 1 }}>
          <Button onClick={() => setFeedbackDialog(false)}
            sx={{ borderRadius: 2, textTransform: 'none', color: '#64748b' }}>Annuler</Button>
          <Button onClick={handleSubmitFeedback} variant="contained" disabled={saving}
            sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 600,
              background: 'linear-gradient(135deg,#1e3a5f,#1e40af)' }}>
            Enregistrer
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar open={snack.open} autoHideDuration={3000}
        onClose={() => setSnack(p => ({ ...p, open: false }))}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}>
        <Alert severity={snack.severity} onClose={() => setSnack(p => ({ ...p, open: false }))}
          sx={{ borderRadius: 2, boxShadow: '0 4px 16px rgba(0,0,0,0.12)' }}>
          {snack.msg}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default ApplicationDetail;
