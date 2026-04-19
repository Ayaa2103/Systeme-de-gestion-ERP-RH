import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box, Card, CardContent, Typography, Chip, Grid,
  IconButton, CircularProgress, Divider,
} from '@mui/material';
import {
  Event as EventIcon,
  ArrowBack as ArrowBackIcon,
  LocationOn as LocationIcon,
  Schedule as ScheduleIcon,
  Person as PersonIcon,
  CalendarToday as CalendarIcon,
  Description as DescriptionIcon,
} from '@mui/icons-material';
import { getEvents } from '../../services/hrService';
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

const InfoRow = ({ icon, label, value }) => (
  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, py: 1.75, borderBottom: '1px solid #f0f4f8' }}>
    <Box sx={{ color: '#1976d2', flexShrink: 0 }}>{icon}</Box>
    <Box>
      <Typography variant="caption" color="text.disabled" sx={{ display: 'block' }}>{label}</Typography>
      <Typography variant="body2" fontWeight={500}>{value || '—'}</Typography>
    </Box>
  </Box>
);

const EventDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchEventDetail(); }, [id]);

  const fetchEventDetail = async () => {
    try {
      const res = await getEvents();
      const list = res.data.results || res.data || [];
      setEvent(list.find(e => e.id === parseInt(id)) || null);
    } catch (_) {}
    finally { setLoading(false); }
  };

  if (loading) return (
    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 300 }}>
      <CircularProgress />
    </Box>
  );

  if (!event) return (
    <Box sx={{ textAlign: 'center', py: 8 }}>
      <EventIcon sx={{ fontSize: 56, color: 'text.disabled', mb: 1.5 }} />
      <Typography variant="h6" color="text.secondary">Événement non trouvé</Typography>
    </Box>
  );

  const sc = statusConfig[event.status] || { label: event.status, color: '#757575', bg: '#f5f5f5' };
  const eventDate = event.date ? new Date(event.date) : null;

  return (
    <Box sx={{ width: '100%' }}>

      {/* ── Banner ── */}
      <Card elevation={0} sx={{ borderRadius: 3, border: '1px solid #e8ecf0', mb: 3, overflow: 'hidden' }}>
        <Box sx={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e3a5f 60%, #1e40af 100%)', px: 3, py: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2.5 }}>
            <IconButton
              size="small" onClick={() => navigate('/events')}
              sx={{ color: 'rgba(255,255,255,0.6)', '&:hover': { bgcolor: 'rgba(255,255,255,0.1)', color: 'white' } }}
            >
              <ArrowBackIcon fontSize="small" />
            </IconButton>
            <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.55)' }}>
              Retour aux événements
            </Typography>
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 2, flexWrap: 'wrap' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              {/* Date badge */}
              <Box sx={{
                width: 56, height: 56, bgcolor: 'rgba(255,255,255,0.12)', borderRadius: 2.5, flexShrink: 0,
                display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                border: '1px solid rgba(255,255,255,0.2)',
              }}>
                {eventDate ? (
                  <>
                    <Typography sx={{ fontSize: '0.6rem', color: 'rgba(255,255,255,0.7)', fontWeight: 700, lineHeight: 1, textTransform: 'uppercase' }}>
                      {format(eventDate, 'MMM', { locale: fr })}
                    </Typography>
                    <Typography sx={{ fontSize: '1.3rem', color: 'white', fontWeight: 800, lineHeight: 1.2 }}>
                      {format(eventDate, 'd')}
                    </Typography>
                  </>
                ) : (
                  <EventIcon sx={{ fontSize: 26, color: 'white' }} />
                )}
              </Box>

              <Box>
                <Typography variant="h5" fontWeight={700} color="white" sx={{ lineHeight: 1.2 }}>
                  {event.name || event.title}
                </Typography>
                {event.location && (
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 0.5 }}>
                    <LocationIcon sx={{ fontSize: 14, color: 'rgba(255,255,255,0.55)' }} />
                    <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)' }}>
                      {event.location}
                    </Typography>
                  </Box>
                )}
              </Box>
            </Box>

            <Chip
              label={sc.label} size="small"
              sx={{
                bgcolor: `${sc.color}28`, color: 'white', fontWeight: 700, fontSize: '0.75rem',
                border: `1px solid ${sc.color}50`, '& .MuiChip-label': { px: 1.25 },
              }}
            />
          </Box>
        </Box>
      </Card>

      <Grid container spacing={3}>

        {/* ── Description ── */}
        <Grid item xs={12} md={8}>
          <Card elevation={0} sx={{ border: '1px solid #e8ecf0', borderRadius: 3, overflow: 'hidden' }}>
            <Box sx={{
              background: 'linear-gradient(135deg, #0f172a 0%, #1e3a5f 60%, #1e40af 100%)',
              px: 3, py: 2, display: 'flex', alignItems: 'center', gap: 1.5,
            }}>
              <Box sx={{ p: 0.75, borderRadius: 2, bgcolor: 'rgba(255,255,255,0.12)', display: 'inline-flex' }}>
                <DescriptionIcon sx={{ fontSize: 17, color: 'white' }} />
              </Box>
              <Typography variant="subtitle1" fontWeight={700} color="white">Description</Typography>
            </Box>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="body2" color="text.secondary" sx={{ whiteSpace: 'pre-line', lineHeight: 1.9 }}>
                {event.description || 'Aucune description disponible.'}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* ── Infos ── */}
        <Grid item xs={12} md={4}>
          <Card elevation={0} sx={{ border: '1px solid #e8ecf0', borderRadius: 3, overflow: 'hidden' }}>
            <Box sx={{
              background: 'linear-gradient(135deg, #0f172a 0%, #1e3a5f 60%, #1e40af 100%)',
              px: 3, py: 2, display: 'flex', alignItems: 'center', gap: 1.5,
            }}>
              <Box sx={{ p: 0.75, borderRadius: 2, bgcolor: 'rgba(255,255,255,0.12)', display: 'inline-flex' }}>
                <CalendarIcon sx={{ fontSize: 17, color: 'white' }} />
              </Box>
              <Typography variant="subtitle1" fontWeight={700} color="white">Informations</Typography>
            </Box>
            <CardContent sx={{ p: 0 }}>
              <Box sx={{ px: 3 }}>
                <InfoRow
                  icon={<CalendarIcon sx={{ fontSize: 16 }} />}
                  label="Date"
                  value={eventDate ? format(eventDate, 'EEEE d MMMM yyyy', { locale: fr }) : '—'}
                />
                <InfoRow
                  icon={<ScheduleIcon sx={{ fontSize: 16 }} />}
                  label="Horaire"
                  value={event.start_time && event.end_time ? `${event.start_time} – ${event.end_time}` : '—'}
                />
                <InfoRow
                  icon={<LocationIcon sx={{ fontSize: 16 }} />}
                  label="Lieu"
                  value={event.location}
                />
                {event.created_by && (
                  <InfoRow
                    icon={<PersonIcon sx={{ fontSize: 16 }} />}
                    label="Créé par"
                    value={event.created_by}
                  />
                )}
                <Box sx={{ py: 1.75 }}>
                  <Typography variant="caption" color="text.disabled" sx={{ display: 'block', mb: 0.75 }}>Statut</Typography>
                  <Chip
                    label={sc.label} size="small"
                    sx={{ bgcolor: sc.bg, color: sc.color, fontWeight: 700, fontSize: '0.75rem',
                          border: `1px solid ${sc.color}30`, '& .MuiChip-label': { px: 1 } }}
                  />
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

    </Box>
  );
};

export default EventDetail;
