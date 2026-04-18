import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  TextField,
  InputAdornment,
  Chip,
  Avatar,
  IconButton,
  Menu,
  MenuItem,
  Grid,
  Select,
  FormControl,
  InputLabel,
  Tooltip,
  Skeleton,
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
} from '@mui/icons-material';
import { DataGrid } from '@mui/x-data-grid';
import { useNavigate } from 'react-router-dom';
import { getEmployees, getDepartments, deleteEmployee } from '../../services/hrService';
import { useAuth } from '../../contexts/AuthContext';

/* ─── Stat card ─────────────────────────────────────────────────── */
const StatCard = ({ label, value, icon, color, loading }) => (
  <Card elevation={0} sx={{ border: '1px solid', borderColor: `${color}20`, borderRadius: 2 }}>
    <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
        <Avatar sx={{ bgcolor: `${color}15`, width: 40, height: 40 }}>
          {React.cloneElement(icon, { sx: { color, fontSize: 20 } })}
        </Avatar>
        <Box>
          {loading ? <Skeleton width={32} height={28} /> : (
            <Typography variant="h5" fontWeight={700} sx={{ color, lineHeight: 1 }}>
              {value}
            </Typography>
          )}
          <Typography variant="caption" color="text.secondary">{label}</Typography>
        </Box>
      </Box>
    </CardContent>
  </Card>
);

/* ─── Avatar coloré par initiale ────────────────────────────────── */
const COLORS = ['#1976d2', '#9c27b0', '#2e7d32', '#e65100', '#0097a7', '#c62828'];
const avatarColor = (name = '') => COLORS[name.charCodeAt(0) % COLORS.length];

/* ─── Main ───────────────────────────────────────────────────────── */
const EmployeeList = () => {
  const [employees, setEmployees] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterDept, setFilterDept] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    Promise.allSettled([fetchEmployees(), fetchDepartments()]);
  }, []);

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

  const handleMenuOpen = (e, emp) => { setAnchorEl(e.currentTarget); setSelectedEmployee(emp); };
  const handleMenuClose = () => { setAnchorEl(null); setSelectedEmployee(null); };

  const handleDelete = async () => {
    if (!window.confirm(`Supprimer ${selectedEmployee?.user?.first_name} ${selectedEmployee?.user?.last_name} ?`)) return;
    try {
      await deleteEmployee(selectedEmployee.id);
      setEmployees(prev => prev.filter(e => e.id !== selectedEmployee.id));
    } catch (_) {
      alert("Erreur lors de la suppression.");
    } finally {
      handleMenuClose();
    }
  };

  const getStatusChip = (status) => {
    const map = {
      actif:   { label: 'Actif',   color: '#2e7d32', bg: '#e8f5e9' },
      inactif: { label: 'Inactif', color: '#c62828', bg: '#ffebee' },
      congé:   { label: 'Congé',   color: '#e65100', bg: '#fff3e0' },
    };
    const s = map[status] || { label: status, color: '#757575', bg: '#f5f5f5' };
    return (
      <Chip
        label={s.label}
        size="small"
        sx={{ bgcolor: s.bg, color: s.color, fontWeight: 600, fontSize: '0.7rem', border: `1px solid ${s.color}30` }}
      />
    );
  };

  const filtered = employees.filter(emp => {
    const q = searchTerm.toLowerCase();
    const matchSearch =
      emp.user?.first_name?.toLowerCase().includes(q) ||
      emp.user?.last_name?.toLowerCase().includes(q) ||
      emp.matricule?.toLowerCase().includes(q) ||
      emp.poste?.toLowerCase().includes(q);
    const matchDept = !filterDept || emp.department_name === filterDept;
    const matchStatus = !filterStatus || emp.statut === filterStatus;
    return matchSearch && matchDept && matchStatus;
  });

  const columns = [
    {
      field: 'employee',
      headerName: 'Employé',
      flex: 1.4,
      minWidth: 200,
      renderCell: ({ row }) => {
        const name = `${row.user?.first_name || ''} ${row.user?.last_name || ''}`.trim();
        return (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, py: 0.5 }}>
            <Avatar
              src={row.photo ? `${process.env.REACT_APP_API_URL || 'http://localhost:8000'}${row.photo}` : undefined}
              sx={{ width: 36, height: 36, bgcolor: avatarColor(name), fontSize: '0.85rem', fontWeight: 700 }}
            >
              {!row.photo && (row.user?.first_name?.[0] || 'U')}
            </Avatar>
            <Box>
              <Typography variant="body2" fontWeight={600} sx={{ lineHeight: 1.3 }}>{name}</Typography>
              <Typography variant="caption" color="text.secondary">{row.matricule}</Typography>
            </Box>
          </Box>
        );
      },
    },
    {
      field: 'poste',
      headerName: 'Poste',
      flex: 1.2,
      minWidth: 150,
      renderCell: ({ row }) => (
        <Typography variant="body2" color="text.secondary" noWrap>{row.poste || '—'}</Typography>
      ),
    },
    {
      field: 'department_name',
      headerName: 'Département',
      flex: 1,
      minWidth: 130,
      renderCell: ({ row }) => (
        <Typography variant="body2" noWrap>{row.department_name || '—'}</Typography>
      ),
    },
    {
      field: 'email',
      headerName: 'Email',
      flex: 1.3,
      minWidth: 180,
      renderCell: ({ row }) => (
        <Typography variant="body2" color="text.secondary" noWrap>{row.user?.email || '—'}</Typography>
      ),
    },
    {
      field: 'statut',
      headerName: 'Statut',
      width: 110,
      renderCell: ({ row }) => getStatusChip(row.statut),
    },
    {
      field: 'actions',
      headerName: '',
      width: 56,
      sortable: false,
      renderCell: ({ row }) => (
        <IconButton size="small" onClick={(e) => { e.stopPropagation(); handleMenuOpen(e, row); }}>
          <MoreVertIcon fontSize="small" />
        </IconButton>
      ),
    },
  ];

  return (
    <Box sx={{ maxWidth: 1200 }}>

      {/* En-tête */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3 }}>
        <Box>
          <Typography variant="h5" fontWeight={700} gutterBottom>
            Gestion des Employés
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {employees.length} employé{employees.length > 1 ? 's' : ''} enregistré{employees.length > 1 ? 's' : ''}
          </Typography>
        </Box>
        {(user?.role === 'hr_manager' || user?.role === 'administrator') && (
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => navigate('/employees/create')}
            sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 600, px: 2.5 }}
          >
            Nouvel Employé
          </Button>
        )}
      </Box>

      {/* Stats */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={6} sm={3}>
          <StatCard label="Total" value={employees.length} icon={<PeopleIcon />} color="#1976d2" loading={loading} />
        </Grid>
        <Grid item xs={6} sm={3}>
          <StatCard label="Actifs" value={employees.filter(e => e.statut === 'actif').length} icon={<ActiveIcon />} color="#2e7d32" loading={loading} />
        </Grid>
        <Grid item xs={6} sm={3}>
          <StatCard label="En congé" value={employees.filter(e => e.is_absent_today).length} icon={<LeaveIcon />} color="#e65100" loading={loading} />
        </Grid>
        <Grid item xs={6} sm={3}>
          <StatCard label="En intégration" value={employees.filter(e => e.onboarding_status === 'in_progress').length} icon={<OnboardingIcon />} color="#9c27b0" loading={loading} />
        </Grid>
      </Grid>

      {/* Barre de recherche + filtres */}
      <Card elevation={0} sx={{ mb: 2, border: '1px solid #e8ecf0', borderRadius: 2 }}>
        <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} sm={5}>
              <TextField
                fullWidth
                size="small"
                placeholder="Rechercher par nom, matricule, poste…"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                InputProps={{
                  startAdornment: <InputAdornment position="start"><SearchIcon fontSize="small" color="action" /></InputAdornment>,
                }}
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
              />
            </Grid>
            <Grid item xs={6} sm={3}>
              <FormControl fullWidth size="small">
                <InputLabel>Département</InputLabel>
                <Select
                  value={filterDept}
                  label="Département"
                  onChange={(e) => setFilterDept(e.target.value)}
                  sx={{ borderRadius: 2 }}
                >
                  <MenuItem value="">Tous</MenuItem>
                  {departments.map((d) => (
                    <MenuItem key={d.id} value={d.name}>{d.name}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={6} sm={3}>
              <FormControl fullWidth size="small">
                <InputLabel>Statut</InputLabel>
                <Select
                  value={filterStatus}
                  label="Statut"
                  onChange={(e) => setFilterStatus(e.target.value)}
                  sx={{ borderRadius: 2 }}
                >
                  <MenuItem value="">Tous</MenuItem>
                  <MenuItem value="actif">Actif</MenuItem>
                  <MenuItem value="inactif">Inactif</MenuItem>
                  <MenuItem value="congé">Congé</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={1}>
              <Typography variant="caption" color="text.secondary">
                {filtered.length} résultat{filtered.length > 1 ? 's' : ''}
              </Typography>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Table */}
      <Card elevation={0} sx={{ border: '1px solid #e8ecf0', borderRadius: 2 }}>
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
            border: 'none',
            cursor: 'pointer',
            '& .MuiDataGrid-columnHeaders': {
              bgcolor: '#f8fafc',
              borderBottom: '1px solid #e8ecf0',
              fontSize: '0.78rem',
              fontWeight: 700,
              color: '#64748b',
              textTransform: 'uppercase',
              letterSpacing: 0.5,
            },
            '& .MuiDataGrid-row': {
              '&:hover': { bgcolor: '#f8fafc' },
            },
            '& .MuiDataGrid-cell': {
              borderBottom: '1px solid #f1f5f9',
              outline: 'none !important',
            },
            '& .MuiDataGrid-cell:focus': { outline: 'none' },
          }}
        />
      </Card>

      {/* Menu contextuel */}
      <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleMenuClose}
        PaperProps={{ elevation: 2, sx: { borderRadius: 2, minWidth: 170 } }}
      >
        <MenuItem onClick={() => { navigate(`/employees/${selectedEmployee?.id}`); handleMenuClose(); }}>
          <ViewIcon sx={{ mr: 1.5, fontSize: 18, color: 'text.secondary' }} />
          <Typography variant="body2">Voir le profil</Typography>
        </MenuItem>
        <MenuItem onClick={() => { navigate(`/employees/edit/${selectedEmployee?.id}`); handleMenuClose(); }}>
          <EditIcon sx={{ mr: 1.5, fontSize: 18, color: 'text.secondary' }} />
          <Typography variant="body2">Modifier</Typography>
        </MenuItem>
        {(user?.role === 'hr_manager' || user?.role === 'hr_director') && (
          <MenuItem onClick={() => { navigate(`/contracts?employee=${selectedEmployee?.id}`); handleMenuClose(); }}>
            <WorkIcon sx={{ mr: 1.5, fontSize: 18, color: 'text.secondary' }} />
            <Typography variant="body2">Contrats</Typography>
          </MenuItem>
        )}
        {user?.role === 'administrator' && (
          <MenuItem onClick={handleDelete} sx={{ color: 'error.main' }}>
            <DeleteIcon sx={{ mr: 1.5, fontSize: 18 }} />
            <Typography variant="body2">Supprimer</Typography>
          </MenuItem>
        )}
      </Menu>
    </Box>
  );
};

export default EmployeeList;
