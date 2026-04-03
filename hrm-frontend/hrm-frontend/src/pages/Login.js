import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { testApiConnection } from '../services/testApi';
import {
  Box,
  Card,
  TextField,
  Button,
  Typography,
  Alert,
  Container,
  Avatar,
  InputAdornment,
  IconButton,
  Fade,
  Slide,
  Grid,
  Divider,
  Chip
} from '@mui/material';
import {
  Person as PersonIcon,
  Lock as LockIcon,
  Visibility,
  VisibilityOff,
  Business as BusinessIcon,
  Security,
  Speed,
  Group,
  TrendingUp
} from '@mui/icons-material';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [particles, setParticles] = useState([]);
  
  React.useEffect(() => {
    testApiConnection();
    
    // Generate floating particles
    const newParticles = Array.from({ length: 30 }, (_, i) => ({
      id: i,
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight,
      size: Math.random() * 3 + 1,
      speedX: (Math.random() - 0.5) * 0.3,
      speedY: (Math.random() - 0.5) * 0.3,
      opacity: Math.random() * 0.3 + 0.1
    }));
    setParticles(newParticles);
  }, []);
  
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await login(username, password);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.error || 'Nom d\'utilisateur ou mot de passe incorrect');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: `
          linear-gradient(135deg, rgba(15, 23, 42, 0.8) 0%, rgba(30, 41, 59, 0.9) 50%, rgba(51, 65, 85, 0.8) 100%),
          url('/rh.jpg')
        `,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        display: 'flex',
        position: 'relative',
        overflow: 'hidden',
        transition: 'all 0.3s ease'
      }}
    >
      {/* Animated Particles */}
      {particles.map((particle) => (
        <Box
          key={particle.id}
          sx={{
            position: 'absolute',
            left: particle.x,
            top: particle.y,
            width: particle.size,
            height: particle.size,
            borderRadius: '50%',
            background: 'rgba(59, 130, 246, 0.6)',
            opacity: particle.opacity,
            animation: `particleFloat ${15 + Math.random() * 10}s linear infinite`
          }}
        />
      ))}

      <Container maxWidth="lg" sx={{ display: 'flex', alignItems: 'center', py: 4, zIndex: 1 }}>
        <Grid container spacing={0} sx={{ minHeight: '80vh' }}>
          {/* Left Panel - Branding */}
          <Grid item xs={12} md={7} sx={{ display: { xs: 'none', md: 'flex' } }}>
            <Box
              sx={{
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'flex-start',
                px: 6,
                color: 'white',
                position: 'relative'
              }}
            >
              <Slide direction="right" in={true} timeout={1000}>
                <Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 4 }}>
                    <Avatar
                      sx={{
                        width: 60,
                        height: 60,
                        mr: 3,
                        background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
                        boxShadow: '0 8px 32px rgba(59, 130, 246, 0.3)',
                        animation: 'hologram 4s ease-in-out infinite'
                      }}
                    >
                      <BusinessIcon sx={{ fontSize: 30 }} />
                    </Avatar>
                    <Box>
                      <Typography variant="h3" fontWeight="800" sx={{ 
                        background: 'linear-gradient(135deg, #ffffff, #e2e8f0)',
                        backgroundClip: 'text',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        transition: 'all 0.3s ease'
                      }}>
                        MyRH
                      </Typography>
                      <Typography variant="h6" sx={{ color: '#94a3b8', fontWeight: 300, transition: 'all 0.3s ease' }}>
                        Human Resources Management
                      </Typography>
                    </Box>
                  </Box>
                  
                  <Typography variant="h4" fontWeight="600" sx={{ mb: 3, lineHeight: 1.2, transition: 'all 0.3s ease' }}>
                    Gérez vos ressources humaines avec
                    <Box component="span" sx={{ 
                      background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
                      backgroundClip: 'text',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                      fontWeight: 700,
                      transition: 'all 0.3s ease'
                    }}>
                      {' '}intelligence
                    </Box>
                  </Typography>
                  
                  <Typography variant="body1" sx={{ mb: 4, color: '#cbd5e1', fontSize: '1.1rem', lineHeight: 1.6, transition: 'all 0.3s ease' }}>
                    Plateforme complète pour la gestion des employés, recrutement, formation et analyse RH.
                  </Typography>
                  
                  <Grid container spacing={3}>
                    {[
                      { icon: <Group />, title: 'Gestion Employés', desc: 'Profils complets' },
                      { icon: <Security />, title: 'Sécurisé', desc: 'Données protégées' },
                      { icon: <Speed />, title: 'Performant', desc: 'Interface rapide' },
                      { icon: <TrendingUp />, title: 'Analytics', desc: 'Tableaux de bord' }
                    ].map((feature, index) => (
                      <Grid item xs={6} key={index}>
                        <Box sx={{ 
                          display: 'flex', 
                          alignItems: 'center', 
                          mb: 2,
                          transition: 'all 0.3s ease',
                          '&:hover': {
                            transform: 'translateX(10px)'
                          }
                        }}>
                          <Avatar sx={{ 
                            width: 40, 
                            height: 40, 
                            mr: 2, 
                            background: 'rgba(59, 130, 246, 0.1)',
                            border: '1px solid rgba(59, 130, 246, 0.2)',
                            transition: 'all 0.3s ease'
                          }}>
                            {React.cloneElement(feature.icon, { sx: { fontSize: 20, color: '#3b82f6' } })}
                          </Avatar>
                          <Box>
                            <Typography variant="subtitle2" fontWeight="600" sx={{ transition: 'all 0.3s ease' }}>
                              {feature.title}
                            </Typography>
                            <Typography variant="caption" sx={{ color: '#94a3b8', transition: 'all 0.3s ease' }}>
                              {feature.desc}
                            </Typography>
                          </Box>
                        </Box>
                      </Grid>
                    ))}
                  </Grid>
                </Box>
              </Slide>
            </Box>
          </Grid>
          
          {/* Right Panel - Login Form */}
          <Grid item xs={12} md={5}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100%', px: 2 }}>
              <Slide direction="left" in={true} timeout={800}>
                <Card
                  elevation={0}
                  sx={{
                    width: '100%',
                    maxWidth: 420,
                    background: 'rgba(255, 255, 255, 0.98)',
                    backdropFilter: 'blur(20px)',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    borderRadius: 3,
                    overflow: 'hidden',
                    position: 'relative',
                    transition: 'all 0.3s ease',
                    '&::before': {
                      content: '""',
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      right: 0,
                      height: '4px',
                      background: 'linear-gradient(90deg, #3b82f6, #8b5cf6, #06b6d4)',
                      animation: 'neonFlow 3s linear infinite'
                    }
                  }}
                >
                  <Box sx={{ p: 4 }}>
                    <Box sx={{ textAlign: 'center', mb: 4, position: 'relative' }}>
                      <Typography variant="h4" fontWeight="700" color="#1e293b" gutterBottom sx={{
                        position: 'relative',
                        transition: 'all 0.3s ease',
                        '&::after': {
                          content: '""',
                          position: 'absolute',
                          bottom: -8,
                          left: '50%',
                          transform: 'translateX(-50%)',
                          width: 60,
                          height: 3,
                          background: 'linear-gradient(90deg, #3b82f6, #8b5cf6)',
                          borderRadius: 2,
                          transition: 'all 0.3s ease'
                        }
                      }}>
                        Connexion
                      </Typography>
                      <Typography variant="body2" color="#64748b" sx={{ transition: 'all 0.3s ease' }}>
                        Accédez à votre espace de travail
                      </Typography>
                    </Box>

                    {error && (
                      <Fade in={!!error}>
                        <Alert severity="error" sx={{ mb: 3, borderRadius: 2, transition: 'all 0.3s ease' }}>
                          {error}
                        </Alert>
                      </Fade>
                    )}

                    <Box component="form" onSubmit={handleSubmit}>
                      <TextField
                        fullWidth
                        label="Nom d'utilisateur"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        required
                        autoFocus
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <PersonIcon sx={{ color: '#64748b' }} />
                            </InputAdornment>
                          ),
                        }}
                        sx={{
                          mb: 3,
                          '& .MuiOutlinedInput-root': {
                            borderRadius: 2,
                            backgroundColor: '#f8fafc',
                            border: '1px solid #e2e8f0',
                            transition: 'all 0.3s ease',
                            '&:hover': {
                              backgroundColor: '#f1f5f9',
                              borderColor: '#3b82f6',
                              transform: 'translateY(-2px)',
                              boxShadow: '0 4px 12px rgba(59, 130, 246, 0.15)'
                            },
                            '&.Mui-focused': {
                              backgroundColor: '#ffffff',
                              boxShadow: '0 0 0 3px rgba(59, 130, 246, 0.1)',
                              transform: 'translateY(-2px)'
                            }
                          }
                        }}
                      />

                      <TextField
                        fullWidth
                        label="Mot de passe"
                        type={showPassword ? 'text' : 'password'}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <LockIcon sx={{ color: '#64748b' }} />
                            </InputAdornment>
                          ),
                          endAdornment: (
                            <InputAdornment position="end">
                              <IconButton onClick={() => setShowPassword(!showPassword)} edge="end">
                                {showPassword ? <VisibilityOff /> : <Visibility />}
                              </IconButton>
                            </InputAdornment>
                          ),
                        }}
                        sx={{
                          mb: 4,
                          '& .MuiOutlinedInput-root': {
                            borderRadius: 2,
                            backgroundColor: '#f8fafc',
                            border: '1px solid #e2e8f0',
                            transition: 'all 0.3s ease',
                            '&:hover': {
                              backgroundColor: '#f1f5f9',
                              borderColor: '#3b82f6',
                              transform: 'translateY(-2px)',
                              boxShadow: '0 4px 12px rgba(59, 130, 246, 0.15)'
                            },
                            '&.Mui-focused': {
                              backgroundColor: '#ffffff',
                              boxShadow: '0 0 0 3px rgba(59, 130, 246, 0.1)',
                              transform: 'translateY(-2px)'
                            }
                          }
                        }}
                      />

                      <Button
                        type="submit"
                        fullWidth
                        variant="contained"
                        size="large"
                        disabled={loading}
                        sx={{
                          py: 1.5,
                          fontSize: '1rem',
                          fontWeight: 600,
                          borderRadius: 2,
                          background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
                          boxShadow: '0 4px 15px rgba(59, 130, 246, 0.4)',
                          textTransform: 'none',
                          position: 'relative',
                          overflow: 'hidden',
                          transition: 'all 0.3s ease',
                          '&::before': {
                            content: '""',
                            position: 'absolute',
                            top: 0,
                            left: '-100%',
                            width: '100%',
                            height: '100%',
                            background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent)',
                            transition: 'left 0.5s'
                          },
                          '&:hover': {
                            background: 'linear-gradient(135deg, #1d4ed8 0%, #1e40af 100%)',
                            boxShadow: '0 6px 20px rgba(59, 130, 246, 0.6)',
                            transform: 'translateY(-3px)',
                            '&::before': {
                              left: '100%'
                            }
                          }
                        }}
                      >
                        {loading ? 'Connexion...' : 'Se connecter'}
                      </Button>
                    </Box>

                    <Divider sx={{ my: 3, transition: 'all 0.3s ease' }}>
                      <Chip 
                        label="Aide" 
                        size="small" 
                        sx={{ 
                          backgroundColor: '#f1f5f9', 
                          color: '#64748b',
                          transition: 'all 0.3s ease',
                          '&:hover': {
                            backgroundColor: '#e2e8f0'
                          }
                        }} 
                      />
                    </Divider>

                    <Typography variant="body2" color="#64748b" textAlign="center" sx={{ transition: 'all 0.3s ease' }}>
                      Problème de connexion ?
                      <Box component="span" sx={{ 
                        color: '#3b82f6', 
                        fontWeight: 500, 
                        cursor: 'pointer', 
                        ml: 1,
                        transition: 'all 0.3s ease',
                        '&:hover': {
                          color: '#1d4ed8'
                        }
                      }}>
                        Contactez l'administrateur
                      </Box>
                    </Typography>
                  </Box>
                </Card>
              </Slide>
            </Box>
          </Grid>
        </Grid>
      </Container>
      
      {/* CSS Animations */}
      <style jsx>{`
        @keyframes particleFloat {
          0% { transform: translate(0, 0) rotate(0deg); }
          25% { transform: translate(100px, -50px) rotate(90deg); }
          50% { transform: translate(-50px, -100px) rotate(180deg); }
          75% { transform: translate(-100px, 50px) rotate(270deg); }
          100% { transform: translate(0, 0) rotate(360deg); }
        }
        @keyframes hologram {
          0%, 100% { 
            transform: scale(1) rotateY(0deg);
            filter: hue-rotate(0deg);
            box-shadow: 0 8px 32px rgba(59, 130, 246, 0.3);
          }
          25% { 
            transform: scale(1.05) rotateY(90deg);
            filter: hue-rotate(90deg);
            box-shadow: 0 8px 32px rgba(139, 92, 246, 0.3);
          }
          50% { 
            transform: scale(1.1) rotateY(180deg);
            filter: hue-rotate(180deg);
            box-shadow: 0 8px 32px rgba(6, 182, 212, 0.3);
          }
          75% { 
            transform: scale(1.05) rotateY(270deg);
            filter: hue-rotate(270deg);
            box-shadow: 0 8px 32px rgba(139, 92, 246, 0.3);
          }
        }
        @keyframes neonFlow {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
      `}</style>
    </Box>
  );
};

export default Login;