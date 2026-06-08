import React, { useState, useEffect } from 'react';
import {
  Box, Card, CardContent, Typography, Button, TextField, InputAdornment,
  Chip, Avatar, IconButton, Menu, MenuItem, Grid, Select, FormControl,
  InputLabel, Tooltip, Skeleton,
} from '@mui/material';
import {
  Search as SearchIcon,
  Add as AddIcon,
  MoreVert as MoreVertIcon,
  Person as PersonIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Work as WorkIcon,
  People as PeopleIcon,
  CheckCircle as ActiveIcon,
  BeachAccess as LeaveIcon,
  HourglassEmpty as OnboardingIcon,
  Visibility as ViewIcon,
  ArrowBack as BackIcon,
  FilterList as FilterIcon,
} from '@mui/icons-material';
import { DataGrid } from '@mui/x-data-grid';
import { useNavigate } from 'react-router-dom';
import { getEmployees, getDepartments, deleteEmployee } from '../../services/hrService';
import { useAuth } from '../../contexts/AuthContext';

const COLORS = ['#1976d2', '#9c27b0', '#2e7d32', '#e65100', '#0097a7', '#c62828'];
const avatarColor = (name = '') => COLORS[(name.charCodeAt(0) || 0) % COLORS.length];

const statusMap = {
  actif:   { label: 'Actif',   color: '#2e7d32', bg: '#e8f5e9' },
  inactif: { label: 'Inactif', color: '#c62828', bg: '#ffebee' },
  'congé': { label: 'Congé',   color: '#e65100', bg: '#fff3e0' },
};

const StatCard = ({ label, value, icon, color, loading }) => (
  <Card elevation={0} sx={{ border: '1px solid', borderColor: `${color}20`, borderRadius: 3, height: '100%',
    transition: 'all 0.2s', '&:hover': { boxShadow: `0 4px 16px ${color}12`, borderColor: `${color}40` } }}>
    <CardContent sx={{ p: 2.5 }}>
      <Avatar sx={{ bgcolor: `${color}12`, width: 38, height: 38, mb: 1.5 }}>
        {React.cloneElement(icon, { sx: { color, fontSize: 18 } })}
      </Avatar>
      {loading ? <Skeleton width={40} height={32} /> : (
        <Typography variant="h4" fontWeight={800} sx={{ color, lineHeight: 1 }}>{value}</Typography>
      )}
      <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>{label}</Typography>
    </CardContent>
  </Card>
);

const EmployeeList = () => {
  const [employees, setEmployees]       = useState([]);
  const [departments, setDepartments]   = useState([]);
  const [loading, setLoading]           = useState(true);
  const [searchTerm, setSearchTerm]     = useState('');
  const [filterDept, setFilterDept]     = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [anchorEl, setAnchorEl]         = useState(null);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => { Promise.allSettled([fetchEmployees(), fetchDepartments()]); }, []);

  const fetchEmployees = async () => {
    try {
      const res = await getEmployees();
      setEmployees(res.data.results || res.data);
    } catch (_) {}
    finally { setLoading(false); }
  };

  const fetchDepartments = async () => {
    try {
      const res = await getDepartments();
      setDepartments(res.data.results || res.data);
    } catch (_) {}
  };

  const handleMenuOpen  = (e, emp) => { setAnchorEl(e.currentTarget); setSelectedEmployee(emp); };
  const handleMenuClose = () => { setAnchorEl(null); setSelectedEmployee(null); };

  const handleDelete = async () => {
    if (!window.confirm(`Supprimer ${selectedEmployee?.user?.first_name} ${selectedEmployee?.user?.last_name} ?`)) return;
    try {
      await deleteEmployee(selectedEmployee.id);
      setEmployees(p => p.filter(e => e.id !== selectedEmployee.id));
    } catch (_) {}
    finally { handleMenuClose(); }
  };

  const filtered = employees.filter(emp => {
    const q = searchTerm.toLowerCase();
    const matchSearch =
      emp.user?.first_name?.toLowerCase().includes(q) ||
      emp.user?.last_name?.toLowerCase().includes(q) ||
      emp.matricule?.toLowerCase().includes(q) ||
      emp.poste?.toLowerCase().includes(q);
    return matchSearch &&
      (!filterDept   || emp.department_name === filterDept) &&
      (!filterStatus || emp.statut === filterStatus);
  });

  const columns = [
    {
      field: 'employee', headerName: 'Employé', flex: 1.4, minWidth: 200,
      renderCell: ({ row }) => {
        const name = `${row.user?.first_name || ''} ${row.user?.last_name || ''}`.trim();
        return (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, py: 0.5 }}>
            <Avatar
              src={row.photo ? `${process.env.REACT_APP_API_URL || 'http://localhost:8000'}${row.photo}` : undefined}
              sx={{ width: 34, height: 34, bgcolor: avatarColor(name), fontSize: '0.8rem', fontWeight: 700 }}>
              {!row.photo && (row.user?.first_name?.[0] || 'U')}
            </Avatar>
            <Box>
              <Typography sx={{ fontSize: '0.85rem', fontWeight: 600, color: '#1e293b', lineHeight: 1.3 }}>{name}</Typography>
              <Typography variant="caption" color="text.secondary">{row.matricule}</Typography>
            </Box>
          </Box>
        );
      },
    },
    {
      field: 'poste', headerName: 'Poste', flex: 1.2, minWidth: 150,
      renderCell: ({ row }) => <Typography sx={{ fontSize: '0.82rem', color: '#475569' }} noWrap>{row.poste || '—'}</Typography>,
    },
    {
      field: 'department_name', headerName: 'Département', flex: 1, minWidth: 130,
      renderCell: ({ row }) => (
        row.department_name
          ? <Chip label={row.department_name} size="small" sx={{ bgcolor: '#eff6ff', color: '#1976d2', fontWeight: 600, fontSize: '0.7rem', height: 22 }} />
          : <Typography sx={{ fontSize: '0.82rem', color: '#94a3b8' }}>—</Typography>
      ),
    },
    {
      field: 'email', headerName: 'Email', flex: 1.3, minWidth: 180,
      renderCell: ({ row }) => <Typography sx={{ fontSize: '0.8rem', color: '#64748b' }} noWrap>{row.user?.email || '—'}</Typography>,
    },
    {
      field: 'statut', headerName: 'Statut', width: 115,
      renderCell: ({ row }) => {
        const s = statusMap[row.statut] || { label: row.statut, color: '#757575', bg: '#f5f5f5' };
        return <Chip label={s.label} size="small"
          sx={{ bgcolor: s.bg, color: s.color, fontWeight: 700, fontSize: '0.7rem', border: `1px solid ${s.color}30`, height: 22 }} />;
      },
    },
    {
      field: 'actions', headerName: '', width: 50, sortable: false,
      renderCell: ({ row }) => (
        <IconButton size="small" onClick={(e) => { e.stopPropagation(); handleMenuOpen(e, row); }}>
          <MoreVertIcon sx={{ fontSize: 18 }} />
        </IconButton>
      ),
    },
  ];

  return (
    <Box sx={{ width: '100%' }}>

      {/* Banner */}
      <Card elevation={0} sx={{ borderRadius: 3, border: '1px solid #e8ecf0', mb: 3, overflow: 'hidden' }}>
        <Box sx={{ background: 'linear-gradient(135deg,#0f172a 0%,#1e3a5f 60%,#1e40af 100%)',
          px: 3, py: 2.5, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
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
              <Typography variant="h5" fontWeight={700} color="white">Gestion des Employés</Typography>
              <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.65)', mt: 0.3 }}>
                {employees.length} employé{employees.length !== 1 ? 's' : ''} enregistré{employees.length !== 1 ? 's' : ''}
              </Typography>
            </Box>
          </Box>
          {user?.role === 'hr_manager' && (
            <Button variant="contained" startIcon={<AddIcon />} onClick={() => navigate('/employees/create')}
              sx={{ bgcolor: 'rgba(255,255,255,0.15)', color: 'white', border: '1px solid rgba(255,255,255,0.25)',
                borderRadius: 2, textTransform: 'none', fontWeight: 600, '&:hover': { bgcolor: 'rgba(255,255,255,0.25)' } }}>
              Nouvel Employé
            </Button>
          )}
        </Box>
      </Card>

      {/* Stats */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={6} sm={3}>
          <StatCard label="Total" value={employees.length} icon={<PeopleIcon />} color="#1976d2" loading={loading} />
        </Grid>
        <Grid item xs={6} sm={3}>
          <StatCard label="Actifs" value={employees.filter(e => e.statut === 'actif').length} icon={<ActiveIcon />} color="#2e7d32" loading={loading} />
        </Grid>
        <Grid item xs={6} sm={3}>
          <StatCard label="En congé" value={employees.filter(e => e.statut === 'congé' || e.is_absent_today).length} icon={<LeaveIcon />} color="#e65100" loading={loading} />
        </Grid>
        <Grid item xs={6} sm={3}>
          <StatCard label="En intégration" value={employees.filter(e => e.onboarding_status === 'in_progress').length} icon={<OnboardingIcon />} color="#9c27b0" loading={loading} />
        </Grid>
      </Grid>

      {/* Search + Filters */}
      <Card elevation={0} sx={{ mb: 2, border: '1px solid #e8ecf0', borderRadius: 3 }}>
        <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center' }}>
            <TextField fullWidth size="small" placeholder="Rechercher par nom, matricule, poste…"
              value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
              sx={{ flex: 1, minWidth: 220, '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
              InputProps={{ startAdornment: <InputAdornment position="start"><SearchIcon sx={{ fontSize: 17, color: '#94a3b8' }} /></InputAdornment> }} />
            <FormControl size="small" sx={{ minWidth: 160 }}>
              <InputLabel>Département</InputLabel>
              <Select value={filterDept} label="Département" onChange={(e) => setFilterDept(e.target.value)} sx={{ borderRadius: 2 }}>
                <MenuItem value="">Tous</MenuItem>
                {departments.map(d => <MenuItem key={d.id} value={d.name}>{d.name}</MenuItem>)}
              </Select>
            </FormControl>
            <FormControl size="small" sx={{ minWidth: 140 }}>
              <InputLabel>Statut</InputLabel>
              <Select value={filterStatus} label="Statut" onChange={(e) => setFilterStatus(e.target.value)} sx={{ borderRadius: 2 }}>
                <MenuItem value="">Tous</MenuItem>
                <MenuItem value="actif">Actif</MenuItem>
                <MenuItem value="inactif">Inactif</MenuItem>
                <MenuItem value="congé">Congé</MenuItem>
              </Select>
            </FormControl>
            <Chip label={`${filtered.length} résultat${filtered.length !== 1 ? 's' : ''}`} size="small"
              sx={{ bgcolor: '#eff6ff', color: '#1976d2', fontWeight: 600, border: '1px solid #bfdbfe' }} />
          </Box>
        </CardContent>
      </Card>

      {/* DataGrid */}
      <Card elevation={0} sx={{ border: '1px solid #e8ecf0', borderRadius: 3, overflow: 'hidden' }}>
        <DataGrid
          rows={filtered}
          columns={columns}
          initialState={{ pagination: { paginationModel: { pageSize: 10 } } }}
          pageSizeOptions={[10, 25, 50]}
          loading={loading}
          disableRowSelectionOnClick
          autoHeight
          onRowClick={({ row }) => navigate(`/employees/${row.id}`)}
          sx={{
            border: 'none', cursor: 'pointer',
            '& .MuiDataGrid-columnHeaders': {
              bgcolor: '#f8fafc', borderBottom: '2px solid #e8ecf0',
              fontSize: '0.71rem', fontWeight: 700, color: '#475569',
              textTransform: 'uppercase', letterSpacing: '0.5px',
            },
            '& .MuiDataGrid-row:hover': { bgcolor: '#f8fafc' },
            '& .MuiDataGrid-cell': { borderBottom: '1px solid #f1f5f9', outline: 'none !important' },
            '& .MuiDataGrid-cell:focus': { outline: 'none' },
            '& .MuiDataGrid-footerContainer': { borderTop: '1px solid #e8ecf0', bgcolor: '#f8fafc' },
          }}
        />
      </Card>

      {/* Context menu */}
      <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleMenuClose}
        PaperProps={{ elevation: 0, sx: { border: '1px solid #e8ecf0', borderRadius: 2, minWidth: 175 } }}>
        <MenuItem onClick={() => { navigate(`/employees/${selectedEmployee?.id}`); handleMenuClose(); }} sx={{ fontSize: '0.875rem', gap: 1.5 }}>
          <ViewIcon sx={{ fontSize: 17, color: '#1976d2' }} /> Voir le profil
        </MenuItem>
        {user?.role !== 'administrator' && (
          <MenuItem onClick={() => { navigate(`/employees/edit/${selectedEmployee?.id}`); handleMenuClose(); }} sx={{ fontSize: '0.875rem', gap: 1.5 }}>
            <EditIcon sx={{ fontSize: 17, color: '#475569' }} /> Modifier
          </MenuItem>
        )}
        {(user?.role === 'hr_manager' || user?.role === 'hr_director') && (
          <MenuItem onClick={() => { navigate(`/contracts?employee=${selectedEmployee?.id}`); handleMenuClose(); }} sx={{ fontSize: '0.875rem', gap: 1.5 }}>
            <WorkIcon sx={{ fontSize: 17, color: '#475569' }} /> Contrats
          </MenuItem>
        )}
        {user?.role === 'administrator' && (
          <MenuItem onClick={handleDelete} sx={{ fontSize: '0.875rem', gap: 1.5, color: '#c62828' }}>
            <DeleteIcon sx={{ fontSize: 17 }} /> Supprimer
          </MenuItem>
        )}
      </Menu>
    </Box>
  );
};

export default EmployeeList;
