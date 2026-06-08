import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box, Card, CardContent, Typography, Grid, Avatar, Chip,
  LinearProgress, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Alert, Skeleton, Divider, Button,
} from '@mui/material';
import {
  PersonOff as AbsentIcon,
  CalendarToday as CalendarIcon,
  TrendingUp as TrendingIcon,
  Group as PeopleIcon,
  Schedule as ScheduleIcon,
  School as TrainingIcon,
  BarChart as BarChartIcon,
  ArrowBack as BackIcon,
  Warning as WarnIcon,
  CheckCircle as OkIcon,
  Assignment as RequestIcon,
  Analytics as KpiIcon,
} from '@mui/icons-material';
import { getKpiData } from '../services/kpiService';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

/* ── Helpers ─────────────────────────────────────────────────── */
const absenceColor = (days) =>
  days >= 7 ? '#c62828' : days >= 5 ? '#f57c00' : days >= 2 ? '#1976d2' : '#2e7d32';

const rateColor = (rate) =>
  rate >= 10 ? '#c62828' : rate >= 5 ? '#f57c00' : '#2e7d32';

const COLORS = ['#1976d2','#388e3c','#d32f2f','#7b1fa2','#f57c00','#0097a7'];
const avatarColor = (name = '') => COLORS[(name.charCodeAt(0) || 0) % COLORS.length];

const colSx = {
  fontSize: '0.7rem', fontWeight: 700, color: '#475569',
  textTransform: 'uppercase', letterSpacing: '0.5px',
  bgcolor: '#f8fafc', borderBottom: '2px solid #e8ecf0', py: 1.25, px: 2,
};

/* ── Stat card ── */
const KpiCard = ({ title, value, subtitle, icon, color, progress, loading }) => (
  <Card elevation={0} sx={{ border: '1px solid', borderColor: `${color}20`, borderRadius: 3, height: '100%',
    transition: 'all 0.2s', '&:hover': { boxShadow: `0 4px 16px ${color}12` } }}>
    <CardContent sx={{ p: 2.5 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1.5 }}>
        <Box sx={{ flex: 1 }}>
          <Typography sx={{ fontSize: '0.78rem', color: '#64748b', fontWeight: 500, mb: 0.5 }}>{title}</Typography>
          {loading ? <Skeleton width={60} height={36} /> : (
            <Typography variant="h3" fontWeight={800} sx={{ color, lineHeight: 1 }}>{value}</Typography>
          )}
          {subtitle && <Typography variant="caption" color="text.secondary" sx={{ mt: 0.4, display: 'block' }}>{subtitle}</Typography>}
        </Box>
        <Avatar sx={{ bgcolor: `${color}12`, width: 44, height: 44 }}>
          {React.cloneElement(icon, { sx: { color, fontSize: 20 } })}
        </Avatar>
      </Box>
      {progress !== undefined && !loading && (
        <Box>
          <LinearProgress variant="determinate" value={Math.min(progress, 100)}
            sx={{ height: 5, borderRadius: 3, bgcolor: `${color}12`,
              '& .MuiLinearProgress-bar': { bgcolor: color, borderRadius: 3 } }} />
        </Box>
      )}
    </CardContent>
  </Card>
);

/* ── Section header ── */
const NavHeader = ({ title, icon }) => (
  <Box sx={{ background: 'linear-gradient(135deg,#0f172a,#1e3a5f,#1e40af)',
    px: 2.5, py: 1.5, display: 'flex', alignItems: 'center', gap: 1.5 }}>
    <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.12)', width: 28, height: 28, borderRadius: 1.5 }}>
      {React.cloneElement(icon, { sx: { fontSize: 14, color: 'white' } })}
    </Avatar>
    <Typography sx={{ color: 'white', fontWeight: 700, fontSize: '0.88rem' }}>{title}</Typography>
  </Box>
);

/* ── Main ── */
const KpiDashboard = () => {
  const navigate   = useNavigate();
  const [data,    setData]    = useState(null);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState('');

  useEffect(() => { load(); }, []);

  const load = async () => {
    setLoading(true);
    try {
      const res = await getKpiData();
      setData(res.data);
    } catch (e) {
      setError('Erreur lors du chargement des indicateurs KPI');
    } finally { setLoading(false); }
  };

  const today = format(new Date(), "EEEE d MMMM yyyy", { locale: fr });

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
              <KpiIcon sx={{ fontSize: 22, color: 'white' }} />
            </Box>
            <Box>
              <Typography variant="h5" fontWeight={700} color="white">KPIs & Analyses RH</Typography>
              <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.65)', mt: 0.3, textTransform: 'capitalize' }}>
                {today}
              </Typography>
            </Box>
          </Box>
          {data && (
            <Box sx={{ display: 'flex', gap: 2.5 }}>
              {[
                { label: 'Effectif',   value: data.total_employees,  color: '#60a5fa' },
                { label: 'Absents/j',  value: data.absent_today,     color: data.absent_today > 0 ? '#fca5a5' : '#86efac' },
                { label: 'Taux abs.', value: `${data.absence_rate}%`, color: rateColor(data.absence_rate) === '#c62828' ? '#fca5a5' : '#fbbf24' },
              ].map(s => (
                <Box key={s.label} sx={{ textAlign: 'center' }}>
                  <Typography sx={{ fontSize: '1.3rem', fontWeight: 800, color: s.color, lineHeight: 1 }}>{s.value}</Typography>
                  <Typography sx={{ fontSize: '0.68rem', color: 'rgba(255,255,255,0.5)', mt: 0.2 }}>{s.label}</Typography>
                </Box>
              ))}
            </Box>
          )}
        </Box>
      </Card>

      {error && <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>{error}</Alert>}

      {/* ── Absences KPIs ── */}
      <Box sx={{ mb: 1.5 }}>
        <Typography sx={{ fontSize: '0.72rem', fontWeight: 700, color: '#94a3b8',
          textTransform: 'uppercase', letterSpacing: '1px', mb: 1.5 }}>
          Indicateurs d'Absence
        </Typography>
      </Box>
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={6} sm={4} md>
          <KpiCard title="Absents aujourd'hui" value={data?.absent_today ?? 0}
            subtitle="Employés absents" icon={<AbsentIcon />}
            color={data?.absent_today > 0 ? '#c62828' : '#2e7d32'} loading={loading} />
        </Grid>
        <Grid item xs={6} sm={4} md>
          <KpiCard title="Absences ce mois" value={data?.total_absences ?? 0}
            subtitle="Total ce mois" icon={<CalendarIcon />} color="#f57c00" loading={loading} />
        </Grid>
        <Grid item xs={6} sm={4} md>
          <KpiCard title="Taux d'absence" value={`${data?.absence_rate ?? 0}%`}
            subtitle="Mensuel" icon={<TrendingIcon />}
            color={rateColor(data?.absence_rate ?? 0)}
            progress={data?.absence_rate ?? 0} loading={loading} />
        </Grid>
        <Grid item xs={6} sm={4} md>
          <KpiCard title="Moy. jours/employé" value={`${data?.avg_absence_days ?? 0}j`}
            subtitle="Ce mois" icon={<ScheduleIcon />}
            color="#1976d2" loading={loading} />
        </Grid>
        <Grid item xs={6} sm={4} md>
          <KpiCard title="Effectif total" value={data?.total_employees ?? 0}
            subtitle="Employés actifs" icon={<PeopleIcon />} color="#0891b2" loading={loading} />
        </Grid>
        <Grid item xs={6} sm={4} md>
          <KpiCard title="Demandes en attente" value={data?.pending_requests ?? 0}
            subtitle="À traiter" icon={<RequestIcon />}
            color={data?.pending_requests > 0 ? '#f57c00' : '#64748b'} loading={loading} />
        </Grid>
      </Grid>

      {/* ── Formations KPIs ── */}
      <Box sx={{ mb: 1.5, mt: 1 }}>
        <Typography sx={{ fontSize: '0.72rem', fontWeight: 700, color: '#94a3b8',
          textTransform: 'uppercase', letterSpacing: '1px', mb: 1.5 }}>
          Indicateurs de Formation
        </Typography>
      </Box>
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={6} sm={6}>
          <KpiCard title="Formations totales" value={data?.training_stats?.total_trainings ?? 0}
            subtitle="Toutes formations" icon={<TrainingIcon />} color="#7b1fa2" loading={loading} />
        </Grid>
        <Grid item xs={6} sm={6}>
          <KpiCard title="Taux de participation" value={`${data?.training_stats?.participation_rate ?? 0}%`}
            subtitle="Employés formés" icon={<BarChartIcon />} color="#2e7d32"
            progress={data?.training_stats?.participation_rate ?? 0} loading={loading} />
        </Grid>
      </Grid>

      <Grid container spacing={3}>

        {/* ── Alertes seuil dépassé ── */}
        {(!loading && data?.employees_over_threshold?.length > 0) && (
          <Grid item xs={12}>
            <Card elevation={0} sx={{ borderRadius: 3, border: '1px solid #ffcdd2',
              borderLeft: '4px solid #c62828', overflow: 'hidden' }}>
              <Box sx={{ background: 'linear-gradient(135deg,#7f0000,#c62828)',
                px: 2.5, py: 1.5, display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.15)', width: 28, height: 28, borderRadius: 1.5 }}>
                  <WarnIcon sx={{ fontSize: 14, color: 'white' }} />
                </Avatar>
                <Typography sx={{ color: 'white', fontWeight: 700, fontSize: '0.88rem', flex: 1 }}>
                  Alertes — Seuil d'absence dépassé
                </Typography>
                <Chip label={`${data.employees_over_threshold.length} employé(s)`} size="small"
                  sx={{ bgcolor: 'rgba(255,255,255,0.15)', color: 'white', fontWeight: 700, height: 20, fontSize: '0.7rem' }} />
              </Box>
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell sx={colSx}>Employé</TableCell>
                      <TableCell sx={colSx}>Matricule</TableCell>
                      <TableCell sx={{ ...colSx, textAlign: 'right' }}>Jours d'absence</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {data.employees_over_threshold.map((item, i) => {
                      const ac = absenceColor(item.absence_days);
                      return (
                        <TableRow key={i} hover sx={{ '&:last-child td': { border: 0 },
                          '& td': { borderBottom: '1px solid #f1f5f9' } }}>
                          <TableCell sx={{ py: 1.25, px: 2 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25 }}>
                              <Avatar sx={{ bgcolor: avatarColor(item.name || ''), width: 28, height: 28,
                                fontSize: '0.68rem', fontWeight: 700 }}>
                                {item.name?.[0]?.toUpperCase() || '?'}
                              </Avatar>
                              <Typography sx={{ fontSize: '0.82rem', fontWeight: 600, color: '#1e293b' }}>
                                {item.name || '—'}
                              </Typography>
                            </Box>
                          </TableCell>
                          <TableCell sx={{ py: 1.25, px: 2 }}>
                            <Typography sx={{ fontSize: '0.78rem', color: '#64748b' }}>{item.matricule || '—'}</Typography>
                          </TableCell>
                          <TableCell sx={{ py: 1.25, px: 2, textAlign: 'right' }}>
                            <Chip label={`${item.absence_days} jours`} size="small"
                              sx={{ bgcolor: `${ac}12`, color: ac, fontWeight: 700,
                                border: `1px solid ${ac}30`, fontSize: '0.72rem', height: 22 }} />
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </TableContainer>
            </Card>
          </Grid>
        )}

        {/* ── Absences par employé ── */}
        <Grid item xs={12} md={6}>
          <Card elevation={0} sx={{ borderRadius: 3, border: '1px solid #e8ecf0', overflow: 'hidden', height: '100%' }}>
            <NavHeader title="Absences par employé" icon={<AbsentIcon />} />
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell sx={colSx}>Employé</TableCell>
                    <TableCell sx={{ ...colSx, textAlign: 'center' }}>Jours</TableCell>
                    <TableCell sx={colSx}>Niveau</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {loading ? (
                    Array.from({ length: 5 }).map((_, i) => (
                      <TableRow key={i}>
                        {[1,2,3].map(j => (
                          <TableCell key={j} sx={{ py: 1.25, px: 2 }}>
                            <Skeleton height={20} sx={{ borderRadius: 1 }} />
                          </TableCell>
                        ))}
                      </TableRow>
                    ))
                  ) : !data?.chart_data?.length ? (
                    <TableRow>
                      <TableCell colSpan={3} sx={{ textAlign: 'center', py: 5 }}>
                        <OkIcon sx={{ fontSize: 36, color: '#2e7d32', opacity: 0.5, display: 'block', mx: 'auto', mb: 0.75 }} />
                        <Typography variant="caption" color="text.secondary">
                          Aucune absence enregistrée
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ) : data.chart_data.map((item, i) => {
                    const ac = absenceColor(item.days || 0);
                    return (
                      <TableRow key={i} hover sx={{ '&:last-child td': { border: 0 },
                        '& td': { borderBottom: '1px solid #f1f5f9' } }}>
                        <TableCell sx={{ py: 1.25, px: 2 }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25 }}>
                            <Avatar sx={{ bgcolor: avatarColor(item.name || ''), width: 26, height: 26,
                              fontSize: '0.62rem', fontWeight: 700, flexShrink: 0 }}>
                              {item.name?.[0]?.toUpperCase() || '?'}
                            </Avatar>
                            <Typography sx={{ fontSize: '0.8rem', fontWeight: 500, color: '#1e293b' }} noWrap>
                              {item.name || '—'}
                            </Typography>
                          </Box>
                        </TableCell>
                        <TableCell sx={{ py: 1.25, px: 2, textAlign: 'center' }}>
                          <Typography sx={{ fontSize: '0.875rem', fontWeight: 700, color: ac }}>
                            {item.days ?? 0}
                          </Typography>
                        </TableCell>
                        <TableCell sx={{ py: 1.25, px: 2 }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Box sx={{ flex: 1, maxWidth: 80 }}>
                              <LinearProgress variant="determinate"
                                value={Math.min((item.days / 15) * 100, 100)}
                                sx={{ height: 5, borderRadius: 3, bgcolor: `${ac}12`,
                                  '& .MuiLinearProgress-bar': { bgcolor: ac, borderRadius: 3 } }} />
                            </Box>
                            <Typography sx={{ fontSize: '0.68rem', color: ac, fontWeight: 700, minWidth: 40 }}>
                              {item.days >= 7 ? 'Élevé' : item.days >= 3 ? 'Moyen' : 'Faible'}
                            </Typography>
                          </Box>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </TableContainer>
          </Card>
        </Grid>

        {/* ── Formations par employé ── */}
        <Grid item xs={12} md={6}>
          <Card elevation={0} sx={{ borderRadius: 3, border: '1px solid #e8ecf0', overflow: 'hidden', height: '100%' }}>
            <NavHeader title="Formations par employé" icon={<TrainingIcon />} />
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell sx={colSx}>Employé</TableCell>
                    <TableCell sx={colSx}>Service</TableCell>
                    <TableCell sx={{ ...colSx, textAlign: 'center' }}>Formations</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {loading ? (
                    Array.from({ length: 5 }).map((_, i) => (
                      <TableRow key={i}>
                        {[1,2,3].map(j => (
                          <TableCell key={j} sx={{ py: 1.25, px: 2 }}>
                            <Skeleton height={20} sx={{ borderRadius: 1 }} />
                          </TableCell>
                        ))}
                      </TableRow>
                    ))
                  ) : !data?.training_stats?.employees_training_data?.length ? (
                    <TableRow>
                      <TableCell colSpan={3} sx={{ textAlign: 'center', py: 5 }}>
                        <TrainingIcon sx={{ fontSize: 36, color: '#cbd5e1', display: 'block', mx: 'auto', mb: 0.75 }} />
                        <Typography variant="caption" color="text.secondary">
                          Aucune donnée de formation
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ) : data.training_stats.employees_training_data.map((item, i) => {
                    const count = item.training_count || 0;
                    const tc = count > 0 ? '#2e7d32' : '#94a3b8';
                    const empName = item.employee?.user?.first_name && item.employee?.user?.last_name
                      ? `${item.employee.user.first_name} ${item.employee.user.last_name}`
                      : item.employee?.matricule || 'N/A';
                    return (
                      <TableRow key={i} hover sx={{ '&:last-child td': { border: 0 },
                        '& td': { borderBottom: '1px solid #f1f5f9' } }}>
                        <TableCell sx={{ py: 1.25, px: 2 }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25 }}>
                            <Avatar sx={{ bgcolor: avatarColor(empName), width: 26, height: 26,
                              fontSize: '0.62rem', fontWeight: 700, flexShrink: 0 }}>
                              {empName[0]?.toUpperCase() || '?'}
                            </Avatar>
                            <Typography sx={{ fontSize: '0.8rem', fontWeight: 500, color: '#1e293b' }} noWrap>
                              {empName}
                            </Typography>
                          </Box>
                        </TableCell>
                        <TableCell sx={{ py: 1.25, px: 2 }}>
                          <Typography sx={{ fontSize: '0.78rem', color: '#64748b' }}>
                            {item.employee?.service || '—'}
                          </Typography>
                        </TableCell>
                        <TableCell sx={{ py: 1.25, px: 2, textAlign: 'center' }}>
                          <Chip label={count} size="small"
                            sx={{ bgcolor: count > 0 ? '#e8f5e9' : '#f5f5f5',
                              color: tc, fontWeight: 700, fontSize: '0.72rem',
                              border: `1px solid ${tc}30`, height: 22 }} />
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </TableContainer>
          </Card>
        </Grid>

      </Grid>
    </Box>
  );
};

export default KpiDashboard;
