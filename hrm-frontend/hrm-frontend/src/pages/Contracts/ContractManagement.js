import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import {
  Box, Card, CardContent, Typography, Button, Grid, Chip, Avatar,
  IconButton, Menu, MenuItem, Dialog, DialogTitle, DialogContent,
  DialogActions, TextField, FormControl, InputLabel, Select, Alert,
  CircularProgress, Divider,
} from '@mui/material';
import {
  Add as AddIcon,
  Assignment as AssignmentIcon,
  MoreVert as MoreVertIcon,
  Edit as EditIcon,
  Refresh as RefreshIcon,
  Warning as WarningIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  Work as WorkIcon,
  Close as CloseIcon,
  CalendarToday as CalendarIcon,
  EventBusy as EventBusyIcon,
  Payments as PaymentsIcon,
  Badge as BadgeIcon,
  ArrowBack as BackIcon,
} from '@mui/icons-material';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import {
  getContracts, createContract, getExpiringContracts, getEmployees,
  getContractDetail, updateContract, renewContract,
} from '../../services/hrService';

/* ── helpers ──────────────────────────────────────────────────────── */
const typeConfig = {
  CDI:   { color: '#2e7d32', bg: '#e8f5e9' },
  CDD:   { color: '#e65100', bg: '#fff3e0' },
  Stage: { color: '#1976d2', bg: '#e3f2fd' },
};

const getStatus = (c) => {
  if (c.is_expired)      return { label: 'Expiré',        color: '#c62828', bg: '#ffebee' };
  if (c.is_expiring_soon) return { label: 'Expire bientôt', color: '#e65100', bg: '#fff3e0' };
  if (c.active)          return { label: 'Actif',         color: '#2e7d32', bg: '#e8f5e9' };
  return                        { label: 'Inactif',        color: '#757575', bg: '#f5f5f5' };
};

const COLORS = ['#1976d2', '#9c27b0', '#2e7d32', '#e65100', '#0097a7', '#c62828'];
const avatarColor = (name = '') => COLORS[name.charCodeAt(0) % COLORS.length];

/* ── StatCard ─────────────────────────────────────────────────────── */
const StatCard = ({ title, value, icon, color, loading }) => (
  <Card elevation={0} sx={{
    border: '1px solid', borderColor: `${color}25`, borderRadius: 3,
    transition: 'all 0.3s ease',
    '&:hover': { boxShadow: `0 6px 20px ${color}18`, borderColor: `${color}45`, bgcolor: `${color}04` },
  }}>
    <CardContent sx={{ p: 2.5 }}>
      <Box sx={{ mb: 1.5 }}>
        <Box sx={{ p: 1, borderRadius: 2, bgcolor: `${color}12`, display: 'inline-flex' }}>
          {React.cloneElement(icon, { sx: { fontSize: 20, color } })}
        </Box>
      </Box>
      {loading ? (
        <Box sx={{ height: 48, display: 'flex', alignItems: 'center' }}>
          <CircularProgress size={20} sx={{ color }} />
        </Box>
      ) : (
        <>
          <Typography variant="h4" fontWeight={700} sx={{ color, lineHeight: 1 }}>{value}</Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5, fontSize: '0.8rem' }}>{title}</Typography>
        </>
      )}
    </CardContent>
  </Card>
);

/* ── FilterChip ───────────────────────────────────────────────────── */
const FilterChip = ({ label, active, color = '#1976d2', onClick }) => (
  <Box
    onClick={onClick}
    sx={{
      px: 2, py: 0.75, borderRadius: 3, cursor: 'pointer', fontSize: '0.82rem', fontWeight: active ? 700 : 500,
      border: `1px solid ${active ? color : '#e8ecf0'}`,
      bgcolor: active ? color : 'white',
      color: active ? 'white' : color,
      transition: 'all 0.15s',
      '&:hover': { bgcolor: active ? color : `${color}10`, borderColor: color },
      whiteSpace: 'nowrap',
    }}
  >
    {label}
  </Box>
);

/* ── Main ─────────────────────────────────────────────────────────── */
const ContractManagement = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [contracts, setContracts] = useState([]);
  const [filteredContracts, setFilteredContracts] = useState([]);
  const [expiringContracts, setExpiringContracts] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');

  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedContract, setSelectedContract] = useState(null);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [contractDetail, setContractDetail] = useState(null);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [formData, setFormData] = useState({ employee: '', type: 'CDI', date_debut: '', date_fin: '', salaire: '' });

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    try {
      const [contractsRes, expiringRes, employeesRes] = await Promise.allSettled([
        getContracts(), getExpiringContracts(), getEmployees(),
      ]);
      const cd = contractsRes.value?.data?.results || contractsRes.value?.data || [];
      setContracts(cd);
      setFilteredContracts(cd);
      setExpiringContracts(expiringRes.value?.data?.results || expiringRes.value?.data || []);
      setEmployees(employeesRes.value?.data?.results || employeesRes.value?.data || []);
    } catch (_) {
      setError('Erreur lors du chargement des données.');
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (filter) => {
    setStatusFilter(filter);
    const map = {
      active:   c => c.active,
      inactive: c => !c.active,
      expiring: c => c.is_expiring_soon,
      expired:  c => c.is_expired,
      cdi:      c => c.type === 'CDI',
      cdd:      c => c.type === 'CDD',
      stage:    c => c.type === 'Stage',
    };
    setFilteredContracts(filter === 'all' ? contracts : contracts.filter(map[filter]));
  };

  const handleCreateContract = async () => {
    if (!formData.employee || !formData.date_debut) { setError('Champs obligatoires manquants.'); return; }
    try {
      setError('');
      await createContract({
        employee: parseInt(formData.employee),
        type: formData.type,
        date_debut: formData.date_debut,
        date_fin: formData.date_fin || null,
        salaire: formData.salaire ? parseFloat(formData.salaire) : null,
        active: true,
      });
      setSuccess('Contrat créé avec succès.');
      await fetchData();
      setCreateDialogOpen(false);
      setFormData({ employee: '', type: 'CDI', date_debut: '', date_fin: '', salaire: '' });
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.error || err.response?.data?.message || 'Erreur lors de la création.');
    }
  };

  const handleViewDetails = async (contract) => {
    try {
      const res = await getContractDetail(contract.id);
      setContractDetail(res.data);
      setDetailDialogOpen(true);
    } catch (_) { setError('Erreur lors du chargement des détails.'); }
    setAnchorEl(null);
    setSelectedContract(null);
  };

  const handleEdit   = (c) => { if (user?.role === 'hr_manager') navigate(`/contracts/${c.id}/edit`);  setAnchorEl(null); };
  const handleRenew  = (c) => { if (user?.role === 'hr_manager') navigate(`/contracts/${c.id}/renew`); setAnchorEl(null); };

  const active  = contracts.filter(c => c.active).length;
  const cdi     = contracts.filter(c => c.type === 'CDI').length;
  const cdd     = contracts.filter(c => c.type === 'CDD').length;
  const expiring = expiringContracts.length;

  const filters = [
    { key: 'all',      label: `Tous (${contracts.length})`,                                         color: '#1976d2' },
    { key: 'active',   label: `Actifs (${contracts.filter(c => c.active).length})`,                  color: '#2e7d32' },
    { key: 'inactive', label: `Inactifs (${contracts.filter(c => !c.active).length})`,               color: '#757575' },
    { key: 'expiring', label: `Expirent bientôt (${contracts.filter(c => c.is_expiring_soon).length})`, color: '#e65100' },
    { key: 'expired',  label: `Expirés (${contracts.filter(c => c.is_expired).length})`,             color: '#c62828' },
    { key: 'cdi',      label: `CDI (${cdi})`,                                                        color: '#2e7d32' },
    { key: 'cdd',      label: `CDD (${cdd})`,                                                        color: '#e65100' },
    { key: 'stage',    label: `Stage (${contracts.filter(c => c.type === 'Stage').length})`,         color: '#1976d2' },
  ];

  return (
    <Box sx={{ width: '100%' }}>

      {/* ── Banner ── */}
      <Card elevation={0} sx={{ borderRadius: 3, border: '1px solid #e8ecf0', mb: 3, overflow: 'hidden' }}>
        <Box sx={{
          background: 'linear-gradient(135deg, #0f172a 0%, #1e3a5f 60%, #1e40af 100%)',
          px: 3, py: 2.5,
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Button startIcon={<BackIcon />} onClick={() => navigate('/dashboard')} size="small"
              sx={{ color: 'rgba(255,255,255,0.7)', textTransform: 'none', fontWeight: 500, borderRadius: 2, minWidth: 0,
                '&:hover': { bgcolor: 'rgba(255,255,255,0.1)', color: 'white' } }}>
              Retour
            </Button>
            <Box>
              <Typography variant="h5" fontWeight={700} color="white">Gestion des Contrats</Typography>
              <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.65)', mt: 0.3 }}>
                {filteredContracts.length} contrat{filteredContracts.length !== 1 ? 's' : ''} affichés sur {contracts.length} au total
              </Typography>
            </Box>
          </Box>
          {user?.role === 'hr_manager' && (
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => setCreateDialogOpen(true)}
              sx={{
                bgcolor: 'rgba(255,255,255,0.15)', color: 'white',
                border: '1px solid rgba(255,255,255,0.25)',
                borderRadius: 2, textTransform: 'none', fontWeight: 600,
                backdropFilter: 'blur(8px)',
                '&:hover': { bgcolor: 'rgba(255,255,255,0.25)' },
              }}
            >
              Nouveau Contrat
            </Button>
          )}
        </Box>
      </Card>

      {error   && <Alert severity="error"   sx={{ mb: 2, borderRadius: 2 }} onClose={() => setError('')}>{error}</Alert>}
      {success && <Alert severity="success" sx={{ mb: 2, borderRadius: 2 }}>{success}</Alert>}

      {/* ── StatCards ── */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={6} sm={3}>
          <StatCard title="Contrats actifs"    value={active}   icon={<CheckCircleIcon />} color="#2e7d32" loading={loading} />
        </Grid>
        <Grid item xs={6} sm={3}>
          <StatCard title="CDI"                value={cdi}      icon={<WorkIcon />}        color="#1976d2" loading={loading} />
        </Grid>
        <Grid item xs={6} sm={3}>
          <StatCard title="CDD"                value={cdd}      icon={<AssignmentIcon />}  color="#e65100" loading={loading} />
        </Grid>
        <Grid item xs={6} sm={3}>
          <StatCard title="Expirent bientôt"   value={expiring} icon={<WarningIcon />}     color="#c62828" loading={loading} />
        </Grid>
      </Grid>

      {/* ── Filters ── */}
      <Card elevation={0} sx={{ border: '1px solid #e8ecf0', borderRadius: 3, mb: 3 }}>
        <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
          <Typography variant="caption" fontWeight={700} color="text.secondary" sx={{ textTransform: 'uppercase', letterSpacing: 0.8, display: 'block', mb: 1.5 }}>
            Filtres
          </Typography>
          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
            {filters.map(f => (
              <FilterChip key={f.key} label={f.label} active={statusFilter === f.key} color={f.color} onClick={() => handleFilterChange(f.key)} />
            ))}
          </Box>
        </CardContent>
      </Card>

      {/* ── Table ── */}
      <Card elevation={0} sx={{ border: '1px solid #e8ecf0', borderRadius: 3 }}>
        {/* Header row */}
        <Box sx={{
          display: 'grid',
          gridTemplateColumns: '2fr 100px 120px 130px 120px 110px 60px',
          px: 2.5, py: 1.5,
          bgcolor: '#f8fafc',
          borderBottom: '1px solid #e8ecf0',
          borderRadius: '12px 12px 0 0',
        }}>
          {['Employé', 'Type', 'Date début', 'Date fin', 'Salaire', 'Statut', 'Actions'].map(h => (
            <Typography key={h} variant="caption" fontWeight={700} color="text.secondary" sx={{ textTransform: 'uppercase', letterSpacing: 0.5, fontSize: '0.7rem' }}>
              {h}
            </Typography>
          ))}
        </Box>

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
            <CircularProgress size={32} />
          </Box>
        ) : filteredContracts.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 8, color: 'text.secondary' }}>
            <AssignmentIcon sx={{ fontSize: 48, mb: 1, opacity: 0.3 }} />
            <Typography variant="body2">Aucun contrat trouvé</Typography>
          </Box>
        ) : (
          filteredContracts.map((c, idx) => {
            const tc = typeConfig[c.type] || { color: '#1976d2', bg: '#e3f2fd' };
            const sc = getStatus(c);
            const photoUrl = c.employee_photo ? `http://localhost:8000${c.employee_photo}` : null;
            return (
              <Box key={c.id}>
                <Box sx={{
                  display: 'grid',
                  gridTemplateColumns: '2fr 100px 120px 130px 120px 110px 60px',
                  px: 2.5, py: 1.5, alignItems: 'center',
                  '&:hover': { bgcolor: '#f8fafc' },
                  transition: 'background 0.15s',
                }}>
                  {/* Employé */}
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <Avatar
                      src={photoUrl}
                      sx={{ width: 36, height: 36, bgcolor: avatarColor(c.employee_name || ''), fontSize: '0.85rem', fontWeight: 700, flexShrink: 0 }}
                    >
                      {!photoUrl && (c.employee_name?.charAt(0) || '?')}
                    </Avatar>
                    <Box sx={{ minWidth: 0 }}>
                      <Typography variant="body2" fontWeight={600} noWrap>{c.employee_name}</Typography>
                      <Typography variant="caption" color="text.secondary">{c.employee_matricule}</Typography>
                    </Box>
                  </Box>

                  {/* Type */}
                  <Box sx={{ overflow: 'hidden', display: 'flex', alignItems: 'center' }}>
                    <Chip label={c.type} size="small"
                      sx={{ bgcolor: tc.bg, color: tc.color, fontWeight: 700, fontSize: '0.7rem', height: 22, border: `1px solid ${tc.color}30`, '& .MuiChip-label': { px: 1 }, flexShrink: 0 }} />
                  </Box>

                  {/* Date début */}
                  <Typography variant="body2">
                    {c.date_debut ? format(new Date(c.date_debut), 'dd/MM/yyyy') : '—'}
                  </Typography>

                  {/* Date fin */}
                  <Typography variant="body2" color={c.date_fin ? 'text.primary' : 'text.disabled'}>
                    {c.date_fin && c.date_fin !== 'null' ? format(new Date(c.date_fin), 'dd/MM/yyyy') : 'Indéterminée'}
                  </Typography>

                  {/* Salaire */}
                  <Typography variant="body2">
                    {c.salaire ? `${Number(c.salaire).toLocaleString('fr-FR')} MAD` : '—'}
                  </Typography>

                  {/* Statut */}
                  <Box sx={{ overflow: 'hidden', display: 'flex', alignItems: 'center' }}>
                    <Chip label={sc.label} size="small"
                      sx={{ bgcolor: sc.bg, color: sc.color, fontWeight: 600, fontSize: '0.72rem', height: 22, border: `1px solid ${sc.color}30`, '& .MuiChip-label': { px: 1 }, flexShrink: 0 }} />
                  </Box>

                  {/* Actions */}
                  <IconButton size="small" onClick={(e) => { setAnchorEl(e.currentTarget); setSelectedContract(c); }}>
                    <MoreVertIcon fontSize="small" />
                  </IconButton>
                </Box>
                {idx < filteredContracts.length - 1 && <Divider />}
              </Box>
            );
          })
        )}
      </Card>

      {/* ── Context menu ── */}
      <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={() => { setAnchorEl(null); setSelectedContract(null); }}
        PaperProps={{ elevation: 0, sx: { border: '1px solid #e8ecf0', borderRadius: 2, minWidth: 160 } }}>
        <MenuItem onClick={() => handleViewDetails(selectedContract)} sx={{ fontSize: '0.875rem' }}>
          <AssignmentIcon sx={{ mr: 1.5, fontSize: 18 }} />Voir détails
        </MenuItem>
        {user?.role === 'hr_manager' && [
          <MenuItem key="edit" onClick={() => handleEdit(selectedContract)} sx={{ fontSize: '0.875rem' }}>
            <EditIcon sx={{ mr: 1.5, fontSize: 18 }} />Modifier
          </MenuItem>,
          <MenuItem key="renew" onClick={() => handleRenew(selectedContract)} sx={{ fontSize: '0.875rem' }}>
            <RefreshIcon sx={{ mr: 1.5, fontSize: 18 }} />Renouveler
          </MenuItem>,
        ]}
      </Menu>

      {/* ── Create dialog ── */}
      <Dialog open={createDialogOpen} onClose={() => { setCreateDialogOpen(false); setError(''); }}
        maxWidth="sm" fullWidth TransitionProps={{ onEntered: () => {} }}
        PaperProps={{ sx: { borderRadius: 3, overflow: 'hidden' } }}>

        {/* Header navy */}
        <Box sx={{ background: 'linear-gradient(135deg,#0f172a 0%,#1e3a5f 60%,#1e40af 100%)',
          px: 3, py: 2.5, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.15)', width: 38, height: 38, borderRadius: 2 }}>
              <AssignmentIcon sx={{ color: 'white', fontSize: 20 }} />
            </Avatar>
            <Box>
              <Typography variant="h6" fontWeight={700} color="white" sx={{ lineHeight: 1.2 }}>
                Nouveau contrat
              </Typography>
              <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.6)' }}>
                Renseignez les informations du contrat
              </Typography>
            </Box>
          </Box>
          <IconButton size="small" onClick={() => { setCreateDialogOpen(false); setError(''); }}
            sx={{ color: 'rgba(255,255,255,0.6)', '&:hover': { color: 'white', bgcolor: 'rgba(255,255,255,0.1)' } }}>
            <CloseIcon fontSize="small" />
          </IconButton>
        </Box>

        <DialogContent sx={{ p: 3 }}>
          {error && <Alert severity="error" sx={{ mb: 2.5, borderRadius: 2 }} onClose={() => setError('')}>{error}</Alert>}

          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>

            {/* Employé */}
            <Box>
              <Typography sx={{ fontSize: '0.78rem', fontWeight: 700, color: '#475569', mb: 0.75, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                Employé <span style={{ color: '#ef4444' }}>*</span>
              </Typography>
              <FormControl fullWidth size="small">
                <Select value={formData.employee} displayEmpty
                  onChange={(e) => setFormData({ ...formData, employee: e.target.value })}
                  renderValue={(v) => {
                    if (!v) return <Typography sx={{ color: '#94a3b8', fontSize: '0.875rem' }}>Sélectionner un employé…</Typography>;
                    const emp = employees.find(e => e.id === v);
                    if (!emp) return v;
                    const name = `${emp.user?.first_name || ''} ${emp.user?.last_name || ''}`.trim();
                    return (
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Avatar sx={{ width: 24, height: 24, fontSize: '0.65rem', fontWeight: 700,
                          bgcolor: ['#1976d2','#9c27b0','#2e7d32','#e65100'][(name.charCodeAt(0)||0) % 4] }}>
                          {name[0]?.toUpperCase()}
                        </Avatar>
                        <Typography sx={{ fontSize: '0.875rem', fontWeight: 600 }}>{name}</Typography>
                        <Typography variant="caption" color="text.secondary">— {emp.matricule}</Typography>
                      </Box>
                    );
                  }}
                  sx={{ borderRadius: 2 }}>
                  {employees.map((emp) => {
                    const name = `${emp.user?.first_name || ''} ${emp.user?.last_name || ''}`.trim();
                    return (
                      <MenuItem key={emp.id} value={emp.id}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                          <Avatar sx={{ width: 28, height: 28, fontSize: '0.72rem', fontWeight: 700,
                            bgcolor: ['#1976d2','#9c27b0','#2e7d32','#e65100'][(name.charCodeAt(0)||0) % 4] }}>
                            {name[0]?.toUpperCase()}
                          </Avatar>
                          <Box>
                            <Typography sx={{ fontSize: '0.875rem', fontWeight: 600 }}>{name}</Typography>
                            <Typography variant="caption" color="text.secondary">{emp.matricule} · {emp.poste || 'Poste non défini'}</Typography>
                          </Box>
                        </Box>
                      </MenuItem>
                    );
                  })}
                </Select>
              </FormControl>
            </Box>

            {/* Type de contrat — sélection visuelle */}
            <Box>
              <Typography sx={{ fontSize: '0.78rem', fontWeight: 700, color: '#475569', mb: 0.75, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                Type de contrat <span style={{ color: '#ef4444' }}>*</span>
              </Typography>
              <Box sx={{ display: 'flex', gap: 1.5 }}>
                {[
                  { value: 'CDI',   label: 'CDI',   sub: 'Durée indéterminée', color: '#2e7d32', bg: '#e8f5e9' },
                  { value: 'CDD',   label: 'CDD',   sub: 'Durée déterminée',   color: '#e65100', bg: '#fff3e0' },
                  { value: 'Stage', label: 'Stage', sub: 'Stage professionnel', color: '#1976d2', bg: '#e3f2fd' },
                ].map(t => (
                  <Box key={t.value} onClick={() => setFormData({ ...formData, type: t.value })}
                    sx={{ flex: 1, p: 1.5, borderRadius: 2, cursor: 'pointer', textAlign: 'center',
                      border: `2px solid ${formData.type === t.value ? t.color : '#e8ecf0'}`,
                      bgcolor: formData.type === t.value ? t.bg : 'white',
                      transition: 'all 0.15s',
                      '&:hover': { borderColor: t.color, bgcolor: t.bg } }}>
                    <Typography sx={{ fontSize: '0.9rem', fontWeight: 800, color: formData.type === t.value ? t.color : '#1e293b' }}>
                      {t.label}
                    </Typography>
                    <Typography sx={{ fontSize: '0.68rem', color: formData.type === t.value ? t.color : '#94a3b8', mt: 0.2 }}>
                      {t.sub}
                    </Typography>
                  </Box>
                ))}
              </Box>
            </Box>

            {/* Dates */}
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <Typography sx={{ fontSize: '0.78rem', fontWeight: 700, color: '#475569', mb: 0.75, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  Date de début <span style={{ color: '#ef4444' }}>*</span>
                </Typography>
                <TextField fullWidth size="small" type="date" InputLabelProps={{ shrink: true }}
                  value={formData.date_debut} onChange={(e) => setFormData({ ...formData, date_debut: e.target.value })}
                  sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }} />
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography sx={{ fontSize: '0.78rem', fontWeight: 700, color: '#475569', mb: 0.75, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  Date de fin
                  <span style={{ fontSize: '0.68rem', color: '#94a3b8', fontWeight: 400, marginLeft: 6, textTransform: 'none' }}>
                    (vide = indéterminée)
                  </span>
                </Typography>
                <TextField fullWidth size="small" type="date" InputLabelProps={{ shrink: true }}
                  value={formData.date_fin} onChange={(e) => setFormData({ ...formData, date_fin: e.target.value })}
                  disabled={formData.type === 'CDI'}
                  sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }} />
              </Grid>
            </Grid>

            {/* Salaire */}
            <Box>
              <Typography sx={{ fontSize: '0.78rem', fontWeight: 700, color: '#475569', mb: 0.75, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                Salaire mensuel (MAD)
                <span style={{ fontSize: '0.68rem', color: '#94a3b8', fontWeight: 400, marginLeft: 6, textTransform: 'none' }}>
                  optionnel
                </span>
              </Typography>
              <TextField fullWidth size="small" type="number" placeholder="ex: 8000"
                value={formData.salaire} onChange={(e) => setFormData({ ...formData, salaire: e.target.value })}
                InputProps={{ endAdornment: <Typography sx={{ color: '#94a3b8', fontSize: '0.82rem', whiteSpace: 'nowrap' }}>MAD / mois</Typography> }}
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }} />
            </Box>

          </Box>
        </DialogContent>

        <DialogActions sx={{ px: 3, pb: 3, gap: 1.5 }}>
          <Button onClick={() => { setCreateDialogOpen(false); setError(''); }}
            sx={{ borderRadius: 2, textTransform: 'none', color: '#64748b', fontWeight: 500, flex: 1 }}>
            Annuler
          </Button>
          <Button onClick={handleCreateContract} variant="contained"
            sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 700, flex: 2,
              background: 'linear-gradient(135deg,#1e3a5f,#1e40af)', py: 1,
              '&:hover': { background: 'linear-gradient(135deg,#0f172a,#1e3a5f)' } }}>
            Créer le contrat
          </Button>
        </DialogActions>
      </Dialog>

      {/* ── Detail dialog ── */}
      <Dialog open={detailDialogOpen} onClose={() => setDetailDialogOpen(false)} maxWidth="sm" fullWidth
        PaperProps={{ sx: { borderRadius: 3, overflow: 'hidden' } }}>
        {contractDetail && (() => {
          const dtc = typeConfig[contractDetail.type] || { color: '#1976d2', bg: '#e3f2fd' };
          const dsc = getStatus(contractDetail);
          const photoUrl = contractDetail.employee_photo ? `http://localhost:8000${contractDetail.employee_photo}` : null;
          return (
            <>
              {/* Navy header */}
              <Box sx={{
                background: 'linear-gradient(135deg, #0f172a 0%, #1e3a5f 60%, #1e40af 100%)',
                px: 3, pt: 3, pb: 2.5,
                position: 'relative',
              }}>
                <IconButton
                  size="small"
                  onClick={() => setDetailDialogOpen(false)}
                  sx={{ position: 'absolute', top: 12, right: 12, color: 'rgba(255,255,255,0.6)', '&:hover': { color: 'white', bgcolor: 'rgba(255,255,255,0.1)' } }}
                >
                  <CloseIcon fontSize="small" />
                </IconButton>

                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Avatar
                    src={photoUrl}
                    sx={{ width: 56, height: 56, bgcolor: avatarColor(contractDetail.employee_name || ''), fontSize: '1.3rem', fontWeight: 700, border: '2px solid rgba(255,255,255,0.25)' }}
                  >
                    {!photoUrl && (contractDetail.employee_name?.charAt(0) || '?')}
                  </Avatar>
                  <Box>
                    <Typography variant="h6" fontWeight={700} color="white" sx={{ lineHeight: 1.2 }}>
                      {contractDetail.employee_name}
                    </Typography>
                    <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.6)', mt: 0.3 }}>
                      {contractDetail.employee_matricule}
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
                      <Chip label={contractDetail.type} size="small"
                        sx={{ bgcolor: `${dtc.color}25`, color: 'white', border: `1px solid ${dtc.color}60`, fontWeight: 700, fontSize: '0.7rem', height: 22, '& .MuiChip-label': { px: 1 } }} />
                      <Chip label={dsc.label} size="small"
                        sx={{ bgcolor: 'rgba(255,255,255,0.12)', color: 'white', border: '1px solid rgba(255,255,255,0.25)', fontWeight: 600, fontSize: '0.7rem', height: 22, '& .MuiChip-label': { px: 1 } }} />
                    </Box>
                  </Box>
                </Box>
              </Box>

              {/* Info grid */}
              <DialogContent sx={{ p: 3 }}>
                <Grid container spacing={2}>

                  {/* Date début */}
                  <Grid item xs={6}>
                    <Box sx={{ p: 2, bgcolor: '#f8fafc', borderRadius: 2, border: '1px solid #e8ecf0', height: '100%' }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, mb: 0.75 }}>
                        <CalendarIcon sx={{ fontSize: 15, color: '#1976d2' }} />
                        <Typography variant="caption" color="text.secondary" fontWeight={600} sx={{ textTransform: 'uppercase', letterSpacing: 0.4, fontSize: '0.68rem' }}>
                          Date de début
                        </Typography>
                      </Box>
                      <Typography variant="body1" fontWeight={700} color="text.primary">
                        {contractDetail.date_debut ? format(new Date(contractDetail.date_debut), 'dd MMMM yyyy', { locale: fr }) : '—'}
                      </Typography>
                    </Box>
                  </Grid>

                  {/* Date fin */}
                  <Grid item xs={6}>
                    <Box sx={{ p: 2, bgcolor: '#f8fafc', borderRadius: 2, border: '1px solid #e8ecf0', height: '100%' }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, mb: 0.75 }}>
                        <EventBusyIcon sx={{ fontSize: 15, color: '#e65100' }} />
                        <Typography variant="caption" color="text.secondary" fontWeight={600} sx={{ textTransform: 'uppercase', letterSpacing: 0.4, fontSize: '0.68rem' }}>
                          Date de fin
                        </Typography>
                      </Box>
                      <Typography variant="body1" fontWeight={700} color={contractDetail.date_fin ? 'text.primary' : 'text.disabled'}>
                        {contractDetail.date_fin ? format(new Date(contractDetail.date_fin), 'dd MMMM yyyy', { locale: fr }) : 'Indéterminée'}
                      </Typography>
                    </Box>
                  </Grid>

                  {/* Salaire */}
                  {contractDetail.salaire && (
                    <Grid item xs={6}>
                      <Box sx={{ p: 2, bgcolor: '#f8fafc', borderRadius: 2, border: '1px solid #e8ecf0', height: '100%' }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, mb: 0.75 }}>
                          <PaymentsIcon sx={{ fontSize: 15, color: '#2e7d32' }} />
                          <Typography variant="caption" color="text.secondary" fontWeight={600} sx={{ textTransform: 'uppercase', letterSpacing: 0.4, fontSize: '0.68rem' }}>
                            Salaire
                          </Typography>
                        </Box>
                        <Typography variant="body1" fontWeight={700} color="text.primary">
                          {Number(contractDetail.salaire).toLocaleString('fr-FR')} MAD
                        </Typography>
                      </Box>
                    </Grid>
                  )}

                  {/* Statut */}
                  <Grid item xs={contractDetail.salaire ? 6 : 12}>
                    <Box sx={{ p: 2, bgcolor: dsc.bg, borderRadius: 2, border: `1px solid ${dsc.color}30`, height: '100%' }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, mb: 0.75 }}>
                        <BadgeIcon sx={{ fontSize: 15, color: dsc.color }} />
                        <Typography variant="caption" fontWeight={600} sx={{ textTransform: 'uppercase', letterSpacing: 0.4, fontSize: '0.68rem', color: dsc.color }}>
                          Statut du contrat
                        </Typography>
                      </Box>
                      <Typography variant="body1" fontWeight={700} sx={{ color: dsc.color }}>
                        {dsc.label}
                      </Typography>
                    </Box>
                  </Grid>

                </Grid>
              </DialogContent>

              <DialogActions sx={{ px: 3, pb: 2.5, gap: 1 }}>
                <Button onClick={() => setDetailDialogOpen(false)} sx={{ borderRadius: 2, textTransform: 'none', color: 'text.secondary' }}>
                  Fermer
                </Button>
              </DialogActions>
            </>
          );
        })()}
      </Dialog>

    </Box>
  );
};

export default ContractManagement;
