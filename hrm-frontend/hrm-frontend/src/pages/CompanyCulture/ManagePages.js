import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Grid,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  IconButton,
  Chip,
  Alert
} from '@mui/material';
import {
  Edit as EditIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
  Visibility as ViewIcon
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';
import { getCompanyPages, updateCompanyPage } from '../../services/cultureService';

const ManagePages = () => {
  const { hasAnyRole } = useAuth();
  const [pages, setPages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editDialog, setEditDialog] = useState(false);
  const [selectedPage, setSelectedPage] = useState(null);
  const [formData, setFormData] = useState({ title: '', content: '' });
  const [saving, setSaving] = useState(false);
  const [alert, setAlert] = useState({ show: false, message: '', type: 'success' });

  const pageTypes = [
    { type: 'vision_mission', title: 'Vision & Mission', icon: '🎯' },
    { type: 'values', title: 'Valeurs', icon: '💎' },
    { type: 'policies', title: 'Politiques Internes', icon: '📋' },
    { type: 'ethics', title: 'Code d\'Éthique', icon: '⚖️' }
  ];

  useEffect(() => {
    fetchPages();
  }, []);

  const fetchPages = async () => {
    try {
      const response = await getCompanyPages();
      console.log('Pages response in ManagePages:', response);
      
      let pagesData = [];
      if (response.data) {
        if (response.data.results) {
          pagesData = response.data.results; // Pagination DRF
        } else if (Array.isArray(response.data)) {
          pagesData = response.data; // Array direct
        }
      }
      setPages(pagesData);
    } catch (error) {
      console.error('Erreur lors du chargement des pages:', error);
      setPages([]);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (pageType) => {
    const existingPage = pages.find(p => p.page_type === pageType.type);
    const pageInfo = pageTypes.find(p => p.type === pageType.type);
    
    console.log('Editing page:', pageType, 'Existing:', existingPage);
    
    setSelectedPage({
      ...pageType,
      id: existingPage?.id,
      title: pageInfo?.title || pageType.type
    });
    
    setFormData({
      title: existingPage?.title || pageInfo?.title || '',
      content: existingPage?.content || ''
    });
    
    setEditDialog(true);
  };

  const handleSave = async () => {
    if (!selectedPage) return;
    
    setSaving(true);
    try {
      const dataToSave = {
        title: formData.title.trim(),
        content: formData.content.trim(),
        page_type: selectedPage.type
      };
      
      // Validation
      if (!dataToSave.title) {
        setAlert({ show: true, message: 'Le titre est requis', type: 'error' });
        setSaving(false);
        return;
      }
      
      if (!dataToSave.content) {
        setAlert({ show: true, message: 'Le contenu est requis', type: 'error' });
        setSaving(false);
        return;
      }
      
      console.log('Saving page data:', dataToSave);
      
      if (selectedPage.id) {
        // Mise à jour d'une page existante
        const response = await updateCompanyPage(selectedPage.id, dataToSave);
        console.log('Update response:', response);
      } else {
        // Création d'une nouvelle page
        const response = await updateCompanyPage(null, dataToSave);
        console.log('Create response:', response);
      }
      
      setAlert({ show: true, message: 'Page mise à jour avec succès', type: 'success' });
      setEditDialog(false);
      await fetchPages(); // Recharger les données
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
      const errorMessage = error.response?.data?.detail || error.message || 'Erreur lors de la sauvegarde';
      setAlert({ show: true, message: errorMessage, type: 'error' });
    } finally {
      setSaving(false);
    }
  };

  const handleClose = () => {
    setEditDialog(false);
    setSelectedPage(null);
    setFormData({ title: '', content: '' });
  };

  const getPageStatus = (pageType) => {
    const existingPage = pages.find(p => p.page_type === pageType);
    return existingPage ? 'Configurée' : 'Non configurée';
  };

  const getStatusColor = (pageType) => {
    const existingPage = pages.find(p => p.page_type === pageType);
    return existingPage ? 'success' : 'warning';
  };

  return (
    <Box>
      {/* En-tête */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" fontWeight="bold" gutterBottom>
          Gestion des Pages de Culture
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Gérez le contenu des pages de culture d'entreprise
        </Typography>
      </Box>

      {/* Alerte */}
      {alert.show && (
        <Alert 
          severity={alert.type} 
          sx={{ mb: 3 }}
          onClose={() => setAlert({ show: false, message: '', type: 'success' })}
        >
          {alert.message}
        </Alert>
      )}

      {/* Grille des pages */}
      <Grid container spacing={3}>
        {pageTypes.map((pageType) => {
          const existingPage = pages.find(p => p.page_type === pageType.type);
          
          return (
            <Grid item xs={12} md={6} key={pageType.type}>
              <Card elevation={0} sx={{ border: '1px solid #e0e0e0', borderRadius: 2 }}>
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Typography variant="h4">{pageType.icon}</Typography>
                      <Box>
                        <Typography variant="h6" fontWeight="600">
                          {pageType.title}
                        </Typography>
                        <Chip
                          label={getPageStatus(pageType.type)}
                          color={getStatusColor(pageType.type)}
                          size="small"
                        />
                      </Box>
                    </Box>
                    
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      {existingPage && (
                        <IconButton size="small" color="primary">
                          <ViewIcon />
                        </IconButton>
                      )}
                      {hasAnyRole(['hr_manager', 'hr_director']) && (
                        <IconButton 
                          size="small" 
                          color="primary"
                          onClick={() => handleEdit(pageType)}
                        >
                          <EditIcon />
                        </IconButton>
                      )}
                    </Box>
                  </Box>
                  
                  {existingPage ? (
                    <Box>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                        {existingPage.content.substring(0, 150)}...
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Dernière mise à jour: {new Date(existingPage.last_updated).toLocaleDateString()}
                      </Typography>
                    </Box>
                  ) : (
                    <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic' }}>
                      Cette page n'a pas encore été configurée. Cliquez sur modifier pour ajouter du contenu.
                    </Typography>
                  )}
                </CardContent>
              </Card>
            </Grid>
          );
        })}
      </Grid>

      {/* Dialog d'édition */}
      <Dialog 
        open={editDialog} 
        onClose={handleClose}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          Modifier {selectedPage?.title}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            <TextField
              fullWidth
              label="Titre"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              sx={{ mb: 3 }}
            />
            <TextField
              fullWidth
              label="Contenu"
              multiline
              rows={12}
              value={formData.content}
              onChange={(e) => setFormData({ ...formData, content: e.target.value })}
              placeholder="Saisissez le contenu de la page..."
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} startIcon={<CancelIcon />}>
            Annuler
          </Button>
          <Button 
            onClick={handleSave}
            variant="contained"
            startIcon={<SaveIcon />}
            disabled={saving || !formData.title.trim() || !formData.content.trim()}
          >
            {saving ? 'Sauvegarde...' : 'Sauvegarder'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ManagePages;