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
  Fab,
  LinearProgress,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Divider
} from '@mui/material';
import {
  Add as AddIcon,
  Work as WorkIcon,
  MoreVert as MoreVertIcon,
  Visibility as ViewIcon,
  Edit as EditIcon,
  Publish as PublishIcon,
  Close as CloseIcon,
  People as PeopleIcon,
  TrendingUp as TrendingUpIcon,
  Schedule as ScheduleIcon,
  CheckCircle as CheckCircleIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { 
  getJobOffers, 
  createJobOffer, 
  publishJobOffer, 
  closeJobOffer, 
  getApplications,
  getRecruitmentStats 
} from '../../services/hrService';

const RecruitmentDashboard = () => {
  const navigate = useNavigate();
  const [jobOffers, setJobOffers] = useState([]);
  const [applications, setApplications] = useState([]);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedOffer, setSelectedOffer] = useState(null);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    requirements: '',
    location: '',
    employment_type: 'CDI',
    salary_range: ''
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [offersRes, applicationsRes, statsRes] = await Promise.all([
        getJobOffers().catch(err => ({ data: [] })),
        getApplications().catch(err => ({ data: [] })),
        getRecruitmentStats().catch(err => ({ data: {} }))
      ]);

      console.log('Offers response:', offersRes);
      console.log('Applications response:', applicationsRes);
      console.log('Stats response:', statsRes);

      setJobOffers(Array.isArray(offersRes.data) ? offersRes.data : offersRes.data?.results || []);
      setApplications(Array.isArray(applicationsRes.data) ? applicationsRes.data : applicationsRes.data?.results || []);
      setStats(statsRes.data || {});
    } catch (error) {
      console.error('Erreur lors du chargement des données:', error);
      // Données de test en cas d'erreur
      setJobOffers([
        {
          id: 1,
          title: 'Développeur Frontend React',
          department: 'IT',
          experience_level: 'Intermédiaire',
          status: 'published',
          description: 'Nous recherchons un développeur Frontend expérimenté en React...',
          applications_count: 5,
          created_at: new Date().toISOString()
        },
        {
          id: 2,
          title: 'Designer UX/UI',
          department: 'Design',
          experience_level: 'Senior',
          status: 'draft',
          description: 'Rejoignez notre équipe design pour créer des expériences utilisateur...',
          applications_count: 2,
          created_at: new Date().toISOString()
        }
      ]);
      setApplications([
        {
          id: 1,
          first_name: 'Marie',
          last_name: 'Dubois',
          job_offer_title: 'Développeur Frontend React',
          status: 'pending'
        },
        {
          id: 2,
          first_name: 'Jean',
          last_name: 'Martin',
          job_offer_title: 'Designer UX/UI',
          status: 'interview'
        }
      ]);
      setStats({
        total_job_offers: 2,
        published_offers: 1,
        total_applications: 2,
        pending_applications: 1
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateJobOffer = async () => {
    try {
      await createJobOffer(formData);
      await fetchData();
      setCreateDialogOpen(false);
      setFormData({
        title: '',
        description: '',
        requirements: '',
        location: '',
        employment_type: 'CDI',
        salary_range: ''
      });
    } catch (error) {
      console.error('Erreur lors de la création:', error);
    }
  };

  const handlePublishOffer = async (offerId) => {
    try {
      await publishJobOffer(offerId);
      await fetchData();
      handleMenuClose();
    } catch (error) {
      console.error('Erreur lors de la publication:', error);
    }
  };

  const handleCloseOffer = async (offerId) => {
    try {
      await closeJobOffer(offerId);
      await fetchData();
      handleMenuClose();
    } catch (error) {
      console.error('Erreur lors de la fermeture:', error);
    }
  };

  const handleMenuClick = (event, offer) => {
    setAnchorEl(event.currentTarget);
    setSelectedOffer(offer);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedOffer(null);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'draft': return 'default';
      case 'published': return 'success';
      case 'closed': return 'error';
      default: return 'default';
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case 'draft': return 'Brouillon';
      case 'published': return 'Publiée';
      case 'closed': return 'Fermée';
      default: return status;
    }
  };

  const JobOfferCard = ({ offer }) => (
    <Card
      elevation={0}
      sx={{
        border: '1px solid #e0e0e0',
        borderRadius: 2,
        transition: 'all 0.3s ease',
        cursor: 'pointer',
        '&:hover': {
          boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
          transform: 'translateY(-2px)',
        }
      }}
      onClick={() => navigate(`/recruitment/job-offers/${offer.id}`)}
    >
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', flex: 1 }}>
            <Avatar
              sx={{
                backgroundColor: offer.status === 'published' ? '#2e7d32' : '#1976d2',
                mr: 2,
                width: 48,
                height: 48
              }}
            >
              <WorkIcon />
            </Avatar>
            <Box sx={{ flex: 1 }}>
              <Typography variant="h6" fontWeight="600" gutterBottom>
                {offer.title}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                {offer.department} • {offer.experience_level}
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Chip
                  label={getStatusLabel(offer.status)}
                  color={getStatusColor(offer.status)}
                  size="small"
                />
                <Chip
                  label={`${offer.applications_count || 0} candidatures`}
                  size="small"
                  variant="outlined"
                />
              </Box>
            </Box>
          </Box>
          <IconButton 
            onClick={(e) => {
              e.stopPropagation();
              handleMenuClick(e, offer);
            }}
          >
            <MoreVertIcon />
          </IconButton>
        </Box>

        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          {offer.description?.substring(0, 150)}...
        </Typography>

        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="caption" color="text.secondary">
            Créée le {new Date(offer.created_at).toLocaleDateString()}
          </Typography>
          
          {offer.status === 'draft' && (
            <Button
              size="small"
              variant="contained"
              startIcon={<PublishIcon />}
              onClick={(e) => {
                e.stopPropagation();
                handlePublishOffer(offer.id);
              }}
            >
              Publier
            </Button>
          )}
        </Box>
      </CardContent>
    </Card>
  );

  return (
    <Box>
      {/* En-tête */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h4" fontWeight="bold" gutterBottom>
            Tableau de Bord Recrutement
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Gestion des offres d'emploi et candidatures
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button
            variant="outlined"
            onClick={() => navigate('/recruitment/recommendations')}
            sx={{ borderRadius: 2, px: 3, py: 1.5 }}
          >
            Recommandations
          </Button>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setCreateDialogOpen(true)}
            sx={{ borderRadius: 2, px: 3, py: 1.5 }}
          >
            Nouvelle Offre
          </Button>
        </Box>
      </Box>

      {/* Statistiques */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card elevation={0} sx={{ border: '1px solid #e0e0e0', borderRadius: 2 }}>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="h4" color="primary" fontWeight="bold">
                {stats.total_job_offers || 0}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Total Offres
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card elevation={0} sx={{ border: '1px solid #e0e0e0', borderRadius: 2 }}>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="h4" color="success.main" fontWeight="bold">
                {stats.published_offers || 0}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Offres Publiées
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card elevation={0} sx={{ border: '1px solid #e0e0e0', borderRadius: 2 }}>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="h4" color="info.main" fontWeight="bold">
                {stats.total_applications || 0}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Candidatures
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card elevation={0} sx={{ border: '1px solid #e0e0e0', borderRadius: 2 }}>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="h4" color="warning.main" fontWeight="bold">
                {stats.pending_applications || 0}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                En Attente
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        {/* Offres d'emploi */}
        <Grid item xs={12} md={8}>
          <Card elevation={0} sx={{ border: '1px solid #e0e0e0', borderRadius: 2 }}>
            <CardContent>
              <Typography variant="h6" fontWeight="600" gutterBottom>
                Offres d'Emploi Récentes
              </Typography>
              
              {loading ? (
                <LinearProgress />
              ) : jobOffers.length === 0 ? (
                <Typography color="text.secondary" sx={{ textAlign: 'center', py: 4 }}>
                  Aucune offre d'emploi pour le moment
                </Typography>
              ) : (
                <Grid container spacing={2}>
                  {jobOffers.slice(0, 6).map((offer) => (
                    <Grid item xs={12} md={6} key={offer.id}>
                      <JobOfferCard offer={offer} />
                    </Grid>
                  ))}
                </Grid>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Candidatures récentes */}
        <Grid item xs={12} md={4}>
          <Card elevation={0} sx={{ border: '1px solid #e0e0e0', borderRadius: 2 }}>
            <CardContent>
              <Typography variant="h6" fontWeight="600" gutterBottom>
                Candidatures Récentes
              </Typography>
              
              {applications.length === 0 ? (
                <Typography color="text.secondary" sx={{ textAlign: 'center', py: 4 }}>
                  Aucune candidature pour le moment
                </Typography>
              ) : (
                <List>
                  {applications.slice(0, 5).map((application, index) => (
                    <React.Fragment key={application.id}>
                      <ListItem 
                        sx={{ px: 0, cursor: 'pointer' }}
                        onClick={() => navigate(`/recruitment/applications/${application.id}`)}
                      >
                        <ListItemAvatar>
                          <Avatar sx={{ backgroundColor: '#1976d2', width: 40, height: 40 }}>
                            <PeopleIcon />
                          </Avatar>
                        </ListItemAvatar>
                        <ListItemText
                          primary={`${application.first_name} ${application.last_name}`}
                          secondary={`${application.job_offer_title} • ${getStatusLabel(application.status)}`}
                          primaryTypographyProps={{ fontWeight: 500 }}
                        />
                      </ListItem>
                      {index < Math.min(applications.length - 1, 4) && <Divider />}
                    </React.Fragment>
                  ))}
                </List>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Menu contextuel */}
      <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleMenuClose}>
        <MenuItem onClick={() => {
          navigate(`/recruitment/job-offers/${selectedOffer?.id}`);
          handleMenuClose();
        }}>
          <ViewIcon sx={{ mr: 1 }} />
          Voir Détails
        </MenuItem>
        <MenuItem onClick={handleMenuClose}>
          <EditIcon sx={{ mr: 1 }} />
          Modifier
        </MenuItem>
        {selectedOffer?.status === 'draft' && (
          <MenuItem onClick={() => handlePublishOffer(selectedOffer.id)}>
            <PublishIcon sx={{ mr: 1 }} />
            Publier
          </MenuItem>
        )}
        {selectedOffer?.status === 'published' && (
          <MenuItem onClick={() => handleCloseOffer(selectedOffer.id)}>
            <CloseIcon sx={{ mr: 1 }} />
            Fermer
          </MenuItem>
        )}
      </Menu>

      {/* Dialog de création */}
      <Dialog open={createDialogOpen} onClose={() => setCreateDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>Créer une nouvelle offre d'emploi</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Titre du poste"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                rows={4}
                label="Description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                rows={3}
                label="Exigences"
                value={formData.requirements}
                onChange={(e) => setFormData({ ...formData, requirements: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Lieu"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                select
                label="Type d'emploi"
                value={formData.employment_type}
                onChange={(e) => setFormData({ ...formData, employment_type: e.target.value })}
                SelectProps={{ native: true }}
              >
                <option value="CDI">CDI</option>
                <option value="CDD">CDD</option>
                <option value="Stage">Stage</option>
                <option value="Freelance">Freelance</option>
              </TextField>
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Fourchette salariale (optionnel)"
                value={formData.salary_range}
                onChange={(e) => setFormData({ ...formData, salary_range: e.target.value })}
                placeholder="Ex: 35 000 - 45 000 €"
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCreateDialogOpen(false)}>
            Annuler
          </Button>
          <Button onClick={handleCreateJobOffer} variant="contained">
            Créer
          </Button>
        </DialogActions>
      </Dialog>

      {/* FAB pour mobile */}
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
    </Box>
  );
};

export default RecruitmentDashboard;