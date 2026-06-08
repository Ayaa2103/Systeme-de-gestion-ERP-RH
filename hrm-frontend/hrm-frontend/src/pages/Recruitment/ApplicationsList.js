import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box, Card, CardContent, Typography, Button, Grid, Chip, Avatar,
  IconButton, Menu, MenuItem, TextField, InputAdornment,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Pagination, Skeleton, Tooltip, Divider, Snackbar, Alert,
} from '@mui/material';
import {
  People as PeopleIcon,
  Search as SearchIcon,
  MoreVert as MoreVertIcon,
  Visibility as ViewIcon,
  CheckCircle as AcceptIcon,
  Cancel as RejectIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  Schedule as InterviewIcon,
  ArrowBack as BackIcon,
  HowToReg as ReviewIcon,
} from '@mui/icons-material';
import { getApplications, updateApplicationStatus } from '../../services/hrService';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

const PER_PAGE = 12;

const STATUS = {
  pending:   { label: 'En attente', color: '#f57c00', bg: '#fff8e1' },
  reviewed:  { label: 'Examiné',    color: '#0288d1', bg: '#e1f5fe' },
  interview: { label: 'Entretien',  color: '#7b1fa2', bg: '#f3e5f5' },
  accepted:  { label: 'Accepté',    color: '#2e7d32', bg: '#e8f5e9' },
  rejected:  { label: 'Rejeté',     color: '#c62828', bg: '#ffebee' },
};

const COLORS = ['#1976d2','#388e3c','#d32f2f','#7b1fa2','#f57c00','#0097a7','#c2185b','#5d4037'];
const avatarColor = (name = '') => COLORS[(name.charCodeAt(0) || 0) % COLORS.length];

const colSx = {
  fontSize: '0.7rem', fontWeight: 700, color: '#475569',
  textTransform: 'uppercase', letterSpacing: '0.5px',
  bgcolor: '#f8fafc', borderBottom: '2px solid #e8ecf0',
  py: 1.25, px: 2,
};

const StatCard = ({ label, value, color, active, onClick, loading }) => (
  <Card elevation={0} onClick={onClick}
    sx={{ border: `1px solid ${active ? color : `${color}20`}`, borderRadius: 3, height: '100%',
      cursor: 'pointer', transition: 'all 0.2s', bgcolor: active ? `${color}06` : 'white',
      '&:hover': { boxShadow: `0 4px 16px ${color}15`, borderColor: `${color}45` } }}>
    <CardContent sx={{ p: 2 }}>
      <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: color, mb: 1 }} />
      {loading ? <Skeleton width={40} height={30} /> : (
        <Typography variant="h4" fontWeight={800} sx={{ color, lineHeight: 1 }}>{value}</Typography>
      )}
      <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>{label}</Typography>
    </CardContent>
  </Card>
);

const ApplicationsList = () => {
  const navigate = useNavigate();

  const [applications,  setApplications]  = useState([]);
  const [loading,       setLoading]       = useState(true);
  const [searchTerm,    setSearchTerm]    = useState('');
  const [statusFilter,  setStatusFilter]  = useState('');
  const [page,          setPage]          = useState(1);
  const [anchorEl,      setAnchorEl]      = useState(null);
  const [selected,      setSelected]      = useState(null);
  const [snack,         setSnack]         = useState({ open: false, msg: '', severity: 'success' });

  useEffect(() => { load(); }, []);

  const load = async () => {
    setLoading(true);
    try {
      const res = await getApplications();
      setApplications(res.data.results || res.data);
    } catch (_) {}
    finally { setLoading(false); }
  };

  const handleStatus = async (id, status) => {
    try {
      await updateApplicationStatus(id, { status });
      setSnack({ open: true, msg: `Statut mis à jour : ${STATUS[status]?.label}`, severity: 'success' });
      load();
    } catch (_) {
      setSnack({ open: true, msg: 'Erreur lors de la mise à jour', severity: 'error' });
    }
    setAnchorEl(null);
  };

  const filtered = useMemo(() => {
    const q = searchTerm.toLowerCase();
    return applications.filter(a =>
      (!q || `${a.first_name} ${a.last_name} ${a.job_offer_title}`.toLowerCase().includes(q)) &&
      (!statusFilter || a.status === statusFilter)
    );
  }, [applications, searchTerm, statusFilter]);

  const pages = Math.ceil(filtered.length / PER_PAGE) || 1;
  const paged = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  const setFilter = (val) => { setStatusFilter(p => p === val ? '' : val); setPage(1); };
  const setSearch = (v)   => { setSearchTerm(v); setPage(1); };

  const counts = {
    total:     applications.length,
    pending:   applications.filter(a => a.status === 'pending').length,
    interview: applications.filter(a => a.status === 'interview').length,
    accepted:  applications.filter(a => a.status === 'accepted').length,
    rejected:  applications.filter(a => a.status === 'rejected').length,
  };

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
              <PeopleIcon sx={{ fontSize: 22, color: 'white' }} />
            </Box>
            <Box>
              <Typography variant="h5" fontWeight={700} color="white">Candidatures</Typography>
              <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.65)', mt: 0.3 }}>
                {applications.length} candidature{applications.length !== 1 ? 's' : ''} reçues
              </Typography>
            </Box>
          </Box>

          {/* Mini stats in banner */}
          <Box sx={{ display: 'flex', gap: 2.5, flexWrap: 'wrap' }}>
            {[
              { label: 'En attente', value: counts.pending,   color: '#fbbf24' },
              { label: 'Entretiens', value: counts.interview, color: '#a78bfa' },
              { label: 'Acceptées',  value: counts.accepted,  color: '#34d399' },
            ].map(s => (
              <Box key={s.label} sx={{ textAlign: 'center' }}>
                <Typography sx={{ fontSize: '1.3rem', fontWeight: 800, color: s.color, lineHeight: 1 }}>{s.value}</Typography>
                <Typography sx={{ fontSize: '0.68rem', color: 'rgba(255,255,255,0.5)', mt: 0.2 }}>{s.label}</Typography>
              </Box>
            ))}
          </Box>
        </Box>
      </Card>

      {/* Stat cards cliquables */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        {[
          { label: 'Total',      value: counts.total,     color: '#1976d2', key: '' },
          { label: 'En attente', value: counts.pending,   color: '#f57c00', key: 'pending' },
          { label: 'Entretiens', value: counts.interview, color: '#7b1fa2', key: 'interview' },
          { label: 'Acceptées',  value: counts.accepted,  color: '#2e7d32', key: 'accepted' },
          { label: 'Rejetées',   value: counts.rejected,  color: '#c62828', key: 'rejected' },
        ].map(s => (
          <Grid item xs={6} sm={4} md key={s.key}>
            <StatCard label={s.label} value={s.value} color={s.color}
              active={statusFilter === s.key} onClick={() => setFilter(s.key)} loading={loading} />
          </Grid>
        ))}
      </Grid>

      {/* Search + filter pills */}
      <Card elevation={0} sx={{ border: '1px solid #e8ecf0', borderRadius: 3, mb: 3 }}>
        <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center' }}>
            <TextField placeholder="Rechercher par nom ou poste…" value={searchTerm}
              onChange={e => setSearch(e.target.value)} size="small"
              sx={{ flex: 1, minWidth: 220, '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
              InputProps={{ startAdornment: <InputAdornment position="start"><SearchIcon sx={{ fontSize: 17, color: '#94a3b8' }} /></InputAdornment> }} />

            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
              {[{ val: '', label: 'Tous' }, ...Object.entries(STATUS).map(([k, v]) => ({ val: k, label: v.label }))].map(f => {
                const active = statusFilter === f.val;
                const sc = f.val ? STATUS[f.val] : null;
                return (
                  <Box key={f.val} onClick={() => setFilter(f.val)}
                    sx={{ px: 1.5, py: 0.4, borderRadius: 50, cursor: 'pointer', fontSize: '0.78rem',
                      fontWeight: active ? 700 : 500, userSelect: 'none', transition: 'all 0.15s',
                      border: `1px solid ${active ? (sc?.color || '#1976d2') : '#e8ecf0'}`,
                      bgcolor: active ? (sc?.bg || '#eff6ff') : 'white',
                      color: active ? (sc?.color || '#1976d2') : '#475569',
                      '&:hover': { borderColor: sc?.color || '#1976d2' } }}>
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
                <TableCell sx={colSx}>Candidat</TableCell>
                <TableCell sx={colSx}>Offre</TableCell>
                <TableCell sx={colSx}>Contact</TableCell>
                <TableCell sx={colSx}>Statut</TableCell>
                <TableCell sx={colSx}>Date</TableCell>
                <TableCell sx={{ ...colSx, textAlign: 'right' }}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                Array.from({ length: 6 }).map((_, i) => (
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
                      {searchTerm || statusFilter ? 'Aucun résultat pour ces critères' : 'Aucune candidature reçue'}
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : paged.map((app, i) => {
                const sc  = STATUS[app.status] || STATUS.pending;
                const name = `${app.first_name || ''} ${app.last_name || ''}`.trim() || '—';
                return (
                  <TableRow key={app.id} hover
                    onClick={() => navigate(`/recruitment/applications/${app.id}`)}
                    sx={{ cursor: 'pointer', '&:last-child td': { border: 0 },
                      '& td': { borderBottom: '1px solid #f1f5f9' } }}>

                    {/* Candidat */}
                    <TableCell sx={{ py: 1.5, px: 2 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                        <Avatar sx={{ bgcolor: avatarColor(name), width: 34, height: 34, fontSize: '0.8rem', fontWeight: 700, flexShrink: 0 }}>
                          {name[0]?.toUpperCase() || '?'}
                        </Avatar>
                        <Box>
                          <Typography sx={{ fontSize: '0.875rem', fontWeight: 600, color: '#1e293b' }}>{name}</Typography>
                          {app.source && (
                            <Typography variant="caption" color="text.secondary">{app.source}</Typography>
                          )}
                        </Box>
                      </Box>
                    </TableCell>

                    {/* Offre */}
                    <TableCell sx={{ py: 1.5, px: 2 }}>
                      <Typography sx={{ fontSize: '0.82rem', fontWeight: 500, color: '#334155' }} noWrap>
                        {app.job_offer_title || '—'}
                      </Typography>
                    </TableCell>

                    {/* Contact */}
                    <TableCell sx={{ py: 1.5, px: 2 }}>
                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.3 }}>
                        {app.email && (
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                            <EmailIcon sx={{ fontSize: 12, color: '#94a3b8' }} />
                            <Typography sx={{ fontSize: '0.75rem', color: '#475569' }}>{app.email}</Typography>
                          </Box>
                        )}
                        {app.phone && (
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                            <PhoneIcon sx={{ fontSize: 12, color: '#94a3b8' }} />
                            <Typography sx={{ fontSize: '0.75rem', color: '#475569' }}>{app.phone}</Typography>
                          </Box>
                        )}
                      </Box>
                    </TableCell>

                    {/* Statut */}
                    <TableCell sx={{ py: 1.5, px: 2 }}>
                      <Chip label={sc.label} size="small"
                        sx={{ bgcolor: sc.bg, color: sc.color, fontWeight: 700, fontSize: '0.7rem',
                          height: 22, border: `1px solid ${sc.color}30` }} />
                    </TableCell>

                    {/* Date */}
                    <TableCell sx={{ py: 1.5, px: 2 }}>
                      <Typography sx={{ fontSize: '0.8rem', color: '#64748b' }}>
                        {app.applied_at ? format(new Date(app.applied_at), 'dd MMM yyyy', { locale: fr }) : '—'}
                      </Typography>
                    </TableCell>

                    {/* Actions */}
                    <TableCell sx={{ py: 1.5, px: 2 }} onClick={e => e.stopPropagation()}>
                      <Box sx={{ display: 'flex', gap: 0.5, justifyContent: 'flex-end' }}>
                        <Tooltip title="Voir">
                          <IconButton size="small"
                            onClick={() => navigate(`/recruitment/applications/${app.id}`)}
                            sx={{ color: '#1976d2', bgcolor: '#eff6ff', borderRadius: 1.5, width: 28, height: 28,
                              '&:hover': { bgcolor: '#dbeafe' } }}>
                            <ViewIcon sx={{ fontSize: 14 }} />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Actions">
                          <IconButton size="small"
                            onClick={e => { setAnchorEl(e.currentTarget); setSelected(app); }}
                            sx={{ color: '#475569', bgcolor: '#f8fafc', borderRadius: 1.5, width: 28, height: 28,
                              '&:hover': { bgcolor: '#f1f5f9' } }}>
                            <MoreVertIcon sx={{ fontSize: 14 }} />
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

        {/* Pagination */}
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

      {/* Context menu */}
      <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={() => setAnchorEl(null)}
        PaperProps={{ elevation: 0, sx: { border: '1px solid #e8ecf0', borderRadius: 2, minWidth: 200 } }}>

        <MenuItem onClick={() => { navigate(`/recruitment/applications/${selected?.id}`); setAnchorEl(null); }}
          sx={{ fontSize: '0.875rem', gap: 1.5 }}>
          <ViewIcon sx={{ fontSize: 17, color: '#1976d2' }} /> Voir les détails
        </MenuItem>

        <Divider />

        {selected?.status === 'pending' && [
          <MenuItem key="reviewed" onClick={() => handleStatus(selected.id, 'reviewed')}
            sx={{ fontSize: '0.875rem', gap: 1.5 }}>
            <ReviewIcon sx={{ fontSize: 17, color: '#0288d1' }} /> Marquer comme examiné
          </MenuItem>,
          <MenuItem key="interview" onClick={() => handleStatus(selected.id, 'interview')}
            sx={{ fontSize: '0.875rem', gap: 1.5 }}>
            <InterviewIcon sx={{ fontSize: 17, color: '#7b1fa2' }} /> Programmer un entretien
          </MenuItem>,
        ]}

        {selected?.status === 'reviewed' && (
          <MenuItem onClick={() => handleStatus(selected.id, 'interview')}
            sx={{ fontSize: '0.875rem', gap: 1.5 }}>
            <InterviewIcon sx={{ fontSize: 17, color: '#7b1fa2' }} /> Programmer un entretien
          </MenuItem>
        )}

        {(selected?.status === 'interview' || selected?.status === 'reviewed') && [
          <MenuItem key="accept" onClick={() => handleStatus(selected.id, 'accepted')}
            sx={{ fontSize: '0.875rem', gap: 1.5, color: '#2e7d32' }}>
            <AcceptIcon sx={{ fontSize: 17 }} /> Accepter
          </MenuItem>,
          <MenuItem key="reject" onClick={() => handleStatus(selected.id, 'rejected')}
            sx={{ fontSize: '0.875rem', gap: 1.5, color: '#c62828' }}>
            <RejectIcon sx={{ fontSize: 17 }} /> Rejeter
          </MenuItem>,
        ]}
      </Menu>

      {/* Snackbar */}
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

export default ApplicationsList;
