import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Grid,
  Chip,
  IconButton,
  Menu,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  Fab
} from '@mui/material';
import {
  Add as AddIcon,
  Work as WorkIcon,
  MoreVert as MoreVertIcon,
  Visibility as VisibilityIcon,
  Edit as EditIcon,
  Publish as PublishIcon,
  Close as CloseIcon,
  People as PeopleIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';

const JobOffers = () => {
  const [jobOffers, setJobOffers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedOffer, setSelectedOffer] = useState(null);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    department: '',
    description: '',
    required_skills: '',
    experience_level: 'intermediate'
  });
  const navigate = useNavigate();

  useEffect(() => {
    fetchJobOffers();
  }, []);

  const fetchJobOffers = async () => {
    try {
      const response = await api.get('/job-offers/');
      setJobOffers(response.data.results || response.data);
    } catch (error) {
      console.error('Erreur lors du chargement des offres:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateOffer = async () => {
    try {
      await api.post('/job-offers/', formData);
      await fetchJobOffers();
      setCreateDialogOpen(false);
      setFormData({
        title: '',
        department: '',
        description: '',
        required_skills: '',
        experience_level: 'intermediate'
      });
    } catch (error) {
      console.error('Erreur lors de la création:', error);
    }
  };

  const handlePublishOffer = async (offerId) => {
    try {
      await api.post(`/job-offers/${offerId}/publish/`);
      await fetchJobOffers();
      handleMenuClose();
    } catch (error) {
      console.error('Erreur lors de la publication:', error);
    }
  };

  const handleCloseOffer = async (offerId) => {
    try {
      await api.post(`/job-offers/${offerId}/close/`);
      await fetchJobOffers();
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
      case 'published': return 'Publié';
      case 'closed': return 'Fermé';
      default: return status;
    }
  };

  const getExperienceLabel = (level) => {
    switch (level) {
      case 'junior': return 'Junior (0-2 ans)';
      case 'intermediate': return 'Intermédiaire (2-5 ans)';
      case 'senior': return 'Senior (5+ ans)';
      case 'expert': return 'Expert (10+ ans)';
      default: return level;
    }
  };

  const JobOfferCard = ({ offer }) => (
    <Card
      elevation={0}
      sx={{
        border: '1px solid #e0e0e0',
        borderRadius: 2,
        transition: 'all 0.3s ease',
        '&:hover': {
          boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
          transform: 'translateY(-2px)',
        }
      }}
    >
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', flex: 1 }}>
            <WorkIcon sx={{ mr: 2, color: '#1976d2', fontSize: 32 }} />
            <Box sx={{ flex: 1 }}>
              <Typography variant="h6" fontWeight="600" gutterBottom>
                {offer.title}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                {offer.department}
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Chip
                  label={getStatusLabel(offer.status)}
                  color={getStatusColor(offer.status)}
                  size="small"
                />
                <Chip
                  label={getExperienceLabel(offer.experience_level)}
                  variant="outlined"
                  size="small"
                />
              </Box>
            </Box>
          </Box>
          <IconButton onClick={(e) => handleMenuClick(e, offer)}>
            <MoreVertIcon />
          </IconButton>
        </Box>

        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          {offer.description?.substring(0, 150)}...
        </Typography>

        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <PeopleIcon sx={{ fontSize: 16, mr: 1, color: 'text.secondary' }} />
            <Typography variant="body2" color="text.secondary">
              {offer.applications_count || 0} candidatures
            </Typography>
          </Box>
          
          <Typography variant="caption" color="text.secondary">
            Créé par {offer.created_by_name}
          </Typography>
        </Box>

        {offer.required_skills && (
          <Box sx={{ mt: 2 }}>
            <Typography variant="body2" fontWeight="600" gutterBottom>
              Compétences requises:
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {offer.required_skills}
            </Typography>
          </Box>
        )}
      </CardContent>
    </Card>
  );

  const publishedCount = jobOffers.filter(o => o.status === 'published').length;
  const draftCount = jobOffers.filter(o => o.status === 'draft').length;

  return (
    <Box>
      {/* En-tête */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h4" fontWeight="bold" gutterBottom>
            Offres d'Emploi
          </Typography>
          <Typography variant="body1" color="text.secondary">
            {jobOffers.length} offres au total
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setCreateDialogOpen(true)}
          sx={{ borderRadius: 2, px: 3, py: 1.5 }}
        >
          Nouvelle Offre
        </Button>
      </Box>

      {/* Statistiques */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={3}>
          <Card elevation={0} sx={{ border: '1px solid #e0e0e0', borderRadius: 2 }}>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="h4" color="primary" fontWeight="bold">
                {jobOffers.length}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Total Offres
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={3}>
          <Card elevation={0} sx={{ border: '1px solid #e0e0e0', borderRadius: 2 }}>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="h4" color="success.main" fontWeight="bold">
                {publishedCount}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Publiées
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={3}>
          <Card elevation={0} sx={{ border: '1px solid #e0e0e0', borderRadius: 2 }}>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="h4" color="warning.main" fontWeight="bold">
                {draftCount}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Brouillons
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={3}>
          <Card elevation={0} sx={{ border: '1px solid #e0e0e0', borderRadius: 2 }}>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="h4" color="info.main" fontWeight="bold">
                {jobOffers.reduce((sum, offer) => sum + (offer.applications_count || 0), 0)}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Candidatures
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Liste des offres */}
      <Grid container spacing={2}>
        {jobOffers.map((offer) => (
          <Grid item xs={12} md={6} key={offer.id}>
            <JobOfferCard offer={offer} />
          </Grid>
        ))}
      </Grid>

      {/* Menu contextuel */}
      <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleMenuClose}>
        <MenuItem onClick={() => {
          navigate(`/job-offers/${selectedOffer?.id}`);
          handleMenuClose();
        }}>
          <VisibilityIcon sx={{ mr: 1 }} />
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
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Département"
                value={formData.department}
                onChange={(e) => setFormData({ ...formData, department: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Niveau d'expérience</InputLabel>
                <Select
                  value={formData.experience_level}
                  label="Niveau d'expérience"
                  onChange={(e) => setFormData({ ...formData, experience_level: e.target.value })}
                >
                  <MenuItem value="junior">Junior (0-2 ans)</MenuItem>
                  <MenuItem value="intermediate">Intermédiaire (2-5 ans)</MenuItem>
                  <MenuItem value="senior">Senior (5+ ans)</MenuItem>
                  <MenuItem value="expert">Expert (10+ ans)</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                rows={4}
                label="Description du poste"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                rows={3}
                label="Compétences requises"
                value={formData.required_skills}
                onChange={(e) => setFormData({ ...formData, required_skills: e.target.value })}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCreateDialogOpen(false)}>
            Annuler
          </Button>
          <Button onClick={handleCreateOffer} variant="contained">
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

export default JobOffers;