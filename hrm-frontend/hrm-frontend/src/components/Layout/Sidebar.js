import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import {
  Box, List, ListItem, ListItemButton, ListItemIcon, ListItemText,
  Typography, Avatar, Tooltip, IconButton, Chip, Divider,
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
  ManageAccounts as UsersIcon,
  AccountTree as StructureIcon,
  Tune as ConfigIcon,
  AdminPanelSettings as AdminIcon,
  BeachAccess as LeaveIcon,
  DescriptionOutlined as AttestationIcon,
  FlightTakeoff as MissionIcon,
  ReceiptLong as PayslipIcon,
  HowToReg as OnboardingIcon,
  BarChart as KpiIcon,
  GroupWork as RecommendIcon,
  AddCircleOutline as AddSuggestionIcon,
} from '@mui/icons-material';

export const SIDEBAR_EXPANDED = 240;
export const SIDEBAR_COLLAPSED = 68;

const Sidebar = ({ collapsed, onToggle }) => {
  const navigate  = useNavigate();
  const location  = useLocation();
  const { user, logout, hasAnyRole } = useAuth();

  const handleNavigation = (path) => navigate(path);
  const handleLogout = async () => { await logout(); navigate('/login'); };

  const getRoleColor = (role) => {
    const map = { administrator: '#ef5350', hr_director: '#ab47bc', hr_manager: '#42a5f5', employee: '#66bb6a' };
    return map[role] || '#9e9e9e';
  };
  const getRoleLabel = (role) => {
    const map = { administrator: 'Admin', hr_director: 'Dir. RH', hr_manager: 'Resp. RH', employee: 'Employé' };
    return map[role] || 'Utilisateur';
  };

  // ── Menus plats par rôle ──────────────────────────────────────────
  const menuByRole = {
    administrator: [
      { title: 'Tableau de bord',     icon: <DashboardIcon />, path: '/dashboard' },
      { divider: true, label: 'Gestion' },
      { title: 'Utilisateurs',        icon: <UsersIcon />,     path: '/admin/users' },
      { title: 'Employés',            icon: <PeopleIcon />,    path: '/employees' },
      { title: 'Contrats',            icon: <AssignmentIcon />,path: '/contracts' },
      { divider: true, label: 'Recrutement' },
      { title: 'Offres d\'emploi',    icon: <WorkIcon />,      path: '/job-offers' },
      { title: 'Candidatures',        icon: <PersonIcon />,    path: '/recruitment/applications' },
      { title: 'Recommandations',     icon: <RecommendIcon />, path: '/recruitment/recommendations' },
      { divider: true, label: 'Autre' },
      { title: 'Événements',          icon: <EventsIcon />,    path: '/events' },
      { title: 'Culture',             icon: <CorporateIcon />, path: '/culture' },
      { title: 'Suggestions',         icon: <SuggestionIcon />,path: '/culture/suggestions' },
      { divider: true, label: 'Configuration' },
      { title: 'Départements & Postes', icon: <StructureIcon />, path: '/admin/structures' },
      { title: 'Configuration',       icon: <ConfigIcon />,    path: '/admin/configuration' },
    ],

    hr_manager: [
      { title: 'Tableau de bord',     icon: <DashboardIcon />, path: '/dashboard' },
      { divider: true, label: 'Employés' },
      { title: 'Liste des employés',  icon: <PeopleIcon />,    path: '/employees' },
      { title: 'Contrats',            icon: <AssignmentIcon />,path: '/contracts' },
      { divider: true, label: 'Demandes' },
      { title: 'Gérer les demandes',  icon: <RequestIcon />,   path: '/manage-requests' },
      { divider: true, label: 'Recrutement' },
      { title: 'Tableau de bord',     icon: <AnalyticsIcon />, path: '/recruitment' },
      { title: 'Offres d\'emploi',    icon: <WorkIcon />,      path: '/job-offers' },
      { title: 'Candidatures',        icon: <PersonIcon />,    path: '/recruitment/applications' },
      { title: 'Recommandations',     icon: <RecommendIcon />, path: '/recruitment/recommendations' },
      { divider: true, label: 'Formations & Intégration' },
      { title: 'Gérer les formations',icon: <TrainingIcon />,  path: '/manage-trainings' },
      { title: 'Créer une formation', icon: <School2Icon />,   path: '/trainings/create' },
      { title: 'Onboarding',          icon: <OnboardingIcon />,path: '/onboarding' },
      { divider: true, label: 'Connaissances' },
      { title: 'Tableau de bord',     icon: <AnalyticsIcon />, path: '/knowledge' },
      { title: 'Compétences',         icon: <AssessmentIcon />,path: '/knowledge/skills-matrix' },
      { title: 'Polyvalence',         icon: <BusinessIcon />,  path: '/knowledge/versatility-matrix' },
      { title: 'Documents',           icon: <AttestationIcon />,path: '/knowledge/documents' },
      { divider: true, label: 'Autre' },
      { title: 'Événements',          icon: <EventsIcon />,    path: '/events' },
      { title: 'Culture',             icon: <CorporateIcon />, path: '/culture' },
      { title: 'Suggestions',         icon: <SuggestionIcon />,path: '/culture/suggestions' },
    ],

    hr_director: [
      { title: 'Tableau de bord',     icon: <DashboardIcon />, path: '/dashboard' },
      { divider: true, label: 'Employés' },
      { title: 'Liste des employés',  icon: <PeopleIcon />,    path: '/employees' },
      { title: 'Contrats',            icon: <AssignmentIcon />,path: '/contracts' },
      { divider: true, label: 'Demandes & Recrutement' },
      { title: 'Gérer les demandes',  icon: <RequestIcon />,   path: '/manage-requests' },
      { title: 'Tableau recrutement', icon: <AnalyticsIcon />, path: '/recruitment' },
      { title: 'Offres d\'emploi',    icon: <WorkIcon />,      path: '/job-offers' },
      { title: 'Candidatures',        icon: <PersonIcon />,    path: '/recruitment/applications' },
      { title: 'Recommandations',     icon: <RecommendIcon />, path: '/recruitment/recommendations' },
      { divider: true, label: 'Formations & Intégration' },
      { title: 'Gérer les formations', icon: <TrainingIcon />,  path: '/manage-trainings' },
      { title: 'Créer une formation', icon: <School2Icon />,   path: '/trainings/create' },
      { title: 'Onboarding',          icon: <OnboardingIcon />,path: '/onboarding' },
      { divider: true, label: 'Analyses' },
      { title: 'KPIs & Analyses',     icon: <KpiIcon />,       path: '/kpi-dashboard' },
      { title: 'Connaissances',       icon: <AssessmentIcon />,path: '/knowledge' },
      { divider: true, label: 'Autre' },
      { title: 'Événements',          icon: <EventsIcon />,    path: '/events' },
      { title: 'Culture',             icon: <CorporateIcon />, path: '/culture' },
      { title: 'Suggestions',         icon: <SuggestionIcon />,path: '/culture/suggestions' },
    ],

    employee: [
      { title: 'Tableau de bord',     icon: <DashboardIcon />, path: '/dashboard' },
      { divider: true, label: 'Mes demandes' },
      { title: 'Mes demandes',        icon: <RequestIcon />,   path: '/employee/requests' },
      { title: 'Demande de congé',    icon: <LeaveIcon />,     path: '/employee/requests/create-leave' },
      { title: 'Attestation',         icon: <AttestationIcon />,path: '/employee/requests/create-attestation' },
      { title: 'Ordre de mission',    icon: <MissionIcon />,   path: '/employee/requests/create-mission' },
      { title: 'Bulletin de paie',    icon: <PayslipIcon />,   path: '/employee/requests/create-payslip' },
      { divider: true, label: 'Mon espace' },
      { title: 'Mes formations',      icon: <TrainingIcon />,  path: '/employee/trainings' },
      { title: 'Mes connaissances',   icon: <AssessmentIcon />,path: '/employee/knowledge' },
      { title: 'Mon intégration',     icon: <OnboardingIcon />,path: '/employee/onboarding' },
      { divider: true, label: 'Recrutement' },
      { title: 'Offres d\'emploi',    icon: <WorkIcon />,      path: '/employee/recommend' },
      { divider: true, label: 'Entreprise' },
      { title: 'Événements',          icon: <EventsIcon />,    path: '/employee/events' },
      { title: 'Culture',             icon: <CorporateIcon />, path: '/culture' },
      { title: 'Mes suggestions',     icon: <SuggestionIcon />,path: '/culture/suggestions' },
      { title: 'Nouvelle suggestion', icon: <AddSuggestionIcon />,path: '/culture/suggestions/create' },
    ],
  };

  // petit alias pour éviter conflit avec import School
  function School2Icon() { return <SchoolIcon fontSize="small" />; }

  const items = menuByRole[user?.role] || menuByRole.employee;
  const isActive = (path) => path && location.pathname === path;
  const width = collapsed ? SIDEBAR_COLLAPSED : SIDEBAR_EXPANDED;

  return (
    <Box sx={{
      width, minWidth: width, height: '100vh', position: 'sticky', top: 0,
      display: 'flex', flexDirection: 'column',
      background: 'linear-gradient(180deg,#0f172a 0%,#1e293b 100%)',
      color: 'white', transition: 'width 0.25s ease, min-width 0.25s ease',
      overflow: 'hidden', zIndex: 1200, flexShrink: 0,
    }}>

      {/* Logo + toggle */}
      <Box sx={{ display: 'flex', alignItems: 'center',
        justifyContent: collapsed ? 'center' : 'space-between',
        px: collapsed ? 0 : 2, py: 1.5,
        borderBottom: '1px solid rgba(255,255,255,0.07)', minHeight: 56 }}>
        {!collapsed && (
          <Typography variant="subtitle2" fontWeight={700} sx={{ color: 'white', letterSpacing: 0.5 }}>
            ERP RH
          </Typography>
        )}
        <Tooltip title={collapsed ? 'Agrandir' : 'Réduire'} placement="right">
          <IconButton onClick={onToggle} size="small"
            sx={{ color: 'rgba(255,255,255,0.6)', '&:hover': { color: 'white', bgcolor: 'rgba(255,255,255,0.1)' } }}>
            {collapsed ? <ExpandIcon fontSize="small" /> : <CollapseIcon fontSize="small" />}
          </IconButton>
        </Tooltip>
      </Box>

      {/* Profil */}
      <Box sx={{ px: collapsed ? 0 : 2, py: 1.5, display: 'flex', alignItems: 'center',
        justifyContent: collapsed ? 'center' : 'flex-start', gap: 1.5,
        borderBottom: '1px solid rgba(255,255,255,0.07)', cursor: 'pointer',
        '&:hover': { bgcolor: 'rgba(255,255,255,0.05)' } }}
        onClick={() => handleNavigation('/profile')}>
        <Tooltip title={collapsed ? `${user?.first_name} ${user?.last_name}` : ''} placement="right">
          <Avatar sx={{ width: 34, height: 34, fontSize: '0.85rem', fontWeight: 700,
            bgcolor: getRoleColor(user?.role), flexShrink: 0 }}>
            {user?.first_name?.[0] || user?.username?.[0] || 'U'}
          </Avatar>
        </Tooltip>
        {!collapsed && (
          <Box sx={{ minWidth: 0, flex: 1 }}>
            <Typography variant="body2" fontWeight={600} noWrap sx={{ lineHeight: 1.3 }}>
              {user?.first_name} {user?.last_name}
            </Typography>
            <Chip label={getRoleLabel(user?.role)} size="small"
              sx={{ height: 18, fontSize: '0.65rem', mt: 0.3,
                bgcolor: `${getRoleColor(user?.role)}25`,
                color: getRoleColor(user?.role),
                border: `1px solid ${getRoleColor(user?.role)}40` }} />
          </Box>
        )}
      </Box>

      {/* Menu */}
      <List sx={{ flex: 1, py: 1, overflowY: 'auto', overflowX: 'hidden',
        '&::-webkit-scrollbar': { width: 4 },
        '&::-webkit-scrollbar-thumb': { bgcolor: 'rgba(255,255,255,0.1)', borderRadius: 2 } }}>
        {items.map((item, idx) => {
          // Séparateur avec label
          if (item.divider) {
            if (collapsed) return <Divider key={idx} sx={{ my: 0.75, borderColor: 'rgba(255,255,255,0.07)' }} />;
            return (
              <Box key={idx} sx={{ px: 2, pt: 1.5, pb: 0.5 }}>
                <Typography sx={{ fontSize: '0.62rem', fontWeight: 700, color: 'rgba(255,255,255,0.3)',
                  textTransform: 'uppercase', letterSpacing: '1px' }}>
                  {item.label}
                </Typography>
              </Box>
            );
          }

          const active = isActive(item.path);
          return (
            <Tooltip key={idx} title={collapsed ? item.title : ''} placement="right">
              <ListItem disablePadding>
                <ListItemButton onClick={() => handleNavigation(item.path)}
                  sx={{ mx: 0.75, mb: 0.15, borderRadius: 1.5, minHeight: 36,
                    px: collapsed ? 0 : 1.5,
                    justifyContent: collapsed ? 'center' : 'flex-start',
                    bgcolor: active ? 'rgba(96,165,250,0.15)' : 'transparent',
                    borderLeft: active && !collapsed ? '3px solid #60a5fa' : '3px solid transparent',
                    '&:hover': { bgcolor: active ? 'rgba(96,165,250,0.2)' : 'rgba(255,255,255,0.07)' },
                    transition: 'all 0.15s',
                  }}>
                  <ListItemIcon sx={{ color: active ? '#93c5fd' : 'rgba(255,255,255,0.5)',
                    minWidth: collapsed ? 'unset' : 30, justifyContent: 'center',
                    '& svg': { fontSize: '1rem' } }}>
                    {item.icon}
                  </ListItemIcon>
                  {!collapsed && (
                    <ListItemText primary={item.title}
                      primaryTypographyProps={{
                        fontSize: '0.8rem',
                        fontWeight: active ? 600 : 400,
                        color: active ? '#e2e8f0' : 'rgba(255,255,255,0.65)',
                        noWrap: true,
                      }} />
                  )}
                </ListItemButton>
              </ListItem>
            </Tooltip>
          );
        })}
      </List>

      {/* Déconnexion */}
      <Box sx={{ p: 1, borderTop: '1px solid rgba(255,255,255,0.07)' }}>
        <Tooltip title={collapsed ? 'Déconnexion' : ''} placement="right">
          <ListItemButton onClick={handleLogout}
            sx={{ borderRadius: 1.5, minHeight: 36, px: collapsed ? 0 : 1.5,
              justifyContent: collapsed ? 'center' : 'flex-start',
              color: 'rgba(255,255,255,0.5)',
              '&:hover': { bgcolor: 'rgba(239,68,68,0.15)', color: '#fca5a5' } }}>
            <ListItemIcon sx={{ color: 'inherit', minWidth: collapsed ? 'unset' : 30, justifyContent: 'center' }}>
              <LogoutIcon fontSize="small" />
            </ListItemIcon>
            {!collapsed && (
              <ListItemText primary="Déconnexion"
                primaryTypographyProps={{ fontSize: '0.8rem', fontWeight: 500 }} />
            )}
          </ListItemButton>
        </Tooltip>
      </Box>
    </Box>
  );
};

export default Sidebar;
