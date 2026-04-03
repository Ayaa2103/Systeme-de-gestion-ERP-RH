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
  Fab
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
  Phone as PhoneIcon
} from '@mui/icons-material';
import { DataGrid } from '@mui/x-data-grid';
import { useNavigate } from 'react-router-dom';
import { getEmployees, getDepartments, deleteEmployee } from '../../services/hrService';
import { useAuth } from '../../contexts/AuthContext';

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
        await fetchEmployees(); // Recharger la liste
        handleMenuClose();
      } catch (error) {
        console.error('Erreur lors de la suppression:', error);
        alert('Erreur lors de la suppression de l\'employé');
      }
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'actif': return 'success';
      case 'inactif': return 'error';
      case 'congé': return 'warning';
      default: return 'default';
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
            backgroundColor: '#1976d2',
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
          <Typography variant="body2" fontWeight="600">
            {params.row.user?.first_name} {params.row.user?.last_name}
          </Typography>
          <Typography variant="caption" color="text.secondary">
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
          <WorkIcon sx={{ mr: 1, fontSize: 16, color: 'text.secondary' }} />
          <Typography variant="body2">{params.row.poste}</Typography>
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
          <EmailIcon sx={{ mr: 1, fontSize: 16, color: 'text.secondary' }} />
          <Typography variant="body2">{params.row.user?.email}</Typography>
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
          color={getStatusColor(params.row.statut)}
          size="small"
          variant="outlined"
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
    <Box>
      {/* En-tête */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h4" fontWeight="bold" gutterBottom>
            Gestion des Employés
          </Typography>
          <Typography variant="body1" color="text.secondary">
            {employees.length} employés au total
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => navigate('/employees/create')}
          sx={{
            borderRadius: 2,
            px: 3,
            py: 1.5,
          }}
        >
          Nouvel Employé
        </Button>
      </Box>

      {/* Barre de recherche */}
      <Card elevation={0} sx={{ mb: 3, border: '1px solid #e0e0e0' }}>
        <CardContent>
          <TextField
            fullWidth
            placeholder="Rechercher un employé..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon color="action" />
                </InputAdornment>
              ),
            }}
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: 2,
              }
            }}
          />
        </CardContent>
      </Card>

      {/* Statistiques rapides */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={3}>
          <Card elevation={0} sx={{ border: '1px solid #e0e0e0', borderRadius: 2 }}>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="h4" color="primary" fontWeight="bold">
                {employees.filter(e => e.statut === 'actif').length}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Employés Actifs
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={3}>
          <Card elevation={0} sx={{ border: '1px solid #e0e0e0', borderRadius: 2 }}>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="h4" color="success.main" fontWeight="bold">
                {departments.length}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Départements
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={3}>
          <Card elevation={0} sx={{ border: '1px solid #e0e0e0', borderRadius: 2 }}>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="h4" color="warning.main" fontWeight="bold">
                {employees.filter(e => e.is_absent_today).length}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                En Congé
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={3}>
          <Card elevation={0} sx={{ border: '1px solid #e0e0e0', borderRadius: 2 }}>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="h4" color="info.main" fontWeight="bold">
                {employees.filter(e => e.onboarding_status === 'in_progress').length}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                En Intégration
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Table des employés */}
      <Card elevation={0} sx={{ border: '1px solid #e0e0e0', borderRadius: 2 }}>
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
              borderBottom: '1px solid #f0f0f0',
            },
            '& .MuiDataGrid-columnHeaders': {
              backgroundColor: '#f8fafc',
              borderBottom: '1px solid #e0e0e0',
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
          <PersonIcon sx={{ mr: 1 }} />
          Voir Détails
        </MenuItem>
        <MenuItem onClick={() => {
          navigate(`/employees/edit/${selectedEmployee?.id}`);
          handleMenuClose();
        }}>
          <EditIcon sx={{ mr: 1 }} />
          Modifier
        </MenuItem>
        {(user?.role === 'hr_manager' || user?.role === 'hr_director') && (
          <MenuItem onClick={() => {
            navigate(`/contracts?employee=${selectedEmployee?.id}`);
            handleMenuClose();
          }}>
            <WorkIcon sx={{ mr: 1 }} />
            Contrats
          </MenuItem>
        )}
        {user?.role === 'administrator' && (
          <MenuItem onClick={handleDeleteEmployee} sx={{ color: 'error.main' }}>
            <DeleteIcon sx={{ mr: 1 }} />
            Supprimer
          </MenuItem>
        )}
      </Menu>

      {/* FAB pour mobile */}
      <Fab
        color="primary"
        sx={{
          position: 'fixed',
          bottom: 16,
          right: 16,
          display: { xs: 'flex', md: 'none' }
        }}
        onClick={() => navigate('/employees/create')}
      >
        <AddIcon />
      </Fab>
    </Box>
  );
};

export default EmployeeList;