import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Grid,
  Chip,
  Avatar,
  List,
  ListItem,
  ListItemText,
  Divider,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Alert,
  Paper
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  Person as PersonIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  Work as WorkIcon,
  Schedule as ScheduleIcon,
  GetApp as DownloadIcon,
  RateReview as FeedbackIcon
} from '@mui/icons-material';
import { 
  getApplicationDetail,
  updateApplicationStatus,
  createInterview,
  submitInterviewFeedback
} from '../../services/hrService';

const ApplicationDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [application, setApplication] = useState(null);
  const [loading, setLoading] = useState(true);
  const [statusDialog, setStatusDialog] = useState(false);
  const [interviewDialog, setInterviewDialog] = useState(false);
  const [feedbackDialog, setFeedbackDialog] = useState(false);
  const [selectedInterview, setSelectedInterview] = useState(null);
  const [newStatus, setNewStatus] = useState('');
  const [notes, setNotes] = useState('');
  const [interviewData, setInterviewData] = useState({
    scheduled_date: '',
    location: ''
  });
  const [feedbackData, setFeedbackData] = useState({
    feedback: '',
    score: ''
  });

  useEffect(() => {
    fetchApplicationDetail();
  }, [id]);

  const fetchApplicationDetail = async () => {
    try {
      const response = await getApplicationDetail(id);
      setApplication(response.data);
    } catch (error) {
      console.error('Erreur:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async () => {
    try {
      await updateApplicationStatus(id, {
        status: newStatus,
        notes: notes
      });
      await fetchApplicationDetail();
      setStatusDialog(false);
      setNotes('');
    } catch (error) {
      console.error('Erreur:', error);
    }
  };

  const handleCreateInterview = async () => {
    try {
      await createInterview(id, interviewData);
      await fetchApplicationDetail();
      setInterviewDialog(false);
      setInterviewData({ scheduled_date: '', location: '' });
    } catch (error) {
      console.error('Erreur:', error);
    }
  };

  const handleSubmitFeedback = async () => {
    try {
      await submitInterviewFeedback(selectedInterview.id, feedbackData);
      await fetchApplicationDetail();
      setFeedbackDialog(false);
      setFeedbackData({ feedback: '', score: '' });
    } catch (error) {
      console.error('Erreur:', error);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      'pending': 'warning',
      'reviewed': 'info',
      'interview': 'primary',
      'accepted': 'success',
      'rejected': 'error'
    };
    return colors[status] || 'default';
  };

  const getStatusLabel = (status) => {
    const labels = {
      'pending': 'En attente',
      'reviewed': 'Examiné',
      'interview': 'Entretien',
      'accepted': 'Accepté',
      'rejected': 'Rejeté'
    };
    return labels[status] || status;
  };

  if (loading) return <Typography>Chargement...</Typography>;
  if (!application) return <Typography>Candidature non trouvée</Typography>;

  return (
    <Box>
      {/* En-tête */}
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <IconButton onClick={() => navigate('/recruitment')} sx={{ mr: 2 }}>
          <ArrowBackIcon />
        </IconButton>
        <Avatar sx={{ mr: 2, backgroundColor: '#1976d2', width: 56, height: 56 }}>
          <PersonIcon />
        </Avatar>
        <Box sx={{ flex: 1 }}>
          <Typography variant="h4" fontWeight="bold">
            {application.first_name} {application.last_name}
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Candidature pour {application.job_offer_title}
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Chip
            label={getStatusLabel(application.status)}
            color={getStatusColor(application.status)}
            size="large"
          />
          <Button 
            variant="outlined" 
            onClick={() => setStatusDialog(true)}
          >
            Changer Statut
          </Button>
        </Box>
      </Box>

      <Grid container spacing={3}>
        {/* Informations personnelles */}
        <Grid item xs={12} md={8}>
          <Card elevation={0} sx={{ border: '1px solid #e0e0e0', borderRadius: 2, mb: 3 }}>
            <CardContent>
              <Typography variant="h6" fontWeight="600" gutterBottom>
                Informations Personnelles
              </Typography>
              
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <EmailIcon sx={{ mr: 1, color: 'text.secondary' }} />
                    <Typography>{application.email}</Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <PhoneIcon sx={{ mr: 1, color: 'text.secondary' }} />
                    <Typography>{application.phone}</Typography>
                  </Box>
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Date de candidature
                  </Typography>
                  <Typography>
                    {new Date(application.applied_at).toLocaleDateString('fr-FR', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </Typography>
                </Grid>
              </Grid>
            </CardContent>
          </Card>

          {/* Lettre de motivation */}
          {application.cover_letter && (
            <Card elevation={0} sx={{ border: '1px solid #e0e0e0', borderRadius: 2, mb: 3 }}>
              <CardContent>
                <Typography variant="h6" fontWeight="600" gutterBottom>
                  Lettre de Motivation
                </Typography>
                <Typography variant="body1" sx={{ whiteSpace: 'pre-line' }}>
                  {application.cover_letter}
                </Typography>
              </CardContent>
            </Card>
          )}

          {/* CV */}
          {application.cv && (
            <Card elevation={0} sx={{ border: '1px solid #e0e0e0', borderRadius: 2, mb: 3 }}>
              <CardContent>
                <Typography variant="h6" fontWeight="600" gutterBottom>
                  Curriculum Vitae
                </Typography>
                <Button
                  variant="outlined"
                  startIcon={<DownloadIcon />}
                  href={application.cv.startsWith('http') ? application.cv : `${process.env.REACT_APP_API_URL || 'http://localhost:8000'}${application.cv}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  download
                >
                  Télécharger le CV
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Notes RH */}
          {application.notes && (
            <Card elevation={0} sx={{ border: '1px solid #e0e0e0', borderRadius: 2 }}>
              <CardContent>
                <Typography variant="h6" fontWeight="600" gutterBottom>
                  Notes RH
                </Typography>
                <Typography variant="body1" sx={{ whiteSpace: 'pre-line' }}>
                  {application.notes}
                </Typography>
                {application.reviewed_by_name && (
                  <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                    Par {application.reviewed_by_name} le {new Date(application.reviewed_at).toLocaleDateString()}
                  </Typography>
                )}
              </CardContent>
            </Card>
          )}
        </Grid>

        {/* Actions et entretiens */}
        <Grid item xs={12} md={4}>
          {/* Actions rapides */}
          <Card elevation={0} sx={{ border: '1px solid #e0e0e0', borderRadius: 2, mb: 3 }}>
            <CardContent>
              <Typography variant="h6" fontWeight="600" gutterBottom>
                Actions Rapides
              </Typography>
              
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                <Button
                  variant="contained"
                  color="success"
                  onClick={() => {
                    setNewStatus('accepted');
                    setStatusDialog(true);
                  }}
                  disabled={application.status === 'accepted'}
                >
                  Accepter
                </Button>
                <Button
                  variant="contained"
                  color="primary"
                  startIcon={<ScheduleIcon />}
                  onClick={() => setInterviewDialog(true)}
                  disabled={application.status === 'rejected'}
                >
                  Programmer Entretien
                </Button>
                <Button
                  variant="outlined"
                  color="error"
                  onClick={() => {
                    setNewStatus('rejected');
                    setStatusDialog(true);
                  }}
                  disabled={application.status === 'rejected'}
                >
                  Rejeter
                </Button>
              </Box>
            </CardContent>
          </Card>

          {/* Entretiens */}
          <Card elevation={0} sx={{ border: '1px solid #e0e0e0', borderRadius: 2 }}>
            <CardContent>
              <Typography variant="h6" fontWeight="600" gutterBottom>
                Entretiens ({application.interviews?.length || 0})
              </Typography>
              
              {application.interviews?.length === 0 ? (
                <Typography color="text.secondary" sx={{ textAlign: 'center', py: 2 }}>
                  Aucun entretien programmé
                </Typography>
              ) : (
                <List sx={{ p: 0 }}>
                  {application.interviews?.map((interview, index) => (
                    <React.Fragment key={interview.id}>
                      <ListItem sx={{ px: 0 }}>
                        <ListItemText
                          primary={
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                              <Typography variant="body2" fontWeight="600">
                                {new Date(interview.scheduled_date).toLocaleDateString()}
                              </Typography>
                              <Chip
                                label={interview.status === 'completed' ? 'Terminé' : 'Programmé'}
                                color={interview.status === 'completed' ? 'success' : 'primary'}
                                size="small"
                              />
                            </Box>
                          }
                          secondary={
                            <Box>
                              <Typography variant="body2" color="text.secondary">
                                {interview.location}
                              </Typography>
                              {interview.status === 'completed' && interview.score && (
                                <Typography variant="body2" color="primary">
                                  Score: {interview.score}/10
                                </Typography>
                              )}
                            </Box>
                          }
                        />
                        {interview.status === 'scheduled' && (
                          <IconButton
                            size="small"
                            onClick={() => {
                              setSelectedInterview(interview);
                              setFeedbackDialog(true);
                            }}
                          >
                            <FeedbackIcon />
                          </IconButton>
                        )}
                      </ListItem>
                      {index < application.interviews.length - 1 && <Divider />}
                    </React.Fragment>
                  ))}
                </List>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Dialog changement de statut */}
      <Dialog open={statusDialog} onClose={() => setStatusDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Changer le Statut</DialogTitle>
        <DialogContent>
          <TextField
            select
            fullWidth
            label="Nouveau statut"
            value={newStatus}
            onChange={(e) => setNewStatus(e.target.value)}
            SelectProps={{ native: true }}
            sx={{ mb: 2, mt: 1 }}
          >
            <option value="">Sélectionner...</option>
            <option value="pending">En attente</option>
            <option value="reviewed">Examiné</option>
            <option value="interview">Entretien</option>
            <option value="accepted">Accepté</option>
            <option value="rejected">Rejeté</option>
          </TextField>
          <TextField
            fullWidth
            multiline
            rows={3}
            label="Notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Ajoutez vos commentaires..."
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setStatusDialog(false)}>Annuler</Button>
          <Button onClick={handleUpdateStatus} variant="contained" disabled={!newStatus}>
            Mettre à jour
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialog programmation entretien */}
      <Dialog open={interviewDialog} onClose={() => setInterviewDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Programmer un Entretien</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            type="datetime-local"
            label="Date et heure"
            value={interviewData.scheduled_date}
            onChange={(e) => setInterviewData({...interviewData, scheduled_date: e.target.value})}
            sx={{ mb: 2, mt: 1 }}
            InputLabelProps={{ shrink: true }}
          />
          <TextField
            fullWidth
            label="Lieu"
            value={interviewData.location}
            onChange={(e) => setInterviewData({...interviewData, location: e.target.value})}
            placeholder="Ex: Bureau 201, Visioconférence..."
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setInterviewDialog(false)}>Annuler</Button>
          <Button onClick={handleCreateInterview} variant="contained">
            Programmer
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialog feedback entretien */}
      <Dialog open={feedbackDialog} onClose={() => setFeedbackDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>Feedback d'Entretien</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            multiline
            rows={4}
            label="Commentaires"
            value={feedbackData.feedback}
            onChange={(e) => setFeedbackData({...feedbackData, feedback: e.target.value})}
            sx={{ mb: 2, mt: 1 }}
            placeholder="Vos impressions sur l'entretien..."
          />
          <TextField
            fullWidth
            type="number"
            label="Score (sur 10)"
            value={feedbackData.score}
            onChange={(e) => setFeedbackData({...feedbackData, score: e.target.value})}
            inputProps={{ min: 0, max: 10 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setFeedbackDialog(false)}>Annuler</Button>
          <Button onClick={handleSubmitFeedback} variant="contained">
            Enregistrer
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ApplicationDetail;