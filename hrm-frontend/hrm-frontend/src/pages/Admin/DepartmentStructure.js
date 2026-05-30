import React, { useState, useEffect, useMemo } from 'react';
import {
  Box, Typography, Button, Card, CardContent, Grid, Avatar, Chip,
  TextField, InputAdornment, MenuItem, Select, FormControl, InputLabel,
  Dialog, DialogTitle, DialogContent, DialogActions,
  Table, TableHead, TableBody, TableRow, TableCell, TableContainer,
  IconButton, Tooltip, Alert, Skeleton, Pagination,
} from '@mui/material';
import {
  Business as DeptIcon,
  PersonWorkplace as PosIcon,
  Search as SearchIcon,
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Close as CloseIcon,
  Check as CheckIcon,
} from '@mui/icons-material';
import BusinessIcon from '@mui/icons-material/Business';
import WorkIcon from '@mui/icons-material/Work';
import GroupsIcon from '@mui/icons-material/Groups';
import { getDepartments, createDepartment, updateDepartment, deleteDepartment,
         getPositions, createPosition, updatePosition, deletePosition } from '../../services/hrService';

const PER_PAGE = 10;

const headerSx = {
  background: 'linear-gradient(135deg,#0f172a 0%,#1e3a5f 60%,#1e40af 100%)',
  borderRadius: 3, p: 3, mb: 3, color: 'white',
};

const statCard = (icon, value, label, color) => (
  <Card elevation={0} sx={{ border: '1px solid #e8ecf0', borderRadius: 3, height: '100%' }}>
    <CardContent sx={{ p: 2.5 }}>
      <Avatar sx={{ bgcolor: `${color}15`, width: 38, height: 38, mb: 1 }}>
        {React.cloneElement(icon, { sx: { color, fontSize: 20 } })}
      </Avatar>
      <Typography variant="h4" fontWeight={800} sx={{ color, lineHeight: 1 }}>{value}</Typography>
      <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>{label}</Typography>
    </CardContent>
  </Card>
);

// ── Modal départements ───────────────────────────────────────────────────
const DeptModal = ({ open, dept, onClose, onSaved }) => {
  const [form, setForm] = useState({ name: '', code: '', description: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    setForm(dept ? { name: dept.name, code: dept.code, description: dept.description || '' } : { name: '', code: '', description: '' });
    setError('');
  }, [dept, open]);

  const handleSave = async () => {
    if (!form.name.trim() || !form.code.trim()) { setError('Nom et code sont requis'); return; }
    setLoading(true); setError('');
    try {
      if (dept) await updateDepartment(dept.id, form);
      else await createDepartment(form);
      onSaved();
    } catch (e) {
      setError(e.response?.data?.error || 'Une erreur est survenue');
    } finally { setLoading(false); }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: 3 } }}>
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1.5, pb: 1 }}>
        <Avatar sx={{ bgcolor: '#1976d215', width: 36, height: 36 }}>
          <BusinessIcon sx={{ color: '#1976d2', fontSize: 18 }} />
        </Avatar>
        <Typography fontWeight={700}>{dept ? 'Modifier le département' : 'Nouveau département'}</Typography>
        <IconButton onClick={onClose} sx={{ ml: 'auto' }} size="small"><CloseIcon fontSize="small" /></IconButton>
      </DialogTitle>
      <DialogContent sx={{ pt: 2 }}>
        {error && <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>{error}</Alert>}
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 0.5 }}>
          <TextField label="Nom du département *" value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
            fullWidth size="small" sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }} />
          <TextField label="Code *" value={form.code} onChange={e => setForm(p => ({ ...p, code: e.target.value.toUpperCase() }))}
            fullWidth size="small" placeholder="ex: IT, RH, FIN" sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }} />
          <TextField label="Description" value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))}
            fullWidth size="small" multiline rows={3} sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }} />
        </Box>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2.5, gap: 1 }}>
        <Button onClick={onClose} variant="outlined" sx={{ borderRadius: 2 }}>Annuler</Button>
        <Button onClick={handleSave} disabled={loading} variant="contained"
          sx={{ borderRadius: 2, bgcolor: '#1976d2', '&:hover': { bgcolor: '#1565c0' } }}>
          <CheckIcon sx={{ mr: 0.5, fontSize: 16 }} /> {dept ? 'Enregistrer' : 'Créer'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

// ── Modal postes ─────────────────────────────────────────────────────────
const PosModal = ({ open, pos, departments, onClose, onSaved }) => {
  const [form, setForm] = useState({ name: '', department_id: '', description: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    setForm(pos
      ? { name: pos.name, department_id: pos.department_id, description: pos.description || '' }
      : { name: '', department_id: departments[0]?.id || '', description: '' });
    setError('');
  }, [pos, open, departments]);

  const handleSave = async () => {
    if (!form.name.trim() || !form.department_id) { setError('Nom et département sont requis'); return; }
    setLoading(true); setError('');
    try {
      if (pos) await updatePosition(pos.id, form);
      else await createPosition(form);
      onSaved();
    } catch (e) {
      setError(e.response?.data?.error || 'Une erreur est survenue');
    } finally { setLoading(false); }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: 3 } }}>
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1.5, pb: 1 }}>
        <Avatar sx={{ bgcolor: '#7b1fa215', width: 36, height: 36 }}>
          <WorkIcon sx={{ color: '#7b1fa2', fontSize: 18 }} />
        </Avatar>
        <Typography fontWeight={700}>{pos ? 'Modifier le poste' : 'Nouveau poste'}</Typography>
        <IconButton onClick={onClose} sx={{ ml: 'auto' }} size="small"><CloseIcon fontSize="small" /></IconButton>
      </DialogTitle>
      <DialogContent sx={{ pt: 2 }}>
        {error && <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>{error}</Alert>}
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 0.5 }}>
          <TextField label="Nom du poste *" value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
            fullWidth size="small" sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }} />
          <FormControl fullWidth size="small">
            <InputLabel>Département *</InputLabel>
            <Select value={form.department_id} label="Département *"
              onChange={e => setForm(p => ({ ...p, department_id: e.target.value }))}
              sx={{ borderRadius: 2 }}>
              {departments.map(d => <MenuItem key={d.id} value={d.id}>{d.name}</MenuItem>)}
            </Select>
          </FormControl>
          <TextField label="Description" value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))}
            fullWidth size="small" multiline rows={3} sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }} />
        </Box>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2.5, gap: 1 }}>
        <Button onClick={onClose} variant="outlined" sx={{ borderRadius: 2 }}>Annuler</Button>
        <Button onClick={handleSave} disabled={loading} variant="contained"
          sx={{ borderRadius: 2, bgcolor: '#7b1fa2', '&:hover': { bgcolor: '#6a1b9a' } }}>
          <CheckIcon sx={{ mr: 0.5, fontSize: 16 }} /> {pos ? 'Enregistrer' : 'Créer'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

// ── Page principale ──────────────────────────────────────────────────────
export default function DepartmentStructure() {
  const [departments, setDepartments] = useState([]);
  const [positions, setPositions]     = useState([]);
  const [loading, setLoading]         = useState(true);
  const [error, setError]             = useState('');

  // Recherche & filtre
  const [deptSearch, setDeptSearch]   = useState('');
  const [posSearch, setPosSearch]     = useState('');
  const [posDeptFilter, setPosDeptFilter] = useState('');

  // Pagination
  const [deptPage, setDeptPage] = useState(1);
  const [posPage,  setPosPage]  = useState(1);

  // Modals
  const [deptModal, setDeptModal] = useState({ open: false, dept: null });
  const [posModal,  setPosModal]  = useState({ open: false, pos: null });

  // Confirm delete
  const [deleteConfirm, setDeleteConfirm] = useState({ open: false, type: '', item: null });

  const load = async () => {
    setLoading(true);
    try {
      const [d, p] = await Promise.all([getDepartments(), getPositions()]);
      setDepartments(d.data);
      setPositions(p.data);
    } catch { setError('Erreur lors du chargement des données'); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  // Filtres départements
  const filteredDepts = useMemo(() => {
    const q = deptSearch.toLowerCase();
    return departments.filter(d => !q || d.name.toLowerCase().includes(q) || d.code.toLowerCase().includes(q));
  }, [departments, deptSearch]);

  const deptPages = Math.ceil(filteredDepts.length / PER_PAGE) || 1;
  const pagedDepts = filteredDepts.slice((deptPage - 1) * PER_PAGE, deptPage * PER_PAGE);

  // Filtres postes
  const filteredPos = useMemo(() => {
    const q = posSearch.toLowerCase();
    return positions.filter(p =>
      (!q || p.name.toLowerCase().includes(q)) &&
      (!posDeptFilter || p.department_id === posDeptFilter)
    );
  }, [positions, posSearch, posDeptFilter]);

  const posPages = Math.ceil(filteredPos.length / PER_PAGE) || 1;
  const pagedPos = filteredPos.slice((posPage - 1) * PER_PAGE, posPage * PER_PAGE);

  const handleDelete = async () => {
    const { type, item } = deleteConfirm;
    try {
      if (type === 'dept') await deleteDepartment(item.id);
      else await deletePosition(item.id);
      setDeleteConfirm({ open: false, type: '', item: null });
      load();
    } catch (e) {
      setError(e.response?.data?.error || 'Erreur lors de la suppression');
      setDeleteConfirm({ open: false, type: '', item: null });
    }
  };

  const colStyle = {
    fontSize: '0.72rem', fontWeight: 700, color: '#475569',
    textTransform: 'uppercase', letterSpacing: '0.5px',
    background: '#f8fafc', borderBottom: '2px solid #e8ecf0',
  };

  if (loading) return (
    <Box sx={{ p: 3 }}>
      {[1,2,3].map(i => <Skeleton key={i} variant="rounded" height={60} sx={{ mb: 1.5, borderRadius: 2 }} />)}
    </Box>
  );

  return (
    <Box sx={{ p: { xs: 2, md: 3 }, maxWidth: 1300, mx: 'auto' }}>

      {/* Banner */}
      <Box sx={headerSx}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.15)', width: 46, height: 46, borderRadius: 2 }}>
              <BusinessIcon sx={{ color: 'white', fontSize: 22 }} />
            </Avatar>
            <Box>
              <Typography variant="h6" fontWeight={700}>Départements & Structures</Typography>
              <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.6)' }}>
                Organisation hiérarchique de la plateforme
              </Typography>
            </Box>
          </Box>
        </Box>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }} onClose={() => setError('')}>{error}</Alert>}

      {/* Stats */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={6} sm={3}>{statCard(<BusinessIcon />, departments.length, 'Départements', '#1976d2')}</Grid>
        <Grid item xs={6} sm={3}>{statCard(<WorkIcon />, positions.length, 'Postes', '#7b1fa2')}</Grid>
        <Grid item xs={6} sm={3}>
          <Card elevation={0} sx={{ border: '1px solid #e8ecf0', borderRadius: 3, height: '100%' }}>
            <CardContent sx={{ p: 2.5, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Button variant="contained" startIcon={<AddIcon />} fullWidth
                onClick={() => setDeptModal({ open: true, dept: null })}
                sx={{ borderRadius: 2, bgcolor: '#1976d2', '&:hover': { bgcolor: '#1565c0' }, fontWeight: 600 }}>
                Nouveau département
              </Button>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={6} sm={3}>
          <Card elevation={0} sx={{ border: '1px solid #e8ecf0', borderRadius: 3, height: '100%' }}>
            <CardContent sx={{ p: 2.5, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Button variant="contained" startIcon={<AddIcon />} fullWidth
                onClick={() => setPosModal({ open: true, pos: null })}
                sx={{ borderRadius: 2, bgcolor: '#7b1fa2', '&:hover': { bgcolor: '#6a1b9a' }, fontWeight: 600 }}>
                Nouveau poste
              </Button>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Grid container spacing={3}>

        {/* ── Départements ── */}
        <Grid item xs={12} xl={5}>
          <Card elevation={0} sx={{ border: '1px solid #e8ecf0', borderRadius: 3, overflow: 'hidden' }}>
            {/* Header */}
            <Box sx={{ background: 'linear-gradient(135deg,#0f172a,#1e3a5f,#1e40af)', p: '0.85rem 1.25rem', display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.12)', width: 30, height: 30, borderRadius: 1.5 }}>
                <BusinessIcon sx={{ fontSize: 15, color: 'white' }} />
              </Avatar>
              <Typography sx={{ color: 'white', fontWeight: 700, fontSize: '0.92rem' }}>Départements</Typography>
              <Chip label={departments.length} size="small" sx={{ ml: 'auto', bgcolor: 'rgba(255,255,255,0.15)', color: 'white', height: 20, fontSize: '0.7rem' }} />
            </Box>

            {/* Search */}
            <Box sx={{ p: 1.5, borderBottom: '1px solid #f1f5f9' }}>
              <TextField size="small" fullWidth placeholder="Rechercher un département…" value={deptSearch}
                onChange={e => { setDeptSearch(e.target.value); setDeptPage(1); }}
                InputProps={{ startAdornment: <InputAdornment position="start"><SearchIcon sx={{ fontSize: 16, color: '#94a3b8' }} /></InputAdornment>,
                  sx: { borderRadius: 2, fontSize: '0.82rem' } }} />
            </Box>

            {/* Table */}
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell sx={colStyle}>Département</TableCell>
                    <TableCell sx={colStyle}>Code</TableCell>
                    <TableCell sx={{ ...colStyle, textAlign: 'center' }}>Postes</TableCell>
                    <TableCell sx={{ ...colStyle, textAlign: 'right' }}>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {pagedDepts.length === 0 ? (
                    <TableRow><TableCell colSpan={4} sx={{ textAlign: 'center', py: 4, color: '#94a3b8', fontSize: '0.85rem' }}>
                      Aucun département trouvé
                    </TableCell></TableRow>
                  ) : pagedDepts.map(dept => (
                    <TableRow key={dept.id} hover sx={{ '&:last-child td': { border: 0 } }}>
                      <TableCell sx={{ py: 1 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.2 }}>
                          <Avatar sx={{ bgcolor: '#1976d215', width: 30, height: 30, borderRadius: 1.5 }}>
                            <BusinessIcon sx={{ color: '#1976d2', fontSize: 14 }} />
                          </Avatar>
                          <Box>
                            <Typography sx={{ fontSize: '0.82rem', fontWeight: 600, color: '#1e293b' }}>{dept.name}</Typography>
                            {dept.description && <Typography sx={{ fontSize: '0.7rem', color: '#94a3b8' }}>{dept.description.substring(0, 35)}{dept.description.length > 35 ? '…' : ''}</Typography>}
                          </Box>
                        </Box>
                      </TableCell>
                      <TableCell><Chip label={dept.code} size="small" sx={{ bgcolor: '#eff6ff', color: '#1976d2', fontWeight: 700, fontSize: '0.68rem', height: 20 }} /></TableCell>
                      <TableCell sx={{ textAlign: 'center' }}>
                        <Typography sx={{ fontSize: '0.8rem', fontWeight: 600, color: '#475569' }}>{dept.position_count ?? 0}</Typography>
                      </TableCell>
                      <TableCell sx={{ textAlign: 'right' }}>
                        <Box sx={{ display: 'flex', gap: 0.5, justifyContent: 'flex-end' }}>
                          <Tooltip title="Modifier">
                            <IconButton size="small" onClick={() => setDeptModal({ open: true, dept })}
                              sx={{ color: '#1976d2', bgcolor: '#eff6ff', borderRadius: 1.5, '&:hover': { bgcolor: '#dbeafe' }, width: 28, height: 28 }}>
                              <EditIcon sx={{ fontSize: 14 }} />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Supprimer">
                            <IconButton size="small" onClick={() => setDeleteConfirm({ open: true, type: 'dept', item: dept })}
                              sx={{ color: '#c62828', bgcolor: '#ffebee', borderRadius: 1.5, '&:hover': { bgcolor: '#ffcdd2' }, width: 28, height: 28 }}>
                              <DeleteIcon sx={{ fontSize: 14 }} />
                            </IconButton>
                          </Tooltip>
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>

            {/* Pagination */}
            {filteredDepts.length > PER_PAGE && (
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', px: 2, py: 1.5, borderTop: '1px solid #f1f5f9' }}>
                <Typography sx={{ fontSize: '0.75rem', color: '#64748b' }}>
                  {(deptPage - 1) * PER_PAGE + 1}–{Math.min(deptPage * PER_PAGE, filteredDepts.length)} sur {filteredDepts.length}
                </Typography>
                <Pagination count={deptPages} page={deptPage} onChange={(_, v) => setDeptPage(v)}
                  size="small" shape="rounded"
                  sx={{ '& .MuiPaginationItem-root': { fontSize: '0.75rem', minWidth: 28, height: 28 } }} />
              </Box>
            )}
          </Card>
        </Grid>

        {/* ── Postes ── */}
        <Grid item xs={12} xl={7}>
          <Card elevation={0} sx={{ border: '1px solid #e8ecf0', borderRadius: 3, overflow: 'hidden' }}>
            {/* Header */}
            <Box sx={{ background: 'linear-gradient(135deg,#0f172a,#1e3a5f,#1e40af)', p: '0.85rem 1.25rem', display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.12)', width: 30, height: 30, borderRadius: 1.5 }}>
                <WorkIcon sx={{ fontSize: 15, color: 'white' }} />
              </Avatar>
              <Typography sx={{ color: 'white', fontWeight: 700, fontSize: '0.92rem' }}>Postes</Typography>
              <Chip label={positions.length} size="small" sx={{ ml: 'auto', bgcolor: 'rgba(255,255,255,0.15)', color: 'white', height: 20, fontSize: '0.7rem' }} />
            </Box>

            {/* Search + Filter */}
            <Box sx={{ p: 1.5, borderBottom: '1px solid #f1f5f9', display: 'flex', gap: 1.5 }}>
              <TextField size="small" fullWidth placeholder="Rechercher un poste…" value={posSearch}
                onChange={e => { setPosSearch(e.target.value); setPosPage(1); }}
                InputProps={{ startAdornment: <InputAdornment position="start"><SearchIcon sx={{ fontSize: 16, color: '#94a3b8' }} /></InputAdornment>,
                  sx: { borderRadius: 2, fontSize: '0.82rem' } }} />
              <FormControl size="small" sx={{ minWidth: 160 }}>
                <Select value={posDeptFilter} displayEmpty onChange={e => { setPosDeptFilter(e.target.value); setPosPage(1); }}
                  sx={{ borderRadius: 2, fontSize: '0.82rem' }}>
                  <MenuItem value="">Tous les départements</MenuItem>
                  {departments.map(d => <MenuItem key={d.id} value={d.id}>{d.name}</MenuItem>)}
                </Select>
              </FormControl>
            </Box>

            {/* Table */}
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell sx={colStyle}>Poste</TableCell>
                    <TableCell sx={colStyle}>Département</TableCell>
                    <TableCell sx={colStyle}>Description</TableCell>
                    <TableCell sx={{ ...colStyle, textAlign: 'right' }}>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {pagedPos.length === 0 ? (
                    <TableRow><TableCell colSpan={4} sx={{ textAlign: 'center', py: 4, color: '#94a3b8', fontSize: '0.85rem' }}>
                      Aucun poste trouvé
                    </TableCell></TableRow>
                  ) : pagedPos.map(pos => (
                    <TableRow key={pos.id} hover sx={{ '&:last-child td': { border: 0 } }}>
                      <TableCell sx={{ py: 1 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.2 }}>
                          <Avatar sx={{ bgcolor: '#7b1fa215', width: 30, height: 30, borderRadius: 1.5 }}>
                            <WorkIcon sx={{ color: '#7b1fa2', fontSize: 14 }} />
                          </Avatar>
                          <Typography sx={{ fontSize: '0.82rem', fontWeight: 600, color: '#1e293b' }}>{pos.name}</Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Chip label={pos.department_name} size="small"
                          sx={{ bgcolor: '#e3f2fd', color: '#1565c0', fontWeight: 600, fontSize: '0.68rem', height: 20 }} />
                      </TableCell>
                      <TableCell sx={{ fontSize: '0.75rem', color: '#64748b', maxWidth: 200 }}>
                        {pos.description ? `${pos.description.substring(0, 40)}${pos.description.length > 40 ? '…' : ''}` : '—'}
                      </TableCell>
                      <TableCell sx={{ textAlign: 'right' }}>
                        <Box sx={{ display: 'flex', gap: 0.5, justifyContent: 'flex-end' }}>
                          <Tooltip title="Modifier">
                            <IconButton size="small" onClick={() => setPosModal({ open: true, pos })}
                              sx={{ color: '#7b1fa2', bgcolor: '#fdf4ff', borderRadius: 1.5, '&:hover': { bgcolor: '#f3e5f5' }, width: 28, height: 28 }}>
                              <EditIcon sx={{ fontSize: 14 }} />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Supprimer">
                            <IconButton size="small" onClick={() => setDeleteConfirm({ open: true, type: 'pos', item: pos })}
                              sx={{ color: '#c62828', bgcolor: '#ffebee', borderRadius: 1.5, '&:hover': { bgcolor: '#ffcdd2' }, width: 28, height: 28 }}>
                              <DeleteIcon sx={{ fontSize: 14 }} />
                            </IconButton>
                          </Tooltip>
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>

            {/* Pagination */}
            {filteredPos.length > PER_PAGE && (
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', px: 2, py: 1.5, borderTop: '1px solid #f1f5f9' }}>
                <Typography sx={{ fontSize: '0.75rem', color: '#64748b' }}>
                  {(posPage - 1) * PER_PAGE + 1}–{Math.min(posPage * PER_PAGE, filteredPos.length)} sur {filteredPos.length}
                </Typography>
                <Pagination count={posPages} page={posPage} onChange={(_, v) => setPosPage(v)}
                  size="small" shape="rounded"
                  sx={{ '& .MuiPaginationItem-root': { fontSize: '0.75rem', minWidth: 28, height: 28 } }} />
              </Box>
            )}
          </Card>
        </Grid>
      </Grid>

      {/* Modals */}
      <DeptModal open={deptModal.open} dept={deptModal.dept}
        onClose={() => setDeptModal({ open: false, dept: null })}
        onSaved={() => { setDeptModal({ open: false, dept: null }); load(); }} />

      <PosModal open={posModal.open} pos={posModal.pos} departments={departments}
        onClose={() => setPosModal({ open: false, pos: null })}
        onSaved={() => { setPosModal({ open: false, pos: null }); load(); }} />

      {/* Confirm Delete */}
      <Dialog open={deleteConfirm.open} onClose={() => setDeleteConfirm({ open: false, type: '', item: null })}
        maxWidth="xs" fullWidth PaperProps={{ sx: { borderRadius: 3 } }}>
        <DialogTitle sx={{ fontWeight: 700 }}>Confirmer la suppression</DialogTitle>
        <DialogContent>
          <Typography sx={{ color: '#475569', fontSize: '0.9rem' }}>
            Supprimer <strong>{deleteConfirm.item?.name}</strong> ? Cette action est irréversible.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2.5, gap: 1 }}>
          <Button onClick={() => setDeleteConfirm({ open: false, type: '', item: null })} variant="outlined" sx={{ borderRadius: 2 }}>Annuler</Button>
          <Button onClick={handleDelete} variant="contained" color="error" sx={{ borderRadius: 2 }}>Supprimer</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
