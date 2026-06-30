import React, { useCallback, useEffect, useState } from 'react';
import { Box, AppBar, Toolbar, Typography, IconButton, Badge, Popover, List, ListItem, ListItemText, ListItemIcon, Divider, Button, CircularProgress } from '@mui/material';
import {
  Notifications as NotificationsIcon,
  AccountCircle,
  EventNote as EventIcon,
  Assignment as RequestIcon,
  Work as RecruitmentIcon,
  HowToReg as OnboardingIcon,
  Forum as CultureIcon,
  Description as ContractIcon,
  Info as SystemIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';
import Sidebar from './Sidebar';
import { useAuth } from '../../contexts/AuthContext';
import { getNotifications, markAllNotificationsRead, markNotificationRead } from '../../services/notificationService';

const NOTIFICATION_ICONS = {
  request_created: RequestIcon,
  request_status: RequestIcon,
  event_created: EventIcon,
  event_status: EventIcon,
  application_received: RecruitmentIcon,
  recommendation_status: RecruitmentIcon,
  onboarding_started: OnboardingIcon,
  culture_suggestion: CultureIcon,
  culture_response: CultureIcon,
  contract_created: ContractIcon,
  contract_renewed: ContractIcon,
  contract_expiring: ContractIcon,
  system: SystemIcon,
};

const NOTIFICATION_COLORS = {
  request_created: '#1976d2',
  request_status: '#1976d2',
  event_created: '#9c27b0',
  event_status: '#9c27b0',
  application_received: '#0288d1',
  recommendation_status: '#0288d1',
  onboarding_started: '#2e7d32',
  culture_suggestion: '#ef6c00',
  culture_response: '#ef6c00',
  contract_created: '#5d4037',
  contract_renewed: '#5d4037',
  contract_expiring: '#c62828',
  system: '#616161',
};

const MainLayout = ({ children }) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);
  const [notifAnchor, setNotifAnchor] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [notificationsLoading, setNotificationsLoading] = useState(false);

  const loadNotifications = useCallback(async () => {
    if (!user) return;
    setNotificationsLoading(true);
    try {
      const data = await getNotifications();
      setNotifications(data.notifications || []);
      setUnreadCount(data.unread_count || 0);
    } catch (error) {
      setNotifications([]);
      setUnreadCount(0);
    } finally {
      setNotificationsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    loadNotifications();
    const timer = setInterval(loadNotifications, 30000);
    return () => clearInterval(timer);
  }, [loadNotifications]);

  const handleNotificationClick = async (notification) => {
    if (!notification.is_read) {
      await markNotificationRead(notification.id);
      setUnreadCount(count => Math.max(count - 1, 0));
      setNotifications(items => items.map(item => (
        item.id === notification.id ? { ...item, is_read: true } : item
      )));
    }
    setNotifAnchor(null);
    if (notification.link) {
      navigate(notification.link);
    }
  };

  const handleMarkAllRead = async () => {
    await markAllNotificationsRead();
    setUnreadCount(0);
    setNotifications(items => items.map(item => ({ ...item, is_read: true })));
  };

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      <Sidebar collapsed={collapsed} onToggle={() => setCollapsed(v => !v)} />

      <Box
        component="main"
        sx={{
          flex: 1,
          minWidth: 0,
          background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          transition: 'margin-left 0.25s ease',
        }}
      >
        <AppBar
          position="sticky"
          elevation={0}
          sx={{
            background: 'rgba(255,255,255,0.97)',
            backdropFilter: 'blur(20px)',
            borderBottom: '1px solid rgba(0,0,0,0.07)',
            color: 'text.primary',
          }}
        >
          <Toolbar sx={{ justifyContent: 'space-between', minHeight: 56 }}>
            <Typography variant="subtitle1" fontWeight={600} color="text.primary">
              ERP RH — Système de Gestion
            </Typography>

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <IconButton size="small" onClick={(e) => setNotifAnchor(e.currentTarget)}>
                <Badge badgeContent={unreadCount} color="error" max={99}>
                  <NotificationsIcon fontSize="small" />
                </Badge>
              </IconButton>
              <Popover
                open={Boolean(notifAnchor)}
                anchorEl={notifAnchor}
                onClose={() => setNotifAnchor(null)}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                transformOrigin={{ vertical: 'top', horizontal: 'right' }}
              >
                <Box sx={{ width: 340, p: 1 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', px: 1, py: 0.5 }}>
                    <Typography variant="subtitle2" fontWeight={600}>
                      Notifications
                    </Typography>
                    {unreadCount > 0 && (
                      <Button size="small" onClick={handleMarkAllRead} sx={{ textTransform: 'none' }}>
                        Tout lire
                      </Button>
                    )}
                  </Box>
                  <Divider />
                  <List dense sx={{ maxHeight: 360, overflowY: 'auto' }}>
                    {notificationsLoading ? (
                      <Box sx={{ display: 'flex', justifyContent: 'center', py: 2 }}>
                        <CircularProgress size={22} />
                      </Box>
                    ) : notifications.length === 0 ? (
                      <ListItem>
                        <ListItemText
                          primary="Aucune nouvelle notification"
                          primaryTypographyProps={{ variant: 'body2', color: 'text.secondary' }}
                        />
                      </ListItem>
                    ) : notifications.map(notification => {
                      const Icon = NOTIFICATION_ICONS[notification.notification_type] || SystemIcon;
                      const color = NOTIFICATION_COLORS[notification.notification_type] || '#616161';
                      return (
                        <ListItem
                          key={notification.id}
                          button
                          onClick={() => handleNotificationClick(notification)}
                          sx={{
                            alignItems: 'flex-start',
                            borderRadius: 1,
                            bgcolor: notification.is_read ? 'transparent' : 'rgba(25,118,210,0.08)',
                            mb: 0.5,
                          }}
                        >
                          <ListItemIcon sx={{ minWidth: 36, mt: 0.5 }}>
                            <Icon fontSize="small" sx={{ color }} />
                          </ListItemIcon>
                          <ListItemText
                            primary={notification.title}
                            secondary={
                              <>
                                {notification.message}
                                <Typography component="span" variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.25 }}>
                                  {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true, locale: fr })}
                                </Typography>
                              </>
                            }
                            primaryTypographyProps={{ variant: 'body2', fontWeight: notification.is_read ? 500 : 700 }}
                            secondaryTypographyProps={{ variant: 'caption', color: 'text.secondary', component: 'div' }}
                          />
                        </ListItem>
                      );
                    })}
                  </List>
                </Box>
              </Popover>

              <IconButton size="small" onClick={() => navigate('/profile')}>
                <AccountCircle fontSize="small" />
              </IconButton>
            </Box>
          </Toolbar>
        </AppBar>

        <Box sx={{ p: 3, flex: 1 }}>
          {children}
        </Box>
      </Box>
    </Box>
  );
};

export default MainLayout;
