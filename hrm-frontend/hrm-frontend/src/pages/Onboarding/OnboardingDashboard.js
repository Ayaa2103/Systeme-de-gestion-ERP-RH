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
  Checkbox,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material';
import {
  PersonAdd as PersonAddIcon,
  CheckCircle as CheckCircleIcon,
  Schedule as ScheduleIcon,
  Assignment as TaskIcon,
  School as TrainingIcon,
  Event as EventIcon,
  Visibility as ViewIcon
} from '@mui/icons-material';
import api from '../../services/api';

const OnboardingDashboard = () => {
  const [newEmployees, setNewEmployees] = useState([]);
  const [onboardingStats, setOnboardingStats] = useState({});
  const [checklistItems, setChecklistItems] = useState([]);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [checklistDialogOpen, setChecklistDialogOpen] = useState(false);

  useEffect(() => {
    fetchOnboardingData();
  }, []);

  const fetchOnboardingData = async () => {
    try {
      const [employeesResponse, statsResponse] = await Promise.all([
        api.get('/onboarding/new-employees/'),
        api.get('/onboarding/stats/')
      ]);
      
      setNewEmployees(Array.isArray(employeesResponse.data) ? employeesResponse.data : []);
      setOnboardingStats(statsResponse.data || {});
    } catch (error) {
      console.error('Erreur lors du chargement:', error);
      // Données de fallback
      setNewEmployees([]);
      setOnboardingStats({
        total_new_employees: 0,
        employees_in_progress: 0,
        completed_onboarding: 0,
        avg_progress: 0,
        pending_tasks: 0,
        pending_trainings: 0,
        pending_followups: 0
      });
    }
  };

  const openChecklist = async (employee) => {
    setSelectedEmployee(employee);
    try {
      const response = await api.get(`/onboarding/checklist/?employee=${employee.id}`);
      setChecklistItems(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error('Erreur lors du chargement de la checklist:', error);
      setChecklistItems([]);
    }
    setChecklistDialogOpen(true);
  };

  const StatCard = ({ title, value, icon, color, subtitle }) => (
    <Card
      elevation={0}
      sx={{
        background: `linear-gradient(135deg, ${color}15 0%, ${color}05 100%)`,
        border: `1px solid ${color}20`,
        borderRadius: 3,
        transition: 'all 0.3s ease',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: `0 8px 25px ${color}25`,
        }
      }}
    >
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box>
            <Typography variant="h3" fontWeight="bold" color={color}>
              {value}
            </Typography>
            <Typography variant="body1" color="text.secondary" fontWeight="500">
              {title}
            </Typography>
            {subtitle && (
              <Typography variant="body2" color="text.secondary">
                {subtitle}
              </Typography>
            )}
          </Box>
          <Avatar
            sx={{
              backgroundColor: color,
              width: 64,
              height: 64,
            }}
          >
            {icon}
          </Avatar>
        </Box>
      </CardContent>
    </Card>
  );

  return (
    <Box>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" fontWeight="bold" gutterBottom>
          Tableau de Bord Intégration
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Suivi de l'intégration des nouveaux employés
        </Typography>
      </Box>

      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Nouveaux Employés"
            value={onboardingStats.total_new_employees || 0}
            icon={<PersonAddIcon />}
            color="#1976d2"
            subtitle="Ce mois"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="En Cours"
            value={onboardingStats.employees_in_progress || 0}
            icon={<ScheduleIcon />}
            color="#ed6c02"
            subtitle="Intégration active"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Terminés"
            value={onboardingStats.completed_onboarding || 0}
            icon={<CheckCircleIcon />}
            color="#2e7d32"
            subtitle="Intégration complète"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Progression Moy."
            value={`${onboardingStats.avg_progress || 0}%`}
            icon={<TaskIcon />}
            color="#1976d2"
            subtitle="Moyenne générale"
          />
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        <Grid item xs={12} lg={8}>
          <Card elevation={0} sx={{ border: '1px solid #e0e0e0', borderRadius: 2 }}>
            <CardContent>
              <Typography variant="h6" fontWeight="600" gutterBottom>
                Nouveaux Employés - Intégration en Cours
              </Typography>
              
              {Array.isArray(newEmployees) && newEmployees.map((employee) => (
                <Card
                  key={employee.id}
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
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <Avatar
                        sx={{
                          mr: 2,
                          backgroundColor: '#1976d2',
                          width: 48,
                          height: 48
                        }}
                      >
                        {employee.user_data?.first_name?.[0]}{employee.user_data?.last_name?.[0]}
                      </Avatar>
                      <Box sx={{ flex: 1 }}>
                        <Typography variant="h6" fontWeight="600">
                          {employee.user_data?.first_name} {employee.user_data?.last_name}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {employee.poste} • {employee.matricule}
                        </Typography>
                      </Box>
                      <IconButton onClick={() => openChecklist(employee)}>
                        <ViewIcon />
                      </IconButton>
                    </Box>

                    <Box sx={{ mb: 2 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                        <Typography variant="body2" fontWeight="600">
                          Progression Intégration
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {employee.onboarding_progress}%
                        </Typography>
                      </Box>
                      <LinearProgress
                        variant="determinate"
                        value={employee.onboarding_progress}
                        sx={{
                          height: 8,
                          borderRadius: 4,
                          backgroundColor: '#e0e0e0',
                          '& .MuiLinearProgress-bar': {
                            backgroundColor: employee.onboarding_progress < 50 ? '#ed6c02' : 
                                            employee.onboarding_progress < 100 ? '#1976d2' : '#2e7d32',
                          }
                        }}
                      />
                    </Box>

                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Typography variant="caption" color="text.secondary">
                        {employee.user_data?.email}
                      </Typography>
                      <Button
                        size="small"
                        variant="outlined"
                        onClick={() => openChecklist(employee)}
                      >
                        Voir Checklist
                      </Button>
                    </Box>
                  </CardContent>
                </Card>
              ))}
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} lg={4}>
          <Card elevation={0} sx={{ border: '1px solid #e0e0e0', borderRadius: 2 }}>
            <CardContent>
              <Typography variant="h6" fontWeight="600" gutterBottom>
                Tâches Prioritaires
              </Typography>
              
              <List>
                <ListItem sx={{ px: 0 }}>
                  <ListItemAvatar>
                    <Avatar sx={{ backgroundColor: '#ed6c02' }}>
                      <TaskIcon />
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary="Tâches en attente"
                    secondary={`${onboardingStats.pending_tasks || 0} tâches à compléter`}
                  />
                  <Chip label="En attente" color="warning" size="small" />
                </ListItem>

                <ListItem sx={{ px: 0 }}>
                  <ListItemAvatar>
                    <Avatar sx={{ backgroundColor: '#1976d2' }}>
                      <TrainingIcon />
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary="Formations en attente"
                    secondary={`${onboardingStats.pending_trainings || 0} formations à compléter`}
                  />
                  <Chip label="Programmé" color="primary" size="small" />
                </ListItem>
              </List>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Dialog 
        open={checklistDialogOpen} 
        onClose={() => setChecklistDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          Checklist d'Intégration - {selectedEmployee?.user_data?.first_name} {selectedEmployee?.user_data?.last_name}
        </DialogTitle>
        <DialogContent>
          <List>
            {Array.isArray(checklistItems) && checklistItems.map((item) => (
              <ListItem key={item.id} sx={{ px: 0 }}>
                <Checkbox
                  checked={item.is_completed}
                  color="primary"
                />
                <ListItemText
                  primary={item.item_name}
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
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setChecklistDialogOpen(false)}>
            Fermer
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default OnboardingDashboard;