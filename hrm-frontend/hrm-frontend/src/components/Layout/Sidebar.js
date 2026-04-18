import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import {
  Box,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
  Avatar,
  Collapse,
  Tooltip,
  Divider,
  IconButton,
  Chip,
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
  MenuBook as TrainingIcon,
  Analytics as AnalyticsIcon,
  CorporateFare as CorporateIcon,
  Lightbulb as SuggestionIcon,
  CalendarToday as EventsIcon,
  ChevronLeft as CollapseIcon,
  ChevronRight as ExpandIcon,
} from '@mui/icons-material';

export const SIDEBAR_EXPANDED = 240;
export const SIDEBAR_COLLAPSED = 68;

const Sidebar = ({ collapsed, onToggle }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, employee, logout, hasAnyRole } = useAuth();
  const [expandedMenus, setExpandedMenus] = useState({});

  const handleMenuClick = (key) => {
    if (collapsed) return;
    setExpandedMenus(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleNavigation = (path) => navigate(path);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const getRoleColor = (role) => {
    const map = { administrator: '#ef5350', hr_director: '#ab47bc', hr_manager: '#42a5f5', employee: '#66bb6a' };
    return map[role] || '#9e9e9e';
  };

  const getRoleLabel = (role) => {
    const map = { administrator: 'Admin', hr_director: 'Dir. RH', hr_manager: 'Resp. RH', employee: 'Employé' };
    return map[role] || 'Utilisateur';
  };

  const menuItems = [
    {
      title: 'Tableau de bord',
      icon: <DashboardIcon fontSize="small" />,
      path: '/dashboard',
      roles: ['employee', 'hr_manager', 'hr_director', 'administrator'],
    },
    {
      title: 'Employés',
      icon: <PeopleIcon fontSize="small" />,
      roles: ['hr_manager', 'hr_director', 'administrator'],
      children: [
        { title: 'Liste', icon: <PersonIcon fontSize="small" />, path: '/employees' },
        { title: 'Contrats', icon: <AssignmentIcon fontSize="small" />, path: '/contracts' },
      ],
    },
    {
      title: 'Demandes',
      icon: <RequestIcon fontSize="small" />,
      roles: ['employee', 'hr_manager', 'hr_director'],
      children: [
        { title: 'Mes demandes', icon: <RequestIcon fontSize="small" />, path: '/employee/requests', roles: ['employee'] },
        { title: 'Congé', icon: <RequestIcon fontSize="small" />, path: '/employee/requests/create-leave', roles: ['employee'] },
        { title: 'Attestation', icon: <AssignmentIcon fontSize="small" />, path: '/employee/requests/create-attestation', roles: ['employee'] },
        { title: 'Mission', icon: <WorkIcon fontSize="small" />, path: '/employee/requests/create-mission', roles: ['employee'] },
        { title: 'Bulletin', icon: <BusinessIcon fontSize="small" />, path: '/employee/requests/create-payslip', roles: ['employee'] },
        { title: 'Gérer', icon: <AssignmentIcon fontSize="small" />, path: '/manage-requests', roles: ['hr_manager', 'hr_director'] },
      ],
    },
    {
      title: 'Formations',
      icon: <TrainingIcon fontSize="small" />,
      roles: ['employee', 'hr_manager', 'hr_director'],
      children: [
        { title: 'Mes formations', icon: <SchoolIcon fontSize="small" />, path: '/employee/trainings', roles: ['employee'] },
        { title: 'Connaissances', icon: <AssessmentIcon fontSize="small" />, path: '/employee/knowledge', roles: ['employee'] },
        { title: 'Gérer', icon: <TrainingIcon fontSize="small" />, path: '/manage-trainings', roles: ['hr_manager', 'hr_director'] },
        { title: 'Créer', icon: <SchoolIcon fontSize="small" />, path: '/trainings/create', roles: ['hr_manager'] },
      ],
    },
    {
      title: 'Recrutement',
      icon: <WorkIcon fontSize="small" />,
      roles: ['hr_manager', 'hr_director'],
      children: [
        { title: 'Tableau de bord', icon: <AnalyticsIcon fontSize="small" />, path: '/recruitment' },
        { title: 'Offres', icon: <WorkIcon fontSize="small" />, path: '/job-offers' },
        { title: 'Candidatures', icon: <PersonIcon fontSize="small" />, path: '/recruitment/applications' },
        { title: 'Recommandations', icon: <AssessmentIcon fontSize="small" />, path: '/recruitment/recommendations' },
      ],
    },
    {
      title: 'Événements',
      icon: <EventsIcon fontSize="small" />,
      path: '/employee/events',
      roles: ['employee'],
    },
    {
      title: 'Culture',
      icon: <CorporateIcon fontSize="small" />,
      roles: ['employee', 'hr_manager', 'hr_director'],
      children: [
        { title: 'Tableau de bord', icon: <CorporateIcon fontSize="small" />, path: '/culture' },
        { title: 'Suggestions', icon: <SuggestionIcon fontSize="small" />, path: '/culture/suggestions' },
      ],
    },
    {
      title: 'Connaissances',
      icon: <SchoolIcon fontSize="small" />,
      roles: ['hr_manager', 'hr_director'],
      children: [
        { title: 'Tableau de bord', icon: <AnalyticsIcon fontSize="small" />, path: '/knowledge' },
        { title: 'Compétences', icon: <AssessmentIcon fontSize="small" />, path: '/knowledge/skills-matrix' },
        { title: 'Polyvalence', icon: <WorkIcon fontSize="small" />, path: '/knowledge/versatility-matrix' },
        { title: 'Documents', icon: <BusinessIcon fontSize="small" />, path: '/knowledge/documents' },
      ],
    },
    {
      title: 'Événements',
      icon: <EventsIcon fontSize="small" />,
      path: '/events',
      roles: ['hr_manager', 'hr_director'],
    },
    {
      title: 'Intégration',
      icon: <PersonIcon fontSize="small" />,
      roles: ['hr_manager', 'hr_director'],
      children: [
        { title: 'Tableau de bord', icon: <DashboardIcon fontSize="small" />, path: '/onboarding' },
        { title: 'Ajouter', icon: <PersonIcon fontSize="small" />, path: '/onboarding/add-employee' },
        { title: 'Employés', icon: <PeopleIcon fontSize="small" />, path: '/onboarding/employees' },
        { title: 'Tâches', icon: <SchoolIcon fontSize="small" />, path: '/onboarding/tasks' },
      ],
    },
    {
      title: 'Analyses & KPIs',
      icon: <AnalyticsIcon fontSize="small" />,
      path: '/kpi-dashboard',
      roles: ['hr_director'],
    },
    {
      title: 'Administration',
      icon: <SettingsIcon fontSize="small" />,
      path: '/admin',
      roles: ['administrator'],
    },
  ];

  const filtered = menuItems.filter(item => !item.roles || hasAnyRole(item.roles));
  const isActive = (path) => path && location.pathname === path;
  const isParentActive = (item) => item.children?.some(c => isActive(c.path));

  const width = collapsed ? SIDEBAR_COLLAPSED : SIDEBAR_EXPANDED;

  return (
    <Box
      sx={{
        width,
        minWidth: width,
        height: '100vh',
        position: 'sticky',
        top: 0,
        display: 'flex',
        flexDirection: 'column',
        background: 'linear-gradient(180deg, #0f172a 0%, #1e293b 100%)',
        color: 'white',
        transition: 'width 0.25s ease, min-width 0.25s ease',
        overflow: 'hidden',
        zIndex: 1200,
        flexShrink: 0,
      }}
    >
      {/* Logo + toggle */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: collapsed ? 'center' : 'space-between',
          px: collapsed ? 0 : 2,
          py: 1.5,
          borderBottom: '1px solid rgba(255,255,255,0.07)',
          minHeight: 56,
        }}
      >
        {!collapsed && (
          <Typography variant="subtitle2" fontWeight={700} sx={{ color: 'white', letterSpacing: 0.5 }}>
            ERP RH
          </Typography>
        )}
        <Tooltip title={collapsed ? 'Agrandir' : 'Réduire'} placement="right">
          <IconButton
            onClick={onToggle}
            size="small"
            sx={{ color: 'rgba(255,255,255,0.6)', '&:hover': { color: 'white', bgcolor: 'rgba(255,255,255,0.1)' } }}
          >
            {collapsed ? <ExpandIcon fontSize="small" /> : <CollapseIcon fontSize="small" />}
          </IconButton>
        </Tooltip>
      </Box>

      {/* Profil utilisateur */}
      <Box
        sx={{
          px: collapsed ? 0 : 2,
          py: 1.5,
          display: 'flex',
          alignItems: 'center',
          justifyContent: collapsed ? 'center' : 'flex-start',
          gap: 1.5,
          borderBottom: '1px solid rgba(255,255,255,0.07)',
          cursor: 'pointer',
          '&:hover': { bgcolor: 'rgba(255,255,255,0.05)' },
        }}
        onClick={() => handleNavigation('/profile')}
      >
        <Tooltip title={collapsed ? `${user?.first_name} ${user?.last_name}` : ''} placement="right">
          <Avatar
            sx={{
              width: 34,
              height: 34,
              fontSize: '0.85rem',
              fontWeight: 700,
              bgcolor: getRoleColor(user?.role),
              flexShrink: 0,
            }}
          >
            {user?.first_name?.[0] || user?.username?.[0] || 'U'}
          </Avatar>
        </Tooltip>
        {!collapsed && (
          <Box sx={{ minWidth: 0, flex: 1 }}>
            <Typography variant="body2" fontWeight={600} noWrap sx={{ lineHeight: 1.3 }}>
              {user?.first_name} {user?.last_name}
            </Typography>
            <Chip
              label={getRoleLabel(user?.role)}
              size="small"
              sx={{
                height: 18,
                fontSize: '0.65rem',
                bgcolor: `${getRoleColor(user?.role)}25`,
                color: getRoleColor(user?.role),
                border: `1px solid ${getRoleColor(user?.role)}40`,
                mt: 0.3,
              }}
            />
          </Box>
        )}
      </Box>

      {/* Menu */}
      <List sx={{ flex: 1, py: 1, overflowY: 'auto', overflowX: 'hidden' }}>
        {filtered.map((item, index) => {
          const active = isActive(item.path) || isParentActive(item);
          return (
            <Box key={index}>
              <Tooltip title={collapsed ? item.title : ''} placement="right">
                <ListItem disablePadding>
                  <ListItemButton
                    onClick={() => item.children ? handleMenuClick(item.title) : handleNavigation(item.path)}
                    sx={{
                      mx: 0.75,
                      mb: 0.25,
                      borderRadius: 1.5,
                      minHeight: 38,
                      px: collapsed ? 0 : 1.5,
                      justifyContent: collapsed ? 'center' : 'flex-start',
                      bgcolor: active ? 'rgba(255,255,255,0.12)' : 'transparent',
                      borderLeft: active && !collapsed ? '3px solid #60a5fa' : '3px solid transparent',
                      '&:hover': { bgcolor: 'rgba(255,255,255,0.08)' },
                      transition: 'all 0.2s',
                    }}
                  >
                    <ListItemIcon
                      sx={{
                        color: active ? '#93c5fd' : 'rgba(255,255,255,0.55)',
                        minWidth: collapsed ? 'unset' : 32,
                        justifyContent: 'center',
                      }}
                    >
                      {item.icon}
                    </ListItemIcon>
                    {!collapsed && (
                      <>
                        <ListItemText
                          primary={item.title}
                          primaryTypographyProps={{
                            fontSize: '0.8rem',
                            fontWeight: active ? 600 : 400,
                            color: active ? '#e2e8f0' : 'rgba(255,255,255,0.7)',
                            noWrap: true,
                          }}
                        />
                        {item.children && (
                          expandedMenus[item.title]
                            ? <ExpandLess sx={{ fontSize: 16, color: 'rgba(255,255,255,0.4)' }} />
                            : <ExpandMore sx={{ fontSize: 16, color: 'rgba(255,255,255,0.4)' }} />
                        )}
                      </>
                    )}
                  </ListItemButton>
                </ListItem>
              </Tooltip>

              {/* Sous-menu */}
              {!collapsed && item.children && (
                <Collapse in={!!expandedMenus[item.title]} timeout="auto" unmountOnExit>
                  <List component="div" disablePadding>
                    {item.children
                      .filter(c => !c.roles || hasAnyRole(c.roles))
                      .map((child, ci) => (
                        <ListItem key={ci} disablePadding>
                          <ListItemButton
                            onClick={() => handleNavigation(child.path)}
                            sx={{
                              pl: 3.5,
                              mx: 0.75,
                              mb: 0.25,
                              borderRadius: 1.5,
                              minHeight: 34,
                              bgcolor: isActive(child.path) ? 'rgba(255,255,255,0.1)' : 'transparent',
                              borderLeft: isActive(child.path) ? '2px solid #60a5fa' : '2px solid transparent',
                              '&:hover': { bgcolor: 'rgba(255,255,255,0.07)' },
                            }}
                          >
                            <ListItemIcon sx={{ color: isActive(child.path) ? '#93c5fd' : 'rgba(255,255,255,0.4)', minWidth: 28 }}>
                              {child.icon}
                            </ListItemIcon>
                            <ListItemText
                              primary={child.title}
                              primaryTypographyProps={{
                                fontSize: '0.75rem',
                                fontWeight: isActive(child.path) ? 600 : 400,
                                color: isActive(child.path) ? '#e2e8f0' : 'rgba(255,255,255,0.6)',
                                noWrap: true,
                              }}
                            />
                          </ListItemButton>
                        </ListItem>
                      ))}
                  </List>
                </Collapse>
              )}
            </Box>
          );
        })}
      </List>

      {/* Déconnexion */}
      <Box sx={{ p: 1, borderTop: '1px solid rgba(255,255,255,0.07)' }}>
        <Tooltip title={collapsed ? 'Déconnexion' : ''} placement="right">
          <ListItemButton
            onClick={handleLogout}
            sx={{
              borderRadius: 1.5,
              minHeight: 38,
              px: collapsed ? 0 : 1.5,
              justifyContent: collapsed ? 'center' : 'flex-start',
              color: 'rgba(255,255,255,0.55)',
              '&:hover': { bgcolor: 'rgba(239,83,80,0.15)', color: '#ef9a9a' },
            }}
          >
            <ListItemIcon sx={{ color: 'inherit', minWidth: collapsed ? 'unset' : 32, justifyContent: 'center' }}>
              <LogoutIcon fontSize="small" />
            </ListItemIcon>
            {!collapsed && (
              <ListItemText
                primary="Déconnexion"
                primaryTypographyProps={{ fontSize: '0.8rem', fontWeight: 500 }}
              />
            )}
          </ListItemButton>
        </Tooltip>
      </Box>
    </Box>
  );
};

export default Sidebar;
