import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box, Card, CardContent, Typography, Grid, Avatar, LinearProgress,
  Chip, Button, IconButton, Dialog, DialogContent, DialogActions,
  Divider, Skeleton, Tooltip,
} from '@mui/material';
import {
  PersonAdd as PersonAddIcon,
  CheckCircle as CheckIcon,
  Schedule as PendingIcon,
  Assignment as TaskIcon,
  School as TrainingIcon,
  Visibility as ViewIcon,
  ArrowBack as BackIcon,
  ArrowForward as ArrowIcon,
  HowToReg as OnboardIcon,
  People as PeopleIcon,
  Close as CloseIcon,
  TrendingUp as ProgressIcon,
} from '@mui/icons-material';
import api from '../../services/api';

const COLORS = ['#1976d2','#388e3c','#d32f2f','#7b1fa2','#f57c00','#0097a7','#c2185b','#5d4037'];
const avatarColor = (name = '') => COLORS[(name.charCodeAt(0) || 0) % COLORS.length];

const progressColor = (p) => p >= 80 ? '#2e7d32' : p >= 50 ? '#1976d2' : p > 0 ? '#f57c00' : '#c62828';

const STATUS_MAP = {
  completed:   { label: 'Terminé',       color: '#2e7d32', bg: '#e8f5e9' },
  in_progress: { label: 'En cours',      color: '#1976d2', bg: '#e3f2fd' },
  not_started: { label: 'Non démarré',   color: '#f57c00', bg: '#fff8e1' },
};

const NavHeader = ({ title, icon, count }) => (
  <Box sx={{ background: 'linear-gradient(135deg,#0f172a,#1e3a5f,#1e40af)',
    px: 2.5, py: 1.5, display: 'flex', alignItems: 'center', gap: 1.5 }}>
    <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.12)', width: 28, height: 28, borderRadius: 1.5 }}>
      {React.cloneElement(icon, { sx: { fontSize: 14, color: 'white' } })}
    </Avatar>
    <Typography sx={{ color: 'white', fontWeight: 700, fontSize: '0.88rem', flex: 1 }}>{title}</Typography>
    {count !== undefined && (
      <Chip label={count} size="small"
        sx={{ bgcolor: 'rgba(255,255,255,0.15)', color: 'white', height: 20, fontSize: '0.7rem' }} />
    )}
  </Box>
);

const OnboardingDashboard = () => {
  const navigate = useNavigate();
  const [newEmployees, setNewEmployees] = useState([]);
  const [stats,        setStats]        = useState({});
  const [loading,      setLoading]      = useState(true);
  const [checklist,    setChecklist]    = useState([]);
  const [selEmployee,  setSelEmployee]  = useState(null);
  const [checkDialog,  setCheckDialog]  = useState(false);

  useEffect(() => { load(); }, []);

  const load = async () => {
    setLoading(true);
    const [empRes, statsRes] = await Promise.allSettled([
      api.get('/onboarding/new-employees/'),
      api.get('/onboarding/stats/'),
    ]);
    if (empRes.status === 'fulfilled')   setNewEmployees(Array.isArray(empRes.value.data) ? empRes.value.data : []);
    if (statsRes.status === 'fulfilled') setStats(statsRes.value.data || {});
    setLoading(false);
  };

  const openChecklist = async (emp) => {
    setSelEmployee(emp);
    setChecklist([]);
    setCheckDialog(true);
    try {
      const res = await api.get(`/onboarding/employee/${emp.id}/checklist/`);
      setChecklist(Array.isArray(res.data) ? res.data : []);
    } catch (_) {}
  };

  const kpis = [
    { label: 'Nouveaux ce mois',   value: stats.total_new_employees    ?? 0, color: '#1976d2', icon: <PersonAddIcon />, sub: 'employés' },
    { label: 'En cours',           value: stats.employees_in_progress  ?? 0, color: '#f57c00', icon: <PendingIcon />,   sub: 'intégrations actives' },
    { label: 'Terminées',          value: stats.completed_onboarding   ?? 0, color: '#2e7d32', icon: <CheckIcon />,     sub: 'intégrations complètes' },
    { label: 'Progression moy.',   value: `${stats.avg_progress ?? 0}%`,     color: '#7b1fa2', icon: <ProgressIcon />,  sub: 'moyenne générale' },
  ];

  return (
    <Box sx={{ width: '100%' }}>

      {/* Banner */}
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
              <OnboardIcon sx={{ fontSize: 22, color: 'white' }} />
            </Box>
            <Box>
              <Typography variant="h5" fontWeight={700} color="white">Tableau de bord Intégration</Typography>
              <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.65)', mt: 0.3 }}>
                Suivi de l'intégration des nouveaux employés
              </Typography>
            </Box>
          </Box>
          <Box sx={{ display: 'flex', gap: 1.5 }}>
            <Button onClick={() => navigate('/onboarding/employees')} size="small"
              sx={{ color: 'rgba(255,255,255,0.8)', border: '1px solid rgba(255,255,255,0.25)',
                borderRadius: 2, textTransform: 'none', fontWeight: 600,
                '&:hover': { bgcolor: 'rgba(255,255,255,0.1)' } }}>
              <PeopleIcon sx={{ fontSize: 15, mr: 0.5 }} /> Tous les employés
            </Button>
            <Button startIcon={<PersonAddIcon />} onClick={() => navigate('/onboarding/add-employee')}
              sx={{ bgcolor: 'rgba(255,255,255,0.15)', color: 'white',
                border: '1px solid rgba(255,255,255,0.25)', borderRadius: 2,
                textTransform: 'none', fontWeight: 600,
                '&:hover': { bgcolor: 'rgba(255,255,255,0.25)' } }}>
              Ajouter employé
            </Button>
          </Box>
        </Box>
      </Card>

      {/* KPI Cards */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        {kpis.map((k, i) => (
          <Grid item xs={6} sm={3} key={i}>
            <Card elevation={0} sx={{ border: '1px solid', borderColor: `${k.color}20`,
              borderRadius: 3, transition: 'all 0.2s',
              '&:hover': { boxShadow: `0 4px 16px ${k.color}15`, borderColor: `${k.color}40` } }}>
              <CardContent sx={{ p: 2.5 }}>
                <Avatar sx={{ bgcolor: `${k.color}12`, width: 36, height: 36, mb: 1.5 }}>
                  {React.cloneElement(k.icon, { sx: { color: k.color, fontSize: 18 } })}
                </Avatar>
                {loading ? <Skeleton width={50} height={32} /> : (
                  <Typography variant="h4" fontWeight={800} sx={{ color: k.color, lineHeight: 1 }}>{k.value}</Typography>
                )}
                <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>{k.label}</Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Grid container spacing={3}>

        {/* Employés en intégration */}
        <Grid item xs={12} lg={8}>
          <Card elevation={0} sx={{ borderRadius: 3, border: '1px solid #e8ecf0', overflow: 'hidden' }}>
            <NavHeader title="Intégrations en cours" icon={<OnboardIcon />} count={newEmployees.length} />
            <CardContent sx={{ p: newEmployees.length === 0 ? 2.5 : 0 }}>
              {loading ? (
                <Box sx={{ p: 2 }}>{[1,2,3].map(i => <Skeleton key={i} height={80} sx={{ mb: 1, borderRadius: 2 }} />)}</Box>
              ) : newEmployees.length === 0 ? (
                <Box sx={{ textAlign: 'center', py: 6 }}>
                  <OnboardIcon sx={{ fontSize: 44, color: '#cbd5e1', mb: 1 }} />
                  <Typography variant="body2" color="text.secondary">Aucun employé en cours d'intégration</Typography>
                  <Button startIcon={<PersonAddIcon />} onClick={() => navigate('/onboarding/add-employee')}
                    sx={{ mt: 2, textTransform: 'none', fontWeight: 600 }}>
                    Démarrer une intégration
                  </Button>
                </Box>
              ) : newEmployees.map((emp, i) => {
                const name = `${emp.user_data?.first_name || ''} ${emp.user_data?.last_name || ''}`.trim();
                const prog = emp.onboarding_progress || 0;
                const sc = STATUS_MAP[emp.onboarding_status] || STATUS_MAP.not_started;
                return (
                  <React.Fragment key={emp.id}>
                    <Box sx={{ px: 2.5, py: 2, display: 'flex', alignItems: 'center', gap: 2,
                      transition: 'background 0.15s', '&:hover': { bgcolor: '#f8fafc' } }}>

                      <Avatar sx={{ bgcolor: avatarColor(name), width: 42, height: 42,
                        fontSize: '0.9rem', fontWeight: 700, flexShrink: 0 }}>
                        {name[0]?.toUpperCase() || '?'}
                      </Avatar>

                      <Box sx={{ flex: 1, minWidth: 0 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.3 }}>
                          <Typography sx={{ fontSize: '0.875rem', fontWeight: 700, color: '#1e293b' }}>{name}</Typography>
                          <Chip label={sc.label} size="small"
                            sx={{ bgcolor: sc.bg, color: sc.color, fontWeight: 700, fontSize: '0.65rem',
                              height: 18, border: `1px solid ${sc.color}25` }} />
                        </Box>
                        <Typography variant="caption" color="text.secondary">
                          {emp.poste || 'Poste non défini'} · {emp.matricule}
                        </Typography>

                        <Box sx={{ mt: 0.75 }}>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.4 }}>
                            <Typography sx={{ fontSize: '0.72rem', color: '#64748b' }}>Progression</Typography>
                            <Typography sx={{ fontSize: '0.72rem', fontWeight: 700, color: progressColor(prog) }}>
                              {prog}%
                            </Typography>
                          </Box>
                          <LinearProgress variant="determinate" value={prog}
                            sx={{ height: 5, borderRadius: 3, bgcolor: '#f1f5f9',
                              '& .MuiLinearProgress-bar': { bgcolor: progressColor(prog), borderRadius: 3 } }} />
                        </Box>
                      </Box>

                      <Box sx={{ display: 'flex', gap: 0.75, flexShrink: 0 }}>
                        <Tooltip title="Voir la checklist">
                          <IconButton size="small" onClick={() => openChecklist(emp)}
                            sx={{ color: '#1976d2', bgcolor: '#eff6ff', borderRadius: 1.5, width: 30, height: 30,
                              '&:hover': { bgcolor: '#dbeafe' } }}>
                            <TaskIcon sx={{ fontSize: 14 }} />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Voir le profil">
                          <IconButton size="small" onClick={() => navigate(`/onboarding/employee/${emp.id}`)}
                            sx={{ color: '#475569', bgcolor: '#f8fafc', borderRadius: 1.5, width: 30, height: 30,
                              '&:hover': { bgcolor: '#f1f5f9' } }}>
                            <ViewIcon sx={{ fontSize: 14 }} />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    </Box>
                    {i < newEmployees.length - 1 && <Divider />}
                  </React.Fragment>
                );
              })}
            </CardContent>
            {newEmployees.length > 0 && (
              <Box sx={{ px: 2.5, py: 1.5, borderTop: '1px solid #f1f5f9' }}>
                <Button size="small" endIcon={<ArrowIcon sx={{ fontSize: 14 }} />}
                  onClick={() => navigate('/onboarding/employees')}
                  sx={{ textTransform: 'none', fontWeight: 600, fontSize: '0.8rem', color: '#1976d2' }}>
                  Voir tous les employés
                </Button>
              </Box>
            )}
          </Card>
        </Grid>

        {/* Colonne droite */}
        <Grid item xs={12} lg={4}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>

            {/* Tâches prioritaires */}
            <Card elevation={0} sx={{ borderRadius: 3, border: '1px solid #e8ecf0', overflow: 'hidden' }}>
              <NavHeader title="Indicateurs clés" icon={<TaskIcon />} />
              <CardContent sx={{ p: 0 }}>
                {[
                  { label: 'Tâches en attente',     value: stats.pending_tasks     ?? 0, color: '#f57c00', icon: <TaskIcon />,     bg: '#fff8e1' },
                  { label: 'Formations à compléter', value: stats.pending_trainings ?? 0, color: '#1976d2', icon: <TrainingIcon />, bg: '#e3f2fd' },
                  { label: 'Suivis planifiés',       value: stats.pending_followups ?? 0, color: '#7b1fa2', icon: <PendingIcon />,  bg: '#f3e5f5' },
                ].map((item, i, arr) => (
                  <Box key={i} sx={{ px: 2.5, py: 1.75, display: 'flex', alignItems: 'center', gap: 1.5,
                    borderBottom: i < arr.length - 1 ? '1px solid #f1f5f9' : 'none' }}>
                    <Avatar sx={{ bgcolor: item.bg, width: 34, height: 34 }}>
                      {React.cloneElement(item.icon, { sx: { color: item.color, fontSize: 16 } })}
                    </Avatar>
                    <Box sx={{ flex: 1 }}>
                      <Typography sx={{ fontSize: '0.82rem', color: '#334155', fontWeight: 500 }}>{item.label}</Typography>
                    </Box>
                    <Typography sx={{ fontSize: '1.1rem', fontWeight: 800, color: item.value > 0 ? item.color : '#94a3b8' }}>
                      {item.value}
                    </Typography>
                  </Box>
                ))}
              </CardContent>
            </Card>

            {/* Accès rapide */}
            <Card elevation={0} sx={{ borderRadius: 3, border: '1px solid #e8ecf0', overflow: 'hidden' }}>
              <NavHeader title="Accès rapide" icon={<ArrowIcon />} />
              <CardContent sx={{ p: 1.5, display: 'flex', flexDirection: 'column', gap: 1 }}>
                {[
                  { label: 'Ajouter un employé',       path: '/onboarding/add-employee', color: '#1976d2', bg: '#eff6ff', icon: <PersonAddIcon /> },
                  { label: 'Liste des employés',        path: '/onboarding/employees',    color: '#7b1fa2', bg: '#fdf4ff', icon: <PeopleIcon /> },
                  { label: 'Gérer les tâches',          path: '/onboarding/tasks',        color: '#2e7d32', bg: '#f0fdf4', icon: <TaskIcon /> },
                ].map(link => (
                  <Box key={link.path} onClick={() => navigate(link.path)}
                    sx={{ display: 'flex', alignItems: 'center', gap: 1.5, p: 1.25, borderRadius: 2,
                      cursor: 'pointer', transition: 'all 0.15s',
                      border: '1px solid #f1f5f9', bgcolor: 'white',
                      '&:hover': { bgcolor: link.bg, borderColor: `${link.color}20` } }}>
                    <Avatar sx={{ bgcolor: link.bg, width: 30, height: 30 }}>
                      {React.cloneElement(link.icon, { sx: { color: link.color, fontSize: 15 } })}
                    </Avatar>
                    <Typography sx={{ fontSize: '0.82rem', fontWeight: 600, color: '#334155', flex: 1 }}>
                      {link.label}
                    </Typography>
                    <ArrowIcon sx={{ fontSize: 14, color: '#94a3b8' }} />
                  </Box>
                ))}
              </CardContent>
            </Card>

          </Box>
        </Grid>
      </Grid>

      {/* Dialog checklist */}
      <Dialog open={checkDialog} onClose={() => setCheckDialog(false)} maxWidth="sm" fullWidth
        PaperProps={{ sx: { borderRadius: 3, overflow: 'hidden' } }}>
        <Box sx={{ background: 'linear-gradient(135deg,#0f172a,#1e3a5f,#1e40af)', px: 3, py: 2,
          display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            {selEmployee && (
              <Avatar sx={{ bgcolor: avatarColor(`${selEmployee.user_data?.first_name}`),
                width: 34, height: 34, fontSize: '0.8rem', fontWeight: 700 }}>
                {selEmployee.user_data?.first_name?.[0]?.toUpperCase() || '?'}
              </Avatar>
            )}
            <Box>
              <Typography sx={{ color: 'white', fontWeight: 700 }}>
                Checklist d'intégration
              </Typography>
              <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.6)' }}>
                {selEmployee?.user_data?.first_name} {selEmployee?.user_data?.last_name}
              </Typography>
            </Box>
          </Box>
          <IconButton size="small" onClick={() => setCheckDialog(false)}
            sx={{ color: 'rgba(255,255,255,0.6)', '&:hover': { color: 'white' } }}>
            <CloseIcon fontSize="small" />
          </IconButton>
        </Box>

        <DialogContent sx={{ p: 2.5 }}>
          {checklist.length === 0 ? (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <TaskIcon sx={{ fontSize: 40, color: '#cbd5e1', mb: 1 }} />
              <Typography variant="body2" color="text.secondary">Aucune tâche dans la checklist</Typography>
            </Box>
          ) : (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.75 }}>
              {/* Progression globale */}
              {(() => {
                const done = checklist.filter(i => i.is_completed).length;
                const pct  = Math.round((done / checklist.length) * 100);
                return (
                  <Box sx={{ p: 1.5, bgcolor: '#f8fafc', borderRadius: 2, border: '1px solid #e8ecf0', mb: 1 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.75 }}>
                      <Typography sx={{ fontSize: '0.78rem', fontWeight: 600, color: '#475569' }}>
                        Progression — {done}/{checklist.length} tâches
                      </Typography>
                      <Typography sx={{ fontSize: '0.78rem', fontWeight: 700, color: progressColor(pct) }}>
                        {pct}%
                      </Typography>
                    </Box>
                    <LinearProgress variant="determinate" value={pct}
                      sx={{ height: 6, borderRadius: 3, bgcolor: '#e8ecf0',
                        '& .MuiLinearProgress-bar': { bgcolor: progressColor(pct), borderRadius: 3 } }} />
                  </Box>
                );
              })()}

              {checklist.map((item, i) => (
                <Box key={item.id} sx={{ display: 'flex', alignItems: 'center', gap: 1.5,
                  p: 1.25, borderRadius: 2, transition: 'background 0.1s',
                  bgcolor: item.is_completed ? '#f0fdf4' : 'white',
                  border: `1px solid ${item.is_completed ? '#a7f3d030' : '#f1f5f9'}` }}>
                  <Avatar sx={{ width: 26, height: 26,
                    bgcolor: item.is_completed ? '#2e7d3215' : '#f1f5f9' }}>
                    <CheckIcon sx={{ fontSize: 14, color: item.is_completed ? '#2e7d32' : '#cbd5e1' }} />
                  </Avatar>
                  <Typography sx={{ fontSize: '0.82rem', flex: 1,
                    fontWeight: item.is_completed ? 500 : 500,
                    color: item.is_completed ? '#64748b' : '#1e293b',
                    textDecoration: item.is_completed ? 'line-through' : 'none' }}>
                    {item.item_name || item.title || `Tâche ${i + 1}`}
                  </Typography>
                  {item.is_completed && (
                    <Chip label="Fait" size="small"
                      sx={{ bgcolor: '#e8f5e9', color: '#2e7d32', fontWeight: 700, fontSize: '0.65rem', height: 18 }} />
                  )}
                </Box>
              ))}
            </Box>
          )}
        </DialogContent>

        <DialogActions sx={{ px: 2.5, pb: 2.5, gap: 1 }}>
          <Button onClick={() => selEmployee && navigate(`/onboarding/employee/${selEmployee.id}`)}
            sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 600, color: '#1976d2' }}>
            Voir le profil complet
          </Button>
          <Button onClick={() => setCheckDialog(false)} variant="outlined"
            sx={{ borderRadius: 2, textTransform: 'none', color: '#64748b', borderColor: '#e2e8f0' }}>
            Fermer
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default OnboardingDashboard;
