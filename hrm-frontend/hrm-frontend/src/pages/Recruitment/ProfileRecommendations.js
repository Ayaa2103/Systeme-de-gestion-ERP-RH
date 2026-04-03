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
  Recommend as RecommendIcon,
  Person as PersonIcon,
  Work as WorkIcon,
  MoreVert as MoreVertIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  Email as EmailIcon,
  Phone as PhoneIcon
} from '@mui/icons-material';
import { 
  getProfileRecommendations,
  updateRecommendationStatus
} from '../../services/hrService';

const ProfileRecommendations = () => {
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedRecommendation, setSelectedRecommendation] = useState(null);
  const [detailDialog, setDetailDialog] = useState(false);

  useEffect(() => {
    fetchRecommendations();
  }, []);

  const fetchRecommendations = async () => {
    try {
      const response = await getProfileRecommendations();
      setRecommendations(response.data.results || response.data);
    } catch (error) {
      console.error('Erreur:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (id, status) => {
    try {
      await updateRecommendationStatus(id, status);
      await fetchRecommendations();
      setAnchorEl(null);
    } catch (error) {
      console.error('Erreur:', error);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      'pending': 'warning',
      'contacted': 'info',
      'rejected': 'error'
    };
    return colors[status] || 'default';
  };

  const getStatusLabel = (status) => {
    const labels = {
      'pending': 'En attente',
      'contacted': 'Contacté',
      'rejected': 'Rejeté'
    };
    return labels[status] || status;
  };

  const RecommendationCard = ({ recommendation }) => (
    <Card
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
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', flex: 1 }}>
            <Avatar
              sx={{
                backgroundColor: '#1976d2',
                mr: 2,
                width: 48,
                height: 48
              }}
            >
              <PersonIcon />
            </Avatar>
            <Box sx={{ flex: 1 }}>
              <Typography variant="h6" fontWeight="600" gutterBottom>
                {recommendation.candidate_name}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                Recommandé pour: {recommendation.job_offer_title}
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Chip
                  label={getStatusLabel(recommendation.status)}
                  color={getStatusColor(recommendation.status)}
                  size="small"
                />
                <Typography variant="caption" color="text.secondary">
                  {new Date(recommendation.created_at).toLocaleDateString()}
                </Typography>
              </Box>
            </Box>
          </Box>
          <IconButton 
            onClick={(e) => {
              setAnchorEl(e.currentTarget);
              setSelectedRecommendation(recommendation);
            }}
          >
            <MoreVertIcon />
          </IconButton>
        </Box>

        <Box sx={{ mb: 2 }}>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            Recommandé par:
          </Typography>
          <Typography variant="body2" fontWeight="500">
            {recommendation.recommended_by_name}
          </Typography>
        </Box>

        <Box sx={{ mb: 2 }}>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            Relation:
          </Typography>
          <Typography variant="body2">
            {recommendation.relationship}
          </Typography>
        </Box>

        <Box sx={{ mb: 2 }}>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            Raison de la recommandation:
          </Typography>
          <Typography variant="body2" sx={{ 
            display: '-webkit-box',
            WebkitLineClamp: 3,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden'
          }}>
            {recommendation.recommendation_reason}
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box>
            <Typography variant="body2" color="text.secondary">
              {recommendation.candidate_email}
            </Typography>
            {recommendation.candidate_phone && (
              <Typography variant="body2" color="text.secondary">
                {recommendation.candidate_phone}
              </Typography>
            )}
          </Box>
          
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button
              size="small"
              variant="outlined"
              onClick={() => {
                setSelectedRecommendation(recommendation);
                setDetailDialog(true);
              }}
            >
              Détails
            </Button>
            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
              {recommendation.status !== 'pending' && (
                <Button
                  size="small"
                  variant={recommendation.status === 'pending' ? 'contained' : 'outlined'}
                  color="warning"
                  onClick={() => handleUpdateStatus(recommendation.id, 'pending')}
                >
                  En attente
                </Button>
              )}
              {recommendation.status !== 'contacted' && (
                <Button
                  size="small"
                  variant={recommendation.status === 'contacted' ? 'contained' : 'outlined'}
                  color="info"
                  onClick={() => handleUpdateStatus(recommendation.id, 'contacted')}
                >
                  Contacter
                </Button>
              )}
              {recommendation.status !== 'rejected' && (
                <Button
                  size="small"
                  variant={recommendation.status === 'rejected' ? 'contained' : 'outlined'}
                  color="error"
                  onClick={() => handleUpdateStatus(recommendation.id, 'rejected')}
                >
                  Rejeter
                </Button>
              )}
            </Box>
          </Box>
        </Box>
      </CardContent>
    </Card>
  );

  return (
    <Box>
      {/* En-tête */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" fontWeight="bold" gutterBottom>
          Recommandations de Profils
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Profils recommandés par les employés pour les postes ouverts
        </Typography>
      </Box>

      {/* Statistiques */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card elevation={0} sx={{ border: '1px solid #e0e0e0', borderRadius: 2 }}>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="h4" color="primary" fontWeight="bold">
                {recommendations.length}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Total Recommandations
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card elevation={0} sx={{ border: '1px solid #e0e0e0', borderRadius: 2 }}>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="h4" color="warning.main" fontWeight="bold">
                {recommendations.filter(r => r.status === 'pending').length}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                En Attente
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card elevation={0} sx={{ border: '1px solid #e0e0e0', borderRadius: 2 }}>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="h4" color="info.main" fontWeight="bold">
                {recommendations.filter(r => r.status === 'contacted').length}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Contactés
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card elevation={0} sx={{ border: '1px solid #e0e0e0', borderRadius: 2 }}>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="h4" color="error.main" fontWeight="bold">
                {recommendations.filter(r => r.status === 'rejected').length}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Rejetés
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Liste des recommandations */}
      <Card elevation={0} sx={{ border: '1px solid #e0e0e0', borderRadius: 2 }}>
        <CardContent>
          <Typography variant="h6" fontWeight="600" gutterBottom>
            Recommandations Récentes
          </Typography>
          
          {loading ? (
            <Typography>Chargement...</Typography>
          ) : recommendations.length === 0 ? (
            <Typography color="text.secondary" sx={{ textAlign: 'center', py: 4 }}>
              Aucune recommandation pour le moment
            </Typography>
          ) : (
            <Box>
              {recommendations.map((recommendation) => (
                <RecommendationCard key={recommendation.id} recommendation={recommendation} />
              ))}
            </Box>
          )}
        </CardContent>
      </Card>

      {/* Menu contextuel */}
      <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={() => setAnchorEl(null)}>
        <MenuItem onClick={() => {
          setDetailDialog(true);
          setAnchorEl(null);
        }}>
          Voir Détails
        </MenuItem>
        {selectedRecommendation?.status !== 'pending' && (
          <MenuItem onClick={() => handleUpdateStatus(selectedRecommendation.id, 'pending')}>
            Marquer En attente
          </MenuItem>
        )}
        {selectedRecommendation?.status !== 'contacted' && (
          <MenuItem onClick={() => handleUpdateStatus(selectedRecommendation.id, 'contacted')}>
            Marquer Contacté
          </MenuItem>
        )}
        {selectedRecommendation?.status !== 'rejected' && (
          <MenuItem onClick={() => handleUpdateStatus(selectedRecommendation.id, 'rejected')}>
            Marquer Rejeté
          </MenuItem>
        )}
      </Menu>

      {/* Dialog détails */}
      <Dialog open={detailDialog} onClose={() => setDetailDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          Détails de la Recommandation
        </DialogTitle>
        <DialogContent>
          {selectedRecommendation && (
            <Box>
              <Grid container spacing={2} sx={{ mb: 3 }}>
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Candidat
                  </Typography>
                  <Typography variant="h6" fontWeight="600">
                    {selectedRecommendation.candidate_name}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Poste
                  </Typography>
                  <Typography variant="h6" fontWeight="600">
                    {selectedRecommendation.job_offer_title}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Email
                  </Typography>
                  <Typography>{selectedRecommendation.candidate_email}</Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Téléphone
                  </Typography>
                  <Typography>{selectedRecommendation.candidate_phone || 'Non renseigné'}</Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Recommandé par
                  </Typography>
                  <Typography>{selectedRecommendation.recommended_by_name}</Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Relation
                  </Typography>
                  <Typography>{selectedRecommendation.relationship}</Typography>
                </Grid>
              </Grid>
              
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Raison de la recommandation
              </Typography>
              <Typography variant="body1" sx={{ whiteSpace: 'pre-line' }}>
                {selectedRecommendation.recommendation_reason}
              </Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDetailDialog(false)}>
            Fermer
          </Button>
          {selectedRecommendation?.status !== 'pending' && (
            <Button 
              onClick={() => {
                handleUpdateStatus(selectedRecommendation.id, 'pending');
                setDetailDialog(false);
              }}
              variant="outlined"
              color="warning"
            >
              En attente
            </Button>
          )}
          {selectedRecommendation?.status !== 'contacted' && (
            <Button 
              onClick={() => {
                handleUpdateStatus(selectedRecommendation.id, 'contacted');
                setDetailDialog(false);
              }}
              variant="outlined"
              color="info"
            >
              Contacter
            </Button>
          )}
          {selectedRecommendation?.status !== 'rejected' && (
            <Button 
              onClick={() => {
                handleUpdateStatus(selectedRecommendation.id, 'rejected');
                setDetailDialog(false);
              }}
              variant="outlined"
              color="error"
            >
              Rejeter
            </Button>
          )}
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ProfileRecommendations;