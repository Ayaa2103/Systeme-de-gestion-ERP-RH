import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert
} from '@mui/material';
import { ArrowBack as ArrowBackIcon, Upload as UploadIcon } from '@mui/icons-material';
import { uploadDocument } from '../../services/knowledgeService';

const AddDocument = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [formData, setFormData] = useState({
    title: '',
    category: '',
    description: '',
    version: '1.0',
    file: null
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.title || !formData.category || !formData.file) {
      setError('Titre, catégorie et fichier sont obligatoires');
      return;
    }
    
    setLoading(true);
    setError('');
    
    try {
      if (!formData.file) {
        setError('Veuillez sélectionner un fichier');
        return;
      }
      
      const data = new FormData();
      data.append('title', formData.title);
      data.append('category', formData.category);
      data.append('description', formData.description);
      data.append('version', formData.version);
      data.append('is_active', 'true');
      data.append('file', formData.file);
      
      console.log('Sending document...');
      const response = await uploadDocument(data);
      console.log('Upload response:', response);
      
      setSuccess('Document ajouté avec succès!');
      setTimeout(() => {
        navigate('/knowledge/documents');
      }, 2000);
    } catch (error) {
      console.error('Upload error:', error);
      console.error('Error response:', error.response?.data);
      setError(error.response?.data?.error || error.response?.data?.detail || 'Erreur lors de l\'ajout du document');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate('/knowledge/documents')}
          sx={{ mr: 2 }}
        >
          Retour
        </Button>
        <Typography variant="h4" fontWeight="bold">
          Ajouter un Document
        </Typography>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}
      {success && <Alert severity="success" sx={{ mb: 3 }}>{success}</Alert>}

      <Card>
        <CardContent>
          <form onSubmit={handleSubmit}>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Titre *"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  required
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <FormControl fullWidth required>
                  <InputLabel>Catégorie *</InputLabel>
                  <Select
                    value={formData.category}
                    label="Catégorie *"
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  >
                    <MenuItem value="quality">Qualité</MenuItem>
                    <MenuItem value="production">Production</MenuItem>
                    <MenuItem value="security">Sécurité</MenuItem>
                    <MenuItem value="hr">RH</MenuItem>
                    <MenuItem value="other">Autre</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Version"
                  value={formData.version}
                  onChange={(e) => setFormData({ ...formData, version: e.target.value })}
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Description"
                  multiline
                  rows={4}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
              </Grid>

              <Grid item xs={12}>
                <Button
                  variant="outlined"
                  component="label"
                  fullWidth
                  sx={{ py: 2 }}
                >
                  {formData.file ? formData.file.name : 'Choisir un fichier *'}
                  <input
                    type="file"
                    hidden
                    accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt"
                    onChange={(e) => setFormData({ ...formData, file: e.target.files[0] })}
                    required
                  />
                </Button>
              </Grid>

              <Grid item xs={12}>
                <Box sx={{ display: 'flex', gap: 2 }}>
                  <Button
                    type="submit"
                    variant="contained"
                    startIcon={<UploadIcon />}
                    disabled={loading}
                    size="large"
                  >
                    {loading ? 'Ajout en cours...' : 'Ajouter le Document'}
                  </Button>
                  <Button
                    variant="outlined"
                    size="large"
                    onClick={() => navigate('/knowledge/documents')}
                  >
                    Annuler
                  </Button>
                </Box>
              </Grid>
            </Grid>
          </form>
        </CardContent>
      </Card>
    </Box>
  );
};

export default AddDocument;