import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box, Card, CardContent, Typography, Button, Grid, Avatar,
  LinearProgress, Chip, IconButton, TextField, InputAdornment,
  Table, TableHead, TableBody, TableRow, TableCell, TableContainer,
  Pagination, Skeleton, Tooltip,
} from '@mui/material';
import {
  PersonAdd as PersonAddIcon,
  Visibility as ViewIcon,
  Search as SearchIcon,
  ArrowBack as BackIcon,
  HowToReg as OnboardIcon,
  CheckCircle as DoneIcon,
  Schedule as InProgressIcon,
  RadioButtonUnchecked as NotStartedIcon,
  People as PeopleIcon,
} from '@mui/icons-material';
import { useNavigate as useNav } from 'react-router-dom';
import api from '../../services/api';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

const PER_PAGE = 10;

const COLORS = ['#1976d2','#388e3c','#d32f2f','#7b1fa2','#f57c00','#0097a7','#c2185b','#5d4037'];
const avatarColor = (name = '') => COLORS[(name.charCodeAt(0) || 0) % COLORS.length];
const progressColor = (p) => p >= 80 ? '#2e7d32' : p >= 50 ? '#1976d2' : p > 0 ? '#f57c00' : '#c62828';

const STATUS = {
  completed:   { label: 'Terminé',     color: '#2e7d32', bg: '#e8f5e9', icon: <DoneIcon /> },
  in_progress: { label: 'En cours',    color: '#1976d2', bg: '#e3f2fd', icon: <InProgressIcon /> },
  not_started: { label: 'Non démarré', color: '#f57c00', bg: '#fff8e1', icon: <NotStartedIcon /> },
};

const colSx = {
  fontSize: '0.7rem', fontWeight: 700, color: '#475569',
  textTransform: 'uppercase', letterSpacing: '0.5px',
  bgcolor: '#f8fafc', borderBottom: '2px solid #e8ecf0', py: 1.25, px: 2,
};

const StatCard = ({ label, value, color, active, onClick, icon, loading }) => (
  <Card elevation={0} onClick={onClick}
    sx={{ border: `1px solid ${active ? color : `${color}20`}`, borderRadius: 3, height: '100%',
      cursor: 'pointer', transition: 'all 0.2s', bgcolor: active ? `${color}06` : 'white',
      '&:hover': { boxShadow: `0 4px 16px ${color}15`, borderColor: `${color}45` } }}>
    <CardContent sx={{ p: 2 }}>
      <Avatar sx={{ bgcolor: `${color}12`, width: 30, height: 30, mb: 1 }}>
        {React.cloneElement(icon, { sx: { color, fontSize: 15 } })}
      </Avatar>
      {loading ? <Skeleton width={40} height={28} /> : (
        <Typography variant="h4" fontWeight={800} sx={{ color, lineHeight: 1 }}>{value}</Typography>
      )}
      <Typography variant="caption" color="text.secondary" sx={{ mt: 0.4, display: 'block' }}>{label}</Typography>
    </CardContent>
  </Card>
);

const EmployeesList = () => {
  const navigate  = useNavigate();
  const [employees, setEmployees] = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [search,    setSearch]    = useState('');
  const [filter,    setFilter]    = useState('');
  const [page,      setPage]      = useState(1);

  useEffect(() => {
    api.get('/onboarding/employees-list/')
      .then(r => setEmployees(Array.isArray(r.data) ? r.data : []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const counts = {
    total:       employees.length,
    not_started: employees.filter(e => e.onboarding_status === 'not_started').length,
    in_progress: employees.filter(e => e.onboarding_status === 'in_progress').length,
    completed:   employees.filter(e => e.onboarding_status === 'completed').length,
  };

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return employees.filter(e =>
      (!q || `${e.user_data?.first_name} ${e.user_data?.last_name} ${e.matricule} ${e.poste}`.toLowerCase().includes(q)) &&
      (!filter || e.onboarding_status === filter)
    );
  }, [employees, search, filter]);

  const pages = Math.ceil(filtered.length / PER_PAGE) || 1;
  const paged = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  const setF = (v) => { setFilter(p => p === v ? '' : v); setPage(1); };

  return (
    <Box sx={{ width: '100%' }}>

      {/* Banner */}
      <Card elevation={0} sx={{ borderRadius: 3, border: '1px solid #e8ecf0', mb: 3, overflow: 'hidden' }}>
        <Box sx={{ background: 'linear-gradient(135deg,#0f172a 0%,#1e3a5f 60%,#1e40af 100%)',
          px: 3, py: 2.5, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Button startIcon={<BackIcon />} onClick={() => navigate('/onboarding')} size="small"
              sx={{ color: 'rgba(255,255,255,0.7)', textTransform: 'none', borderRadius: 2,
                '&:hover': { bgcolor: 'rgba(255,255,255,0.1)', color: 'white' } }}>
              Retour
            </Button>
            <Box sx={{ p: 1.25, borderRadius: 2, bgcolor: 'rgba(255,255,255,0.12)', display: 'inline-flex' }}>
              <PeopleIcon sx={{ fontSize: 22, color: 'white' }} />
            </Box>
            <Box>
              <Typography variant="h5" fontWeight={700} color="white">Employés en intégration</Typography>
              <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.65)', mt: 0.3 }}>
                {employees.length} employé{employees.length !== 1 ? 's' : ''} dans le processus d'intégration
              </Typography>
            </Box>
          </Box>
          <Button startIcon={<PersonAddIcon />} onClick={() => navigate('/onboarding/add-employee')}
            sx={{ bgcolor: 'rgba(255,255,255,0.15)', color: 'white',
              border: '1px solid rgba(255,255,255,0.25)', borderRadius: 2,
              textTransform: 'none', fontWeight: 600,
              '&:hover': { bgcolor: 'rgba(255,255,255,0.25)' } }}>
            Ajouter employé
          </Button>
        </Box>
      </Card>

      {/* Stat cards */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={6} sm={3}>
          <StatCard label="Total" value={counts.total} color="#1976d2" icon={<PeopleIcon />}
            active={filter === ''} onClick={() => setF('')} loading={loading} />
        </Grid>
        <Grid item xs={6} sm={3}>
          <StatCard label="Non démarrés" value={counts.not_started} color="#f57c00" icon={<NotStartedIcon />}
            active={filter === 'not_started'} onClick={() => setF('not_started')} loading={loading} />
        </Grid>
        <Grid item xs={6} sm={3}>
          <StatCard label="En cours" value={counts.in_progress} color="#1565c0" icon={<InProgressIcon />}
            active={filter === 'in_progress'} onClick={() => setF('in_progress')} loading={loading} />
        </Grid>
        <Grid item xs={6} sm={3}>
          <StatCard label="Terminés" value={counts.completed} color="#2e7d32" icon={<DoneIcon />}
            active={filter === 'completed'} onClick={() => setF('completed')} loading={loading} />
        </Grid>
      </Grid>

      {/* Search + filter */}
      <Card elevation={0} sx={{ border: '1px solid #e8ecf0', borderRadius: 3, mb: 3 }}>
        <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center' }}>
            <TextField placeholder="Rechercher par nom, matricule, poste…" value={search}
              onChange={e => { setSearch(e.target.value); setPage(1); }} size="small"
              sx={{ flex: 1, minWidth: 220, '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
              InputProps={{ startAdornment: <InputAdornment position="start"><SearchIcon sx={{ fontSize: 17, color: '#94a3b8' }} /></InputAdornment> }} />
            <Box sx={{ display: 'flex', gap: 1 }}>
              {[
                { val: '',           label: 'Tous' },
                { val: 'not_started',label: 'Non démarré', color: '#f57c00', bg: '#fff8e1' },
                { val: 'in_progress',label: 'En cours',    color: '#1976d2', bg: '#e3f2fd' },
                { val: 'completed',  label: 'Terminé',     color: '#2e7d32', bg: '#e8f5e9' },
              ].map(f => {
                const active = filter === f.val;
                return (
                  <Box key={f.val} onClick={() => setF(f.val)}
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
            <Chip label={`${filtered.length} résultat${filtered.length !== 1 ? 's' : ''}`} size="small"
              sx={{ bgcolor: '#eff6ff', color: '#1976d2', fontWeight: 600, border: '1px solid #bfdbfe' }} />
          </Box>
        </CardContent>
      </Card>

      {/* Table */}
      <Card elevation={0} sx={{ border: '1px solid #e8ecf0', borderRadius: 3, overflow: 'hidden' }}>
        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell sx={colSx}>Employé</TableCell>
                <TableCell sx={colSx}>Poste</TableCell>
                <TableCell sx={{ ...colSx, minWidth: 160 }}>Progression</TableCell>
                <TableCell sx={colSx}>Statut</TableCell>
                <TableCell sx={colSx}>Date d'embauche</TableCell>
                <TableCell sx={{ ...colSx, textAlign: 'right' }}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i}>
                    {[1,2,3,4,5,6].map(j => (
                      <TableCell key={j} sx={{ py: 1.5, px: 2 }}>
                        <Skeleton height={20} sx={{ borderRadius: 1 }} />
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : paged.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} sx={{ textAlign: 'center', py: 7 }}>
                    <PeopleIcon sx={{ fontSize: 44, color: '#cbd5e1', display: 'block', mx: 'auto', mb: 1 }} />
                    <Typography variant="body2" color="text.secondary">
                      {search || filter ? 'Aucun résultat' : 'Aucun employé en intégration'}
                    </Typography>
                    {!search && !filter && (
                      <Button startIcon={<PersonAddIcon />} onClick={() => navigate('/onboarding/add-employee')}
                        sx={{ mt: 1.5, textTransform: 'none', fontWeight: 600 }}>
                        Démarrer une intégration
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ) : paged.map(emp => {
                const name = `${emp.user_data?.first_name || ''} ${emp.user_data?.last_name || ''}`.trim();
                const prog = emp.onboarding_progress || 0;
                const sc = STATUS[emp.onboarding_status] || STATUS.not_started;
                return (
                  <TableRow key={emp.id} hover
                    onClick={() => navigate(`/onboarding/employee/${emp.id}`)}
                    sx={{ cursor: 'pointer', '&:last-child td': { border: 0 },
                      '& td': { borderBottom: '1px solid #f1f5f9' } }}>

                    {/* Employé */}
                    <TableCell sx={{ py: 1.5, px: 2 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                        <Avatar
                          src={emp.photo ? `http://localhost:8000${emp.photo}` : undefined}
                          sx={{ bgcolor: avatarColor(name), width: 34, height: 34, fontSize: '0.8rem', fontWeight: 700, flexShrink: 0 }}>
                          {!emp.photo && (name[0]?.toUpperCase() || '?')}
                        </Avatar>
                        <Box>
                          <Typography sx={{ fontSize: '0.875rem', fontWeight: 600, color: '#1e293b' }}>{name}</Typography>
                          <Typography variant="caption" color="text.secondary">{emp.matricule}</Typography>
                        </Box>
                      </Box>
                    </TableCell>

                    {/* Poste */}
                    <TableCell sx={{ py: 1.5, px: 2 }}>
                      <Typography sx={{ fontSize: '0.82rem', color: '#475569' }}>{emp.poste || '—'}</Typography>
                    </TableCell>

                    {/* Progression */}
                    <TableCell sx={{ py: 1.5, px: 2 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                        <Box sx={{ flex: 1, minWidth: 80 }}>
                          <LinearProgress variant="determinate" value={prog}
                            sx={{ height: 6, borderRadius: 3, bgcolor: '#f1f5f9',
                              '& .MuiLinearProgress-bar': { bgcolor: progressColor(prog), borderRadius: 3 } }} />
                        </Box>
                        <Typography sx={{ fontSize: '0.75rem', fontWeight: 700, color: progressColor(prog), minWidth: 32 }}>
                          {prog}%
                        </Typography>
                      </Box>
                    </TableCell>

                    {/* Statut */}
                    <TableCell sx={{ py: 1.5, px: 2 }}>
                      <Chip label={sc.label} size="small"
                        sx={{ bgcolor: sc.bg, color: sc.color, fontWeight: 700, fontSize: '0.7rem',
                          height: 22, border: `1px solid ${sc.color}30` }} />
                    </TableCell>

                    {/* Date embauche */}
                    <TableCell sx={{ py: 1.5, px: 2 }}>
                      <Typography sx={{ fontSize: '0.8rem', color: '#64748b' }}>
                        {emp.date_embauche ? format(new Date(emp.date_embauche), 'dd MMM yyyy', { locale: fr }) : '—'}
                      </Typography>
                    </TableCell>

                    {/* Actions */}
                    <TableCell sx={{ py: 1.5, px: 2 }} onClick={e => e.stopPropagation()}>
                      <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                        <Tooltip title="Voir le profil">
                          <IconButton size="small" onClick={() => navigate(`/onboarding/employee/${emp.id}`)}
                            sx={{ color: '#1976d2', bgcolor: '#eff6ff', borderRadius: 1.5, width: 28, height: 28,
                              '&:hover': { bgcolor: '#dbeafe' } }}>
                            <ViewIcon sx={{ fontSize: 14 }} />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>

        {!loading && filtered.length > PER_PAGE && (
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            px: 2.5, py: 1.5, borderTop: '1px solid #f1f5f9' }}>
            <Typography sx={{ fontSize: '0.75rem', color: '#64748b' }}>
              {(page - 1) * PER_PAGE + 1}–{Math.min(page * PER_PAGE, filtered.length)} sur {filtered.length}
            </Typography>
            <Pagination count={pages} page={page} onChange={(_, v) => setPage(v)}
              size="small" shape="rounded"
              sx={{ '& .MuiPaginationItem-root': { fontSize: '0.75rem', minWidth: 28, height: 28 } }} />
          </Box>
        )}
      </Card>
    </Box>
  );
};

export default EmployeesList;
