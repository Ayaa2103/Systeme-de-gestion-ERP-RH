import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  IconButton,
  Divider,
  Skeleton
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  Edit as EditIcon,
  CalendarToday as CalendarIcon
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';
import { getCompanyPages } from '../../services/cultureService';

const ViewPage = () => {
  const { pageType } = useParams();
  const navigate = useNavigate();
  const { hasAnyRole } = useAuth();
  const [page, setPage] = useState(null);
  const [loading, setLoading] = useState(true);

  const pageTypeInfo = {
    'vision_mission': { title: 'Vision & Mission', icon: '🎯' },
    'values': { title: 'Valeurs', icon: '💎' },
    'policies': { title: 'Politiques Internes', icon: '📋' },
    'ethics': { title: 'Code d\'Éthique', icon: '⚖️' }
  };

  useEffect(() => {
    fetchPage();
  }, [pageType]);

  const fetchPage = async () => {
    try {
      const response = await getCompanyPages();
      console.log('Pages response in ViewPage:', response);
      
      let pagesData = [];
      if (response.data) {
        if (response.data.results) {
          pagesData = response.data.results; // Pagination DRF
        } else if (Array.isArray(response.data)) {
          pagesData = response.data; // Array direct
        }
      }
      
      const foundPage = pagesData.find(p => p.page_type === pageType);
      
      if (foundPage) {
        setPage(foundPage);
      } else {
        // Créer une page par défaut si elle n'existe pas
        const defaultPage = {
          page_type: pageType,
          title: pageTypeInfo[pageType]?.title || pageType,
          content: 'Cette page n\'a pas encore été configurée.',
          last_updated: new Date().toISOString()
        };
        setPage(defaultPage);
      }
    } catch (error) {
      console.error('Erreur lors du chargement de la page:', error);
      // En cas d'erreur, afficher une page par défaut
      const defaultPage = {
        page_type: pageType,
        title: pageTypeInfo[pageType]?.title || pageType,
        content: 'Erreur lors du chargement de la page.',
        last_updated: new Date().toISOString()
      };
      setPage(defaultPage);
    } finally {
      setLoading(false);
    }
  };

  const formatContent = (content) => {
    return content.split('\n').map((line, index) => (
      <Typography 
        key={index} 
        variant="body1" 
        sx={{ 
          mb: line.trim() === '' ? 2 : 1,
          fontWeight: line.includes(':') && line.length < 50 ? 600 : 400
        }}
      >
        {line || '\u00A0'}
      </Typography>
    ));
  };

  if (loading) {
    return (
      <Box>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
          <Skeleton variant="circular" width={40} height={40} sx={{ mr: 2 }} />
          <Skeleton variant="text" width={200} height={40} />
        </Box>
        <Card>
          <CardContent>
            <Skeleton variant="text" width="100%" height={30} />
            <Skeleton variant="text" width="100%" height={20} />
            <Skeleton variant="text" width="80%" height={20} />
            <Skeleton variant="rectangular" width="100%" height={200} sx={{ mt: 2 }} />
          </CardContent>
        </Card>
      </Box>
    );
  }

  const pageInfo = pageTypeInfo[pageType] || { title: pageType, icon: '📄' };

  return (
    <Box>
      {/* En-tête */}
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <IconButton onClick={() => navigate('/culture')} sx={{ mr: 2 }}>
            <ArrowBackIcon />
          </IconButton>
          <Typography variant="h3" sx={{ mr: 2 }}>
            {pageInfo.icon}
          </Typography>
          <Box>
            <Typography variant="h4" fontWeight="bold">
              {page?.title || pageInfo.title}
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
              <CalendarIcon sx={{ fontSize: 16, mr: 1, color: 'text.secondary' }} />
              <Typography variant="body2" color="text.secondary">
                Dernière mise à jour: {new Date(page?.last_updated || new Date()).toLocaleDateString('fr-FR')}
              </Typography>
            </Box>
          </Box>
        </Box>
        
        {hasAnyRole(['hr_manager', 'hr_director']) && (
          <Button
            variant="contained"
            startIcon={<EditIcon />}
            onClick={() => navigate('/culture/pages')}
            sx={{ borderRadius: 2 }}
          >
            Modifier
          </Button>
        )}
      </Box>

      {/* Contenu */}
      <Card elevation={0} sx={{ border: '1px solid #e0e0e0', borderRadius: 2 }}>
        <CardContent sx={{ p: 4 }}>
          {page?.content ? (
            <Box>
              {formatContent(page.content)}
            </Box>
          ) : (
            <Box sx={{ textAlign: 'center', py: 8 }}>
              <Typography variant="h6" color="text.secondary" gutterBottom>
                Cette page n'a pas encore été configurée
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                Le contenu de cette page sera bientôt disponible.
              </Typography>
              {hasAnyRole(['hr_manager', 'hr_director']) && (
                <Button
                  variant="outlined"
                  startIcon={<EditIcon />}
                  onClick={() => navigate('/culture/pages')}
                >
                  Ajouter du contenu
                </Button>
              )}
            </Box>
          )}
        </CardContent>
      </Card>
    </Box>
  );
};

export default ViewPage;