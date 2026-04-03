import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box, Card, CardContent, Typography, Grid, Chip, Alert, CircularProgress,
  LinearProgress, Avatar, Paper, Divider, IconButton, Tooltip
} from '@mui/material';
import {
  ArrowBack, School, CalendarToday, CheckCircle, Schedule, Person,
  MenuBook, TrendingUp, Star, PlayArrow, Bookmark, Share
} from '@mui/icons-material';
import { getMyTrainings } from '../../services/employeeService';

const MyTrainings = () => {
  const navigate = useNavigate();
  const [trainings, setTrainings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchTrainings();
  }, []);

  const fetchTrainings = async () => {
    try {
      const response = await getMyTrainings();
      setTrainings(response.data);
    } catch (error) {
      setError('Erreur lors du chargement des formations');
      console.error('Trainings fetch error:', error);
    } finally {
      setLoading(false);
    }
  };

  const getTrainingStatus = (training) => {
    const today = new Date();
    const startDate = new Date(training.start_date);
    const endDate = new Date(training.end_date);

    if (today < startDate) {
      return { 
        label: 'À venir', 
        color: '#2196f3', 
        bgColor: '#e3f2fd',
        icon: '📅',
        progress: 0
      };
    } else if (today >= startDate && today <= endDate) {
      const totalDays = (endDate - startDate) / (1000 * 60 * 60 * 24);
      const passedDays = (today - startDate) / (1000 * 60 * 60 * 24);
      const progress = Math.min(100, Math.max(0, (passedDays / totalDays) * 100));
      return { 
        label: 'En cours', 
        color: '#ff9800', 
        bgColor: '#fff3e0',
        icon: '📚',
        progress: Math.round(progress)
      };
    } else {
      return { 
        label: 'Terminée', 
        color: '#4caf50', 
        bgColor: '#e8f5e8',
        icon: '✅',
        progress: 100
      };
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    });
  };

  const getTrainingTypeIcon = (type) => {
    const icons = {
      'technical': '💻',
      'management': '📈',
      'communication': '💬',
      'safety': '🛡️',
      'quality': '⭐'
    };
    return icons[type] || '🎓';
  };

  if (loading) {
    return (
      <Box sx={{ mt: 4, mb: 4 }}>
        <Box sx={{ 
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          borderRadius: 4,
          p: 4,
          mb: 4,
          color: 'white',
          position: 'relative',
          overflow: 'hidden'
        }}>
          <Box sx={{
            position: 'absolute',
            top: -50,
            right: -50,
            width: 200,
            height: 200,
            background: 'rgba(255,255,255,0.1)',
            borderRadius: '50%'
          }} />
          <Box sx={{ position: 'relative', zIndex: 1 }}>
            <Box display="flex" alignItems="center" mb={2}>
              <MenuBook sx={{ mr: 2, fontSize: 36 }} />
              <Typography variant="h3" fontWeight="bold">
                Mes Formations
              </Typography>
            </Box>
            <Typography variant="h6" sx={{ opacity: 0.9 }}>
              Votre parcours de développement professionnel
            </Typography>
          </Box>
        </Box>
        <LinearProgress sx={{ borderRadius: 2, height: 6 }} />
        <Typography variant="h6" sx={{ mt: 2, textAlign: 'center' }}>
          Chargement de vos formations...
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ mt: 4, mb: 4 }}>
      {/* Header avec design moderne */}
      <Box sx={{ 
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        borderRadius: 4,
        p: 4,
        mb: 4,
        color: 'white',
        position: 'relative',
        overflow: 'hidden'
      }}>
        <Box sx={{
          position: 'absolute',
          top: -50,
          right: -50,
          width: 200,
          height: 200,
          background: 'rgba(255,255,255,0.1)',
          borderRadius: '50%'
        }} />
        <Box sx={{
          position: 'absolute',
          bottom: -30,
          left: -30,
          width: 150,
          height: 150,
          background: 'rgba(255,255,255,0.05)',
          borderRadius: '50%'
        }} />
        <Box sx={{ position: 'relative', zIndex: 1 }}>
          <Box display="flex" alignItems="center" mb={2}>
            <MenuBook sx={{ mr: 2, fontSize: 36 }} />
            <Typography variant="h3" fontWeight="bold">
              Mes Formations
            </Typography>
          </Box>
          <Typography variant="h6" sx={{ opacity: 0.9 }}>
            Votre parcours de développement professionnel
          </Typography>
          <Box sx={{ mt: 2, display: 'flex', gap: 2 }}>
            <Chip 
              label={`${trainings.length} formation${trainings.length > 1 ? 's' : ''}`}
              sx={{ backgroundColor: 'rgba(255,255,255,0.2)', color: 'white' }}
            />
            <Chip 
              label={`${trainings.filter(t => getTrainingStatus(t).progress === 100).length} terminée${trainings.filter(t => getTrainingStatus(t).progress === 100).length > 1 ? 's' : ''}`}
              sx={{ backgroundColor: 'rgba(255,255,255,0.2)', color: 'white' }}
            />
          </Box>
        </Box>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

      {trainings.length === 0 ? (
        <Paper elevation={0} sx={{ 
          textAlign: 'center', 
          py: 8,
          background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
          borderRadius: 4
        }}>
          <Box sx={{
            background: 'rgba(255,255,255,0.8)',
            borderRadius: '50%',
            width: 120,
            height: 120,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            mx: 'auto',
            mb: 3
          }}>
            <School sx={{ fontSize: 64, color: 'text.secondary' }} />
          </Box>
          <Typography variant="h5" fontWeight="600" color="text.secondary" gutterBottom>
            Aucune formation assignée
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Vos formations approuvées apparaîtront ici
          </Typography>
        </Paper>
      ) : (
        <Grid container spacing={3}>
          {trainings.map((training) => {
            const status = getTrainingStatus(training);
            return (
              <Grid item xs={12} md={6} lg={4} key={training.id}>
                <Card 
                  sx={{ 
                    height: '100%',
                    borderRadius: 3,
                    overflow: 'hidden',
                    transition: 'all 0.3s ease',
                    border: status.progress > 0 && status.progress < 100 ? `2px solid ${status.color}` : '1px solid #e0e0e0',
                    '&:hover': {
                      transform: 'translateY(-8px)',
                      boxShadow: '0 12px 24px rgba(0,0,0,0.15)'
                    }
                  }}
                >
                  {/* Header coloré avec progression */}
                  <Box sx={{
                    background: `linear-gradient(135deg, ${status.color} 0%, ${status.color}dd 100%)`,
                    p: 2.5,
                    color: 'white',
                    position: 'relative'
                  }}>
                    <Box sx={{
                      position: 'absolute',
                      top: -20,
                      right: -20,
                      fontSize: '60px',
                      opacity: 0.3
                    }}>
                      {status.icon}
                    </Box>
                    <Box sx={{ position: 'relative', zIndex: 1 }}>
                      <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={1}>
                        <Typography variant="h6" fontWeight="bold" sx={{ flex: 1 }}>
                          {training.name}
                        </Typography>
                        <Chip 
                          label={status.label}
                          size="small"
                          sx={{ 
                            backgroundColor: 'rgba(255,255,255,0.2)',
                            color: 'white',
                            fontWeight: 'bold'
                          }}
                        />
                      </Box>
                      
                      {/* Barre de progression */}
                      <Box sx={{ mt: 2 }}>
                        <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                          <Typography variant="body2" sx={{ opacity: 0.9 }}>
                            Progression
                          </Typography>
                          <Typography variant="body2" fontWeight="bold">
                            {status.progress}%
                          </Typography>
                        </Box>
                        <LinearProgress 
                          variant="determinate" 
                          value={status.progress}
                          sx={{
                            height: 6,
                            borderRadius: 3,
                            backgroundColor: 'rgba(255,255,255,0.3)',
                            '& .MuiLinearProgress-bar': {
                              backgroundColor: 'white',
                              borderRadius: 3
                            }
                          }}
                        />
                      </Box>
                    </Box>
                  </Box>

                  <CardContent sx={{ p: 3 }}>
                    <Typography variant="body1" color="text.secondary" paragraph sx={{ 
                      minHeight: 48,
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden',
                      lineHeight: 1.6
                    }}>
                      {training.description}
                    </Typography>

                    <Divider sx={{ my: 2 }} />

                    {/* Informations détaillées */}
                    <Box sx={{ mb: 2 }}>
                      <Box display="flex" alignItems="center" mb={1.5} sx={{
                        p: 1,
                        backgroundColor: '#f8fafc',
                        borderRadius: 2
                      }}>
                        <CalendarToday sx={{ fontSize: 18, mr: 1.5, color: status.color }} />
                        <Typography variant="body2" fontWeight="500">
                          {formatDate(training.start_date)} - {formatDate(training.end_date)}
                        </Typography>
                      </Box>
                      
                      <Box display="flex" alignItems="center" mb={1.5} sx={{
                        p: 1,
                        backgroundColor: '#f8fafc',
                        borderRadius: 2
                      }}>
                        <Schedule sx={{ fontSize: 18, mr: 1.5, color: status.color }} />
                        <Typography variant="body2">
                          Durée: {training.duration_days} jour{training.duration_days > 1 ? 's' : ''}
                        </Typography>
                      </Box>

                      {training.created_by_name && (
                        <Box display="flex" alignItems="center" sx={{
                          p: 1,
                          backgroundColor: '#f8fafc',
                          borderRadius: 2
                        }}>
                          <Person sx={{ fontSize: 18, mr: 1.5, color: status.color }} />
                          <Typography variant="body2">
                            Organisée par: {training.created_by_name}
                          </Typography>
                        </Box>
                      )}
                    </Box>

                    {/* Footer avec actions */}
                    <Box display="flex" alignItems="center" justifyContent="space-between" sx={{
                      pt: 2,
                      borderTop: '1px solid #f0f0f0'
                    }}>
                      <Box display="flex" alignItems="center">
                        <Avatar sx={{ 
                          width: 28, 
                          height: 28, 
                          mr: 1,
                          background: `linear-gradient(135deg, ${status.color} 0%, ${status.color}dd 100%)`,
                          fontSize: 12
                        }}>
                          <TrendingUp sx={{ fontSize: 16 }} />
                        </Avatar>
                        <Typography variant="caption" color="text.secondary" fontWeight="500">
                          Formation RH
                        </Typography>
                      </Box>
                      
                      <Box>
                        {status.progress > 0 && status.progress < 100 && (
                          <Tooltip title="Continuer">
                            <IconButton size="small" sx={{ mr: 0.5, color: status.color }}>
                              <PlayArrow sx={{ fontSize: 18 }} />
                            </IconButton>
                          </Tooltip>
                        )}
                        <Tooltip title="Ajouter aux favoris">
                          <IconButton size="small" sx={{ mr: 0.5 }}>
                            <Bookmark sx={{ fontSize: 18 }} />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Partager">
                          <IconButton size="small">
                            <Share sx={{ fontSize: 18 }} />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            );
          })}
        </Grid>
      )}
    </Box>
  );
};

export default MyTrainings;