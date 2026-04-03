import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Chip,
  Avatar,
  Grid,
  Divider,
  IconButton
} from '@mui/material';
import {
  Event as EventIcon,
  ArrowBack as BackIcon,
  LocationOn as LocationIcon,
  Schedule as ScheduleIcon,
  Person as PersonIcon,
  Description as DescriptionIcon
} from '@mui/icons-material';
import { getEvents } from '../../services/hrService';

const EventDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchEventDetail();
  }, [id]);

  const fetchEventDetail = async () => {
    try {
      const response = await getEvents();
      const events = response.data.results || response.data || [];
      const foundEvent = events.find(e => e.id === parseInt(id));
      setEvent(foundEvent);
    } catch (error) {
      console.error('Erreur:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      'draft': 'default',
      'pending': 'warning',
      'planned': 'info',
      'approved': 'success',
      'completed': 'primary',
      'cancelled': 'error'
    };
    return colors[status] || 'default';
  };

  const getStatusLabel = (status) => {
    const labels = {
      'draft': 'Brouillon',
      'pending': 'En attente',
      'planned': 'Planifié',
      'approved': 'Approuvé',
      'completed': 'Terminé',
      'cancelled': 'Annulé'
    };
    return labels[status] || status;
  };

  if (loading) return <Typography>Chargement...</Typography>;
  if (!event) return <Typography>Événement non trouvé</Typography>;

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <IconButton onClick={() => navigate('/events')} sx={{ mr: 2 }}>
          <BackIcon />
        </IconButton>
        <Typography variant="h4" fontWeight="bold">
          Détail de l'événement
        </Typography>
      </Box>

      <Card elevation={0} sx={{ border: '1px solid #e0e0e0', borderRadius: 2 }}>
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
            <Avatar sx={{ width: 60, height: 60, mr: 3, backgroundColor: '#1976d2' }}>
              <EventIcon sx={{ fontSize: 30 }} />
            </Avatar>
            <Box sx={{ flex: 1 }}>
              <Typography variant="h5" fontWeight="600" gutterBottom>
                {event.name || event.title}
              </Typography>
              <Chip
                label={getStatusLabel(event.status)}
                color={getStatusColor(event.status)}
                size="small"
              />
            </Box>
          </Box>

          <Divider sx={{ my: 3 }} />

          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <ScheduleIcon sx={{ mr: 2, color: 'text.secondary' }} />
                <Box>
                  <Typography variant="subtitle2" fontWeight="600">
                    Date et heure
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {new Date(event.date).toLocaleDateString()} - {event.start_time} à {event.end_time}
                  </Typography>
                </Box>
              </Box>

              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <LocationIcon sx={{ mr: 2, color: 'text.secondary' }} />
                <Box>
                  <Typography variant="subtitle2" fontWeight="600">
                    Lieu
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {event.location || 'Non spécifié'}
                  </Typography>
                </Box>
              </Box>

              {event.created_by && (
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <PersonIcon sx={{ mr: 2, color: 'text.secondary' }} />
                  <Box>
                    <Typography variant="subtitle2" fontWeight="600">
                      Créé par
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {event.created_by}
                    </Typography>
                  </Box>
                </Box>
              )}
            </Grid>

            <Grid item xs={12} md={6}>
              <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 2 }}>
                <DescriptionIcon sx={{ mr: 2, mt: 0.5, color: 'text.secondary' }} />
                <Box>
                  <Typography variant="subtitle2" fontWeight="600" gutterBottom>
                    Description
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {event.description || 'Aucune description disponible'}
                  </Typography>
                </Box>
              </Box>
            </Grid>
          </Grid>
        </CardContent>
      </Card>
    </Box>
  );
};

export default EventDetail;