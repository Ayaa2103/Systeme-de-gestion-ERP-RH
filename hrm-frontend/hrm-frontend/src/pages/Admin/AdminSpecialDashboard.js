import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Avatar,
  Button,
  Chip,
  Divider,
  LinearProgress,
  Skeleton,
  IconButton,
  Tooltip
} from '@mui/material';
import {
  People as PeopleIcon,
  Settings as SettingsIcon,
  Security as SecurityIcon,
  AdminPanelSettings as AdminIcon,
  Assignment as ContractIcon,
  Inbox as RequestIcon,
  Warning as WarningIcon,
  TrendingUp as TrendingIcon,
  ArrowForward as ArrowIcon,
  CalendarToday as CalendarIcon,
  CheckCircle as CheckIcon,
  Build as BuildIcon,
  Storage as StorageIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { getEmployees, getPendingRequests, getExpiringContracts, getContracts } from '../../services/hrService';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

const StatCard = ({ title, value, subtitle, icon, color, loading, onClick }) => (
  <Card
    elevation={0}
    onClick={onClick}
    sx={{
      border: '1px solid',
      borderColor: `${color}25`,
      borderRadius: 3,
      cursor: onClick ? 'pointer' : 'default',
      transition: 'all 0.25s ease',
      '&:hover': onClick ? {
        transform: 'translateY(-3px)',
        boxShadow: `0 8px 24px ${color}20`,
        borderColor: `${color}50`,
      } : {},
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

const ModuleCard = ({ title, description, icon, color, badge, onClick }) => (
  <Card
    elevation={0}
    onClick={onClick}
    sx={{
      border: '1px solid #e8ecf0',
      borderRadius: 3,
      cursor: 'pointer',
      transition: 'all 0.25s ease',
      height: '100%',
      '&:hover': {
        transform: 'translateY(-4px)',
        boxShadow: `0 12px 30px ${color}20`,
        borderColor: `${color}40`,
      },
    }}
  >
    <CardContent sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
        <Avatar sx={{ bgcolor: `${color}15`, width: 48, height: 48, mr: 2 }}>
          {React.cloneElement(icon, { sx: { color, fontSize: 24 } })}
        </Avatar>
        {badge != null && (
          <Chip
            label={badge}
            size="small"
            sx={{ ml: 'auto', bgcolor: `${color}15`, color, fontWeight: 600 }}
          />
        )}
      </Box>
      <Typography variant="subtitle1" fontWeight={600} gutterBottom>
        {title}
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        {description}
      </Typography>
      <Box sx={{ display: 'flex', alignItems: 'center', color }}>
        <Typography variant="caption" fontWeight={600}>
          Accéder
        </Typography>
        <ArrowIcon sx={{ fontSize: 14, ml: 0.5 }} />
      </Box>
    </CardContent>
  </Card>
);

const AdminSpecialDashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalEmployees: 0,
    activeContracts: 0,
    pendingRequests: 0,
    expiringContracts: 0,
  });

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const [empRes, contractsRes, pendingRes, expiringRes] = await Promise.allSettled([
        getEmployees(),
        getContracts({ active: true }),
        getPendingRequests(),
        getExpiringContracts(),
      ]);

      const employees = empRes.status === 'fulfilled' ? empRes.value.data : [];
      const contracts = contractsRes.status === 'fulfilled' ? contractsRes.value.data : [];
      const pending = pendingRes.status === 'fulfilled' ? pendingRes.value.data : [];
      const expiring = expiringRes.status === 'fulfilled' ? expiringRes.value.data : [];

      const countList = (d) => (Array.isArray(d) ? d.length : d?.results?.length ?? d?.count ?? 0);

      setStats({
        totalEmployees: countList(employees),
        activeContracts: countList(contracts),
        pendingRequests: countList(pending),
        expiringContracts: countList(expiring),
      });
    } catch (_) {
    } finally {
      setLoading(false);
    }
  };

  const today = format(new Date(), "EEEE d MMMM yyyy", { locale: fr });

  const modules = [
    {
      title: 'Gestion des Employés',
      description: 'Consulter, créer et modifier les profils employés',
      icon: <PeopleIcon />,
      color: '#1976d2',
      badge: stats.totalEmployees,
      action: () => navigate('/employees'),
    },
    {
      title: 'Gestion des Contrats',
      description: 'Suivre les contrats actifs et les renouvellements',
      icon: <ContractIcon />,
      color: '#2e7d32',
      badge: stats.expiringContracts > 0 ? `${stats.expiringContracts} expirent` : null,
      action: () => navigate('/contracts'),
    },
    {
      title: 'Gestion des Utilisateurs',
      description: 'Administrer les comptes et rôles utilisateurs',
      icon: <AdminIcon />,
      color: '#9c27b0',
      badge: null,
      action: () => window.open('http://localhost:8000/admin/core/user/', '_blank'),
    },
    {
      title: 'Droits & Sécurité',
      description: 'Configurer les permissions et groupes d\'accès',
      icon: <SecurityIcon />,
      color: '#e65100',
      badge: null,
      action: () => window.open('http://localhost:8000/admin/auth/group/', '_blank'),
    },
  ];

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
        <Box
          sx={{
            position: 'absolute',
            top: -40,
            right: -40,
            width: 200,
            height: 200,
            borderRadius: '50%',
            background: 'rgba(255,255,255,0.05)',
          }}
        />
        <Box
          sx={{
            position: 'absolute',
            bottom: -60,
            right: 80,
            width: 150,
            height: 150,
            borderRadius: '50%',
            background: 'rgba(255,255,255,0.04)',
          }}
        />
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
                Bonjour, {user?.first_name} {user?.last_name} 👋
              </Typography>
              <Typography variant="body1" sx={{ opacity: 0.85 }}>
                Tableau de bord Administrateur — vue d'ensemble du système RH
              </Typography>
            </Grid>
            <Grid item xs={12} md={4} sx={{ textAlign: { md: 'right' } }}>
              <Chip
                icon={<CheckIcon sx={{ color: 'white !important' }} />}
                label="Système opérationnel"
                sx={{
                  bgcolor: 'rgba(76,175,80,0.3)',
                  color: 'white',
                  border: '1px solid rgba(76,175,80,0.5)',
                  fontWeight: 600,
                  mb: 1,
                }}
              />
              <Box>
                <Button
                  variant="contained"
                  size="small"
                  sx={{
                    bgcolor: 'rgba(255,255,255,0.2)',
                    color: 'white',
                    '&:hover': { bgcolor: 'rgba(255,255,255,0.3)' },
                    textTransform: 'none',
                  }}
                  onClick={() => window.open('http://localhost:8000/admin/', '_blank')}
                  startIcon={<BuildIcon />}
                >
                  Admin Django
                </Button>
              </Box>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* KPI Stats */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Total Employés"
            value={stats.totalEmployees}
            subtitle="Tous statuts confondus"
            icon={<PeopleIcon />}
            color="#1976d2"
            loading={loading}
            onClick={() => navigate('/employees')}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Contrats Actifs"
            value={stats.activeContracts}
            subtitle="En cours de validité"
            icon={<ContractIcon />}
            color="#2e7d32"
            loading={loading}
            onClick={() => navigate('/contracts')}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Demandes En Attente"
            value={stats.pendingRequests}
            subtitle="Nécessitent une action"
            icon={<RequestIcon />}
            color="#f57c00"
            loading={loading}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Contrats Expirant"
            value={stats.expiringContracts}
            subtitle="Dans les 30 prochains jours"
            icon={<WarningIcon />}
            color={stats.expiringContracts > 0 ? '#d32f2f' : '#757575'}
            loading={loading}
            onClick={() => navigate('/contracts')}
          />
        </Grid>
      </Grid>

      {/* Modules */}
      <Typography variant="h6" fontWeight={700} sx={{ mb: 2 }}>
        Modules d'Administration
      </Typography>
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {modules.map((mod, i) => (
          <Grid item xs={12} sm={6} md={3} key={i}>
            <ModuleCard
              title={mod.title}
              description={mod.description}
              icon={mod.icon}
              color={mod.color}
              badge={mod.badge}
              onClick={mod.action}
            />
          </Grid>
        ))}
      </Grid>

      {/* Accès Système */}
      <Typography variant="h6" fontWeight={700} sx={{ mb: 2 }}>
        Accès Système
      </Typography>
      <Card elevation={0} sx={{ border: '1px solid #e8ecf0', borderRadius: 3 }}>
        <CardContent sx={{ p: 3 }}>
          <Grid container spacing={2}>
            {[
              {
                label: 'Interface Admin Django',
                desc: 'Accès complet à l\'administration Django',
                icon: <AdminIcon />,
                color: '#1976d2',
                url: 'http://localhost:8000/admin/',
              },
              {
                label: 'Gestion des Utilisateurs',
                desc: 'Créer et modifier les comptes utilisateurs',
                icon: <PeopleIcon />,
                color: '#9c27b0',
                url: 'http://localhost:8000/admin/core/user/',
              },
              {
                label: 'Base de Données',
                desc: 'Accès direct aux tables de données',
                icon: <StorageIcon />,
                color: '#e65100',
                url: 'http://localhost:8000/admin/',
              },
              {
                label: 'Groupes & Permissions',
                desc: 'Gérer les rôles et droits d\'accès',
                icon: <SecurityIcon />,
                color: '#2e7d32',
                url: 'http://localhost:8000/admin/auth/group/',
              },
            ].map((item, i) => (
              <Grid item xs={12} sm={6} key={i}>
                <Box
                  onClick={() => window.open(item.url, '_blank')}
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    p: 2,
                    borderRadius: 2,
                    border: '1px solid #e8ecf0',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    '&:hover': { bgcolor: '#f8fafc', borderColor: item.color + '40' },
                  }}
                >
                  <Avatar sx={{ bgcolor: `${item.color}15`, width: 40, height: 40, mr: 2 }}>
                    {React.cloneElement(item.icon, { sx: { color: item.color, fontSize: 20 } })}
                  </Avatar>
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="body2" fontWeight={600}>
                      {item.label}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {item.desc}
                    </Typography>
                  </Box>
                  <ArrowIcon sx={{ color: 'text.disabled', fontSize: 18 }} />
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
