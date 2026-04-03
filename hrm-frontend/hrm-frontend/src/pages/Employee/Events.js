import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  Chip,
  Box,
  LinearProgress,
  Avatar,
  Paper,
  Divider,
  IconButton,
  Tooltip
} from '@mui/material';
import {
  Event as EventIcon,
  CalendarToday as CalendarIcon,
  LocationOn as LocationIcon,
  Person as PersonIcon,
  AccessTime as TimeIcon,
  Bookmark as BookmarkIcon,
  Share as ShareIcon,
  Notifications as NotificationIcon
} from '@mui/icons-material';
import { eventsService } from '../../services/eventsService';

const Events = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedEvents, setExpandedEvents] = useState({});

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const data = await eventsService.getEvents();
      setEvents(data || []);
    } catch (error) {
      console.error('Erreur lors du chargement des événements:', error);
    } finally {
      setLoading(false);
    }
  };

  const getEventTypeColor = (type) => {
    const colors = {
      'meeting': { bg: '#e3f2fd', color: '#1976d2', icon: '🤝' },
      'training': { bg: '#e8f5e8', color: '#2e7d32', icon: '🎓' },
      'celebration': { bg: '#fff3e0', color: '#f57c00', icon: '🎉' },
      'announcement': { bg: '#f3e5f5', color: '#7b1fa2', icon: '📢' }
    };
    return colors[type] || { bg: '#f5f5f5', color: '#757575', icon: '📅' };
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    if (date.toDateString() === today.toDateString()) {
      return "Aujourd'hui";
    } else if (date.toDateString() === tomorrow.toDateString()) {
      return "Demain";
    }
    
    return date.toLocaleDateString('fr-FR', {
      weekday: 'long',
      day: 'numeric',
      month: 'long'
    });
  };

  const formatTime = (dateString) => {
    return new Date(dateString).toLocaleTimeString('fr-FR', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const isUpcoming = (dateString) => {
    return new Date(dateString) > new Date();
  };

  const toggleDescription = (eventId) => {
    setExpandedEvents(prev => ({
      ...prev,
      [eventId]: !prev[eventId]
    }));
  };

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
          <Box sx={{ 
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            borderRadius: '50%',
            p: 1.5,
            mr: 2
          }}>
            <EventIcon sx={{ color: 'white', fontSize: 28 }} />
          </Box>
          <Typography variant="h4" fontWeight="bold">
            Événements d'Entreprise
          </Typography>
        </Box>
        <LinearProgress sx={{ borderRadius: 2, height: 6 }} />
        <Typography variant="h6" sx={{ mt: 2, textAlign: 'center' }}>
          Chargement des événements...
        </Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
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
            <EventIcon sx={{ mr: 2, fontSize: 36 }} />
            <Typography variant="h3" fontWeight="bold">
              Événements
            </Typography>
          </Box>
          <Typography variant="h6" sx={{ opacity: 0.9 }}>
            Découvrez tous les événements de votre entreprise
          </Typography>
        </Box>
      </Box>

      {events.length === 0 ? (
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
            <EventIcon sx={{ fontSize: 64, color: 'text.secondary' }} />
          </Box>
          <Typography variant="h5" fontWeight="600" color="text.secondary" gutterBottom>
            Aucun événement programmé
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Les prochains événements apparaîtront ici
          </Typography>
        </Paper>
      ) : (
        <Grid container spacing={3}>
          {events.map((event) => {
            const eventStyle = getEventTypeColor(event.event_type);
            const upcoming = isUpcoming(event.date);
            
            return (
              <Grid item xs={12} md={6} lg={4} key={event.id}>
                <Card sx={{ 
                  height: '100%',
                  borderRadius: 3,
                  overflow: 'hidden',
                  transition: 'all 0.3s ease',
                  border: upcoming ? '2px solid #4caf50' : '1px solid #e0e0e0',
                  '&:hover': {
                    transform: 'translateY(-8px)',
                    boxShadow: '0 12px 24px rgba(0,0,0,0.15)'
                  }
                }}>
                  {/* Header coloré */}
                  <Box sx={{
                    background: `linear-gradient(135deg, ${eventStyle.color} 0%, ${eventStyle.color}dd 100%)`,
                    p: 2,
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
                      {eventStyle.icon}
                    </Box>
                    <Box sx={{ position: 'relative', zIndex: 1 }}>
                      <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={1}>
                        <Typography variant="h6" fontWeight="bold" sx={{ flex: 1 }}>
                          {event.name || event.title}
                        </Typography>
                        {upcoming && (
                          <Chip 
                            label="À venir" 
                            size="small"
                            sx={{ 
                              backgroundColor: 'rgba(255,255,255,0.2)',
                              color: 'white',
                              fontWeight: 'bold'
                            }}
                          />
                        )}
                      </Box>
                      <Typography variant="body2" sx={{ opacity: 0.9 }}>
                        {event.event_type === 'meeting' ? 'Réunion' :
                         event.event_type === 'training' ? 'Formation' :
                         event.event_type === 'celebration' ? 'Célébration' :
                         event.event_type === 'announcement' ? 'Annonce' : 'Événement'}
                      </Typography>
                    </Box>
                  </Box>

                  <CardContent sx={{ p: 3 }}>
                    <Box>
                      <Typography 
                        variant="body1" 
                        color="text.secondary" 
                        paragraph 
                        sx={{ 
                          display: '-webkit-box',
                          WebkitLineClamp: expandedEvents[event.id] ? 'none' : 3,
                          WebkitBoxOrient: 'vertical',
                          overflow: 'hidden',
                          lineHeight: 1.6
                        }}
                      >
                        {event.description}
                      </Typography>
                      {event.description && event.description.length > 150 && (
                        <Typography 
                          variant="body2" 
                          color="primary" 
                          sx={{ 
                            cursor: 'pointer', 
                            fontWeight: 600,
                            '&:hover': { textDecoration: 'underline' }
                          }}
                          onClick={() => toggleDescription(event.id)}
                        >
                          {expandedEvents[event.id] ? 'Voir moins' : 'Voir plus'}
                        </Typography>
                      )}
                    </Box>

                    <Divider sx={{ my: 2 }} />

                    {/* Informations détaillées */}
                    <Box sx={{ mb: 2 }}>
                      <Box display="flex" alignItems="center" mb={1.5} sx={{
                        p: 1,
                        backgroundColor: '#f8fafc',
                        borderRadius: 2
                      }}>
                        <CalendarIcon sx={{ fontSize: 18, mr: 1.5, color: eventStyle.color }} />
                        <Typography variant="body2" fontWeight="600">
                          {formatDate(event.date)}
                        </Typography>
                      </Box>
                      
                      {event.time && (
                        <Box display="flex" alignItems="center" mb={1.5} sx={{
                          p: 1,
                          backgroundColor: '#f8fafc',
                          borderRadius: 2
                        }}>
                          <TimeIcon sx={{ fontSize: 18, mr: 1.5, color: eventStyle.color }} />
                          <Typography variant="body2">
                            {formatTime(event.date + 'T' + event.time)}
                          </Typography>
                        </Box>
                      )}

                      {event.location && (
                        <Box display="flex" alignItems="center" mb={1.5} sx={{
                          p: 1,
                          backgroundColor: '#f8fafc',
                          borderRadius: 2
                        }}>
                          <LocationIcon sx={{ fontSize: 18, mr: 1.5, color: eventStyle.color }} />
                          <Typography variant="body2">
                            {event.location}
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
                          background: `linear-gradient(135deg, ${eventStyle.color} 0%, ${eventStyle.color}dd 100%)`,
                          fontSize: 12
                        }}>
                          <PersonIcon sx={{ fontSize: 16 }} />
                        </Avatar>
                        <Typography variant="caption" color="text.secondary" fontWeight="500">
                          Équipe RH
                        </Typography>
                      </Box>
                      
                      <Box>
                        <Tooltip title="Ajouter aux favoris">
                          <IconButton size="small" sx={{ mr: 0.5 }}>
                            <BookmarkIcon sx={{ fontSize: 18 }} />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Partager">
                          <IconButton size="small" sx={{ mr: 0.5 }}>
                            <ShareIcon sx={{ fontSize: 18 }} />
                          </IconButton>
                        </Tooltip>
                        {upcoming && (
                          <Tooltip title="Rappel">
                            <IconButton size="small">
                              <NotificationIcon sx={{ fontSize: 18, color: eventStyle.color }} />
                            </IconButton>
                          </Tooltip>
                        )}
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            );
          })}
        </Grid>
      )}
    </Container>
  );
};

export default Events;