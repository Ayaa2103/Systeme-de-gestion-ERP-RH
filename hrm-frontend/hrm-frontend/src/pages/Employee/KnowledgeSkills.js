import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  Chip,
  Box,
  Tabs,
  Tab,
  TextField,
  MenuItem,
  LinearProgress,
  IconButton,
  Tooltip
} from '@mui/material';
import {
  School as SkillIcon,
  Description as DocumentIcon,
  Download as DownloadIcon,
  Search as SearchIcon,
  Star as StarIcon,
  StarBorder as StarBorderIcon,
  Work as PositionIcon
} from '@mui/icons-material';
import { knowledgeService } from '../../services/knowledgeService';

function TabPanel({ children, value, index, ...other }) {
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`knowledge-tabpanel-${index}`}
      aria-labelledby={`knowledge-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

const KnowledgeSkills = () => {
  const [tabValue, setTabValue] = useState(0);
  const [skills, setSkills] = useState([]);
  const [positions, setPositions] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [skillsData, documentsData] = await Promise.all([
        knowledgeService.getEmployeeSkills(),
        knowledgeService.getEmployeeDocuments()
      ]);
      
      setSkills(skillsData.skills || []);
      setPositions(skillsData.positions || []);
      setDocuments(documentsData.documents || []);
      setCategories(documentsData.categories || []);
    } catch (error) {
      console.error('Erreur lors du chargement des données:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const getLevelColor = (level) => {
    const colors = {
      0: 'default',
      1: 'error',
      2: 'warning', 
      3: 'info',
      4: 'success'
    };
    return colors[level] || 'default';
  };

  const getLevelColorValue = (level) => {
    const colors = {
      0: '#9e9e9e',
      1: '#f44336',
      2: '#ff9800',
      3: '#2196f3',
      4: '#4caf50'
    };
    return colors[level] || '#9e9e9e';
  };

  const getLevelProgress = (level) => {
    return (level / 4) * 100;
  };

  const filteredDocuments = documents.filter(doc => {
    const matchesSearch = doc.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         doc.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = !selectedCategory || doc.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const groupedSkills = skills.reduce((acc, skill) => {
    const category = skill.category || 'Autres';
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(skill);
    return acc;
  }, {});

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <LinearProgress />
        <Typography variant="h6" sx={{ mt: 2 }}>
          Chargement des formations et connaissances...
        </Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" gutterBottom>
        Formation et Connaissances
      </Typography>

      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs value={tabValue} onChange={handleTabChange}>
          <Tab 
            icon={<SkillIcon />} 
            label="Mes Compétences" 
            iconPosition="start"
          />
          <Tab 
            icon={<PositionIcon />} 
            label="Ma Polyvalence" 
            iconPosition="start"
          />
          <Tab 
            icon={<DocumentIcon />} 
            label="Documents" 
            iconPosition="start"
          />
        </Tabs>
      </Box>

      <TabPanel value={tabValue} index={0}>
        <Typography variant="h6" gutterBottom>
          Matrice de Compétences
        </Typography>
        
        {Object.keys(groupedSkills).length === 0 ? (
          <Card>
            <CardContent>
              <Typography variant="body1" color="text.secondary">
                Aucune compétence assignée pour le moment.
              </Typography>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ mb: 3 }}>
                Matrice de Compétences Professionnelles
              </Typography>
              
              {Object.entries(groupedSkills).map(([category, categorySkills]) => (
                <Box key={category} sx={{ mb: 4 }}>
                  <Typography variant="h6" color="primary" sx={{ mb: 2, borderBottom: 1, borderColor: 'divider', pb: 1 }}>
                    {category || 'Compétences Générales'}
                  </Typography>
                  
                  <Grid container spacing={1} sx={{ mb: 2 }}>
                    <Grid item xs={5}>
                      <Typography variant="subtitle2" fontWeight="bold">Compétence</Typography>
                    </Grid>
                    <Grid item xs={2}>
                      <Typography variant="subtitle2" fontWeight="bold" textAlign="center">Niveau</Typography>
                    </Grid>
                    <Grid item xs={3}>
                      <Typography variant="subtitle2" fontWeight="bold" textAlign="center">Progression</Typography>
                    </Grid>
                    <Grid item xs={2}>
                      <Typography variant="subtitle2" fontWeight="bold" textAlign="center">Statut</Typography>
                    </Grid>
                  </Grid>
                  
                  {categorySkills.map((skill) => (
                    <Grid container spacing={1} key={skill.id} sx={{ 
                      py: 1.5, 
                      borderBottom: '1px solid #f0f0f0',
                      '&:hover': { backgroundColor: '#f9f9f9' }
                    }}>
                      <Grid item xs={5}>
                        <Box>
                          <Typography variant="body1" fontWeight="500">
                            {skill.name}
                          </Typography>
                          {skill.description && (
                            <Typography variant="caption" color="text.secondary">
                              {skill.description}
                            </Typography>
                          )}
                        </Box>
                      </Grid>
                      
                      <Grid item xs={2} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Chip 
                          label={skill.level_display} 
                          size="small"
                          sx={{
                            backgroundColor: getLevelColorValue(skill.level),
                            color: 'white',
                            fontWeight: 'bold'
                          }}
                        />
                      </Grid>
                      
                      <Grid item xs={3} sx={{ display: 'flex', alignItems: 'center' }}>
                        <Box sx={{ width: '100%', px: 1 }}>
                          <LinearProgress 
                            variant="determinate" 
                            value={getLevelProgress(skill.level)}
                            sx={{
                              height: 8,
                              borderRadius: 4,
                              backgroundColor: '#e0e0e0',
                              '& .MuiLinearProgress-bar': {
                                backgroundColor: getLevelColorValue(skill.level),
                                borderRadius: 4
                              }
                            }}
                          />
                          <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block', textAlign: 'center' }}>
                            {Math.round(getLevelProgress(skill.level))}%
                          </Typography>
                        </Box>
                      </Grid>
                      
                      <Grid item xs={2} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        {skill.certified ? (
                          <Tooltip title={`Certifié le ${skill.certification_date ? new Date(skill.certification_date).toLocaleDateString('fr-FR') : ''}`}>
                            <StarIcon sx={{ color: '#ffa726' }} />
                          </Tooltip>
                        ) : (
                          <Tooltip title="Non certifié">
                            <StarBorderIcon sx={{ color: '#bdbdbd' }} />
                          </Tooltip>
                        )}
                      </Grid>
                    </Grid>
                  ))}
                </Box>
              ))}
              
              <Box sx={{ mt: 4, p: 2, backgroundColor: '#f5f5f5', borderRadius: 2 }}>
                <Typography variant="subtitle2" gutterBottom>Légende des niveaux :</Typography>
                <Grid container spacing={2}>
                  <Grid item xs={6} sm={3}>
                    <Box display="flex" alignItems="center">
                      <Box sx={{ width: 16, height: 16, backgroundColor: '#9e9e9e', borderRadius: 1, mr: 1 }} />
                      <Typography variant="caption">Non évalué</Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={6} sm={3}>
                    <Box display="flex" alignItems="center">
                      <Box sx={{ width: 16, height: 16, backgroundColor: '#f44336', borderRadius: 1, mr: 1 }} />
                      <Typography variant="caption">Débutant</Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={6} sm={3}>
                    <Box display="flex" alignItems="center">
                      <Box sx={{ width: 16, height: 16, backgroundColor: '#ff9800', borderRadius: 1, mr: 1 }} />
                      <Typography variant="caption">Intermédiaire</Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={6} sm={3}>
                    <Box display="flex" alignItems="center">
                      <Box sx={{ width: 16, height: 16, backgroundColor: '#2196f3', borderRadius: 1, mr: 1 }} />
                      <Typography variant="caption">Confirmé</Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={6} sm={3}>
                    <Box display="flex" alignItems="center">
                      <Box sx={{ width: 16, height: 16, backgroundColor: '#4caf50', borderRadius: 1, mr: 1 }} />
                      <Typography variant="caption">Expert</Typography>
                    </Box>
                  </Grid>
                </Grid>
              </Box>
            </CardContent>
          </Card>
        )}
      </TabPanel>

      <TabPanel value={tabValue} index={1}>
        <Typography variant="h6" gutterBottom>
          Matrice de Polyvalence
        </Typography>
        
        {positions.length === 0 ? (
          <Card>
            <CardContent>
              <Typography variant="body1" color="text.secondary">
                Aucune polyvalence assignée pour le moment.
              </Typography>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ mb: 3 }}>
                Polyvalence sur Différents Postes
              </Typography>
              
              <Grid container spacing={1} sx={{ mb: 2 }}>
                <Grid item xs={5}>
                  <Typography variant="subtitle2" fontWeight="bold">Poste</Typography>
                </Grid>
                <Grid item xs={2}>
                  <Typography variant="subtitle2" fontWeight="bold" textAlign="center">Niveau</Typography>
                </Grid>
                <Grid item xs={3}>
                  <Typography variant="subtitle2" fontWeight="bold" textAlign="center">Autonomie</Typography>
                </Grid>
                <Grid item xs={2}>
                  <Typography variant="subtitle2" fontWeight="bold" textAlign="center">Statut</Typography>
                </Grid>
              </Grid>
              
              {positions.map((position) => (
                <Grid container spacing={1} key={position.id} sx={{ 
                  py: 1.5, 
                  borderBottom: '1px solid #f0f0f0',
                  '&:hover': { backgroundColor: '#f9f9f9' }
                }}>
                  <Grid item xs={5}>
                    <Box>
                      <Typography variant="body1" fontWeight="500">
                        {position.name}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {position.department}
                      </Typography>
                    </Box>
                  </Grid>
                  
                  <Grid item xs={2} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Chip 
                      label={position.level_display || `Niveau ${position.level}`} 
                      size="small"
                      sx={{
                        backgroundColor: getLevelColorValue(position.level),
                        color: 'white',
                        fontWeight: 'bold'
                      }}
                    />
                  </Grid>
                  
                  <Grid item xs={3} sx={{ display: 'flex', alignItems: 'center' }}>
                    <Box sx={{ width: '100%', px: 1 }}>
                      <LinearProgress 
                        variant="determinate" 
                        value={getLevelProgress(position.level)}
                        sx={{
                          height: 8,
                          borderRadius: 4,
                          backgroundColor: '#e0e0e0',
                          '& .MuiLinearProgress-bar': {
                            backgroundColor: getLevelColorValue(position.level),
                            borderRadius: 4
                          }
                        }}
                      />
                      <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block', textAlign: 'center' }}>
                        {Math.round(getLevelProgress(position.level))}%
                      </Typography>
                    </Box>
                  </Grid>
                  
                  <Grid item xs={2} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {position.is_current ? (
                      <Tooltip title="Poste actuel">
                        <StarIcon sx={{ color: '#ffa726' }} />
                      </Tooltip>
                    ) : (
                      <Tooltip title="Polyvalence">
                        <StarBorderIcon sx={{ color: '#bdbdbd' }} />
                      </Tooltip>
                    )}
                  </Grid>
                </Grid>
              ))}
              
              <Box sx={{ mt: 4, p: 2, backgroundColor: '#f5f5f5', borderRadius: 2 }}>
                <Typography variant="subtitle2" gutterBottom>Légende des niveaux d'autonomie :</Typography>
                <Grid container spacing={2}>
                  <Grid item xs={6} sm={3}>
                    <Box display="flex" alignItems="center">
                      <Box sx={{ width: 16, height: 16, backgroundColor: '#9e9e9e', borderRadius: 1, mr: 1 }} />
                      <Typography variant="caption">Non formé</Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={6} sm={3}>
                    <Box display="flex" alignItems="center">
                      <Box sx={{ width: 16, height: 16, backgroundColor: '#f44336', borderRadius: 1, mr: 1 }} />
                      <Typography variant="caption">Accompagné</Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={6} sm={3}>
                    <Box display="flex" alignItems="center">
                      <Box sx={{ width: 16, height: 16, backgroundColor: '#ff9800', borderRadius: 1, mr: 1 }} />
                      <Typography variant="caption">Supervisé</Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={6} sm={3}>
                    <Box display="flex" alignItems="center">
                      <Box sx={{ width: 16, height: 16, backgroundColor: '#2196f3', borderRadius: 1, mr: 1 }} />
                      <Typography variant="caption">Autonome</Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={6} sm={3}>
                    <Box display="flex" alignItems="center">
                      <Box sx={{ width: 16, height: 16, backgroundColor: '#4caf50', borderRadius: 1, mr: 1 }} />
                      <Typography variant="caption">Expert</Typography>
                    </Box>
                  </Grid>
                </Grid>
              </Box>
            </CardContent>
          </Card>
        )}
      </TabPanel>

      <TabPanel value={tabValue} index={2}>
        <Box mb={3}>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                placeholder="Rechercher un document..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                InputProps={{
                  startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} />
                }}
              />
            </Grid>
            <Grid item xs={12} md={3}>
              <TextField
                select
                fullWidth
                label="Catégorie"
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
              >
                <MenuItem value="">Toutes les catégories</MenuItem>
                {categories.map(([value, label]) => (
                  <MenuItem key={value} value={value}>
                    {label}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
          </Grid>
        </Box>

        <Grid container spacing={3}>
          {filteredDocuments.length === 0 ? (
            <Grid item xs={12}>
              <Card>
                <CardContent>
                  <Typography variant="body1" color="text.secondary">
                    Aucun document trouvé.
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ) : (
            filteredDocuments.map((document) => (
              <Grid item xs={12} md={6} lg={4} key={document.id}>
                <Card>
                  <CardContent>
                    <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
                      <Typography variant="h6" component="div">
                        {document.title}
                      </Typography>
                      {document.file_url && (
                        <Tooltip title="Télécharger">
                          <IconButton
                            size="small"
                            onClick={() => {
                              const link = window.document.createElement('a');
                              link.href = `http://127.0.0.1:8000${document.file_url}`;
                              link.download = document.title;
                              link.target = '_blank';
                              window.document.body.appendChild(link);
                              link.click();
                              window.document.body.removeChild(link);
                            }}
                          >
                            <DownloadIcon />
                          </IconButton>
                        </Tooltip>
                      )}
                    </Box>
                    
                    <Chip 
                      label={document.category_display} 
                      size="small" 
                      color="primary" 
                      variant="outlined"
                      sx={{ mb: 2 }}
                    />
                    
                    {document.description && (
                      <Typography variant="body2" color="text.secondary" mb={2}>
                        {document.description}
                      </Typography>
                    )}
                    
                    <Box display="flex" justifyContent="space-between" alignItems="center">
                      <Typography variant="caption" color="text.secondary">
                        Version {document.version}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {new Date(document.updated_at).toLocaleDateString('fr-FR')}
                      </Typography>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))
          )}
        </Grid>
      </TabPanel>
    </Container>
  );
};

export default KnowledgeSkills;