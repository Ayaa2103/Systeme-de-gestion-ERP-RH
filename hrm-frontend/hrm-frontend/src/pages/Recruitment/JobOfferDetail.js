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
  ListItemAvatar,
  Divider,
  IconButton,
  Menu,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Alert
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  Work as WorkIcon,
  People as PeopleIcon,
  Edit as EditIcon,
  Publish as PublishIcon,
  Close as CloseIcon,
  MoreVert as MoreVertIcon,
  Schedule as ScheduleIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon
} from '@mui/icons-material';
import { 
  getJobOfferDetail, 
  publishJobOffer, 
  closeJobOffer,
  updateApplicationStatus,
  createInterview 
} from '../../services/hrService';

const JobOfferDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [jobOffer, setJobOffer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedApplication, setSelectedApplication] = useState(null);
  const [statusDialog, setStatusDialog] = useState(false);
  const [interviewDialog, setInterviewDialog] = useState(false);
  const [newStatus, setNewStatus] = useState('');
  const [notes, setNotes] = useState('');
  const [interviewData, setInterviewData] = useState({
    scheduled_date: '',
    location: ''
  });

  useEffect(() => {
    fetchJobOfferDetail();
  }, [id]);

  const fetchJobOfferDetail = async () => {
    try {
      const response = await getJobOfferDetail(id);
      setJobOffer(response.data);
    } catch (error) {
      console.error('Erreur:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePublish = async () => {
    try {
      await publishJobOffer(id);
      await fetchJobOfferDetail();
    } catch (error) {
      console.error('Erreur:', error);
    }
  };

  const handleClose = async () => {
    try {
      await closeJobOffer(id);
      await fetchJobOfferDetail();
    } catch (error) {
      console.error('Erreur:', error);
    }
  };

  const handleUpdateStatus = async () => {
    try {
      await updateApplicationStatus(selectedApplication.id, {
        status: newStatus,
        notes: notes
      });
      await fetchJobOfferDetail();
      setStatusDialog(false);
      setNotes('');
    } catch (error) {
      console.error('Erreur:', error);
    }
  };

  const handleCreateInterview = async () => {
    try {
      await createInterview(selectedApplication.id, interviewData);
      await fetchJobOfferDetail();
      setInterviewDialog(false);
      setInterviewData({ scheduled_date: '', location: '' });
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
  if (!jobOffer) return <Typography>Offre non trouvée</Typography>;

  return (
    <Box>
      {/* En-tête */}
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <IconButton onClick={() => navigate('/recruitment')} sx={{ mr: 2 }}>
          <ArrowBackIcon />
        </IconButton>
        <Box sx={{ flex: 1 }}>
          <Typography variant="h4" fontWeight="bold">
            {jobOffer.title}
          </Typography>
          <Typography variant="body1" color="text.secondary">
            {jobOffer.department} • {jobOffer.experience_level}
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Chip
            label={jobOffer.status === 'published' ? 'Publiée' : jobOffer.status === 'draft' ? 'Brouillon' : 'Fermée'}
            color={jobOffer.status === 'published' ? 'success' : jobOffer.status === 'draft' ? 'warning' : 'error'}
          />
          {jobOffer.status === 'draft' && (
            <Button variant="contained" startIcon={<PublishIcon />} onClick={handlePublish}>
              Publier
            </Button>
          )}
          {jobOffer.status === 'published' && (
            <Button variant="outlined" startIcon={<CloseIcon />} onClick={handleClose}>
              Fermer
            </Button>
          )}
        </Box>
      </Box>

      <Grid container spacing={3}>
        {/* Détails de l'offre */}
        <Grid item xs={12} md={8}>
          <Card elevation={0} sx={{ border: '1px solid #e0e0e0', borderRadius: 2, mb: 3 }}>
            <CardContent>
              <Typography variant="h6" fontWeight="600" gutterBottom>
                Description du Poste
              </Typography>
              <Typography variant="body1" sx={{ mb: 3, whiteSpace: 'pre-line' }}>
                {jobOffer.description}
              </Typography>
              
              <Typography variant="h6" fontWeight="600" gutterBottom>
                Compétences Requises
              </Typography>
              <Typography variant="body1" sx={{ whiteSpace: 'pre-line' }}>
                {jobOffer.required_skills}
              </Typography>
            </CardContent>
          </Card>

          {/* Candidatures */}
          <Card elevation={0} sx={{ border: '1px solid #e0e0e0', borderRadius: 2 }}>
            <CardContent>
              <Typography variant="h6" fontWeight="600" gutterBottom>
                Candidatures ({jobOffer.applications?.length || 0})
              </Typography>
              
              {jobOffer.applications?.length === 0 ? (
                <Typography color="text.secondary" sx={{ textAlign: 'center', py: 4 }}>
                  Aucune candidature pour le moment
                </Typography>
              ) : (
                <List>
                  {jobOffer.applications?.map((application, index) => (
                    <React.Fragment key={application.id}>
                      <ListItem sx={{ px: 0 }}>
                        <ListItemAvatar>
                          <Avatar sx={{ backgroundColor: '#1976d2' }}>
                            <PeopleIcon />
                          </Avatar>
                        </ListItemAvatar>
                        <ListItemText
                          primary={`${application.first_name} ${application.last_name}`}
                          secondary={
                            <Box>
                              <Typography variant="body2" color="text.secondary">
                                {application.email} • {application.phone}
                              </Typography>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
                                <Chip
                                  label={getStatusLabel(application.status)}
                                  color={getStatusColor(application.status)}
                                  size="small"
                                />
                                <Typography variant="caption" color="text.secondary">
                                  {new Date(application.applied_at).toLocaleDateString()}
                                </Typography>
                              </Box>
                            </Box>
                          }
                        />
                        <IconButton 
                          onClick={(e) => {
                            setAnchorEl(e.currentTarget);
                            setSelectedApplication(application);
                          }}
                        >
                          <MoreVertIcon />
                        </IconButton>
                      </ListItem>
                      {index < jobOffer.applications.length - 1 && <Divider />}
                    </React.Fragment>
                  ))}
                </List>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Statistiques */}
        <Grid item xs={12} md={4}>
          <Card elevation={0} sx={{ border: '1px solid #e0e0e0', borderRadius: 2 }}>
            <CardContent>
              <Typography variant="h6" fontWeight="600" gutterBottom>
                Statistiques
              </Typography>
              
              <Box sx={{ mb: 2 }}>
                <Typography variant="body2" color="text.secondary">
                  Total candidatures
                </Typography>
                <Typography variant="h4" color="primary" fontWeight="bold">
                  {jobOffer.applications?.length || 0}
                </Typography>
              </Box>

              <Box sx={{ mb: 2 }}>
                <Typography variant="body2" color="text.secondary">
                  En attente
                </Typography>
                <Typography variant="h5" color="warning.main" fontWeight="bold">
                  {jobOffer.applications?.filter(a => a.status === 'pending').length || 0}
                </Typography>
              </Box>

              <Box sx={{ mb: 2 }}>
                <Typography variant="body2" color="text.secondary">
                  Entretiens
                </Typography>
                <Typography variant="h5" color="info.main" fontWeight="bold">
                  {jobOffer.applications?.filter(a => a.status === 'interview').length || 0}
                </Typography>
              </Box>

              <Box>
                <Typography variant="body2" color="text.secondary">
                  Acceptés
                </Typography>
                <Typography variant="h5" color="success.main" fontWeight="bold">
                  {jobOffer.applications?.filter(a => a.status === 'accepted').length || 0}
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Menu contextuel */}
      <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={() => setAnchorEl(null)}>
        <MenuItem onClick={() => navigate(`/recruitment/applications/${selectedApplication?.id}`)}>
          Voir Détails
        </MenuItem>
        <MenuItem onClick={() => {
          setStatusDialog(true);
          setAnchorEl(null);
        }}>
          Changer Statut
        </MenuItem>
        {selectedApplication?.status !== 'interview' && (
          <MenuItem onClick={() => {
            setInterviewDialog(true);
            setAnchorEl(null);
          }}>
            <ScheduleIcon sx={{ mr: 1 }} />
            Programmer Entretien
          </MenuItem>
        )}
      </Menu>

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
            label="Notes (optionnel)"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
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
    </Box>
  );
};

export default JobOfferDetail;