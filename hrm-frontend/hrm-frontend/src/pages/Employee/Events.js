import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box, Card, CardContent, Typography, Grid, Chip, Avatar,
  Skeleton, Button, TextField, InputAdornment, Divider,
} from '@mui/material';
import {
  Event as EventIcon,
  CalendarToday as CalendarIcon,
  LocationOn as LocationIcon,
  ArrowBack as BackIcon,
  Search as SearchIcon,
  CheckCircle as ApprovedIcon,
  Schedule as PendingIcon,
  People as PeopleIcon,
} from '@mui/icons-material';
import { eventsService } from '../../services/eventsService';
import { format, isToday, isTomorrow, isPast } from 'date-fns';
import { fr } from 'date-fns/locale';

const FILTERS = [
  { key: 'all',      label: 'Tous' },
  { key: 'upcoming', label: 'À venir',  color: '#1976d2', bg: '#eff6ff' },
  { key: 'today',    label: 'Aujourd\'hui', color: '#2e7d32', bg: '#e8f5e9' },
  { key: 'past',     label: 'Passés',   color: '#64748b', bg: '#f1f5f9' },
];

const getEventTiming = (dateStr) => {
  if (!dateStr) return 'other';
  const d = new Date(dateStr);
  if (isToday(d))  return 'today';
  if (isPast(d))   return 'past';
  return 'upcoming';
};

const formatEventDate = (dateStr) => {
  if (!dateStr) return '—';
  const d = new Date(dateStr);
  if (isToday(d))    return 'Aujourd\'hui';
  if (isTomorrow(d)) return 'Demain';
  return format(d, 'EEEE d MMMM yyyy', { locale: fr });
};

const TIMING_CONFIG = {
  today:    { color: '#2e7d32', bg: '#e8f5e9', label: 'Aujourd\'hui' },
  upcoming: { color: '#1976d2', bg: '#e3f2fd', label: 'À venir' },
  past:     { color: '#64748b', bg: '#f1f5f9', label: 'Passé' },
  other:    { color: '#64748b', bg: '#f1f5f9', label: '—' },
};

const Events = () => {
  const navigate = useNavigate();
  const [events,  setEvents]  = useState([]);
  const [loading, setLoading] = useState(true);
  const [search,  setSearch]  = useState('');
  const [filter,  setFilter]  = useState('all');
  const [expanded,setExpanded]= useState({});

  useEffect(() => {
    eventsService.getEvents()
      .then(data => setEvents(
        (Array.isArray(data) ? data : data?.results || [])
          .filter(e => e.status === 'approved')
          .sort((a, b) => new Date(a.date) - new Date(b.date))
      ))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const withTiming = useMemo(() =>
    events.map(e => ({ ...e, _timing: getEventTiming(e.date) })), [events]);

  const displayed = useMemo(() => {
    const q = search.toLowerCase();
    return withTiming.filter(e =>
      (!q || (e.name || e.title)?.toLowerCase().includes(q) || e.location?.toLowerCase().includes(q)) &&
      (filter === 'all' || e._timing === filter)
    );
  }, [withTiming, search, filter]);

  const counts = {
    all:      events.length,
    upcoming: withTiming.filter(e => e._timing === 'upcoming').length,
    today:    withTiming.filter(e => e._timing === 'today').length,
    past:     withTiming.filter(e => e._timing === 'past').length,
  };

  return (
    <Box sx={{ width: '100%' }}>

      {/* ── Banner ── */}
      <Card elevation={0} sx={{ borderRadius: 3, border: '1px solid #e8ecf0', mb: 3, overflow: 'hidden' }}>
        <Box sx={{ background: 'linear-gradient(135deg,#0f172a 0%,#1e3a5f 60%,#1e40af 100%)',
          px: 3, py: 2.5, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Button startIcon={<BackIcon />} onClick={() => navigate('/dashboard')} size="small"
              sx={{ color: 'rgba(255,255,255,0.7)', textTransform: 'none', borderRadius: 2,
                '&:hover': { bgcolor: 'rgba(255,255,255,0.1)', color: 'white' } }}>
              Retour
            </Button>
            <Box sx={{ p: 1.25, borderRadius: 2, bgcolor: 'rgba(255,255,255,0.12)', display: 'inline-flex' }}>
              <EventIcon sx={{ fontSize: 22, color: 'white' }} />
            </Box>
            <Box>
              <Typography variant="h5" fontWeight={700} color="white">Événements d'entreprise</Typography>
              <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.65)', mt: 0.3 }}>
                Découvrez tous les événements de votre organisation
              </Typography>
            </Box>
          </Box>
          {/* Mini stats */}
          <Box sx={{ display: 'flex', gap: 2.5 }}>
            {[
              { label: 'Aujourd\'hui', value: counts.today,    color: '#86efac' },
              { label: 'À venir',      value: counts.upcoming, color: '#60a5fa' },
              { label: 'Total',        value: counts.all,      color: 'rgba(255,255,255,0.7)' },
            ].map(s => (
              <Box key={s.label} sx={{ textAlign: 'center' }}>
                <Typography sx={{ fontSize: '1.3rem', fontWeight: 800, color: s.color, lineHeight: 1 }}>{s.value}</Typography>
                <Typography sx={{ fontSize: '0.68rem', color: 'rgba(255,255,255,0.5)', mt: 0.2 }}>{s.label}</Typography>
              </Box>
            ))}
          </Box>
        </Box>
      </Card>

      {/* ── Stat cards ── */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        {FILTERS.map(f => {
          const cnt = f.key === 'all' ? counts.all : (counts[f.key] ?? 0);
          const active = filter === f.key;
          if (f.key !== 'all' && cnt === 0) return null;
          return (
            <Grid item xs={6} sm={3} key={f.key}>
              <Card elevation={0} onClick={() => setFilter(f.key)}
                sx={{ border: `1px solid ${active ? (f.color || '#1976d2') : `${f.color || '#1976d2'}20`}`,
                  borderRadius: 3, cursor: 'pointer', transition: 'all 0.2s',
                  bgcolor: active ? (f.bg || '#eff6ff') : 'white',
                  '&:hover': { boxShadow: `0 4px 16px ${f.color || '#1976d2'}15`, borderColor: `${f.color || '#1976d2'}45` } }}>
                <CardContent sx={{ p: 2 }}>
                  <Avatar sx={{ bgcolor: `${f.color || '#1976d2'}12`, width: 30, height: 30, mb: 1 }}>
                    <EventIcon sx={{ color: f.color || '#1976d2', fontSize: 15 }} />
                  </Avatar>
                  <Typography variant="h4" fontWeight={800} sx={{ color: f.color || '#1976d2', lineHeight: 1 }}>{cnt}</Typography>
                  <Typography variant="caption" color="text.secondary" sx={{ mt: 0.4, display: 'block' }}>{f.label}</Typography>
                </CardContent>
              </Card>
            </Grid>
          );
        })}
      </Grid>

      {/* ── Search + filter pills ── */}
      <Card elevation={0} sx={{ border: '1px solid #e8ecf0', borderRadius: 3, mb: 3 }}>
        <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center' }}>
            <TextField placeholder="Rechercher par titre ou lieu…" value={search}
              onChange={e => setSearch(e.target.value)} size="small"
              sx={{ flex: 1, minWidth: 220, '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
              InputProps={{ startAdornment: <InputAdornment position="start"><SearchIcon sx={{ fontSize: 17, color: '#94a3b8' }} /></InputAdornment> }} />
            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
              {FILTERS.map(f => {
                const cnt = f.key === 'all' ? counts.all : (counts[f.key] ?? 0);
                if (f.key !== 'all' && cnt === 0) return null;
                const active = filter === f.key;
                return (
                  <Box key={f.key} onClick={() => setFilter(f.key)}
                    sx={{ px: 1.5, py: 0.4, borderRadius: 50, cursor: 'pointer', fontSize: '0.78rem',
                      fontWeight: active ? 700 : 500, userSelect: 'none', transition: 'all 0.15s',
                      border: `1px solid ${active ? (f.color || '#1976d2') : '#e8ecf0'}`,
                      bgcolor: active ? (f.bg || '#eff6ff') : 'white',
                      color: active ? (f.color || '#1976d2') : '#475569' }}>
                    {f.label}
                  </Box>
                );
              })}
            </Box>
            <Chip label={`${displayed.length} événement${displayed.length !== 1 ? 's' : ''}`} size="small"
              sx={{ bgcolor: '#eff6ff', color: '#1976d2', fontWeight: 600, border: '1px solid #bfdbfe' }} />
          </Box>
        </CardContent>
      </Card>

      {/* ── Événements ── */}
      {loading ? (
        <Grid container spacing={2}>
          {[1,2,3,4].map(i => (
            <Grid item xs={12} sm={6} md={4} key={i}>
              <Skeleton variant="rounded" height={240} sx={{ borderRadius: 3 }} />
            </Grid>
          ))}
        </Grid>
      ) : displayed.length === 0 ? (
        <Card elevation={0} sx={{ borderRadius: 3, border: '2px dashed #e8ecf0' }}>
          <CardContent sx={{ textAlign: 'center', py: 8 }}>
            <EventIcon sx={{ fontSize: 52, color: '#cbd5e1', mb: 2 }} />
            <Typography variant="h6" fontWeight={600} color="text.secondary">
              {search || filter !== 'all' ? 'Aucun résultat' : 'Aucun événement pour le moment'}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
              Les événements approuvés par la direction apparaîtront ici
            </Typography>
          </CardContent>
        </Card>
      ) : (
        <Grid container spacing={2}>
          {displayed.map(event => {
            const tc = TIMING_CONFIG[event._timing] || TIMING_CONFIG.other;
            const name = event.name || event.title || '—';
            const isExpanded = expanded[event.id];
            const longDesc = event.description && event.description.length > 140;

            return (
              <Grid item xs={12} sm={6} md={4} key={event.id}>
                <Card elevation={0} sx={{
                  borderRadius: 3, overflow: 'hidden', height: '100%',
                  border: `1px solid ${tc.color}25`,
                  borderTop: `3px solid ${tc.color}`,
                  transition: 'all 0.2s',
                  '&:hover': { boxShadow: `0 6px 24px ${tc.color}15`, transform: 'translateY(-2px)' },
                }}>

                  {/* Header coloré */}
                  <Box sx={{ px: 2.5, pt: 2.5, pb: 2, bgcolor: tc.bg }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1.25 }}>
                      {/* Bloc date */}
                      <Box sx={{ width: 46, height: 46, borderRadius: 2, bgcolor: 'white',
                        border: `1px solid ${tc.color}25`, display: 'flex', flexDirection: 'column',
                        alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        {event.date ? (
                          <>
                            <Typography sx={{ fontSize: '0.58rem', color: tc.color, fontWeight: 700,
                              textTransform: 'uppercase', lineHeight: 1 }}>
                              {format(new Date(event.date), 'MMM', { locale: fr })}
                            </Typography>
                            <Typography sx={{ fontSize: '1.1rem', color: tc.color, fontWeight: 800, lineHeight: 1.2 }}>
                              {format(new Date(event.date), 'd')}
                            </Typography>
                          </>
                        ) : (
                          <EventIcon sx={{ fontSize: 18, color: tc.color }} />
                        )}
                      </Box>

                      <Box sx={{ flex: 1, ml: 1.5, minWidth: 0 }}>
                        <Typography sx={{ fontSize: '0.95rem', fontWeight: 700, color: '#1e293b',
                          lineHeight: 1.3, mb: 0.3 }} noWrap>
                          {name}
                        </Typography>
                        <Chip label={tc.label} size="small"
                          sx={{ bgcolor: `${tc.color}15`, color: tc.color, fontWeight: 700,
                            fontSize: '0.65rem', height: 18, border: `1px solid ${tc.color}25` }} />
                      </Box>
                    </Box>

                    {/* Date lisible */}
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                      <CalendarIcon sx={{ fontSize: 13, color: tc.color }} />
                      <Typography sx={{ fontSize: '0.78rem', color: tc.color, fontWeight: 600,
                        textTransform: 'capitalize' }}>
                        {formatEventDate(event.date)}
                      </Typography>
                    </Box>
                  </Box>

                  <CardContent sx={{ p: 2.5, pt: 2 }}>
                    {/* Description */}
                    {event.description && (
                      <Box sx={{ mb: 1.75 }}>
                        <Typography sx={{ fontSize: '0.8rem', color: '#475569', lineHeight: 1.7,
                          overflow: isExpanded ? 'visible' : 'hidden',
                          display: isExpanded ? 'block' : '-webkit-box',
                          WebkitLineClamp: isExpanded ? 'none' : 3,
                          WebkitBoxOrient: 'vertical' }}>
                          {event.description}
                        </Typography>
                        {longDesc && (
                          <Typography onClick={() => setExpanded(p => ({ ...p, [event.id]: !p[event.id] }))}
                            sx={{ fontSize: '0.75rem', color: tc.color, fontWeight: 600, cursor: 'pointer', mt: 0.5,
                              '&:hover': { textDecoration: 'underline' } }}>
                            {isExpanded ? 'Voir moins' : 'Voir plus'}
                          </Typography>
                        )}
                      </Box>
                    )}

                    {/* Lieu */}
                    {event.location && (
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1,
                        p: 1, bgcolor: '#f8fafc', borderRadius: 1.5 }}>
                        <LocationIcon sx={{ fontSize: 14, color: tc.color, flexShrink: 0 }} />
                        <Typography sx={{ fontSize: '0.78rem', color: '#334155' }} noWrap>
                          {event.location}
                        </Typography>
                      </Box>
                    )}

                    {/* Créé par */}
                    {(event.created_by_name || event.created_by) && (
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1,
                        p: 1, bgcolor: '#f8fafc', borderRadius: 1.5 }}>
                        <PeopleIcon sx={{ fontSize: 14, color: '#94a3b8', flexShrink: 0 }} />
                        <Typography sx={{ fontSize: '0.78rem', color: '#64748b' }} noWrap>
                          {event.created_by_name || event.created_by?.first_name || 'Équipe RH'}
                        </Typography>
                      </Box>
                    )}
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

export default Events;
