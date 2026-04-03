import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Grid,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Chip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  Checkbox,
  Avatar,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  LinearProgress,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  IconButton
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Assignment as TaskIcon,
  CheckCircle as CheckIcon,
  Schedule as ScheduleIcon,
  Person as PersonIcon,
  ExpandMore as ExpandMoreIcon
} from '@mui/icons-material';
import api from '../../services/api';

const OnboardingTasks = () => {
  const [employeesWithTasks, setEmployeesWithTasks] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [formData, setFormData] = useState({
    employee: '',
    item_name: ''
  });
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState({ show: false, message: '', severity: 'success' });

  useEffect(() => {
    fetchEmployeesWithTasks();
    fetchEmployees();
  }, []);

  const fetchEmployeesWithTasks = async () => {
    try {
      const employeesRes = await api.get('/onboarding/employees-list/');
      const employees = Array.isArray(employeesRes.data) ? employeesRes.data : [];
      
      // Pour chaque employé, récupérer ses tâches d'intégration
      const employeesWithTasks = await Promise.all(
        employees.map(async (employee) => {
          try {
            const tasksRes = await api.get(`/onboarding/employee/${employee.id}/checklist/`);
            const tasks = Array.isArray(tasksRes.data) ? tasksRes.data : [];
            const completedTasks = tasks.filter(task => task.is_completed).length;
            const progress = tasks.length > 0 ? Math.round((completedTasks / tasks.length) * 100) : 0;
            
            return {
              ...employee,
              tasks,
              progress,
              completedTasks,
              totalTasks: tasks.length
            };
          } catch (error) {
            console.error(`Erreur pour employé ${employee.id}:`, error);
            return {
              ...employee,
              tasks: [],
              progress: 0,
              completedTasks: 0,
              totalTasks: 0
            };
          }
        })
      );
      
      setEmployeesWithTasks(employeesWithTasks);
    } catch (error) {
      console.error('Erreur:', error);
      setEmployeesWithTasks([]);
    }
  };

  const fetchEmployees = async () => {
    try {
      const response = await api.get('/onboarding/employees/');
      setEmployees(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error('Erreur:', error);
      setEmployees([]);
    }
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      if (editingTask) {
        await api.put(`/onboarding/checklist/${editingTask.id}/`, formData);
        setAlert({ show: true, message: 'Tâche modifiée avec succès', severity: 'success' });
      } else {
        await api.post('/onboarding/checklist/', formData);
        setAlert({ show: true, message: 'Tâche créée avec succès', severity: 'success' });
      }
      fetchEmployeesWithTasks();
      handleCloseDialog();
    } catch (error) {
      setAlert({ show: true, message: 'Erreur lors de l\'opération', severity: 'error' });
    }
    setLoading(false);
  };

  const handleEdit = (task) => {
    setEditingTask(task);
    setFormData({
      employee: task.employee,
      item_name: task.item_name
    });
    setDialogOpen(true);
  };

  const handleDelete = async (taskId) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cette tâche ?')) {
      try {
        await api.delete(`/onboarding/checklist/${taskId}/`);
        setAlert({ show: true, message: 'Tâche supprimée avec succès', severity: 'success' });
        fetchEmployeesWithTasks();
      } catch (error) {
        setAlert({ show: true, message: 'Erreur lors de la suppression', severity: 'error' });
      }
    }
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setEditingTask(null);
    setFormData({
      employee: '',
      item_name: ''
    });
  };

  const toggleTaskCompletion = async (taskId) => {
    try {
      await api.post(`/onboarding/checklist/${taskId}/toggle/`);
      setAlert({ show: true, message: 'Statut mis à jour', severity: 'success' });
      fetchEmployeesWithTasks();
    } catch (error) {
      setAlert({ show: true, message: 'Erreur lors de la mise à jour', severity: 'error' });
    }
  };

  const getProgressColor = (progress) => {
    if (progress === 100) return '#2e7d32';
    if (progress >= 50) return '#1976d2';
    if (progress > 0) return '#ed6c02';
    return '#d32f2f';
  };

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
            Tâches d'Intégration par Employé
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Gérer les tâches des plans d'intégration groupées par employé
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setDialogOpen(true)}
          sx={{ borderRadius: 2 }}
        >
          Nouvelle Tâche
        </Button>
      </Box>

      {/* Statistiques globales */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={3}>
          <Card elevation={0} sx={{ border: '1px solid #e0e0e0', textAlign: 'center', p: 2 }}>
            <Typography variant="h4" fontWeight="bold" color="primary">
              {employeesWithTasks.length}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Employés en Intégration
            </Typography>
          </Card>
        </Grid>
        <Grid item xs={12} sm={3}>
          <Card elevation={0} sx={{ border: '1px solid #e0e0e0', textAlign: 'center', p: 2 }}>
            <Typography variant="h4" fontWeight="bold" color="success.main">
              {employeesWithTasks.reduce((sum, emp) => sum + emp.completedTasks, 0)}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Tâches Complétées
            </Typography>
          </Card>
        </Grid>
        <Grid item xs={12} sm={3}>
          <Card elevation={0} sx={{ border: '1px solid #e0e0e0', textAlign: 'center', p: 2 }}>
            <Typography variant="h4" fontWeight="bold" color="warning.main">
              {employeesWithTasks.reduce((sum, emp) => sum + (emp.totalTasks - emp.completedTasks), 0)}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Tâches En Attente
            </Typography>
          </Card>
        </Grid>
        <Grid item xs={12} sm={3}>
          <Card elevation={0} sx={{ border: '1px solid #e0e0e0', textAlign: 'center', p: 2 }}>
            <Typography variant="h4" fontWeight="bold" color="info.main">
              {employeesWithTasks.reduce((sum, emp) => sum + emp.totalTasks, 0)}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Total Tâches
            </Typography>
          </Card>
        </Grid>
      </Grid>

      {/* Liste des employés avec leurs tâches */}
      {employeesWithTasks.map((employee) => (
        <Accordion key={employee.id} sx={{ mb: 2, border: '1px solid #e0e0e0', borderRadius: 2 }}>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Grid container alignItems="center" spacing={2}>
              <Grid item>
                <Avatar sx={{ backgroundColor: getProgressColor(employee.progress) }}>
                  <PersonIcon />
                </Avatar>
              </Grid>
              <Grid item xs>
                <Typography variant="h6" fontWeight="600">
                  {employee.user_data?.first_name} {employee.user_data?.last_name}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {employee.matricule} • {employee.poste}
                </Typography>
              </Grid>
              <Grid item>
                <Box sx={{ textAlign: 'center', minWidth: 120 }}>
                  <Typography variant="h6" fontWeight="bold" color={getProgressColor(employee.progress)}>
                    {employee.progress}%
                  </Typography>
                  <LinearProgress
                    variant="determinate"
                    value={employee.progress}
                    sx={{
                      height: 8,
                      borderRadius: 4,
                      backgroundColor: '#e0e0e0',
                      '& .MuiLinearProgress-bar': {
                        backgroundColor: getProgressColor(employee.progress),
                      }
                    }}
                  />
                </Box>
              </Grid>
              <Grid item>
                <Chip 
                  label={`${employee.completedTasks}/${employee.totalTasks} tâches`}
                  color={employee.progress === 100 ? 'success' : employee.progress > 0 ? 'primary' : 'default'}
                  size="small"
                />
              </Grid>
            </Grid>
          </AccordionSummary>
          <AccordionDetails>
            {employee.tasks.length === 0 ? (
              <Box sx={{ textAlign: 'center', py: 3 }}>
                <Typography variant="body1" color="text.secondary">
                  Aucune tâche assignée à cet employé
                </Typography>
                <Button
                  variant="outlined"
                  sx={{ mt: 2 }}
                  onClick={async () => {
                    try {
                      await api.post('/onboarding/start/', { employee_id: employee.id });
                      setAlert({ show: true, message: 'Checklist créée', severity: 'success' });
                      fetchEmployeesWithTasks();
                    } catch (error) {
                      setAlert({ show: true, message: 'Erreur lors de la création', severity: 'error' });
                    }
                  }}
                >
                  Créer Checklist par Défaut
                </Button>
              </Box>
            ) : (
              <List>
                {employee.tasks.map((task) => (
                  <ListItem key={task.id} sx={{ px: 0 }}>
                    <ListItemIcon>
                      <Checkbox
                        checked={task.is_completed}
                        onChange={() => toggleTaskCompletion(task.id)}
                        color="primary"
                      />
                    </ListItemIcon>
                    <ListItemText
                      primary={
                        <Typography
                          sx={{
                            textDecoration: task.is_completed ? 'line-through' : 'none',
                            opacity: task.is_completed ? 0.7 : 1,
                            fontWeight: 500
                          }}
                        >
                          {task.item_name}
                        </Typography>
                      }
                      secondary={
                        <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
                          <Chip 
                            label={task.is_completed ? 'Terminé' : 'En attente'}
                            size="small"
                            color={task.is_completed ? 'success' : 'warning'}
                          />
                          {task.completion_date && (
                            <Chip 
                              label={`Terminé le ${new Date(task.completion_date).toLocaleDateString()}`}
                              size="small"
                              variant="outlined"
                            />
                          )}
                          {task.completed_by_name && (
                            <Chip 
                              label={`Par: ${task.completed_by_name}`}
                              size="small"
                              variant="outlined"
                            />
                          )}
                        </Box>
                      }
                    />
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <IconButton size="small" onClick={() => handleEdit(task)} color="primary">
                        <EditIcon />
                      </IconButton>
                      <IconButton size="small" onClick={() => handleDelete(task.id)} color="error">
                        <DeleteIcon />
                      </IconButton>
                    </Box>
                  </ListItem>
                ))}
              </List>
            )}
          </AccordionDetails>
        </Accordion>
      ))}

      <Dialog open={dialogOpen} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>
          {editingTask ? 'Modifier la Tâche' : 'Nouvelle Tâche d\'Intégration'}
        </DialogTitle>
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
                      {employee.user_data?.first_name} {employee.user_data?.last_name} - {employee.matricule}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Nom de la tâche"
                value={formData.item_name}
                onChange={(e) => setFormData({ ...formData, item_name: e.target.value })}
                placeholder="Ex: Documents administratifs fournis"
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Annuler</Button>
          <Button 
            onClick={handleSubmit} 
            variant="contained"
            disabled={loading || !formData.employee || !formData.item_name}
          >
            {editingTask ? 'Modifier' : 'Créer'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default OnboardingTasks;