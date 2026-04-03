import React, { useState, useEffect } from 'react';
import {
  Container,
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Chip,
  Divider,
  Alert,
  Button,
  Avatar,
  CircularProgress,
  Paper,
  LinearProgress
} from '@mui/material';
import {
  Star as StarIcon,
  StarBorder as StarBorderIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  Person as PersonIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  Badge as BadgeIcon,
  Work as WorkIcon,
  Business as BusinessIcon,
  CalendarToday as CalendarIcon,
  Assignment as AssignmentIcon,
  School as SchoolIcon
} from '@mui/icons-material';
import { hrService } from '../services/hrService';
import { useNavigate } from 'react-router-dom';

const EmployeeProfile = () => {
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showAllSkills, setShowAllSkills] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchProfileData();
  }, []);

  const fetchProfileData = async () => {
    try {
      setLoading(true);
      const response = await hrService.getMyProfile();
      setProfileData(response.data);
    } catch (error) {
      console.error('Erreur lors du chargement du profil:', error);
      setError('Erreur lors du chargement du profil');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Non renseigné';
    return new Date(dateString).toLocaleDateString('fr-FR');
  };

  const renderStars = (level) => {
    return Array.from({ length: 5 }, (_, i) => (
      i < level ? 
        <StarIcon key={i} sx={{ color: '#ffc107', fontSize: 14 }} /> : 
        <StarBorderIcon key={i} sx={{ color: '#e0e0e0', fontSize: 14 }} />
    ));
  };

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Alert severity="error">{error}</Alert>
      </Container>
    );
  }

  const { user, employee, is_absent_today, contracts, skills } = profileData || {};

  return (
    <Container maxWidth="xl" sx={{ mt: 2, mb: 4 }}>
      {employee ? (
        <>
          {/* Header avec photo et statut */}
          <Paper elevation={3} sx={{ p: 4, mb: 4, background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white' }}>
            <Grid container spacing={3} alignItems="center">
              <Grid item>
                <Avatar
                  src={employee.photo ? `http://127.0.0.1:8000${employee.photo}` : undefined}
                  sx={{ 
                    width: 120, 
                    height: 120, 
                    border: '4px solid white',
                    boxShadow: '0 8px 32px rgba(0,0,0,0.3)'
                  }}
                >
                  {!employee.photo && <PersonIcon sx={{ fontSize: 60 }} />}
                </Avatar>
              </Grid>
              <Grid item xs>
                <Typography variant="h3" fontWeight="bold" gutterBottom>
                  {user?.first_name} {user?.last_name}
                </Typography>
                <Typography variant="h6" sx={{ opacity: 0.9, mb: 2 }}>
                  {employee?.poste || 'Employé'} • {employee?.department_name}
                </Typography>
                <Chip
                  icon={is_absent_today ? <CancelIcon /> : <CheckCircleIcon />}
                  label={is_absent_today ? "Absent aujourd'hui" : "Présent au bureau"}
                  color={is_absent_today ? "error" : "success"}
                  sx={{ 
                    fontSize: '0.9rem', 
                    fontWeight: 'bold',
                    '& .MuiChip-icon': { fontSize: '1.2rem' }
                  }}
                />
              </Grid>
            </Grid>
          </Paper>

          <Grid container spacing={4}>
            {/* Informations Personnelles */}
            <Grid item xs={12} lg={4}>
              <Card elevation={2} sx={{ height: 'fit-content' }}>
                <CardContent sx={{ p: 3 }}>
                  <Box display="flex" alignItems="center" mb={2}>
                    <PersonIcon sx={{ mr: 1, color: 'primary.main' }} />
                    <Typography variant="h6" fontWeight="bold">
                      Informations Personnelles
                    </Typography>
                  </Box>
                  
                  <Box sx={{ '& > *': { mb: 2.5 } }}>
                    <Box display="flex" alignItems="center">
                      <EmailIcon sx={{ mr: 2, color: 'text.secondary', fontSize: 20 }} />
                      <Box>
                        <Typography variant="caption" color="text.secondary">Email</Typography>
                        <Typography variant="body2" fontWeight="500">{user?.email}</Typography>
                      </Box>
                    </Box>
                    
                    <Box display="flex" alignItems="center">
                      <PhoneIcon sx={{ mr: 2, color: 'text.secondary', fontSize: 20 }} />
                      <Box>
                        <Typography variant="caption" color="text.secondary">Téléphone</Typography>
                        <Typography variant="body2" fontWeight="500">{user?.phone || 'Non renseigné'}</Typography>
                      </Box>
                    </Box>
                    
                    <Box display="flex" alignItems="center">
                      <BadgeIcon sx={{ mr: 2, color: 'text.secondary', fontSize: 20 }} />
                      <Box>
                        <Typography variant="caption" color="text.secondary">Matricule</Typography>
                        <Typography variant="body2" fontWeight="500">{employee?.matricule}</Typography>
                      </Box>
                    </Box>
                    
                    <Box display="flex" alignItems="center">
                      <BusinessIcon sx={{ mr: 2, color: 'text.secondary', fontSize: 20 }} />
                      <Box>
                        <Typography variant="caption" color="text.secondary">Service</Typography>
                        <Typography variant="body2" fontWeight="500">{employee?.service || 'Non renseigné'}</Typography>
                      </Box>
                    </Box>
                    
                    <Box display="flex" alignItems="center">
                      <CalendarIcon sx={{ mr: 2, color: 'text.secondary', fontSize: 20 }} />
                      <Box>
                        <Typography variant="caption" color="text.secondary">Date d'embauche</Typography>
                        <Typography variant="body2" fontWeight="500">{formatDate(employee?.date_embauche)}</Typography>
                      </Box>
                    </Box>
                    
                    <Box display="flex" alignItems="center">
                      <CheckCircleIcon sx={{ mr: 2, color: 'success.main', fontSize: 20 }} />
                      <Box>
                        <Typography variant="caption" color="text.secondary">Statut</Typography>
                        <Chip label={employee?.statut} color="success" size="small" />
                      </Box>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            {/* Contrats et Compétences */}
            <Grid item xs={12} lg={8}>
              <Grid container spacing={3}>
                {/* Contrats */}
                <Grid item xs={12}>
                  <Card elevation={2}>
                    <CardContent sx={{ p: 3 }}>
                      <Box display="flex" alignItems="center" mb={3}>
                        <AssignmentIcon sx={{ mr: 1, color: 'primary.main' }} />
                        <Typography variant="h6" fontWeight="bold">
                          Contrats
                        </Typography>
                      </Box>
                      
                      {contracts && contracts.length > 0 ? (
                        <Grid container spacing={2}>
                          {contracts.map((contract) => (
                            <Grid item xs={12} md={6} key={contract.id}>
                              <Paper 
                                elevation={1} 
                                sx={{ 
                                  p: 2.5, 
                                  border: contract.active ? '2px solid' : '1px solid',
                                  borderColor: contract.active ? 'success.main' : 'divider',
                                  position: 'relative'
                                }}
                              >
                                {contract.active && (
                                  <Chip 
                                    label="Actuel" 
                                    color="success" 
                                    size="small" 
                                    sx={{ position: 'absolute', top: 8, right: 8 }}
                                  />
                                )}
                                <Typography variant="h6" color="primary" gutterBottom>
                                  {contract.type}
                                </Typography>
                                <Typography variant="body2" color="text.secondary" gutterBottom>
                                  Du {formatDate(contract.date_debut)} 
                                  {contract.date_fin && ` au ${formatDate(contract.date_fin)}`}
                                </Typography>
                                {contract.salaire && (
                                  <Typography variant="h6" color="success.main" sx={{ mt: 1 }}>
                                    {contract.salaire.toLocaleString()} €
                                  </Typography>
                                )}
                              </Paper>
                            </Grid>
                          ))}
                        </Grid>
                      ) : (
                        <Typography variant="body2" color="text.secondary">
                          Aucun contrat trouvé
                        </Typography>
                      )}
                    </CardContent>
                  </Card>
                </Grid>

                {/* Compétences */}
                {skills && skills.length > 0 && (
                  <Grid item xs={12}>
                    <Card elevation={2}>
                      <CardContent sx={{ p: 3 }}>
                        <Box display="flex" alignItems="center" mb={3}>
                          <SchoolIcon sx={{ mr: 1, color: 'primary.main' }} />
                          <Typography variant="h6" fontWeight="bold">
                            Mes Compétences
                          </Typography>
                        </Box>
                        
                        <Grid container spacing={2}>
                          {(showAllSkills ? skills : skills.slice(0, 6)).map((skill) => (
                            <Grid item xs={12} sm={6} md={4} key={skill.id}>
                              <Paper elevation={1} sx={{ p: 2, height: '100%' }}>
                                <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
                                  {skill.skill_name}
                                </Typography>
                                <Typography variant="caption" color="text.secondary" display="block" gutterBottom>
                                  {skill.skill_category}
                                </Typography>
                                <Box sx={{ mt: 1 }}>
                                  <Box display="flex" alignItems="center" justifyContent="space-between" mb={0.5}>
                                    <Box display="flex">
                                      {renderStars(skill.level)}
                                    </Box>
                                    <Typography variant="caption" fontWeight="bold" color="primary">
                                      {skill.level}/5
                                    </Typography>
                                  </Box>
                                  <LinearProgress 
                                    variant="determinate" 
                                    value={(skill.level / 5) * 100} 
                                    sx={{ height: 6, borderRadius: 3 }}
                                  />
                                  <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
                                    {skill.level_display}
                                  </Typography>
                                </Box>
                              </Paper>
                            </Grid>
                          ))}
                        </Grid>
                        
                        {skills.length > 6 && (
                          <Box sx={{ mt: 2, textAlign: 'center' }}>
                            <Button 
                              variant="outlined" 
                              onClick={() => setShowAllSkills(!showAllSkills)}
                            >
                              {showAllSkills ? 'Voir moins' : `Voir toutes (${skills.length})`}
                            </Button>
                          </Box>
                        )}
                      </CardContent>
                    </Card>
                  </Grid>
                )}
              </Grid>
            </Grid>
          </Grid>
        </>
      ) : (
        /* Utilisateur sans profil employé */
        <Card elevation={2}>
          <CardContent sx={{ p: 4 }}>
            <Box display="flex" alignItems="center" mb={3}>
              <PersonIcon sx={{ mr: 1, color: 'primary.main' }} />
              <Typography variant="h5" fontWeight="bold">
                Informations Utilisateur
              </Typography>
            </Box>
            
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Box sx={{ '& > *': { mb: 2 } }}>
                  <Box>
                    <Typography variant="caption" color="text.secondary">Nom d'utilisateur</Typography>
                    <Typography variant="h6">{user?.username}</Typography>
                  </Box>
                  <Box>
                    <Typography variant="caption" color="text.secondary">Nom complet</Typography>
                    <Typography variant="h6">{user?.first_name} {user?.last_name}</Typography>
                  </Box>
                  <Box>
                    <Typography variant="caption" color="text.secondary">Email</Typography>
                    <Typography variant="body1">{user?.email}</Typography>
                  </Box>
                  <Box>
                    <Typography variant="caption" color="text.secondary">Rôle</Typography>
                    <Chip label={user?.role} color="primary" />
                  </Box>
                  <Box>
                    <Typography variant="caption" color="text.secondary">Téléphone</Typography>
                    <Typography variant="body1">{user?.phone || 'Non renseigné'}</Typography>
                  </Box>
                </Box>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      )}
    </Container>
  );
};

export default EmployeeProfile;
