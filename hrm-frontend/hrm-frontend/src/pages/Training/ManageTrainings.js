import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box, Card, CardContent, Typography, Button, Grid, Chip, Avatar,
  IconButton, Menu, MenuItem, TextField, InputAdornment,
  Table, TableHead, TableBody, TableRow, TableCell, TableContainer,
  Pagination, Skeleton, Tooltip, Divider, Snackbar, Alert,
} from '@mui/material';
import {
  School as SchoolIcon,
  Add as AddIcon,
  Search as SearchIcon,
  MoreVert as MoreVertIcon,
  CheckCircle as ApproveIcon,
  Cancel as RejectIcon,
  People as PeopleIcon,
  CalendarToday as CalendarIcon,
  ArrowBack as BackIcon,
  Schedule as PendingIcon,
  PlayCircle as ActiveIcon,
  Done as DoneIcon,
} from '@mui/icons-material';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { useAuth } from '../../contexts/AuthContext';
import { getTrainings, approveTraining, rejectTraining } from '../../services/hrService';

const PER_PAGE = 10;

const STATUS = {
  pending:  { label: 'En attente', color: '#f57c00', bg: '#fff8e1' },
  approved: { label: 'Approuvée',  color: '#2e7d32', bg: '#e8f5e9' },
  rejected: { label: 'Rejetée',    color: '#c62828', bg: '#ffebee' },
};

const colSx = {
  fontSize: '0.7rem', fontWeight: 700, color: '#475569',
  textTransform: 'uppercase', letterSpacing: '0.5px',
  bgcolor: '#f8fafc', borderBottom: '2px solid #e8ecf0', py: 1.25, px: 2,
};

const StatCard = ({ label, value, color, active, onClick, loading, icon }) => (
  <Card elevation={0} onClick={onClick}
    sx={{ border: `1px solid ${active ? color : `${color}20`}`, borderRadius: 3, height: '100%',
      cursor: onClick ? 'pointer' : 'default', transition: 'all 0.2s', bgcolor: active ? `${color}06` : 'white',
      '&:hover': onClick ? { boxShadow: `0 4px 16px ${color}15`, borderColor: `${color}45` } : {} }}>
    <CardContent sx={{ p: 2.5 }}>
      <Avatar sx={{ bgcolor: `${color}12`, width: 36, height: 36, mb: 1.5 }}>
        {React.cloneElement(icon, { sx: { color, fontSize: 18 } })}
      </Avatar>
      {loading ? <Skeleton width={40} height={30} /> : (
        <Typography variant="h4" fontWeight={800} sx={{ color, lineHeight: 1 }}>{value}</Typography>
      )}
      <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>{label}</Typography>
    </CardContent>
  </Card>
);

const ManageTrainings = () => {
  const navigate = useNavigate();
  const { hasAnyRole } = useAuth();
  const isManager  = hasAnyRole(['hr_manager', 'hr_director']);
  const isDirector = hasAnyRole(['hr_director']);

  const [trainings, setTrainings] = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [search,    setSearch]    = useState('');
  const [filter,    setFilter]    = useState('');
  const [page,      setPage]      = useState(1);
  const [anchorEl,  setAnchorEl]  = useState(null);
  const [selected,  setSelected]  = useState(null);
  const [snack,     setSnack]     = useState({ open: false, msg: '', severity: 'success' });

  useEffect(() => { load(); }, []);

  const load = async () => {
    setLoading(true);
    try {
      const res = await getTrainings();
      setTrainings(res.data.results || res.data);
    } catch (_) {}
    finally { setLoading(false); }
  };

  const handleApprove = async (id) => {
    try {
      await approveTraining(id);
      setSnack({ open: true, msg: 'Formation approuvée', severity: 'success' });
      load();
    } catch (_) { setSnack({ open: true, msg: 'Erreur lors de l\'approbation', severity: 'error' }); }
    setAnchorEl(null);
  };

  const handleReject = async (id) => {
    try {
      await rejectTraining(id);
      setSnack({ open: true, msg: 'Formation rejetée', severity: 'info' });
      load();
    } catch (_) { setSnack({ open: true, msg: 'Erreur lors du rejet', severity: 'error' }); }
    setAnchorEl(null);
  };

  const counts = {
    total:    trainings.length,
    active:   trainings.filter(t => t.is_active).length,
    pending:  trainings.filter(t => t.status === 'pending').length,
    approved: trainings.filter(t => t.status === 'approved').length,
  };

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return trainings.filter(t =>
      (!q || t.name?.toLowerCase().includes(q) || t.description?.toLowerCase().includes(q)) &&
      (!filter || t.status === filter || (filter === 'active' && t.is_active))
    );
  }, [trainings, search, filter]);

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
            <Button startIcon={<BackIcon />} onClick={() => navigate('/dashboard')} size="small"
              sx={{ color: 'rgba(255,255,255,0.7)', textTransform: 'none', borderRadius: 2,
                '&:hover': { bgcolor: 'rgba(255,255,255,0.1)', color: 'white' } }}>
              Retour
            </Button>
            <Box sx={{ p: 1.25, borderRadius: 2, bgcolor: 'rgba(255,255,255,0.12)', display: 'inline-flex' }}>
              <SchoolIcon sx={{ fontSize: 22, color: 'white' }} />
            </Box>
            <Box>
              <Typography variant="h5" fontWeight={700} color="white">Gestion des Formations</Typography>
              <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.65)', mt: 0.3 }}>
                {trainings.length} formation{trainings.length !== 1 ? 's' : ''} · {counts.active} en cours · {counts.pending} en attente
              </Typography>
            </Box>
          </Box>
          {isManager && (
            <Button startIcon={<AddIcon />} onClick={() => navigate('/trainings/create')}
              sx={{ bgcolor: 'rgba(255,255,255,0.15)', color: 'white', border: '1px solid rgba(255,255,255,0.25)',
                borderRadius: 2, textTransform: 'none', fontWeight: 600,
                '&:hover': { bgcolor: 'rgba(255,255,255,0.25)' } }}>
              Nouvelle formation
            </Button>
          )}
        </Box>
      </Card>

      {/* Stat cards */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={6} sm={3}>
          <StatCard label="Total" value={counts.total} color="#1976d2" icon={<SchoolIcon />}
            active={filter === ''} onClick={() => setF('')} loading={loading} />
        </Grid>
        <Grid item xs={6} sm={3}>
          <StatCard label="En cours" value={counts.active} color="#2e7d32" icon={<ActiveIcon />}
            active={filter === 'active'} onClick={() => setF('active')} loading={loading} />
        </Grid>
        <Grid item xs={6} sm={3}>
          <StatCard label="En attente" value={counts.pending} color="#f57c00" icon={<PendingIcon />}
            active={filter === 'pending'} onClick={() => setF('pending')} loading={loading} />
        </Grid>
        <Grid item xs={6} sm={3}>
          <StatCard label="Approuvées" value={counts.approved} color="#7b1fa2" icon={<ApproveIcon />}
            active={filter === 'approved'} onClick={() => setF('approved')} loading={loading} />
        </Grid>
      </Grid>

      {/* Search + filter pills */}
      <Card elevation={0} sx={{ border: '1px solid #e8ecf0', borderRadius: 3, mb: 3 }}>
        <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center' }}>
            <TextField placeholder="Rechercher par nom ou description…" value={search}
              onChange={e => { setSearch(e.target.value); setPage(1); }} size="small"
              sx={{ flex: 1, minWidth: 220, '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
              InputProps={{ startAdornment: <InputAdornment position="start"><SearchIcon sx={{ fontSize: 17, color: '#94a3b8' }} /></InputAdornment> }} />
            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
              {[
                { val: '',         label: 'Toutes' },
                { val: 'pending',  label: 'En attente', color: '#f57c00', bg: '#fff8e1' },
                { val: 'approved', label: 'Approuvées', color: '#2e7d32', bg: '#e8f5e9' },
                { val: 'rejected', label: 'Rejetées',   color: '#c62828', bg: '#ffebee' },
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
                <TableCell sx={colSx}>Formation</TableCell>
                <TableCell sx={colSx}>Période</TableCell>
                <TableCell sx={{ ...colSx, textAlign: 'center' }}>Participants</TableCell>
                <TableCell sx={colSx}>Statut</TableCell>
                <TableCell sx={colSx}>Créée par</TableCell>
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
                    <SchoolIcon sx={{ fontSize: 44, color: '#cbd5e1', display: 'block', mx: 'auto', mb: 1 }} />
                    <Typography variant="body2" color="text.secondary">
                      {search || filter ? 'Aucun résultat' : 'Aucune formation créée'}
                    </Typography>
                    {isManager && !search && !filter && (
                      <Button startIcon={<AddIcon />} onClick={() => navigate('/trainings/create')}
                        sx={{ mt: 1.5, textTransform: 'none', fontWeight: 600 }}>
                        Créer une formation
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ) : paged.map(t => {
                const sc = STATUS[t.status] || STATUS.pending;
                return (
                  <TableRow key={t.id} hover
                    sx={{ '&:last-child td': { border: 0 }, '& td': { borderBottom: '1px solid #f1f5f9' } }}>

                    {/* Formation */}
                    <TableCell sx={{ py: 1.5, px: 2 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                        <Avatar sx={{ bgcolor: t.is_active ? '#2e7d3215' : '#1976d215', width: 34, height: 34, borderRadius: 1.5 }}>
                          <SchoolIcon sx={{ color: t.is_active ? '#2e7d32' : '#1976d2', fontSize: 16 }} />
                        </Avatar>
                        <Box>
                          <Typography sx={{ fontSize: '0.875rem', fontWeight: 600, color: '#1e293b' }}>{t.name}</Typography>
                          {t.description && (
                            <Typography sx={{ fontSize: '0.72rem', color: '#94a3b8',
                              overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 240 }}>
                              {t.description}
                            </Typography>
                          )}
                        </Box>
                      </Box>
                    </TableCell>

                    {/* Période */}
                    <TableCell sx={{ py: 1.5, px: 2 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <CalendarIcon sx={{ fontSize: 13, color: '#94a3b8' }} />
                        <Typography sx={{ fontSize: '0.78rem', color: '#475569' }}>
                          {t.start_date ? format(new Date(t.start_date), 'dd MMM', { locale: fr }) : '—'}
                          {' → '}
                          {t.end_date ? format(new Date(t.end_date), 'dd MMM yyyy', { locale: fr }) : '—'}
                        </Typography>
                      </Box>
                      {t.duration_days && (
                        <Typography sx={{ fontSize: '0.7rem', color: '#94a3b8', mt: 0.3 }}>
                          {t.duration_days} jour{t.duration_days !== 1 ? 's' : ''}
                        </Typography>
                      )}
                    </TableCell>

                    {/* Participants */}
                    <TableCell sx={{ py: 1.5, px: 2, textAlign: 'center' }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0.5 }}>
                        <PeopleIcon sx={{ fontSize: 14, color: '#94a3b8' }} />
                        <Typography sx={{ fontSize: '0.875rem', fontWeight: 600, color: '#475569' }}>
                          {t.employees_count ?? t.employees?.length ?? 0}
                        </Typography>
                      </Box>
                    </TableCell>

                    {/* Statut */}
                    <TableCell sx={{ py: 1.5, px: 2 }}>
                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                        <Chip label={sc.label} size="small"
                          sx={{ bgcolor: sc.bg, color: sc.color, fontWeight: 700, fontSize: '0.7rem',
                            height: 22, border: `1px solid ${sc.color}30`, alignSelf: 'flex-start' }} />
                        {t.is_active && (
                          <Chip label="En cours" size="small"
                            sx={{ bgcolor: '#e8f5e9', color: '#2e7d32', fontWeight: 600, fontSize: '0.68rem',
                              height: 18, border: '1px solid #a5d6a7', alignSelf: 'flex-start' }} />
                        )}
                      </Box>
                    </TableCell>

                    {/* Créée par */}
                    <TableCell sx={{ py: 1.5, px: 2 }}>
                      <Typography sx={{ fontSize: '0.8rem', color: '#475569' }}>{t.created_by_name || '—'}</Typography>
                    </TableCell>

                    {/* Actions */}
                    <TableCell sx={{ py: 1.5, px: 2 }} onClick={e => e.stopPropagation()}>
                      <Box sx={{ display: 'flex', gap: 0.5, justifyContent: 'flex-end', alignItems: 'center' }}>
                        {isDirector && t.status === 'pending' && (
                          <>
                            <Tooltip title="Approuver">
                              <IconButton size="small" onClick={() => handleApprove(t.id)}
                                sx={{ color: '#2e7d32', bgcolor: '#e8f5e9', borderRadius: 1.5, width: 28, height: 28,
                                  '&:hover': { bgcolor: '#c8e6c9' } }}>
                                <ApproveIcon sx={{ fontSize: 14 }} />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Rejeter">
                              <IconButton size="small" onClick={() => handleReject(t.id)}
                                sx={{ color: '#c62828', bgcolor: '#ffebee', borderRadius: 1.5, width: 28, height: 28,
                                  '&:hover': { bgcolor: '#ffcdd2' } }}>
                                <RejectIcon sx={{ fontSize: 14 }} />
                              </IconButton>
                            </Tooltip>
                          </>
                        )}
                        <IconButton size="small"
                          onClick={e => { setAnchorEl(e.currentTarget); setSelected(t); }}
                          sx={{ color: '#475569', bgcolor: '#f8fafc', borderRadius: 1.5, width: 28, height: 28,
                            '&:hover': { bgcolor: '#f1f5f9' } }}>
                          <MoreVertIcon sx={{ fontSize: 14 }} />
                        </IconButton>
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

      {/* Menu contextuel */}
      <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={() => setAnchorEl(null)}
        PaperProps={{ elevation: 0, sx: { border: '1px solid #e8ecf0', borderRadius: 2, minWidth: 180 } }}>
        <MenuItem onClick={() => { setAnchorEl(null); }}
          sx={{ fontSize: '0.875rem', gap: 1.5 }}>
          <PeopleIcon sx={{ fontSize: 17, color: '#1976d2' }} /> Voir les participants
        </MenuItem>
        {isDirector && selected?.status === 'pending' && [
          <Divider key="div" />,
          <MenuItem key="approve" onClick={() => handleApprove(selected.id)}
            sx={{ fontSize: '0.875rem', gap: 1.5, color: '#2e7d32' }}>
            <ApproveIcon sx={{ fontSize: 17 }} /> Approuver
          </MenuItem>,
          <MenuItem key="reject" onClick={() => handleReject(selected.id)}
            sx={{ fontSize: '0.875rem', gap: 1.5, color: '#c62828' }}>
            <RejectIcon sx={{ fontSize: 17 }} /> Rejeter
          </MenuItem>,
        ]}
      </Menu>

      <Snackbar open={snack.open} autoHideDuration={3000}
        onClose={() => setSnack(p => ({ ...p, open: false }))}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}>
        <Alert severity={snack.severity} onClose={() => setSnack(p => ({ ...p, open: false }))}
          sx={{ borderRadius: 2, boxShadow: '0 4px 16px rgba(0,0,0,0.12)' }}>
          {snack.msg}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default ManageTrainings;
