import React, { useState, useEffect } from 'react';
import {
  Box, Grid, Card, CardContent, Typography, Avatar, Chip,
  Button, Skeleton, Divider, IconButton, Tooltip, Alert,
} from '@mui/material';
import {
  People as PeopleIcon,
  Assignment as AssignmentIcon,
  Warning as WarningIcon,
  Work as WorkIcon,
  Add as AddIcon,
  ArrowForward as ArrowIcon,
  CheckCircle as CheckIcon,
  Cancel as RejectIcon,
  CalendarToday as CalendarIcon,
  Celebration as CelebrationIcon,
  Inbox as InboxIcon,
  FilePresent as ContractIcon,
  School as SchoolIcon,
  Event as EventIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';
import { getPendingRequests, approveRequest, rejectRequest, getExpiringContracts } from '../services/hrService';

const AVATAR_COLORS = ['#1976d2','#388e3c','#d32f2f','#7b1fa2','#f57c00','#0097a7','#c2185b','#5d4037'];
const avatarColor = (name = '') => AVATAR_COLORS[(name.charCodeAt(0) || 0) % AVATAR_COLORS.length];

/* ── Stat card ──────────────────────────────────────────────────── */
const StatCard = ({ title, value, subtitle, icon, color, loading, onClick }) => (
  <Card elevation={0} onClick={onClick}
    sx={{ border: '1px solid', borderColor: `${color}22`, borderRadius: 3, cursor: onClick ? 'pointer' : 'default',
      transition: 'all 0.2s', '&:hover': onClick ? { boxShadow: `0 6px 20px ${color}18`, borderColor: `${color}44`, transform: 'translateY(-2px)' } : {} }}>
    <CardContent sx={{ p: 2.5 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <Box>
          <Typography variant="body2" color="text.secondary" fontWeight={500} gutterBottom sx={{ fontSize: '0.8rem' }}>
            {title}
          </Typography>
          {loading ? <Skeleton width={50} height={38} /> : (
            <Typography variant="h3" fontWeight={800} sx={{ color, lineHeight: 1.1 }}>{value}</Typography>
          )}
          {subtitle && <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>{subtitle}</Typography>}
        </Box>
        <Avatar sx={{ bgcolor: `${color}12`, width: 46, height: 46 }}>
          {React.cloneElement(icon, { sx: { color, fontSize: 22 } })}
        </Avatar>
      </Box>
    </CardContent>
  </Card>
);

/* ── Request type config ─────────────────────────────────────────── */
const REQUEST_TYPES = {
  leave:       { label: 'Congé',       color: '#1976d2', bg: '#eff6ff' },
  attestation: { label: 'Attestation', color: '#7b1fa2', bg: '#fdf4ff' },
  mission:     { label: 'Mission',     color: '#e65100', bg: '#fff7ed' },
  payslip:     { label: 'Bulletin',    color: '#2e7d32', bg: '#f0fdf4' },
};

/* ── Main ───────────────────────────────────────────────────────── */
export default function HRManagerDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [stats,          setStats]          = useState({});
  const [newEmployees,   setNewEmployees]   = useState([]);
  const [requests,       setRequests]       = useState([]);
  const [expiring,       setExpiring]       = useState([]);
  const [events,         setEvents]         = useState([]);
  const [loadingStats,   setLoadingStats]   = useState(true);
  const [loadingReqs,    setLoadingReqs]    = useState(true);
  const [actionLoading,  setActionLoading]  = useState({});
  const [error,          setError]          = useState('');

  useEffect(() => { load(); }, []);

  const load = async () => {
    setLoadingStats(true);
    setLoadingReqs(true);

    const [statsRes, empRes, evtRes] = await Promise.allSettled([
      api.get('/dashboard/stats/'),
      api.get('/dashboard/employee-data/'),
      api.get('/events/'),
    ]);

    if (statsRes.status === 'fulfilled') setStats(statsRes.value.data);
    if (empRes.status === 'fulfilled')   setNewEmployees(empRes.value.data.new_employees_today ?? []);
    if (evtRes.status === 'fulfilled')   setEvents((evtRes.value.data ?? []).slice(0, 3));
    setLoadingStats(false);

    const [reqRes, expRes] = await Promise.allSettled([
      getPendingRequests(),
      getExpiringContracts(),
    ]);

    if (reqRes.status === 'fulfilled') {
      const d = reqRes.value.data;
      const all = [
        ...(d.leaves        ?? []).map(r => ({ ...r, _type: 'leave' })),
        ...(d.attestations  ?? []).map(r => ({ ...r, _type: 'attestation' })),
        ...(d.missions      ?? []).map(r => ({ ...r, _type: 'mission' })),
        ...(d.payslips      ?? []).map(r => ({ ...r, _type: 'payslip' })),
      ];
      setRequests(all.slice(0, 5));
    }
    if (expRes.status === 'fulfilled') setExpiring((expRes.value.data ?? []).slice(0, 5));
    setLoadingReqs(false);
  };

  const handleApprove = async (req) => {
    setActionLoading(p => ({ ...p, [req.id]: 'approve' }));
    try {
      await approveRequest(req._type, req.id);
      setRequests(p => p.filter(r => r.id !== req.id || r._type !== req._type));
      setStats(p => ({ ...p, pending_requests: Math.max(0, (p.pending_requests || 1) - 1) }));
    } catch { setError('Erreur lors de l\'approbation'); }
    finally { setActionLoading(p => ({ ...p, [req.id]: null })); }
  };

  const handleReject = async (req) => {
    setActionLoading(p => ({ ...p, [req.id]: 'reject' }));
    try {
      await rejectRequest(req._type, req.id);
      setRequests(p => p.filter(r => r.id !== req.id || r._type !== req._type));
      setStats(p => ({ ...p, pending_requests: Math.max(0, (p.pending_requests || 1) - 1) }));
    } catch { setError('Erreur lors du rejet'); }
    finally { setActionLoading(p => ({ ...p, [req.id]: null })); }
  };

  const today = format(new Date(), "EEEE d MMMM yyyy", { locale: fr });

  const quickLinks = [
    { label: 'Nouvel employé',    icon: <PeopleIcon />,   color: '#1976d2', bg: '#eff6ff',  path: '/employees/create' },
    { label: 'Gérer demandes',    icon: <InboxIcon />,    color: '#f57c00', bg: '#fff7ed',  path: '/manage-requests' },
    { label: 'Nouveau contrat',   icon: <ContractIcon />, color: '#7b1fa2', bg: '#fdf4ff',  path: '/contracts' },
    { label: 'Nouvelle offre',    icon: <WorkIcon />,     color: '#0891b2', bg: '#ecfeff',  path: '/job-offers' },
    { label: 'Planifier formation', icon: <SchoolIcon />, color: '#2e7d32', bg: '#f0fdf4',  path: '/manage-trainings' },
    { label: 'Gérer événements',  icon: <EventIcon />,    color: '#9c27b0', bg: '#fdf4ff',  path: '/events' },
  ];

  return (
    <Box sx={{ width: '100%' }}>

      {/* ── Banner ── */}
      <Card elevation={0} sx={{ mb: 3, borderRadius: 3, overflow: 'hidden',
        background: 'linear-gradient(135deg, #0f172a 0%, #1e3a5f 60%, #1e40af 100%)', color: 'white', position: 'relative' }}>
        <Box sx={{ position: 'absolute', top: -40, right: -40, width: 200, height: 200, borderRadius: '50%', bgcolor: 'rgba(255,255,255,0.04)', pointerEvents: 'none' }} />
        <Box sx={{ position: 'absolute', bottom: -50, right: 130, width: 140, height: 140, borderRadius: '50%', bgcolor: 'rgba(255,255,255,0.03)', pointerEvents: 'none' }} />
        <CardContent sx={{ p: 3, position: 'relative' }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
            <Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                <CalendarIcon sx={{ fontSize: 14, opacity: 0.7 }} />
                <Typography variant="caption" sx={{ opacity: 0.7, textTransform: 'capitalize' }}>{today}</Typography>
              </Box>
              <Typography variant="h5" fontWeight={700} gutterBottom sx={{ mb: 0.25 }}>
                Bonjour, {user?.first_name || user?.username} 👋
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.7 }}>Tableau de bord — Responsable RH</Typography>
            </Box>
            <Chip icon={<CheckIcon sx={{ color: 'white !important' }} />} label="Système opérationnel"
              sx={{ bgcolor: 'rgba(76,175,80,0.25)', color: 'white', border: '1px solid rgba(76,175,80,0.45)', fontWeight: 600 }} />
          </Box>
        </CardContent>
      </Card>

      {error && <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }} onClose={() => setError('')}>{error}</Alert>}

      {/* ── KPI Cards ── */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={6} sm={3}>
          <StatCard title="Employés actifs" value={stats.total_employees ?? 0} subtitle="Tous départements"
            icon={<PeopleIcon />} color="#1976d2" loading={loadingStats} onClick={() => navigate('/employees')} />
        </Grid>
        <Grid item xs={6} sm={3}>
          <StatCard title="Demandes en attente" value={stats.pending_requests ?? 0} subtitle="À traiter"
            icon={<AssignmentIcon />} color="#f57c00" loading={loadingStats} onClick={() => navigate('/manage-requests')} />
        </Grid>
        <Grid item xs={6} sm={3}>
          <StatCard title="Contrats expirants" value={stats.expiring_contracts ?? 0} subtitle="Dans 30 jours"
            icon={<WarningIcon />} color={stats.expiring_contracts > 0 ? '#d32f2f' : '#64748b'} loading={loadingStats} onClick={() => navigate('/contracts')} />
        </Grid>
        <Grid item xs={6} sm={3}>
          <StatCard title="Offres publiées" value={stats.active_job_offers ?? 0} subtitle="En recrutement"
            icon={<WorkIcon />} color="#0891b2" loading={loadingStats} onClick={() => navigate('/job-offers')} />
        </Grid>
      </Grid>

      <Grid container spacing={3}>

        {/* ── Demandes en attente ── */}
        <Grid item xs={12} lg={7}>
          <Card elevation={0} sx={{ borderRadius: 3, border: '1px solid #e8ecf0', overflow: 'hidden', height: '100%' }}>
            <Box sx={{ background: 'linear-gradient(135deg,#0f172a,#1e3a5f,#1e40af)', px: 2.5, py: 1.75,
              display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.12)', width: 30, height: 30, borderRadius: 1.5 }}>
                <InboxIcon sx={{ fontSize: 15, color: 'white' }} />
              </Avatar>
              <Typography sx={{ color: 'white', fontWeight: 700, fontSize: '0.9rem', flex: 1 }}>Demandes en attente</Typography>
              {stats.pending_requests > 0 && (
                <Chip label={stats.pending_requests} size="small"
                  sx={{ bgcolor: 'rgba(255,255,255,0.15)', color: 'white', fontWeight: 700, height: 20, fontSize: '0.7rem' }} />
              )}
              <Button size="small" endIcon={<ArrowIcon sx={{ fontSize: 14 }} />} onClick={() => navigate('/manage-requests')}
                sx={{ color: 'rgba(255,255,255,0.7)', textTransform: 'none', fontSize: '0.75rem', '&:hover': { color: 'white' } }}>
                Tout voir
              </Button>
            </Box>

            <CardContent sx={{ p: 0 }}>
              {loadingReqs ? (
                <Box sx={{ p: 2 }}>{[1,2,3].map(i => <Skeleton key={i} height={56} sx={{ mb: 0.5, borderRadius: 2 }} />)}</Box>
              ) : requests.length === 0 ? (
                <Box sx={{ textAlign: 'center', py: 5 }}>
                  <CheckIcon sx={{ fontSize: 40, color: '#2e7d32', opacity: 0.5, mb: 1 }} />
                  <Typography variant="body2" color="text.secondary">Aucune demande en attente</Typography>
                </Box>
              ) : (
                requests.map((req, i) => {
                  const rc = REQUEST_TYPES[req._type] || REQUEST_TYPES.leave;
                  const empName = req.employee_name || req.employee?.user?.first_name
                    ? `${req.employee?.user?.first_name || ''} ${req.employee?.user?.last_name || ''}`.trim()
                    : 'Employé';
                  const isLoading = actionLoading[req.id];
                  return (
                    <React.Fragment key={`${req._type}-${req.id}`}>
                      <Box sx={{ px: 2, py: 1.5, display: 'flex', alignItems: 'center', gap: 1.5,
                        transition: 'background 0.15s', '&:hover': { bgcolor: '#f8fafc' } }}>
                        <Avatar sx={{ bgcolor: avatarColor(empName), width: 36, height: 36, fontSize: '0.8rem', fontWeight: 700, flexShrink: 0 }}>
                          {empName[0]?.toUpperCase() || '?'}
                        </Avatar>
                        <Box sx={{ flex: 1, minWidth: 0 }}>
                          <Typography sx={{ fontSize: '0.83rem', fontWeight: 600, color: '#1e293b' }} noWrap>{empName}</Typography>
                          <Box sx={{ display: 'flex', gap: 0.75, mt: 0.3, alignItems: 'center' }}>
                            <Chip label={rc.label} size="small"
                              sx={{ bgcolor: rc.bg, color: rc.color, fontWeight: 700, fontSize: '0.65rem', height: 18 }} />
                            {req.start_date && (
                              <Typography variant="caption" color="text.secondary">
                                {format(new Date(req.start_date), 'dd MMM', { locale: fr })}
                                {req.end_date ? ` → ${format(new Date(req.end_date), 'dd MMM', { locale: fr })}` : ''}
                              </Typography>
                            )}
                          </Box>
                        </Box>
                        <Box sx={{ display: 'flex', gap: 0.75, flexShrink: 0 }}>
                          <Tooltip title="Approuver">
                            <IconButton size="small" disabled={!!isLoading} onClick={() => handleApprove(req)}
                              sx={{ bgcolor: '#e8f5e9', color: '#2e7d32', borderRadius: 1.5, width: 30, height: 30,
                                '&:hover': { bgcolor: '#c8e6c9' }, '&:disabled': { opacity: 0.4 } }}>
                              <CheckIcon sx={{ fontSize: 15 }} />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Rejeter">
                            <IconButton size="small" disabled={!!isLoading} onClick={() => handleReject(req)}
                              sx={{ bgcolor: '#ffebee', color: '#c62828', borderRadius: 1.5, width: 30, height: 30,
                                '&:hover': { bgcolor: '#ffcdd2' }, '&:disabled': { opacity: 0.4 } }}>
                              <RejectIcon sx={{ fontSize: 15 }} />
                            </IconButton>
                          </Tooltip>
                        </Box>
                      </Box>
                      {i < requests.length - 1 && <Divider />}
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

            {/* Contrats expirants */}
            <Card elevation={0} sx={{ borderRadius: 3, border: '1px solid #e8ecf0', overflow: 'hidden' }}>
              <Box sx={{ background: 'linear-gradient(135deg,#0f172a,#1e3a5f,#1e40af)', px: 2.5, py: 1.75,
                display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.12)', width: 30, height: 30, borderRadius: 1.5 }}>
                  <WarningIcon sx={{ fontSize: 15, color: 'white' }} />
                </Avatar>
                <Typography sx={{ color: 'white', fontWeight: 700, fontSize: '0.9rem', flex: 1 }}>Contrats expirants</Typography>
                <Button size="small" endIcon={<ArrowIcon sx={{ fontSize: 14 }} />} onClick={() => navigate('/contracts')}
                  sx={{ color: 'rgba(255,255,255,0.7)', textTransform: 'none', fontSize: '0.75rem', '&:hover': { color: 'white' } }}>
                  Voir tout
                </Button>
              </Box>
              <CardContent sx={{ p: 0 }}>
                {loadingReqs ? (
                  <Box sx={{ p: 2 }}>{[1,2].map(i => <Skeleton key={i} height={48} sx={{ mb: 0.5, borderRadius: 2 }} />)}</Box>
                ) : expiring.length === 0 ? (
                  <Box sx={{ textAlign: 'center', py: 3.5 }}>
                    <CheckIcon sx={{ fontSize: 32, color: '#2e7d32', opacity: 0.4, mb: 0.5 }} />
                    <Typography variant="caption" color="text.secondary">Aucun contrat expirant prochainement</Typography>
                  </Box>
                ) : expiring.map((c, i) => {
                  const days = c.date_fin ? Math.ceil((new Date(c.date_fin) - new Date()) / 86400000) : null;
                  const urgency = days !== null && days <= 7 ? '#d32f2f' : days !== null && days <= 14 ? '#f57c00' : '#64748b';
                  return (
                    <React.Fragment key={c.id}>
                      <Box sx={{ px: 2, py: 1.25, display: 'flex', alignItems: 'center', gap: 1.5,
                        '&:hover': { bgcolor: '#f8fafc' } }}>
                        <Avatar sx={{ bgcolor: `${urgency}12`, width: 32, height: 32, borderRadius: 1.5 }}>
                          <ContractIcon sx={{ fontSize: 14, color: urgency }} />
                        </Avatar>
                        <Box sx={{ flex: 1, minWidth: 0 }}>
                          <Typography sx={{ fontSize: '0.8rem', fontWeight: 600, color: '#1e293b' }} noWrap>
                            {c.employee_name || '—'}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {c.type} · expire {c.date_fin ? format(new Date(c.date_fin), 'dd MMM yyyy', { locale: fr }) : '—'}
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

            {/* Nouveaux employés du jour */}
            {newEmployees.length > 0 && (
              <Card elevation={0} sx={{ borderRadius: 3, border: '1px solid #e8ecf0', overflow: 'hidden' }}>
                <Box sx={{ background: 'linear-gradient(135deg,#0f172a,#1e3a5f,#1e40af)', px: 2.5, py: 1.75,
                  display: 'flex', alignItems: 'center', gap: 1.5 }}>
                  <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.12)', width: 30, height: 30, borderRadius: 1.5 }}>
                    <CelebrationIcon sx={{ fontSize: 15, color: 'white' }} />
                  </Avatar>
                  <Typography sx={{ color: 'white', fontWeight: 700, fontSize: '0.9rem', flex: 1 }}>Nouveaux aujourd'hui</Typography>
                  <Chip label={newEmployees.length} size="small"
                    sx={{ bgcolor: 'rgba(255,255,255,0.15)', color: 'white', fontWeight: 700, height: 20, fontSize: '0.7rem' }} />
                </Box>
                <CardContent sx={{ p: 1.5, display: 'flex', flexDirection: 'column', gap: 0.75 }}>
                  {newEmployees.map((emp, i) => {
                    const name = `${emp.user_data?.first_name || ''} ${emp.user_data?.last_name || ''}`.trim();
                    return (
                      <Box key={i} onClick={() => emp.id && navigate(`/employees/${emp.id}`)}
                        sx={{ display: 'flex', alignItems: 'center', gap: 1.5, p: 1, borderRadius: 2,
                          bgcolor: '#f8fafc', border: '1px solid #f1f5f9', cursor: 'pointer',
                          '&:hover': { bgcolor: '#eff6ff', borderColor: '#bfdbfe' } }}>
                        <Avatar sx={{ bgcolor: avatarColor(name), width: 32, height: 32, fontSize: '0.75rem', fontWeight: 700 }}>
                          {name[0]?.toUpperCase() || '?'}
                        </Avatar>
                        <Box sx={{ flex: 1, minWidth: 0 }}>
                          <Typography sx={{ fontSize: '0.8rem', fontWeight: 600, color: '#1e293b' }} noWrap>{name || 'Nouvel employé'}</Typography>
                          <Typography variant="caption" color="text.secondary" noWrap>{emp.poste || 'Poste non défini'}</Typography>
                        </Box>
                        <CelebrationIcon sx={{ fontSize: 14, color: '#ffc107', flexShrink: 0 }} />
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
        <Box sx={{ background: 'linear-gradient(135deg,#0f172a,#1e3a5f,#1e40af)', px: 2.5, py: 1.75,
          display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.12)', width: 30, height: 30, borderRadius: 1.5 }}>
            <ArrowIcon sx={{ fontSize: 15, color: 'white' }} />
          </Avatar>
          <Typography sx={{ color: 'white', fontWeight: 700, fontSize: '0.9rem' }}>Accès rapide</Typography>
        </Box>
        <CardContent sx={{ p: 2 }}>
          <Grid container spacing={1.5}>
            {quickLinks.map((link, i) => (
              <Grid item xs={6} sm={4} md={2} key={i}>
                <Box onClick={() => navigate(link.path)}
                  sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1, p: 1.75,
                    borderRadius: 2, border: '1px solid #e8ecf0', bgcolor: '#f8fafc', cursor: 'pointer',
                    transition: 'all 0.18s',
                    '&:hover': { bgcolor: link.bg, borderColor: `${link.color}30`, transform: 'translateY(-2px)', boxShadow: `0 4px 12px ${link.color}15` } }}>
                  <Avatar sx={{ bgcolor: link.bg, width: 38, height: 38 }}>
                    {React.cloneElement(link.icon, { sx: { color: link.color, fontSize: 18 } })}
                  </Avatar>
                  <Typography sx={{ fontSize: '0.72rem', fontWeight: 600, color: '#334155', textAlign: 'center', lineHeight: 1.3 }}>
                    {link.label}
                  </Typography>
                </Box>
              </Grid>
            ))}
          </Grid>
        </CardContent>
      </Card>
    </Box>
  );
}
