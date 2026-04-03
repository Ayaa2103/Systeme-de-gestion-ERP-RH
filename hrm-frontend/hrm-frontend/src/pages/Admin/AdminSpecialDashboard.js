import React from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Avatar,
  Button,
  List,
  ListItem,
  ListItemText,
  ListItemIcon
} from '@mui/material';
import {
  People as PeopleIcon,
  Settings as SettingsIcon,
  Security as SecurityIcon,
  Storage as StorageIcon,
  AdminPanelSettings as AdminIcon,
  Build as BuildIcon,
  Backup as BackupIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const AdminSpecialDashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const adminModules = [
    {
      title: 'Gestion des Employés',
      description: 'Ajouter, modifier, supprimer des employés',
      icon: <PeopleIcon />,
      color: '#1976d2',
      action: () => navigate('/employees')
    },
    {
      title: 'Gestion des Utilisateurs',
      description: 'Gérer les comptes utilisateurs',
      icon: <AdminIcon />,
      color: '#9c27b0',
      action: () => window.open('http://localhost:8000/admin/core/user/', '_blank')
    },
    {
      title: 'Gestion Système',
      description: 'Configuration et sauvegarde',
      icon: <SettingsIcon />,
      color: '#ff5722',
      action: () => window.open('http://localhost:8000/admin/', '_blank')
    },
    {
      title: 'Droits d\'Accès',
      description: 'Gérer les permissions',
      icon: <SecurityIcon />,
      color: '#795548',
      action: () => window.open('http://localhost:8000/admin/auth/group/', '_blank')
    }
  ];

  const quickActions = [
    { title: 'Créer Utilisateur', action: () => window.open('http://localhost:8000/admin/core/user/add/', '_blank') },
    { title: 'Gérer Groupes', action: () => window.open('http://localhost:8000/admin/auth/group/', '_blank') }
  ];

  return (
    <Box>
      {/* En-tête Admin */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" fontWeight="bold" gutterBottom>
          Dashboard Administrateur
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Bienvenue, {user?.first_name} {user?.last_name}!
        </Typography>
      </Box>

      {/* Modules d'Administration */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {adminModules.map((module, index) => (
          <Grid item xs={12} sm={6} key={index}>
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
              onClick={module.action}
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
                  </Box>
                </Box>
                <Typography variant="body2" color="text.secondary">
                  {module.description}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Actions Rapides */}
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Card elevation={0} sx={{ border: '1px solid #e0e0e0', borderRadius: 2 }}>
            <CardContent>
              <Typography variant="h6" fontWeight="600" gutterBottom>
                Actions Rapides
              </Typography>
              <List>
                {quickActions.map((action, index) => (
                  <ListItem
                    key={index}
                    button
                    onClick={action.action}
                    sx={{
                      borderRadius: 1,
                      mb: 1,
                      '&:hover': { backgroundColor: '#f5f5f5' }
                    }}
                  >
                    <ListItemIcon>
                      <BuildIcon color="primary" />
                    </ListItemIcon>
                    <ListItemText primary={action.title} />
                  </ListItem>
                ))}
              </List>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card elevation={0} sx={{ border: '1px solid #e0e0e0', borderRadius: 2 }}>
            <CardContent>
              <Typography variant="h6" fontWeight="600" gutterBottom>
                Accès Système
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Button
                  variant="outlined"
                  startIcon={<AdminIcon />}
                  onClick={() => window.open('http://localhost:8000/admin/', '_blank')}
                  fullWidth
                >
                  Interface Admin Django
                </Button>
                <Button
                  variant="outlined"
                  startIcon={<StorageIcon />}
                  onClick={() => window.open('http://localhost:8000/admin/', '_blank')}
                  fullWidth
                >
                  Gestion Base de Données
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default AdminSpecialDashboard;