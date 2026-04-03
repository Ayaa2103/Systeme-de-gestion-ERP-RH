import React from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Avatar,
  Button
} from '@mui/material';
import {
  People as PeopleIcon,
  Assignment as AssignmentIcon,
  Work as WorkIcon,
  School as SchoolIcon,
  Event as EventIcon,
  Business as BusinessIcon,
  Psychology as PsychologyIcon,
  PersonAdd as PersonAddIcon,
  CorporateFare as CorporateIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

const AdminDashboard = () => {
  const navigate = useNavigate();

  const adminModules = [
    {
      title: 'Utilisateurs',
      description: 'Gestion des utilisateurs et rôles',
      icon: <PeopleIcon />,
      color: '#1976d2',
      path: '/admin/users',
      count: 'Tous les utilisateurs'
    },
    {
      title: 'Employés',
      description: 'Profils, contrats, formations',
      icon: <PersonAddIcon />,
      color: '#2e7d32',
      path: '/employees',
      count: 'Gestion complète'
    },
    {
      title: 'Demandes',
      description: 'Congés, attestations, missions, bulletins',
      icon: <AssignmentIcon />,
      color: '#ed6c02',
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
      sx={{
        background: `linear-gradient(135deg, ${module.color}15 0%, ${module.color}05 100%)`,
        border: `1px solid ${module.color}20`,
        borderRadius: 3,
        transition: 'all 0.3s ease',
        cursor: 'pointer',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: `0 8px 25px ${module.color}25`,
        }
      }}
      onClick={() => navigate(module.path)}
    >
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <Avatar
            sx={{
              backgroundColor: module.color,
              width: 56,
              height: 56,
              mr: 2
            }}
          >
            {module.icon}
          </Avatar>
          <Box sx={{ flex: 1 }}>
            <Typography variant="h6" fontWeight="600">
              {module.title}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {module.count}
            </Typography>
          </Box>
        </Box>
        <Typography variant="body2" color="text.secondary">
          {module.description}
        </Typography>
      </CardContent>
    </Card>
  );

  return (
    <Box>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" fontWeight="bold" gutterBottom>
          Administration Système
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Gestion complète de tous les modules du système HRM
        </Typography>
      </Box>

      <Grid container spacing={3}>
        {adminModules.map((module, index) => (
          <Grid item xs={12} sm={6} md={4} lg={3} key={index}>
            <ModuleCard module={module} />
          </Grid>
        ))}
      </Grid>

      <Box sx={{ mt: 4, p: 3, backgroundColor: '#f8fafc', borderRadius: 2 }}>
        <Typography variant="h6" fontWeight="600" gutterBottom>
          🔧 Accès Admin Django
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Pour un accès complet à l'administration système, utilisez l'interface Django native.
        </Typography>
        <Button
          variant="outlined"
          onClick={() => window.open('http://localhost:8000/admin/', '_blank')}
        >
          Ouvrir Admin Django
        </Button>
      </Box>
    </Box>
  );
};

export default AdminDashboard;