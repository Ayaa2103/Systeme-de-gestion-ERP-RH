import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Avatar,
  LinearProgress,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Chip,
  Button,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Checkbox,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  Stepper,
  Step,
  StepLabel,
  StepContent
} from '@mui/material';
import {
  CheckCircle as CheckCircleIcon,
  Schedule as ScheduleIcon,
  Assignment as TaskIcon,
  Person as PersonIcon,
  Visibility as ViewIcon,
  Edit as EditIcon,
  Comment as CommentIcon
} from '@mui/icons-material';
import api from '../../services/api';

const EmployeeProgress = () => {
  const [employees, setEmployees] = useState([]);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [progressDialog, setProgressDialog] = useState(false);
  const [tasks, setTasks] = useState([]);
  const [filterStatus, setFilterStatus] = useState('all');
  const [alert, setAlert] = useState({ show: false, message: '', severity: 'success' });

  useEffect(() => {
    fetchEmployees();
  }, []);

  const fetchEmployees = async () => {
    try {
      const response = await api.get('/onboarding/employees-list/');
      setEmployees(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error('Erreur lors du chargement:', error);
      setEmployees([]);
    }
  };

  const fetchEmployeeTasks = async (employeeId) => {
    try {
      const response = await api.get(`/onboarding/checklist/?employee=${employeeId}`);
      setTasks(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error('Erreur lors du chargement des tâches:', error);
      setTasks([]);
    }
  };

  const handleViewProgress = async (employee) => {
    setSelectedEmployee(employee);
    await fetchEmployeeTasks(employee.id);
    setProgressDialog(true);
  };

  const updateTaskStatus = async (taskId) => {
    try {
      await api.post(`/onboarding/checklist/${taskId}/toggle/`);
      setAlert({ show: true, message: 'Statut mis à jour', severity: 'success' });
      fetchEmployeeTasks(selectedEmployee.id);
      fetchEmployees();
    } catch (error) {
      setAlert({ show: true, message: 'Erreur lors de la mise à jour', severity: 'error' });
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return '#2e7d32';
      case 'almost_complete': return '#1976d2';
      case 'in_progress': return '#ed6c02';
      case 'just_started': return '#d32f2f';
      default: return '#757575';
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case 'completed': return 'Terminé';
      case 'almost_complete': return 'Presque fini';
      case 'in_progress': return 'En cours';
      case 'just_started': return 'Démarré';
      default: return 'Non démarré';
    }
  };

  const filteredEmployees = employees.filter(emp => {
    if (filterStatus === 'all') return true;
    return emp.onboarding_status === filterStatus;
  });

  return (
    <Box>
      {alert.show && (
        <Alert 
          severity={alert.severity} 
          onClose={() => setAlert({ ...alert, show: false })}
          sx={{ mb: 2 }}
        >
          {alert.message}
        </Alert>
      )}

      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h4" fontWeight="bold" gutterBottom>
            Suivi des Employés
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Suivre la progression de l'intégration des nouveaux employés
          </Typography>
        </Box>
        <FormControl sx={{ minWidth: 200 }}>
          <InputLabel>Filtrer par statut</InputLabel>
          <Select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            label="Filtrer par statut"
          >
            <MenuItem value="all">Tous</MenuItem>
            <MenuItem value="just_started">Démarré</MenuItem>
            <MenuItem value="in_progress">En cours</MenuItem>
            <MenuItem value="almost_complete">Presque fini</MenuItem>
            <MenuItem value="completed">Terminé</MenuItem>
          </Select>
        </FormControl>
      </Box>

      <Grid container spacing={3}>
        {Array.isArray(filteredEmployees) && filteredEmployees.map((employee) => (
          <Grid item xs={12} key={employee.id}>
            <Card 
              elevation={0} 
              sx={{ 
                border: '1px solid #e0e0e0', 
                borderRadius: 2,
                transition: 'all 0.3s ease',
                '&:hover': {
                  boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                }
              }}
            >
              <CardContent>
                <Grid container spacing={3} alignItems="center">
                  <Grid item xs={12} md={4}>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Avatar
                        sx={{
                          mr: 2,
                          backgroundColor: '#1976d2',
                          width: 56,
                          height: 56
                        }}
                      >
                        {employee.user_data?.first_name?.[0]}
                        {employee.user_data?.last_name?.[0]}
                      </Avatar>
                      <Box>
                        <Typography variant="h6" fontWeight="600">
                          {employee.user_data?.first_name} {employee.user_data?.last_name}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {employee.poste} • {employee.matricule}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Embauché le: {new Date(employee.date_embauche).toLocaleDateString()}
                        </Typography>
                      </Box>
                    </Box>
                  </Grid>

                  <Grid item xs={12} md={3}>
                    <Typography variant="body2" fontWeight="600" gutterBottom>
                      Statut: {employee.onboarding_status || 'Non démarré'}
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <Typography variant="body2" color="text.secondary" sx={{ mr: 2 }}>
                        Progression
                      </Typography>
                      <Typography variant="body2" fontWeight="600">
                        {employee.onboarding_progress || 0}%
                      </Typography>
                    </Box>
                    <LinearProgress
                      variant="determinate"
                      value={employee.onboarding_progress || 0}
                      sx={{
                        height: 8,
                        borderRadius: 4,
                        backgroundColor: '#e0e0e0',
                        '& .MuiLinearProgress-bar': {
                          backgroundColor: getStatusColor(employee.onboarding_status),
                        }
                      }}
                    />
                  </Grid>

                  <Grid item xs={12} md={3}>
                    <Box sx={{ textAlign: 'center' }}>
                      <Typography variant="h4" fontWeight="bold" color={getStatusColor(employee.onboarding_status)}>
                        {employee.onboarding_progress || 0}%
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Progression
                      </Typography>
                      <Chip 
                        label={getStatusLabel(employee.onboarding_status)}
                        size="small"
                        sx={{ 
                          mt: 1,
                          backgroundColor: getStatusColor(employee.onboarding_status),
                          color: 'white'
                        }}
                      />
                    </Box>
                  </Grid>

                  <Grid item xs={12} md={2}>
                    <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                      <Button
                        variant="outlined"
                        startIcon={<ViewIcon />}
                        onClick={() => handleViewProgress(employee)}
                        size="small"
                      >
                        Détails
                      </Button>
                    </Box>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Dialog 
        open={progressDialog} 
        onClose={() => setProgressDialog(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          Progression - {selectedEmployee?.user_data?.first_name} {selectedEmployee?.user_data?.last_name}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              Statut: {selectedEmployee?.onboarding_status || 'Non démarré'}
            </Typography>
            <LinearProgress
              variant="determinate"
              value={selectedEmployee?.onboarding_progress || 0}
              sx={{
                height: 10,
                borderRadius: 5,
                backgroundColor: '#e0e0e0',
                '& .MuiLinearProgress-bar': {
                  backgroundColor: getStatusColor(selectedEmployee?.onboarding_status),
                }
              }}
            />
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              {selectedEmployee?.onboarding_progress || 0}% complété
            </Typography>
          </Box>

          <Typography variant="h6" gutterBottom>
            Tâches d'Intégration
          </Typography>
          
          <List>
            {Array.isArray(tasks) && tasks.map((task, index) => (
              <ListItem key={task.id} sx={{ px: 0 }}>
                <ListItemAvatar>
                  <Checkbox
                    checked={task.is_completed}
                    onChange={() => updateTaskStatus(task.id)}
                    color="primary"
                  />
                </ListItemAvatar>
                <ListItemText
                  primary={task.item_name}
                  secondary={task.completion_date ? 
                    `Complété le ${new Date(task.completion_date).toLocaleDateString()}` : 
                    'Non complété'
                  }
                  sx={{
                    textDecoration: task.is_completed ? 'line-through' : 'none',
                    opacity: task.is_completed ? 0.7 : 1
                  }}
                />
                {task.is_completed && (
                  <CheckCircleIcon sx={{ color: 'success.main', ml: 1 }} />
                )}
              </ListItem>
            ))}
          </List>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setProgressDialog(false)}>
            Fermer
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default EmployeeProgress;