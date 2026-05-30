import React from 'react';
import { Box, Typography, Card, CardContent, Grid, Avatar, Button, Alert } from '@mui/material';
import {
  Settings as SettingsIcon,
  ManageAccounts as UsersIcon,
  Business as DeptIcon,
  Security as SecurityIcon,
  OpenInNew as OpenIcon,
  ArrowForward as ArrowIcon,
  Warning as WarnIcon,
} from '@mui/icons-material';
import TuneIcon from '@mui/icons-material/Tune';
import AccountTreeIcon from '@mui/icons-material/AccountTree';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const ConfigCard = ({ icon, iconBg, iconColor, title, description, actionLabel, actionColor, onClick, external }) => (
  <Card elevation={0} sx={{ border: '1px solid #e8ecf0', borderRadius: 3, height: '100%', overflow: 'hidden',
    transition: 'all 0.2s', '&:hover': { boxShadow: '0 6px 24px rgba(0,0,0,0.08)', transform: 'translateY(-2px)' } }}>
    {/* Card navy header */}
    <Box sx={{ background: 'linear-gradient(135deg,#0f172a,#1e3a5f,#1e40af)', p: '0.75rem 1.1rem', display: 'flex', alignItems: 'center', gap: 1 }}>
      <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.12)', width: 26, height: 26, borderRadius: 1.2 }}>
        {React.cloneElement(icon, { sx: { fontSize: 13, color: 'white' } })}
      </Avatar>
      <Typography sx={{ color: 'white', fontWeight: 700, fontSize: '0.82rem' }}>{title}</Typography>
    </Box>
    <CardContent sx={{ p: 2.5 }}>
      <Avatar sx={{ bgcolor: iconBg, width: 48, height: 48, borderRadius: 2, mb: 1.5 }}>
        {React.cloneElement(icon, { sx: { color: iconColor, fontSize: 22 } })}
      </Avatar>
      <Typography variant="subtitle1" fontWeight={700} sx={{ color: '#1e293b', mb: 0.75 }}>{title}</Typography>
      <Typography variant="body2" sx={{ color: '#64748b', lineHeight: 1.65, mb: 2, fontSize: '0.85rem' }}>{description}</Typography>
      <Button variant="contained" size="small" fullWidth
        onClick={onClick}
        endIcon={external ? <OpenIcon sx={{ fontSize: 14 }} /> : <ArrowIcon sx={{ fontSize: 14 }} />}
        sx={{ borderRadius: 2, bgcolor: actionColor, '&:hover': { filter: 'brightness(0.9)' }, fontWeight: 600, fontSize: '0.8rem', textTransform: 'none' }}>
        {actionLabel}
      </Button>
    </CardContent>
  </Card>
);

export default function SystemConfiguration() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const cards = [
    {
      icon: <UsersIcon />,
      iconBg: '#f3e8ff',
      iconColor: '#7c3aed',
      title: 'Gestion des utilisateurs',
      description: 'Créez, modifiez et gérez tous les comptes utilisateurs. Assignez les rôles et contrôlez les accès à la plateforme.',
      actionLabel: 'Gérer les utilisateurs',
      actionColor: '#7c3aed',
      onClick: () => navigate('/admin/users'),
    },
    {
      icon: <AccountTreeIcon />,
      iconBg: '#eef2ff',
      iconColor: '#4338ca',
      title: 'Départements & Postes',
      description: 'Gérez la structure organisationnelle : créez et modifiez les départements et les postes de la plateforme.',
      actionLabel: 'Gérer les structures',
      actionColor: '#4338ca',
      onClick: () => navigate('/admin/structures'),
    },
    {
      icon: <SecurityIcon />,
      iconBg: '#ecfeff',
      iconColor: '#0891b2',
      title: 'Sécurité & droits',
      description: 'Administrez les groupes d\'accès, les niveaux d\'autorisation et la structure des permissions globales.',
      actionLabel: 'Gérer les groupes',
      actionColor: '#0891b2',
      onClick: () => window.open('/admin/auth/group/', '_blank'),
      external: true,
    },
    {
      icon: <TuneIcon />,
      iconBg: '#eff6ff',
      iconColor: '#1976d2',
      title: 'Paramètres système',
      description: 'Accédez aux modèles principaux du noyau applicatif et aux réglages métier de l\'administration Django.',
      actionLabel: 'Ouvrir la configuration core',
      actionColor: '#1976d2',
      onClick: () => window.open('/admin/core/', '_blank'),
      external: true,
    },
    {
      icon: <AdminPanelSettingsIcon />,
      iconBg: '#fff7ed',
      iconColor: '#ea580c',
      title: 'Panel Django Admin',
      description: 'Accédez au panel Django pour les opérations techniques avancées et les besoins d\'administration brute.',
      actionLabel: 'Ouvrir le panel Django',
      actionColor: '#ea580c',
      onClick: () => window.open('/admin/', '_blank'),
      external: true,
    },
  ];

  return (
    <Box sx={{ p: { xs: 2, md: 3 }, maxWidth: 1200, mx: 'auto' }}>

      {/* Banner */}
      <Box sx={{
        background: 'linear-gradient(135deg,#0f172a 0%,#1e3a5f 60%,#1e40af 100%)',
        borderRadius: 3, p: 3, mb: 3, color: 'white', position: 'relative', overflow: 'hidden',
      }}>
        <Box sx={{ position: 'absolute', top: -40, right: -40, width: 180, height: 180,
          borderRadius: '50%', bgcolor: 'rgba(255,255,255,0.04)', pointerEvents: 'none' }} />
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2, position: 'relative' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.2)', width: 52, height: 52, borderRadius: 2 }}>
              <SettingsIcon sx={{ color: 'white', fontSize: 26 }} />
            </Avatar>
            <Box>
              <Typography variant="h6" fontWeight={700}>Configuration de la plateforme</Typography>
              <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.65)' }}>
                Administration centrale des paramètres, utilisateurs et autorisations
              </Typography>
            </Box>
          </Box>
          <Button onClick={() => navigate('/admin')} variant="outlined" size="small"
            sx={{ color: 'white', borderColor: 'rgba(255,255,255,0.3)', borderRadius: 2, '&:hover': { bgcolor: 'rgba(255,255,255,0.1)', borderColor: 'rgba(255,255,255,0.5)' }, fontSize: '0.8rem' }}>
            ← Retour au dashboard
          </Button>
        </Box>
      </Box>

      {/* Info cards */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        {[
          { label: 'Périmètre', value: 'Administration globale', sub: 'Accès aux réglages critiques et outils transverses' },
          { label: 'Zone', value: 'Back-office technique', sub: 'Opérations de maintenance et gouvernance' },
          { label: 'Profil', value: user?.role === 'administrator' ? 'Administrateur' : user?.role || '—', sub: 'Utilisez ces accès avec précaution' },
        ].map((c, i) => (
          <Grid item xs={12} md={4} key={i}>
            <Card elevation={0} sx={{ border: '1px solid #e8ecf0', borderRadius: 3 }}>
              <CardContent sx={{ p: 2 }}>
                <Typography sx={{ fontSize: '0.7rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.08em' }}>{c.label}</Typography>
                <Typography sx={{ fontSize: '1.05rem', fontWeight: 800, color: '#1e293b', mt: 0.5 }}>{c.value}</Typography>
                <Typography sx={{ fontSize: '0.78rem', color: '#64748b', mt: 0.3 }}>{c.sub}</Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Config cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        {cards.map((card, i) => (
          <Grid item xs={12} sm={6} lg={4} key={i}>
            <ConfigCard {...card} />
          </Grid>
        ))}
      </Grid>

      {/* Warning */}
      <Alert icon={<WarnIcon />} severity="warning" sx={{ borderRadius: 3, '& .MuiAlert-message': { fontSize: '0.85rem', lineHeight: 1.6 } }}>
        Cette zone donne accès à des fonctions sensibles de la plateforme. Réservez ces actions aux opérations d'administration nécessaires et privilégiez les écrans métiers standards pour les usages quotidiens.
      </Alert>
    </Box>
  );
}
