import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box, Card, CardContent, Typography, Grid, Avatar, Chip,
  Button, Skeleton, Divider, LinearProgress, Snackbar, Alert,
} from '@mui/material';
import {
  Assignment as RequestIcon,
  School as TrainingIcon,
  Event as EventIcon,
  Work as WorkIcon,
  CalendarToday as CalendarIcon,
  CheckCircle as CheckIcon,
  Celebration as CelebrationIcon,
  ArrowForward as ArrowIcon,
  Send as SendIcon,
  Description as AttestationIcon,
  FlightTakeoff as MissionIcon,
  ReceiptLong as PayslipIcon,
  BeachAccess as LeaveIcon,
  Lightbulb as SuggestionIcon,
  HowToReg as RecommendIcon,
  PersonAdd as PersonAddIcon,
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';
import { getEmployeeDashboard } from '../../services/employeeService';
import { getMyRequests, getMyTrainings } from '../../services/employeeService';
import api from '../../services/api';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

const COLORS = ['#1976d2','#388e3c','#d32f2f','#7b1fa2','#f57c00','#0097a7'];
const avatarColor = (n = '') => COLORS[(n.charCodeAt(0) || 0) % COLORS.length];

const REQUEST_STATUS = {
  pending:  { label: 'En attente', color: '#f57c00', bg: '#fff8e1' },
  approved: { label: 'Approuvée',  color: '#2e7d32', bg: '#e8f5e9' },
  rejected: { label: 'Rejetée',    color: '#c62828', bg: '#ffebee' },
};

/* ── Section header ── */
const NavHeader = ({ title, icon, action }) => (
  <Box sx={{ background: 'linear-gradient(135deg,#0f172a,#1e3a5f,#1e40af)',
    px: 2.5, py: 1.5, display: 'flex', alignItems: 'center', gap: 1.5 }}>
    <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.12)', width: 28, height: 28, borderRadius: 1.5 }}>
      {React.cloneElement(icon, { sx: { fontSize: 14, color: 'white' } })}
    </Avatar>
    <Typography sx={{ color: 'white', fontWeight: 700, fontSize: '0.88rem', flex: 1 }}>{title}</Typography>
    {action}
  </Box>
);

/* ── Quick action tile ── */
const ActionTile = ({ label, icon, color, bg, path, navigate }) => (
  <Box onClick={() => navigate(path)}
    sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1, p: 1.75,
      borderRadius: 2, border: '1px solid #e8ecf0', bgcolor: '#f8fafc', cursor: 'pointer',
      transition: 'all 0.18s',
      '&:hover': { bgcolor: bg, borderColor: `${color}30`,
        transform: 'translateY(-2px)', boxShadow: `0 4px 12px ${color}15` } }}>
    <Avatar sx={{ bgcolor: bg, width: 38, height: 38 }}>
      {React.cloneElement(icon, { sx: { color, fontSize: 18 } })}
    </Avatar>
    <Typography sx={{ fontSize: '0.72rem', fontWeight: 600, color: '#334155',
      textAlign: 'center', lineHeight: 1.3 }}>
      {label}
    </Typography>
  </Box>
);

const EmployeeDashboard = () => {
  const { user } = useAuth();
  const navigate  = useNavigate();

  const [dashData,     setDashData]     = useState(null);
  const [myRequests,   setMyRequests]   = useState([]);
  const [myTrainings,  setMyTrainings]  = useState([]);
  const [events,       setEvents]       = useState([]);
  const [loading,      setLoading]      = useState(true);
  const [snack,        setSnack]        = useState({ open: false, msg: '', severity: 'success' });

  useEffect(() => { load(); }, []);

  const load = async () => {
    setLoading(true);
    const [dashRes, reqRes, trainRes, evtRes] = await Promise.allSettled([
      getEmployeeDashboard(),
      getMyRequests(),
      getMyTrainings(),
      api.get('/events/'),
    ]);
    if (dashRes.status === 'fulfilled')  setDashData(dashRes.value.data);
    if (reqRes.status === 'fulfilled') {
      const d = reqRes.value.data;
      const all = [...(d.leave_requests || []).map(r => ({ ...r, _type: 'leave', _label: 'Congé' })),
                   ...(d.attestation_requests || []).map(r => ({ ...r, _type: 'attestation', _label: 'Attestation' })),
                   ...(d.mission_requests || []).map(r => ({ ...r, _type: 'mission', _label: 'Mission' })),
                   ...(d.payslip_requests || []).map(r => ({ ...r, _type: 'payslip', _label: 'Bulletin' }))];
      all.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
      setMyRequests(all.slice(0, 5));
    }
    if (trainRes.status === 'fulfilled') setMyTrainings((trainRes.value.data || []).slice(0, 3));
    if (evtRes.status === 'fulfilled')
      setEvents((evtRes.value.data?.results || evtRes.value.data || [])
        .filter(e => e.status === 'approved' && new Date(e.date) >= new Date())
        .slice(0, 3));
    setLoading(false);
  };

  const today = format(new Date(), "EEEE d MMMM yyyy", { locale: fr });
  const pendingCount = myRequests.filter(r => r.status === 'pending').length;
  const activeTrainings = myTrainings.filter(t => t.status === 'approved').length;

  const quickActions = [
    { label: 'Demande de congé',    icon: <LeaveIcon />,       color: '#1976d2', bg: '#eff6ff', path: '/employee/requests/create-leave' },
    { label: 'Attestation',         icon: <AttestationIcon />, color: '#7b1fa2', bg: '#fdf4ff', path: '/employee/requests/create-attestation' },
    { label: 'Ordre de mission',    icon: <MissionIcon />,     color: '#e65100', bg: '#fff7ed', path: '/employee/requests/create-mission' },
    { label: 'Bulletin de paie',    icon: <PayslipIcon />,     color: '#2e7d32', bg: '#f0fdf4', path: '/employee/requests/create-payslip' },
    { label: 'Voir les événements',  icon: <EventIcon />,       color: '#0288d1', bg: '#e1f5fe', path: '/employee/events' },
    { label: 'Recommander un profil',icon: <RecommendIcon />,  color: '#0891b2', bg: '#ecfeff', path: '/employee/recommend' },
  ];

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
              <Typography variant="body2" sx={{ opacity: 0.7 }}>Bienvenue sur votre espace personnel</Typography>
            </Box>
            {/* Mini stats */}
            <Box sx={{ display: 'flex', gap: 2.5 }}>
              <Box sx={{ textAlign: 'center' }}>
                <Typography sx={{ fontSize: '1.3rem', fontWeight: 800,
                  color: pendingCount > 0 ? '#fbbf24' : '#86efac', lineHeight: 1 }}>
                  {pendingCount}
                </Typography>
                <Typography sx={{ fontSize: '0.68rem', color: 'rgba(255,255,255,0.5)', mt: 0.2 }}>Demandes en attente</Typography>
              </Box>
              <Box sx={{ textAlign: 'center' }}>
                <Typography sx={{ fontSize: '1.3rem', fontWeight: 800, color: '#60a5fa', lineHeight: 1 }}>
                  {activeTrainings}
                </Typography>
                <Typography sx={{ fontSize: '0.68rem', color: 'rgba(255,255,255,0.5)', mt: 0.2 }}>Formations actives</Typography>
              </Box>
              <Box sx={{ textAlign: 'center' }}>
                <Typography sx={{ fontSize: '1.3rem', fontWeight: 800, color: '#a78bfa', lineHeight: 1 }}>
                  {events.length}
                </Typography>
                <Typography sx={{ fontSize: '0.68rem', color: 'rgba(255,255,255,0.5)', mt: 0.2 }}>Événements à venir</Typography>
              </Box>
            </Box>
          </Box>
        </CardContent>
      </Card>

      {/* ── Actions rapides ── */}
      <Card elevation={0} sx={{ mb: 3, borderRadius: 3, border: '1px solid #e8ecf0', overflow: 'hidden' }}>
        <NavHeader title="Actions rapides" icon={<RequestIcon />} />
        <CardContent sx={{ p: 2 }}>
          <Grid container spacing={1.5}>
            {quickActions.map((a, i) => (
              <Grid item xs={6} sm={4} md={2} key={i}>
                <ActionTile {...a} navigate={navigate} />
              </Grid>
            ))}
          </Grid>
        </CardContent>
      </Card>

      <Grid container spacing={3}>

        {/* ── Mes demandes récentes ── */}
        <Grid item xs={12} md={6}>
          <Card elevation={0} sx={{ borderRadius: 3, border: '1px solid #e8ecf0', overflow: 'hidden', height: '100%' }}>
            <NavHeader title="Mes demandes récentes" icon={<RequestIcon />}
              action={
                <Button size="small" endIcon={<ArrowIcon sx={{ fontSize: 13 }} />}
                  onClick={() => navigate('/employee/requests')}
                  sx={{ color: 'rgba(255,255,255,0.7)', textTransform: 'none', fontSize: '0.75rem',
                    '&:hover': { color: 'white' } }}>
                  Toutes
                </Button>
              } />
            <CardContent sx={{ p: 0 }}>
              {loading ? (
                <Box sx={{ p: 2 }}>{[1,2,3].map(i => <Skeleton key={i} height={52} sx={{ mb: 0.5, borderRadius: 2 }} />)}</Box>
              ) : myRequests.length === 0 ? (
                <Box sx={{ textAlign: 'center', py: 5 }}>
                  <CheckIcon sx={{ fontSize: 36, color: '#2e7d32', opacity: 0.4, mb: 0.75 }} />
                  <Typography variant="caption" color="text.secondary" display="block">Aucune demande pour le moment</Typography>
                  <Button size="small" onClick={() => navigate('/employee/requests/create-leave')}
                    sx={{ mt: 1, textTransform: 'none', fontWeight: 600, fontSize: '0.78rem' }}>
                    Créer une demande
                  </Button>
                </Box>
              ) : myRequests.map((req, i) => {
                const sc = REQUEST_STATUS[req.status] || REQUEST_STATUS.pending;
                return (
                  <React.Fragment key={`${req._type}-${req.id}`}>
                    <Box sx={{ px: 2.5, py: 1.5, display: 'flex', alignItems: 'center', gap: 1.5,
                      '&:hover': { bgcolor: '#f8fafc' } }}>
                      <Avatar sx={{ bgcolor: '#1976d212', width: 32, height: 32, borderRadius: 1.5, flexShrink: 0 }}>
                        <RequestIcon sx={{ color: '#1976d2', fontSize: 15 }} />
                      </Avatar>
                      <Box sx={{ flex: 1, minWidth: 0 }}>
                        <Typography sx={{ fontSize: '0.82rem', fontWeight: 600, color: '#1e293b' }}>
                          {req._label}
                          {req.start_date && ` · ${format(new Date(req.start_date), 'dd MMM', { locale: fr })}`}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {req.created_at ? format(new Date(req.created_at), 'dd MMM yyyy', { locale: fr }) : '—'}
                        </Typography>
                      </Box>
                      <Chip label={sc.label} size="small"
                        sx={{ bgcolor: sc.bg, color: sc.color, fontWeight: 700, fontSize: '0.65rem',
                          height: 18, border: `1px solid ${sc.color}25` }} />
                    </Box>
                    {i < myRequests.length - 1 && <Divider />}
                  </React.Fragment>
                );
              })}
            </CardContent>
          </Card>
        </Grid>

        {/* ── Mes formations ── */}
        <Grid item xs={12} md={6}>
          <Card elevation={0} sx={{ borderRadius: 3, border: '1px solid #e8ecf0', overflow: 'hidden', height: '100%' }}>
            <NavHeader title="Mes formations" icon={<TrainingIcon />}
              action={
                <Button size="small" endIcon={<ArrowIcon sx={{ fontSize: 13 }} />}
                  onClick={() => navigate('/employee/trainings')}
                  sx={{ color: 'rgba(255,255,255,0.7)', textTransform: 'none', fontSize: '0.75rem',
                    '&:hover': { color: 'white' } }}>
                  Toutes
                </Button>
              } />
            <CardContent sx={{ p: 0 }}>
              {loading ? (
                <Box sx={{ p: 2 }}>{[1,2].map(i => <Skeleton key={i} height={64} sx={{ mb: 0.5, borderRadius: 2 }} />)}</Box>
              ) : myTrainings.length === 0 ? (
                <Box sx={{ textAlign: 'center', py: 5 }}>
                  <TrainingIcon sx={{ fontSize: 36, color: '#cbd5e1', mb: 0.75 }} />
                  <Typography variant="caption" color="text.secondary" display="block">Aucune formation assignée</Typography>
                </Box>
              ) : myTrainings.map((t, i) => {
                const isActive = t.status === 'approved';
                const color = isActive ? '#2e7d32' : '#64748b';
                return (
                  <React.Fragment key={t.id}>
                    <Box sx={{ px: 2.5, py: 1.75, '&:hover': { bgcolor: '#f8fafc' } }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 0.75 }}>
                        <Avatar sx={{ bgcolor: `${color}12`, width: 32, height: 32, borderRadius: 1.5, flexShrink: 0 }}>
                          <TrainingIcon sx={{ color, fontSize: 15 }} />
                        </Avatar>
                        <Box sx={{ flex: 1, minWidth: 0 }}>
                          <Typography sx={{ fontSize: '0.82rem', fontWeight: 600, color: '#1e293b' }} noWrap>
                            {t.name}
                          </Typography>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            {t.start_date && (
                              <Typography variant="caption" color="text.secondary">
                                {format(new Date(t.start_date), 'dd MMM', { locale: fr })}
                                {t.end_date && ` → ${format(new Date(t.end_date), 'dd MMM yyyy', { locale: fr })}`}
                              </Typography>
                            )}
                            <Chip label={isActive ? 'Active' : t.status} size="small"
                              sx={{ bgcolor: isActive ? '#e8f5e9' : '#f5f5f5',
                                color: isActive ? '#2e7d32' : '#757575',
                                fontWeight: 700, fontSize: '0.62rem', height: 16 }} />
                          </Box>
                        </Box>
                        <Typography sx={{ fontSize: '0.75rem', fontWeight: 700, color,
                          flexShrink: 0 }}>
                          {t.duration_days ? `${t.duration_days}j` : ''}
                        </Typography>
                      </Box>
                      {isActive && (
                        <LinearProgress variant="indeterminate"
                          sx={{ height: 4, borderRadius: 2, bgcolor: '#e8f5e9',
                            '& .MuiLinearProgress-bar': { bgcolor: '#2e7d32', borderRadius: 2 } }} />
                      )}
                    </Box>
                    {i < myTrainings.length - 1 && <Divider />}
                  </React.Fragment>
                );
              })}
            </CardContent>
          </Card>
        </Grid>

        {/* ── Événements à venir ── */}
        <Grid item xs={12} md={6}>
          <Card elevation={0} sx={{ borderRadius: 3, border: '1px solid #e8ecf0', overflow: 'hidden' }}>
            <NavHeader title="Événements à venir" icon={<EventIcon />}
              action={
                <Button size="small" endIcon={<ArrowIcon sx={{ fontSize: 13 }} />}
                  onClick={() => navigate('/employee/events')}
                  sx={{ color: 'rgba(255,255,255,0.7)', textTransform: 'none', fontSize: '0.75rem',
                    '&:hover': { color: 'white' } }}>
                  Tous
                </Button>
              } />
            <CardContent sx={{ p: 0 }}>
              {loading ? (
                <Box sx={{ p: 2 }}>{[1,2].map(i => <Skeleton key={i} height={56} sx={{ mb: 0.5, borderRadius: 2 }} />)}</Box>
              ) : events.length === 0 ? (
                <Box sx={{ textAlign: 'center', py: 4 }}>
                  <EventIcon sx={{ fontSize: 36, color: '#cbd5e1', mb: 0.75 }} />
                  <Typography variant="caption" color="text.secondary" display="block">Aucun événement à venir</Typography>
                </Box>
              ) : events.map((ev, i) => {
                const evDate = ev.date ? new Date(ev.date) : null;
                return (
                  <React.Fragment key={ev.id}>
                    <Box sx={{ px: 2.5, py: 1.5, display: 'flex', alignItems: 'center', gap: 1.75,
                      '&:hover': { bgcolor: '#f8fafc' } }}>
                      {/* Date block */}
                      <Box sx={{ width: 44, height: 44, borderRadius: 2, bgcolor: '#f3e5f5',
                        display: 'flex', flexDirection: 'column', alignItems: 'center',
                        justifyContent: 'center', flexShrink: 0, border: '1px solid #e1bee7' }}>
                        {evDate ? (
                          <>
                            <Typography sx={{ fontSize: '0.6rem', color: '#9c27b0', fontWeight: 700,
                              textTransform: 'uppercase', lineHeight: 1 }}>
                              {format(evDate, 'MMM', { locale: fr })}
                            </Typography>
                            <Typography sx={{ fontSize: '1rem', color: '#9c27b0', fontWeight: 800, lineHeight: 1.2 }}>
                              {format(evDate, 'd')}
                            </Typography>
                          </>
                        ) : (
                          <EventIcon sx={{ fontSize: 18, color: '#9c27b0' }} />
                        )}
                      </Box>
                      <Box sx={{ flex: 1, minWidth: 0 }}>
                        <Typography sx={{ fontSize: '0.85rem', fontWeight: 600, color: '#1e293b' }} noWrap>
                          {ev.name || ev.title}
                        </Typography>
                        {ev.location && (
                          <Typography variant="caption" color="text.secondary">{ev.location}</Typography>
                        )}
                      </Box>
                    </Box>
                    {i < events.length - 1 && <Divider />}
                  </React.Fragment>
                );
              })}
            </CardContent>
          </Card>
        </Grid>

        {/* ── Offres d'emploi + Nouveaux employés ── */}
        <Grid item xs={12} md={6}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>

            {/* Offres actives */}
            {dashData?.active_job_offers?.length > 0 && (
              <Card elevation={0} sx={{ borderRadius: 3, border: '1px solid #e8ecf0', overflow: 'hidden' }}>
                <NavHeader title="Offres d'emploi actives" icon={<WorkIcon />}
                  action={
                    <Button size="small" endIcon={<ArrowIcon sx={{ fontSize: 13 }} />}
                      onClick={() => navigate('/job-offers')}
                      sx={{ color: 'rgba(255,255,255,0.7)', textTransform: 'none', fontSize: '0.75rem',
                        '&:hover': { color: 'white' } }}>
                      Voir tout
                    </Button>
                  } />
                <CardContent sx={{ p: 1.5, display: 'flex', flexDirection: 'column', gap: 1 }}>
                  {dashData.active_job_offers.map(job => (
                    <Box key={job.id} sx={{ p: 1.5, borderRadius: 2, border: '1px solid #e8ecf0',
                      bgcolor: '#f8fafc', transition: 'all 0.15s',
                      '&:hover': { bgcolor: '#eff6ff', borderColor: '#bfdbfe' } }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                        <Box sx={{ flex: 1, minWidth: 0, mr: 1 }}>
                          <Typography sx={{ fontSize: '0.875rem', fontWeight: 700, color: '#1e293b' }} noWrap>
                            {job.title}
                          </Typography>
                          {job.department && (
                            <Typography variant="caption" color="text.secondary">{job.department}</Typography>
                          )}
                        </Box>
                        <Chip label={job.experience_level} size="small"
                          sx={{ bgcolor: '#e3f2fd', color: '#1565c0', fontWeight: 600, fontSize: '0.65rem', height: 18 }} />
                      </Box>
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        <Button size="small" startIcon={<SendIcon sx={{ fontSize: 13 }} />}
                          onClick={() => navigate(`/employee/apply/${job.id}`)}
                          sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 600, fontSize: '0.72rem',
                            color: '#1976d2', border: '1px solid #bfdbfe',
                            '&:hover': { bgcolor: '#dbeafe' }, py: 0.3 }}>
                          Postuler
                        </Button>
                        <Button size="small" startIcon={<PersonAddIcon sx={{ fontSize: 13 }} />}
                          onClick={() => navigate(`/employee/recommend/${job.id}`)}
                          sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 600, fontSize: '0.72rem',
                            color: '#0891b2', border: '1px solid #a5f3fc',
                            '&:hover': { bgcolor: '#cffafe' }, py: 0.3 }}>
                          Recommander
                        </Button>
                      </Box>
                    </Box>
                  ))}
                </CardContent>
              </Card>
            )}

            {/* Nouveaux employés */}
            {dashData?.new_employees_today?.length > 0 && (
              <Card elevation={0} sx={{ borderRadius: 3, border: '1px solid #e8ecf0', overflow: 'hidden' }}>
                <NavHeader title="Nouveaux collègues aujourd'hui" icon={<CelebrationIcon />}
                  count={dashData.new_employees_today.length} />
                <CardContent sx={{ p: 1.5, display: 'flex', flexDirection: 'column', gap: 0.75 }}>
                  {dashData.new_employees_today.map((emp, i) => {
                    const name = `${emp.user_data?.first_name || ''} ${emp.user_data?.last_name || ''}`.trim();
                    return (
                      <Box key={i} sx={{ display: 'flex', alignItems: 'center', gap: 1.5, p: 1, borderRadius: 2,
                        bgcolor: '#f8fafc', border: '1px solid #f1f5f9' }}>
                        <Avatar
                          src={emp.photo ? `http://localhost:8000${emp.photo}` : undefined}
                          sx={{ bgcolor: avatarColor(name), width: 32, height: 32, fontSize: '0.75rem', fontWeight: 700 }}>
                          {!emp.photo && (name[0]?.toUpperCase() || '?')}
                        </Avatar>
                        <Box sx={{ flex: 1, minWidth: 0 }}>
                          <Typography sx={{ fontSize: '0.82rem', fontWeight: 600, color: '#1e293b' }} noWrap>{name}</Typography>
                          <Typography variant="caption" color="text.secondary" noWrap>
                            {emp.poste || 'Poste non défini'}{emp.department_name ? ` · ${emp.department_name}` : ''}
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

      <Snackbar open={snack.open} autoHideDuration={3000}
        onClose={() => setSnack(p => ({ ...p, open: false }))}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}>
        <Alert severity={snack.severity} sx={{ borderRadius: 2 }}>{snack.msg}</Alert>
      </Snackbar>
    </Box>
  );
};

export default EmployeeDashboard;
