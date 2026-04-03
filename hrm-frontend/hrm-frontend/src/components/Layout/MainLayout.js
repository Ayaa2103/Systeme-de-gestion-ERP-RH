import React from 'react';
import { Box, AppBar, Toolbar, Typography, IconButton, Badge } from '@mui/material';
import { Notifications as NotificationsIcon, AccountCircle } from '@mui/icons-material';
import Sidebar from './Sidebar';
import { useAuth } from '../../contexts/AuthContext';

const DRAWER_WIDTH = 280;

const MainLayout = ({ children }) => {
  const { user } = useAuth();

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      <Sidebar />
      
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <AppBar
          position="sticky"
          elevation={0}
          sx={{
            background: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(20px)',
            borderBottom: '1px solid rgba(0, 0, 0, 0.08)',
            color: 'text.primary',
          }}
        >
          <Toolbar sx={{ justifyContent: 'space-between' }}>
            <Typography variant="h6" fontWeight="600" color="text.primary">
              ERP RH - Système de Gestion
            </Typography>
            
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <IconButton color="inherit">
                <Badge badgeContent={3} color="error">
                  <NotificationsIcon />
                </Badge>
              </IconButton>
              <IconButton color="inherit">
                <AccountCircle />
              </IconButton>
            </Box>
          </Toolbar>
        </AppBar>

        <Box sx={{ 
          p: 3, 
          width: '100%',
          flex: 1
        }}>
          {children}
        </Box>
      </Box>
    </Box>
  );
};

export default MainLayout;