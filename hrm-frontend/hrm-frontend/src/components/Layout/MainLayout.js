import React, { useState } from 'react';
import { Box, AppBar, Toolbar, Typography, IconButton, Badge, Popover, List, ListItem, ListItemText, Divider } from '@mui/material';
import { Notifications as NotificationsIcon, AccountCircle } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import Sidebar, { SIDEBAR_EXPANDED, SIDEBAR_COLLAPSED } from './Sidebar';
import { useAuth } from '../../contexts/AuthContext';

const MainLayout = ({ children }) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);
  const [notifAnchor, setNotifAnchor] = useState(null);

  const sidebarWidth = collapsed ? SIDEBAR_COLLAPSED : SIDEBAR_EXPANDED;

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
                <Badge badgeContent={0} color="error">
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
                <Box sx={{ width: 280, p: 1 }}>
                  <Typography variant="subtitle2" fontWeight={600} sx={{ px: 1, py: 0.5 }}>
                    Notifications
                  </Typography>
                  <Divider />
                  <List dense>
                    <ListItem>
                      <ListItemText
                        primary="Aucune nouvelle notification"
                        primaryTypographyProps={{ variant: 'body2', color: 'text.secondary' }}
                      />
                    </ListItem>
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
