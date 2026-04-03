import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Grid,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  IconButton,
  Menu,
  Alert
} from '@mui/material';
import {
  Add as AddIcon,
  Assignment as ContractIcon,
  MoreVert as MoreVertIcon,
  Edit as EditIcon,
  Refresh as RenewIcon,
  Warning as WarningIcon,
  CheckCircle as CheckIcon
} from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import api from '../../services/api';

const ContractManagement = () => {
  const [contracts, setContracts] = useState([]);
  const [expiringContracts, setExpiringContracts] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedContract, setSelectedContract] = useState(null);
  const [formData, setFormData] = useState({
    employee: '',
    type: 'CDI',
    date_debut: null,
    date_fin: null,
    salaire: ''
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [contractsRes, expiringRes, employeesRes] = await Promise.all([
        api.get('/contracts/'),
        api.get('/contracts/expiring/'),
        api.get('/employees/')
      ]);

      setContracts(contractsRes.data.results || contractsRes.data);
      setExpiringContracts(expiringRes.data.results || expiringRes.data);
      setEmployees(employeesRes.data.results || employeesRes.data);
    } catch (error) {
      console.error('Erreur lors du chargement:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateContract = async () => {
    try {
      await api.post('/contracts/', formData);
      await fetchData();
      setCreateDialogOpen(false);
      setFormData({
        employee: '',
        type: 'CDI',
        date_debut: null,
        date_fin: null,
        salaire: ''
      });
    } catch (error) {
      console.error('Erreur lors de la création:', error);
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

  const getContractTypeColor = (type) => {
    switch (type) {
      case 'CDI': return 'success';
      case 'CDD': return 'warning';
      case 'Stage': return 'info';
      default: return 'default';
    }
  };

  const ContractCard = ({ contract }) => (
    <Card
      elevation={0}
      sx={{
        border: '1px solid #e0e0e0',
        borderRadius: 2,
        mb: 2,
        transition: 'all 0.3s ease',
        '&:hover': {
          boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
          transform: 'translateY(-2px)',
        }
      }}
    >
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', flex: 1 }}>
            <ContractIcon sx={{ mr: 2, color: '#1976d2', fontSize: 32 }} />
            <Box sx={{ flex: 1 }}>
              <Typography variant="h6" fontWeight="600" gutterBottom>
                {contract.employee_name}
              </Typography>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                {contract.employee_matricule}
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                <Chip
                  label={contract.type_display}
                  color={getContractTypeColor(contract.type)}
                  size="small"
                />
                <Chip
                  label={contract.active ? 'Actif' : 'Inactif'}
                  color={contract.active ? 'success' : 'default'}
                  size="small"
                  variant="outlined"
                />
                {contract.is_expiring_soon && (
                  <Chip
                    label="Expire bientôt"
                    color="warning"
                    size="small"
                    icon={<WarningIcon />}
                  />
                )}
              </Box>
            </Box>
          </Box>
          <IconButton onClick={(e) => handleMenuClick(e, contract)}>
            <MoreVertIcon />
          </IconButton>
        </Box>

        <Grid container spacing={2} sx={{ mt: 1 }}>
          <Grid item xs={12} sm={6}>
            <Typography variant="body2" color="text.secondary">
              Date de début
            </Typography>
            <Typography variant="body1" fontWeight="500">
              {format(new Date(contract.date_debut), 'dd MMMM yyyy', { locale: fr })}
            </Typography>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Typography variant="body2" color="text.secondary">
              Date de fin
            </Typography>
            <Typography variant="body1" fontWeight="500">
              {contract.date_fin ? 
                format(new Date(contract.date_fin), 'dd MMMM yyyy', { locale: fr }) :
                'Indéterminée'
              }
            </Typography>
          </Grid>
          {contract.salaire && (
            <Grid item xs={12}>
              <Typography variant="body2" color="text.secondary">
                Salaire
              </Typography>
              <Typography variant="body1" fontWeight="500">
                {contract.salaire}€
              </Typography>
            </Grid>
          )}
        </Grid>
      </CardContent>
    </Card>
  );

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={fr}>
      <Box>
        {/* En-tête */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Box>
            <Typography variant="h4" fontWeight="bold" gutterBottom>
              Gestion des Contrats
            </Typography>
            <Typography variant="body1" color="text.secondary">
              {contracts.length} contrats au total
            </Typography>
          </Box>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setCreateDialogOpen(true)}
            sx={{ borderRadius: 2, px: 3, py: 1.5 }}
          >
            Nouveau Contrat
          </Button>
        </Box>

        {/* Alertes contrats expirants */}
        {expiringContracts.length > 0 && (
          <Alert severity="warning" sx={{ mb: 3 }}>
            <Typography variant="body2" fontWeight="600">
              {expiringContracts.length} contrat(s) expire(nt) dans les 30 prochains jours
            </Typography>
          </Alert>
        )}

        {/* Statistiques */}
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid item xs={12} sm={3}>
            <Card elevation={0} sx={{ border: '1px solid #e0e0e0', borderRadius: 2 }}>
              <CardContent sx={{ textAlign: 'center' }}>
                <Typography variant="h4" color="primary" fontWeight="bold">
                  {contracts.length}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Total Contrats
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
                  Expirants
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Liste des contrats */}
        <Grid container spacing={2}>
          {contracts.map((contract) => (
            <Grid item xs={12} md={6} key={contract.id}>
              <ContractCard contract={contract} />
            </Grid>
          ))}
        </Grid>

        {/* Menu contextuel */}
        <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleMenuClose}>
          <MenuItem onClick={handleMenuClose}>
            <EditIcon sx={{ mr: 1 }} />
            Modifier
          </MenuItem>
          <MenuItem onClick={handleMenuClose}>
            <RenewIcon sx={{ mr: 1 }} />
            Renouveler
          </MenuItem>
          <MenuItem onClick={handleMenuClose}>
            <CheckIcon sx={{ mr: 1 }} />
            Convertir en CDI
          </MenuItem>
        </Menu>

        {/* Dialog de création */}
        <Dialog open={createDialogOpen} onClose={() => setCreateDialogOpen(false)} maxWidth="md" fullWidth>
          <DialogTitle>Créer un nouveau contrat</DialogTitle>
          <DialogContent>
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12}>
                <FormControl fullWidth>
                  <InputLabel>Employé</InputLabel>
                  <Select
                    value={formData.employee}
                    label="Employé"
                    onChange={(e) => setFormData({ ...formData, employee: e.target.value })}
                  >
                    {employees.map((employee) => (
                      <MenuItem key={employee.id} value={employee.id}>
                        {employee.user_data?.first_name} {employee.user_data?.last_name} - {employee.matricule}
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
                    label="Type de contrat"
                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
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
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <DatePicker
                  label="Date de début"
                  value={formData.date_debut}
                  onChange={(date) => setFormData({ ...formData, date_debut: date })}
                  renderInput={(params) => <TextField {...params} fullWidth />}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <DatePicker
                  label="Date de fin (optionnelle)"
                  value={formData.date_fin}
                  onChange={(date) => setFormData({ ...formData, date_fin: date })}
                  renderInput={(params) => <TextField {...params} fullWidth />}
                />
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setCreateDialogOpen(false)}>
              Annuler
            </Button>
            <Button onClick={handleCreateContract} variant="contained">
              Créer
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </LocalizationProvider>
  );
};

export default ContractManagement;