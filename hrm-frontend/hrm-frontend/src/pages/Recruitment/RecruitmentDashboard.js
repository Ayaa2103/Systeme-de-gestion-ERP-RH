import React, { useState, useEffect } from 'react';
import {
  Box, Card, CardContent, Typography, Button, Grid, Chip, Avatar,
  IconButton, Menu, MenuItem, Divider, Skeleton, Tooltip,
} from '@mui/material';
import {
  Add as AddIcon,
  Work as WorkIcon,
  People as PeopleIcon,
  MoreVert as MoreVertIcon,
  Visibility as ViewIcon,
  Edit as EditIcon,
  Publish as PublishIcon,
  Close as CloseIcon,
  ArrowForward as ArrowIcon,
  ArrowBack as BackIcon,
  CheckCircle as HiredIcon,
  Schedule as PendingIcon,
  HowToReg as RecommendIcon,
  TrendingUp as TrendingIcon,
  BusinessCenter as OfferIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import {
  getJobOffers, publishJobOffer, closeJobOffer,
  getApplications, getRecruitmentStats,
} from '../../services/hrService';
import { useAuth } from '../../contexts/AuthContext';

const COLORS = ['#1976d2','#9c27b0','#2e7d32','#e65100','#0097a7','#c62828'];
const avatarColor = (name = '') => COLORS[(name.charCodeAt(0) || 0) % COLORS.length];

const statusOffer = {
  draft:     { label: 'Brouillon', color: '#e65100', bg: '#fff3e0' },
  published: { label: 'Publiée',   color: '#2e7d32', bg: '#e8f5e9' },
  closed:    { label: 'Fermée',    color: '#757575', bg: '#f5f5f5' },
};

const statusApp = {
  pending:  { label: 'En attente', color: '#f57c00', bg: '#fff8e1' },
  reviewing:{ label: 'En cours',   color: '#1976d2', bg: '#e3f2fd' },
  interview:{ label: 'Entretien',  color: '#7b1fa2', bg: '#f3e5f5' },
  offered:  { label: 'Offre',      color: '#0891b2', bg: '#ecfeff' },
  hired:    { label: 'Recruté',    color: '#2e7d32', bg: '#e8f5e9' },
  rejected: { label: 'Refusé',     color: '#c62828', bg: '#ffebee' },
};

/* ── Stat card ──────────────────────────────────────────────────── */
const StatCard = ({ title, value, subtitle, icon, color, loading, onClick }) => (
  <Card elevation={0} onClick={onClick}
    sx={{ border: '1px solid', borderColor: `${color}20`, borderRadius: 3, height: '100%',
      cursor: onClick ? 'pointer' : 'default', transition: 'all 0.2s',
      '&:hover': onClick ? { boxShadow: `0 6px 20px ${color}15`, borderColor: `${color}40`, transform: 'translateY(-2px)' } : {} }}>
    <CardContent sx={{ p: 2.5 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <Box>
          <Typography sx={{ fontSize: '0.78rem', color: '#64748b', fontWeight: 500, mb: 0.5 }}>{title}</Typography>
          {loading ? <Skeleton width={50} height={36} /> : (
            <Typography variant="h3" fontWeight={800} sx={{ color, lineHeight: 1 }}>{value ?? 0}</Typography>
          )}
          {subtitle && <Typography variant="caption" color="text.secondary" sx={{ mt: 0.4, display: 'block' }}>{subtitle}</Typography>}
        </Box>
        <Avatar sx={{ bgcolor: `${color}12`, width: 44, height: 44 }}>
          {React.cloneElement(icon, { sx: { color, fontSize: 20 } })}
        </Avatar>
      </Box>
    </CardContent>
  </Card>
);

/* ── Main ───────────────────────────────────────────────────────── */
const RecruitmentDashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const isAdmin = user?.role === 'administrator';

  const [jobOffers,    setJobOffers]    = useState([]);
  const [applications, setApplications] = useState([]);
  const [stats,        setStats]        = useState({});
  const [loading,      setLoading]      = useState(true);
  const [anchorEl,     setAnchorEl]     = useState(null);
  const [selectedOffer,setSelectedOffer]= useState(null);

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    setLoading(true);
    const [offersRes, appsRes, statsRes] = await Promise.allSettled([
      getJobOffers(),
      getApplications(),
      getRecruitmentStats(),
    ]);
    if (offersRes.status === 'fulfilled')
      setJobOffers(Array.isArray(offersRes.value.data) ? offersRes.value.data : offersRes.value.data?.results || []);
    if (appsRes.status === 'fulfilled')
      setApplications(Array.isArray(appsRes.value.data) ? appsRes.value.data : appsRes.value.data?.results || []);
    if (statsRes.status === 'fulfilled')
      setStats(statsRes.value.data || {});
    setLoading(false);
  };

  const handlePublish = async (id) => {
    await publishJobOffer(id).catch(() => {});
    fetchData();
    setAnchorEl(null);
  };

  const handleClose = async (id) => {
    await closeJobOffer(id).catch(() => {});
    fetchData();
    setAnchorEl(null);
  };

  const published  = jobOffers.filter(o => o.status === 'published').length;
  const drafts     = jobOffers.filter(o => o.status === 'draft').length;
  const pendingApps = applications.filter(a => a.status === 'pending').length;

  // pipeline stats
  const pipeline = ['pending','reviewing','interview','offered','hired','rejected']
    .map(s => ({ ...statusApp[s], key: s, count: applications.filter(a => a.status === s).length }));

  return (
    <Box sx={{ width: '100%' }}>

      {/* ── Banner ── */}
      <Card elevation={0} sx={{ borderRadius: 3, border: '1px solid #e8ecf0', mb: 3, overflow: 'hidden' }}>
        <Box sx={{ background: 'linear-gradient(135deg,#0f172a 0%,#1e3a5f 60%,#1e40af 100%)',
          px: 3, py: 2.5, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Button startIcon={<BackIcon />} onClick={() => navigate('/dashboard')} size="small"
              sx={{ color: 'rgba(255,255,255,0.7)', textTransform: 'none', borderRadius: 2,
                '&:hover': { bgcolor: 'rgba(255,255,255,0.1)', color: 'white' } }}>
              Retour
            </Button>
            <Box sx={{ p: 1.25, borderRadius: 2, bgcolor: 'rgba(255,255,255,0.12)', display: 'inline-flex' }}>
              <OfferIcon sx={{ fontSize: 22, color: 'white' }} />
            </Box>
            <Box>
              <Typography variant="h5" fontWeight={700} color="white">Recrutement</Typography>
              <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.65)', mt: 0.3 }}>
                {jobOffers.length} offre{jobOffers.length !== 1 ? 's' : ''} · {applications.length} candidature{applications.length !== 1 ? 's' : ''}
              </Typography>
            </Box>
          </Box>
          {!isAdmin && (
            <Box sx={{ display: 'flex', gap: 1.5 }}>
              <Button onClick={() => navigate('/recruitment/recommendations')} size="small"
                sx={{ color: 'rgba(255,255,255,0.8)', border: '1px solid rgba(255,255,255,0.25)',
                  borderRadius: 2, textTransform: 'none', fontWeight: 600,
                  '&:hover': { bgcolor: 'rgba(255,255,255,0.1)' } }}>
                <RecommendIcon sx={{ fontSize: 16, mr: 0.5 }} /> Recommandations
              </Button>
              <Button startIcon={<AddIcon />} onClick={() => navigate('/job-offers/create')}
                sx={{ bgcolor: 'rgba(255,255,255,0.15)', color: 'white',
                  border: '1px solid rgba(255,255,255,0.25)', borderRadius: 2,
                  textTransform: 'none', fontWeight: 600,
                  '&:hover': { bgcolor: 'rgba(255,255,255,0.25)' } }}>
                Nouvelle offre
              </Button>
            </Box>
          )}
        </Box>
      </Card>

      {/* ── KPI Cards ── */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={6} sm={3}>
          <StatCard title="Total offres" value={jobOffers.length} subtitle="Toutes statuts"
            icon={<WorkIcon />} color="#1976d2" loading={loading} onClick={() => navigate('/job-offers')} />
        </Grid>
        <Grid item xs={6} sm={3}>
          <StatCard title="Publiées" value={published} subtitle="En recrutement actif"
            icon={<TrendingIcon />} color="#2e7d32" loading={loading} onClick={() => navigate('/job-offers')} />
        </Grid>
        <Grid item xs={6} sm={3}>
          <StatCard title="Candidatures" value={applications.length} subtitle="Total reçues"
            icon={<PeopleIcon />} color="#7b1fa2" loading={loading} onClick={() => navigate('/recruitment/applications')} />
        </Grid>
        <Grid item xs={6} sm={3}>
          <StatCard title="En attente" value={pendingApps} subtitle="À traiter"
            icon={<PendingIcon />} color={pendingApps > 0 ? '#f57c00' : '#64748b'} loading={loading}
            onClick={() => navigate('/recruitment/applications')} />
        </Grid>
      </Grid>

      <Grid container spacing={3}>

        {/* ── Offres récentes ── */}
        <Grid item xs={12} lg={7}>
          <Card elevation={0} sx={{ borderRadius: 3, border: '1px solid #e8ecf0', overflow: 'hidden', height: '100%' }}>
            <Box sx={{ background: 'linear-gradient(135deg,#0f172a,#1e3a5f,#1e40af)',
              px: 2.5, py: 1.75, display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.12)', width: 30, height: 30, borderRadius: 1.5 }}>
                <WorkIcon sx={{ fontSize: 15, color: 'white' }} />
              </Avatar>
              <Typography sx={{ color: 'white', fontWeight: 700, fontSize: '0.9rem', flex: 1 }}>
                Offres d'emploi récentes
              </Typography>
              {!isAdmin && (
                <Chip label={`${drafts} brouillon${drafts !== 1 ? 's' : ''}`} size="small"
                  sx={{ bgcolor: 'rgba(255,255,255,0.12)', color: 'rgba(255,255,255,0.8)', height: 20, fontSize: '0.68rem' }} />
              )}
              <Button size="small" endIcon={<ArrowIcon sx={{ fontSize: 13 }} />}
                onClick={() => navigate('/job-offers')}
                sx={{ color: 'rgba(255,255,255,0.65)', textTransform: 'none', fontSize: '0.75rem',
                  '&:hover': { color: 'white' }, minWidth: 0 }}>
                Voir tout
              </Button>
            </Box>

            <CardContent sx={{ p: 0 }}>
              {loading ? (
                <Box sx={{ p: 2 }}>{[1,2,3,4].map(i => <Skeleton key={i} height={56} sx={{ mb: 0.5, borderRadius: 2 }} />)}</Box>
              ) : jobOffers.length === 0 ? (
                <Box sx={{ textAlign: 'center', py: 6 }}>
                  <WorkIcon sx={{ fontSize: 44, color: '#cbd5e1', mb: 1 }} />
                  <Typography variant="body2" color="text.secondary">Aucune offre d'emploi</Typography>
                  {!isAdmin && (
                    <Button startIcon={<AddIcon />} onClick={() => navigate('/job-offers/create')}
                      sx={{ mt: 1.5, textTransform: 'none', fontWeight: 600 }}>
                      Créer une offre
                    </Button>
                  )}
                </Box>
              ) : (
                jobOffers.slice(0, 6).map((offer, i) => {
                  const sc = statusOffer[offer.status] || statusOffer.draft;
                  return (
                    <React.Fragment key={offer.id}>
                      <Box sx={{ px: 2.5, py: 1.5, display: 'flex', alignItems: 'center', gap: 2,
                        cursor: 'pointer', transition: 'background 0.15s',
                        '&:hover': { bgcolor: '#f8fafc' } }}
                        onClick={() => navigate(`/recruitment/job-offers/${offer.id}`)}>

                        <Avatar sx={{ bgcolor: `${sc.color}15`, width: 38, height: 38, borderRadius: 2, flexShrink: 0 }}>
                          <WorkIcon sx={{ color: sc.color, fontSize: 18 }} />
                        </Avatar>

                        <Box sx={{ flex: 1, minWidth: 0 }}>
                          <Typography sx={{ fontSize: '0.875rem', fontWeight: 600, color: '#1e293b' }} noWrap>
                            {offer.title}
                          </Typography>
                          <Box sx={{ display: 'flex', gap: 1, mt: 0.3, alignItems: 'center' }}>
                            {offer.department && (
                              <Typography variant="caption" color="text.secondary">{offer.department}</Typography>
                            )}
                            <Typography variant="caption" sx={{ color: '#94a3b8' }}>·</Typography>
                            <Typography variant="caption" color="text.secondary">
                              {offer.applications_count ?? 0} candidature{(offer.applications_count ?? 0) !== 1 ? 's' : ''}
                            </Typography>
                            {offer.created_at && (
                              <>
                                <Typography variant="caption" sx={{ color: '#94a3b8' }}>·</Typography>
                                <Typography variant="caption" color="text.secondary">
                                  {format(new Date(offer.created_at), 'dd MMM', { locale: fr })}
                                </Typography>
                              </>
                            )}
                          </Box>
                        </Box>

                        <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', flexShrink: 0 }}>
                          <Chip label={sc.label} size="small"
                            sx={{ bgcolor: sc.bg, color: sc.color, fontWeight: 700, fontSize: '0.68rem', height: 20 }} />
                          {!isAdmin && (
                            <IconButton size="small" onClick={(e) => { e.stopPropagation(); setAnchorEl(e.currentTarget); setSelectedOffer(offer); }}
                              sx={{ color: '#94a3b8', width: 28, height: 28, '&:hover': { bgcolor: '#f1f5f9' } }}>
                              <MoreVertIcon sx={{ fontSize: 16 }} />
                            </IconButton>
                          )}
                        </Box>
                      </Box>
                      {i < Math.min(jobOffers.length, 6) - 1 && <Divider />}
                    </React.Fragment>
                  );
                })
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* ── Colonne droite ── */}
        <Grid item xs={12} lg={5}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, height: '100%' }}>

            {/* Pipeline candidatures */}
            <Card elevation={0} sx={{ borderRadius: 3, border: '1px solid #e8ecf0', overflow: 'hidden' }}>
              <Box sx={{ background: 'linear-gradient(135deg,#0f172a,#1e3a5f,#1e40af)',
                px: 2.5, py: 1.75, display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.12)', width: 30, height: 30, borderRadius: 1.5 }}>
                  <TrendingIcon sx={{ fontSize: 15, color: 'white' }} />
                </Avatar>
                <Typography sx={{ color: 'white', fontWeight: 700, fontSize: '0.9rem', flex: 1 }}>
                  Pipeline candidatures
                </Typography>
                <Button size="small" endIcon={<ArrowIcon sx={{ fontSize: 13 }} />}
                  onClick={() => navigate('/recruitment/applications')}
                  sx={{ color: 'rgba(255,255,255,0.65)', textTransform: 'none', fontSize: '0.75rem',
                    '&:hover': { color: 'white' } }}>
                  Voir tout
                </Button>
              </Box>
              <CardContent sx={{ p: 2 }}>
                {loading ? (
                  <Box>{[1,2,3].map(i => <Skeleton key={i} height={36} sx={{ mb: 0.5, borderRadius: 2 }} />)}</Box>
                ) : (
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                    {pipeline.filter(p => p.count > 0 || ['pending','interview','hired'].includes(p.key)).map(p => (
                      <Box key={p.key} sx={{ display: 'flex', alignItems: 'center', gap: 1.5,
                        p: 1, borderRadius: 2, bgcolor: p.count > 0 ? p.bg : '#f8fafc',
                        border: `1px solid ${p.count > 0 ? `${p.color}20` : '#f1f5f9'}`,
                        transition: 'all 0.15s' }}>
                        <Box sx={{ width: 8, height: 8, borderRadius: '50%',
                          bgcolor: p.count > 0 ? p.color : '#cbd5e1', flexShrink: 0 }} />
                        <Typography sx={{ flex: 1, fontSize: '0.8rem', fontWeight: p.count > 0 ? 600 : 400,
                          color: p.count > 0 ? '#1e293b' : '#94a3b8' }}>
                          {p.label}
                        </Typography>
                        <Typography sx={{ fontSize: '0.85rem', fontWeight: 700,
                          color: p.count > 0 ? p.color : '#cbd5e1' }}>
                          {p.count}
                        </Typography>
                      </Box>
                    ))}
                  </Box>
                )}
              </CardContent>
            </Card>

            {/* Candidatures récentes */}
            <Card elevation={0} sx={{ borderRadius: 3, border: '1px solid #e8ecf0', overflow: 'hidden', flex: 1 }}>
              <Box sx={{ background: 'linear-gradient(135deg,#0f172a,#1e3a5f,#1e40af)',
                px: 2.5, py: 1.75, display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.12)', width: 30, height: 30, borderRadius: 1.5 }}>
                  <PeopleIcon sx={{ fontSize: 15, color: 'white' }} />
                </Avatar>
                <Typography sx={{ color: 'white', fontWeight: 700, fontSize: '0.9rem', flex: 1 }}>
                  Candidatures récentes
                </Typography>
              </Box>
              <CardContent sx={{ p: 0 }}>
                {loading ? (
                  <Box sx={{ p: 2 }}>{[1,2,3].map(i => <Skeleton key={i} height={52} sx={{ mb: 0.5, borderRadius: 2 }} />)}</Box>
                ) : applications.length === 0 ? (
                  <Box sx={{ textAlign: 'center', py: 4 }}>
                    <PeopleIcon sx={{ fontSize: 36, color: '#cbd5e1', mb: 0.5 }} />
                    <Typography variant="caption" color="text.secondary" display="block">
                      Aucune candidature reçue
                    </Typography>
                  </Box>
                ) : (
                  applications.slice(0, 5).map((app, i) => {
                    const sc = statusApp[app.status] || statusApp.pending;
                    const name = `${app.first_name || ''} ${app.last_name || ''}`.trim() || app.applicant_name || '—';
                    return (
                      <React.Fragment key={app.id}>
                        <Box sx={{ px: 2, py: 1.25, display: 'flex', alignItems: 'center', gap: 1.5,
                          cursor: 'pointer', '&:hover': { bgcolor: '#f8fafc' } }}
                          onClick={() => navigate(`/recruitment/applications/${app.id}`)}>
                          <Avatar sx={{ bgcolor: avatarColor(name), width: 32, height: 32, fontSize: '0.75rem', fontWeight: 700, flexShrink: 0 }}>
                            {name[0]?.toUpperCase() || '?'}
                          </Avatar>
                          <Box sx={{ flex: 1, minWidth: 0 }}>
                            <Typography sx={{ fontSize: '0.82rem', fontWeight: 600, color: '#1e293b' }} noWrap>{name}</Typography>
                            <Typography variant="caption" color="text.secondary" noWrap>
                              {app.job_offer_title || app.job_offer?.title || '—'}
                            </Typography>
                          </Box>
                          <Chip label={sc.label} size="small"
                            sx={{ bgcolor: sc.bg, color: sc.color, fontWeight: 700, fontSize: '0.65rem', height: 18 }} />
                        </Box>
                        {i < Math.min(applications.length, 5) - 1 && <Divider />}
                      </React.Fragment>
                    );
                  })
                )}
              </CardContent>
            </Card>
          </Box>
        </Grid>
      </Grid>

      {/* ── Context menu ── */}
      <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={() => setAnchorEl(null)}
        PaperProps={{ elevation: 0, sx: { border: '1px solid #e8ecf0', borderRadius: 2, minWidth: 170 } }}>
        <MenuItem onClick={() => { navigate(`/recruitment/job-offers/${selectedOffer?.id}`); setAnchorEl(null); }}
          sx={{ fontSize: '0.875rem', gap: 1.5 }}>
          <ViewIcon sx={{ fontSize: 17, color: '#1976d2' }} /> Voir les détails
        </MenuItem>
        <MenuItem onClick={() => { navigate(`/job-offers/${selectedOffer?.id}/edit`); setAnchorEl(null); }}
          sx={{ fontSize: '0.875rem', gap: 1.5 }}>
          <EditIcon sx={{ fontSize: 17, color: '#475569' }} /> Modifier
        </MenuItem>
        {selectedOffer?.status === 'draft' && (
          <MenuItem onClick={() => handlePublish(selectedOffer.id)}
            sx={{ fontSize: '0.875rem', gap: 1.5, color: '#2e7d32' }}>
            <PublishIcon sx={{ fontSize: 17 }} /> Publier
          </MenuItem>
        )}
        {selectedOffer?.status === 'published' && (
          <MenuItem onClick={() => handleClose(selectedOffer.id)}
            sx={{ fontSize: '0.875rem', gap: 1.5, color: '#c62828' }}>
            <CloseIcon sx={{ fontSize: 17 }} /> Fermer l'offre
          </MenuItem>
        )}
      </Menu>
    </Box>
  );
};

export default RecruitmentDashboard;
