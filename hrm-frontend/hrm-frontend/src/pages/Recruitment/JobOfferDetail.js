import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box, Card, CardContent, Typography, Button, Grid, Chip,
  Avatar, Divider, IconButton, Menu, MenuItem,
  Dialog, DialogContent, DialogActions, TextField,
  CircularProgress, Tooltip, LinearProgress,
} from '@mui/material';
import {
  ArrowBack as BackIcon,
  Work as WorkIcon,
  People as PeopleIcon,
  Publish as PublishIcon,
  Close as CloseIcon,
  MoreVert as MoreVertIcon,
  Schedule as ScheduleIcon,
  Business as DeptIcon,
  CalendarToday as CalendarIcon,
  CheckCircle as CheckIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  Person as PersonIcon,
  TrendingUp as LevelIcon,
  Edit as EditIcon,
  Psychology as SkillsIcon,
  Description as DescIcon,
  LocationOn as LocationIcon,
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
  closed:    { label: 'Fermée',    color: '#757575', bg: '#f5f5f5' },
};

const appStatusConfig = {
  pending:   { label: 'En attente', color: '#f57c00', bg: '#fff8e1' },
  reviewed:  { label: 'Examiné',    color: '#0288d1', bg: '#e1f5fe' },
  interview: { label: 'Entretien',  color: '#7b1fa2', bg: '#f3e5f5' },
  accepted:  { label: 'Accepté',    color: '#2e7d32', bg: '#e8f5e9' },
  rejected:  { label: 'Rejeté',     color: '#c62828', bg: '#ffebee' },
};

const expLabel = {
  junior:       'Junior (0–2 ans)',
  intermediate: 'Intermédiaire (2–5 ans)',
  senior:       'Senior (5–10 ans)',
  expert:       'Expert (10+ ans)',
};

const COLORS = ['#1976d2','#388e3c','#d32f2f','#7b1fa2','#f57c00','#0097a7','#c2185b','#5d4037'];
const avatarColor = (name = '') => COLORS[(name.charCodeAt(0) || 0) % COLORS.length];

const NavHeader = ({ title, icon }) => (
  <Box sx={{ background: 'linear-gradient(135deg,#0f172a,#1e3a5f,#1e40af)',
    px: 2.5, py: 1.5, display: 'flex', alignItems: 'center', gap: 1.5 }}>
    <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.12)', width: 28, height: 28, borderRadius: 1.5 }}>
      {React.cloneElement(icon, { sx: { fontSize: 14, color: 'white' } })}
    </Avatar>
    <Typography sx={{ color: 'white', fontWeight: 700, fontSize: '0.88rem' }}>{title}</Typography>
  </Box>
);

const JobOfferDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const isAdmin = user?.role === 'administrator';

  const [jobOffer, setJobOffer]       = useState(null);
  const [loading, setLoading]         = useState(true);
  const [anchorEl, setAnchorEl]       = useState(null);
  const [selectedApp, setSelectedApp] = useState(null);
  const [statusDialog, setStatusDialog]     = useState(false);
  const [interviewDialog, setInterviewDialog] = useState(false);
  const [newStatus, setNewStatus]   = useState('');
  const [notes, setNotes]           = useState('');
  const [interviewData, setInterviewData] = useState({ scheduled_date: '', location: '' });

  useEffect(() => { fetch(); }, [id]);

  const fetch = async () => {
    setLoading(true);
    try {
      const res = await getJobOfferDetail(id);
      setJobOffer(res.data);
    } catch (_) {}
    finally { setLoading(false); }
  };

  const handlePublish     = async () => { try { await publishJobOffer(id);    fetch(); } catch(_){} };
  const handleCloseOffer  = async () => { try { await closeJobOffer(id);      fetch(); } catch(_){} };

  const handleUpdateStatus = async () => {
    try {
      await updateApplicationStatus(selectedApp.id, { status: newStatus, notes });
      fetch(); setStatusDialog(false); setNotes('');
    } catch (_) {}
  };

  const handleCreateInterview = async () => {
    try {
      await createInterview(selectedApp.id, interviewData);
      fetch(); setInterviewDialog(false); setInterviewData({ scheduled_date: '', location: '' });
    } catch (_) {}
  };

  if (loading) return (
    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 300 }}>
      <CircularProgress sx={{ color: '#1976d2' }} />
    </Box>
  );

  if (!jobOffer) return (
    <Box sx={{ textAlign: 'center', py: 8 }}>
      <WorkIcon sx={{ fontSize: 56, color: '#cbd5e1', mb: 1.5 }} />
      <Typography variant="h6" color="text.secondary">Offre introuvable</Typography>
      <Button startIcon={<BackIcon />} onClick={() => navigate('/job-offers')}
        sx={{ mt: 2, textTransform: 'none' }}>Retour aux offres</Button>
    </Box>
  );

  const osc    = offerStatusConfig[jobOffer.status] || offerStatusConfig.draft;
  const skills = jobOffer.required_skills
    ? jobOffer.required_skills.split(',').map(s => s.trim()).filter(Boolean)
    : [];
  const apps = jobOffer.applications || [];
  const total = apps.length || 1;

  const pipeline = [
    { key: 'pending',   label: 'En attente', color: '#f57c00' },
    { key: 'reviewed',  label: 'Examinés',   color: '#0288d1' },
    { key: 'interview', label: 'Entretiens', color: '#7b1fa2' },
    { key: 'accepted',  label: 'Acceptés',   color: '#2e7d32' },
    { key: 'rejected',  label: 'Rejetés',    color: '#c62828' },
  ].map(p => ({ ...p, count: apps.filter(a => a.status === p.key).length }));

  return (
    <Box sx={{ width: '100%' }}>

      {/* ── Banner ── */}
      <Card elevation={0} sx={{ borderRadius: 3, border: '1px solid #e8ecf0', mb: 3, overflow: 'hidden' }}>
        <Box sx={{ background: 'linear-gradient(135deg,#0f172a 0%,#1e3a5f 60%,#1e40af 100%)', px: 3, py: 3, position: 'relative', overflow: 'hidden' }}>
          <Box sx={{ position: 'absolute', top: -40, right: -40, width: 180, height: 180, borderRadius: '50%', bgcolor: 'rgba(255,255,255,0.03)', pointerEvents: 'none' }} />

          {/* Back */}
          <Button startIcon={<BackIcon />} onClick={() => navigate('/job-offers')} size="small"
            sx={{ color: 'rgba(255,255,255,0.6)', textTransform: 'none', borderRadius: 2, mb: 2,
              '&:hover': { bgcolor: 'rgba(255,255,255,0.08)', color: 'white' } }}>
            Retour aux offres
          </Button>

          {/* Title row */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Box sx={{ p: 1.5, borderRadius: 2.5, bgcolor: 'rgba(255,255,255,0.12)', flexShrink: 0 }}>
                <WorkIcon sx={{ fontSize: 28, color: 'white' }} />
              </Box>
              <Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 0.5 }}>
                  <Typography variant="h5" fontWeight={700} color="white">{jobOffer.title}</Typography>
                  <Chip label={osc.label} size="small"
                    sx={{ bgcolor: `${osc.color}28`, color: 'white', fontWeight: 700, fontSize: '0.72rem',
                      border: `1px solid ${osc.color}50`, height: 22 }} />
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flexWrap: 'wrap' }}>
                  {jobOffer.department && (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      <DeptIcon sx={{ fontSize: 13, color: 'rgba(255,255,255,0.5)' }} />
                      <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.75)' }}>{jobOffer.department}</Typography>
                    </Box>
                  )}
                  {jobOffer.experience_level && (
                    <Chip label={expLabel[jobOffer.experience_level] || jobOffer.experience_level} size="small"
                      sx={{ bgcolor: 'rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.85)',
                        border: '1px solid rgba(255,255,255,0.2)', fontSize: '0.7rem', height: 22 }} />
                  )}
                  {jobOffer.created_at && (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      <CalendarIcon sx={{ fontSize: 13, color: 'rgba(255,255,255,0.5)' }} />
                      <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.6)' }}>
                        {format(new Date(jobOffer.created_at), 'dd MMM yyyy', { locale: fr })}
                      </Typography>
                    </Box>
                  )}
                </Box>
              </Box>
            </Box>

            {/* Actions */}
            {!isAdmin && (
              <Box sx={{ display: 'flex', gap: 1 }}>
                <Button size="small" startIcon={<EditIcon sx={{ fontSize: 15 }} />}
                  onClick={() => navigate(`/job-offers/${id}/edit`)}
                  sx={{ color: 'rgba(255,255,255,0.75)', border: '1px solid rgba(255,255,255,0.2)',
                    borderRadius: 2, textTransform: 'none', fontWeight: 600,
                    '&:hover': { bgcolor: 'rgba(255,255,255,0.1)' } }}>
                  Modifier
                </Button>
                {jobOffer.status === 'draft' && (
                  <Button size="small" startIcon={<PublishIcon sx={{ fontSize: 15 }} />}
                    onClick={handlePublish}
                    sx={{ bgcolor: '#2e7d32', color: 'white', borderRadius: 2, textTransform: 'none', fontWeight: 600,
                      '&:hover': { bgcolor: '#1b5e20' } }}>
                    Publier
                  </Button>
                )}
                {jobOffer.status === 'published' && (
                  <Button size="small" startIcon={<CloseIcon sx={{ fontSize: 15 }} />}
                    onClick={handleCloseOffer}
                    sx={{ bgcolor: 'rgba(198,40,40,0.3)', color: 'white', borderRadius: 2,
                      textTransform: 'none', fontWeight: 600, border: '1px solid rgba(198,40,40,0.4)',
                      '&:hover': { bgcolor: 'rgba(198,40,40,0.5)' } }}>
                    Fermer l'offre
                  </Button>
                )}
              </Box>
            )}
          </Box>

          {/* Quick stats in banner */}
          <Box sx={{ display: 'flex', gap: 3, mt: 2.5, pt: 2.5, borderTop: '1px solid rgba(255,255,255,0.08)', flexWrap: 'wrap' }}>
            {[
              { label: 'Candidatures', value: apps.length, color: '#60a5fa' },
              { label: 'En attente',   value: apps.filter(a => a.status === 'pending').length,   color: '#fbbf24' },
              { label: 'Entretiens',   value: apps.filter(a => a.status === 'interview').length, color: '#a78bfa' },
              { label: 'Acceptés',     value: apps.filter(a => a.status === 'accepted').length,  color: '#34d399' },
            ].map(s => (
              <Box key={s.label} sx={{ textAlign: 'center' }}>
                <Typography sx={{ fontSize: '1.4rem', fontWeight: 800, color: s.color, lineHeight: 1 }}>{s.value}</Typography>
                <Typography sx={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.5)', mt: 0.3 }}>{s.label}</Typography>
              </Box>
            ))}
          </Box>
        </Box>
      </Card>

      <Grid container spacing={3}>

        {/* ── Left (description + candidatures) ── */}
        <Grid item xs={12} md={8}>

          {/* Description + Compétences */}
          <Card elevation={0} sx={{ border: '1px solid #e8ecf0', borderRadius: 3, mb: 3, overflow: 'hidden' }}>
            <NavHeader title="Description du poste" icon={<DescIcon />} />
            <CardContent sx={{ p: 3 }}>
              <Typography variant="body2" sx={{ whiteSpace: 'pre-line', lineHeight: 1.9, color: '#475569', fontSize: '0.875rem' }}>
                {jobOffer.description || 'Aucune description disponible.'}
              </Typography>
            </CardContent>

            {skills.length > 0 && (
              <>
                <Divider />
                <CardContent sx={{ p: 3, pt: 2.5 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
                    <SkillsIcon sx={{ fontSize: 16, color: '#1976d2' }} />
                    <Typography sx={{ fontSize: '0.78rem', fontWeight: 700, color: '#475569',
                      textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                      Compétences requises
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75 }}>
                    {skills.map((s, i) => (
                      <Chip key={i} label={s} size="small"
                        sx={{ bgcolor: '#eff6ff', color: '#1976d2', border: '1px solid #bfdbfe',
                          fontWeight: 600, fontSize: '0.72rem', height: 24 }} />
                    ))}
                  </Box>
                </CardContent>
              </>
            )}
          </Card>

          {/* Candidatures */}
          <Card elevation={0} sx={{ border: '1px solid #e8ecf0', borderRadius: 3, overflow: 'hidden' }}>
            <Box sx={{ background: 'linear-gradient(135deg,#0f172a,#1e3a5f,#1e40af)',
              px: 2.5, py: 1.5, display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.12)', width: 28, height: 28, borderRadius: 1.5 }}>
                <PeopleIcon sx={{ fontSize: 14, color: 'white' }} />
              </Avatar>
              <Typography sx={{ color: 'white', fontWeight: 700, fontSize: '0.88rem', flex: 1 }}>
                Candidatures
              </Typography>
              <Chip label={apps.length} size="small"
                sx={{ bgcolor: 'rgba(255,255,255,0.15)', color: 'white', height: 20, fontSize: '0.7rem' }} />
            </Box>

            {apps.length === 0 ? (
              <Box sx={{ textAlign: 'center', py: 6 }}>
                <Box sx={{ p: 2, borderRadius: 3, bgcolor: '#f8fafc', display: 'inline-flex', mb: 1.5 }}>
                  <PeopleIcon sx={{ fontSize: 40, color: '#cbd5e1' }} />
                </Box>
                <Typography variant="body2" color="text.secondary">Aucune candidature reçue</Typography>
              </Box>
            ) : (
              apps.map((app, i) => {
                const asc = appStatusConfig[app.status] || appStatusConfig.pending;
                const name = `${app.first_name || ''} ${app.last_name || ''}`.trim() || '—';
                return (
                  <React.Fragment key={app.id}>
                    <Box sx={{ px: 2.5, py: 1.75, display: 'flex', alignItems: 'center', gap: 2,
                      transition: 'background 0.15s', '&:hover': { bgcolor: '#f8fafc' } }}>

                      <Avatar sx={{ bgcolor: avatarColor(name), width: 40, height: 40,
                        fontSize: '0.85rem', fontWeight: 700, flexShrink: 0 }}>
                        {name[0]?.toUpperCase() || '?'}
                      </Avatar>

                      <Box sx={{ flex: 1, minWidth: 0 }}>
                        <Typography sx={{ fontSize: '0.875rem', fontWeight: 600, color: '#1e293b' }}>{name}</Typography>
                        <Box sx={{ display: 'flex', gap: 1.5, mt: 0.3, flexWrap: 'wrap', alignItems: 'center' }}>
                          {app.email && (
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.4 }}>
                              <EmailIcon sx={{ fontSize: 12, color: '#94a3b8' }} />
                              <Typography variant="caption" color="text.secondary">{app.email}</Typography>
                            </Box>
                          )}
                          {app.phone && (
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.4 }}>
                              <PhoneIcon sx={{ fontSize: 12, color: '#94a3b8' }} />
                              <Typography variant="caption" color="text.secondary">{app.phone}</Typography>
                            </Box>
                          )}
                          {app.applied_at && (
                            <Typography variant="caption" sx={{ color: '#94a3b8' }}>
                              · {format(new Date(app.applied_at), 'dd MMM yyyy', { locale: fr })}
                            </Typography>
                          )}
                        </Box>
                      </Box>

                      <Chip label={asc.label} size="small"
                        sx={{ bgcolor: asc.bg, color: asc.color, fontWeight: 700, fontSize: '0.7rem',
                          border: `1px solid ${asc.color}30`, height: 22, flexShrink: 0 }} />

                      {!isAdmin && (
                        <Tooltip title="Actions">
                          <IconButton size="small"
                            onClick={(e) => { setAnchorEl(e.currentTarget); setSelectedApp(app); }}
                            sx={{ color: '#94a3b8', width: 28, height: 28, flexShrink: 0,
                              '&:hover': { bgcolor: '#f1f5f9', color: '#475569' } }}>
                            <MoreVertIcon sx={{ fontSize: 16 }} />
                          </IconButton>
                        </Tooltip>
                      )}
                    </Box>
                    {i < apps.length - 1 && <Divider />}
                  </React.Fragment>
                );
              })
            )}
          </Card>
        </Grid>

        {/* ── Right (stats + infos) ── */}
        <Grid item xs={12} md={4}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, position: 'sticky', top: 24 }}>

            {/* Pipeline visuel */}
            <Card elevation={0} sx={{ border: '1px solid #e8ecf0', borderRadius: 3, overflow: 'hidden' }}>
              <NavHeader title="Pipeline candidatures" icon={<PeopleIcon />} />
              <CardContent sx={{ p: 2.5 }}>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.25 }}>
                  {pipeline.map(p => {
                    const pct = apps.length > 0 ? Math.round((p.count / apps.length) * 100) : 0;
                    return (
                      <Box key={p.key}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                            <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: p.count > 0 ? p.color : '#e2e8f0' }} />
                            <Typography sx={{ fontSize: '0.78rem', color: p.count > 0 ? '#334155' : '#94a3b8',
                              fontWeight: p.count > 0 ? 600 : 400 }}>
                              {p.label}
                            </Typography>
                          </Box>
                          <Typography sx={{ fontSize: '0.78rem', fontWeight: 700,
                            color: p.count > 0 ? p.color : '#cbd5e1' }}>
                            {p.count}
                          </Typography>
                        </Box>
                        <LinearProgress variant="determinate" value={pct}
                          sx={{ height: 5, borderRadius: 3, bgcolor: `${p.color}12`,
                            '& .MuiLinearProgress-bar': { bgcolor: p.color, borderRadius: 3 } }} />
                      </Box>
                    );
                  })}
                </Box>
              </CardContent>
            </Card>

            {/* Informations */}
            <Card elevation={0} sx={{ border: '1px solid #e8ecf0', borderRadius: 3, overflow: 'hidden' }}>
              <NavHeader title="Informations" icon={<DescIcon />} />
              <CardContent sx={{ p: 0 }}>
                {[
                  { icon: <DeptIcon />,    label: 'Département',   value: jobOffer.department || '—' },
                  { icon: <LevelIcon />,   label: 'Expérience',    value: expLabel[jobOffer.experience_level] || jobOffer.experience_level || '—' },
                  { icon: <PersonIcon />,  label: 'Créée par',     value: jobOffer.created_by_name || '—' },
                  { icon: <CalendarIcon />,label: 'Date création',  value: jobOffer.created_at ? format(new Date(jobOffer.created_at), 'dd MMMM yyyy', { locale: fr }) : '—' },
                ].map((row, i, arr) => (
                  <Box key={row.label} sx={{ display: 'flex', alignItems: 'center', gap: 1.5,
                    px: 2.5, py: 1.75, borderBottom: i < arr.length - 1 ? '1px solid #f1f5f9' : 'none' }}>
                    <Avatar sx={{ bgcolor: '#1976d212', width: 28, height: 28 }}>
                      {React.cloneElement(row.icon, { sx: { color: '#1976d2', fontSize: 14 } })}
                    </Avatar>
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      <Typography sx={{ fontSize: '0.68rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.4px' }}>
                        {row.label}
                      </Typography>
                      <Typography sx={{ fontSize: '0.82rem', fontWeight: 600, color: '#1e293b' }} noWrap>
                        {row.value}
                      </Typography>
                    </Box>
                  </Box>
                ))}
              </CardContent>
            </Card>

          </Box>
        </Grid>
      </Grid>

      {/* ── Context menu ── */}
      <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={() => setAnchorEl(null)}
        PaperProps={{ elevation: 0, sx: { border: '1px solid #e8ecf0', borderRadius: 2, minWidth: 200 } }}>
        <MenuItem onClick={() => { setStatusDialog(true); setAnchorEl(null); }}
          sx={{ fontSize: '0.875rem', gap: 1.5 }}>
          <CheckIcon sx={{ fontSize: 17, color: '#2e7d32' }} /> Changer le statut
        </MenuItem>
        {selectedApp?.status !== 'interview' && (
          <MenuItem onClick={() => { setInterviewDialog(true); setAnchorEl(null); }}
            sx={{ fontSize: '0.875rem', gap: 1.5 }}>
            <ScheduleIcon sx={{ fontSize: 17, color: '#7b1fa2' }} /> Programmer un entretien
          </MenuItem>
        )}
      </Menu>

      {/* ── Status dialog ── */}
      <Dialog open={statusDialog} onClose={() => setStatusDialog(false)} maxWidth="sm" fullWidth
        PaperProps={{ sx: { borderRadius: 3, overflow: 'hidden' } }}>
        <Box sx={{ background: 'linear-gradient(135deg,#0f172a,#1e3a5f,#1e40af)', px: 3, py: 2,
          display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.12)', width: 30, height: 30, borderRadius: 1.5 }}>
            <CheckIcon sx={{ fontSize: 15, color: 'white' }} />
          </Avatar>
          <Typography sx={{ color: 'white', fontWeight: 700 }}>Changer le statut</Typography>
        </Box>
        <DialogContent sx={{ p: 3 }}>
          {selectedApp && (
            <Box sx={{ p: 1.5, bgcolor: '#f8fafc', borderRadius: 2, border: '1px solid #e8ecf0', mb: 2.5 }}>
              <Typography sx={{ fontSize: '0.875rem', fontWeight: 600 }}>
                {selectedApp.first_name} {selectedApp.last_name}
              </Typography>
              <Typography variant="caption" color="text.secondary">{selectedApp.email}</Typography>
            </Box>
          )}
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, mb: 2 }}>
            {Object.entries(appStatusConfig).map(([key, cfg]) => (
              <Box key={key} onClick={() => setNewStatus(key)}
                sx={{ p: 1.25, borderRadius: 2, cursor: 'pointer',
                  border: `2px solid ${newStatus === key ? cfg.color : '#e8ecf0'}`,
                  bgcolor: newStatus === key ? cfg.bg : 'white', transition: 'all 0.15s',
                  display: 'flex', alignItems: 'center', gap: 1.5 }}>
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
          <Button onClick={handleUpdateStatus} variant="contained" disabled={!newStatus}
            sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 600,
              background: 'linear-gradient(135deg,#1e3a5f,#1e40af)' }}>
            Confirmer
          </Button>
        </DialogActions>
      </Dialog>

      {/* ── Interview dialog ── */}
      <Dialog open={interviewDialog} onClose={() => setInterviewDialog(false)} maxWidth="sm" fullWidth
        PaperProps={{ sx: { borderRadius: 3, overflow: 'hidden' } }}>
        <Box sx={{ background: 'linear-gradient(135deg,#0f172a,#1e3a5f,#1e40af)', px: 3, py: 2,
          display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.12)', width: 30, height: 30, borderRadius: 1.5 }}>
            <ScheduleIcon sx={{ fontSize: 15, color: 'white' }} />
          </Avatar>
          <Typography sx={{ color: 'white', fontWeight: 700 }}>Programmer un entretien</Typography>
        </Box>
        <DialogContent sx={{ p: 3 }}>
          {selectedApp && (
            <Box sx={{ p: 1.5, bgcolor: '#f8fafc', borderRadius: 2, border: '1px solid #e8ecf0', mb: 2.5,
              display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <Avatar sx={{ bgcolor: avatarColor(selectedApp.first_name || ''), width: 32, height: 32,
                fontSize: '0.75rem', fontWeight: 700 }}>
                {selectedApp.first_name?.[0]?.toUpperCase() || '?'}
              </Avatar>
              <Box>
                <Typography sx={{ fontSize: '0.875rem', fontWeight: 600 }}>
                  {selectedApp.first_name} {selectedApp.last_name}
                </Typography>
                <Typography variant="caption" color="text.secondary">{selectedApp.email}</Typography>
              </Box>
            </Box>
          )}
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Box>
              <Typography sx={{ fontSize: '0.78rem', fontWeight: 700, color: '#475569',
                textTransform: 'uppercase', letterSpacing: '0.5px', mb: 0.75 }}>
                Date et heure
              </Typography>
              <TextField fullWidth type="datetime-local" value={interviewData.scheduled_date}
                onChange={e => setInterviewData(p => ({ ...p, scheduled_date: e.target.value }))}
                size="small" InputLabelProps={{ shrink: true }}
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }} />
            </Box>
            <Box>
              <Typography sx={{ fontSize: '0.78rem', fontWeight: 700, color: '#475569',
                textTransform: 'uppercase', letterSpacing: '0.5px', mb: 0.75 }}>
                Lieu
              </Typography>
              <TextField fullWidth value={interviewData.location}
                onChange={e => setInterviewData(p => ({ ...p, location: e.target.value }))}
                placeholder="Ex: Bureau 201, Google Meet…" size="small"
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }} />
            </Box>
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2.5, gap: 1 }}>
          <Button onClick={() => setInterviewDialog(false)}
            sx={{ borderRadius: 2, textTransform: 'none', color: '#64748b' }}>Annuler</Button>
          <Button onClick={handleCreateInterview} variant="contained"
            sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 600,
              background: 'linear-gradient(135deg,#1e3a5f,#1e40af)' }}>
            Programmer
          </Button>
        </DialogActions>
      </Dialog>

    </Box>
  );
};

export default JobOfferDetail;
