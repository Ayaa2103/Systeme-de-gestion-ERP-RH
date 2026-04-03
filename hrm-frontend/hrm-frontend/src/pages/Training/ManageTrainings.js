import React, { useState, useEffect } from 'react';
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
  OutlinedInput,
  Fab,
  LinearProgress
} from '@mui/material';
import {
  Add as AddIcon,
  School as SchoolIcon,
  MoreVert as MoreVertIcon,
  CheckCircle as CheckIcon,
  Cancel as CancelIcon,
  Edit as EditIcon,
  People as PeopleIcon,
  CalendarToday as CalendarIcon,
  Schedule as ScheduleIcon
} from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { useAuth } from '../../contexts/AuthContext';
import { getTrainings, approveTraining, rejectTraining, getEmployees } from '../../services/hrService';

const ManageTrainings = () => {
  const { hasAnyRole } = useAuth();
  const [trainings, setTrainings] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedTraining, setSelectedTraining] = useState(null);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    start_date: null,
    end_date: null,
    employees: []
  });

  useEffect(() => {
    fetchTrainings();
    fetchEmployees();
  }, []);

  const fetchTrainings = async () => {
    try {
      const response = await getTrainings();
      setTrainings(response.data.results || response.data);
    } catch (error) {
      console.error('Erreur lors du chargement des formations:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchEmployees = async () => {
    try {
      const response = await getEmployees();
      setEmployees(response.data.results || response.data);
    } catch (error) {
      console.error('Erreur lors du chargement des employés:', error);
    }
  };

  const handleCreateTraining = async () => {
    try {
      if (!formData.name || !formData.description || !formData.start_date || !formData.end_date) {
        alert('Veuillez remplir tous les champs obligatoires');
        return;
      }
      
      const trainingData = {
        name: formData.name,
        description: formData.description,
        start_date: formData.start_date instanceof Date ? formData.start_date.toISOString().split('T')[0] : formData.start_date,
        end_date: formData.end_date instanceof Date ? formData.end_date.toISOString().split('T')[0] : formData.end_date,
        employee_ids: formData.employees
      };
      
      const { createTraining } = await import('../../services/hrService');
      await createTraining(trainingData);
      await fetchTrainings();
      setCreateDialogOpen(false);
      setFormData({
        name: '',
        description: '',
        start_date: null,
        end_date: null,
        employees: []
      });
    } catch (error) {
      console.error('Erreur lors de la création de la formation:', error);
      alert('Erreur lors de la création de la formation');
    }
  };

  const handleApproveTraining = async (trainingId) => {
    try {
      await approveTraining(trainingId);
      await fetchTrainings();
      handleMenuClose();
    } catch (error) {
      console.error('Erreur lors de l\'approbation:', error);
    }
  };

  const handleRejectTraining = async (trainingId) => {
    try {
      await rejectTraining(trainingId);
      await fetchTrainings();
      handleMenuClose();
    } catch (error) {
      console.error('Erreur lors du rejet:', error);
    }
  };

  const handleMenuClick = (event, training) => {
    setAnchorEl(event.currentTarget);
    setSelectedTraining(training);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedTraining(null);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'warning';
      case 'approved': return 'success';
      case 'rejected': return 'error';
      default: return 'default';
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case 'pending': return 'En attente';
      case 'approved': return 'Approuvée';
      case 'rejected': return 'Rejetée';
      default: return status;
    }
  };

  const TrainingCard = ({ training }) => (
    <Card
      elevation={0}
      sx={{
        border: '1px solid #e0e0e0',
        borderRadius: 2,
        transition: 'all 0.3s ease',
        '&:hover': {
          boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
          transform: 'translateY(-2px)',
        }
      }}
    >
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', flex: 1 }}>
            <Avatar
              sx={{
                backgroundColor: training.is_active ? '#2e7d32' : '#1976d2',
                mr: 2,
                width: 48,
                height: 48
              }}
            >
              <SchoolIcon />
            </Avatar>
            <Box sx={{ flex: 1 }}>
              <Typography variant="h6" fontWeight="600" gutterBottom>
                {training.name}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                {training.description}
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Chip
                  label={getStatusLabel(training.status)}
                  color={getStatusColor(training.status)}
                  size="small"
                />
                {training.is_active && (
                  <Chip
                    label="En cours"
                    color="success"
                    size="small"
                    variant="outlined"
                  />
                )}
              </Box>
            </Box>
          </Box>
          <IconButton onClick={(e) => handleMenuClick(e, training)}>
            <MoreVertIcon />
          </IconButton>
        </Box>

        <Grid container spacing={2} sx={{ mb: 2 }}>
          <Grid item xs={12} sm={6}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <CalendarIcon sx={{ fontSize: 16, mr: 1, color: 'text.secondary' }} />
              <Typography variant="body2" color="text.secondary">
                Du {format(new Date(training.start_date), 'dd MMM yyyy', { locale: fr })} 
                au {format(new Date(training.end_date), 'dd MMM yyyy', { locale: fr })}
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <PeopleIcon sx={{ fontSize: 16, mr: 1, color: 'text.secondary' }} />
              <Typography variant="body2" color="text.secondary">
                {training.employees?.length || 0} participants
              </Typography>
            </Box>
          </Grid>
        </Grid>

        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Typography variant="caption" color="text.secondary">
            Créée par {training.created_by_name} • {training.duration_days} jours
          </Typography>
          
          {training.status === 'pending' && hasAnyRole(['hr_director']) && (
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Button
                size="small"
                variant="contained"
                color="success"
                startIcon={<CheckIcon />}
                onClick={() => handleApproveTraining(training.id)}
              >
                Approuver
              </Button>
              <Button
                size="small"
                variant="outlined"
                color="error"
                startIcon={<CancelIcon />}
                onClick={() => handleRejectTraining(training.id)}
              >
                Rejeter
              </Button>
            </Box>
          )}
        </Box>

        {training.employees && training.employees.length > 0 && (
          <Box sx={{ mt: 2 }}>
            <Typography variant="body2" fontWeight="600" gutterBottom>
              Participants:
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
              {training.employees.slice(0, 3).map((employee) => (
                <Chip
                  key={employee.id}
                  label={`${employee.user?.first_name} ${employee.user?.last_name}`}
                  size="small"
                  variant="outlined"
                />
              ))}
              {training.employees.length > 3 && (
                <Chip
                  label={`+${training.employees.length - 3} autres`}
                  size="small"
                  variant="outlined"
                  color="primary"
                />
              )}
            </Box>
          </Box>
        )}
      </CardContent>
    </Card>
  );

  const pendingCount = trainings.filter(t => t.status === 'pending').length;
  const activeCount = trainings.filter(t => t.is_active).length;

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={fr}>
      <Box>
        {/* En-tête */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Box>
            <Typography variant="h4" fontWeight="bold" gutterBottom>
              Gestion des Formations
            </Typography>
            <Typography variant="body1" color="text.secondary">
              {trainings.length} formations au total
            </Typography>
          </Box>
          {hasAnyRole(['hr_manager']) && (
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => setCreateDialogOpen(true)}
              sx={{ borderRadius: 2, px: 3, py: 1.5 }}
            >
              Nouvelle Formation
            </Button>
          )}
        </Box>

        {/* Statistiques */}
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid item xs={12} sm={3}>
            <Card elevation={0} sx={{ border: '1px solid #e0e0e0', borderRadius: 2 }}>
              <CardContent sx={{ textAlign: 'center' }}>
                <Typography variant="h4" color="primary" fontWeight="bold">
                  {trainings.length}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Total Formations
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={3}>
            <Card elevation={0} sx={{ border: '1px solid #e0e0e0', borderRadius: 2 }}>
              <CardContent sx={{ textAlign: 'center' }}>
                <Typography variant="h4" color="success.main" fontWeight="bold">
                  {activeCount}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  En Cours
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={3}>
            <Card elevation={0} sx={{ border: '1px solid #e0e0e0', borderRadius: 2 }}>
              <CardContent sx={{ textAlign: 'center' }}>
                <Typography variant="h4" color="warning.main" fontWeight="bold">
                  {pendingCount}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  En Attente
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={3}>
            <Card elevation={0} sx={{ border: '1px solid #e0e0e0', borderRadius: 2 }}>
              <CardContent sx={{ textAlign: 'center' }}>
                <Typography variant="h4" color="info.main" fontWeight="bold">
                  {trainings.filter(t => t.status === 'approved').length}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Approuvées
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Liste des formations */}
        {loading ? (
          <LinearProgress />
        ) : (
          <Grid container spacing={2}>
            {trainings.map((training) => (
              <Grid item xs={12} md={6} key={training.id}>
                <TrainingCard training={training} />
              </Grid>
            ))}
          </Grid>
        )}

        {/* Menu contextuel */}
        <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleMenuClose}>
          <MenuItem onClick={handleMenuClose}>
            <EditIcon sx={{ mr: 1 }} />
            Modifier
          </MenuItem>
          <MenuItem onClick={handleMenuClose}>
            <PeopleIcon sx={{ mr: 1 }} />
            Participants
          </MenuItem>
          {selectedTraining?.status === 'pending' && hasAnyRole(['hr_director']) && (
            <>
              <MenuItem onClick={() => handleApproveTraining(selectedTraining.id)}>
                <CheckIcon sx={{ mr: 1 }} />
                Approuver
              </MenuItem>
              <MenuItem onClick={() => handleRejectTraining(selectedTraining.id)}>
                <CancelIcon sx={{ mr: 1 }} />
                Rejeter
              </MenuItem>
            </>
          )}
        </Menu>

        {/* Dialog de création */}
        <Dialog open={createDialogOpen} onClose={() => setCreateDialogOpen(false)} maxWidth="md" fullWidth>
          <DialogTitle>Créer une nouvelle formation</DialogTitle>
          <DialogContent>
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Nom de la formation"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  multiline
                  rows={3}
                  label="Description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <DatePicker
                  label="Date de début"
                  value={formData.start_date}
                  onChange={(date) => setFormData({ ...formData, start_date: date })}
                  renderInput={(params) => <TextField {...params} fullWidth />}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <DatePicker
                  label="Date de fin"
                  value={formData.end_date}
                  onChange={(date) => setFormData({ ...formData, end_date: date })}
                  renderInput={(params) => <TextField {...params} fullWidth />}
                />
              </Grid>
              <Grid item xs={12}>
                <FormControl fullWidth>
                  <InputLabel>Participants</InputLabel>
                  <Select
                    multiple
                    value={formData.employees}
                    onChange={(e) => setFormData({ ...formData, employees: e.target.value })}
                    input={<OutlinedInput label="Participants" />}
                    renderValue={(selected) => 
                      selected.map(id => {
                        const employee = employees.find(emp => emp.id === id);
                        return employee ? `${employee.user?.first_name} ${employee.user?.last_name}` : '';
                      }).join(', ')
                    }
                  >
                    {employees.map((employee) => (
                      <MenuItem key={employee.id} value={employee.id}>
                        {employee.user?.first_name} {employee.user?.last_name} - {employee.matricule}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setCreateDialogOpen(false)}>
              Annuler
            </Button>
            <Button onClick={handleCreateTraining} variant="contained">
              Créer
            </Button>
          </DialogActions>
        </Dialog>

        {/* FAB pour mobile */}
        {hasAnyRole(['hr_manager']) && (
          <Fab
            color="primary"
            sx={{
              position: 'fixed',
              bottom: 16,
              right: 16,
              display: { xs: 'flex', md: 'none' }
            }}
            onClick={() => setCreateDialogOpen(true)}
          >
            <AddIcon />
          </Fab>
        )}
      </Box>
    </LocalizationProvider>
  );
};

export default ManageTrainings;