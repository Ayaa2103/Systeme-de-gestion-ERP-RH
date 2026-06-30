import React, { useCallback, useEffect, useState } from 'react';
import {
  Box, AppBar, Toolbar, Typography, IconButton, Badge, Popover,
  List, ListItem, Divider, Button, CircularProgress, Tooltip,
  Chip, Avatar,
} from '@mui/material';
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
  DoneAll as MarkAllReadIcon,
  Circle as DotIcon,
  School as TrainingIcon,
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
  interview_scheduled: RecruitmentIcon,
  application_status: RecruitmentIcon,
  recommendation_status: RecruitmentIcon,
  onboarding_started: OnboardingIcon,
  culture_suggestion: CultureIcon,
  culture_response: CultureIcon,
  contract_created: ContractIcon,
  contract_renewed: ContractIcon,
  contract_expiring: ContractIcon,
  job_offer_created: RecruitmentIcon,
  training_created: TrainingIcon,
  training_status: TrainingIcon,
  system: SystemIcon,
};

const NOTIFICATION_COLORS = {
  request_created: '#3b82f6',
  request_status: '#3b82f6',
  event_created: '#8b5cf6',
  event_status: '#8b5cf6',
  application_received: '#0ea5e9',
  interview_scheduled: '#0ea5e9',
  application_status: '#0ea5e9',
  recommendation_status: '#0ea5e9',
  onboarding_started: '#10b981',
  culture_suggestion: '#f59e0b',
  culture_response: '#f59e0b',
  contract_created: '#6366f1',
  contract_renewed: '#6366f1',
  contract_expiring: '#ef4444',
  job_offer_created: '#3b82f6',
  training_created: '#7c3aed',
  training_status: '#7c3aed',
  system: '#64748b',
};

const NOTIFICATION_BG = {
  request_created: '#eff6ff',
  request_status: '#eff6ff',
  event_created: '#f5f3ff',
  event_status: '#f5f3ff',
  application_received: '#f0f9ff',
  interview_scheduled: '#f0f9ff',
  application_status: '#f0f9ff',
  recommendation_status: '#f0f9ff',
  onboarding_started: '#f0fdf4',
  culture_suggestion: '#fffbeb',
  culture_response: '#fffbeb',
  contract_created: '#eef2ff',
  contract_renewed: '#eef2ff',
  contract_expiring: '#fef2f2',
  job_offer_created: '#eff6ff',
  training_created: '#f5f3ff',
  training_status: '#f5f3ff',
  system: '#f8fafc',
};

const NotificationItem = ({ notification, onMarkRead, onNavigate }) => {
  const [hovered, setHovered] = useState(false);
  const Icon = NOTIFICATION_ICONS[notification.notification_type] || SystemIcon;
  const color = NOTIFICATION_COLORS[notification.notification_type] || '#64748b';
  const bg = NOTIFICATION_BG[notification.notification_type] || '#f8fafc';
  const isUnread = !notification.is_read;

  const handleClick = () => {
    onNavigate(notification);
  };

  return (
    <ListItem
      disablePadding
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <Box
        onClick={handleClick}
        sx={{
          width: '100%',
          display: 'flex',
          alignItems: 'flex-start',
          gap: 1.5,
          px: 2,
          py: 1.5,
          cursor: 'pointer',
          position: 'relative',
          borderLeft: isUnread ? `3px solid ${color}` : '3px solid transparent',
          bgcolor: hovered ? (isUnread ? bg : '#f8fafc') : (isUnread ? `${bg}cc` : 'transparent'),
          transition: 'all 0.15s ease',
          '&:before': isUnread ? {
            content: '""',
            position: 'absolute',
            right: 12,
            top: '50%',
            transform: 'translateY(-50%)',
            width: 7,
            height: 7,
            borderRadius: '50%',
            bgcolor: color,
            boxShadow: `0 0 0 2px ${color}33`,
          } : {},
        }}
      >
        {/* Icon avatar */}
        <Avatar
          sx={{
            width: 36,
            height: 36,
            bgcolor: `${color}18`,
            flexShrink: 0,
            mt: 0.25,
          }}
        >
          <Icon sx={{ fontSize: 18, color }} />
        </Avatar>

        {/* Content */}
        <Box sx={{ flex: 1, minWidth: 0, pr: isUnread ? 2 : 0 }}>
          <Typography
            variant="body2"
            sx={{
              fontWeight: isUnread ? 700 : 500,
              color: '#0f172a',
              lineHeight: 1.3,
              mb: 0.4,
            }}
          >
            {notification.title}
          </Typography>
          <Typography
            variant="caption"
            sx={{
              color: '#64748b',
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
              lineHeight: 1.4,
              mb: 0.5,
            }}
          >
            {notification.message}
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Typography variant="caption" sx={{ color: color, fontWeight: 600, fontSize: '0.68rem' }}>
              {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true, locale: fr })}
            </Typography>
            {hovered && isUnread && (
              <Typography
                variant="caption"
                onClick={(e) => { e.stopPropagation(); onMarkRead(notification.id); }}
                sx={{
                  color: '#94a3b8',
                  fontSize: '0.68rem',
                  cursor: 'pointer',
                  '&:hover': { color: '#3b82f6' },
                  ml: 'auto',
                  mr: 2,
                }}
              >
                Marquer lue
              </Typography>
            )}
          </Box>
        </Box>
      </Box>
    </ListItem>
  );
};

const MainLayout = ({ children }) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);
  const [notifAnchor, setNotifAnchor] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [notificationsLoading, setNotificationsLoading] = useState(false);
  const [filter, setFilter] = useState('all');

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

  const handleMarkOneRead = async (id) => {
    await markNotificationRead(id);
    setUnreadCount(count => Math.max(count - 1, 0));
    setNotifications(items => items.map(item => (
      item.id === id ? { ...item, is_read: true } : item
    )));
  };

  const handleMarkAllRead = async () => {
    await markAllNotificationsRead();
    setUnreadCount(0);
    setNotifications(items => items.map(item => ({ ...item, is_read: true })));
  };

  const displayed = filter === 'unread'
    ? notifications.filter(n => !n.is_read)
    : notifications;

  const open = Boolean(notifAnchor);

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
              {/* Bell button */}
              <Tooltip title="Notifications">
                <IconButton
                  size="small"
                  onClick={(e) => setNotifAnchor(e.currentTarget)}
                  sx={{
                    position: 'relative',
                    '&:hover': { bgcolor: '#f1f5f9' },
                  }}
                >
                  <Badge
                    badgeContent={unreadCount}
                    max={99}
                    sx={{
                      '& .MuiBadge-badge': {
                        bgcolor: '#ef4444',
                        color: '#fff',
                        fontWeight: 700,
                        fontSize: '0.65rem',
                        minWidth: 18,
                        height: 18,
                        boxShadow: unreadCount > 0 ? '0 0 0 2px #fff, 0 0 0 4px #ef444422' : 'none',
                        animation: unreadCount > 0 ? 'pulse 2s infinite' : 'none',
                        '@keyframes pulse': {
                          '0%': { boxShadow: '0 0 0 2px #fff, 0 0 0 3px #ef444433' },
                          '50%': { boxShadow: '0 0 0 2px #fff, 0 0 0 6px #ef444400' },
                          '100%': { boxShadow: '0 0 0 2px #fff, 0 0 0 3px #ef444433' },
                        },
                      },
                    }}
                  >
                    <NotificationsIcon fontSize="small" sx={{ color: open ? '#3b82f6' : '#475569' }} />
                  </Badge>
                </IconButton>
              </Tooltip>

              {/* Notification Panel */}
              <Popover
                open={open}
                anchorEl={notifAnchor}
                onClose={() => setNotifAnchor(null)}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                transformOrigin={{ vertical: 'top', horizontal: 'right' }}
                slotProps={{
                  paper: {
                    sx: {
                      width: 400,
                      maxHeight: 560,
                      borderRadius: 3,
                      boxShadow: '0 20px 60px rgba(0,0,0,0.15), 0 4px 16px rgba(0,0,0,0.08)',
                      overflow: 'hidden',
                      mt: 1,
                      border: '1px solid rgba(0,0,0,0.06)',
                    },
                  },
                }}
              >
                {/* Header */}
                <Box
                  sx={{
                    background: 'linear-gradient(135deg, #1e293b 0%, #334155 100%)',
                    px: 2.5,
                    pt: 2,
                    pb: 1.5,
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1.5 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <NotificationsIcon sx={{ color: '#fff', fontSize: 20 }} />
                      <Typography variant="subtitle1" fontWeight={700} color="#fff">
                        Notifications
                      </Typography>
                      {unreadCount > 0 && (
                        <Chip
                          label={unreadCount}
                          size="small"
                          sx={{
                            bgcolor: '#ef4444',
                            color: '#fff',
                            fontWeight: 700,
                            height: 20,
                            fontSize: '0.7rem',
                            '& .MuiChip-label': { px: 0.75 },
                          }}
                        />
                      )}
                    </Box>
                    {unreadCount > 0 && (
                      <Tooltip title="Tout marquer comme lu">
                        <IconButton
                          size="small"
                          onClick={handleMarkAllRead}
                          sx={{ color: '#94a3b8', '&:hover': { color: '#fff', bgcolor: 'rgba(255,255,255,0.1)' } }}
                        >
                          <MarkAllReadIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    )}
                  </Box>

                  {/* Filter tabs */}
                  <Box sx={{ display: 'flex', gap: 0.5 }}>
                    {[
                      { key: 'all', label: 'Toutes' },
                      { key: 'unread', label: 'Non lues', count: unreadCount },
                    ].map(tab => (
                      <Box
                        key={tab.key}
                        onClick={() => setFilter(tab.key)}
                        sx={{
                          px: 1.5,
                          py: 0.5,
                          borderRadius: 2,
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: 0.5,
                          bgcolor: filter === tab.key ? 'rgba(255,255,255,0.15)' : 'transparent',
                          transition: 'all 0.15s',
                          '&:hover': { bgcolor: 'rgba(255,255,255,0.1)' },
                        }}
                      >
                        <Typography
                          variant="caption"
                          sx={{
                            color: filter === tab.key ? '#fff' : '#94a3b8',
                            fontWeight: filter === tab.key ? 600 : 400,
                            fontSize: '0.75rem',
                          }}
                        >
                          {tab.label}
                        </Typography>
                        {tab.count > 0 && (
                          <Box
                            sx={{
                              width: 16, height: 16, borderRadius: '50%',
                              bgcolor: '#3b82f6', display: 'flex', alignItems: 'center',
                              justifyContent: 'center',
                            }}
                          >
                            <Typography sx={{ color: '#fff', fontSize: '0.6rem', fontWeight: 700 }}>
                              {tab.count}
                            </Typography>
                          </Box>
                        )}
                      </Box>
                    ))}
                  </Box>
                </Box>

                {/* List */}
                <Box sx={{ overflowY: 'auto', maxHeight: 420 }}>
                  {notificationsLoading ? (
                    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', py: 5, gap: 1.5 }}>
                      <CircularProgress size={28} sx={{ color: '#3b82f6' }} />
                      <Typography variant="caption" color="text.secondary">Chargement…</Typography>
                    </Box>
                  ) : displayed.length === 0 ? (
                    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', py: 6, gap: 1 }}>
                      <Box
                        sx={{
                          width: 56, height: 56, borderRadius: '50%',
                          bgcolor: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center',
                        }}
                      >
                        <NotificationsIcon sx={{ fontSize: 28, color: '#cbd5e1' }} />
                      </Box>
                      <Typography variant="body2" color="text.secondary" fontWeight={600}>
                        {filter === 'unread' ? 'Aucune notification non lue' : 'Aucune notification'}
                      </Typography>
                      <Typography variant="caption" color="text.disabled">
                        {filter === 'unread' ? 'Vous êtes à jour !' : 'Les nouvelles notifications apparaîtront ici'}
                      </Typography>
                    </Box>
                  ) : (
                    <List disablePadding>
                      {displayed.map((notification, index) => (
                        <React.Fragment key={notification.id}>
                          <NotificationItem
                            notification={notification}
                            onMarkRead={handleMarkOneRead}
                            onNavigate={handleNotificationClick}
                          />
                          {index < displayed.length - 1 && (
                            <Divider sx={{ mx: 2, borderColor: '#f1f5f9' }} />
                          )}
                        </React.Fragment>
                      ))}
                    </List>
                  )}
                </Box>

                {/* Footer */}
                {!notificationsLoading && displayed.length > 0 && (
                  <Box
                    sx={{
                      px: 2.5, py: 1.25,
                      borderTop: '1px solid #f1f5f9',
                      bgcolor: '#fafafa',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                    }}
                  >
                    <Typography variant="caption" sx={{ color: '#94a3b8' }}>
                      {notifications.length} notification{notifications.length > 1 ? 's' : ''}
                    </Typography>
                    {unreadCount > 0 && (
                      <Button
                        size="small"
                        onClick={handleMarkAllRead}
                        startIcon={<MarkAllReadIcon sx={{ fontSize: '14px !important' }} />}
                        sx={{
                          textTransform: 'none',
                          fontSize: '0.75rem',
                          color: '#3b82f6',
                          fontWeight: 600,
                          py: 0.25,
                          '&:hover': { bgcolor: '#eff6ff' },
                        }}
                      >
                        Tout marquer comme lu
                      </Button>
                    )}
                  </Box>
                )}
              </Popover>

              <Tooltip title="Mon profil">
                <IconButton size="small" onClick={() => navigate('/profile')} sx={{ '&:hover': { bgcolor: '#f1f5f9' } }}>
                  <AccountCircle fontSize="small" sx={{ color: '#475569' }} />
                </IconButton>
              </Tooltip>
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
