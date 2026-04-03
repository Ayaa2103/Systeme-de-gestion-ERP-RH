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
  Tabs,
  Tab,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Divider
} from '@mui/material';
import {
  Lightbulb as SuggestionIcon,
  MoreVert as MoreVertIcon,
  Reply as ReplyIcon,
  Visibility as ViewIcon,
  Add as AddIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { getSuggestions, respondToSuggestion } from '../../services/cultureService';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

const ManageSuggestions = () => {
  const navigate = useNavigate();
  const { hasAnyRole } = useAuth();
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tabValue, setTabValue] = useState(0);
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedSuggestion, setSelectedSuggestion] = useState(null);
  const [responseDialog, setResponseDialog] = useState(false);
  const [response, setResponse] = useState('');

  useEffect(() => {
    fetchSuggestions();
  }, []);

  const fetchSuggestions = async () => {
    try {
      const response = await getSuggestions();
      setSuggestions(response.data.results || response.data);
    } catch (error) {
      console.error('Erreur lors du chargement:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleMenuClick = (event, suggestion) => {
    setAnchorEl(event.currentTarget);
    setSelectedSuggestion(suggestion);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedSuggestion(null);
  };

  const handleRespond = (suggestion) => {
    setSelectedSuggestion(suggestion);
    setResponse(suggestion.response || '');
    setResponseDialog(true);
    handleMenuClose();
  };

  const submitResponse = async () => {
    try {
      await respondToSuggestion(selectedSuggestion.id, response);
      await fetchSuggestions();
      setResponseDialog(false);
      setResponse('');
    } catch (error) {
      console.error('Erreur lors de la réponse:', error);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'new': return 'info';
      case 'received': return 'warning';
      case 'answered': return 'success';
      default: return 'default';
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case 'new': return 'Nouvelle';
      case 'received': return 'Reçue';
      case 'answered': return 'Répondue';
      default: return status;
    }
  };

  const filterSuggestions = (status) => {
    if (tabValue === 0) return suggestions;
    if (tabValue === 1) return suggestions.filter(s => s.status === 'new');
    if (tabValue === 2) return suggestions.filter(s => s.status === 'answered');
    return suggestions;
  };

  const SuggestionCard = ({ suggestion }) => (
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
            <Avatar sx={{ mr: 2, backgroundColor: '#1976d2' }}>
              <SuggestionIcon />
            </Avatar>
            <Box sx={{ flex: 1 }}>
              <Typography variant="h6" fontWeight="600" gutterBottom>
                {suggestion.title}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                Par {suggestion.employee_name} • {format(new Date(suggestion.date), 'dd MMMM yyyy', { locale: fr })}
              </Typography>
              <Chip
                label={getStatusLabel(suggestion.status)}
                color={getStatusColor(suggestion.status)}
                size="small"
              />
            </Box>
          </Box>
          <IconButton onClick={(e) => handleMenuClick(e, suggestion)}>
            <MoreVertIcon />
          </IconButton>
        </Box>

        <Typography variant="body2" sx={{ mb: 2 }}>
          {suggestion.suggestion_text}
        </Typography>

        {suggestion.response && (
          <Box sx={{ mt: 2, p: 2, backgroundColor: '#f8fafc', borderRadius: 2 }}>
            <Typography variant="body2" fontWeight="600" gutterBottom>
              Réponse de {suggestion.responded_by_name}:
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {suggestion.response}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {format(new Date(suggestion.response_date), 'dd MMMM yyyy à HH:mm', { locale: fr })}
            </Typography>
          </Box>
        )}

        {suggestion.status === 'new' && hasAnyRole(['hr_director']) && (
          <Box sx={{ mt: 2 }}>
            <Button
              variant="contained"
              size="small"
              startIcon={<ReplyIcon />}
              onClick={() => navigate(`/culture/suggestions/${suggestion.id}/respond`)}
            >
              Répondre
            </Button>
          </Box>
        )}
      </CardContent>
    </Card>
  );

  return (
    <Box>
      {/* En-tête */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h4" fontWeight="bold" gutterBottom>
            Gestion des Suggestions
          </Typography>
          <Typography variant="body1" color="text.secondary">
            {suggestions.length} suggestions au total
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => navigate('/culture/suggestions/create')}
          sx={{ borderRadius: 2, px: 3, py: 1.5 }}
        >
          Nouvelle Suggestion
        </Button>
      </Box>

      {/* Statistiques */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={4}>
          <Card elevation={0} sx={{ border: '1px solid #e0e0e0', borderRadius: 2 }}>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="h4" color="primary" fontWeight="bold">
                {suggestions.length}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Total Suggestions
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={4}>
          <Card elevation={0} sx={{ border: '1px solid #e0e0e0', borderRadius: 2 }}>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="h4" color="warning.main" fontWeight="bold">
                {suggestions.filter(s => s.status === 'new').length}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                En Attente
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={4}>
          <Card elevation={0} sx={{ border: '1px solid #e0e0e0', borderRadius: 2 }}>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="h4" color="success.main" fontWeight="bold">
                {suggestions.filter(s => s.status === 'answered').length}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Répondues
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Onglets */}
      <Card elevation={0} sx={{ border: '1px solid #e0e0e0', borderRadius: 2 }}>
        <Tabs
          value={tabValue}
          onChange={(e, newValue) => setTabValue(newValue)}
          sx={{ borderBottom: '1px solid #e0e0e0' }}
        >
          <Tab label="Toutes" />
          <Tab label="En attente" />
          <Tab label="Répondues" />
        </Tabs>

        <CardContent>
          {filterSuggestions().length === 0 ? (
            <Typography color="text.secondary" sx={{ textAlign: 'center', py: 4 }}>
              Aucune suggestion trouvée
            </Typography>
          ) : (
            <Box>
              {filterSuggestions().map((suggestion) => (
                <SuggestionCard key={suggestion.id} suggestion={suggestion} />
              ))}
            </Box>
          )}
        </CardContent>
      </Card>

      {/* Menu contextuel */}
      <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleMenuClose}>
        <MenuItem onClick={handleMenuClose}>
          <ViewIcon sx={{ mr: 1 }} />
          Voir Détails
        </MenuItem>
        {selectedSuggestion?.status === 'new' && hasAnyRole(['hr_director']) && (
          <MenuItem onClick={() => navigate(`/culture/suggestions/${selectedSuggestion.id}/respond`)}>
            <ReplyIcon sx={{ mr: 1 }} />
            Répondre
          </MenuItem>
        )}
      </Menu>

      {/* Dialog de réponse */}
      <Dialog open={responseDialog} onClose={() => setResponseDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>Répondre à la suggestion</DialogTitle>
        <DialogContent>
          {selectedSuggestion && (
            <Box sx={{ mb: 2 }}>
              <Typography variant="h6" gutterBottom>
                {selectedSuggestion.title}
              </Typography>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Par {selectedSuggestion.employee_name}
              </Typography>
              <Typography variant="body2" sx={{ mb: 2 }}>
                {selectedSuggestion.suggestion_text}
              </Typography>
            </Box>
          )}
          <TextField
            fullWidth
            multiline
            rows={4}
            label="Votre réponse"
            value={response}
            onChange={(e) => setResponse(e.target.value)}
            sx={{ mt: 2 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setResponseDialog(false)}>
            Annuler
          </Button>
          <Button onClick={submitResponse} variant="contained">
            Envoyer Réponse
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ManageSuggestions;