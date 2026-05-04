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
  Apartment as DepartmentIcon,
  MenuBook as TrainingIcon,
  Analytics as AnalyticsIcon,
  CorporateFare as CorporateIcon,
  Lightbulb as SuggestionIcon,
  CalendarToday as EventsIcon
} from '@mui/icons-material';

// Axelor-inspired colors
const COLORS = {
  primary: '#0066CC',
  bgLight: '#F7FAFC',
  bgDark: '#FFFFFF',
  textDark: '#1A202C',
  textMuted: '#718096',
  borderLight: '#E2E8F0',
  accent: '#2A9D8F',
};

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
      case 'administrator': return '#F59E0B';
      case 'hr_director': return '#2A9D8F';
      case 'hr_manager': return '#0066CC';
      case 'employee': return '#6C63FF';
      default: return '#718096';
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
      roles: ['hr_manager', 'hr_director', 'administrator'],
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
      path: '/admin/dashboard',
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
          backgroundColor: COLORS.bgDark,
          color: COLORS.textDark,
          borderRight: `1px solid ${COLORS.borderLight}`,
          boxShadow: 'none',
        },
      }}
    >
      {/* Header Profile */}
      <Box
        sx={{
          p: 3,
          backgroundColor: `${COLORS.primary}08`,
          borderBottom: `1px solid ${COLORS.borderLight}`,
        }}
      >
        <Box 
          sx={{ display: 'flex', alignItems: 'center', mb: 2, cursor: 'pointer' }}
          onClick={() => handleNavigation('/profile')}
        >
          <Avatar
            sx={{
              width: 48,
              height: 48,
              mr: 2,
              backgroundColor: COLORS.primary,
              fontWeight: 700,
              color: '#fff',
            }}
          >
            {user?.first_name?.[0] || user?.username?.[0] || 'U'}
          </Avatar>
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography variant="subtitle2" fontWeight="700" noWrap sx={{ color: COLORS.textDark }}>
              {user?.first_name} {user?.last_name}
            </Typography>
            <Typography variant="caption" sx={{ color: COLORS.textMuted }} noWrap>
              {employee?.poste || 'Utilisateur'}
            </Typography>
          </Box>
        </Box>
        <Chip
          label={getRoleLabel(user?.role)}
          size="small"
          sx={{
            backgroundColor: `${getRoleColor(user?.role)}15`,
            color: getRoleColor(user?.role),
            fontWeight: 700,
            fontSize: '0.7rem',
            border: `1px solid ${getRoleColor(user?.role)}30`,
          }}
        />
      </Box>

      {/* Menu Items */}
      <List sx={{ flex: 1, py: 2 }}>
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
                  backgroundColor: isActive(item.path) ? `${COLORS.primary}12` : 'transparent',
                  borderLeft: isActive(item.path) ? `3px solid ${COLORS.primary}` : 'none',
                  pl: isActive(item.path) ? 'calc(1rem - 3px)' : '1rem',
                  '&:hover': {
                    backgroundColor: `${COLORS.primary}08`,
                  },
                  transition: 'all 0.2s ease',
                }}
              >
                <ListItemIcon sx={{ color: isActive(item.path) ? COLORS.primary : COLORS.textMuted, minWidth: 40 }}>
                  {item.icon}
                </ListItemIcon>
                <ListItemText 
                  primary={item.title}
                  primaryTypographyProps={{
                    fontSize: '0.9rem',
                    fontWeight: isActive(item.path) ? 700 : 500,
                    color: isActive(item.path) ? COLORS.primary : COLORS.textDark
                  }}
                />
                {item.children && (
                  expandedMenus[item.title] ? <ExpandLess sx={{ color: COLORS.primary }} /> : <ExpandMore sx={{ color: COLORS.textMuted }} />
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
                          backgroundColor: isActive(child.path) ? `${COLORS.primary}12` : 'transparent',
                          '&:hover': {
                            backgroundColor: `${COLORS.primary}08`,
                          },
                          transition: 'all 0.2s ease',
                        }}
                      >
                        <ListItemIcon sx={{ color: isActive(child.path) ? COLORS.primary : COLORS.textMuted, minWidth: 36 }}>
                          {child.icon}
                        </ListItemIcon>
                        <ListItemText 
                          primary={child.title}
                          primaryTypographyProps={{
                            fontSize: '0.85rem',
                            fontWeight: isActive(child.path) ? 700 : 500,
                            color: isActive(child.path) ? COLORS.primary : COLORS.textDark
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

      {/* Footer Logout */}
      <Box sx={{ p: 2, borderTop: `1px solid ${COLORS.borderLight}`, backgroundColor: `${COLORS.primary}04` }}>
        <Tooltip title="Se déconnecter" placement="top">
          <ListItemButton
            onClick={handleLogout}
            sx={{
              borderRadius: 2,
              py: 1.5,
              backgroundColor: `${COLORS.primary}12`,
              '&:hover': {
                backgroundColor: `${COLORS.primary}20`,
              },
              transition: 'all 0.2s ease',
            }}
          >
            <ListItemIcon sx={{ color: COLORS.primary, minWidth: 40 }}>
              <LogoutIcon />
            </ListItemIcon>
            <ListItemText
              primary="Déconnexion"
              primaryTypographyProps={{ fontSize: '0.9rem', fontWeight: 700, color: COLORS.primary }}
            />
          </ListItemButton>
        </Tooltip>
      </Box>
    </Drawer>
  );
};

export default Sidebar;
