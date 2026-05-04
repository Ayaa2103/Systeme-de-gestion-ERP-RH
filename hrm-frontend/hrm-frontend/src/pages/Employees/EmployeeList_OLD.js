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
  Fab,
  Divider
} from '@mui/material';
import {
  Search as SearchIcon,
  Add as AddIcon,
  MoreVert as MoreVertIcon,
  Person as PersonIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Work as WorkIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  ArrowForwardIos as ArrowForwardIosIcon
} from '@mui/icons-material';
import { DataGrid } from '@mui/x-data-grid';
import { useNavigate } from 'react-router-dom';
import { getEmployees, getDepartments, deleteEmployee } from '../../services/hrService';
import { useAuth } from '../../contexts/AuthContext';

// Axelor-inspired color palette
const COLORS = {
  primary: '#0066CC',
  secondary: '#2A9D8F',
  accent: '#F59E0B',
  bgLight: '#F7FAFC',
  bgCard: '#FFFFFF',
  textDark: '#1A202C',
  textMuted: '#718096',
  borderLight: '#E2E8F0',
  successLight: '#D1E7DD',
  success: '#198754',
};

const EmployeeList = () => {
  const [employees, setEmployees] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    fetchEmployees();
    fetchDepartments();
  }, []);

  const fetchEmployees = async () => {
    try {
      const response = await getEmployees();
      setEmployees(response.data.results || response.data);
    } catch (error) {
      console.error('Erreur lors du chargement des employés:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchDepartments = async () => {
    try {
      const response = await getDepartments();
      setDepartments(response.data.results || response.data);
    } catch (error) {
      console.error('Erreur lors du chargement des départements:', error);
    }
  };

  const handleMenuClick = (event, employee) => {
    setAnchorEl(event.currentTarget);
    setSelectedEmployee(employee);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedEmployee(null);
  };

  const handleDeleteEmployee = async () => {
    if (window.confirm(`Êtes-vous sûr de vouloir supprimer ${selectedEmployee?.user?.first_name} ${selectedEmployee?.user?.last_name} ?`)) {
      try {
        await deleteEmployee(selectedEmployee.id);
        await fetchEmployees();
        handleMenuClose();
      } catch (error) {
        console.error('Erreur lors de la suppression:', error);
        alert('Erreur lors de la suppression de l\'employé');
      }
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'actif': return COLORS.success;
      case 'inactif': return '#dc3545';
      case 'congé': return COLORS.accent;
      default: return COLORS.textMuted;
    }
  };

  const columns = [
    {
      field: 'avatar',
      headerName: '',
      width: 60,
      renderCell: (params) => (
        <Avatar
          sx={{
            width: 40,
            height: 40,
            backgroundColor: COLORS.primary,
          }}
          src={params.row.photo ? `${process.env.REACT_APP_API_URL || 'http://localhost:8000'}${params.row.photo}` : undefined}
        >
          {!params.row.photo && (params.row.user?.first_name?.[0] || 'U')}
        </Avatar>
      ),
    },
    {
      field: 'full_name',
      headerName: 'Nom complet',
      width: 200,
      renderCell: (params) => (
        <Box>
          <Typography variant="body2" fontWeight="600" sx={{ color: COLORS.textDark }}>
            {params.row.user?.first_name} {params.row.user?.last_name}
          </Typography>
          <Typography variant="caption" sx={{ color: COLORS.textMuted }}>
            {params.row.matricule}
          </Typography>
        </Box>
      ),
    },
    {
      field: 'poste',
      headerName: 'Poste',
      width: 180,
      renderCell: (params) => (
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <WorkIcon sx={{ mr: 1, fontSize: 16, color: COLORS.primary }} />
          <Typography variant="body2" sx={{ color: COLORS.textDark }}>{params.row.poste}</Typography>
        </Box>
      ),
    },
    {
      field: 'department_name',
      headerName: 'Département',
      width: 150,
    },
    {
      field: 'email',
      headerName: 'Email',
      width: 200,
      renderCell: (params) => (
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <EmailIcon sx={{ mr: 1, fontSize: 16, color: COLORS.textMuted }} />
          <Typography variant="body2" sx={{ color: COLORS.textDark }}>{params.row.user?.email}</Typography>
        </Box>
      ),
    },
    {
      field: 'statut',
      headerName: 'Statut',
      width: 120,
      renderCell: (params) => (
        <Chip
          label={params.row.statut}
          sx={{
            backgroundColor: `${getStatusColor(params.row.statut)}20`,
            color: getStatusColor(params.row.statut),
            fontWeight: 600,
            border: `1px solid ${getStatusColor(params.row.statut)}40`
          }}
          size="small"
        />
      ),
    },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 100,
      renderCell: (params) => (
        <IconButton
          onClick={(e) => handleMenuClick(e, params.row)}
          size="small"
          sx={{ color: COLORS.textMuted }}
        >
          <MoreVertIcon />
        </IconButton>
      ),
    },
  ];

  const filteredEmployees = employees.filter(employee =>
    employee.user?.first_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    employee.user?.last_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    employee.matricule?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    employee.poste?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Box sx={{ backgroundColor: COLORS.bgLight, minHeight: '100vh', p: { xs: 2, sm: 3, md: 4 } }}>
      {/* Header */}
      <Box sx={{ mb: 6, display: 'flex', flexDirection: { xs: 'column', md: 'row' }, justifyContent: 'space-between', alignItems: { xs: 'stretch', md: 'flex-start' }, gap: 3 }}>
        <Box>
          <Typography
            variant="h3"
            sx={{
              color: COLORS.textDark,
              fontWeight: 800,
              fontSize: { xs: '1.75rem', md: '2.5rem' },
              letterSpacing: -0.5,
              mb: 1
            }}
          >
            Gestion des Employés
          </Typography>
          <Typography variant="body1" sx={{ color: COLORS.textMuted, fontSize: '1.05rem' }}>
            {employees.length} employés au total
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => navigate('/employees/create')}
          sx={{
            backgroundColor: COLORS.primary,
            px: 4,
            py: 1.8,
            borderRadius: 2,
            fontWeight: 700,
            textTransform: 'none',
            fontSize: '0.95rem',
            boxShadow: `0 4px 12px ${COLORS.primary}20`,
            '&:hover': {
              backgroundColor: '#0052A3',
              boxShadow: `0 8px 20px ${COLORS.primary}30`,
            }
          }}
        >
          Nouvel Employé
        </Button>
      </Box>

      {/* Barre de recherche */}
      <Card
        elevation={0}
        sx={{
          mb: 4,
          border: `1px solid ${COLORS.borderLight}`,
          borderRadius: 3,
          backgroundColor: COLORS.bgCard
        }}
      >
        <CardContent sx={{ p: 3 }}>
          <TextField
            fullWidth
            placeholder="Rechercher un employé..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon sx={{ color: COLORS.textMuted }} />
                </InputAdornment>
              ),
            }}
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: 2,
                '& fieldset': {
                  borderColor: COLORS.borderLight,
                },
              }
            }}
          />
        </CardContent>
      </Card>

      {/* Statistiques rapides */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card elevation={0} sx={{ border: `1px solid ${COLORS.borderLight}`, borderRadius: 3, backgroundColor: COLORS.bgCard }}>
            <CardContent sx={{ p: 3, textAlign: 'center' }}>
              <Typography variant="h4" sx={{ color: COLORS.primary, fontWeight: 700 }}>
                {employees.filter(e => e.statut === 'actif').length}
              </Typography>
              <Typography variant="body2" sx={{ color: COLORS.textMuted, mt: 1 }}>
                Employés Actifs
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card elevation={0} sx={{ border: `1px solid ${COLORS.borderLight}`, borderRadius: 3, backgroundColor: COLORS.bgCard }}>
            <CardContent sx={{ p: 3, textAlign: 'center' }}>
              <Typography variant="h4" sx={{ color: COLORS.secondary, fontWeight: 700 }}>
                {departments.length}
              </Typography>
              <Typography variant="body2" sx={{ color: COLORS.textMuted, mt: 1 }}>
                Départements
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card elevation={0} sx={{ border: `1px solid ${COLORS.borderLight}`, borderRadius: 3, backgroundColor: COLORS.bgCard }}>
            <CardContent sx={{ p: 3, textAlign: 'center' }}>
              <Typography variant="h4" sx={{ color: COLORS.accent, fontWeight: 700 }}>
                {employees.filter(e => e.is_absent_today).length}
              </Typography>
              <Typography variant="body2" sx={{ color: COLORS.textMuted, mt: 1 }}>
                En Congé
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card elevation={0} sx={{ border: `1px solid ${COLORS.borderLight}`, borderRadius: 3, backgroundColor: COLORS.bgCard }}>
            <CardContent sx={{ p: 3, textAlign: 'center' }}>
              <Typography variant="h4" sx={{ color: '#6C63FF', fontWeight: 700 }}>
                {employees.filter(e => e.onboarding_status === 'in_progress').length}
              </Typography>
              <Typography variant="body2" sx={{ color: COLORS.textMuted, mt: 1 }}>
                En Intégration
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Table des employés */}
      <Card elevation={0} sx={{ border: `1px solid ${COLORS.borderLight}`, borderRadius: 3, backgroundColor: COLORS.bgCard }}>
        <DataGrid
          rows={filteredEmployees}
          columns={columns}
          pageSize={10}
          rowsPerPageOptions={[10, 25, 50]}
          loading={loading}
          disableSelectionOnClick
          autoHeight
          sx={{
            border: 'none',
            '& .MuiDataGrid-cell': {
              borderBottom: `1px solid ${COLORS.borderLight}`,
            },
            '& .MuiDataGrid-columnHeaders': {
              backgroundColor: `${COLORS.bgLight}`,
              borderBottom: `1px solid ${COLORS.borderLight}`,
              fontWeight: 700,
              color: COLORS.textDark,
            },
          }}
        />
      </Card>

      {/* Menu contextuel */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={() => {
          navigate(`/employees/${selectedEmployee?.id}`);
          handleMenuClose();
        }}>
          <PersonIcon sx={{ mr: 1.5, fontSize: 18, color: COLORS.primary }} />
          Voir Détails
        </MenuItem>
        <MenuItem onClick={() => {
          navigate(`/employees/edit/${selectedEmployee?.id}`);
          handleMenuClose();
        }}>
          <EditIcon sx={{ mr: 1.5, fontSize: 18, color: COLORS.secondary }} />
          Modifier
        </MenuItem>
        {(user?.role === 'hr_manager' || user?.role === 'hr_director' || user?.role === 'administrator') && (
          <MenuItem onClick={() => {
            navigate(`/contracts?employee=${selectedEmployee?.id}`);
            handleMenuClose();
          }}>
            <WorkIcon sx={{ mr: 1.5, fontSize: 18, color: COLORS.accent }} />
            Contrats
          </MenuItem>
        )}
        {user?.role === 'administrator' && (
          <>
            <Divider sx={{ my: 1 }} />
            <MenuItem onClick={handleDeleteEmployee} sx={{ color: '#dc3545' }}>
              <DeleteIcon sx={{ mr: 1.5, fontSize: 18 }} />
              Supprimer
            </MenuItem>
          </>
        )}
      </Menu>

      {/* FAB pour mobile */}
      <Fab
        color="primary"
        sx={{
          position: 'fixed',
          bottom: 16,
          right: 16,
          display: { xs: 'flex', md: 'none' },
          backgroundColor: COLORS.primary,
          boxShadow: `0 4px 12px ${COLORS.primary}30`,
        }}
        onClick={() => navigate('/employees/create')}
      >
        <AddIcon />
      </Fab>
    </Box>
  );
};

export default EmployeeList;
