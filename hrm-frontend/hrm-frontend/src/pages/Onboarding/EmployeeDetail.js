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
  Alert,
  Tabs,
  Tab,
  Divider,
  TextField
} from '@mui/material';
import {
  CheckCircle as CheckCircleIcon,
  Schedule as ScheduleIcon,
  Assignment as TaskIcon,
  School as TrainingIcon,
  Event as EventIcon,
  Person as PersonIcon,
  Edit as EditIcon,
  Visibility as ViewIcon
} from '@mui/icons-material';
import { useParams } from 'react-router-dom';
import api from '../../services/api';

const EmployeeDetail = () => {
  const { id } = useParams();
  const [employee, setEmployee] = useState(null);
  const [checklist, setChecklist] = useState([]);
  const [trainings, setTrainings] = useState([]);
  const [tabValue, setTabValue] = useState(0);
  const [alert, setAlert] = useState({ show: false, message: '', severity: 'success' });
  const [loading, setLoading] = useState(true);
  const [trainingDialog, setTrainingDialog] = useState({ open: false, training: null });
  const [completionData, setCompletionData] = useState({ completion_date: '', score: '' });

  useEffect(() => {
    if (id) {
      fetchEmployeeDetails();
      fetchChecklist();
      fetchTrainings();
    }
  }, [id]);

  const fetchEmployeeDetails = async () => {
    try {
      const response = await api.get(`/employees/${id}/`);
      setEmployee(response.data);
    } catch (error) {
      console.error('Erreur lors du chargement de l\'employé:', error);
    }
  };

  const fetchChecklist = async () => {
    try {
      const response = await api.get(`/onboarding/employee/${id}/checklist/`);
      setChecklist(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error('Erreur lors du chargement de la checklist:', error);
      setChecklist([]);
    }
  };

  const fetchTrainings = async () => {
    try {
      const response = await api.get(`/onboarding/employee/${id}/trainings/`);
      setTrainings(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error('Erreur lors du chargement des formations:', error);
      setTrainings([]);
    }
    setLoading(false);
  };

  const toggleChecklistItem = async (itemId) => {
    try {
      await api.post(`/onboarding/checklist/${itemId}/toggle/`);
      setAlert({ show: true, message: 'Statut mis à jour', severity: 'success' });
      fetchChecklist();
    } catch (error) {
      setAlert({ show: true, message: 'Erreur lors de la mise à jour', severity: 'error' });
    }
  };

  const handleCompleteTraining = async () => {
    try {
      await api.post(`/onboarding/training/${trainingDialog.training.id}/complete/`, completionData);
      setAlert({ show: true, message: 'Formation marquée comme terminée', severity: 'success' });
      setTrainingDialog({ open: false, training: null });
      setCompletionData({ completion_date: '', score: '' });
      fetchTrainings();
    } catch (error) {
      setAlert({ show: true, message: 'Erreur lors de la mise à jour', severity: 'error' });
    }
  };

  const openTrainingDialog = (training) => {
    setTrainingDialog({ open: true, training });
    setCompletionData({ 
      completion_date: new Date().toISOString().split('T')[0], 
      score: '' 
    });
  };

  const calculateProgress = () => {
    if (checklist.length === 0) return 0;
    const completed = checklist.filter(item => item.is_completed).length;
    return Math.round((completed / checklist.length) * 100);
  };

  const getStatusColor = (progress) => {
    if (progress === 100) return '#2e7d32';
    if (progress >= 50) return '#1976d2';
    if (progress > 0) return '#ed6c02';
    return '#d32f2f';
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 400 }}>
        <Typography>Chargement...</Typography>
      </Box>
    );
  }

  if (!employee) {
    return (
      <Box sx={{ textAlign: 'center', mt: 4 }}>
        <Typography variant="h6" color="text.secondary">
          Employé non trouvé
        </Typography>
      </Box>
    );
  }

  const progress = calculateProgress();

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

      {/* En-tête avec informations employé */}
      <Card elevation={0} sx={{ border: '1px solid #e0e0e0', borderRadius: 2, mb: 3 }}>
        <CardContent>
          <Grid container spacing={3} alignItems="center">
            <Grid item xs={12} md={4}>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Avatar
                  src={employee.photo ? `http://localhost:8000${employee.photo}` : null}
                  sx={{
                    mr: 3,
                    backgroundColor: '#1976d2',
                    width: 80,
                    height: 80
                  }}
                >
                  {!employee.photo && (
                    `${employee.user?.first_name?.[0] || ''}${employee.user?.last_name?.[0] || ''}`
                  )}
                </Avatar>
                <Box>
                  <Typography variant="h5" fontWeight="600">
                    {employee.user?.first_name} {employee.user?.last_name}
                  </Typography>
                  <Typography variant="body1" color="text.secondary">
                    {employee.poste}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Matricule: {employee.matricule}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Email: {employee.user?.email}
                  </Typography>
                  {employee.assigned_manager && (
                    <Typography variant="body2" color="text.secondary">
                      Manager: {employee.assigned_manager.name} ({employee.assigned_manager.matricule})
                    </Typography>
                  )}
                </Box>
              </Box>
            </Grid>

            <Grid item xs={12} md={4}>
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="h3" fontWeight="bold" color={getStatusColor(progress)}>
                  {progress}%
                </Typography>
                <Typography variant="body1" color="text.secondary" gutterBottom>
                  Progression Intégration
                </Typography>
                <LinearProgress
                  variant="determinate"
                  value={progress}
                  sx={{
                    height: 10,
                    borderRadius: 5,
                    backgroundColor: '#e0e0e0',
                    '& .MuiLinearProgress-bar': {
                      backgroundColor: getStatusColor(progress),
                    }
                  }}
                />
              </Box>
            </Grid>

            <Grid item xs={12} md={4}>
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="h4" fontWeight="bold" color={getStatusColor(progress)}>
                  {checklist.filter(item => item.is_completed).length}/{checklist.length}
                </Typography>
                <Typography variant="body1" color="text.secondary">
                  Tâches Complétées
                </Typography>
                <Chip 
                  label={`${trainings.filter(t => t.is_completed).length}/${trainings.length} formations`}
                  color="primary"
                  sx={{ mt: 1 }}
                />
              </Box>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Onglets */}
      <Card elevation={0} sx={{ border: '1px solid #e0e0e0', borderRadius: 2 }}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={tabValue} onChange={(e, newValue) => setTabValue(newValue)}>
            <Tab label="Checklist d'Intégration" />
            <Tab label="Formations" />
            <Tab label="Statistiques" />
          </Tabs>
        </Box>

        <CardContent>
          {/* Onglet Checklist */}
          {tabValue === 0 && (
            <Box>
              <Typography variant="h6" fontWeight="600" gutterBottom>
                Checklist d'Intégration
              </Typography>
              
              {checklist.length === 0 ? (
                <Box sx={{ textAlign: 'center', py: 4 }}>
                  <Typography variant="body1" color="text.secondary">
                    Aucune checklist trouvée pour cet employé
                  </Typography>
                  <Button
                    variant="outlined"
                    sx={{ mt: 2 }}
                    onClick={async () => {
                      try {
                        await api.post('/onboarding/start/', { employee_id: id });
                        setAlert({ show: true, message: 'Checklist créée', severity: 'success' });
                        fetchChecklist();
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
                  {checklist.map((item) => (
                    <ListItem key={item.id} sx={{ px: 0 }}>
                      <ListItemAvatar>
                        <Checkbox
                          checked={item.is_completed}
                          onChange={() => toggleChecklistItem(item.id)}
                          color="primary"
                        />
                      </ListItemAvatar>
                      <ListItemText
                        primary={item.item_name}
                        secondary={item.completion_date ? 
                          `Complété le ${new Date(item.completion_date).toLocaleDateString()} par ${item.completed_by_name}` : 
                          'Non complété'
                        }
                        sx={{
                          textDecoration: item.is_completed ? 'line-through' : 'none',
                          opacity: item.is_completed ? 0.7 : 1
                        }}
                      />
                      {item.is_completed && (
                        <CheckCircleIcon sx={{ color: 'success.main', ml: 1 }} />
                      )}
                    </ListItem>
                  ))}
                </List>
              )}
            </Box>
          )}

          {/* Onglet Formations */}
          {tabValue === 1 && (
            <Box>
              <Typography variant="h6" fontWeight="600" gutterBottom>
                Formations d'Intégration
              </Typography>
              
              {trainings.length === 0 ? (
                <Typography variant="body1" color="text.secondary">
                  Aucune formation programmée
                </Typography>
              ) : (
                <List>
                  {trainings.map((training) => (
                    <ListItem key={training.id} sx={{ px: 0, mb: 2 }}>
                      <Card elevation={0} sx={{ width: '100%', border: '1px solid #e0e0e0' }}>
                        <CardContent>
                          <Grid container spacing={2}>
                            <Grid item xs={12} md={8}>
                              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                                <TrainingIcon sx={{ mr: 1, color: '#1976d2' }} />
                                <Typography variant="h6" fontWeight="600">
                                  {training.title}
                                </Typography>
                                {training.is_mandatory && (
                                  <Chip label="Obligatoire" size="small" color="error" sx={{ ml: 1 }} />
                                )}
                              </Box>
                              <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                                {training.description}
                              </Typography>
                              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                                <Chip 
                                  label={training.training_type === 'security' ? 'Sécurité' : 
                                        training.training_type === 'quality' ? 'Qualité' : 
                                        training.training_type === 'company_culture' ? 'Culture' : 
                                        training.training_type === 'processes' ? 'Processus' : 
                                        training.training_type}
                                  size="small" 
                                  variant="outlined"
                                />
                                <Chip 
                                  label={`${training.duration_hours}h`}
                                  size="small" 
                                  icon={<ScheduleIcon />}
                                  variant="outlined"
                                />
                              </Box>
                            </Grid>
                            <Grid item xs={12} md={4}>
                              <Box sx={{ textAlign: 'center' }}>
                                {training.is_completed ? (
                                  <>
                                    <CheckCircleIcon sx={{ fontSize: 48, color: '#2e7d32', mb: 1 }} />
                                    <Typography variant="body2" color="success.main" fontWeight="600">
                                      Terminée
                                    </Typography>
                                    {training.completion_date && (
                                      <Typography variant="caption" color="text.secondary">
                                        {new Date(training.completion_date).toLocaleDateString()}
                                      </Typography>
                                    )}
                                    {training.score && (
                                      <Typography variant="body2" fontWeight="600">
                                        Score: {training.score}/100
                                      </Typography>
                                    )}
                                  </>
                                ) : (
                                  <>
                                    <ScheduleIcon sx={{ fontSize: 48, color: '#ed6c02', mb: 1 }} />
                                    <Typography variant="body2" color="warning.main" fontWeight="600">
                                      Programmée
                                    </Typography>
                                    {training.scheduled_date && (
                                      <Typography variant="caption" color="text.secondary">
                                        {new Date(training.scheduled_date).toLocaleDateString()}
                                      </Typography>
                                    )}
                                    <Button
                                      size="small"
                                      variant="outlined"
                                      onClick={() => openTrainingDialog(training)}
                                      sx={{ mt: 1 }}
                                    >
                                      Marquer terminée
                                    </Button>
                                  </>
                                )}
                                {training.trainer && (
                                  <Typography variant="caption" color="text.secondary" display="block">
                                    Formateur: {training.trainer}
                                  </Typography>
                                )}
                              </Box>
                            </Grid>
                          </Grid>
                        </CardContent>
                      </Card>
                    </ListItem>
                  ))}
                </List>
              )}
            </Box>
          )}

          {/* Onglet Statistiques */}
          {tabValue === 2 && (
            <Box>
              <Typography variant="h6" fontWeight="600" gutterBottom>
                Statistiques d'Intégration
              </Typography>
              
              <Grid container spacing={3}>
                <Grid item xs={12} sm={6} md={3}>
                  <Card elevation={0} sx={{ backgroundColor: '#f5f5f5', textAlign: 'center', p: 2 }}>
                    <Typography variant="h4" fontWeight="bold" color="primary">
                      {checklist.length}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Total Tâches
                    </Typography>
                  </Card>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Card elevation={0} sx={{ backgroundColor: '#e8f5e8', textAlign: 'center', p: 2 }}>
                    <Typography variant="h4" fontWeight="bold" color="success.main">
                      {checklist.filter(item => item.is_completed).length}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Complétées
                    </Typography>
                  </Card>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Card elevation={0} sx={{ backgroundColor: '#fff3e0', textAlign: 'center', p: 2 }}>
                    <Typography variant="h4" fontWeight="bold" color="warning.main">
                      {checklist.filter(item => !item.is_completed).length}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      En Attente
                    </Typography>
                  </Card>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Card elevation={0} sx={{ backgroundColor: '#e3f2fd', textAlign: 'center', p: 2 }}>
                    <Typography variant="h4" fontWeight="bold" color="primary">
                      {trainings.filter(t => t.is_completed).length}/{trainings.length}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Formations
                    </Typography>
                  </Card>
                </Grid>
              </Grid>
            </Box>
          )}
        </CardContent>
      </Card>

      {/* Dialog pour marquer formation comme terminée */}
      <Dialog 
        open={trainingDialog.open} 
        onClose={() => setTrainingDialog({ open: false, training: null })}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          Marquer comme terminée - {trainingDialog.training?.title}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                type="date"
                label="Date de completion"
                value={completionData.completion_date}
                onChange={(e) => setCompletionData({ ...completionData, completion_date: e.target.value })}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                type="number"
                label="Score (sur 100)"
                value={completionData.score}
                onChange={(e) => setCompletionData({ ...completionData, score: e.target.value })}
                inputProps={{ min: 0, max: 100 }}
                helperText="Optionnel - Score obtenu à la formation"
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setTrainingDialog({ open: false, training: null })}>
            Annuler
          </Button>
          <Button 
            onClick={handleCompleteTraining}
            variant="contained"
            disabled={!completionData.completion_date}
          >
            Marquer terminée
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default EmployeeDetail;