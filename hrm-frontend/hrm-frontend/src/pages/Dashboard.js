import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box, Card, CardContent, Typography, Grid, Avatar, Chip,
  Button, Skeleton, Divider, LinearProgress,
} from '@mui/material';
import {
  People as PeopleIcon,
  Assignment as AssignmentIcon,
  School as SchoolIcon,
  Warning as WarningIcon,
  Work as WorkIcon,
  Event as EventIcon,
  CalendarToday as CalendarIcon,
  ArrowForward as ArrowIcon,
  CheckCircle as CheckIcon,
  TrendingUp as TrendingIcon,
  Celebration as CelebrationIcon,
} from '@mui/icons-material';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip as ChartTooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Label,
} from 'recharts';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';

const AVATAR_COLORS = ['#1976d2','#388e3c','#d32f2f','#7b1fa2','#f57c00','#0097a7','#c2185b','#5d4037'];
const avatarColor = (name = '') => AVATAR_COLORS[name.charCodeAt(0) % AVATAR_COLORS.length];

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
const NavHeader = ({ title, icon, action }) => (
  <Box sx={{ background: 'linear-gradient(135deg,#0f172a,#1e3a5f,#1e40af)',
    px: 2.5, py: 1.75, display: 'flex', alignItems: 'center', gap: 1.5 }}>
    <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.12)', width: 28, height: 28, borderRadius: 1.5 }}>
      {React.cloneElement(icon, { sx: { fontSize: 14, color: 'white' } })}
    </Avatar>
    <Typography sx={{ color: 'white', fontWeight: 700, fontSize: '0.88rem', flex: 1 }}>{title}</Typography>
    {action}
  </Box>
);

const Dashboard = () => {
  const { user } = useAuth();
  const navigate  = useNavigate();

  const [stats,        setStats]        = useState({});
  const [newEmployees, setNewEmployees] = useState([]);
  const [jobOffers,    setJobOffers]    = useState([]);
  const [events,       setEvents]       = useState([]);
  const [chartData,    setChartData]    = useState([]);
  const [loading,      setLoading]      = useState(true);

  useEffect(() => { load(); }, []);

  const load = async () => {
    setLoading(true);
    const [statsRes, empRes, offersRes, eventsRes] = await Promise.allSettled([
      api.get('/dashboard/stats/'),
      api.get('/dashboard/employee-data/'),
      api.get('/dashboard/recent-job-offers/'),
      api.get('/events/'),
    ]);
    if (statsRes.status  === 'fulfilled') {
      const d = statsRes.value.data;
      setStats(d);
      if (d.monthly_evolution) setChartData(d.monthly_evolution);
    }
    if (empRes.status    === 'fulfilled') setNewEmployees(empRes.value.data.new_employees_today ?? []);
    if (offersRes.status === 'fulfilled') setJobOffers(Array.isArray(offersRes.value.data) ? offersRes.value.data : []);
    if (eventsRes.status === 'fulfilled') {
      const d = eventsRes.value.data;
      setEvents((Array.isArray(d) ? d : d?.results || [])
        .filter(e => e.status === 'approved')
        .slice(0, 4));
    }
    setLoading(false);
  };

  const today = format(new Date(), "EEEE d MMMM yyyy", { locale: fr });

  const pieData = [
    { name: 'Employés',   value: stats.total_employees  || 0, color: '#1976d2' },
    { name: 'Formations', value: stats.active_trainings || 0, color: '#2e7d32' },
    { name: 'Demandes',   value: stats.pending_requests || 0, color: '#f57c00' },
  ];

  const kpis = [
    { title: 'Total Employés',       value: stats.total_employees   ?? 0, subtitle: 'Tous statuts',         icon: <PeopleIcon />,    color: '#1976d2', path: '/employees' },
    { title: 'Demandes en attente',  value: stats.pending_requests  ?? 0, subtitle: 'À traiter',            icon: <AssignmentIcon />,color: '#f57c00', path: null },
    { title: 'Formations actives',   value: stats.active_trainings  ?? 0, subtitle: 'En cours',             icon: <SchoolIcon />,    color: '#2e7d32', path: null },
    { title: 'Contrats expirants',   value: stats.expiring_contracts ?? 0, subtitle: '30 prochains jours',  icon: <WarningIcon />,   color: stats.expiring_contracts > 0 ? '#c62828' : '#757575', path: '/contracts' },
    { title: 'Nouveaux aujourd\'hui',value: stats.new_employees_today ?? 0, subtitle: 'Employés',           icon: <PeopleIcon />,    color: '#9c27b0', path: null },
    { title: 'Offres actives',       value: stats.active_job_offers ?? 0, subtitle: 'Publiées',             icon: <WorkIcon />,      color: '#0097a7', path: '/job-offers' },
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
              <Typography variant="body2" sx={{ opacity: 0.7 }}>Vue d'ensemble du système RH</Typography>
            </Box>
            <Chip icon={<CheckIcon sx={{ color: 'white !important' }} />} label="Système opérationnel"
              sx={{ bgcolor: 'rgba(76,175,80,0.25)', color: 'white',
                border: '1px solid rgba(76,175,80,0.45)', fontWeight: 600 }} />
          </Box>
        </CardContent>
      </Card>

      {/* ── KPI Cards ── */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        {kpis.map((k, i) => (
          <Grid item xs={6} sm={4} md={2} key={i}>
            <StatCard title={k.title} value={k.value} subtitle={k.subtitle}
              icon={k.icon} color={k.color} loading={loading}
              onClick={k.path ? () => navigate(k.path) : undefined} />
          </Grid>
        ))}
      </Grid>

      {/* ── Contenu principal ── */}
      <Grid container spacing={3}>

        {/* Graphique + Pie */}
        <Grid item xs={12} lg={8}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>

            {/* Line chart */}
            {chartData.length > 0 && (
              <Card elevation={0} sx={{ borderRadius: 3, border: '1px solid #e8ecf0', overflow: 'hidden' }}>
                <NavHeader title="Évolution mensuelle" icon={<TrendingIcon />} />
                <CardContent sx={{ p: 2.5 }}>
                  <Box sx={{ height: 220 }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                        <XAxis dataKey="name" stroke="#94a3b8" tick={{ fontSize: 11 }} />
                        <YAxis stroke="#94a3b8" tick={{ fontSize: 11 }} />
                        <ChartTooltip contentStyle={{ borderRadius: 8, border: '1px solid #e8ecf0', boxShadow: '0 4px 12px rgba(0,0,0,0.08)', fontSize: '0.8rem' }} />
                        <Line type="monotone" dataKey="employees" stroke="#1976d2" strokeWidth={2.5} dot={{ r: 3, fill: '#1976d2' }} name="Employés" />
                        <Line type="monotone" dataKey="requests"  stroke="#f57c00" strokeWidth={2.5} dot={{ r: 3, fill: '#f57c00' }} name="Demandes" />
                      </LineChart>
                    </ResponsiveContainer>
                  </Box>
                </CardContent>
              </Card>
            )}

            {/* Offres d'emploi */}
            {jobOffers.length > 0 && (
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
                <CardContent sx={{ p: 0 }}>
                  {jobOffers.slice(0, 4).map((offer, i) => (
                    <React.Fragment key={offer.id || i}>
                      <Box sx={{ px: 2.5, py: 1.5, display: 'flex', alignItems: 'center', gap: 1.5,
                        '&:hover': { bgcolor: '#f8fafc' } }}>
                        <Avatar sx={{ bgcolor: '#1976d212', width: 34, height: 34, borderRadius: 1.5 }}>
                          <WorkIcon sx={{ color: '#1976d2', fontSize: 16 }} />
                        </Avatar>
                        <Box sx={{ flex: 1, minWidth: 0 }}>
                          <Typography sx={{ fontSize: '0.875rem', fontWeight: 600, color: '#1e293b' }} noWrap>
                            {offer.title}
                          </Typography>
                          {offer.department && (
                            <Typography variant="caption" color="text.secondary">{offer.department}</Typography>
                          )}
                        </Box>
                        <Chip label="Publiée" size="small"
                          sx={{ bgcolor: '#e8f5e9', color: '#2e7d32', fontWeight: 700, fontSize: '0.68rem', height: 20 }} />
                      </Box>
                      {i < Math.min(jobOffers.length, 4) - 1 && <Divider />}
                    </React.Fragment>
                  ))}
                </CardContent>
              </Card>
            )}
          </Box>
        </Grid>

        {/* Colonne droite */}
        <Grid item xs={12} lg={4}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>

            {/* Pie chart répartition */}
            <Card elevation={0} sx={{ borderRadius: 3, border: '1px solid #e8ecf0', overflow: 'hidden' }}>
              <NavHeader title="Répartition" icon={<TrendingIcon />} />
              <CardContent sx={{ p: 2.5 }}>
                <Box sx={{ height: 160 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={pieData} cx="50%" cy="50%" innerRadius={48} outerRadius={70}
                        paddingAngle={3} dataKey="value" cornerRadius={4} strokeWidth={0}>
                        {pieData.map((entry, i) => <Cell key={i} fill={entry.color} stroke="none" />)}
                        <Label content={({ viewBox }) => {
                          const { cx, cy } = viewBox;
                          const total = pieData.reduce((s, d) => s + d.value, 0);
                          return (
                            <g>
                              <text x={cx} y={cy - 6} textAnchor="middle" fill="#0f172a"
                                style={{ fontSize: '1.4rem', fontWeight: 800 }}>{total}</text>
                              <text x={cx} y={cy + 12} textAnchor="middle" fill="#94a3b8"
                                style={{ fontSize: '0.6rem', letterSpacing: 1, textTransform: 'uppercase' }}>TOTAL</text>
                            </g>
                          );
                        }} position="center" />
                      </Pie>
                      <ChartTooltip contentStyle={{ borderRadius: 8, border: '1px solid #e8ecf0', fontSize: '0.8rem' }} />
                    </PieChart>
                  </ResponsiveContainer>
                </Box>
                <Divider sx={{ my: 1.5 }} />
                {pieData.map((item, i) => {
                  const total = pieData.reduce((s, d) => s + d.value, 0);
                  const pct = total ? Math.round((item.value / total) * 100) : 0;
                  return (
                    <Box key={i} sx={{ mb: i < pieData.length - 1 ? 1.5 : 0 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Box sx={{ width: 8, height: 8, bgcolor: item.color, borderRadius: '50%' }} />
                          <Typography sx={{ fontSize: '0.78rem', color: '#64748b' }}>{item.name}</Typography>
                        </Box>
                        <Box sx={{ display: 'flex', gap: 0.75 }}>
                          <Typography sx={{ fontSize: '0.78rem', fontWeight: 700, color: item.color }}>{item.value}</Typography>
                          <Typography variant="caption" color="text.disabled">({pct}%)</Typography>
                        </Box>
                      </Box>
                      <LinearProgress variant="determinate" value={pct}
                        sx={{ height: 4, borderRadius: 2, bgcolor: `${item.color}12`,
                          '& .MuiLinearProgress-bar': { bgcolor: item.color, borderRadius: 2 } }} />
                    </Box>
                  );
                })}
              </CardContent>
            </Card>

            {/* Nouveaux employés */}
            {newEmployees.length > 0 && (
              <Card elevation={0} sx={{ borderRadius: 3, border: '1px solid #e8ecf0', overflow: 'hidden' }}>
                <NavHeader title="Nouveaux aujourd'hui" icon={<CelebrationIcon />}
                  action={
                    <Chip label={newEmployees.length} size="small"
                      sx={{ bgcolor: 'rgba(255,255,255,0.15)', color: 'white', fontWeight: 700, height: 20, fontSize: '0.7rem' }} />
                  } />
                <CardContent sx={{ p: 1.5, display: 'flex', flexDirection: 'column', gap: 0.75 }}>
                  {newEmployees.map((emp, i) => {
                    const name = `${emp.user_data?.first_name || ''} ${emp.user_data?.last_name || ''}`.trim();
                    return (
                      <Box key={i} sx={{ display: 'flex', alignItems: 'center', gap: 1.25, p: 1, borderRadius: 2,
                        bgcolor: '#f8fafc', border: '1px solid #f1f5f9',
                        '&:hover': { bgcolor: '#eff6ff', borderColor: '#bfdbfe' } }}>
                        <Avatar sx={{ bgcolor: avatarColor(name), width: 28, height: 28, fontSize: '0.7rem', fontWeight: 700 }}>
                          {name[0]?.toUpperCase() || '?'}
                        </Avatar>
                        <Box sx={{ flex: 1, minWidth: 0 }}>
                          <Typography sx={{ fontSize: '0.8rem', fontWeight: 600, color: '#1e293b' }} noWrap>{name}</Typography>
                          <Typography variant="caption" color="text.secondary" noWrap>{emp.poste || 'Poste non défini'}</Typography>
                        </Box>
                        <CelebrationIcon sx={{ fontSize: 13, color: '#ffc107' }} />
                      </Box>
                    );
                  })}
                </CardContent>
              </Card>
            )}

            {/* Événements */}
            {events.length > 0 && (
              <Card elevation={0} sx={{ borderRadius: 3, border: '1px solid #e8ecf0', overflow: 'hidden' }}>
                <NavHeader title="Événements à venir" icon={<EventIcon />}
                  action={
                    <Button size="small" endIcon={<ArrowIcon sx={{ fontSize: 13 }} />}
                      onClick={() => navigate('/events')}
                      sx={{ color: 'rgba(255,255,255,0.7)', textTransform: 'none', fontSize: '0.75rem',
                        '&:hover': { color: 'white' } }}>
                      Voir
                    </Button>
                  } />
                <CardContent sx={{ p: 1.5, display: 'flex', flexDirection: 'column', gap: 0.75 }}>
                  {events.map(ev => {
                    const evDate = ev.date ? new Date(ev.date) : null;
                    return (
                      <Box key={ev.id} sx={{ display: 'flex', alignItems: 'center', gap: 1.25, p: 1, borderRadius: 2,
                        bgcolor: '#f8fafc', border: '1px solid #f1f5f9' }}>
                        <Box sx={{ width: 38, height: 38, bgcolor: '#f3e5f5', borderRadius: 1.5, flexShrink: 0,
                          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                          border: '1px solid #e1bee7' }}>
                          {evDate ? (
                            <>
                              <Typography sx={{ fontSize: '0.55rem', color: '#9c27b0', fontWeight: 700,
                                textTransform: 'uppercase', lineHeight: 1 }}>
                                {format(evDate, 'MMM', { locale: fr })}
                              </Typography>
                              <Typography sx={{ fontSize: '0.9rem', color: '#9c27b0', fontWeight: 800, lineHeight: 1.2 }}>
                                {format(evDate, 'd')}
                              </Typography>
                            </>
                          ) : <EventIcon sx={{ fontSize: 16, color: '#9c27b0' }} />}
                        </Box>
                        <Box sx={{ flex: 1, minWidth: 0 }}>
                          <Typography sx={{ fontSize: '0.8rem', fontWeight: 600, color: '#1e293b' }} noWrap>
                            {ev.name || ev.title}
                          </Typography>
                          {ev.location && (
                            <Typography variant="caption" color="text.secondary" noWrap>{ev.location}</Typography>
                          )}
                        </Box>
                      </Box>
                    );
                  })}
                </CardContent>
              </Card>
            )}
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Dashboard;
