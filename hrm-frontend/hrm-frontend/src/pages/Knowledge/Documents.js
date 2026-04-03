import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Grid,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem
} from '@mui/material';
import {
  Add as AddIcon,
  Download as DownloadIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Description as DocumentIcon
} from '@mui/icons-material';
import { getDocuments, uploadDocument } from '../../services/knowledgeService';

const Documents = () => {
  const navigate = useNavigate();
  const [documents, setDocuments] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [loading, setLoading] = useState(false);
  const [newDocument, setNewDocument] = useState({
    title: '',
    category: '',
    description: '',
    version: '1.0',
    file: null
  });

  useEffect(() => {
    loadDocuments();
  }, []);

  const loadDocuments = async () => {
    try {
      setLoading(true);
      const response = await getDocuments();
      console.log('Documents chargés:', response);
      setDocuments(response || []);
    } catch (error) {
      console.error('Erreur chargement documents:', error);
      setDocuments([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateDocument = async () => {
    if (!newDocument.title || !newDocument.category) {
      alert('Veuillez remplir le titre et la catégorie');
      return;
    }
    
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('title', newDocument.title);
      formData.append('category', newDocument.category);
      formData.append('description', newDocument.description || '');
      formData.append('version', newDocument.version);
      
      if (newDocument.file) {
        formData.append('file', newDocument.file);
      } else {
        // Créer un fichier texte par défaut si aucun fichier n'est fourni
        const blob = new Blob([newDocument.description || 'Document créé depuis l\'interface'], { type: 'text/plain' });
        formData.append('file', blob, `${newDocument.title.replace(/\s+/g, '_')}.txt`);
      }
      
      console.log('Sending document data:', {
        title: newDocument.title,
        category: newDocument.category,
        description: newDocument.description,
        version: newDocument.version,
        hasFile: !!newDocument.file
      });
      
      const response = await uploadDocument(formData);
      console.log('Document created:', response.data);
      
      setOpenDialog(false);
      setNewDocument({ title: '', category: '', description: '', version: '1.0', file: null });
      await loadDocuments();
      alert('Document ajouté avec succès!');
    } catch (error) {
      console.error('Erreur création document:', error);
      console.error('Error details:', error.response?.data);
      alert(`Erreur: ${error.response?.data?.error || error.response?.data?.detail || error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const getCategoryColor = (category) => {
    const colors = {
      'quality': 'primary',
      'production': 'secondary',
      'security': 'error',
      'hr': 'success',
      'other': 'warning'
    };
    return colors[category] || 'default';
  };

  const getCategoryLabel = (category) => {
    const labels = {
      'quality': 'Qualité',
      'production': 'Production',
      'security': 'Sécurité',
      'hr': 'RH',
      'other': 'Autre'
    };
    return labels[category] || category;
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h4" fontWeight="bold" gutterBottom>
            Gestion des Documents
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Base documentaire des connaissances et procédures
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => navigate('/knowledge/documents/add')}
        >
          Ajouter Document
        </Button>
      </Box>

      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <DocumentIcon sx={{ fontSize: 40, color: 'primary.main', mr: 2 }} />
                <Box>
                  <Typography variant="h4" color="primary">
                    {documents.length}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Documents Total
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Card>
        <CardContent>
          <TableContainer component={Paper} elevation={0}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Titre</TableCell>
                  <TableCell>Catégorie</TableCell>
                  <TableCell>Description</TableCell>
                  <TableCell>Date</TableCell>
                  <TableCell>Version</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {documents.map((doc) => (
                  <TableRow key={doc.id}>
                    <TableCell>
                      <Typography variant="subtitle2">{doc.title}</Typography>
                    </TableCell>
                    <TableCell>
                      <Chip 
                        label={getCategoryLabel(doc.category)} 
                        color={getCategoryColor(doc.category)}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" color="text.secondary">
                        {doc.description}
                      </Typography>
                    </TableCell>
                    <TableCell>{new Date(doc.created_at).toLocaleDateString()}</TableCell>
                    <TableCell>{doc.version}</TableCell>
                    <TableCell>
                      <IconButton size="small" color="primary">
                        <DownloadIcon />
                      </IconButton>
                      <IconButton size="small" color="secondary">
                        <EditIcon />
                      </IconButton>
                      <IconButton size="small" color="error">
                        <DeleteIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>

      {/* Dialog Ajouter Document */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Ajouter un Document</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Titre"
            fullWidth
            variant="outlined"
            value={newDocument.title}
            onChange={(e) => setNewDocument({ ...newDocument, title: e.target.value })}
            sx={{ mb: 2 }}
          />
          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel>Catégorie</InputLabel>
            <Select
              value={newDocument.category}
              label="Catégorie"
              onChange={(e) => setNewDocument({ ...newDocument, category: e.target.value })}
            >
              <MenuItem value="quality">Qualité</MenuItem>
              <MenuItem value="production">Production</MenuItem>
              <MenuItem value="security">Sécurité</MenuItem>
              <MenuItem value="hr">RH</MenuItem>
              <MenuItem value="other">Autre</MenuItem>
            </Select>
          </FormControl>
          <TextField
            margin="dense"
            label="Version"
            fullWidth
            variant="outlined"
            value={newDocument.version}
            onChange={(e) => setNewDocument({ ...newDocument, version: e.target.value })}
            sx={{ mb: 2 }}
          />
          <TextField
            margin="dense"
            label="Description"
            fullWidth
            multiline
            rows={3}
            variant="outlined"
            value={newDocument.description}
            onChange={(e) => setNewDocument({ ...newDocument, description: e.target.value })}
            sx={{ mb: 2 }}
          />
          <Button
            variant="outlined"
            component="label"
            fullWidth
            sx={{ mb: 2 }}
          >
            {newDocument.file ? newDocument.file.name : 'Choisir un fichier (optionnel)'}
            <input
              type="file"
              hidden
              accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt"
              onChange={(e) => setNewDocument({ ...newDocument, file: e.target.files[0] })}
            />
          </Button>

        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Annuler</Button>
          <Button onClick={handleCreateDocument} variant="contained" disabled={loading}>
            {loading ? 'Ajout...' : 'Ajouter'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Documents;