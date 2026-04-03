import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box, Card, CardContent, Typography, Grid, Button, Avatar,
  Chip, Alert, CircularProgress, Paper, Dialog, DialogTitle, DialogContent, DialogActions, TextField
} from '@mui/material';
import {
  Person, Assignment, School, Business, Psychology,
  TrendingUp, Work, Recommend, WorkOutline, Send, PersonAdd,
  ChevronLeft, ChevronRight, Today
} from '@mui/icons-material';
import { getEmployeeDashboard } from '../../services/employeeService';
import { jobService } from '../../services/jobService';
import api from '../../services/api';

const EmployeeCalendar = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());

  const monthNames = [
    'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
    'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'
  ];

  const dayNames = ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'];

  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];
    
    for (let i = startingDayOfWeek - 1; i >= 0; i--) {
      const prevDate = new Date(year, month, -i);
      days.push({ date: prevDate, isCurrentMonth: false });
    }
    
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day);
      days.push({ date, isCurrentMonth: true });
    }
    
    const remainingDays = 42 - days.length;
    for (let day = 1; day <= remainingDays; day++) {
      const nextDate = new Date(year, month + 1, day);
      days.push({ date: nextDate, isCurrentMonth: false });
    }
    
    return days;
  };

  const isToday = (date) => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  const isSelected = (date) => {
    return date.toDateString() === selectedDate.toDateString();
  };

  const navigateMonth = (direction) => {
    const newDate = new Date(currentDate);
    newDate.setMonth(currentDate.getMonth() + direction);
    setCurrentDate(newDate);
  };

  const days = getDaysInMonth(currentDate);

  return (
    <Card elevation={0} sx={{ borderRadius: 3, border: '1px solid #e0e0e0' }}>
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
          <Typography variant="h6" fontWeight="600">
            📅 {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
          </Typography>
          <Box>
            <Button size="small" onClick={() => navigateMonth(-1)} sx={{ minWidth: 'auto', p: 1 }}>
              <ChevronLeft />
            </Button>
            <Button size="small" onClick={() => setCurrentDate(new Date())} sx={{ minWidth: 'auto', p: 1, mx: 1 }}>
              <Today />
            </Button>
            <Button size="small" onClick={() => navigateMonth(1)} sx={{ minWidth: 'auto', p: 1 }}>
              <ChevronRight />
            </Button>
          </Box>
        </Box>
        
        <Grid container spacing={0} sx={{ mb: 1 }}>
          {dayNames.map((day) => (
            <Grid item key={day} sx={{ width: '14.28%', textAlign: 'center' }}>
              <Typography variant="caption" fontWeight="600" color="text.secondary">
                {day}
              </Typography>
            </Grid>
          ))}
        </Grid>
        
        <Grid container spacing={0}>
          {days.map((dayObj, index) => (
            <Grid item key={index} sx={{ width: '14.28%', textAlign: 'center' }}>
              <Button
                onClick={() => setSelectedDate(dayObj.date)}
                sx={{
                  minWidth: 'auto',
                  width: '100%',
                  height: 36,
                  p: 0,
                  fontSize: '0.875rem',
                  backgroundColor: isToday(dayObj.date) 
                    ? 'primary.main' 
                    : isSelected(dayObj.date) 
                    ? 'primary.light' 
                    : 'transparent',
                  color: isToday(dayObj.date) || isSelected(dayObj.date) ? 'white' : 
                         dayObj.isCurrentMonth ? 'text.primary' : 'text.disabled',
                  '&:hover': {
                    backgroundColor: isToday(dayObj.date) 
                      ? 'primary.dark' 
                      : 'action.hover'
                  },
                  borderRadius: 1
                }}
              >
                {dayObj.date.getDate()}
              </Button>
            </Grid>
          ))}
        </Grid>
        
        <Box sx={{ mt: 2, p: 2, backgroundColor: '#f8fafc', borderRadius: 2, textAlign: 'center' }}>
          <Typography variant="body2" color="primary" fontWeight="600">
            📍 {selectedDate.toLocaleDateString('fr-FR', { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}
          </Typography>
        </Box>
      </CardContent>
    </Card>
  );
};

const EmployeeEventsList = () => {
  const [events, setEvents] = useState([]);
  
  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const response = await api.get('/events/');
        setEvents(response.data.slice(0, 3));
      } catch (error) {
        console.error('Events fetch error:', error);
      }
    };
    fetchEvents();
  }, []);
  
  return (
    <Box sx={{ mt: 2 }}>
      {events.length > 0 ? events.map((event, index) => (
        <Box
          key={event.id || index}
          sx={{
            display: 'flex',
            alignItems: 'center',
            p: 2,
            mb: 1,
            backgroundColor: '#f8fafc',
            borderRadius: 2,
            border: '1px solid #e2e8f0',
          }}
        >
          <Avatar
            sx={{
              backgroundColor: '#1976d2',
              width: 32,
              height: 32,
              mr: 2
            }}
          >
            <Business sx={{ fontSize: 16 }} />
          </Avatar>
          <Box sx={{ flex: 1 }}>
            <Typography variant="body2" fontWeight="600">
              {event.title || event.name}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {new Date(event.date).toLocaleDateString('fr-FR')}
            </Typography>
          </Box>
        </Box>
      )) : (
        <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 2 }}>
          Aucun événement à venir
        </Typography>
      )}
    </Box>
  );
};

const EmployeeDashboard = () => {
  const navigate = useNavigate();
  const [dashboardData, setDashboardData] = useState(null);
  const [jobOffers, setJobOffers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedJob, setSelectedJob] = useState(null);
  const [applyDialog, setApplyDialog] = useState(false);
  const [recommendDialog, setRecommendDialog] = useState(false);
  const [applicationData, setApplicationData] = useState({ cover_letter: '', resume_text: '' });
  const [recommendationData, setRecommendationData] = useState({ candidate_name: '', candidate_email: '', candidate_phone: '', relationship: '', recommendation_reason: '' });

  useEffect(() => {
    const loadData = async () => {
      await fetchDashboardData();
      await fetchJobOffers();
    };
    loadData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const response = await getEmployeeDashboard();
      setDashboardData(response.data);
    } catch (error) {
      setError('Erreur lors du chargement du tableau de bord');
      console.error('Dashboard fetch error:', error);
    }
  };

  const fetchJobOffers = async () => {
    try {
      const response = await api.get('/recruitment/public-jobs/');
      setJobOffers(response.data.slice(0, 3) || []);
      setLoading(false);
    } catch (error) {
      console.error('Job offers fetch error:', error);
      setLoading(false);
    }
  };

  const handleApply = async () => {
    try {
      await jobService.applyToJob(selectedJob.id, applicationData);
      setApplyDialog(false);
      setApplicationData({ cover_letter: '', resume_text: '' });
      alert('Candidature envoyée avec succès!');
    } catch (error) {
      alert('Erreur lors de l\'envoi de la candidature');
    }
  };

  const handleRecommend = async () => {
    try {
      await jobService.recommendProfile(selectedJob.id, recommendationData);
      setRecommendDialog(false);
      setRecommendationData({ candidate_name: '', candidate_email: '', candidate_phone: '', relationship: '', recommendation_reason: '' });
      alert('Recommandation envoyée avec succès!');
    } catch (error) {
      alert('Erreur lors de l\'envoi de la recommandation');
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h4" fontWeight="bold" sx={{ mb: 3 }}>
        Tableau de Bord Employé
      </Typography>

      {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

      <Grid container spacing={3}>
        <Grid item xs={12} sm={6} md={4}>
          <Card sx={{ height: '100%', cursor: 'pointer' }} onClick={() => navigate('/profile')}>
            <CardContent sx={{ textAlign: 'center' }}>
              <Person sx={{ fontSize: 48, color: 'primary.main', mb: 2 }} />
              <Typography variant="h6" gutterBottom>Mon Profil</Typography>
              <Typography variant="body2" color="text.secondary">
                Consulter et gérer mes informations personnelles
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={4}>
          <Card sx={{ height: '100%', cursor: 'pointer' }} onClick={() => navigate('/employee/requests')}>
            <CardContent sx={{ textAlign: 'center' }}>
              <Assignment sx={{ fontSize: 48, color: 'primary.main', mb: 2 }} />
              <Typography variant="h6" gutterBottom>Mes Demandes</Typography>
              <Typography variant="body2" color="text.secondary">
                Consulter le statut de mes demandes
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={4}>
          <Card sx={{ height: '100%', cursor: 'pointer' }} onClick={() => navigate('/employee/requests/create-leave')}>
            <CardContent sx={{ textAlign: 'center' }}>
              <TrendingUp sx={{ fontSize: 48, color: 'success.main', mb: 2 }} />
              <Typography variant="h6" gutterBottom>Demande de Congé</Typography>
              <Typography variant="body2" color="text.secondary">
                Demander un congé
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={4}>
          <Card sx={{ height: '100%', cursor: 'pointer' }} onClick={() => navigate('/employee/requests/create-attestation')}>
            <CardContent sx={{ textAlign: 'center' }}>
              <Work sx={{ fontSize: 48, color: 'info.main', mb: 2 }} />
              <Typography variant="h6" gutterBottom>Demande d'Attestation</Typography>
              <Typography variant="body2" color="text.secondary">
                Demander une attestation de travail
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={4}>
          <Card sx={{ height: '100%', cursor: 'pointer' }} onClick={() => navigate('/employee/trainings')}>
            <CardContent sx={{ textAlign: 'center' }}>
              <School sx={{ fontSize: 48, color: 'warning.main', mb: 2 }} />
              <Typography variant="h6" gutterBottom>Mes Formations</Typography>
              <Typography variant="body2" color="text.secondary">
                Consulter mes formations assignées
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={4}>
          <Card sx={{ height: '100%', cursor: 'pointer' }} onClick={() => navigate('/employee/knowledge')}>
            <CardContent sx={{ textAlign: 'center' }}>
              <Psychology sx={{ fontSize: 48, color: 'info.main', mb: 2 }} />
              <Typography variant="h6" gutterBottom>Formation et Connaissances</Typography>
              <Typography variant="body2" color="text.secondary">
                Consulter mes compétences et documents
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={4}>
          <Card sx={{ height: '100%', cursor: 'pointer' }} onClick={() => navigate('/employee/events')}>
            <CardContent sx={{ textAlign: 'center' }}>
              <Business sx={{ fontSize: 48, color: 'secondary.main', mb: 2 }} />
              <Typography variant="h6" gutterBottom>Événements</Typography>
              <Typography variant="body2" color="text.secondary">
                Consulter les événements d'entreprise
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={4}>
          <Card sx={{ height: '100%', cursor: 'pointer' }} onClick={() => navigate('/employee/culture')}>
            <CardContent sx={{ textAlign: 'center' }}>
              <Business sx={{ fontSize: 48, color: 'secondary.main', mb: 2 }} />
              <Typography variant="h6" gutterBottom>Culture d'Entreprise</Typography>
              <Typography variant="body2" color="text.secondary">
                Découvrir notre culture et faire des suggestions
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Grid container spacing={3} sx={{ mt: 2 }}>
        <Grid item xs={12}>
          <Card 
            elevation={0} 
            sx={{ 
              borderRadius: 3, 
              background: 'linear-gradient(135deg, #28a745 0%, #20c997 100%)',
              color: 'white'
            }}
          >
            <CardContent>
              <Typography variant="h6" fontWeight="600" gutterBottom sx={{ color: 'white' }}>
                💼 Offres d'Emploi Actives
              </Typography>
              {jobOffers.length > 0 ? (
                <Grid container spacing={2}>
                  {jobOffers.map((job) => (
                    <Grid item xs={12} md={4} key={job.id}>
                      <Box
                        sx={{
                          background: 'rgba(255,255,255,0.1)',
                          padding: 2,
                          borderRadius: 2,
                          minWidth: 280
                        }}
                      >
                        <Typography variant="subtitle1" fontWeight="600" sx={{ mb: 1, color: 'white' }}>
                          {job.title}
                        </Typography>
                        <Typography variant="body2" sx={{ opacity: 0.9, mb: 0.5, color: 'white' }}>
                          📍 {job.department}
                        </Typography>
                        <Typography variant="body2" sx={{ opacity: 0.9, mb: 1, color: 'white' }}>
                          🎯 {job.experience_level_display || job.experience_level}
                        </Typography>
                        <Typography variant="body2" sx={{ opacity: 0.8, mb: 2, color: 'white' }}>
                          {job.description?.substring(0, 100)}...
                        </Typography>
                        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                          <Button 
                            size="small" 
                            variant="contained" 
                            sx={{ bgcolor: 'rgba(255,255,255,0.2)', '&:hover': { bgcolor: 'rgba(255,255,255,0.3)' } }}
                            onClick={() => navigate(`/employee/apply/${job.id}`)}
                            startIcon={<Send />}
                          >
                            Postuler
                          </Button>
                          <Button 
                            size="small" 
                            variant="outlined" 
                            sx={{ color: 'white', borderColor: 'rgba(255,255,255,0.5)', '&:hover': { borderColor: 'white' } }}
                            onClick={() => navigate(`/employee/recommend/${job.id}`)}
                            startIcon={<PersonAdd />}
                          >
                            Recommander
                          </Button>
                        </Box>
                      </Box>
                    </Grid>
                  ))}
                </Grid>
              ) : (
                <Box sx={{ textAlign: 'center', py: 3 }}>
                  <Avatar sx={{ backgroundColor: 'rgba(255,255,255,0.1)', width: 60, height: 60, mx: 'auto', mb: 2 }}>
                    <WorkOutline sx={{ color: 'white' }} />
                  </Avatar>
                  <Typography variant="body2" sx={{ color: 'white', opacity: 0.75 }}>
                    Aucune offre d'emploi active
                  </Typography>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Événements à venir et Calendrier */}
      <Grid container spacing={3} sx={{ mt: 2 }}>
        <Grid item xs={12} md={4}>
          <Card elevation={0} sx={{ borderRadius: 3, border: '1px solid #e0e0e0' }}>
            <CardContent>
              <Typography variant="h6" fontWeight="600" gutterBottom>
                🎉 Nouveaux Employés du Jour
              </Typography>
              {dashboardData?.new_employees_today?.length > 0 ? (
                <Box sx={{ mt: 2 }}>
                  {dashboardData.new_employees_today.map((emp) => (
                    <Box
                      key={emp.id}
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        p: 2,
                        mb: 1,
                        backgroundColor: '#f8fafc',
                        borderRadius: 2,
                        border: '1px solid #e2e8f0',
                      }}
                    >
                      <Avatar
                        src={emp.photo ? `http://localhost:8000${emp.photo}` : undefined}
                        sx={{
                          backgroundColor: '#10b981',
                          width: 40,
                          height: 40,
                          mr: 2
                        }}
                      >
                        {!emp.photo && `${emp.user_data?.first_name?.[0]}${emp.user_data?.last_name?.[0]}`}
                      </Avatar>
                      <Box sx={{ flex: 1 }}>
                        <Typography variant="body2" fontWeight="600">
                          {emp.user_data?.first_name} {emp.user_data?.last_name}
                        </Typography>
                        <Typography variant="caption" color="text.secondary" display="block">
                          {emp.poste || 'Nouveau membre'}
                        </Typography>
                        <Typography variant="caption" color="primary">
                          {emp.department_name || 'Non assigné'}
                        </Typography>
                      </Box>
                    </Box>
                  ))}
                </Box>
              ) : (
                <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 2 }}>
                  Aucun nouvel employé aujourd'hui
                </Typography>
              )}
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} md={4}>
          <Card elevation={0} sx={{ borderRadius: 3, border: '1px solid #e0e0e0' }}>
            <CardContent>
              <Typography variant="h6" fontWeight="600" gutterBottom>
                Événements à venir
              </Typography>
              <EmployeeEventsList />
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} md={4}>
          <EmployeeCalendar />
        </Grid>
      </Grid>

      <Dialog open={applyDialog} onClose={() => setApplyDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>Postuler pour {selectedJob?.title}</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            multiline
            rows={4}
            label="Lettre de motivation"
            value={applicationData.cover_letter}
            onChange={(e) => setApplicationData({...applicationData, cover_letter: e.target.value})}
            sx={{ mb: 2, mt: 1 }}
          />
          <TextField
            fullWidth
            multiline
            rows={6}
            label="CV (texte)"
            value={applicationData.resume_text}
            onChange={(e) => setApplicationData({...applicationData, resume_text: e.target.value})}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setApplyDialog(false)}>Annuler</Button>
          <Button onClick={handleApply} variant="contained">Envoyer Candidature</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={recommendDialog} onClose={() => setRecommendDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>Recommander un profil pour {selectedJob?.title}</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label="Nom du candidat *"
            value={recommendationData.candidate_name}
            onChange={(e) => setRecommendationData({...recommendationData, candidate_name: e.target.value})}
            sx={{ mb: 2, mt: 1 }}
            required
          />
          <TextField
            fullWidth
            label="Email du candidat *"
            type="email"
            value={recommendationData.candidate_email}
            onChange={(e) => setRecommendationData({...recommendationData, candidate_email: e.target.value})}
            sx={{ mb: 2 }}
            required
          />
          <TextField
            fullWidth
            label="Téléphone"
            value={recommendationData.candidate_phone}
            onChange={(e) => setRecommendationData({...recommendationData, candidate_phone: e.target.value})}
            sx={{ mb: 2 }}
          />
          <TextField
            fullWidth
            label="Votre relation avec le candidat *"
            value={recommendationData.relationship}
            onChange={(e) => setRecommendationData({...recommendationData, relationship: e.target.value})}
            sx={{ mb: 2 }}
            required
          />
          <TextField
            fullWidth
            multiline
            rows={4}
            label="Pourquoi recommandez-vous ce profil? *"
            value={recommendationData.recommendation_reason}
            onChange={(e) => setRecommendationData({...recommendationData, recommendation_reason: e.target.value})}
            required
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setRecommendDialog(false)}>Annuler</Button>
          <Button onClick={handleRecommend} variant="contained">Envoyer Recommandation</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default EmployeeDashboard;