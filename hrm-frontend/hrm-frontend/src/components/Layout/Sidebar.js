import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import {
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Box,
  Typography,
  Avatar,
  Divider,
  Collapse,
  IconButton,
  Chip,
  Tooltip
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  People as PeopleIcon,
  Assignment as AssignmentIcon,
  Work as WorkIcon,
  School as SchoolIcon,
  Assessment as AssessmentIcon,
  Settings as SettingsIcon,
  ExitToApp as LogoutIcon,
  ExpandLess,
  ExpandMore,
  Person as PersonIcon,
  Business as BusinessIcon,
  RequestPage as RequestIcon,
  Event as EventIcon,
  Policy as PolicyIcon,
  Apartment as DepartmentIcon,
  MenuBook as TrainingIcon,
  Analytics as AnalyticsIcon,
  CorporateFare as CorporateIcon,
  Lightbulb as SuggestionIcon,
  CalendarToday as EventsIcon
} from '@mui/icons-material';

const DRAWER_WIDTH = 280;

const Sidebar = ({ open, onClose }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, employee, logout, hasAnyRole } = useAuth();
  const [expandedMenus, setExpandedMenus] = useState({});

  const handleMenuClick = (menuKey) => {
    setExpandedMenus(prev => ({
      ...prev,
      [menuKey]: !prev[menuKey]
    }));
  };

  const handleNavigation = (path) => {
    navigate(path);
    if (onClose) onClose();
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const getRoleColor = (role) => {
    switch (role) {
      case 'administrator': return '#f44336';
      case 'hr_director': return '#9c27b0';
      case 'hr_manager': return '#2196f3';
      case 'employee': return '#4caf50';
      default: return '#757575';
    }
  };

  const getRoleLabel = (role) => {
    switch (role) {
      case 'administrator': return 'Administrateur';
      case 'hr_director': return 'Directeur RH';
      case 'hr_manager': return 'Responsable RH';
      case 'employee': return 'Employé';
      default: return 'Utilisateur';
    }
  };

  const menuItems = [
    {
      title: 'Tableau de bord',
      icon: <DashboardIcon />,
      path: user?.role === 'administrator' ? '/admin/dashboard' : '/dashboard',
      roles: ['employee', 'hr_manager', 'hr_director', 'administrator']
    },
    {
      title: 'Gestion des employés',
      icon: <PeopleIcon />,
      roles: ['hr_manager', 'hr_director'],
      children: [
        { title: 'Liste des employés', icon: <PersonIcon />, path: '/employees' },
        { title: 'Contrats', icon: <AssignmentIcon />, path: '/contracts' },
      ]
    },
    {
      title: 'Demandes',
      icon: <RequestIcon />,
      roles: ['employee', 'hr_manager', 'hr_director'],
      children: [
        { title: 'Mes demandes', icon: <RequestIcon />, path: '/employee/requests', roles: ['employee'] },
        { title: 'Demande de congé', icon: <RequestIcon />, path: '/employee/requests/create-leave', roles: ['employee'] },
        { title: 'Demande d\'attestation', icon: <AssignmentIcon />, path: '/employee/requests/create-attestation', roles: ['employee'] },
        { title: 'Demande de mission', icon: <WorkIcon />, path: '/employee/requests/create-mission', roles: ['employee'] },
        { title: 'Demande de bulletin', icon: <BusinessIcon />, path: '/employee/requests/create-payslip', roles: ['employee'] },
        { title: 'Gérer les demandes', icon: <AssignmentIcon />, path: '/manage-requests', roles: ['hr_manager', 'hr_director'] },
      ]
    },
    {
      title: 'Formations',
      icon: <TrainingIcon />,
      roles: ['employee', 'hr_manager', 'hr_director'],
      children: [
        { title: 'Mes formations', icon: <SchoolIcon />, path: '/employee/trainings', roles: ['employee'] },
        { title: 'Formation et connaissances', icon: <AssessmentIcon />, path: '/employee/knowledge', roles: ['employee'] },
        { title: 'Gérer formations', icon: <TrainingIcon />, path: '/manage-trainings', roles: ['hr_manager', 'hr_director'] },
        { title: 'Créer formation', icon: <SchoolIcon />, path: '/trainings/create', roles: ['hr_manager'] },
      ]
    },
    {
      title: 'Recrutement',
      icon: <WorkIcon />,
      roles: ['hr_manager', 'hr_director'],
      children: [
        { title: 'Tableau de bord', icon: <AnalyticsIcon />, path: '/recruitment' },
        { title: 'Offres d\'emploi', icon: <WorkIcon />, path: '/job-offers' },
        { title: 'Candidatures', icon: <PersonIcon />, path: '/recruitment/applications' },
        { title: 'Recommandations', icon: <AssessmentIcon />, path: '/recruitment/recommendations' },
      ]
    },
    {
      title: 'Événements',
      icon: <EventsIcon />,
      path: '/employee/events',
      roles: ['employee']
    },
    {
      title: 'Culture d\'entreprise',
      icon: <CorporateIcon />,
      roles: ['employee', 'hr_manager', 'hr_director'],
      children: [
        { title: 'Tableau de bord', icon: <CorporateIcon />, path: '/culture' },
        { title: 'Suggestions', icon: <SuggestionIcon />, path: '/culture/suggestions' },
      ]
    },
    {
      title: 'Gestion des Connaissances',
      icon: <SchoolIcon />,
      roles: ['hr_manager', 'hr_director'],
      children: [
        { title: 'Tableau de bord', icon: <AnalyticsIcon />, path: '/knowledge' },
        { title: 'Matrice Compétences', icon: <AssessmentIcon />, path: '/knowledge/skills-matrix' },
        { title: 'Matrice Polyvalence', icon: <WorkIcon />, path: '/knowledge/versatility-matrix' },
        { title: 'Documents', icon: <BusinessIcon />, path: '/knowledge/documents' },
      ]
    },
    {
      title: 'Gestion Événements',
      icon: <EventsIcon />,
      path: '/events',
      roles: ['hr_manager', 'hr_director']
    },
    {
      title: 'Intégration',
      icon: <PersonIcon />,
      roles: ['hr_manager', 'hr_director'],
      children: [
        { title: 'Tableau de bord', icon: <DashboardIcon />, path: '/onboarding' },
        { title: 'Ajouter employé', icon: <PersonIcon />, path: '/onboarding/add-employee' },
        { title: 'Liste employés', icon: <PeopleIcon />, path: '/onboarding/employees' },
        { title: 'Tâches', icon: <SchoolIcon />, path: '/onboarding/tasks' },
      ]
    },
    {
      title: 'Analyses & KPIs',
      icon: <AnalyticsIcon />,
      path: '/kpi-dashboard',
      roles: ['hr_director']
    },
    {
      title: 'Administration',
      icon: <SettingsIcon />,
      path: '/admin',
      roles: ['administrator']
    },
  ];

  const filteredMenuItems = menuItems.filter(item => 
    !item.roles || hasAnyRole(item.roles)
  );

  const isActive = (path) => location.pathname === path;

  return (
    <Drawer
      variant="permanent"
      sx={{
        width: DRAWER_WIDTH,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: DRAWER_WIDTH,
          boxSizing: 'border-box',
          background: 'linear-gradient(180deg, #1a237e 0%, #283593 50%, #3949ab 100%)',
          color: 'white',
          borderRight: 'none',
        },
      }}
    >
      <Box
        sx={{
          p: 3,
          background: 'rgba(0, 0, 0, 0.2)',
          borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
        }}
      >
        <Box 
          sx={{ display: 'flex', alignItems: 'center', mb: 2, cursor: 'pointer' }}
          onClick={() => handleNavigation('/profile')}
        >
          <Avatar
            sx={{
              width: 50,
              height: 50,
              mr: 2,
              background: 'linear-gradient(135deg, #42a5f5 0%, #1976d2 100%)',
              border: '2px solid rgba(255, 255, 255, 0.2)',
            }}
          >
            {user?.first_name?.[0] || user?.username?.[0] || 'U'}
          </Avatar>
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography variant="subtitle1" fontWeight="600" noWrap>
              {user?.first_name} {user?.last_name}
            </Typography>
            <Typography variant="body2" sx={{ opacity: 0.8 }} noWrap>
              {employee?.poste || 'Utilisateur'}
            </Typography>
          </Box>
        </Box>
        <Chip
          label={getRoleLabel(user?.role)}
          size="small"
          sx={{
            backgroundColor: getRoleColor(user?.role),
            color: 'white',
            fontWeight: 500,
            fontSize: '0.75rem',
          }}
        />
      </Box>

      <List sx={{ flex: 1, py: 1 }}>
        {filteredMenuItems.map((item, index) => (
          <Box key={index}>
            <ListItem disablePadding>
              <ListItemButton
                onClick={() => {
                  if (item.children) {
                    handleMenuClick(item.title);
                  } else {
                    handleNavigation(item.path);
                  }
                }}
                sx={{
                  mx: 1,
                  mb: 0.5,
                  borderRadius: 2,
                  backgroundColor: isActive(item.path) ? 'rgba(255, 255, 255, 0.15)' : 'transparent',
                  '&:hover': {
                    backgroundColor: 'rgba(255, 255, 255, 0.1)',
                  },
                  transition: 'all 0.3s ease',
                }}
              >
                <ListItemIcon sx={{ color: 'inherit', minWidth: 40 }}>
                  {item.icon}
                </ListItemIcon>
                <ListItemText 
                  primary={item.title}
                  primaryTypographyProps={{
                    fontSize: '0.875rem',
                    fontWeight: isActive(item.path) ? 600 : 400,
                  }}
                />
                {item.children && (
                  expandedMenus[item.title] ? <ExpandLess /> : <ExpandMore />
                )}
              </ListItemButton>
            </ListItem>

            {item.children && (
              <Collapse in={expandedMenus[item.title]} timeout="auto" unmountOnExit>
                <List component="div" disablePadding>
                  {item.children
                    .filter(child => !child.roles || hasAnyRole(child.roles))
                    .map((child, childIndex) => (
                    <ListItem key={childIndex} disablePadding>
                      <ListItemButton
                        onClick={() => handleNavigation(child.path)}
                        sx={{
                          pl: 4,
                          mx: 1,
                          mb: 0.5,
                          borderRadius: 2,
                          backgroundColor: isActive(child.path) ? 'rgba(255, 255, 255, 0.15)' : 'transparent',
                          '&:hover': {
                            backgroundColor: 'rgba(255, 255, 255, 0.1)',
                          },
                        }}
                      >
                        <ListItemIcon sx={{ color: 'inherit', minWidth: 36 }}>
                          {child.icon}
                        </ListItemIcon>
                        <ListItemText 
                          primary={child.title}
                          primaryTypographyProps={{
                            fontSize: '0.8rem',
                            fontWeight: isActive(child.path) ? 600 : 400,
                          }}
                        />
                      </ListItemButton>
                    </ListItem>
                  ))}
                </List>
              </Collapse>
            )}
          </Box>
        ))}
      </List>

      <Box sx={{ p: 2, borderTop: '1px solid rgba(255, 255, 255, 0.1)' }}>
        <Tooltip title="Se déconnecter" placement="top">
          <IconButton
            onClick={handleLogout}
            fullWidth
            sx={{
              color: 'white',
              backgroundColor: 'rgba(255, 255, 255, 0.1)',
              borderRadius: 2,
              py: 1.5,
              '&:hover': {
                backgroundColor: 'rgba(255, 255, 255, 0.2)',
              },
            }}
          >
            <LogoutIcon sx={{ mr: 1 }} />
            <Typography variant="body2" fontWeight="500">
              Déconnexion
            </Typography>
          </IconButton>
        </Tooltip>
      </Box>
    </Drawer>
  );
};

export default Sidebar;