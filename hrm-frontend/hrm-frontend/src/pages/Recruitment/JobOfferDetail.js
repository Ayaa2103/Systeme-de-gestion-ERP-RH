import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box, Card, CardContent, Typography, Button, Grid, Chip,
  Avatar, Divider, IconButton, Menu, MenuItem,
  Dialog, DialogContent, DialogActions, TextField, CircularProgress,
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  Work as WorkIcon,
  People as PeopleIcon,
  Publish as PublishIcon,
  Close as CloseIcon,
  MoreVert as MoreVertIcon,
  Schedule as ScheduleIcon,
  Business as BusinessIcon,
  CalendarToday as CalendarIcon,
  CheckCircle as CheckCircleIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  Person as PersonIcon,
  Star as StarIcon,
} from '@mui/icons-material';
import {
  getJobOfferDetail, publishJobOffer, closeJobOffer,
  updateApplicationStatus, createInterview,
} from '../../services/hrService';
import { useAuth } from '../../contexts/AuthContext';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

const offerStatusConfig = {
  draft:     { label: 'Brouillon', color: '#e65100', bg: '#fff3e0' },
  published: { label: 'Publiée',   color: '#2e7d32', bg: '#e8f5e9' },
  closed:    { label: 'Fermée',    color: '#c62828', bg: '#ffebee' },
};

const appStatusConfig = {
  pending:   { label: 'En attente', color: '#e65100', bg: '#fff3e0' },
  reviewed:  { label: 'Examiné',    color: '#0288d1', bg: '#e1f5fe' },
  interview: { label: 'Entretien',  color: '#7b1fa2', bg: '#f3e5f5' },
  accepted:  { label: 'Accepté',    color: '#2e7d32', bg: '#e8f5e9' },
  rejected:  { label: 'Rejeté',     color: '#c62828', bg: '#ffebee' },
};

const expLabel = {
  junior:       'Junior (0-2 ans)',
  intermediate: 'Intermédiaire (2-5 ans)',
  senior:       'Senior (5+ ans)',
  expert:       'Expert (10+ ans)',
};

const AVATAR_COLORS = ['#1976d2','#388e3c','#d32f2f','#7b1fa2','#f57c00','#0097a7','#c2185b','#5d4037'];
const avatarColor = (name = '') => AVATAR_COLORS[(name.charCodeAt(0) || 0) % AVATAR_COLORS.length];

/* ── Reusable section header ── */
const SectionHeader = ({ title, count }) => (
  <Box sx={{
    background: 'linear-gradient(135deg, #0f172a 0%, #1e3a5f 60%, #1e40af 100%)',
    px: 3, py: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between',
  }}>
    <Typography variant="subtitle1" fontWeight={700} color="white">{title}</Typography>
    {count !== undefined && (
      <Chip label={count} size="small"
        sx={{ bgcolor: 'rgba(255,255,255,0.15)', color: 'white', height: 22, '& .MuiChip-label': { px: 1 } }} />
    )}
  </Box>
);

/* ── Main ── */
const JobOfferDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const isAdmin = user?.role === 'administrator';

  const [jobOffer, setJobOffer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedApplication, setSelectedApplication] = useState(null);
  const [statusDialog, setStatusDialog] = useState(false);
  const [interviewDialog, setInterviewDialog] = useState(false);
  const [newStatus, setNewStatus] = useState('');
  const [notes, setNotes] = useState('');
  const [interviewData, setInterviewData] = useState({ scheduled_date: '', location: '' });

  useEffect(() => { fetchJobOfferDetail(); }, [id]);

  const fetchJobOfferDetail = async () => {
    try {
      const res = await getJobOfferDetail(id);
      setJobOffer(res.data);
    } catch (_) {}
    finally { setLoading(false); }
  };

  const handlePublish = async () => {
    try { await publishJobOffer(id); await fetchJobOfferDetail(); } catch (_) {}
  };

  const handleCloseOffer = async () => {
    try { await closeJobOffer(id); await fetchJobOfferDetail(); } catch (_) {}
  };

  const handleUpdateStatus = async () => {
    try {
      await updateApplicationStatus(selectedApplication.id, { status: newStatus, notes });
      await fetchJobOfferDetail();
      setStatusDialog(false);
      setNotes('');
    } catch (_) {}
  };

  const handleCreateInterview = async () => {
    try {
      await createInterview(selectedApplication.id, interviewData);
      await fetchJobOfferDetail();
      setInterviewDialog(false);
      setInterviewData({ scheduled_date: '', location: '' });
    } catch (_) {}
  };

  if (loading) return (
    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 300 }}>
      <CircularProgress />
    </Box>
  );
  if (!jobOffer) return (
    <Box sx={{ textAlign: 'center', py: 8 }}>
      <WorkIcon sx={{ fontSize: 56, color: 'text.disabled', mb: 1.5 }} />
      <Typography variant="h6" color="text.secondary">Offre non trouvée</Typography>
    </Box>
  );

  const osc = offerStatusConfig[jobOffer.status] || { label: jobOffer.status, color: '#757575', bg: '#f5f5f5' };
  const skills = jobOffer.required_skills
    ? jobOffer.required_skills.split(',').map(s => s.trim()).filter(Boolean)
    : [];
  const apps = jobOffer.applications || [];

  return (
    <Box sx={{ width: '100%' }}>

      {/* ── Banner ── */}
      <Card elevation={0} sx={{ borderRadius: 3, border: '1px solid #e8ecf0', mb: 3, overflow: 'hidden' }}>
        <Box sx={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e3a5f 60%, #1e40af 100%)', px: 3, py: 3 }}>

          {/* Back row */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2.5 }}>
            <IconButton
              size="small" onClick={() => navigate('/job-offers')}
              sx={{ color: 'rgba(255,255,255,0.6)', '&:hover': { bgcolor: 'rgba(255,255,255,0.1)', color: 'white' } }}
            >
              <ArrowBackIcon fontSize="small" />
            </IconButton>
            <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.55)' }}>
              Retour aux offres
            </Typography>
          </Box>

          {/* Title + actions */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Box sx={{ p: 1.5, borderRadius: 2.5, bgcolor: 'rgba(255,255,255,0.12)', flexShrink: 0 }}>
                <WorkIcon sx={{ fontSize: 28, color: 'white' }} />
              </Box>
              <Box>
                <Typography variant="h5" fontWeight={700} color="white" sx={{ lineHeight: 1.2 }}>
                  {jobOffer.title}
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mt: 0.75, flexWrap: 'wrap' }}>
                  {jobOffer.department && (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      <BusinessIcon sx={{ fontSize: 13, color: 'rgba(255,255,255,0.55)' }} />
                      <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.75)' }}>
                        {jobOffer.department}
                      </Typography>
                    </Box>
                  )}
                  {jobOffer.experience_level && (
                    <Chip
                      label={expLabel[jobOffer.experience_level] || jobOffer.experience_level}
                      size="small"
                      sx={{
                        bgcolor: 'rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.85)',
                        border: '1px solid rgba(255,255,255,0.2)', fontSize: '0.7rem', height: 22,
                        '& .MuiChip-label': { px: 1 },
                      }}
                    />
                  )}
                </Box>
              </Box>
            </Box>

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flexWrap: 'wrap' }}>
              <Chip
                label={osc.label} size="small"
                sx={{
                  bgcolor: `${osc.color}28`, color: 'white', fontWeight: 700, fontSize: '0.75rem',
                  border: `1px solid ${osc.color}50`, '& .MuiChip-label': { px: 1.25 },
                }}
              />
              {!isAdmin && jobOffer.status === 'draft' && (
                <Button
                  variant="contained" size="small" startIcon={<PublishIcon sx={{ fontSize: 16 }} />}
                  onClick={handlePublish}
                  sx={{ bgcolor: '#2e7d32', color: 'white', borderRadius: 2, textTransform: 'none',
                        fontWeight: 600, height: 32, '&:hover': { bgcolor: '#1b5e20' } }}
                >
                  Publier
                </Button>
              )}
              {!isAdmin && jobOffer.status === 'published' && (
                <Button
                  variant="outlined" size="small" startIcon={<CloseIcon sx={{ fontSize: 16 }} />}
                  onClick={handleCloseOffer}
                  sx={{
                    borderColor: 'rgba(255,255,255,0.3)', color: 'rgba(255,255,255,0.85)',
                    borderRadius: 2, textTransform: 'none', fontWeight: 600, height: 32,
                    '&:hover': { bgcolor: 'rgba(255,255,255,0.1)', borderColor: 'rgba(255,255,255,0.5)' },
                  }}
                >
                  Fermer l'offre
                </Button>
              )}
            </Box>
          </Box>
        </Box>
      </Card>

      <Grid container spacing={3}>

        {/* ── Left column ── */}
        <Grid item xs={12} md={8}>

          {/* Description + Skills */}
          <Card elevation={0} sx={{ border: '1px solid #e8ecf0', borderRadius: 3, mb: 3, overflow: 'hidden' }}>
            <SectionHeader title="Description du poste" />
            <CardContent sx={{ p: 3 }}>
              <Typography variant="body2" sx={{ whiteSpace: 'pre-line', lineHeight: 1.9, color: 'text.secondary' }}>
                {jobOffer.description || 'Aucune description disponible.'}
              </Typography>
            </CardContent>

            {skills.length > 0 && (
              <>
                <Divider />
                <CardContent sx={{ p: 3, pt: 2.5 }}>
                  <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 1.5 }}>
                    Compétences requises
                  </Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                    {skills.map((s, i) => (
                      <Chip key={i} label={s} size="small"
                        sx={{ bgcolor: '#eff6ff', color: '#1d4ed8', border: '1px solid #bfdbfe', fontWeight: 500 }}
                      />
                    ))}
                  </Box>
                </CardContent>
              </>
            )}
          </Card>

          {/* Applications */}
          <Card elevation={0} sx={{ border: '1px solid #e8ecf0', borderRadius: 3, overflow: 'hidden' }}>
            <SectionHeader title="Candidatures" count={apps.length} />
            <CardContent sx={{ p: apps.length === 0 ? 3 : 2 }}>
              {apps.length === 0 ? (
                <Box sx={{ textAlign: 'center', py: 6 }}>
                  <Box sx={{ p: 2, borderRadius: 3, bgcolor: '#f8fafc', display: 'inline-flex', mb: 1.5 }}>
                    <PeopleIcon sx={{ fontSize: 40, color: 'text.disabled' }} />
                  </Box>
                  <Typography variant="body1" color="text.secondary" fontWeight={500}>
                    Aucune candidature pour le moment
                  </Typography>
                </Box>
              ) : (
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                  {apps.map((app) => {
                    const asc = appStatusConfig[app.status] || { label: app.status, color: '#757575', bg: '#f5f5f5' };
                    const initials = `${(app.first_name || '')[0] || ''}${(app.last_name || '')[0] || ''}`.toUpperCase();
                    return (
                      <Box key={app.id} sx={{
                        p: 2, border: '1px solid #e8ecf0', borderRadius: 2.5, bgcolor: '#fafbfc',
                        display: 'flex', alignItems: 'center', gap: 2,
                        transition: 'all 0.15s ease',
                        '&:hover': { bgcolor: '#f0f4ff', borderColor: '#bfdbfe' },
                      }}>
                        <Avatar sx={{
                          bgcolor: avatarColor(app.first_name || ''),
                          width: 42, height: 42, fontSize: '0.85rem', fontWeight: 700, flexShrink: 0,
                        }}>
                          {initials || <PersonIcon />}
                        </Avatar>

                        <Box sx={{ flex: 1, minWidth: 0 }}>
                          <Typography variant="subtitle2" fontWeight={700}>
                            {app.first_name} {app.last_name}
                          </Typography>
                          <Box sx={{ display: 'flex', gap: 2, mt: 0.3, flexWrap: 'wrap' }}>
                            {app.email && (
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.4 }}>
                                <EmailIcon sx={{ fontSize: 12, color: 'text.disabled' }} />
                                <Typography variant="caption" color="text.secondary">{app.email}</Typography>
                              </Box>
                            )}
                            {app.phone && (
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.4 }}>
                                <PhoneIcon sx={{ fontSize: 12, color: 'text.disabled' }} />
                                <Typography variant="caption" color="text.secondary">{app.phone}</Typography>
                              </Box>
                            )}
                          </Box>
                        </Box>

                        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 0.5, flexShrink: 0 }}>
                          <Chip
                            label={asc.label} size="small"
                            sx={{
                              bgcolor: asc.bg, color: asc.color, fontWeight: 700, fontSize: '0.68rem',
                              border: `1px solid ${asc.color}30`, height: 20,
                              '& .MuiChip-label': { px: 0.75 },
                            }}
                          />
                          {app.applied_at && (
                            <Typography variant="caption" color="text.disabled" sx={{ fontSize: '0.68rem' }}>
                              {format(new Date(app.applied_at), 'dd MMM yyyy', { locale: fr })}
                            </Typography>
                          )}
                        </Box>

                        {!isAdmin && (
                          <IconButton
                            size="small" sx={{ color: 'text.disabled', flexShrink: 0, '&:hover': { color: 'text.primary' } }}
                            onClick={(e) => { setAnchorEl(e.currentTarget); setSelectedApplication(app); }}
                          >
                            <MoreVertIcon fontSize="small" />
                          </IconButton>
                        )}
                      </Box>
                    );
                  })}
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* ── Right column ── */}
        <Grid item xs={12} md={4}>

          {/* Stats */}
          <Card elevation={0} sx={{ border: '1px solid #e8ecf0', borderRadius: 3, mb: 2.5, overflow: 'hidden' }}>
            <SectionHeader title="Statistiques" />
            <CardContent sx={{ p: 0 }}>
              {[
                { label: 'Total candidatures', value: apps.length,                                             color: '#1976d2' },
                { label: 'En attente',          value: apps.filter(a => a.status === 'pending').length,        color: '#e65100' },
                { label: 'Entretiens',           value: apps.filter(a => a.status === 'interview').length,     color: '#7b1fa2' },
                { label: 'Acceptés',             value: apps.filter(a => a.status === 'accepted').length,     color: '#2e7d32' },
                { label: 'Rejetés',              value: apps.filter(a => a.status === 'rejected').length,     color: '#c62828' },
              ].map((row, i, arr) => (
                <Box key={row.label} sx={{
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  px: 3, py: 1.75,
                  borderBottom: i < arr.length - 1 ? '1px solid #f0f4f8' : 'none',
                }}>
                  <Typography variant="body2" color="text.secondary">{row.label}</Typography>
                  <Typography variant="h6" fontWeight={700} sx={{ color: row.color }}>{row.value}</Typography>
                </Box>
              ))}
            </CardContent>
          </Card>

          {/* Meta info */}
          <Card elevation={0} sx={{ border: '1px solid #e8ecf0', borderRadius: 3, overflow: 'hidden' }}>
            <SectionHeader title="Informations" />
            <CardContent sx={{ p: 0 }}>
              {[
                {
                  icon: <CalendarIcon sx={{ fontSize: 16 }} />,
                  label: 'Créée le',
                  value: jobOffer.created_at
                    ? format(new Date(jobOffer.created_at), 'dd MMM yyyy', { locale: fr })
                    : '—',
                },
                {
                  icon: <PersonIcon sx={{ fontSize: 16 }} />,
                  label: 'Créée par',
                  value: jobOffer.created_by_name || '—',
                },
                {
                  icon: <StarIcon sx={{ fontSize: 16 }} />,
                  label: 'Expérience',
                  value: expLabel[jobOffer.experience_level] || jobOffer.experience_level || '—',
                },
                {
                  icon: <WorkIcon sx={{ fontSize: 16 }} />,
                  label: 'Département',
                  value: jobOffer.department || '—',
                },
              ].map((row, i, arr) => (
                <Box key={row.label} sx={{
                  display: 'flex', alignItems: 'center', gap: 1.5,
                  px: 3, py: 1.75,
                  borderBottom: i < arr.length - 1 ? '1px solid #f0f4f8' : 'none',
                }}>
                  <Box sx={{ color: '#1976d2', flexShrink: 0 }}>{row.icon}</Box>
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Typography variant="caption" color="text.disabled" sx={{ display: 'block' }}>
                      {row.label}
                    </Typography>
                    <Typography variant="body2" fontWeight={500} noWrap>{row.value}</Typography>
                  </Box>
                </Box>
              ))}
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* ── Context menu (applications) ── */}
      <Menu
        anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={() => setAnchorEl(null)}
        PaperProps={{ elevation: 0, sx: { border: '1px solid #e8ecf0', borderRadius: 2, minWidth: 190 } }}
      >
        <MenuItem onClick={() => { setStatusDialog(true); setAnchorEl(null); }} sx={{ fontSize: '0.875rem' }}>
          <CheckCircleIcon sx={{ mr: 1.5, fontSize: 18 }} />Changer le statut
        </MenuItem>
        {selectedApplication?.status !== 'interview' && (
          <MenuItem onClick={() => { setInterviewDialog(true); setAnchorEl(null); }} sx={{ fontSize: '0.875rem' }}>
            <ScheduleIcon sx={{ mr: 1.5, fontSize: 18 }} />Programmer un entretien
          </MenuItem>
        )}
      </Menu>

      {/* ── Status dialog ── */}
      <Dialog open={statusDialog} onClose={() => setStatusDialog(false)} maxWidth="sm" fullWidth
        PaperProps={{ sx: { borderRadius: 3, overflow: 'hidden' } }}>
        <Box sx={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e3a5f 60%, #1e40af 100%)', px: 3, py: 2 }}>
          <Typography variant="subtitle1" fontWeight={700} color="white">Changer le statut</Typography>
        </Box>
        <DialogContent sx={{ p: 3 }}>
          <TextField
            select fullWidth label="Nouveau statut" value={newStatus}
            onChange={(e) => setNewStatus(e.target.value)}
            size="small" sx={{ mb: 2, '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
          >
            <MenuItem value="">Sélectionner…</MenuItem>
            <MenuItem value="pending">En attente</MenuItem>
            <MenuItem value="reviewed">Examiné</MenuItem>
            <MenuItem value="interview">Entretien</MenuItem>
            <MenuItem value="accepted">Accepté</MenuItem>
            <MenuItem value="rejected">Rejeté</MenuItem>
          </TextField>
          <TextField
            fullWidth multiline rows={3} label="Notes (optionnel)" value={notes}
            onChange={(e) => setNotes(e.target.value)}
            size="small" sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
          />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2.5, gap: 1 }}>
          <Button onClick={() => setStatusDialog(false)} sx={{ borderRadius: 2, textTransform: 'none' }}>Annuler</Button>
          <Button onClick={handleUpdateStatus} variant="contained" disabled={!newStatus}
            sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 600 }}>
            Mettre à jour
          </Button>
        </DialogActions>
      </Dialog>

      {/* ── Interview dialog ── */}
      <Dialog open={interviewDialog} onClose={() => setInterviewDialog(false)} maxWidth="sm" fullWidth
        PaperProps={{ sx: { borderRadius: 3, overflow: 'hidden' } }}>
        <Box sx={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e3a5f 60%, #1e40af 100%)', px: 3, py: 2 }}>
          <Typography variant="subtitle1" fontWeight={700} color="white">Programmer un entretien</Typography>
        </Box>
        <DialogContent sx={{ p: 3 }}>
          <TextField
            fullWidth type="datetime-local" label="Date et heure"
            value={interviewData.scheduled_date}
            onChange={(e) => setInterviewData({ ...interviewData, scheduled_date: e.target.value })}
            size="small" sx={{ mb: 2, '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
            InputLabelProps={{ shrink: true }}
          />
          <TextField
            fullWidth label="Lieu" value={interviewData.location}
            onChange={(e) => setInterviewData({ ...interviewData, location: e.target.value })}
            placeholder="Ex: Bureau 201, Visioconférence…"
            size="small" sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
          />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2.5, gap: 1 }}>
          <Button onClick={() => setInterviewDialog(false)} sx={{ borderRadius: 2, textTransform: 'none' }}>Annuler</Button>
          <Button onClick={handleCreateInterview} variant="contained"
            sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 600 }}>
            Programmer
          </Button>
        </DialogActions>
      </Dialog>

    </Box>
  );
};

export default JobOfferDetail;
