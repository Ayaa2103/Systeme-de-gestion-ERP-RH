import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box, Card, CardContent, Typography, Button, Grid, Chip,
  IconButton, Menu, MenuItem, TextField, InputAdornment, CircularProgress, Divider,
} from '@mui/material';
import {
  Event as EventIcon,
  Add as AddIcon,
  Search as SearchIcon,
  MoreVert as MoreVertIcon,
  Visibility as ViewIcon,
  CheckCircle as ApproveIcon,
  Cancel as CancelIcon,
  LocationOn as LocationIcon,
  Schedule as ScheduleIcon,
  CalendarToday as CalendarIcon,
  PendingActions as PendingIcon,
  TaskAlt as CompletedIcon,
} from '@mui/icons-material';
import { getEvents, approveEvent, rejectEvent } from '../../services/hrService';
import { useAuth } from '../../contexts/AuthContext';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

const statusConfig = {
  draft:     { label: 'Brouillon',  color: '#757575', bg: '#f5f5f5' },
  pending:   { label: 'En attente', color: '#e65100', bg: '#fff3e0' },
  planned:   { label: 'Planifié',   color: '#0288d1', bg: '#e1f5fe' },
  approved:  { label: 'Approuvé',   color: '#2e7d32', bg: '#e8f5e9' },
  completed: { label: 'Terminé',    color: '#7b1fa2', bg: '#f3e5f5' },
  cancelled: { label: 'Annulé',     color: '#c62828', bg: '#ffebee' },
};

const StatCard = ({ title, value, icon, color, loading }) => (
  <Card elevation={0} sx={{
    border: '1px solid', borderColor: `${color}25`, borderRadius: 3,
    transition: 'all 0.3s ease',
    '&:hover': { boxShadow: `0 6px 20px ${color}18`, borderColor: `${color}45` },
  }}>
    <CardContent sx={{ p: 2.5 }}>
      <Box sx={{ mb: 1.5 }}>
        <Box sx={{ p: 1, borderRadius: 2, bgcolor: `${color}12`, display: 'inline-flex' }}>
          {React.cloneElement(icon, { sx: { fontSize: 20, color } })}
        </Box>
      </Box>
      {loading ? (
        <Box sx={{ height: 48, display: 'flex', alignItems: 'center' }}>
          <CircularProgress size={20} sx={{ color }} />
        </Box>
      ) : (
        <>
          <Typography variant="h4" fontWeight={700} sx={{ color, lineHeight: 1 }}>{value}</Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5, fontSize: '0.8rem' }}>{title}</Typography>
        </>
      )}
    </CardContent>
  </Card>
);

const EventsList = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const isAdmin = user?.role === 'administrator';
  const isHRDirector = user?.role === 'hr_director';

  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedEvent, setSelectedEvent] = useState(null);

  useEffect(() => { fetchEvents(); }, []);

  const fetchEvents = async () => {
    try {
      const res = await getEvents();
      setEvents(res.data.results || res.data || []);
    } catch (_) { setEvents([]); }
    finally { setLoading(false); }
  };

  const handleApprove = async (id) => {
    try { await approveEvent(id); await fetchEvents(); } catch (_) {}
    setAnchorEl(null);
  };

  const handleReject = async (id) => {
    try { await rejectEvent(id); await fetchEvents(); } catch (_) {}
    setAnchorEl(null);
  };

  const filteredEvents = events.filter(e => {
    const q = searchTerm.toLowerCase();
    return (
      (!q || (e.name || e.title)?.toLowerCase().includes(q) || e.location?.toLowerCase().includes(q)) &&
      (!statusFilter || e.status === statusFilter)
    );
  });

  const pending   = events.filter(e => e.status === 'pending').length;
  const approved  = events.filter(e => e.status === 'approved').length;
  const planned   = events.filter(e => e.status === 'planned').length;

  return (
    <Box sx={{ width: '100%' }}>

      {/* ── Banner ── */}
      <Card elevation={0} sx={{ borderRadius: 3, border: '1px solid #e8ecf0', mb: 3, overflow: 'hidden' }}>
        <Box sx={{
          background: 'linear-gradient(135deg, #0f172a 0%, #1e3a5f 60%, #1e40af 100%)',
          px: 3, py: 2.5, display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Box sx={{ p: 1.25, borderRadius: 2, bgcolor: 'rgba(255,255,255,0.12)', display: 'inline-flex' }}>
              <EventIcon sx={{ fontSize: 22, color: 'white' }} />
            </Box>
            <Box>
              <Typography variant="h5" fontWeight={700} color="white">Événements</Typography>
              <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.65)', mt: 0.3 }}>
                {events.length} événement{events.length !== 1 ? 's' : ''} au total
              </Typography>
            </Box>
          </Box>
          {user?.role === 'hr_manager' && (
            <Button
              variant="contained" startIcon={<AddIcon />}
              onClick={() => navigate('/events/create')}
              sx={{
                bgcolor: 'rgba(255,255,255,0.15)', color: 'white',
                border: '1px solid rgba(255,255,255,0.25)',
                borderRadius: 2, textTransform: 'none', fontWeight: 600,
                backdropFilter: 'blur(8px)',
                '&:hover': { bgcolor: 'rgba(255,255,255,0.25)' },
              }}
            >
              Nouvel Événement
            </Button>
          )}
        </Box>
      </Card>

      {/* ── Stat cards ── */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={6} sm={3}>
          <StatCard title="Total"      value={events.length} icon={<EventIcon />}     color="#1976d2" loading={loading} />
        </Grid>
        <Grid item xs={6} sm={3}>
          <StatCard title="En attente" value={pending}        icon={<PendingIcon />}   color="#e65100" loading={loading} />
        </Grid>
        <Grid item xs={6} sm={3}>
          <StatCard title="Approuvés"  value={approved}       icon={<ApproveIcon />}   color="#2e7d32" loading={loading} />
        </Grid>
        <Grid item xs={6} sm={3}>
          <StatCard title="Planifiés"  value={planned}        icon={<CompletedIcon />} color="#0288d1" loading={loading} />
        </Grid>
      </Grid>

      {/* ── Filter bar ── */}
      <Card elevation={0} sx={{ border: '1px solid #e8ecf0', borderRadius: 3, mb: 3 }}>
        <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center' }}>
            <TextField
              placeholder="Rechercher par nom ou lieu…"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              size="small"
              sx={{ flex: 1, minWidth: 200, '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon sx={{ fontSize: 18, color: 'text.disabled' }} />
                  </InputAdornment>
                ),
              }}
            />
            <TextField
              select size="small" value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              sx={{ width: 160, '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
              SelectProps={{ displayEmpty: true }}
            >
              <MenuItem value="">Tous les statuts</MenuItem>
              <MenuItem value="draft">Brouillon</MenuItem>
              <MenuItem value="pending">En attente</MenuItem>
              <MenuItem value="planned">Planifié</MenuItem>
              <MenuItem value="approved">Approuvé</MenuItem>
              <MenuItem value="completed">Terminé</MenuItem>
              <MenuItem value="cancelled">Annulé</MenuItem>
            </TextField>
            <Chip
              label={`${filteredEvents.length} résultat${filteredEvents.length !== 1 ? 's' : ''}`}
              size="small"
              sx={{ bgcolor: '#f0f4ff', color: '#1976d2', fontWeight: 600, border: '1px solid #bfdbfe' }}
            />
          </Box>
        </CardContent>
      </Card>

      {/* ── Cards ── */}
      {loading ? (
        <Grid container spacing={2}>
          {[1,2,3,4].map(i => (
            <Grid item xs={12} md={6} key={i}>
              <Card elevation={0} sx={{ border: '1px solid #e8ecf0', borderRadius: 3, p: 2.5 }}>
                <Box sx={{ display: 'flex', gap: 1.5, mb: 2 }}>
                  <Box sx={{ width: 40, height: 40, borderRadius: 2, bgcolor: '#f0f0f0' }} />
                  <Box sx={{ flex: 1 }}>
                    <Box sx={{ height: 14, bgcolor: '#f0f0f0', borderRadius: 1, mb: 0.75, width: '60%' }} />
                    <Box sx={{ height: 11, bgcolor: '#f5f5f5', borderRadius: 1, width: '35%' }} />
                  </Box>
                </Box>
                <Box sx={{ height: 11, bgcolor: '#f5f5f5', borderRadius: 1, mb: 0.75 }} />
                <Box sx={{ height: 11, bgcolor: '#f5f5f5', borderRadius: 1, width: '75%' }} />
              </Card>
            </Grid>
          ))}
        </Grid>
      ) : filteredEvents.length === 0 ? (
        <Card elevation={0} sx={{ border: '1px solid #e8ecf0', borderRadius: 3 }}>
          <CardContent sx={{ textAlign: 'center', py: 8 }}>
            <Box sx={{ p: 2, borderRadius: 3, bgcolor: '#f8fafc', display: 'inline-flex', mb: 2 }}>
              <EventIcon sx={{ fontSize: 48, color: 'text.disabled' }} />
            </Box>
            <Typography variant="h6" fontWeight={600} color="text.secondary">Aucun événement trouvé</Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
              {searchTerm || statusFilter ? 'Modifiez vos critères de recherche' : 'Aucun événement disponible'}
            </Typography>
          </CardContent>
        </Card>
      ) : (
        <Grid container spacing={2}>
          {filteredEvents.map((event) => {
            const sc = statusConfig[event.status] || { label: event.status, color: '#757575', bg: '#f5f5f5' };
            const eventDate = event.date ? new Date(event.date) : null;
            return (
              <Grid item xs={12} md={6} key={event.id}>
                <Card
                  elevation={0}
                  onClick={() => navigate(`/events/${event.id}`)}
                  sx={{
                    border: '1px solid #e8ecf0',
                    borderLeft: `4px solid ${sc.color}`,
                    borderRadius: 3, cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    '&:hover': { boxShadow: `0 6px 24px ${sc.color}20`, transform: 'translateY(-2px)' },
                  }}
                >
                  <CardContent sx={{ p: 2.5 }}>
                    <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5, mb: 1.5 }}>
                      {/* Date badge */}
                      <Box sx={{
                        width: 48, height: 48, bgcolor: `${sc.color}12`, borderRadius: 2, flexShrink: 0,
                        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                        border: `1px solid ${sc.color}25`,
                      }}>
                        {eventDate ? (
                          <>
                            <Typography sx={{ fontSize: '0.55rem', color: sc.color, fontWeight: 700, lineHeight: 1, textTransform: 'uppercase' }}>
                              {format(eventDate, 'MMM', { locale: fr })}
                            </Typography>
                            <Typography sx={{ fontSize: '1.1rem', color: sc.color, fontWeight: 800, lineHeight: 1.2 }}>
                              {format(eventDate, 'd')}
                            </Typography>
                          </>
                        ) : (
                          <EventIcon sx={{ fontSize: 20, color: sc.color }} />
                        )}
                      </Box>

                      <Box sx={{ flex: 1, minWidth: 0 }}>
                        <Typography variant="subtitle1" fontWeight={700} noWrap sx={{ lineHeight: 1.3 }}>
                          {event.name || event.title}
                        </Typography>
                        {event.location && (
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 0.3 }}>
                            <LocationIcon sx={{ fontSize: 13, color: 'text.disabled' }} />
                            <Typography variant="caption" color="text.secondary" noWrap>{event.location}</Typography>
                          </Box>
                        )}
                      </Box>

                      <IconButton
                        size="small" sx={{ flexShrink: 0, color: 'text.disabled' }}
                        onClick={(e) => { e.stopPropagation(); setAnchorEl(e.currentTarget); setSelectedEvent(event); }}
                      >
                        <MoreVertIcon fontSize="small" />
                      </IconButton>
                    </Box>

                    <Box sx={{ display: 'flex', gap: 0.75, flexWrap: 'wrap', mb: 1.5 }}>
                      <Chip
                        label={sc.label} size="small"
                        sx={{ bgcolor: sc.bg, color: sc.color, fontWeight: 700, fontSize: '0.7rem',
                              border: `1px solid ${sc.color}30`, height: 22, '& .MuiChip-label': { px: 1 } }}
                      />
                      {event.start_time && event.end_time && (
                        <Chip
                          icon={<ScheduleIcon sx={{ fontSize: '12px !important' }} />}
                          label={`${event.start_time} – ${event.end_time}`}
                          size="small" variant="outlined"
                          sx={{ fontSize: '0.7rem', height: 22, '& .MuiChip-label': { px: 0.75 } }}
                        />
                      )}
                    </Box>

                    {event.description && (
                      <Typography variant="body2" color="text.secondary" sx={{
                        overflow: 'hidden', display: '-webkit-box',
                        WebkitLineClamp: 2, WebkitBoxOrient: 'vertical',
                        fontSize: '0.8rem', lineHeight: 1.55, mb: 1.5,
                      }}>
                        {event.description}
                      </Typography>
                    )}

                    <Divider sx={{ mb: 1.5 }} />
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      <CalendarIcon sx={{ fontSize: 13, color: 'text.disabled' }} />
                      <Typography variant="caption" color="text.disabled">
                        {eventDate ? format(eventDate, 'EEEE d MMMM yyyy', { locale: fr }) : '—'}
                      </Typography>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            );
          })}
        </Grid>
      )}

      {/* ── Context menu ── */}
      <Menu
        anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={() => setAnchorEl(null)}
        PaperProps={{ elevation: 0, sx: { border: '1px solid #e8ecf0', borderRadius: 2, minWidth: 170 } }}
      >
        <MenuItem onClick={() => { navigate(`/events/${selectedEvent?.id}`); setAnchorEl(null); }} sx={{ fontSize: '0.875rem' }}>
          <ViewIcon sx={{ mr: 1.5, fontSize: 18 }} />Voir détails
        </MenuItem>
        {isHRDirector && selectedEvent?.status === 'pending' && (
          <MenuItem onClick={() => handleApprove(selectedEvent.id)} sx={{ fontSize: '0.875rem', color: '#2e7d32' }}>
            <ApproveIcon sx={{ mr: 1.5, fontSize: 18 }} />Approuver
          </MenuItem>
        )}
        {isHRDirector && selectedEvent?.status === 'pending' && (
          <MenuItem onClick={() => handleReject(selectedEvent.id)} sx={{ fontSize: '0.875rem', color: '#c62828' }}>
            <CancelIcon sx={{ mr: 1.5, fontSize: 18 }} />Rejeter
          </MenuItem>
        )}
      </Menu>

    </Box>
  );
};

export default EventsList;
