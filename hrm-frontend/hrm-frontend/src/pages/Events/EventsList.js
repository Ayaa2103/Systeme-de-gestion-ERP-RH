import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Grid,
  Chip,
  Avatar,
  IconButton,
  Menu,
  MenuItem,
  TextField,
  InputAdornment,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper
} from '@mui/material';
import {
  Event as EventIcon,
  Add as AddIcon,
  Search as SearchIcon,
  MoreVert as MoreVertIcon,
  Visibility as ViewIcon,
  Edit as EditIcon,
  CheckCircle as ApproveIcon,
  Cancel as CancelIcon,
  LocationOn as LocationIcon,
  Schedule as ScheduleIcon,
  People as PeopleIcon
} from '@mui/icons-material';
import { getEvents, approveEvent, rejectEvent } from '../../services/hrService';
import { useAuth } from '../../contexts/AuthContext';

const EventsList = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedEvent, setSelectedEvent] = useState(null);

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      const response = await getEvents();
      const eventsData = response.data.results || response.data || [];
      setEvents(eventsData);
    } catch (error) {
      console.error('Erreur:', error);
      setEvents([]);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id) => {
    try {
      await approveEvent(id);
      await fetchEvents();
      setAnchorEl(null);
    } catch (error) {
      console.error('Erreur:', error);
    }
  };

  const handleReject = async (id) => {
    try {
      await rejectEvent(id);
      await fetchEvents();
      setAnchorEl(null);
    } catch (error) {
      console.error('Erreur:', error);
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

  const filteredEvents = events.filter(event => {
    const matchesSearch = (event.name || event.title)?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         event.location?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = !statusFilter || event.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h4" fontWeight="bold" gutterBottom>
            Événements
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Gestion des événements d'entreprise et formations
          </Typography>
        </Box>
        {user?.role === 'hr_manager' && (
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => navigate('/events/create')}
          >
            Nouvel Événement
          </Button>
        )}
      </Box>

      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={2.4}>
          <Card elevation={0} sx={{ border: '1px solid #e0e0e0', borderRadius: 2 }}>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="h4" color="primary" fontWeight="bold">
                {events.length}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Total
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={2.4}>
          <Card elevation={0} sx={{ border: '1px solid #e0e0e0', borderRadius: 2 }}>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="h4" color="warning.main" fontWeight="bold">
                {events.filter(e => e.status === 'pending').length}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                En attente
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={2.4}>
          <Card elevation={0} sx={{ border: '1px solid #e0e0e0', borderRadius: 2 }}>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="h4" color="success.main" fontWeight="bold">
                {events.filter(e => e.status === 'approved').length}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Approuvés
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Card elevation={0} sx={{ border: '1px solid #e0e0e0', borderRadius: 2, mb: 3 }}>
        <CardContent>
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                placeholder="Rechercher..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                InputProps={{
                  startAdornment: <InputAdornment position="start"><SearchIcon /></InputAdornment>
                }}
              />
            </Grid>
            <Grid item xs={12} md={3}>
              <TextField
                fullWidth
                select
                label="Statut"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                SelectProps={{ native: true }}
              >
                <option value="">Tous</option>
                <option value="planned">Planifié</option>
                <option value="approved">Approuvé</option>
                <option value="completed">Terminé</option>
              </TextField>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      <Card elevation={0} sx={{ border: '1px solid #e0e0e0', borderRadius: 2 }}>
        <CardContent>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Événement</TableCell>
                  <TableCell>Date</TableCell>
                  <TableCell>Lieu</TableCell>
                  <TableCell>Statut</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredEvents.map((event) => (
                  <TableRow key={event.id}>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Avatar sx={{ mr: 2, backgroundColor: '#1976d2' }}>
                          <EventIcon />
                        </Avatar>
                        <Box>
                          <Typography variant="subtitle2" fontWeight="600">
                            {event.name || event.title}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {event.description?.substring(0, 50)}...
                          </Typography>
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {new Date(event.date).toLocaleDateString()}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {event.start_time} - {event.end_time}
                      </Typography>
                    </TableCell>
                    <TableCell>{event.location}</TableCell>
                    <TableCell>
                      <Chip
                        label={getStatusLabel(event.status)}
                        color={getStatusColor(event.status)}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <IconButton 
                        size="small"
                        onClick={(e) => {
                          setAnchorEl(e.currentTarget);
                          setSelectedEvent(event);
                        }}
                      >
                        <MoreVertIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>

      {/* Menu contextuel */}
      <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={() => setAnchorEl(null)}>
        <MenuItem onClick={() => {
          navigate(`/events/${selectedEvent.id}`);
          setAnchorEl(null);
        }}>
          <ViewIcon sx={{ mr: 1 }} />
          Voir détails
        </MenuItem>
        {user?.role === 'hr_director' && selectedEvent?.status === 'pending' && (
          <>
            <MenuItem onClick={() => handleApprove(selectedEvent.id)}>
              <ApproveIcon sx={{ mr: 1 }} />
              Approuver
            </MenuItem>
            <MenuItem onClick={() => handleReject(selectedEvent.id)}>
              <CancelIcon sx={{ mr: 1 }} />
              Rejeter
            </MenuItem>
          </>
        )}
      </Menu>
    </Box>
  );
};

export default EventsList;