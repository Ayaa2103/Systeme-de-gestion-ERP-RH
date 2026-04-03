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
  MenuItem
} from '@mui/material';
import {
  Business as BusinessIcon,
  Lightbulb as SuggestionIcon,
  Add as AddIcon,
  Edit as EditIcon,
  Visibility as ViewIcon,
  MoreVert as MoreVertIcon,
  TrendingUp as TrendingUpIcon,
  People as PeopleIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { getCompanyPages, getSuggestions } from '../../services/cultureService';

const CultureDashboard = () => {
  const navigate = useNavigate();
  const { user, hasAnyRole } = useAuth();
  const [pages, setPages] = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedPage, setSelectedPage] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      // Charger les pages (accessible sans authentification)
      const pagesRes = await getCompanyPages();
      console.log('Pages response:', pagesRes);
      
      // Gérer la structure de réponse Django REST framework
      let pagesData = [];
      if (pagesRes.data) {
        if (pagesRes.data.results) {
          pagesData = pagesRes.data.results; // Pagination DRF
        } else if (Array.isArray(pagesRes.data)) {
          pagesData = pagesRes.data; // Array direct
        }
      }
      setPages(pagesData);
      
      // Charger les suggestions (nécessite authentification)
      try {
        const suggestionsRes = await getSuggestions();
        console.log('Suggestions response:', suggestionsRes);
        
        let suggestionsData = [];
        if (suggestionsRes.data) {
          if (suggestionsRes.data.results) {
            suggestionsData = suggestionsRes.data.results;
          } else if (Array.isArray(suggestionsRes.data)) {
            suggestionsData = suggestionsRes.data;
          }
        }
        setSuggestions(suggestionsData);
      } catch (suggestionError) {
        console.error('Erreur lors du chargement des suggestions:', suggestionError);
        setSuggestions([]);
      }
      
    } catch (error) {
      console.error('Erreur lors du chargement des pages:', error);
      setPages([]);
      setSuggestions([]);
    } finally {
      setLoading(false);
    }
  };

  const handleMenuClick = (event, page) => {
    setAnchorEl(event.currentTarget);
    setSelectedPage(page);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedPage(null);
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

  const companyPageTypes = [
    { type: 'vision_mission', title: 'Vision & Mission', icon: '🎯' },
    { type: 'values', title: 'Valeurs', icon: '💎' },
    { type: 'policies', title: 'Politiques Internes', icon: '📋' },
    { type: 'ethics', title: 'Code d\'Éthique', icon: '⚖️' }
  ];

  return (
    <Box>
      {/* En-tête */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h4" fontWeight="bold" gutterBottom>
            Culture d'Entreprise
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Gérez les pages de culture et les suggestions des employés
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => navigate('/culture/suggestions/create')}
            sx={{ borderRadius: 2, px: 3, py: 1.5 }}
          >
            Nouvelle Suggestion
          </Button>
          {hasAnyRole(['hr_manager', 'hr_director']) && (
            <Button
              variant="outlined"
              onClick={() => navigate('/culture/pages')}
              sx={{ borderRadius: 2, px: 3, py: 1.5 }}
            >
              Gérer Pages
            </Button>
          )}
        </Box>
      </Box>

      {/* Statistiques */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card elevation={0} sx={{ border: '1px solid #e0e0e0', borderRadius: 2 }}>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="h4" color="primary" fontWeight="bold">
                {pages.length}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Pages Culture
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card elevation={0} sx={{ border: '1px solid #e0e0e0', borderRadius: 2 }}>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="h4" color="info.main" fontWeight="bold">
                {suggestions.length}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Total Suggestions
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
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
        <Grid item xs={12} sm={6} md={3}>
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

      <Grid container spacing={3}>
        {/* Pages de culture */}
        <Grid item xs={12} md={6}>
          <Card elevation={0} sx={{ border: '1px solid #e0e0e0', borderRadius: 2 }}>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6" fontWeight="600">
                  Pages de Culture
                </Typography>
                {hasAnyRole(['hr_manager', 'hr_director']) && (
                  <Button
                    size="small"
                    variant="outlined"
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate('/culture/pages');
                    }}
                  >
                    Gérer
                  </Button>
                )}
              </Box>
              
              <Grid container spacing={2}>
                {companyPageTypes.map((pageType) => {
                  const existingPage = pages.find(p => p.page_type === pageType.type);
                  return (
                    <Grid item xs={12} sm={6} key={pageType.type}>
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
                        onClick={() => navigate(`/culture/pages/${pageType.type}`)}
                      >
                        <CardContent sx={{ textAlign: 'center', py: 2 }}>
                          <Typography variant="h4" sx={{ mb: 1 }}>
                            {pageType.icon}
                          </Typography>
                          <Typography variant="body2" fontWeight="600">
                            {pageType.title}
                          </Typography>
                          {existingPage && (
                            <Typography variant="caption" color="text.secondary">
                              Mis à jour le {new Date(existingPage.last_updated).toLocaleDateString()}
                            </Typography>
                          )}
                        </CardContent>
                      </Card>
                    </Grid>
                  );
                })}
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* Suggestions récentes */}
        <Grid item xs={12} md={6}>
          <Card elevation={0} sx={{ border: '1px solid #e0e0e0', borderRadius: 2 }}>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6" fontWeight="600">
                  Suggestions Récentes
                </Typography>
                <Button
                  size="small"
                  variant="outlined"
                  onClick={() => navigate('/culture/suggestions')}
                >
                  Voir Toutes
                </Button>
              </Box>
              
              {suggestions.length === 0 ? (
                <Typography color="text.secondary" sx={{ textAlign: 'center', py: 4 }}>
                  Aucune suggestion pour le moment
                </Typography>
              ) : (
                <List>
                  {suggestions.slice(0, 5).map((suggestion, index) => (
                    <React.Fragment key={suggestion.id}>
                      <ListItem sx={{ px: 0 }}>
                        <ListItemAvatar>
                          <Avatar sx={{ backgroundColor: '#1976d2', width: 40, height: 40 }}>
                            <SuggestionIcon />
                          </Avatar>
                        </ListItemAvatar>
                        <ListItemText
                          primary={suggestion.title}
                          secondary={
                            <Box>
                              <Typography variant="body2" color="text.secondary">
                                Par {suggestion.employee_name}
                              </Typography>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
                                <Chip
                                  label={getStatusLabel(suggestion.status)}
                                  color={getStatusColor(suggestion.status)}
                                  size="small"
                                />
                                <Typography variant="caption" color="text.secondary">
                                  {new Date(suggestion.date).toLocaleDateString()}
                                </Typography>
                              </Box>
                            </Box>
                          }
                          primaryTypographyProps={{ fontWeight: 500 }}
                        />
                      </ListItem>
                      {index < Math.min(suggestions.length - 1, 4) && <Divider />}
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
          navigate(`/culture/pages/${selectedPage?.page_type}`);
          handleMenuClose();
        }}>
          <ViewIcon sx={{ mr: 1 }} />
          Voir
        </MenuItem>
        {hasAnyRole(['hr_manager', 'hr_director']) && (
          <MenuItem onClick={() => {
            navigate(`/culture/pages/${selectedPage?.page_type}/edit`);
            handleMenuClose();
          }}>
            <EditIcon sx={{ mr: 1 }} />
            Modifier
          </MenuItem>
        )}
      </Menu>
    </Box>
  );
};

export default CultureDashboard;