import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box, Card, CardContent, Typography, Grid, Avatar, Chip,
  Button, Skeleton, Divider, Tooltip, IconButton, Alert, Snackbar,
} from '@mui/material';
import {
  People as PeopleIcon,
  School as TrainingIcon,
  Event as EventIcon,
  Lightbulb as SuggestionIcon,
  CalendarToday as CalendarIcon,
  CheckCircle as ApproveIcon,
  Cancel as RejectIcon,
  ArrowForward as ArrowIcon,
  BarChart as KpiIcon,
  Assignment as RequestIcon,
  Work as WorkIcon,
  Celebration as CelebrationIcon,
  Reply as ReplyIcon,
  Warning as WarningIcon,
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';
import {
  getTrainings, approveTraining, rejectTraining,
  getEvents, approveEvent, rejectEvent,
  getExpiringContracts,
} from '../services/hrService';
import { getSuggestions, respondToSuggestion } from '../services/cultureService';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

const COLORS = ['#1976d2','#388e3c','#d32f2f','#7b1fa2','#f57c00','#0097a7'];
const avatarColor = (n = '') => COLORS[(n.charCodeAt(0) || 0) % COLORS.length];

/* ── Stat card ── */
const StatCard = ({ title, value, subtitle, icon, color, loading, onClick }) => (
  <Card elevation={0} onClick={onClick}
    sx={{ border: '1px solid', borderColor: `${color}22`, borderRadius: 3,
      cursor: onClick ? 'pointer' : 'default', transition: 'all 0.2s',
      '&:hover': onClick ? { boxShadow: `0 6px 20px ${color}18`, borderColor: `${color}44`, transform: 'translateY(-2px)' } : {} }}>
    <CardContent sx={{ p: 2.5 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <Box>
          <Typography sx={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 500, mb: 0.5 }}>{title}</Typography>
          {loading ? <Skeleton width={50} height={38} /> : (
            <Typography variant="h3" fontWeight={800} sx={{ color, lineHeight: 1.1 }}>{value ?? 0}</Typography>
          )}
          {subtitle && <Typography variant="caption" color="text.secondary" sx={{ mt: 0.4, display: 'block' }}>{subtitle}</Typography>}
        </Box>
        <Avatar sx={{ bgcolor: `${color}12`, width: 46, height: 46 }}>
          {React.cloneElement(icon, { sx: { color, fontSize: 22 } })}
        </Avatar>
      </Box>
    </CardContent>
  </Card>
);

/* ── Section header ── */
const NavHeader = ({ title, icon, count, action }) => (
  <Box sx={{ background: 'linear-gradient(135deg,#0f172a,#1e3a5f,#1e40af)',
    px: 2.5, py: 1.75, display: 'flex', alignItems: 'center', gap: 1.5 }}>
    <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.12)', width: 30, height: 30, borderRadius: 1.5 }}>
      {React.cloneElement(icon, { sx: { fontSize: 15, color: 'white' } })}
    </Avatar>
    <Typography sx={{ color: 'white', fontWeight: 700, fontSize: '0.9rem', flex: 1 }}>{title}</Typography>
    {count !== undefined && count > 0 && (
      <Chip label={count} size="small"
        sx={{ bgcolor: 'rgba(255,255,255,0.15)', color: 'white', fontWeight: 700, height: 20, fontSize: '0.7rem' }} />
    )}
    {action}
  </Box>
);

export default function HRDirectorDashboard() {
  const { user } = useAuth();
  const navigate  = useNavigate();

  const [stats,        setStats]        = useState({});
  const [trainings,    setTrainings]    = useState([]);
  const [events,       setEvents]       = useState([]);
  const [suggestions,  setSuggestions]  = useState([]);
  const [newEmployees, setNewEmployees] = useState([]);
  const [expiring,     setExpiring]     = useState([]);
  const [loadingStats, setLoadingStats] = useState(true);
  const [loadingAct,   setLoadingAct]   = useState(true);
  const [actionLoading,setActionLoading]= useState({});
  const [snack,        setSnack]        = useState({ open: false, msg: '', severity: 'success' });

  useEffect(() => { load(); }, []);

  const load = async () => {
    setLoadingStats(true);
    setLoadingAct(true);

    // Stats générales
    const [statsRes, empRes] = await Promise.allSettled([
      api.get('/dashboard/stats/'),
      api.get('/dashboard/employee-data/'),
    ]);
    if (statsRes.status === 'fulfilled') setStats(statsRes.value.data);
    if (empRes.status  === 'fulfilled') setNewEmployees(empRes.value.data.new_employees_today ?? []);
    setLoadingStats(false);

    // Données actionnables
    const [trainRes, evtRes, sugRes, expRes] = await Promise.allSettled([
      getTrainings(),
      getEvents(),
      getSuggestions(),
      getExpiringContracts(),
    ]);
    if (trainRes.status === 'fulfilled')
      setTrainings((trainRes.value.data?.results || trainRes.value.data || []).filter(t => t.status === 'pending'));
    if (evtRes.status === 'fulfilled')
      setEvents((evtRes.value.data?.results || evtRes.value.data || []).filter(e => e.status === 'pending').slice(0, 5));
    if (sugRes.status === 'fulfilled')
      setSuggestions((sugRes.value.data?.results || sugRes.value.data || []).filter(s => s.status === 'new').slice(0, 4));
    if (expRes.status === 'fulfilled')
      setExpiring((expRes.value.data || []).slice(0, 4));
    setLoadingAct(false);
  };

  const act = async (key, fn, successMsg) => {
    setActionLoading(p => ({ ...p, [key]: true }));
    try {
      await fn();
      setSnack({ open: true, msg: successMsg, severity: 'success' });
      load();
    } catch (_) {
      setSnack({ open: true, msg: 'Erreur lors de l\'action', severity: 'error' });
    } finally { setActionLoading(p => ({ ...p, [key]: false })); }
  };

  const today = format(new Date(), "EEEE d MMMM yyyy", { locale: fr });
  const progressColor = (p) => p >= 7 ? '#c62828' : p >= 5 ? '#f57c00' : '#2e7d32';

  return (
    <Box sx={{ width: '100%' }}>

      {/* ── Banner ── */}
      <Card elevation={0} sx={{ mb: 3, borderRadius: 3, overflow: 'hidden',
        background: 'linear-gradient(135deg,#0f172a 0%,#1e3a5f 60%,#1e40af 100%)', color: 'white', position: 'relative' }}>
        <Box sx={{ position: 'absolute', top: -40, right: -40, width: 200, height: 200,
          borderRadius: '50%', bgcolor: 'rgba(255,255,255,0.04)', pointerEvents: 'none' }} />
        <CardContent sx={{ p: 3, position: 'relative' }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
            <Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                <CalendarIcon sx={{ fontSize: 14, opacity: 0.7 }} />
                <Typography variant="caption" sx={{ opacity: 0.7, textTransform: 'capitalize' }}>{today}</Typography>
              </Box>
              <Typography variant="h5" fontWeight={700} sx={{ mb: 0.25 }}>
                Bonjour, {user?.first_name || user?.username} 👋
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.7 }}>Tableau de bord — Directeur RH</Typography>
            </Box>
            <Box sx={{ display: 'flex', gap: 1.5 }}>
              <Button onClick={() => navigate('/kpi-dashboard')} startIcon={<KpiIcon sx={{ fontSize: 16 }} />} size="small"
                sx={{ color: 'rgba(255,255,255,0.85)', border: '1px solid rgba(255,255,255,0.3)',
                  borderRadius: 2, textTransform: 'none', fontWeight: 600,
                  '&:hover': { bgcolor: 'rgba(255,255,255,0.1)' } }}>
                KPIs & Analyses
              </Button>
              <Chip icon={<ApproveIcon sx={{ color: 'white !important', fontSize: 14 }} />}
                label="Système opérationnel"
                sx={{ bgcolor: 'rgba(76,175,80,0.25)', color: 'white',
                  border: '1px solid rgba(76,175,80,0.45)', fontWeight: 600 }} />
            </Box>
          </Box>
        </CardContent>
      </Card>

      {/* ── KPI Cards ── */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={6} sm={3}>
          <StatCard title="Employés actifs" value={stats.total_employees ?? 0}
            subtitle="Tous départements" icon={<PeopleIcon />} color="#1976d2"
            loading={loadingStats} onClick={() => navigate('/employees')} />
        </Grid>
        <Grid item xs={6} sm={3}>
          <StatCard title="Formations à approuver" value={trainings.length}
            subtitle="En attente" icon={<TrainingIcon />}
            color={trainings.length > 0 ? '#f57c00' : '#64748b'}
            loading={loadingAct} onClick={() => navigate('/manage-trainings')} />
        </Grid>
        <Grid item xs={6} sm={3}>
          <StatCard title="Événements à approuver" value={events.length}
            subtitle="En attente" icon={<EventIcon />}
            color={events.length > 0 ? '#7b1fa2' : '#64748b'}
            loading={loadingAct} onClick={() => navigate('/events')} />
        </Grid>
        <Grid item xs={6} sm={3}>
          <StatCard title="Suggestions sans réponse" value={suggestions.length}
            subtitle="En attente" icon={<SuggestionIcon />}
            color={suggestions.length > 0 ? '#0288d1' : '#64748b'}
            loading={loadingAct} onClick={() => navigate('/culture/suggestions')} />
        </Grid>
      </Grid>

      <Grid container spacing={3}>

        {/* ── Col gauche : formations + événements ── */}
        <Grid item xs={12} lg={7}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>

            {/* Formations en attente */}
            <Card elevation={0} sx={{ borderRadius: 3, border: '1px solid #e8ecf0', overflow: 'hidden' }}>
              <NavHeader title="Formations à approuver" icon={<TrainingIcon />}
                count={trainings.length}
                action={
                  <Button size="small" endIcon={<ArrowIcon sx={{ fontSize: 13 }} />}
                    onClick={() => navigate('/manage-trainings')}
                    sx={{ color: 'rgba(255,255,255,0.7)', textTransform: 'none', fontSize: '0.75rem',
                      '&:hover': { color: 'white' } }}>
                    Toutes
                  </Button>
                } />
              <CardContent sx={{ p: 0 }}>
                {loadingAct ? (
                  <Box sx={{ p: 2 }}>{[1,2].map(i => <Skeleton key={i} height={56} sx={{ mb: 0.5, borderRadius: 2 }} />)}</Box>
                ) : trainings.length === 0 ? (
                  <Box sx={{ textAlign: 'center', py: 4 }}>
                    <ApproveIcon sx={{ fontSize: 36, color: '#2e7d32', opacity: 0.4, mb: 0.5 }} />
                    <Typography variant="caption" color="text.secondary" display="block">
                      Aucune formation en attente
                    </Typography>
                  </Box>
                ) : (
                  trainings.slice(0, 4).map((t, i) => (
                    <React.Fragment key={t.id}>
                      <Box sx={{ px: 2.5, py: 1.5, display: 'flex', alignItems: 'center', gap: 2,
                        '&:hover': { bgcolor: '#f8fafc' } }}>
                        <Avatar sx={{ bgcolor: '#f57c0015', width: 36, height: 36, borderRadius: 1.5 }}>
                          <TrainingIcon sx={{ color: '#f57c00', fontSize: 16 }} />
                        </Avatar>
                        <Box sx={{ flex: 1, minWidth: 0 }}>
                          <Typography sx={{ fontSize: '0.85rem', fontWeight: 600, color: '#1e293b' }} noWrap>
                            {t.name}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {t.created_by_name} · {t.employees_count ?? t.employees?.length ?? 0} participant(s)
                            {t.start_date && ` · ${format(new Date(t.start_date), 'dd MMM', { locale: fr })}`}
                          </Typography>
                        </Box>
                        <Box sx={{ display: 'flex', gap: 0.75, flexShrink: 0 }}>
                          <Tooltip title="Approuver">
                            <IconButton size="small" disabled={!!actionLoading[`t-${t.id}`]}
                              onClick={() => act(`t-${t.id}`, () => approveTraining(t.id), 'Formation approuvée')}
                              sx={{ bgcolor: '#e8f5e9', color: '#2e7d32', borderRadius: 1.5, width: 30, height: 30,
                                '&:hover': { bgcolor: '#c8e6c9' }, '&:disabled': { opacity: 0.4 } }}>
                              <ApproveIcon sx={{ fontSize: 15 }} />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Rejeter">
                            <IconButton size="small" disabled={!!actionLoading[`t-${t.id}`]}
                              onClick={() => act(`t-${t.id}`, () => rejectTraining(t.id), 'Formation rejetée')}
                              sx={{ bgcolor: '#ffebee', color: '#c62828', borderRadius: 1.5, width: 30, height: 30,
                                '&:hover': { bgcolor: '#ffcdd2' }, '&:disabled': { opacity: 0.4 } }}>
                              <RejectIcon sx={{ fontSize: 15 }} />
                            </IconButton>
                          </Tooltip>
                        </Box>
                      </Box>
                      {i < Math.min(trainings.length, 4) - 1 && <Divider />}
                    </React.Fragment>
                  ))
                )}
              </CardContent>
            </Card>

            {/* Événements en attente */}
            <Card elevation={0} sx={{ borderRadius: 3, border: '1px solid #e8ecf0', overflow: 'hidden' }}>
              <NavHeader title="Événements à approuver" icon={<EventIcon />}
                count={events.length}
                action={
                  <Button size="small" endIcon={<ArrowIcon sx={{ fontSize: 13 }} />}
                    onClick={() => navigate('/events')}
                    sx={{ color: 'rgba(255,255,255,0.7)', textTransform: 'none', fontSize: '0.75rem',
                      '&:hover': { color: 'white' } }}>
                    Tous
                  </Button>
                } />
              <CardContent sx={{ p: 0 }}>
                {loadingAct ? (
                  <Box sx={{ p: 2 }}>{[1,2].map(i => <Skeleton key={i} height={56} sx={{ mb: 0.5, borderRadius: 2 }} />)}</Box>
                ) : events.length === 0 ? (
                  <Box sx={{ textAlign: 'center', py: 4 }}>
                    <ApproveIcon sx={{ fontSize: 36, color: '#2e7d32', opacity: 0.4, mb: 0.5 }} />
                    <Typography variant="caption" color="text.secondary" display="block">
                      Aucun événement en attente
                    </Typography>
                  </Box>
                ) : (
                  events.map((ev, i) => (
                    <React.Fragment key={ev.id}>
                      <Box sx={{ px: 2.5, py: 1.5, display: 'flex', alignItems: 'center', gap: 2,
                        '&:hover': { bgcolor: '#f8fafc' } }}>
                        <Avatar sx={{ bgcolor: '#7b1fa215', width: 36, height: 36, borderRadius: 1.5 }}>
                          <EventIcon sx={{ color: '#7b1fa2', fontSize: 16 }} />
                        </Avatar>
                        <Box sx={{ flex: 1, minWidth: 0 }}>
                          <Typography sx={{ fontSize: '0.85rem', fontWeight: 600, color: '#1e293b' }} noWrap>
                            {ev.name || ev.title}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {ev.created_by_name || ev.created_by?.first_name}
                            {ev.date && ` · ${format(new Date(ev.date), 'dd MMM yyyy', { locale: fr })}`}
                            {ev.location && ` · ${ev.location}`}
                          </Typography>
                        </Box>
                        <Box sx={{ display: 'flex', gap: 0.75, flexShrink: 0 }}>
                          <Tooltip title="Approuver">
                            <IconButton size="small" disabled={!!actionLoading[`e-${ev.id}`]}
                              onClick={() => act(`e-${ev.id}`, () => approveEvent(ev.id), 'Événement approuvé')}
                              sx={{ bgcolor: '#e8f5e9', color: '#2e7d32', borderRadius: 1.5, width: 30, height: 30,
                                '&:hover': { bgcolor: '#c8e6c9' }, '&:disabled': { opacity: 0.4 } }}>
                              <ApproveIcon sx={{ fontSize: 15 }} />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Rejeter">
                            <IconButton size="small" disabled={!!actionLoading[`e-${ev.id}`]}
                              onClick={() => act(`e-${ev.id}`, () => rejectEvent(ev.id), 'Événement rejeté')}
                              sx={{ bgcolor: '#ffebee', color: '#c62828', borderRadius: 1.5, width: 30, height: 30,
                                '&:hover': { bgcolor: '#ffcdd2' }, '&:disabled': { opacity: 0.4 } }}>
                              <RejectIcon sx={{ fontSize: 15 }} />
                            </IconButton>
                          </Tooltip>
                        </Box>
                      </Box>
                      {i < events.length - 1 && <Divider />}
                    </React.Fragment>
                  ))
                )}
              </CardContent>
            </Card>

          </Box>
        </Grid>

        {/* ── Col droite ── */}
        <Grid item xs={12} lg={5}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>

            {/* Suggestions sans réponse */}
            <Card elevation={0} sx={{ borderRadius: 3, border: '1px solid #e8ecf0', overflow: 'hidden' }}>
              <NavHeader title="Suggestions à répondre" icon={<SuggestionIcon />}
                count={suggestions.length}
                action={
                  <Button size="small" endIcon={<ArrowIcon sx={{ fontSize: 13 }} />}
                    onClick={() => navigate('/culture/suggestions')}
                    sx={{ color: 'rgba(255,255,255,0.7)', textTransform: 'none', fontSize: '0.75rem',
                      '&:hover': { color: 'white' } }}>
                    Toutes
                  </Button>
                } />
              <CardContent sx={{ p: 0 }}>
                {loadingAct ? (
                  <Box sx={{ p: 2 }}>{[1,2].map(i => <Skeleton key={i} height={52} sx={{ mb: 0.5, borderRadius: 2 }} />)}</Box>
                ) : suggestions.length === 0 ? (
                  <Box sx={{ textAlign: 'center', py: 3.5 }}>
                    <ApproveIcon sx={{ fontSize: 32, color: '#2e7d32', opacity: 0.4, mb: 0.5 }} />
                    <Typography variant="caption" color="text.secondary" display="block">
                      Aucune suggestion en attente
                    </Typography>
                  </Box>
                ) : (
                  suggestions.map((sug, i) => {
                    const name = sug.employee_name || '—';
                    return (
                      <React.Fragment key={sug.id}>
                        <Box sx={{ px: 2, py: 1.25, display: 'flex', alignItems: 'center', gap: 1.5,
                          '&:hover': { bgcolor: '#f8fafc' } }}>
                          <Avatar sx={{ bgcolor: avatarColor(name), width: 32, height: 32,
                            fontSize: '0.75rem', fontWeight: 700, flexShrink: 0 }}>
                            {name[0]?.toUpperCase() || '?'}
                          </Avatar>
                          <Box sx={{ flex: 1, minWidth: 0 }}>
                            <Typography sx={{ fontSize: '0.82rem', fontWeight: 600, color: '#1e293b' }} noWrap>
                              {sug.title}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">{name}</Typography>
                          </Box>
                          <Tooltip title="Répondre">
                            <IconButton size="small"
                              onClick={() => navigate('/culture/suggestions')}
                              sx={{ bgcolor: '#e1f5fe', color: '#0288d1', borderRadius: 1.5, width: 28, height: 28,
                                '&:hover': { bgcolor: '#b3e5fc' } }}>
                              <ReplyIcon sx={{ fontSize: 13 }} />
                            </IconButton>
                          </Tooltip>
                        </Box>
                        {i < suggestions.length - 1 && <Divider />}
                      </React.Fragment>
                    );
                  })
                )}
              </CardContent>
            </Card>

            {/* Contrats expirants */}
            <Card elevation={0} sx={{ borderRadius: 3, border: '1px solid #e8ecf0', overflow: 'hidden' }}>
              <NavHeader title="Contrats expirants bientôt" icon={<WarningIcon />}
                action={
                  <Button size="small" endIcon={<ArrowIcon sx={{ fontSize: 13 }} />}
                    onClick={() => navigate('/contracts')}
                    sx={{ color: 'rgba(255,255,255,0.7)', textTransform: 'none', fontSize: '0.75rem',
                      '&:hover': { color: 'white' } }}>
                    Voir
                  </Button>
                } />
              <CardContent sx={{ p: 0 }}>
                {loadingAct ? (
                  <Box sx={{ p: 2 }}>{[1,2].map(i => <Skeleton key={i} height={48} sx={{ mb: 0.5, borderRadius: 2 }} />)}</Box>
                ) : expiring.length === 0 ? (
                  <Box sx={{ textAlign: 'center', py: 3 }}>
                    <ApproveIcon sx={{ fontSize: 28, color: '#2e7d32', opacity: 0.4, mb: 0.5 }} />
                    <Typography variant="caption" color="text.secondary" display="block">
                      Aucun contrat expirant prochainement
                    </Typography>
                  </Box>
                ) : expiring.map((c, i) => {
                  const days = c.date_fin
                    ? Math.ceil((new Date(c.date_fin) - new Date()) / 86400000) : null;
                  const urgency = days !== null && days <= 7 ? '#c62828' : days !== null && days <= 14 ? '#f57c00' : '#64748b';
                  return (
                    <React.Fragment key={c.id}>
                      <Box sx={{ px: 2, py: 1.25, display: 'flex', alignItems: 'center', gap: 1.5,
                        '&:hover': { bgcolor: '#f8fafc' } }}>
                        <Avatar sx={{ bgcolor: `${urgency}12`, width: 30, height: 30, borderRadius: 1.5 }}>
                          <RequestIcon sx={{ fontSize: 14, color: urgency }} />
                        </Avatar>
                        <Box sx={{ flex: 1, minWidth: 0 }}>
                          <Typography sx={{ fontSize: '0.8rem', fontWeight: 600, color: '#1e293b' }} noWrap>
                            {c.employee_name || '—'}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {c.type} · {c.date_fin ? format(new Date(c.date_fin), 'dd MMM yyyy', { locale: fr }) : '—'}
                          </Typography>
                        </Box>
                        {days !== null && (
                          <Chip label={`J-${days}`} size="small"
                            sx={{ bgcolor: `${urgency}12`, color: urgency, fontWeight: 700, fontSize: '0.65rem', height: 20 }} />
                        )}
                      </Box>
                      {i < expiring.length - 1 && <Divider />}
                    </React.Fragment>
                  );
                })}
              </CardContent>
            </Card>

            {/* Nouveaux employés */}
            {newEmployees.length > 0 && (
              <Card elevation={0} sx={{ borderRadius: 3, border: '1px solid #e8ecf0', overflow: 'hidden' }}>
                <NavHeader title="Nouveaux aujourd'hui" icon={<CelebrationIcon />}
                  count={newEmployees.length} />
                <CardContent sx={{ p: 1.5, display: 'flex', flexDirection: 'column', gap: 0.75 }}>
                  {newEmployees.map((emp, i) => {
                    const name = `${emp.user_data?.first_name || ''} ${emp.user_data?.last_name || ''}`.trim();
                    return (
                      <Box key={i} onClick={() => emp.id && navigate(`/employees/${emp.id}`)}
                        sx={{ display: 'flex', alignItems: 'center', gap: 1.5, p: 1, borderRadius: 2,
                          bgcolor: '#f8fafc', border: '1px solid #f1f5f9', cursor: 'pointer',
                          '&:hover': { bgcolor: '#eff6ff', borderColor: '#bfdbfe' } }}>
                        <Avatar sx={{ bgcolor: avatarColor(name), width: 30, height: 30, fontSize: '0.72rem', fontWeight: 700 }}>
                          {name[0]?.toUpperCase() || '?'}
                        </Avatar>
                        <Box sx={{ flex: 1, minWidth: 0 }}>
                          <Typography sx={{ fontSize: '0.8rem', fontWeight: 600, color: '#1e293b' }} noWrap>{name}</Typography>
                          <Typography variant="caption" color="text.secondary" noWrap>
                            {emp.poste || 'Poste non défini'}
                          </Typography>
                        </Box>
                        <CelebrationIcon sx={{ fontSize: 14, color: '#ffc107' }} />
                      </Box>
                    );
                  })}
                </CardContent>
              </Card>
            )}

          </Box>
        </Grid>
      </Grid>

      {/* ── Accès rapide ── */}
      <Card elevation={0} sx={{ mt: 3, borderRadius: 3, border: '1px solid #e8ecf0', overflow: 'hidden' }}>
        <NavHeader title="Accès rapide" icon={<ArrowIcon />} />
        <CardContent sx={{ p: 2 }}>
          <Grid container spacing={1.5}>
            {[
              { label: 'KPIs & Analyses',     icon: <KpiIcon />,      color: '#ab47bc', bg: '#f3e5f5', path: '/kpi-dashboard' },
              { label: 'Gérer les demandes',   icon: <RequestIcon />,  color: '#f57c00', bg: '#fff7ed', path: '/manage-requests' },
              { label: 'Offres d\'emploi',     icon: <WorkIcon />,     color: '#1976d2', bg: '#eff6ff', path: '/job-offers' },
              { label: 'Gestion formations',   icon: <TrainingIcon />, color: '#2e7d32', bg: '#f0fdf4', path: '/manage-trainings' },
              { label: 'Événements',           icon: <EventIcon />,    color: '#7b1fa2', bg: '#fdf4ff', path: '/events' },
              { label: 'Suggestions',          icon: <SuggestionIcon />,color:'#0288d1', bg: '#e1f5fe', path: '/culture/suggestions' },
            ].map((link, i) => (
              <Grid item xs={6} sm={4} md={2} key={i}>
                <Box onClick={() => navigate(link.path)}
                  sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1, p: 1.75,
                    borderRadius: 2, border: '1px solid #e8ecf0', bgcolor: '#f8fafc', cursor: 'pointer',
                    transition: 'all 0.18s',
                    '&:hover': { bgcolor: link.bg, borderColor: `${link.color}30`,
                      transform: 'translateY(-2px)', boxShadow: `0 4px 12px ${link.color}15` } }}>
                  <Avatar sx={{ bgcolor: link.bg, width: 38, height: 38 }}>
                    {React.cloneElement(link.icon, { sx: { color: link.color, fontSize: 18 } })}
                  </Avatar>
                  <Typography sx={{ fontSize: '0.72rem', fontWeight: 600, color: '#334155',
                    textAlign: 'center', lineHeight: 1.3 }}>
                    {link.label}
                  </Typography>
                </Box>
              </Grid>
            ))}
          </Grid>
        </CardContent>
      </Card>

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
}
