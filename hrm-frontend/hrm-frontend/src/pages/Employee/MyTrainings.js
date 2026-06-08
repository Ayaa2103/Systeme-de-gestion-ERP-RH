import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box, Card, CardContent, Typography, Grid, Chip, Alert,
  LinearProgress, Avatar, Divider, Skeleton, Button,
} from '@mui/material';
import {
  ArrowBack as BackIcon,
  School as SchoolIcon,
  CalendarToday as CalendarIcon,
  CheckCircle as DoneIcon,
  Schedule as PendingIcon,
  PlayCircle as ActiveIcon,
  Person as PersonIcon,
  AccessTime as DurationIcon,
  TrendingUp as ProgressIcon,
} from '@mui/icons-material';
import { getMyTrainings } from '../../services/employeeService';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

/* ── Statut calculé selon les dates ── */
const getStatus = (training) => {
  const today = new Date();
  const start = new Date(training.start_date);
  const end   = new Date(training.end_date);

  if (training.status === 'approved' && today >= start && today <= end) {
    const total   = Math.max(1, (end - start) / 86400000);
    const elapsed = (today - start) / 86400000;
    const prog    = Math.min(100, Math.round((elapsed / total) * 100));
    return { key: 'active',  label: 'En cours',  color: '#f57c00', bg: '#fff8e1', progress: prog };
  }
  if (training.status === 'approved' && today < start)
    return { key: 'upcoming', label: 'À venir',  color: '#1976d2', bg: '#e3f2fd', progress: 0 };
  if (training.status === 'approved' && today > end)
    return { key: 'done',     label: 'Terminée', color: '#2e7d32', bg: '#e8f5e9', progress: 100 };
  if (training.status === 'pending')
    return { key: 'pending',  label: 'En attente', color: '#9c27b0', bg: '#f3e5f5', progress: 0 };
  return { key: 'other', label: training.status || '—', color: '#64748b', bg: '#f1f5f9', progress: 0 };
};

const FILTERS = [
  { key: 'all',     label: 'Toutes' },
  { key: 'active',  label: 'En cours',    color: '#f57c00' },
  { key: 'upcoming',label: 'À venir',     color: '#1976d2' },
  { key: 'done',    label: 'Terminées',   color: '#2e7d32' },
  { key: 'pending', label: 'En attente',  color: '#9c27b0' },
];

const MyTrainings = () => {
  const navigate  = useNavigate();
  const [trainings, setTrainings] = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [error,     setError]     = useState('');
  const [filter,    setFilter]    = useState('all');

  useEffect(() => {
    getMyTrainings()
      .then(r => setTrainings(r.data || []))
      .catch(() => setError('Erreur lors du chargement des formations'))
      .finally(() => setLoading(false));
  }, []);

  const withStatus = useMemo(() => trainings.map(t => ({ ...t, _status: getStatus(t) })), [trainings]);

  const displayed = useMemo(() =>
    filter === 'all' ? withStatus : withStatus.filter(t => t._status.key === filter),
  [withStatus, filter]);

  const counts = {
    all:     trainings.length,
    active:  withStatus.filter(t => t._status.key === 'active').length,
    upcoming:withStatus.filter(t => t._status.key === 'upcoming').length,
    done:    withStatus.filter(t => t._status.key === 'done').length,
    pending: withStatus.filter(t => t._status.key === 'pending').length,
  };

  const globalProgress = withStatus.length > 0
    ? Math.round(withStatus.reduce((s, t) => s + t._status.progress, 0) / withStatus.length)
    : 0;

  return (
    <Box sx={{ width: '100%' }}>

      {/* ── Banner ── */}
      <Card elevation={0} sx={{ borderRadius: 3, border: '1px solid #e8ecf0', mb: 3, overflow: 'hidden' }}>
        <Box sx={{ background: 'linear-gradient(135deg,#0f172a 0%,#1e3a5f 60%,#1e40af 100%)',
          px: 3, py: 3, position: 'relative', overflow: 'hidden' }}>
          <Box sx={{ position: 'absolute', top: -30, right: -30, width: 150, height: 150,
            borderRadius: '50%', bgcolor: 'rgba(255,255,255,0.03)', pointerEvents: 'none' }} />

          <Button startIcon={<BackIcon />} onClick={() => navigate('/dashboard')} size="small"
            sx={{ color: 'rgba(255,255,255,0.6)', textTransform: 'none', borderRadius: 2, mb: 2,
              '&:hover': { bgcolor: 'rgba(255,255,255,0.08)', color: 'white' } }}>
            Retour
          </Button>

          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Box sx={{ p: 1.5, borderRadius: 2.5, bgcolor: 'rgba(255,255,255,0.12)', flexShrink: 0 }}>
                <SchoolIcon sx={{ fontSize: 28, color: 'white' }} />
              </Box>
              <Box>
                <Typography variant="h5" fontWeight={700} color="white">Mes Formations</Typography>
                <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.65)', mt: 0.3 }}>
                  {trainings.length} formation{trainings.length !== 1 ? 's' : ''} · {counts.active} en cours
                </Typography>
              </Box>
            </Box>

            {/* Mini stats */}
            <Box sx={{ display: 'flex', gap: 2.5 }}>
              {[
                { label: 'Terminées', value: counts.done,   color: '#86efac' },
                { label: 'En cours',  value: counts.active, color: '#fbbf24' },
                { label: 'Progression', value: `${globalProgress}%`, color: '#60a5fa' },
              ].map(s => (
                <Box key={s.label} sx={{ textAlign: 'center' }}>
                  <Typography sx={{ fontSize: '1.3rem', fontWeight: 800, color: s.color, lineHeight: 1 }}>{s.value}</Typography>
                  <Typography sx={{ fontSize: '0.68rem', color: 'rgba(255,255,255,0.5)', mt: 0.2 }}>{s.label}</Typography>
                </Box>
              ))}
            </Box>
          </Box>

          {/* Progression globale */}
          {trainings.length > 0 && (
            <Box sx={{ mt: 3, pt: 2.5, borderTop: '1px solid rgba(255,255,255,0.08)' }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.75 }}>
                <Typography sx={{ color: 'rgba(255,255,255,0.75)', fontSize: '0.82rem', fontWeight: 600 }}>
                  Progression globale
                </Typography>
                <Typography sx={{ color: 'white', fontWeight: 800, fontSize: '0.9rem' }}>{globalProgress}%</Typography>
              </Box>
              <LinearProgress variant="determinate" value={globalProgress}
                sx={{ height: 6, borderRadius: 4, bgcolor: 'rgba(255,255,255,0.15)',
                  '& .MuiLinearProgress-bar': { bgcolor: '#60a5fa', borderRadius: 4 } }} />
            </Box>
          )}
        </Box>
      </Card>

      {error && <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>{error}</Alert>}

      {/* ── Filter pills ── */}
      {trainings.length > 0 && (
        <Card elevation={0} sx={{ border: '1px solid #e8ecf0', borderRadius: 3, mb: 3 }}>
          <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', alignItems: 'center' }}>
              <Typography sx={{ fontSize: '0.72rem', fontWeight: 700, color: '#94a3b8',
                textTransform: 'uppercase', letterSpacing: '0.5px', mr: 0.5 }}>
                Filtrer :
              </Typography>
              {FILTERS.map(f => {
                const cnt = f.key === 'all' ? counts.all : (counts[f.key] ?? 0);
                const active = filter === f.key;
                if (f.key !== 'all' && cnt === 0) return null;
                return (
                  <Box key={f.key} onClick={() => setFilter(f.key)}
                    sx={{ px: 1.5, py: 0.4, borderRadius: 50, cursor: 'pointer', fontSize: '0.78rem',
                      fontWeight: active ? 700 : 500, userSelect: 'none', transition: 'all 0.15s',
                      border: `1px solid ${active ? (f.color || '#1976d2') : '#e8ecf0'}`,
                      bgcolor: active ? (f.color ? `${f.color}10` : '#eff6ff') : 'white',
                      color: active ? (f.color || '#1976d2') : '#475569',
                      display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    {f.label}
                    <Box sx={{ fontSize: '0.7rem', fontWeight: 700, ml: 0.25 }}>({cnt})</Box>
                  </Box>
                );
              })}
            </Box>
          </CardContent>
        </Card>
      )}

      {/* ── Formations ── */}
      {loading ? (
        <Grid container spacing={2}>
          {[1,2,3].map(i => (
            <Grid item xs={12} md={6} lg={4} key={i}>
              <Skeleton variant="rounded" height={260} sx={{ borderRadius: 3 }} />
            </Grid>
          ))}
        </Grid>
      ) : displayed.length === 0 ? (
        <Card elevation={0} sx={{ borderRadius: 3, border: '2px dashed #e8ecf0' }}>
          <CardContent sx={{ textAlign: 'center', py: 8 }}>
            <SchoolIcon sx={{ fontSize: 52, color: '#cbd5e1', mb: 2 }} />
            <Typography variant="h6" fontWeight={600} color="text.secondary" gutterBottom>
              {filter === 'all' ? 'Aucune formation assignée' : `Aucune formation "${FILTERS.find(f => f.key === filter)?.label}"`}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Vos formations approuvées apparaîtront ici
            </Typography>
          </CardContent>
        </Card>
      ) : (
        <Grid container spacing={2}>
          {displayed.map(training => {
            const sc = training._status;
            return (
              <Grid item xs={12} md={6} lg={4} key={training.id}>
                <Card elevation={0} sx={{
                  borderRadius: 3, overflow: 'hidden', height: '100%',
                  border: `1px solid ${sc.color}25`,
                  borderTop: `3px solid ${sc.color}`,
                  transition: 'all 0.2s',
                  '&:hover': { boxShadow: `0 6px 24px ${sc.color}15`, transform: 'translateY(-2px)' },
                }}>

                  {/* Header coloré */}
                  <Box sx={{ px: 2.5, pt: 2.5, pb: 2, bgcolor: sc.bg }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1.5 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25, flex: 1, minWidth: 0 }}>
                        <Avatar sx={{ bgcolor: `${sc.color}20`, width: 36, height: 36, borderRadius: 2, flexShrink: 0 }}>
                          {sc.key === 'done'     && <DoneIcon   sx={{ color: sc.color, fontSize: 18 }} />}
                          {sc.key === 'active'   && <ActiveIcon  sx={{ color: sc.color, fontSize: 18 }} />}
                          {sc.key === 'upcoming' && <CalendarIcon sx={{ color: sc.color, fontSize: 16 }} />}
                          {sc.key === 'pending'  && <PendingIcon  sx={{ color: sc.color, fontSize: 16 }} />}
                        </Avatar>
                        <Typography sx={{ fontSize: '0.9rem', fontWeight: 700, color: '#1e293b', lineHeight: 1.3 }}>
                          {training.name}
                        </Typography>
                      </Box>
                      <Chip label={sc.label} size="small"
                        sx={{ bgcolor: `${sc.color}15`, color: sc.color, fontWeight: 700,
                          fontSize: '0.68rem', height: 20, border: `1px solid ${sc.color}30`, flexShrink: 0, ml: 1 }} />
                    </Box>

                    {/* Barre de progression */}
                    <Box>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                        <Typography sx={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 600 }}>Progression</Typography>
                        <Typography sx={{ fontSize: '0.72rem', fontWeight: 800, color: sc.color }}>{sc.progress}%</Typography>
                      </Box>
                      <LinearProgress variant="determinate" value={sc.progress}
                        sx={{ height: 5, borderRadius: 3, bgcolor: `${sc.color}15`,
                          '& .MuiLinearProgress-bar': { bgcolor: sc.color, borderRadius: 3 } }} />
                    </Box>
                  </Box>

                  <CardContent sx={{ p: 2.5, pt: 2 }}>
                    {training.description && (
                      <Typography sx={{ fontSize: '0.8rem', color: '#64748b', lineHeight: 1.6, mb: 2,
                        overflow: 'hidden', display: '-webkit-box',
                        WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
                        {training.description}
                      </Typography>
                    )}

                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.75 }}>
                      {/* Dates */}
                      {training.start_date && (
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1,
                          p: 1, bgcolor: '#f8fafc', borderRadius: 1.5 }}>
                          <CalendarIcon sx={{ fontSize: 14, color: sc.color }} />
                          <Typography sx={{ fontSize: '0.78rem', color: '#334155' }}>
                            {format(new Date(training.start_date), 'dd MMM', { locale: fr })}
                            {training.end_date && ` → ${format(new Date(training.end_date), 'dd MMM yyyy', { locale: fr })}`}
                          </Typography>
                        </Box>
                      )}

                      {/* Durée */}
                      {training.duration_days && (
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1,
                          p: 1, bgcolor: '#f8fafc', borderRadius: 1.5 }}>
                          <DurationIcon sx={{ fontSize: 14, color: sc.color }} />
                          <Typography sx={{ fontSize: '0.78rem', color: '#334155' }}>
                            {training.duration_days} jour{training.duration_days !== 1 ? 's' : ''}
                          </Typography>
                        </Box>
                      )}

                      {/* Organisateur */}
                      {training.created_by_name && (
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1,
                          p: 1, bgcolor: '#f8fafc', borderRadius: 1.5 }}>
                          <PersonIcon sx={{ fontSize: 14, color: sc.color }} />
                          <Typography sx={{ fontSize: '0.78rem', color: '#334155' }} noWrap>
                            {training.created_by_name}
                          </Typography>
                        </Box>
                      )}
                    </Box>

                    {/* Participants */}
                    {training.employees_count > 0 && (
                      <>
                        <Divider sx={{ my: 1.5 }} />
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <ProgressIcon sx={{ fontSize: 14, color: '#94a3b8' }} />
                          <Typography variant="caption" color="text.secondary">
                            {training.employees_count} participant{training.employees_count !== 1 ? 's' : ''}
                          </Typography>
                        </Box>
                      </>
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

export default MyTrainings;
