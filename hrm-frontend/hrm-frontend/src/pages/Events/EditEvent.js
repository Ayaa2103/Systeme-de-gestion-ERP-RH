import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Grid,
  IconButton,
  MenuItem
} from '@mui/material';
import {
  ArrowBack as BackIcon,
  Save as SaveIcon
} from '@mui/icons-material';
import { getEvents } from '../../services/hrService';

const EditEvent = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [event, setEvent] = useState({
    name: '',
    description: '',
    date: '',
    start_time: '',
    end_time: '',
    location: '',
    status: 'pending'
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchEventDetail();
  }, [id]);

  const fetchEventDetail = async () => {
    try {
      const response = await getEvents();
      const events = response.data.results || response.data || [];
      const foundEvent = events.find(e => e.id === parseInt(id));
      if (foundEvent) {
        setEvent({
          name: foundEvent.name || foundEvent.title || '',
          description: foundEvent.description || '',
          date: foundEvent.date || '',
          start_time: foundEvent.start_time || '',
          end_time: foundEvent.end_time || '',
          location: foundEvent.location || '',
          status: foundEvent.status || 'pending'
        });
      }
    } catch (error) {
      console.error('Erreur:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Ici vous pouvez ajouter l'appel API pour mettre à jour l'événement
      console.log('Mise à jour événement:', event);
      navigate('/events');
    } catch (error) {
      console.error('Erreur:', error);
    }
  };

  const handleChange = (field) => (e) => {
    setEvent(prev => ({
      ...prev,
      [field]: e.target.value
    }));
  };

  if (loading) return <Typography>Chargement...</Typography>;

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <IconButton onClick={() => navigate('/events')} sx={{ mr: 2 }}>
          <BackIcon />
        </IconButton>
        <Typography variant="h4" fontWeight="bold">
          Modifier l'événement
        </Typography>
      </Box>

      <Card elevation={0} sx={{ border: '1px solid #e0e0e0', borderRadius: 2 }}>
        <CardContent>
          <form onSubmit={handleSubmit}>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Nom de l'événement"
                  value={event.name}
                  onChange={handleChange('name')}
                  required
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Description"
                  value={event.description}
                  onChange={handleChange('description')}
                  multiline
                  rows={4}
                />
              </Grid>

              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  label="Date"
                  type="date"
                  value={event.date}
                  onChange={handleChange('date')}
                  InputLabelProps={{ shrink: true }}
                  required
                />
              </Grid>

              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  label="Heure de début"
                  type="time"
                  value={event.start_time}
                  onChange={handleChange('start_time')}
                  InputLabelProps={{ shrink: true }}
                  required
                />
              </Grid>

              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  label="Heure de fin"
                  type="time"
                  value={event.end_time}
                  onChange={handleChange('end_time')}
                  InputLabelProps={{ shrink: true }}
                  required
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Lieu"
                  value={event.location}
                  onChange={handleChange('location')}
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  select
                  label="Statut"
                  value={event.status}
                  onChange={handleChange('status')}
                >
                  <MenuItem value="draft">Brouillon</MenuItem>
                  <MenuItem value="pending">En attente</MenuItem>
                  <MenuItem value="planned">Planifié</MenuItem>
                </TextField>
              </Grid>

              <Grid item xs={12}>
                <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
                  <Button
                    variant="outlined"
                    onClick={() => navigate('/events')}
                  >
                    Annuler
                  </Button>
                  <Button
                    type="submit"
                    variant="contained"
                    startIcon={<SaveIcon />}
                  >
                    Enregistrer
                  </Button>
                </Box>
              </Grid>
            </Grid>
          </form>
        </CardContent>
      </Card>
    </Box>
  );
};

export default EditEvent;