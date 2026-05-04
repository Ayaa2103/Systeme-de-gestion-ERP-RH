import React from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Avatar,
  Button,
  Divider
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  People as PeopleIcon,
  Assignment as AssignmentIcon,
  ArrowForwardIos as ArrowForwardIosIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

// Axelor-inspired color palette
const COLORS = {
  primary: '#0066CC',
  primaryLight: '#E6F0FF',
  secondary: '#2A9D8F',
  accent: '#F59E0B',
  bgLight: '#F7FAFC',
  bgCard: '#FFFFFF',
  textDark: '#1A202C',
  textMuted: '#718096',
  borderLight: '#E2E8F0',
};

const AdminSpecialDashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const stats = [
    { label: 'Employés', value: '128', subtitle: 'Profils actifs', color: COLORS.primary },
    { label: 'Contrats', value: '34', subtitle: 'Actifs / à jour', color: COLORS.secondary },
    { label: 'Demandes', value: '19', subtitle: 'En attente', color: COLORS.accent }
  ];

  const adminModules = [
    {
      title: 'Employés',
      description: 'Gérez les profils, fiches de paie et développement',
      icon: <PeopleIcon />,
      color: COLORS.primary,
      action: () => navigate('/employees')
    },
    {
      title: 'Contrats',
      description: 'Consultez et gérez tous les contrats actifs',
      icon: <AssignmentIcon />,
      color: COLORS.secondary,
      action: () => navigate('/contracts')
    },
    {
      title: 'Tableau de bord',
      description: 'Vue d\'ensemble des indicateurs clés',
      icon: <DashboardIcon />,
      color: COLORS.accent,
      action: () => navigate('/dashboard')
    }
  ];

  const StatCard = ({ stat }) => (
    <Card
      elevation={0}
      sx={{
        backgroundColor: COLORS.bgCard,
        borderRadius: 3,
        border: `1px solid ${COLORS.borderLight}`,
        transition: 'all 0.3s ease',
        '&:hover': {
          boxShadow: '0 4px 12px rgba(0, 102, 204, 0.08)',
          transform: 'translateY(-2px)',
        }
      }}
    >
      <CardContent sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: 2 }}>
          <Box>
            <Typography variant="body2" sx={{ color: COLORS.textMuted, fontWeight: 500, letterSpacing: 0.5 }}>
              {stat.label}
            </Typography>
            <Typography variant="h3" sx={{ color: stat.color, fontWeight: 700, mt: 1 }}>
              {stat.value}
            </Typography>
          </Box>
          <Avatar
            sx={{
              width: 56,
              height: 56,
              backgroundColor: `${stat.color}15`,
              color: stat.color,
            }}
          >
            {stat.label === 'Employés' && <PeopleIcon />}
            {stat.label === 'Contrats' && <AssignmentIcon />}
            {stat.label === 'Demandes' && <AssignmentIcon />}
          </Avatar>
        </Box>
        <Typography variant="body2" sx={{ color: COLORS.textMuted }}>
          {stat.subtitle}
        </Typography>
      </CardContent>
    </Card>
  );

  const ModuleCard = ({ module }) => (
    <Card
      elevation={0}
      onClick={module.action}
      sx={{
        backgroundColor: COLORS.bgCard,
        borderRadius: 3,
        border: `1px solid ${COLORS.borderLight}`,
        cursor: 'pointer',
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        '&:hover': {
          boxShadow: '0 12px 24px rgba(26, 32, 44, 0.08)',
          transform: 'translateY(-4px)',
          borderColor: module.color,
        }
      }}
    >
      <CardContent sx={{ p: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 3, mb: 3 }}>
          <Avatar
            sx={{
              width: 64,
              height: 64,
              backgroundColor: `${module.color}12`,
              color: module.color,
              boxShadow: `0 4px 12px ${module.color}15`,
            }}
          >
            {module.icon}
          </Avatar>
          <Box sx={{ flex: 1 }}>
            <Typography variant="h6" sx={{ color: COLORS.textDark, fontWeight: 700, mb: 1 }}>
              {module.title}
            </Typography>
            <Typography variant="body2" sx={{ color: COLORS.textMuted, lineHeight: 1.6 }}>
              {module.description}
            </Typography>
          </Box>
        </Box>
        <Divider sx={{ my: 3, borderColor: COLORS.borderLight }} />
        <Button
          variant="text"
          endIcon={<ArrowForwardIosIcon sx={{ fontSize: 14 }} />}
          sx={{
            color: module.color,
            fontWeight: 700,
            textTransform: 'none',
            fontSize: '0.95rem',
            '&:hover': {
              backgroundColor: `${module.color}08`,
            }
          }}
        >
          Accéder
        </Button>
      </CardContent>
    </Card>
  );

  return (
    <Box sx={{ backgroundColor: COLORS.bgLight, minHeight: '100vh', p: { xs: 2, sm: 3, md: 4 } }}>
      {/* Header */}
      <Box sx={{ mb: 6 }}>
        <Box sx={{ mb: 3 }}>
          <Typography
            variant="h3"
            sx={{
              color: COLORS.textDark,
              fontWeight: 800,
              fontSize: { xs: '1.75rem', md: '2.5rem' },
              letterSpacing: -0.5,
              mb: 2
            }}
          >
            Espace Administrateur
          </Typography>
          <Typography
            variant="body1"
            sx={{
              color: COLORS.textMuted,
              fontSize: '1.05rem',
              maxWidth: 600,
              lineHeight: 1.7
            }}
          >
            Bienvenue {user?.first_name || 'Administrateur'}. Pilotez l'ensemble de votre gestion RH depuis une interface épurée et performante.
          </Typography>
        </Box>
      </Box>

      {/* Stats Grid */}
      <Grid container spacing={3} sx={{ mb: 6 }}>
        {stats.map((stat) => (
          <Grid item xs={12} sm={6} md={4} key={stat.label}>
            <StatCard stat={stat} />
          </Grid>
        ))}
      </Grid>

      {/* Modules Grid */}
      <Box sx={{ mb: 4 }}>
        <Typography
          variant="h6"
          sx={{
            color: COLORS.textDark,
            fontWeight: 700,
            mb: 3,
            fontSize: '1rem',
            letterSpacing: 0.3,
            textTransform: 'uppercase',
            opacity: 0.8
          }}
        >
          Modules Disponibles
        </Typography>
      </Box>

      <Grid container spacing={3} sx={{ mb: 6 }}>
        {adminModules.map((module) => (
          <Grid item xs={12} md={4} key={module.title}>
            <ModuleCard module={module} />
          </Grid>
        ))}
      </Grid>

      {/* Quick Actions */}
      <Card
        elevation={0}
        sx={{
          backgroundColor: COLORS.bgCard,
          borderRadius: 3,
          border: `1px solid ${COLORS.borderLight}`,
        }}
      >
        <CardContent sx={{ p: 4 }}>
          <Typography variant="h6" sx={{ color: COLORS.textDark, fontWeight: 700, mb: 3 }}>
            Actions Rapides
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <Button
                variant="contained"
                fullWidth
                onClick={() => navigate('/employees/create')}
                sx={{
                  backgroundColor: COLORS.primary,
                  py: 2,
                  borderRadius: 2,
                  fontWeight: 700,
                  textTransform: 'none',
                  fontSize: '0.95rem',
                  boxShadow: `0 4px 12px ${COLORS.primary}20`,
                  '&:hover': {
                    backgroundColor: '#0052A3',
                    boxShadow: `0 8px 20px ${COLORS.primary}30`,
                  }
                }}
              >
                Créer un Employé
              </Button>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Button
                variant="outlined"
                fullWidth
                onClick={() => navigate('/contracts')}
                sx={{
                  borderColor: COLORS.borderLight,
                  color: COLORS.primary,
                  py: 2,
                  borderRadius: 2,
                  fontWeight: 700,
                  textTransform: 'none',
                  fontSize: '0.95rem',
                  '&:hover': {
                    borderColor: COLORS.primary,
                    backgroundColor: COLORS.primaryLight,
                  }
                }}
              >
                Voir les Contrats
              </Button>
            </Grid>
          </Grid>
        </CardContent>
      </Card>
    </Box>
  );
};

export default AdminSpecialDashboard;
