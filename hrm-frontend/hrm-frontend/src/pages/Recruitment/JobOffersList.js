import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
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
  TextField,
  InputAdornment
} from '@mui/material';
import {
  Add as AddIcon,
  Work as WorkIcon,
  Search as SearchIcon,
  FilterList as FilterIcon,
  MoreVert as MoreVertIcon,
  Visibility as ViewIcon,
  Edit as EditIcon,
  Publish as PublishIcon,
  Close as CloseIcon
} from '@mui/icons-material';
import { 
  getJobOffers, 
  publishJobOffer, 
  closeJobOffer 
} from '../../services/hrService';

const JobOffersList = () => {
  const navigate = useNavigate();
  const [jobOffers, setJobOffers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedOffer, setSelectedOffer] = useState(null);

  useEffect(() => {
    fetchJobOffers();
  }, []);

  const fetchJobOffers = async () => {
    try {
      const response = await getJobOffers();
      setJobOffers(response.data.results || response.data);
    } catch (error) {
      console.error('Erreur:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePublish = async (id) => {
    try {
      await publishJobOffer(id);
      await fetchJobOffers();
      setAnchorEl(null);
    } catch (error) {
      console.error('Erreur:', error);
    }
  };

  const handleClose = async (id) => {
    try {
      await closeJobOffer(id);
      await fetchJobOffers();
      setAnchorEl(null);
    } catch (error) {
      console.error('Erreur:', error);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      'draft': 'warning',
      'published': 'success',
      'closed': 'error'
    };
    return colors[status] || 'default';
  };

  const getStatusLabel = (status) => {
    const labels = {
      'draft': 'Brouillon',
      'published': 'Publiée',
      'closed': 'Fermée'
    };
    return labels[status] || status;
  };

  const filteredOffers = jobOffers.filter(offer => {
    const matchesSearch = offer.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         offer.department?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = !statusFilter || offer.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <Box>
      {/* En-tête */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h4" fontWeight="bold" gutterBottom>
            Offres d'Emploi
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Gestion complète des offres d'emploi
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => navigate('/job-offers/create')}
          sx={{ borderRadius: 2, px: 3, py: 1.5 }}
        >
          Nouvelle Offre
        </Button>
      </Box>

      {/* Filtres */}
      <Card elevation={0} sx={{ border: '1px solid #e0e0e0', borderRadius: 2, mb: 3 }}>
        <CardContent>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                placeholder="Rechercher par titre ou département..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            <Grid item xs={12} md={3}>
              <TextField
                fullWidth
                select
                label="Statut"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                SelectProps={{ native: true }}
              >
                <option value="">Tous les statuts</option>
                <option value="draft">Brouillon</option>
                <option value="published">Publiée</option>
                <option value="closed">Fermée</option>
              </TextField>
            </Grid>
            <Grid item xs={12} md={3}>
              <Typography variant="body2" color="text.secondary">
                {filteredOffers.length} offre(s) trouvée(s)
              </Typography>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Liste des offres */}
      <Grid container spacing={3}>
        {filteredOffers.map((offer) => (
          <Grid item xs={12} md={6} lg={4} key={offer.id}>
            <Card
              elevation={0}
              sx={{
                border: '1px solid #e0e0e0',
                borderRadius: 2,
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                '&:hover': {
                  boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                  transform: 'translateY(-2px)',
                }
              }}
              onClick={() => navigate(`/recruitment/job-offers/${offer.id}`)}
            >
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                  <Avatar
                    sx={{
                      backgroundColor: offer.status === 'published' ? '#2e7d32' : '#1976d2',
                      width: 48,
                      height: 48
                    }}
                  >
                    <WorkIcon />
                  </Avatar>
                  <IconButton
                    size="small"
                    onClick={(e) => {
                      e.stopPropagation();
                      setAnchorEl(e.currentTarget);
                      setSelectedOffer(offer);
                    }}
                  >
                    <MoreVertIcon />
                  </IconButton>
                </Box>

                <Typography variant="h6" fontWeight="600" gutterBottom>
                  {offer.title}
                </Typography>

                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  {offer.department} • {offer.experience_level}
                </Typography>

                <Typography variant="body2" color="text.secondary" sx={{ mb: 2, height: 40, overflow: 'hidden' }}>
                  {offer.description?.substring(0, 100)}...
                </Typography>

                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
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

                <Typography variant="caption" color="text.secondary">
                  Créée le {new Date(offer.created_at).toLocaleDateString()}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {filteredOffers.length === 0 && !loading && (
        <Card elevation={0} sx={{ border: '1px solid #e0e0e0', borderRadius: 2, mt: 3 }}>
          <CardContent sx={{ textAlign: 'center', py: 8 }}>
            <WorkIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
            <Typography variant="h6" color="text.secondary" gutterBottom>
              Aucune offre d'emploi trouvée
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              {searchTerm || statusFilter ? 'Essayez de modifier vos critères de recherche' : 'Commencez par créer votre première offre d\'emploi'}
            </Typography>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => navigate('/job-offers/create')}
            >
              Créer une offre
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Menu contextuel */}
      <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={() => setAnchorEl(null)}>
        <MenuItem onClick={() => {
          navigate(`/recruitment/job-offers/${selectedOffer?.id}`);
          setAnchorEl(null);
        }}>
          <ViewIcon sx={{ mr: 1 }} />
          Voir Détails
        </MenuItem>
        <MenuItem onClick={() => setAnchorEl(null)}>
          <EditIcon sx={{ mr: 1 }} />
          Modifier
        </MenuItem>
        {selectedOffer?.status === 'draft' && (
          <MenuItem onClick={() => handlePublish(selectedOffer.id)}>
            <PublishIcon sx={{ mr: 1 }} />
            Publier
          </MenuItem>
        )}
        {selectedOffer?.status === 'published' && (
          <MenuItem onClick={() => handleClose(selectedOffer.id)}>
            <CloseIcon sx={{ mr: 1 }} />
            Fermer
          </MenuItem>
        )}
      </Menu>
    </Box>
  );
};

export default JobOffersList;