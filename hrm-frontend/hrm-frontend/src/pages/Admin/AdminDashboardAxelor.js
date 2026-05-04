import React from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Avatar,
  Divider
} from '@mui/material';
import {
  People as PeopleIcon,
  Assignment as AssignmentIcon,
  Work as WorkIcon,
  School as SchoolIcon,
  Event as EventIcon,
  Business as BusinessIcon,
  Psychology as PsychologyIcon,
  CorporateFare as CorporateIcon,
  Analytics as AnalyticsIcon,
  Settings as SettingsIcon,
  ArrowForwardIos as ArrowForwardIosIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

// Axelor-inspired color palette
const COLORS = {
  primary: '#0066CC',
  secondary: '#2A9D8F',
  accent: '#F59E0B',
  bgLight: '#F7FAFC',
  bgCard: '#FFFFFF',
  textDark: '#1A202C',
  textMuted: '#718096',
  borderLight: '#E2E8F0',
};

const AdminDashboard = () => {
  const navigate = useNavigate();

  const adminModules = [
    {
      title: 'Tableau de bord',
      description: 'Accéder à votre tableau de bord principal',
      icon: <PeopleIcon />,
      color: '#0066CC',
      path: '/dashboard',
      count: 'Vue principale'
    },
    {
      title: 'Employés',
      description: 'Profils, contrats, formations',
      icon: <PeopleIcon />,
      color: '#2A9D8F',
      path: '/employees',
      count: 'Gestion complète'
    },
    {
      title: 'Demandes',
      description: 'Congés, attestations, missions, bulletins',
      icon: <AssignmentIcon />,
      color: '#F59E0B',
      path: '/manage-requests',
      count: 'Toutes les demandes'
    },
    {
      title: 'Recrutement',
      description: 'Offres, candidatures, entretiens',
      icon: <WorkIcon />,
      color: '#9c27b0',
      path: '/recruitment',
      count: 'Processus complet'
    },
    {
      title: 'Intégration',
      description: 'Plans, tâches, formations, suivis',
      icon: <SchoolIcon />,
      color: '#00bcd4',
      path: '/onboarding',
      count: 'Onboarding complet'
    },
    {
      title: 'Connaissances',
      description: 'Compétences, postes, documents',
      icon: <PsychologyIcon />,
      color: '#ff5722',
      path: '/knowledge',
      count: 'Gestion des savoirs'
    },
    {
      title: 'Événements',
      description: 'Événements d\'entreprise',
      icon: <EventIcon />,
      color: '#795548',
      path: '/events',
      count: 'Calendrier complet'
    },
    {
      title: 'Culture d\'Entreprise',
      description: 'Pages culture, suggestions',
      icon: <CorporateIcon />,
      color: '#607d8b',
      path: '/culture',
      count: 'Contenu culturel'
    }
  ];

  const ModuleCard = ({ module }) => (
    <Card
      elevation={0}
      onClick={() => navigate(module.path)}
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
      <CardContent sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2, mb: 2 }}>
          <Avatar
            sx={{
              width: 56,
              height: 56,
              backgroundColor: `${module.color}12`,
              color: module.color,
              boxShadow: `0 2px 8px ${module.color}15`,
            }}
          >
            {module.icon}
          </Avatar>
          <Box sx={{ flex: 1 }}>
            <Typography variant="h6" sx={{ color: COLORS.textDark, fontWeight: 700, mb: 0.5 }}>
              {module.title}
            </Typography>
            <Typography variant="caption" sx={{ color: COLORS.textMuted, fontWeight: 600, letterSpacing: 0.3 }}>
              {module.count}
            </Typography>
          </Box>
        </Box>
        <Typography variant="body2" sx={{ color: COLORS.textMuted, lineHeight: 1.5, mb: 2 }}>
          {module.description}
        </Typography>
        <Divider sx={{ my: 2, borderColor: COLORS.borderLight }} />
        <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
          <ArrowForwardIosIcon sx={{ fontSize: 14, color: module.color, opacity: 0.6 }} />
        </Box>
      </CardContent>
    </Card>
  );

  return (
    <Box sx={{ backgroundColor: COLORS.bgLight, minHeight: '100vh', p: { xs: 2, sm: 3, md: 4 } }}>
      {/* Header */}
      <Box sx={{ mb: 6 }}>
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
          Administration Système
        </Typography>
        <Typography
          variant="body1"
          sx={{
            color: COLORS.textMuted,
            fontSize: '1.05rem',
            maxWidth: 700,
            lineHeight: 1.7
          }}
        >
          Gestion complète de tous les modules du système. Accédez à chaque section pour piloter votre activité RH en toute simplicité.
        </Typography>
      </Box>

      {/* Modules Grid */}
      <Grid container spacing={3}>
        {adminModules.map((module, index) => (
          <Grid item xs={12} sm={6} md={4} lg={3} key={index}>
            <ModuleCard module={module} />
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default AdminDashboard;
