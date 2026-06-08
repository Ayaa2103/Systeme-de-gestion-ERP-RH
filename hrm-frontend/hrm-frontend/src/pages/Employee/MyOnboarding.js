import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box, Card, CardContent, Typography, Grid, Avatar, Chip,
  LinearProgress, Alert, Skeleton, Divider, Button,
} from '@mui/material';
import {
  Assignment as TaskIcon,
  School as TrainingIcon,
  Event as FollowupIcon,
  CheckCircle as DoneIcon,
  Schedule as PendingIcon,
  TrendingUp as ProgressIcon,
  CalendarToday as CalendarIcon,
  ArrowBack as BackIcon,
  HowToReg as OnboardIcon,
  Star as StarIcon,
  AccessTime as DurationIcon,
} from '@mui/icons-material';
import { onboardingService } from '../../services/onboardingService';
import { useAuth } from '../../contexts/AuthContext';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

const progressColor = (p) => p >= 80 ? '#2e7d32' : p >= 50 ? '#1976d2' : p >= 25 ? '#f57c00' : '#c62828';

const NavHeader = ({ title, icon, badge }) => (
  <Box sx={{ background: 'linear-gradient(135deg,#0f172a,#1e3a5f,#1e40af)',
    px: 2.5, py: 1.5, display: 'flex', alignItems: 'center', gap: 1.5 }}>
    <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.12)', width: 28, height: 28, borderRadius: 1.5 }}>
      {React.cloneElement(icon, { sx: { fontSize: 14, color: 'white' } })}
    </Avatar>
    <Typography sx={{ color: 'white', fontWeight: 700, fontSize: '0.88rem', flex: 1 }}>{title}</Typography>
    {badge !== undefined && (
      <Chip label={`${badge.done}/${badge.total}`} size="small"
        sx={{ bgcolor: 'rgba(255,255,255,0.15)', color: 'white', fontWeight: 700, height: 20, fontSize: '0.7rem' }} />
    )}
  </Box>
);

const TaskRow = ({ item, type }) => {
  const done = item.is_completed;
  const color = done ? '#2e7d32' : '#f57c00';

  return (
    <Box sx={{ px: 2.5, py: 1.75, display: 'flex', alignItems: 'flex-start', gap: 1.5,
      transition: 'background 0.15s', '&:hover': { bgcolor: '#f8fafc' } }}>
      <Avatar sx={{ bgcolor: done ? '#e8f5e9' : '#fff8e1', width: 30, height: 30,
        borderRadius: 1.5, flexShrink: 0, mt: 0.2 }}>
        {done
          ? <DoneIcon sx={{ color: '#2e7d32', fontSize: 16 }} />
          : <PendingIcon sx={{ color: '#f57c00', fontSize: 15 }} />
        }
      </Avatar>
      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Typography sx={{
          fontSize: '0.875rem', fontWeight: 600,
          color: done ? '#64748b' : '#1e293b',
          textDecoration: done ? 'line-through' : 'none',
        }}>
          {item.title || item.follow_up_type_display || item.follow_up_type}
        </Typography>
        {item.description && (
          <Typography sx={{ fontSize: '0.75rem', color: '#94a3b8', mt: 0.2, lineHeight: 1.5 }}>
            {item.description}
          </Typography>
        )}
        <Box sx={{ display: 'flex', gap: 1.5, mt: 0.4, flexWrap: 'wrap' }}>
          {item.due_date && !done && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <CalendarIcon sx={{ fontSize: 12, color: '#94a3b8' }} />
              <Typography variant="caption" color="text.secondary">
                Échéance : {format(new Date(item.due_date), 'dd MMM yyyy', { locale: fr })}
              </Typography>
            </Box>
          )}
          {item.scheduled_date && !done && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <CalendarIcon sx={{ fontSize: 12, color: '#94a3b8' }} />
              <Typography variant="caption" color="text.secondary">
                Prévu : {format(new Date(item.scheduled_date), 'dd MMM yyyy', { locale: fr })}
              </Typography>
            </Box>
          )}
          {item.duration_hours && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <DurationIcon sx={{ fontSize: 12, color: '#94a3b8' }} />
              <Typography variant="caption" color="text.secondary">{item.duration_hours}h</Typography>
            </Box>
          )}
          {done && item.completion_date && (
            <Typography variant="caption" sx={{ color: '#2e7d32', fontWeight: 600 }}>
              ✓ Terminé le {format(new Date(item.completion_date), 'dd MMM yyyy', { locale: fr })}
            </Typography>
          )}
          {done && item.conducted_date && (
            <Typography variant="caption" sx={{ color: '#2e7d32', fontWeight: 600 }}>
              ✓ Effectué le {format(new Date(item.conducted_date), 'dd MMM yyyy', { locale: fr })}
            </Typography>
          )}
          {item.score && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.4 }}>
              <StarIcon sx={{ fontSize: 12, color: '#ffc107' }} />
              <Typography variant="caption" sx={{ color: '#f57c00', fontWeight: 600 }}>
                {item.score}/100
              </Typography>
            </Box>
          )}
          {item.overall_rating && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.4 }}>
              <StarIcon sx={{ fontSize: 12, color: '#ffc107' }} />
              <Typography variant="caption" sx={{ color: '#f57c00', fontWeight: 600 }}>
                {item.overall_rating}/5
              </Typography>
            </Box>
          )}
        </Box>
      </Box>
      <Chip label={done ? 'Terminé' : 'En cours'}
        size="small" sx={{ flexShrink: 0,
          bgcolor: done ? '#e8f5e9' : '#fff8e1',
          color: done ? '#2e7d32' : '#f57c00',
          fontWeight: 700, fontSize: '0.65rem', height: 20,
          border: `1px solid ${done ? '#a5d6a7' : '#ffe082'}` }} />
    </Box>
  );
};

const MyOnboarding = () => {
  const { user } = useAuth();
  const navigate  = useNavigate();
  const [data,    setData]    = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    onboardingService.getMyOnboarding()
      .then(d => setData(d))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <Box sx={{ p: 3 }}>
      {[1,2,3].map(i => <Skeleton key={i} variant="rounded" height={80} sx={{ mb: 2, borderRadius: 3 }} />)}
    </Box>
  );

  if (!data?.has_plan) return (
    <Box sx={{ width: '100%' }}>
      <Card elevation={0} sx={{ borderRadius: 3, border: '1px solid #e8ecf0', mb: 3, overflow: 'hidden' }}>
        <Box sx={{ background: 'linear-gradient(135deg,#0f172a 0%,#1e3a5f 60%,#1e40af 100%)',
          px: 3, py: 2.5, display: 'flex', alignItems: 'center', gap: 2 }}>
          <Button startIcon={<BackIcon />} onClick={() => navigate('/dashboard')} size="small"
            sx={{ color: 'rgba(255,255,255,0.7)', textTransform: 'none', borderRadius: 2,
              '&:hover': { bgcolor: 'rgba(255,255,255,0.1)', color: 'white' } }}>
            Retour
          </Button>
          <Box sx={{ p: 1.25, borderRadius: 2, bgcolor: 'rgba(255,255,255,0.12)', display: 'inline-flex' }}>
            <OnboardIcon sx={{ fontSize: 22, color: 'white' }} />
          </Box>
          <Typography variant="h5" fontWeight={700} color="white">Mon Intégration</Typography>
        </Box>
      </Card>
      <Card elevation={0} sx={{ borderRadius: 3, border: '1px solid #e8ecf0' }}>
        <CardContent sx={{ textAlign: 'center', py: 7 }}>
          <OnboardIcon sx={{ fontSize: 52, color: '#cbd5e1', mb: 2 }} />
          <Typography variant="h6" fontWeight={600} color="text.secondary" gutterBottom>
            Aucun plan d'intégration
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 400, mx: 'auto' }}>
            Vous n'avez pas encore de plan d'intégration assigné. Contactez votre Responsable RH.
          </Typography>
        </CardContent>
      </Card>
    </Box>
  );

  const { employee, onboarding_plan, tasks = [], trainings = [], followups = [], stats } = data;
  const prog = stats?.overall_progress ?? 0;
  const pc = progressColor(prog);

  const planStatus = onboarding_plan?.status;
  const planStatusConfig = {
    in_progress: { label: 'En cours',  color: '#1976d2', bg: '#e3f2fd' },
    completed:   { label: 'Terminé',   color: '#2e7d32', bg: '#e8f5e9' },
    not_started: { label: 'Non démarré', color: '#f57c00', bg: '#fff8e1' },
  }[planStatus] || { label: planStatus, color: '#64748b', bg: '#f1f5f9' };

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
                <OnboardIcon sx={{ fontSize: 28, color: 'white' }} />
              </Box>
              <Box>
                <Typography variant="h5" fontWeight={700} color="white">Mon Intégration</Typography>
                <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.65)', mt: 0.3 }}>
                  Bienvenue, {employee?.name || user?.first_name} !
                </Typography>
              </Box>
            </Box>
            <Chip label={planStatusConfig.label} size="small"
              sx={{ bgcolor: 'rgba(255,255,255,0.15)', color: 'white', fontWeight: 700,
                border: '1px solid rgba(255,255,255,0.25)', fontSize: '0.78rem' }} />
          </Box>

          {/* Barre de progression dans le banner */}
          <Box sx={{ mt: 3, pt: 2.5, borderTop: '1px solid rgba(255,255,255,0.08)' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.75 }}>
              <Typography sx={{ color: 'rgba(255,255,255,0.75)', fontSize: '0.82rem', fontWeight: 600 }}>
                Progression globale
              </Typography>
              <Typography sx={{ color: 'white', fontSize: '0.9rem', fontWeight: 800 }}>{prog}%</Typography>
            </Box>
            <LinearProgress variant="determinate" value={prog}
              sx={{ height: 8, borderRadius: 4, bgcolor: 'rgba(255,255,255,0.15)',
                '& .MuiLinearProgress-bar': { bgcolor: prog >= 80 ? '#4ade80' : prog >= 50 ? '#60a5fa' : '#fbbf24', borderRadius: 4 } }} />
          </Box>
        </Box>
      </Card>

      {/* ── Stats cards ── */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        {[
          { label: 'Progression',       value: `${prog}%`, sub: 'globale',           color: pc,       icon: <ProgressIcon /> },
          { label: 'Tâches',            value: `${stats?.tasks?.completed ?? 0}/${stats?.tasks?.total ?? 0}`,
            sub: 'terminées', color: '#1976d2', icon: <TaskIcon /> },
          { label: 'Formations',        value: `${stats?.trainings?.completed ?? 0}/${stats?.trainings?.total ?? 0}`,
            sub: 'complétées', color: '#7b1fa2', icon: <TrainingIcon /> },
          { label: 'Suivis',            value: `${(followups || []).filter(f => f.is_completed).length}/${(followups || []).length}`,
            sub: 'effectués', color: '#0891b2', icon: <FollowupIcon /> },
        ].map((s, i) => (
          <Grid item xs={6} sm={3} key={i}>
            <Card elevation={0} sx={{ border: `1px solid ${s.color}20`, borderRadius: 3, height: '100%',
              transition: 'all 0.2s', '&:hover': { boxShadow: `0 4px 14px ${s.color}12` } }}>
              <CardContent sx={{ p: 2.5 }}>
                <Avatar sx={{ bgcolor: `${s.color}12`, width: 36, height: 36, mb: 1.5 }}>
                  {React.cloneElement(s.icon, { sx: { color: s.color, fontSize: 18 } })}
                </Avatar>
                <Typography variant="h4" fontWeight={800} sx={{ color: s.color, lineHeight: 1 }}>{s.value}</Typography>
                <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
                  {s.label} {s.sub}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* ── Infos du plan ── */}
      <Card elevation={0} sx={{ borderRadius: 3, border: '1px solid #e8ecf0', mb: 3, overflow: 'hidden' }}>
        <NavHeader title="Plan d'intégration" icon={<OnboardIcon />} />
        <CardContent sx={{ p: 0 }}>
          {[
            { label: 'Date de début', value: onboarding_plan?.start_date
                ? format(new Date(onboarding_plan.start_date), 'dd MMMM yyyy', { locale: fr }) : '—' },
            { label: 'Date prévue de fin', value: onboarding_plan?.expected_completion_date
                ? format(new Date(onboarding_plan.expected_completion_date), 'dd MMMM yyyy', { locale: fr }) : '—' },
            { label: 'Statut', value: planStatusConfig.label, isStatus: true },
          ].map((row, i, arr) => (
            <Box key={i} sx={{ display: 'flex', alignItems: 'center', px: 2.5, py: 1.5,
              borderBottom: i < arr.length - 1 ? '1px solid #f1f5f9' : 'none' }}>
              <Typography sx={{ fontSize: '0.78rem', color: '#64748b', minWidth: 160 }}>{row.label}</Typography>
              {row.isStatus ? (
                <Chip label={row.value} size="small"
                  sx={{ bgcolor: planStatusConfig.bg, color: planStatusConfig.color,
                    fontWeight: 700, fontSize: '0.72rem', height: 22, border: `1px solid ${planStatusConfig.color}25` }} />
              ) : (
                <Typography sx={{ fontSize: '0.875rem', fontWeight: 600, color: '#1e293b' }}>{row.value}</Typography>
              )}
            </Box>
          ))}
        </CardContent>
      </Card>

      {/* ── Tâches ── */}
      <Card elevation={0} sx={{ borderRadius: 3, border: '1px solid #e8ecf0', mb: 3, overflow: 'hidden' }}>
        <NavHeader title="Mes tâches" icon={<TaskIcon />}
          badge={{ done: tasks.filter(t => t.is_completed).length, total: tasks.length }} />
        {tasks.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 5 }}>
            <TaskIcon sx={{ fontSize: 36, color: '#cbd5e1', mb: 1 }} />
            <Typography variant="caption" color="text.secondary" display="block">Aucune tâche assignée</Typography>
          </Box>
        ) : tasks.map((t, i) => (
          <React.Fragment key={t.id}>
            <TaskRow item={t} type="task" />
            {i < tasks.length - 1 && <Divider />}
          </React.Fragment>
        ))}
      </Card>

      {/* ── Formations + Suivis ── */}
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Card elevation={0} sx={{ borderRadius: 3, border: '1px solid #e8ecf0', overflow: 'hidden', height: '100%' }}>
            <NavHeader title="Formations" icon={<TrainingIcon />}
              badge={{ done: trainings.filter(t => t.is_completed).length, total: trainings.length }} />
            {trainings.length === 0 ? (
              <Box sx={{ textAlign: 'center', py: 5 }}>
                <TrainingIcon sx={{ fontSize: 36, color: '#cbd5e1', mb: 1 }} />
                <Typography variant="caption" color="text.secondary" display="block">Aucune formation programmée</Typography>
              </Box>
            ) : trainings.map((t, i) => (
              <React.Fragment key={t.id}>
                <TaskRow item={t} type="training" />
                {i < trainings.length - 1 && <Divider />}
              </React.Fragment>
            ))}
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card elevation={0} sx={{ borderRadius: 3, border: '1px solid #e8ecf0', overflow: 'hidden', height: '100%' }}>
            <NavHeader title="Points de suivi" icon={<FollowupIcon />}
              badge={{ done: (followups || []).filter(f => f.is_completed).length, total: (followups || []).length }} />
            {!followups?.length ? (
              <Box sx={{ textAlign: 'center', py: 5 }}>
                <FollowupIcon sx={{ fontSize: 36, color: '#cbd5e1', mb: 1 }} />
                <Typography variant="caption" color="text.secondary" display="block">Aucun suivi programmé</Typography>
              </Box>
            ) : followups.map((f, i) => (
              <React.Fragment key={f.id}>
                <TaskRow item={f} type="followup" />
                {i < followups.length - 1 && <Divider />}
              </React.Fragment>
            ))}
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default MyOnboarding;
