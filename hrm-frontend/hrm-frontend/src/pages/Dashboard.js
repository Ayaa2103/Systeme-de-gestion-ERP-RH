import React, { useState, useEffect } from 'react';
import {
  Grid,
  Card,
  CardContent,
  Typography,
  Box,
  Avatar,
  LinearProgress,
  Chip,
  Skeleton,
  Divider,
  Button,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
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
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Label,
} from 'recharts';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';

const AVATAR_COLORS = ['#1976d2','#388e3c','#d32f2f','#7b1fa2','#f57c00','#0097a7','#c2185b','#5d4037'];
const avatarColor = (name = '') => AVATAR_COLORS[name.charCodeAt(0) % AVATAR_COLORS.length];

/* ─── Stat card ─────────────────────────────────────────────────── */
const StatCard = ({ title, value, subtitle, icon, color, loading }) => (
  <Card
    elevation={0}
    sx={{
      border: '1px solid',
      borderColor: `${color}25`,
      borderRadius: 3,
      cursor: 'default',
      transition: 'all 0.3s ease',
      '&:hover': {
        boxShadow: `0 6px 20px ${color}18`,
        borderColor: `${color}45`,
        bgcolor: `${color}04`,
      },
    }}
  >
    <CardContent sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <Box>
          <Typography variant="body2" color="text.secondary" fontWeight={500} gutterBottom>
            {title}
          </Typography>
          {loading ? (
            <Skeleton width={60} height={40} />
          ) : (
            <Typography variant="h3" fontWeight={700} sx={{ color, lineHeight: 1.2 }}>
              {value}
            </Typography>
          )}
          {subtitle && (
            <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
              {subtitle}
            </Typography>
          )}
        </Box>
        <Avatar sx={{ bgcolor: `${color}15`, width: 52, height: 52 }}>
          {React.cloneElement(icon, { sx: { color, fontSize: 26 } })}
        </Avatar>
      </Box>
    </CardContent>
  </Card>
);

/* ─── Main component ─────────────────────────────────────────────── */
const Dashboard = () => {
  const { user, hasAnyRole } = useAuth();
  const navigate = useNavigate();
  const isHR = hasAnyRole(['hr_manager', 'hr_director', 'administrator']);

  const [stats, setStats] = useState({});
  const [newEmployeesToday, setNewEmployeesToday] = useState([]);
  const [recentJobOffers, setRecentJobOffers] = useState([]);
  const [events, setEvents] = useState([]);
  const [chartData, setChartData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const statsRes = await api.get('/dashboard/stats/');
      setStats(statsRes.data);
      if (statsRes.data.monthly_evolution) setChartData(statsRes.data.monthly_evolution);
    } catch (_) {
      setStats({ total_employees: 0, pending_requests: 0, active_trainings: 0, expiring_contracts: 0, new_employees_today: 0, active_job_offers: 0 });
    }

    if (isHR) {
      const [empRes, offersRes, eventsRes] = await Promise.allSettled([
        api.get('/dashboard/employee-data/'),
        api.get('/dashboard/recent-job-offers/'),
        api.get('/events/'),
      ]);
      if (empRes.status === 'fulfilled') setNewEmployeesToday(empRes.value.data.new_employees_today ?? []);
      if (offersRes.status === 'fulfilled') setRecentJobOffers(Array.isArray(offersRes.value.data) ? offersRes.value.data : []);
      if (eventsRes.status === 'fulfilled') setEvents(Array.isArray(eventsRes.value.data) ? eventsRes.value.data.slice(0, 4) : []);
    }

    setLoading(false);
  };

  const today = format(new Date(), "EEEE d MMMM yyyy", { locale: fr });

  const pieData = [
    { name: 'Employés', value: stats.total_employees || 0, color: '#1976d2' },
    { name: 'En formation', value: stats.active_trainings || 0, color: '#2e7d32' },
    { name: 'Demandes', value: stats.pending_requests || 0, color: '#f57c00' },
  ];

  if (loading) {
    return (
      <Box sx={{ p: 3 }}>
        <LinearProgress />
        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
          Chargement du tableau de bord…
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ width: '100%' }}>

      {/* Bannière d'accueil */}
      <Card
        elevation={0}
        sx={{
          mb: 4,
          borderRadius: 3,
          background: 'linear-gradient(135deg, #1a237e 0%, #283593 60%, #3949ab 100%)',
          color: 'white',
          overflow: 'hidden',
          position: 'relative',
        }}
      >
        <Box sx={{ position: 'absolute', top: -40, right: -40, width: 200, height: 200, borderRadius: '50%', background: 'rgba(255,255,255,0.05)' }} />
        <Box sx={{ position: 'absolute', bottom: -60, right: 80, width: 150, height: 150, borderRadius: '50%', background: 'rgba(255,255,255,0.04)' }} />
        <CardContent sx={{ p: 4, position: 'relative' }}>
          <Grid container alignItems="center" spacing={3}>
            <Grid item xs={12} md={8}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <CalendarIcon sx={{ fontSize: 16, mr: 1, opacity: 0.8 }} />
                <Typography variant="caption" sx={{ opacity: 0.8, textTransform: 'capitalize' }}>
                  {today}
                </Typography>
              </Box>
              <Typography variant="h4" fontWeight={700} gutterBottom>
                Bonjour, {user?.first_name || user?.username} 👋
              </Typography>
              <Typography variant="body1" sx={{ opacity: 0.85 }}>
                Voici un aperçu de votre espace de travail
              </Typography>
            </Grid>
            <Grid item xs={12} md={4} sx={{ textAlign: { md: 'right' } }}>
              <Chip
                icon={<CheckIcon sx={{ color: 'white !important' }} />}
                label="Système opérationnel"
                sx={{ bgcolor: 'rgba(76,175,80,0.3)', color: 'white', border: '1px solid rgba(76,175,80,0.5)', fontWeight: 600 }}
              />
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* KPI Cards — rôles RH */}
      {isHR && (
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard title="Total Employés" value={stats.total_employees ?? 0} subtitle="Tous statuts" icon={<PeopleIcon />} color="#1976d2" loading={loading} />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard title="Demandes en attente" value={stats.pending_requests ?? 0} subtitle="À traiter" icon={<AssignmentIcon />} color="#f57c00" loading={loading} />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard title="Formations actives" value={stats.active_trainings ?? 0} subtitle="En cours" icon={<SchoolIcon />} color="#2e7d32" loading={loading} />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard title="Contrats expirants" value={stats.expiring_contracts ?? 0} subtitle="30 prochains jours" icon={<WarningIcon />} color={stats.expiring_contracts > 0 ? '#d32f2f' : '#757575'} loading={loading} />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard title="Nouveaux aujourd'hui" value={stats.new_employees_today ?? 0} subtitle="Employés" icon={<PeopleIcon />} color="#9c27b0" loading={loading} />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard title="Offres actives" value={stats.active_job_offers ?? 0} subtitle="Publiées" icon={<WorkIcon />} color="#0097a7" loading={loading} />
          </Grid>
        </Grid>
      )}

      {/* KPI Cards — employé */}
      {user?.role === 'employee' && (
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={4}>
            <StatCard title="Mes demandes" value={stats.my_requests ?? 0} subtitle="En cours" icon={<AssignmentIcon />} color="#1976d2" loading={loading} />
          </Grid>
          <Grid item xs={12} sm={4}>
            <StatCard title="Mes formations" value={stats.my_trainings ?? 0} subtitle="Programmées" icon={<SchoolIcon />} color="#2e7d32" loading={loading} />
          </Grid>
          <Grid item xs={12} sm={4}>
            <StatCard title="Congés restants" value={stats.remaining_leaves ?? 25} subtitle="Jours disponibles" icon={<EventIcon />} color="#f57c00" loading={loading} />
          </Grid>
        </Grid>
      )}

      {/* Nouveaux employés du jour */}
      {isHR && newEmployeesToday.length > 0 && (
        <Card elevation={0} sx={{ mb: 4, borderRadius: 3, border: '1px solid #e8ecf0', overflow: 'hidden' }}>
          {/* Navy header */}
          <Box sx={{
            background: 'linear-gradient(135deg, #0f172a 0%, #1e3a5f 60%, #1e40af 100%)',
            px: 3, py: 2, display: 'flex', alignItems: 'center', gap: 1.5,
          }}>
            <Box sx={{ p: 0.75, borderRadius: 2, bgcolor: 'rgba(255,255,255,0.12)', display: 'inline-flex' }}>
              <CelebrationIcon sx={{ fontSize: 18, color: 'white' }} />
            </Box>
            <Typography variant="subtitle1" fontWeight={700} color="white">
              Nouveau(x) employé(s) du jour
            </Typography>
            <Chip
              label={newEmployeesToday.length}
              size="small"
              sx={{ ml: 'auto', bgcolor: 'rgba(255,255,255,0.15)', color: 'white', border: '1px solid rgba(255,255,255,0.25)', fontWeight: 700, fontSize: '0.75rem', height: 22 }}
            />
          </Box>
          <CardContent sx={{ p: 2.5 }}>
            <Grid container spacing={2}>
              {newEmployeesToday.map((emp, i) => {
                const fullName = `${emp.user_data?.first_name || ''} ${emp.user_data?.last_name || ''}`.trim();
                const photoUrl = emp.photo ? `http://localhost:8000${emp.photo}` : null;
                return (
                  <Grid item xs={12} sm={6} md={4} key={emp.id || i}>
                    <Box
                      onClick={() => emp.id && navigate(`/employees/${emp.id}`)}
                      sx={{
                        display: 'flex', alignItems: 'center', p: 2,
                        bgcolor: '#f8fafc', borderRadius: 2, border: '1px solid #e8ecf0',
                        cursor: emp.id ? 'pointer' : 'default',
                        transition: 'all 0.2s ease',
                        '&:hover': emp.id ? { boxShadow: '0 4px 12px rgba(25,118,210,0.1)', borderColor: '#1976d230', bgcolor: 'white' } : {},
                      }}
                    >
                      <Avatar
                        src={photoUrl}
                        sx={{ bgcolor: avatarColor(fullName), mr: 1.5, width: 44, height: 44, fontSize: '1rem', fontWeight: 700, flexShrink: 0 }}
                      >
                        {!photoUrl && (emp.user_data?.first_name?.[0] || '?')}
                      </Avatar>
                      <Box sx={{ minWidth: 0, flex: 1 }}>
                        <Typography variant="body2" fontWeight={700} noWrap>{fullName || 'Nouvel employé'}</Typography>
                        <Typography variant="caption" color="text.secondary" noWrap>
                          {emp.poste || 'Poste non défini'}
                        </Typography>
                      </Box>
                      <CelebrationIcon sx={{ fontSize: 16, color: '#ffc107', ml: 1, flexShrink: 0, opacity: 0.85 }} />
                    </Box>
                  </Grid>
                );
              })}
            </Grid>
          </CardContent>
        </Card>
      )}

      {/* Événements à venir */}
      <Card elevation={0} sx={{ mb: 3, borderRadius: 3, border: '1px solid #e8ecf0' }}>
        <CardContent sx={{ p: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2.5 }}>
            <Box sx={{ p: 0.75, borderRadius: 2, bgcolor: '#f3e5f5', display: 'inline-flex' }}>
              <EventIcon sx={{ fontSize: 18, color: '#9c27b0' }} />
            </Box>
            <Typography variant="subtitle1" fontWeight={700}>Événements à venir</Typography>
          </Box>
          {events.length > 0 ? (
            <Grid container spacing={2}>
              {events.map((event) => {
                const eventDate = event.date ? new Date(event.date) : null;
                return (
                  <Grid item xs={12} sm={6} md={3} key={event.id}>
                    <Box sx={{
                      p: 2, borderRadius: 2, border: '1px solid #e8ecf0', bgcolor: '#f8fafc',
                      display: 'flex', flexDirection: 'column', gap: 1.5,
                    }}>
                      <Box sx={{
                        width: 48, height: 48, bgcolor: '#f3e5f5', borderRadius: 2,
                        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                        border: '1px solid #ce93d830',
                      }}>
                        {eventDate ? (
                          <>
                            <Typography sx={{ fontSize: '0.6rem', color: '#9c27b0', fontWeight: 700, lineHeight: 1, textTransform: 'uppercase' }}>
                              {format(eventDate, 'MMM', { locale: fr })}
                            </Typography>
                            <Typography sx={{ fontSize: '1rem', color: '#9c27b0', fontWeight: 800, lineHeight: 1.2 }}>
                              {format(eventDate, 'd')}
                            </Typography>
                          </>
                        ) : (
                          <EventIcon sx={{ fontSize: 20, color: '#9c27b0' }} />
                        )}
                      </Box>
                      <Typography variant="body2" fontWeight={700} sx={{ lineHeight: 1.3 }}>
                        {event.title || event.name}
                      </Typography>
                      {eventDate && (
                        <Chip
                          label={format(eventDate, 'EEEE d MMM', { locale: fr })}
                          size="small"
                          sx={{ alignSelf: 'flex-start', fontSize: '0.7rem', height: 22, bgcolor: '#f3e5f5', color: '#9c27b0', border: '1px solid #ce93d830', '& .MuiChip-label': { px: 1 } }}
                        />
                      )}
                    </Box>
                  </Grid>
                );
              })}
            </Grid>
          ) : (
            <Box sx={{ textAlign: 'center', py: 5, color: 'text.secondary' }}>
              <EventIcon sx={{ fontSize: 40, mb: 1, opacity: 0.3 }} />
              <Typography variant="body2">Aucun événement à venir</Typography>
            </Box>
          )}
        </CardContent>
      </Card>

      {/* Graphiques + offres */}
      <Grid container spacing={3}>

        {/* Graphique évolution mensuelle */}
        {hasAnyRole(['hr_manager', 'hr_director']) && chartData.length > 0 && (
          <Grid item xs={12} md={8}>
            <Card elevation={0} sx={{ borderRadius: 3, border: '1px solid #e8ecf0' }}>
              <CardContent sx={{ p: 3 }}>
                <Typography variant="subtitle1" fontWeight={700} gutterBottom>
                  Évolution mensuelle
                </Typography>
                <Box sx={{ height: 280, mt: 1 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                      <XAxis dataKey="name" stroke="#9e9e9e" tick={{ fontSize: 12 }} />
                      <YAxis stroke="#9e9e9e" tick={{ fontSize: 12 }} />
                      <Tooltip contentStyle={{ borderRadius: 8, border: '1px solid #e0e0e0', boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }} />
                      <Line type="monotone" dataKey="employees" stroke="#1976d2" strokeWidth={2.5} dot={{ r: 4, fill: '#1976d2' }} name="Employés" />
                      <Line type="monotone" dataKey="requests" stroke="#f57c00" strokeWidth={2.5} dot={{ r: 4, fill: '#f57c00' }} name="Demandes" />
                    </LineChart>
                  </ResponsiveContainer>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        )}

        {/* Répartition (Pie) */}
        <Grid item xs={12} md={hasAnyRole(['hr_manager', 'hr_director']) && chartData.length > 0 ? 4 : 6}>
          <Card elevation={0} sx={{ borderRadius: 3, border: '1px solid #e8ecf0', height: '100%', overflow: 'hidden' }}>
            <Box sx={{
              background: 'linear-gradient(135deg, #0f172a 0%, #1e3a5f 60%, #1e40af 100%)',
              px: 3, py: 2, display: 'flex', alignItems: 'center', gap: 1.5,
            }}>
              <Box sx={{ p: 0.75, borderRadius: 2, bgcolor: 'rgba(255,255,255,0.12)', display: 'inline-flex' }}>
                <TrendingIcon sx={{ fontSize: 18, color: 'white' }} />
              </Box>
              <Typography variant="subtitle1" fontWeight={700} color="white">Répartition</Typography>
            </Box>
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ height: 190 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%" cy="50%"
                      innerRadius={54} outerRadius={80}
                      paddingAngle={3}
                      dataKey="value"
                      cornerRadius={5}
                      strokeWidth={0}
                    >
                      {pieData.map((entry, i) => (
                        <Cell key={i} fill={entry.color} stroke="none" />
                      ))}
                      <Label
                        content={({ viewBox }) => {
                          const { cx, cy } = viewBox;
                          const total = pieData.reduce((s, d) => s + d.value, 0);
                          return (
                            <g>
                              <text x={cx} y={cy - 7} textAnchor="middle" fill="#0f172a"
                                style={{ fontSize: '1.5rem', fontWeight: 800 }}>
                                {total}
                              </text>
                              <text x={cx} y={cy + 13} textAnchor="middle" fill="#94a3b8"
                                style={{ fontSize: '0.62rem', letterSpacing: 1, textTransform: 'uppercase' }}>
                                TOTAL
                              </text>
                            </g>
                          );
                        }}
                        position="center"
                      />
                    </Pie>
                    <Tooltip
                      contentStyle={{ borderRadius: 8, border: '1px solid #e8ecf0', boxShadow: '0 4px 12px rgba(0,0,0,0.08)', fontSize: '0.8rem' }}
                      formatter={(value, name) => [value, name]}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </Box>
              <Divider sx={{ my: 2 }} />
              {(() => {
                const total = pieData.reduce((s, d) => s + d.value, 0);
                return pieData.map((item, i) => {
                  const pct = total ? Math.round((item.value / total) * 100) : 0;
                  return (
                    <Box key={i} sx={{ mb: i < pieData.length - 1 ? 2 : 0 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.75 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Box sx={{ width: 10, height: 10, bgcolor: item.color, borderRadius: '50%', flexShrink: 0 }} />
                          <Typography variant="body2" color="text.secondary">{item.name}</Typography>
                        </Box>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                          <Typography variant="body2" fontWeight={700} sx={{ color: item.color }}>{item.value}</Typography>
                          <Typography variant="caption" color="text.disabled">({pct}%)</Typography>
                        </Box>
                      </Box>
                      <LinearProgress
                        variant="determinate" value={pct}
                        sx={{
                          height: 5, borderRadius: 3,
                          bgcolor: `${item.color}15`,
                          '& .MuiLinearProgress-bar': { bgcolor: item.color, borderRadius: 3 },
                        }}
                      />
                    </Box>
                  );
                });
              })()}
            </CardContent>
          </Card>
        </Grid>

        {/* Offres d'emploi actives */}
        {isHR && (
          <Grid item xs={12} md={6}>
            <Card elevation={0} sx={{ borderRadius: 3, border: '1px solid #e8ecf0', height: '100%' }}>
              <CardContent sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Typography variant="subtitle1" fontWeight={700}>
                    Offres d'emploi actives
                  </Typography>
                  <Button size="small" endIcon={<ArrowIcon />} onClick={() => navigate('/job-offers')} sx={{ textTransform: 'none' }}>
                    Voir tout
                  </Button>
                </Box>
                {recentJobOffers.length > 0 ? (
                  <List disablePadding>
                    {recentJobOffers.slice(0, 3).map((offer, i) => (
                      <React.Fragment key={offer.id || i}>
                        <ListItem
                          disablePadding
                          sx={{ py: 1.5, cursor: 'pointer', borderRadius: 2, px: 1, '&:hover': { bgcolor: '#f8fafc' } }}
                          onClick={() => navigate(`/job-offers/${offer.id}`)}
                        >
                          <ListItemAvatar>
                            <Avatar sx={{ bgcolor: '#e3f2fd', width: 40, height: 40 }}>
                              <WorkIcon sx={{ color: '#1976d2', fontSize: 20 }} />
                            </Avatar>
                          </ListItemAvatar>
                          <ListItemText
                            primary={<Typography variant="body2" fontWeight={600}>{offer.title}</Typography>}
                            secondary={
                              <Box sx={{ display: 'flex', gap: 1, mt: 0.5, flexWrap: 'wrap' }}>
                                <Chip label={offer.employment_type || 'CDI'} size="small" sx={{ fontSize: 11, height: 20 }} />
                                <Typography variant="caption" color="text.secondary">
                                  {offer.applications_count ?? 0} candidature(s)
                                </Typography>
                              </Box>
                            }
                          />
                        </ListItem>
                        {i < recentJobOffers.slice(0, 3).length - 1 && <Divider component="li" />}
                      </React.Fragment>
                    ))}
                  </List>
                ) : (
                  <Box sx={{ textAlign: 'center', py: 4, color: 'text.secondary' }}>
                    <WorkIcon sx={{ fontSize: 40, mb: 1, opacity: 0.3 }} />
                    <Typography variant="body2">Aucune offre active</Typography>
                  </Box>
                )}
              </CardContent>
            </Card>
          </Grid>
        )}

      </Grid>
    </Box>
  );
};

export default Dashboard;
