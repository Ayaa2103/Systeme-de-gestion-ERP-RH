import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box, Card, CardContent, Typography, Grid, Avatar, Button,
  Chip, Divider, Skeleton, Tooltip,
} from '@mui/material';
import {
  People as PeopleIcon,
  AdminPanelSettings as AdminIcon,
  Assignment as ContractIcon,
  Warning as WarningIcon,
  ArrowForward as ArrowIcon,
  CalendarToday as CalendarIcon,
  CheckCircle as CheckIcon,
  Work as WorkIcon,
  AccountTree as StructureIcon,
  Tune as ConfigIcon,
  ManageAccounts as UsersIcon,
  Event as EventIcon,
  Shield as ShieldIcon,
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';
import { getEmployees, getExpiringContracts, getContracts } from '../../services/hrService';
import api from '../../services/api';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

const COLORS = ['#1976d2','#388e3c','#d32f2f','#7b1fa2','#f57c00','#0097a7'];
const avatarColor = (n = '') => COLORS[(n.charCodeAt(0) || 0) % COLORS.length];

const progressColor = (days) =>
  days <= 7 ? '#c62828' : days <= 14 ? '#f57c00' : '#64748b';

/* ── Stat card ── */
const StatCard = ({ title, value, subtitle, icon, color, loading, onClick }) => (
  <Card elevation={0} onClick={onClick}
    sx={{ border: '1px solid', borderColor: `${color}22`, borderRadius: 3, height: '100%',
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

const AdminSpecialDashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [loading,  setLoading]  = useState(true);
  const [stats,    setStats]    = useState({ employees: 0, contracts: 0, users: 0, offers: 0 });
  const [expiring, setExpiring] = useState([]);
  const [recentUsers, setRecentUsers] = useState([]);

  useEffect(() => { load(); }, []);

  const load = async () => {
    setLoading(true);
    const [empRes, expRes, usersRes, offersRes] = await Promise.allSettled([
      getEmployees(),
      getExpiringContracts(),
      api.get('/users/'),
      api.get('/recruitment/job-offers/?status=published'),
    ]);

    const emp     = empRes.status     === 'fulfilled' ? empRes.value.data     : [];
    const exp     = expRes.status     === 'fulfilled' ? expRes.value.data     : [];
    const users   = usersRes.status   === 'fulfilled' ? usersRes.value.data   : [];
    const offers  = offersRes.status  === 'fulfilled' ? offersRes.value.data  : [];

    const len = d => Array.isArray(d) ? d.length : d?.results?.length ?? d?.count ?? 0;

    setStats({
      employees: len(emp),
      contracts: len(exp),
      users:     len(users),
      offers:    len(offers),
    });
    setExpiring((Array.isArray(exp) ? exp : []).slice(0, 5));
    setRecentUsers(
      (Array.isArray(users) ? users : users?.results || [])
        .sort((a, b) => new Date(b.date_joined) - new Date(a.date_joined))
        .slice(0, 5)
    );
    setLoading(false);
  };

  const today = format(new Date(), "EEEE d MMMM yyyy", { locale: fr });

  const quickLinks = [
    { label: 'Utilisateurs',        icon: <UsersIcon />,    color: '#1976d2', bg: '#eff6ff',  path: '/admin/users' },
    { label: 'Employés',            icon: <PeopleIcon />,   color: '#2e7d32', bg: '#f0fdf4',  path: '/employees' },
    { label: 'Contrats',            icon: <ContractIcon />, color: '#7b1fa2', bg: '#fdf4ff',  path: '/contracts' },
    { label: 'Offres d\'emploi',    icon: <WorkIcon />,     color: '#e65100', bg: '#fff7ed',  path: '/job-offers' },
    { label: 'Événements',          icon: <EventIcon />,    color: '#0891b2', bg: '#ecfeff',  path: '/events' },
    { label: 'Départements & Postes',icon: <StructureIcon />,color:'#f57c00', bg: '#fff8e1',  path: '/admin/structures' },
    { label: 'Configuration',       icon: <ConfigIcon />,   color: '#c62828', bg: '#ffebee',  path: '/admin/configuration' },
    { label: 'Admin Dashboard',     icon: <AdminIcon />,    color: '#6d28d9', bg: '#f5f3ff',  path: '/admin' },
  ];

  const roleConfig = {
    administrator: { label: 'Administrateur', color: '#c62828', bg: '#ffebee' },
    hr_director:   { label: 'Dir. RH',        color: '#6a1b9a', bg: '#f3e5f5' },
    hr_manager:    { label: 'Resp. RH',       color: '#1565c0', bg: '#e3f2fd' },
    employee:      { label: 'Employé',        color: '#2e7d32', bg: '#e8f5e9' },
  };

  return (
    <Box sx={{ width: '100%' }}>

      {/* ── Banner ── */}
      <Card elevation={0} sx={{ mb: 3, borderRadius: 3, overflow: 'hidden',
        background: 'linear-gradient(135deg,#0f172a 0%,#1e3a5f 60%,#1e40af 100%)', color: 'white', position: 'relative' }}>
        <Box sx={{ position: 'absolute', top: -40, right: -40, width: 200, height: 200,
          borderRadius: '50%', bgcolor: 'rgba(255,255,255,0.04)', pointerEvents: 'none' }} />
        <Box sx={{ position: 'absolute', bottom: -50, right: 130, width: 140, height: 140,
          borderRadius: '50%', bgcolor: 'rgba(255,255,255,0.03)', pointerEvents: 'none' }} />
        <CardContent sx={{ p: 3, position: 'relative' }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
            <Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                <CalendarIcon sx={{ fontSize: 14, opacity: 0.7 }} />
                <Typography variant="caption" sx={{ opacity: 0.7, textTransform: 'capitalize' }}>{today}</Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 0.3 }}>
                <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.15)', width: 44, height: 44,
                  border: '2px solid rgba(255,255,255,0.2)', fontSize: '1rem', fontWeight: 700 }}>
                  <ShieldIcon sx={{ fontSize: 22 }} />
                </Avatar>
                <Box>
                  <Typography variant="h5" fontWeight={700}>
                    Bonjour, {user?.first_name || user?.username} 👋
                  </Typography>
                  <Typography variant="body2" sx={{ opacity: 0.7 }}>
                    Tableau de bord Administrateur
                  </Typography>
                </Box>
              </Box>
            </Box>
            <Box sx={{ display: 'flex', gap: 2.5 }}>
              {[
                { label: 'Employés',  value: stats.employees, color: '#60a5fa' },
                { label: 'Utilisateurs',value: stats.users,   color: '#a78bfa' },
                { label: 'Offres',    value: stats.offers,    color: '#34d399' },
              ].map(s => (
                <Box key={s.label} sx={{ textAlign: 'center' }}>
                  {loading ? <Skeleton width={30} height={28} sx={{ bgcolor: 'rgba(255,255,255,0.1)' }} /> : (
                    <Typography sx={{ fontSize: '1.3rem', fontWeight: 800, color: s.color, lineHeight: 1 }}>{s.value}</Typography>
                  )}
                  <Typography sx={{ fontSize: '0.68rem', color: 'rgba(255,255,255,0.5)', mt: 0.2 }}>{s.label}</Typography>
                </Box>
              ))}
              <Chip icon={<CheckIcon sx={{ color: 'white !important', fontSize: '14px !important' }} />}
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
          <StatCard title="Total employés" value={stats.employees} subtitle="Tous statuts"
            icon={<PeopleIcon />} color="#1976d2" loading={loading} onClick={() => navigate('/employees')} />
        </Grid>
        <Grid item xs={6} sm={3}>
          <StatCard title="Utilisateurs" value={stats.users} subtitle="Comptes actifs"
            icon={<UsersIcon />} color="#7b1fa2" loading={loading} onClick={() => navigate('/admin/users')} />
        </Grid>
        <Grid item xs={6} sm={3}>
          <StatCard title="Offres publiées" value={stats.offers} subtitle="En recrutement"
            icon={<WorkIcon />} color="#2e7d32" loading={loading} onClick={() => navigate('/job-offers')} />
        </Grid>
        <Grid item xs={6} sm={3}>
          <StatCard title="Contrats expirants" value={stats.contracts}
            subtitle="Dans les 30 jours"
            icon={<WarningIcon />}
            color={stats.contracts > 0 ? '#c62828' : '#64748b'}
            loading={loading} onClick={() => navigate('/contracts')} />
        </Grid>
      </Grid>

      <Grid container spacing={3}>

        {/* ── Contrats expirants ── */}
        <Grid item xs={12} md={6}>
          <Card elevation={0} sx={{ borderRadius: 3, border: '1px solid #e8ecf0', overflow: 'hidden', height: '100%' }}>
            <NavHeader title="Contrats expirants bientôt" icon={<WarningIcon />}
              action={
                <Button size="small" endIcon={<ArrowIcon sx={{ fontSize: 13 }} />}
                  onClick={() => navigate('/contracts')}
                  sx={{ color: 'rgba(255,255,255,0.7)', textTransform: 'none', fontSize: '0.75rem',
                    '&:hover': { color: 'white' } }}>
                  Voir tout
                </Button>
              } />
            <CardContent sx={{ p: 0 }}>
              {loading ? (
                <Box sx={{ p: 2 }}>{[1,2,3].map(i => <Skeleton key={i} height={52} sx={{ mb: 0.5, borderRadius: 2 }} />)}</Box>
              ) : expiring.length === 0 ? (
                <Box sx={{ textAlign: 'center', py: 5 }}>
                  <CheckIcon sx={{ fontSize: 36, color: '#2e7d32', opacity: 0.5, mb: 0.75 }} />
                  <Typography variant="caption" color="text.secondary" display="block">
                    Aucun contrat expirant prochainement
                  </Typography>
                </Box>
              ) : expiring.map((c, i) => {
                const days = c.date_fin
                  ? Math.ceil((new Date(c.date_fin) - new Date()) / 86400000) : null;
                const urg  = progressColor(days ?? 99);
                return (
                  <React.Fragment key={c.id}>
                    <Box sx={{ px: 2.5, py: 1.5, display: 'flex', alignItems: 'center', gap: 1.75,
                      '&:hover': { bgcolor: '#f8fafc' } }}>
                      <Avatar sx={{ bgcolor: `${urg}12`, width: 34, height: 34, borderRadius: 1.5, flexShrink: 0 }}>
                        <ContractIcon sx={{ color: urg, fontSize: 16 }} />
                      </Avatar>
                      <Box sx={{ flex: 1, minWidth: 0 }}>
                        <Typography sx={{ fontSize: '0.85rem', fontWeight: 600, color: '#1e293b' }} noWrap>
                          {c.employee_name || '—'}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {c.type} · expire le {c.date_fin ? format(new Date(c.date_fin), 'dd MMM yyyy', { locale: fr }) : '—'}
                        </Typography>
                      </Box>
                      {days !== null && (
                        <Chip label={`J-${days}`} size="small"
                          sx={{ bgcolor: `${urg}12`, color: urg, fontWeight: 700, fontSize: '0.68rem', height: 22 }} />
                      )}
                    </Box>
                    {i < expiring.length - 1 && <Divider />}
                  </React.Fragment>
                );
              })}
            </CardContent>
          </Card>
        </Grid>

        {/* ── Derniers utilisateurs ── */}
        <Grid item xs={12} md={6}>
          <Card elevation={0} sx={{ borderRadius: 3, border: '1px solid #e8ecf0', overflow: 'hidden', height: '100%' }}>
            <NavHeader title="Derniers comptes créés" icon={<UsersIcon />}
              action={
                <Button size="small" endIcon={<ArrowIcon sx={{ fontSize: 13 }} />}
                  onClick={() => navigate('/admin/users')}
                  sx={{ color: 'rgba(255,255,255,0.7)', textTransform: 'none', fontSize: '0.75rem',
                    '&:hover': { color: 'white' } }}>
                  Gérer
                </Button>
              } />
            <CardContent sx={{ p: 0 }}>
              {loading ? (
                <Box sx={{ p: 2 }}>{[1,2,3].map(i => <Skeleton key={i} height={52} sx={{ mb: 0.5, borderRadius: 2 }} />)}</Box>
              ) : recentUsers.length === 0 ? (
                <Box sx={{ textAlign: 'center', py: 5 }}>
                  <UsersIcon sx={{ fontSize: 36, color: '#cbd5e1', mb: 0.75 }} />
                  <Typography variant="caption" color="text.secondary" display="block">Aucun utilisateur</Typography>
                </Box>
              ) : recentUsers.map((u, i) => {
                const name = `${u.first_name || ''} ${u.last_name || ''}`.trim() || u.username;
                const rc = roleConfig[u.role] || roleConfig.employee;
                return (
                  <React.Fragment key={u.id}>
                    <Box sx={{ px: 2.5, py: 1.25, display: 'flex', alignItems: 'center', gap: 1.5,
                      '&:hover': { bgcolor: '#f8fafc' } }}>
                      <Avatar sx={{ bgcolor: avatarColor(name), width: 32, height: 32,
                        fontSize: '0.75rem', fontWeight: 700, flexShrink: 0 }}>
                        {name[0]?.toUpperCase() || '?'}
                      </Avatar>
                      <Box sx={{ flex: 1, minWidth: 0 }}>
                        <Typography sx={{ fontSize: '0.82rem', fontWeight: 600, color: '#1e293b' }} noWrap>
                          {name}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">@{u.username}</Typography>
                      </Box>
                      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 0.3, flexShrink: 0 }}>
                        <Chip label={rc.label} size="small"
                          sx={{ bgcolor: rc.bg, color: rc.color, fontWeight: 700, fontSize: '0.62rem', height: 18 }} />
                        {u.date_joined && (
                          <Typography sx={{ fontSize: '0.65rem', color: '#94a3b8' }}>
                            {format(new Date(u.date_joined), 'dd MMM yyyy', { locale: fr })}
                          </Typography>
                        )}
                      </Box>
                    </Box>
                    {i < recentUsers.length - 1 && <Divider />}
                  </React.Fragment>
                );
              })}
            </CardContent>
          </Card>
        </Grid>

      </Grid>

      {/* ── Accès rapide ── */}
      <Card elevation={0} sx={{ mt: 3, borderRadius: 3, border: '1px solid #e8ecf0', overflow: 'hidden' }}>
        <NavHeader title="Accès rapide" icon={<AdminIcon />} />
        <CardContent sx={{ p: 2 }}>
          <Grid container spacing={1.5}>
            {quickLinks.map((link, i) => (
              <Grid item xs={6} sm={4} md={3} key={i}>
                <Box onClick={() => navigate(link.path)}
                  sx={{ display: 'flex', alignItems: 'center', gap: 1.5, p: 1.5, borderRadius: 2,
                    border: '1px solid #e8ecf0', bgcolor: '#f8fafc', cursor: 'pointer',
                    transition: 'all 0.18s',
                    '&:hover': { bgcolor: link.bg, borderColor: `${link.color}30`,
                      transform: 'translateX(3px)', boxShadow: `0 2px 8px ${link.color}12` } }}>
                  <Avatar sx={{ bgcolor: link.bg, width: 34, height: 34, flexShrink: 0 }}>
                    {React.cloneElement(link.icon, { sx: { color: link.color, fontSize: 16 } })}
                  </Avatar>
                  <Typography sx={{ fontSize: '0.78rem', fontWeight: 600, color: '#334155', lineHeight: 1.3 }}>
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
};

export default AdminSpecialDashboard;
