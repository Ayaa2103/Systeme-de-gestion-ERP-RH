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
  Alert
} from '@mui/material';
import {
  Assignment as TaskIcon,
  School as TrainingIcon,
  Description as DocumentIcon,
  CheckCircle as CompletedIcon,
  Schedule as PendingIcon,
  TrendingUp as ProgressIcon
} from '@mui/icons-material';
import { onboardingService } from '../../services/onboardingService';



const MyOnboarding = () => {

  const [onboardingData, setOnboardingData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOnboardingData();
  }, []);

  const fetchOnboardingData = async () => {
    try {
      setLoading(true);
      console.log('Fetching onboarding data...');
      const data = await onboardingService.getMyOnboarding();
      console.log('Onboarding data received:', data);
      setOnboardingData(data);
    } catch (error) {
      console.error('Erreur lors du chargement de l\'intégration:', error);
      console.error('Error details:', error.response?.data);
    } finally {
      setLoading(false);
    }
  };



  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('fr-FR');
  };

  const getStatusColor = (isCompleted) => {
    return isCompleted ? 'success' : 'warning';
  };

  const getStatusIcon = (isCompleted) => {
    return isCompleted ? <CompletedIcon color="success" /> : <PendingIcon color="warning" />;
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

  if (!onboardingData?.has_plan) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Alert severity="info">
          <Typography variant="h6">Aucun plan d'intégration</Typography>
          <Typography>
            Vous n'avez pas encore de plan d'intégration assigné. Contactez votre responsable RH.
          </Typography>
        </Alert>
      </Container>
    );
  }

  const { employee, onboarding_plan, tasks, trainings, documents, stats } = onboardingData;

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box mb={4}>
        <Typography variant="h4" fontWeight="bold" gutterBottom>
          🎯 Mon Processus d'Intégration
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Bienvenue {employee?.name} ! Suivez votre progression d'intégration
        </Typography>
      </Box>

      {/* Statistiques de progression */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="h4" color="primary" fontWeight="bold">
                {stats.overall_progress}%
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Progression Globale
              </Typography>
              <LinearProgress 
                variant="determinate" 
                value={stats.overall_progress} 
                sx={{ mt: 1, height: 8, borderRadius: 4 }}
              />
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="h4" color="success.main" fontWeight="bold">
                {stats.tasks.completed}/{stats.tasks.total}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Tâches Terminées
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="h4" color="info.main" fontWeight="bold">
                {stats.trainings.completed}/{stats.trainings.total}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Formations Complétées
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="h4" color="warning.main" fontWeight="bold">
                {stats.documents.signed}/{stats.documents.total}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Documents Signés
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Informations du plan */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Plan d'Intégration
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} md={4}>
              <Typography variant="body2" color="text.secondary">Date de début</Typography>
              <Typography variant="body1">{formatDate(onboarding_plan.start_date)}</Typography>
            </Grid>
            <Grid item xs={12} md={4}>
              <Typography variant="body2" color="text.secondary">Date prévue de fin</Typography>
              <Typography variant="body1">{formatDate(onboarding_plan.expected_completion_date)}</Typography>
            </Grid>
            <Grid item xs={12} md={4}>
              <Typography variant="body2" color="text.secondary">Statut</Typography>
              <Chip 
                label={onboarding_plan.status === 'in_progress' ? 'En cours' : onboarding_plan.status}
                color={onboarding_plan.status === 'completed' ? 'success' : 'primary'}
              />
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Section Mes Tâches - Pleine largeur */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <TaskIcon color="success" /> Mes Tâches
          </Typography>
          {tasks.length === 0 ? (
            <Alert severity="info">Aucune tâche assignée</Alert>
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
                  {getStatusIcon(task.is_completed)}
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
                      Terminé le {formatDate(task.completion_date)}
                    </Typography>
                  )}
                </Box>
                <Box>
                  <Chip 
                    label={task.is_completed ? 'Terminé' : 'En attente'}
                    color={getStatusColor(task.is_completed)}
                    size="small"
                  />
                </Box>
              </Box>
            ))
          )}
        </CardContent>
      </Card>

      {/* Section inférieure - 2 colonnes */}
      <Grid container spacing={3}>
        {/* Mes Formations */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <TrainingIcon color="info" /> Mes Formations
              </Typography>
              {trainings.length === 0 ? (
                <Alert severity="info">Aucune formation programmée</Alert>
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
                      {getStatusIcon(training.is_completed)}
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
                          Terminée le {formatDate(training.completion_date)}
                          {training.score && ` | Score: ${training.score}/100`}
                        </Typography>
                      )}
                    </Box>
                    <Box>
                      <Chip 
                        label={training.is_completed ? 'Terminée' : 'Programmée'}
                        color={training.is_completed ? 'success' : 'info'}
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
              <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <DocumentIcon color="warning" /> 📅 Suivis Prévus
              </Typography>
              {(!onboardingData.followups || onboardingData.followups.length === 0) ? (
                <Alert severity="info">Aucun suivi programmé</Alert>
              ) : (
                onboardingData.followups.map((followup) => (
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
                      {getStatusIcon(followup.is_completed)}
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
                          Effectué le {formatDate(followup.conducted_date)}
                          {followup.overall_rating && ` | Note: ${followup.overall_rating}/5`}
                        </Typography>
                      )}
                    </Box>
                    <Box>
                      <Chip 
                        label={followup.is_completed ? 'Effectué' : 'Programmé'}
                        color={followup.is_completed ? 'success' : 'warning'}
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

export default MyOnboarding;