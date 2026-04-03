import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  Box,
  LinearProgress,
  Chip,
  Alert,
  Button
} from '@mui/material';
import {
  CheckCircle as CompletedIcon,
  Schedule as PendingIcon,
  Assignment as TaskIcon,
  School as TrainingIcon,
  CalendarToday as CalendarIcon
} from '@mui/icons-material';
import api from '../../services/api';

const EmployeeOnboarding = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const response = await api.get('/onboarding/my-onboarding/');
      setData(response.data);
    } catch (error) {
      console.error('Error fetching onboarding data:', error);
      setError('Erreur de chargement des données');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('fr-FR');
  };

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <LinearProgress />
        <Typography variant="h6" sx={{ mt: 2 }}>
          Chargement de votre intégration...
        </Typography>
      </Container>
    );
  }

  if (error || !data?.has_plan) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Alert severity="info">
          <Typography variant="h6">Aucun plan d'intégration</Typography>
          <Typography>
            {error || 'Vous n\'avez pas encore de plan d\'intégration assigné. Contactez votre responsable RH.'}
          </Typography>
        </Alert>
      </Container>
    );
  }

  const { employee, tasks, trainings, followups, stats } = data;

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      {/* Header */}
      <Box mb={4}>
        <Typography variant="h4" fontWeight="bold" gutterBottom>
          🎯 Mon Processus d'Intégration
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Bienvenue {employee?.name} ! Suivez votre progression d'intégration
        </Typography>
      </Box>

      {/* Statistics Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={4}>
          <Card sx={{ borderLeft: 4, borderColor: 'success.main' }}>
            <CardContent>
              <Box display="flex" justifyContent="space-between" alignItems="center">
                <Box>
                  <Typography variant="caption" color="success.main" fontWeight="bold">
                    MES TÂCHES
                  </Typography>
                  <Typography variant="h4" fontWeight="bold">
                    {stats?.tasks?.completed || 0}/{stats?.tasks?.total || 0}
                  </Typography>
                </Box>
                <TaskIcon sx={{ fontSize: 40, color: 'grey.300' }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card sx={{ borderLeft: 4, borderColor: 'info.main' }}>
            <CardContent>
              <Box display="flex" justifyContent="space-between" alignItems="center">
                <Box>
                  <Typography variant="caption" color="info.main" fontWeight="bold">
                    FORMATIONS
                  </Typography>
                  <Typography variant="h4" fontWeight="bold">
                    {stats?.trainings?.completed || 0}/{stats?.trainings?.total || 0}
                  </Typography>
                </Box>
                <TrainingIcon sx={{ fontSize: 40, color: 'grey.300' }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card sx={{ borderLeft: 4, borderColor: 'warning.main' }}>
            <CardContent>
              <Box display="flex" justifyContent="space-between" alignItems="center">
                <Box>
                  <Typography variant="caption" color="warning.main" fontWeight="bold">
                    PROGRESSION
                  </Typography>
                  <Box display="flex" alignItems="center" gap={1}>
                    <Typography variant="h4" fontWeight="bold">
                      {stats?.overall_progress || 0}%
                    </Typography>
                    <LinearProgress 
                      variant="determinate" 
                      value={stats?.overall_progress || 0}
                      sx={{ flex: 1, height: 8, borderRadius: 4 }}
                    />
                  </Box>
                </Box>
                <CalendarIcon sx={{ fontSize: 40, color: 'grey.300' }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Mes Tâches - Full Width */}
      <Card sx={{ mb: 4 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom color="success.main" fontWeight="bold">
            ✅ Mes Tâches
          </Typography>
          {!tasks || tasks.length === 0 ? (
            <Typography color="text.secondary" textAlign="center">
              Aucune tâche assignée
            </Typography>
          ) : (
            tasks.map((task) => (
              <Box key={task.id} sx={{
                display: 'flex',
                alignItems: 'center',
                mb: 2,
                p: 2,
                border: 1,
                borderColor: 'divider',
                borderRadius: 1
              }}>
                <Box sx={{ mr: 2 }}>
                  {task.is_completed ? 
                    <CompletedIcon sx={{ fontSize: 32, color: 'success.main' }} /> :
                    <PendingIcon sx={{ fontSize: 32, color: 'warning.main' }} />
                  }
                </Box>
                <Box sx={{ flex: 1 }}>
                  <Typography variant="subtitle1" fontWeight="bold">
                    {task.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {task.description}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Échéance: {formatDate(task.due_date)}
                  </Typography>
                  {task.is_completed && task.completion_date && (
                    <Typography variant="caption" color="success.main" display="block">
                      ✓ Terminé le {formatDate(task.completion_date)}
                    </Typography>
                  )}
                </Box>
                <Box>
                  {task.is_completed ? (
                    <Chip label="Terminé" color="success" size="small" />
                  ) : (
                    <Button variant="contained" color="success" size="small">
                      Terminer
                    </Button>
                  )}
                </Box>
              </Box>
            ))
          )}
        </CardContent>
      </Card>

      {/* Bottom Section - 2 Columns */}
      <Grid container spacing={3}>
        {/* Mes Formations */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom color="info.main" fontWeight="bold">
                🎓 Mes Formations
              </Typography>
              {!trainings || trainings.length === 0 ? (
                <Typography color="text.secondary" textAlign="center">
                  Aucune formation programmée
                </Typography>
              ) : (
                trainings.map((training) => (
                  <Box key={training.id} sx={{
                    display: 'flex',
                    alignItems: 'center',
                    mb: 2,
                    p: 2,
                    border: 1,
                    borderColor: 'divider',
                    borderRadius: 1
                  }}>
                    <Box sx={{ mr: 2 }}>
                      {training.is_completed ? 
                        <CompletedIcon sx={{ fontSize: 32, color: 'success.main' }} /> :
                        <TrainingIcon sx={{ fontSize: 32, color: 'info.main' }} />
                      }
                    </Box>
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="subtitle1" fontWeight="bold">
                        {training.title}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {training.description}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Durée: {training.duration_hours}h
                        {training.scheduled_date && ` | Programmée: ${formatDate(training.scheduled_date)}`}
                      </Typography>
                      {training.is_completed && (
                        <Typography variant="caption" color="success.main" display="block">
                          ✓ Terminée le {formatDate(training.completion_date)}
                          {training.score && ` | Score: ${training.score}/100`}
                        </Typography>
                      )}
                    </Box>
                    <Box>
                      <Chip 
                        label={training.is_completed ? "Terminée" : "Programmée"}
                        color={training.is_completed ? "success" : "info"}
                        size="small"
                      />
                    </Box>
                  </Box>
                ))
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Suivis Prévus */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom color="warning.main" fontWeight="bold">
                📅 Suivis Prévus
              </Typography>
              {!followups || followups.length === 0 ? (
                <Typography color="text.secondary" textAlign="center">
                  Aucun suivi programmé
                </Typography>
              ) : (
                followups.map((followup) => (
                  <Box key={followup.id} sx={{
                    display: 'flex',
                    alignItems: 'center',
                    mb: 2,
                    p: 2,
                    border: 1,
                    borderColor: 'divider',
                    borderRadius: 1
                  }}>
                    <Box sx={{ mr: 2 }}>
                      {followup.is_completed ? 
                        <CompletedIcon sx={{ fontSize: 32, color: 'success.main' }} /> :
                        <CalendarIcon sx={{ fontSize: 32, color: 'warning.main' }} />
                      }
                    </Box>
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="subtitle1" fontWeight="bold">
                        {followup.follow_up_type_display || followup.follow_up_type}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Programmé: {formatDate(followup.scheduled_date)}
                      </Typography>
                      {followup.is_completed && followup.conducted_date && (
                        <Typography variant="caption" color="success.main" display="block">
                          ✓ Effectué le {formatDate(followup.conducted_date)}
                          {followup.overall_rating && ` | Note: ${followup.overall_rating}/5`}
                        </Typography>
                      )}
                    </Box>
                    <Box>
                      <Chip 
                        label={followup.is_completed ? "Effectué" : "Programmé"}
                        color={followup.is_completed ? "success" : "warning"}
                        size="small"
                      />
                    </Box>
                  </Box>
                ))
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Container>
  );
};

export default EmployeeOnboarding;