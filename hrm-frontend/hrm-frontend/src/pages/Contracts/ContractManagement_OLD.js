import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, useParams } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Grid,
  Chip,
  Avatar,
  IconButton,
  Menu,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  Alert,
  Tabs,
  Tab
} from '@mui/material';
import {
  Add as AddIcon,
  Assignment as AssignmentIcon,
  MoreVert as MoreVertIcon,
  Edit as EditIcon,
  Refresh as RefreshIcon,
  Warning as WarningIcon,
  CheckCircle as CheckCircleIcon,
  Person as PersonIcon
} from '@mui/icons-material';
import { DataGrid } from '@mui/x-data-grid';
import { format } from 'date-fns';
import { getContracts, createContract, getExpiringContracts, getEmployees, getContractDetail, updateContract, renewContract } from '../../services/hrService';

const ContractManagement = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const { id: routeEmployeeId } = useParams(); // For /employees/:id/create-contract
  const employeeId = searchParams.get('employee') || routeEmployeeId;
  const [contracts, setContracts] = useState([]);
  const [filteredContracts, setFilteredContracts] = useState([]);
  const [expiringContracts, setExpiringContracts] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [tabValue, setTabValue] = useState(0);
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedContract, setSelectedContract] = useState(null);

  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [contractDetail, setContractDetail] = useState(null);

  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [formData, setFormData] = useState({
    employee: '',
    type: 'CDI',
    date_debut: '',
    date_fin: '',
    salaire: ''
  });

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (employeeId && employees.length > 0 && (user?.role === 'hr_manager' || user?.role === 'hr_director')) {
      setFormData((prev) => ({ ...prev, employee: employeeId }));
      setCreateDialogOpen(true);
    }
  }, [employeeId, employees, user?.role]);
  


  const fetchData = async () => {
    try {
      const [contractsRes, expiringRes, employeesRes] = await Promise.all([
        getContracts(),
        getExpiringContracts(),
        getEmployees()
      ]);

      const contractsData = contractsRes.data.results || contractsRes.data;
      setContracts(contractsData);
      setFilteredContracts(contractsData);
      setExpiringContracts(expiringRes.data.results || expiringRes.data);
      setEmployees(employeesRes.data.results || employeesRes.data);
    } catch (error) {
      console.error('Erreur lors du chargement:', error);
      setError('Erreur lors du chargement des données');
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (filter) => {
    setStatusFilter(filter);
    let filtered = contracts;
    
    switch (filter) {
      case 'active':
        filtered = contracts.filter(c => c.active);
        break;
      case 'inactive':
        filtered = contracts.filter(c => !c.active);
        break;
      case 'expiring':
        filtered = contracts.filter(c => c.is_expiring_soon);
        break;
      case 'expired':
        filtered = contracts.filter(c => c.is_expired);
        break;
      case 'cdi':
        filtered = contracts.filter(c => c.type === 'CDI');
        break;
      case 'cdd':
        filtered = contracts.filter(c => c.type === 'CDD');
        break;
      case 'stage':
        filtered = contracts.filter(c => c.type === 'Stage');
        break;
      default:
        filtered = contracts;
    }
    
    setFilteredContracts(filtered);
  };

  const handleCreateContract = async () => {
    try {
      setError('');
      
      // Validation côté client
      if (!formData.employee || !formData.date_debut) {
        setError('Veuillez remplir tous les champs obligatoires');
        return;
      }
      
      const contractData = {
        employee: parseInt(formData.employee),
        type: formData.type,
        date_debut: formData.date_debut,
        date_fin: formData.date_fin || null,
        salaire: formData.salaire ? parseFloat(formData.salaire) : null,
        active: true
      };
      
      await createContract(contractData);
      setSuccess('Contrat créé avec succès!');
      await fetchData();
      setCreateDialogOpen(false);
      setFormData({
        employee: '',
        type: 'CDI',
        date_debut: '',
        date_fin: '',
        salaire: ''
      });
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      console.error('Erreur création contrat:', error);
      setError(error.response?.data?.error || error.response?.data?.message || 'Erreur lors de la création du contrat');
    }
  };

  const handleMenuClick = (event, contract) => {
    setAnchorEl(event.currentTarget);
    setSelectedContract(contract);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedContract(null);
  };

  const handleViewDetails = async (contract) => {
    try {
      const response = await getContractDetail(contract.id);
      setContractDetail(response.data);
      setDetailDialogOpen(true);
    } catch (error) {
      setError('Erreur lors du chargement des détails');
    }
    handleMenuClose();
  };

  const handleEditContract = (contract) => {
    if (user?.role === 'hr_manager') {
      navigate(`/contracts/${contract.id}/edit`);
    }
    handleMenuClose();
  };

  const handleRenewContract = (contract) => {
    if (user?.role === 'hr_manager') {
      navigate(`/contracts/${contract.id}/renew`);
    }
    handleMenuClose();
  };



  const getContractTypeColor = (type) => {
    switch (type) {
      case 'CDI': return 'success';
      case 'CDD': return 'warning';
      case 'Stage': return 'info';
      default: return 'default';
    }
  };

  const getStatusColor = (contract) => {
    if (contract.is_expired) return 'error';
    if (contract.is_expiring_soon) return 'warning';
    if (contract.active) return 'success';
    return 'default';
  };

  const getStatusLabel = (contract) => {
    if (contract.is_expired) return 'Expiré';
    if (contract.is_expiring_soon) return 'Expire bientôt';
    if (contract.active) return 'Actif';
    return 'Inactif';
  };

  const columns = [
    {
      field: 'employee_name',
      headerName: 'Employé',
      width: 200,
      renderCell: (params) => {
        const photoUrl = params.row.employee_photo ? 
          `http://localhost:8000${params.row.employee_photo}` : null;
        
        return (
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Avatar 
              src={photoUrl}
              sx={{ 
                mr: 1, 
                width: 32, 
                height: 32, 
                backgroundColor: '#1976d2',
                fontSize: '14px'
              }}
            >
              {!photoUrl && (params.row.employee_name?.charAt(0) || 'U')}
            </Avatar>
            <Box>
              <Typography variant="body2" fontWeight="600">
                {params.row.employee_name}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {params.row.employee_matricule}
              </Typography>
            </Box>
          </Box>
        );
      },
    },
    {
      field: 'type',
      headerName: 'Type',
      width: 100,
      renderCell: (params) => (
        <Chip
          label={params.row.type}
          color={getContractTypeColor(params.row.type)}
          size="small"
        />
      ),
    },
    {
      field: 'date_debut',
      headerName: 'Date début',
      width: 120,
      renderCell: (params) => (
        <Typography variant="body2">
          {format(new Date(params.row.date_debut), 'dd/MM/yyyy')}
        </Typography>
      ),
    },
    {
      field: 'date_fin',
      headerName: 'Date fin',
      width: 120,
      renderCell: (params) => (
        <Typography variant="body2">
          {params.row.date_fin ? format(new Date(params.row.date_fin), 'dd/MM/yyyy') : 'Indéterminée'}
        </Typography>
      ),
    },
    {
      field: 'salaire',
      headerName: 'Salaire',
      width: 120,
      renderCell: (params) => (
        <Typography variant="body2">
          {params.row.salaire ? `${params.row.salaire} €` : 'Non défini'}
        </Typography>
      ),
    },
    {
      field: 'status',
      headerName: 'Statut',
      width: 120,
      renderCell: (params) => (
        <Chip
          label={getStatusLabel(params.row)}
          color={getStatusColor(params.row)}
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

  return (
    <Box>
      {/* En-tête */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h4" fontWeight="bold" gutterBottom>
            Gestion des Contrats
          </Typography>
          <Typography variant="body1" color="text.secondary">
            {filteredContracts.length} contrats affichés sur {contracts.length} au total
          </Typography>
        </Box>
        {user?.role === 'hr_manager' && (
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setCreateDialogOpen(true)}
            sx={{ borderRadius: 2, px: 3, py: 1.5 }}
          >
            Nouveau Contrat
          </Button>
        )}
      </Box>

      {/* Alertes */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}
      
      {success && (
        <Alert severity="success" sx={{ mb: 3 }}>
          {success}
        </Alert>
      )}

      {/* Statistiques */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={3}>
          <Card elevation={0} sx={{ border: '1px solid #e0e0e0', borderRadius: 2 }}>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="h4" color="primary" fontWeight="bold">
                {contracts.filter(c => c.active).length}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Contrats Actifs
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={3}>
          <Card elevation={0} sx={{ border: '1px solid #e0e0e0', borderRadius: 2 }}>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="h4" color="success.main" fontWeight="bold">
                {contracts.filter(c => c.type === 'CDI').length}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                CDI
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={3}>
          <Card elevation={0} sx={{ border: '1px solid #e0e0e0', borderRadius: 2 }}>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="h4" color="warning.main" fontWeight="bold">
                {contracts.filter(c => c.type === 'CDD').length}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                CDD
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={3}>
          <Card elevation={0} sx={{ border: '1px solid #e0e0e0', borderRadius: 2 }}>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="h4" color="error.main" fontWeight="bold">
                {expiringContracts.length}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Expirent bientôt
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Filtres */}
      <Card elevation={0} sx={{ border: '1px solid #e0e0e0', borderRadius: 2, mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>Filtres</Typography>
          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
            <Button
              variant={statusFilter === 'all' ? 'contained' : 'outlined'}
              size="small"
              onClick={() => handleFilterChange('all')}
            >
              Tous ({contracts.length})
            </Button>
            <Button
              variant={statusFilter === 'active' ? 'contained' : 'outlined'}
              size="small"
              color="success"
              onClick={() => handleFilterChange('active')}
            >
              Actifs ({contracts.filter(c => c.active).length})
            </Button>
            <Button
              variant={statusFilter === 'inactive' ? 'contained' : 'outlined'}
              size="small"
              color="secondary"
              onClick={() => handleFilterChange('inactive')}
            >
              Inactifs ({contracts.filter(c => !c.active).length})
            </Button>
            <Button
              variant={statusFilter === 'expiring' ? 'contained' : 'outlined'}
              size="small"
              color="warning"
              onClick={() => handleFilterChange('expiring')}
            >
              Expirent bientôt ({contracts.filter(c => c.is_expiring_soon).length})
            </Button>
            <Button
              variant={statusFilter === 'expired' ? 'contained' : 'outlined'}
              size="small"
              color="error"
              onClick={() => handleFilterChange('expired')}
            >
              Expirés ({contracts.filter(c => c.is_expired).length})
            </Button>
            <Button
              variant={statusFilter === 'cdi' ? 'contained' : 'outlined'}
              size="small"
              onClick={() => handleFilterChange('cdi')}
            >
              CDI ({contracts.filter(c => c.type === 'CDI').length})
            </Button>
            <Button
              variant={statusFilter === 'cdd' ? 'contained' : 'outlined'}
              size="small"
              onClick={() => handleFilterChange('cdd')}
            >
              CDD ({contracts.filter(c => c.type === 'CDD').length})
            </Button>
            <Button
              variant={statusFilter === 'stage' ? 'contained' : 'outlined'}
              size="small"
              onClick={() => handleFilterChange('stage')}
            >
              Stage ({contracts.filter(c => c.type === 'Stage').length})
            </Button>
          </Box>
        </CardContent>
      </Card>

      {/* Table des contrats */}
      <Card elevation={0} sx={{ border: '1px solid #e0e0e0', borderRadius: 2 }}>
        <CardContent>
          <Box sx={{ height: 600 }}>
            <DataGrid
              rows={filteredContracts}
              columns={columns}
              pageSize={10}
              rowsPerPageOptions={[10, 25, 50]}
              loading={loading}
              disableSelectionOnClick
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
          </Box>
        </CardContent>
      </Card>

      {/* Menu contextuel */}
      <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleMenuClose}>
        <MenuItem onClick={() => handleViewDetails(selectedContract)}>
          <AssignmentIcon sx={{ mr: 1 }} />
          Voir détails
        </MenuItem>
        {user?.role === 'hr_manager' && (
          <>
            <MenuItem onClick={() => handleEditContract(selectedContract)}>
              <EditIcon sx={{ mr: 1 }} />
              Modifier
            </MenuItem>
            <MenuItem onClick={() => handleRenewContract(selectedContract)}>
              <RefreshIcon sx={{ mr: 1 }} />
              Renouveler
            </MenuItem>
          </>
        )}
      </Menu>

      {/* Dialog de création */}
      {(user?.role === 'hr_manager' || user?.role === 'hr_director') && (
        <Dialog open={createDialogOpen} onClose={() => setCreateDialogOpen(false)} maxWidth="md" fullWidth>
          <DialogTitle>Créer un nouveau contrat</DialogTitle>
          <DialogContent>
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12}>
                <FormControl fullWidth>
                  <InputLabel>Employé</InputLabel>
                  <Select
                    value={formData.employee}
                    onChange={(e) => setFormData({ ...formData, employee: e.target.value })}
                    label="Employé"
                  >
                    {employees.map((employee) => (
                      <MenuItem key={employee.id} value={employee.id}>
                        {`${employee.user?.first_name} ${employee.user?.last_name}`} - {employee.matricule}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>Type de contrat</InputLabel>
                  <Select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                    label="Type de contrat"
                >
                  <MenuItem value="CDI">CDI</MenuItem>
                  <MenuItem value="CDD">CDD</MenuItem>
                  <MenuItem value="Stage">Stage</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Salaire (€)"
                type="number"
                value={formData.salaire}
                onChange={(e) => setFormData({ ...formData, salaire: e.target.value })}
                helperText="Optionnel"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Date de début *"
                type="date"
                InputLabelProps={{ shrink: true }}
                value={formData.date_debut}
                onChange={(e) => setFormData({ ...formData, date_debut: e.target.value })}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Date de fin (optionnel)"
                type="date"
                InputLabelProps={{ shrink: true }}
                value={formData.date_fin}
                onChange={(e) => setFormData({ ...formData, date_fin: e.target.value })}
                helperText="Laisser vide pour un CDI sans limite"
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCreateDialogOpen(false)}>
            Annuler
          </Button>
          <Button onClick={handleCreateContract} variant="contained">
            Créer le Contrat
          </Button>
        </DialogActions>
      </Dialog>
      )}



      {/* Dialog des détails */}
      <Dialog open={detailDialogOpen} onClose={() => setDetailDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Détails du contrat</DialogTitle>
        <DialogContent>
          {contractDetail && (
            <Box sx={{ mt: 2 }}>
              <Typography variant="h6" gutterBottom>{contractDetail.employee_name}</Typography>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Matricule: {contractDetail.employee_matricule}
              </Typography>
              <Grid container spacing={2} sx={{ mt: 1 }}>
                <Grid item xs={6}>
                  <Typography variant="body2"><strong>Type:</strong> {contractDetail.type}</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2"><strong>Statut:</strong> {contractDetail.active ? 'Actif' : 'Inactif'}</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2"><strong>Date début:</strong> {format(new Date(contractDetail.date_debut), 'dd/MM/yyyy')}</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2"><strong>Date fin:</strong> {contractDetail.date_fin ? format(new Date(contractDetail.date_fin), 'dd/MM/yyyy') : 'Indéterminée'}</Typography>
                </Grid>
                {contractDetail.salaire && (
                  <Grid item xs={12}>
                    <Typography variant="body2"><strong>Salaire:</strong> {contractDetail.salaire} €</Typography>
                  </Grid>
                )}
              </Grid>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDetailDialogOpen(false)}>Fermer</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ContractManagement;