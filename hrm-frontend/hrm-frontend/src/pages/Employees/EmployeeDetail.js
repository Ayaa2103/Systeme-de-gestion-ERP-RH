import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Avatar,
  Grid,
  Chip,
  Button,
  Tabs,
  Tab,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
  LinearProgress,
  IconButton
} from '@mui/material';
import {
  Person as PersonIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  Work as WorkIcon,
  CalendarToday as CalendarIcon,
  Assignment as ContractIcon,
  School as TrainingIcon,
  Edit as EditIcon,
  ArrowBack as ArrowBackIcon,
  Badge as BadgeIcon,
  Business as BusinessIcon
} from '@mui/icons-material';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { getEmployeeDetail, getEmployeeContracts, getEmployeeTrainings } from '../../services/hrService';

const EmployeeDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [employee, setEmployee] = useState(null);
  const [contracts, setContracts] = useState([]);

  const [skills, setSkills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tabValue, setTabValue] = useState(0);

  useEffect(() => {
    fetchEmployeeData();
  }, [id]);

  const fetchEmployeeData = async () => {
    try {
      const [empRes, contractsRes] = await Promise.all([
        getEmployeeDetail(id),
        getEmployeeContracts(id)
      ]);
      
      setEmployee(empRes.data);
      setContracts(contractsRes.data);
    } catch (error) {
      console.error('Erreur lors du chargement:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'actif': return 'success';
      case 'inactif': return 'error';
      case 'congé': return 'warning';
      default: return 'default';
    }
  };

  const getContractTypeColor = (type) => {
    switch (type) {
      case 'CDI': return 'success';
      case 'CDD': return 'warning';
      case 'Stage': return 'info';
      default: return 'default';
    }
  };

  if (loading) {
    return (
      <Box sx={{ p: 3 }}>
        <LinearProgress />
        <Typography sx={{ mt: 2 }}>Chargement...</Typography>
      </Box>
    );
  }

  if (!employee) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography>Employé non trouvé</Typography>
      </Box>
    );
  }

  return (
    <Box>
      {/* En-tête */}
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <IconButton onClick={() => navigate('/employees')} sx={{ mr: 2 }}>
          <ArrowBackIcon />
        </IconButton>
        <Typography variant="h4" fontWeight="bold">
          Profil Employé
        </Typography>
      </Box>

      {/* Carte profil principal */}
      <Card elevation={0} sx={{ mb: 3, border: '1px solid #e0e0e0', borderRadius: 2 }}>
        <CardContent>
          <Grid container spacing={3}>
            <Grid item xs={12} md={4}>
              <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
                <Avatar
                  sx={{
                    width: 120,
                    height: 120,
                    mb: 2,
                    backgroundColor: '#1976d2',
                    fontSize: '2rem'
                  }}
                  src={employee.photo}
                >
                  {employee.user?.first_name?.[0]}{employee.user?.last_name?.[0]}
                </Avatar>
                <Typography variant="h5" fontWeight="bold" gutterBottom>
                  {employee.user?.first_name} {employee.user?.last_name}
                </Typography>
                <Typography variant="body1" color="text.secondary" gutterBottom>
                  {employee.poste}
                </Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, mb: 2 }}>
                  <Chip
                    label={employee.statut}
                    color={getStatusColor(employee.statut)}
                  />
                  <Chip 
                    label={employee.is_absent_today ? 'Absent aujourd\'hui' : 'Présent'}
                    color={employee.is_absent_today ? 'error' : 'success'}
                    size="small"
                  />
                </Box>
                <Button
                  variant="outlined"
                  startIcon={<EditIcon />}
                  onClick={() => navigate(`/employees/edit/${id}`)}
                >
                  Modifier
                </Button>
              </Box>
            </Grid>

            <Grid item xs={12} md={8}>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <BadgeIcon sx={{ mr: 2, color: 'text.secondary' }} />
                    <Box>
                      <Typography variant="body2" color="text.secondary">
                        Matricule
                      </Typography>
                      <Typography variant="body1" fontWeight="500">
                        {employee.matricule}
                      </Typography>
                    </Box>
                  </Box>
                </Grid>

                <Grid item xs={12} sm={6}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <EmailIcon sx={{ mr: 2, color: 'text.secondary' }} />
                    <Box>
                      <Typography variant="body2" color="text.secondary">
                        Email
                      </Typography>
                      <Typography variant="body1" fontWeight="500">
                        {employee.user?.email}
                      </Typography>
                    </Box>
                  </Box>
                </Grid>

                <Grid item xs={12} sm={6}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <PhoneIcon sx={{ mr: 2, color: 'text.secondary' }} />
                    <Box>
                      <Typography variant="body2" color="text.secondary">
                        Téléphone
                      </Typography>
                      <Typography variant="body1" fontWeight="500">
                        {employee.user?.phone || 'Non renseigné'}
                      </Typography>
                    </Box>
                  </Box>
                </Grid>

                <Grid item xs={12} sm={6}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <BusinessIcon sx={{ mr: 2, color: 'text.secondary' }} />
                    <Box>
                      <Typography variant="body2" color="text.secondary">
                        Département
                      </Typography>
                      <Typography variant="body1" fontWeight="500">
                        {employee.department_name || 'Non assigné'}
                      </Typography>
                    </Box>
                  </Box>
                </Grid>

                <Grid item xs={12} sm={6}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <CalendarIcon sx={{ mr: 2, color: 'text.secondary' }} />
                    <Box>
                      <Typography variant="body2" color="text.secondary">
                        Date d'embauche
                      </Typography>
                      <Typography variant="body1" fontWeight="500">
                        {employee.date_embauche && employee.date_embauche !== 'null' ? 
                          format(new Date(employee.date_embauche), 'dd MMMM yyyy', { locale: fr }) :
                          'Non renseignée'
                        }
                      </Typography>
                    </Box>
                  </Box>
                </Grid>

                <Grid item xs={12} sm={6}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <WorkIcon sx={{ mr: 2, color: 'text.secondary' }} />
                    <Box>
                      <Typography variant="body2" color="text.secondary">
                        Poste
                      </Typography>
                      <Typography variant="body1" fontWeight="500">
                        {employee.poste || 'Non renseigné'}
                      </Typography>
                    </Box>
                  </Box>
                </Grid>

                <Grid item xs={12} sm={6}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <WorkIcon sx={{ mr: 2, color: 'text.secondary' }} />
                    <Box>
                      <Typography variant="body2" color="text.secondary">
                        Service
                      </Typography>
                      <Typography variant="body1" fontWeight="500">
                        {employee.service || 'Non renseigné'}
                      </Typography>
                    </Box>
                  </Box>
                </Grid>
              </Grid>

              {/* Progression onboarding */}
              {employee.onboarding_status !== 'completed' && (
                <Box sx={{ mt: 3, p: 2, backgroundColor: '#f8fafc', borderRadius: 2 }}>
                  <Typography variant="body2" fontWeight="600" gutterBottom>
                    Progression Intégration
                  </Typography>
                  <LinearProgress
                    variant="determinate"
                    value={employee.onboarding_progress || 0}
                    sx={{ mb: 1, height: 8, borderRadius: 4 }}
                  />
                  <Typography variant="caption" color="text.secondary">
                    {employee.onboarding_progress || 0}% complété
                  </Typography>
                </Box>
              )}
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Onglets détails */}
      <Card elevation={0} sx={{ border: '1px solid #e0e0e0', borderRadius: 2 }}>
        <Tabs
          value={tabValue}
          onChange={(e, newValue) => setTabValue(newValue)}
          sx={{ borderBottom: '1px solid #e0e0e0' }}
        >
          <Tab label="Contrats" />
          <Tab label="Compétences" />
        </Tabs>

        <CardContent>
          {/* Onglet Contrats */}
          {tabValue === 0 && (
            <Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6" fontWeight="600">
                  Contrats ({contracts.length})
                </Typography>
                <Button
                  variant="contained"
                  size="small"
                  onClick={() => navigate(`/employees/${id}/create-contract`)}
                >
                  Nouveau Contrat
                </Button>
              </Box>
              
              {contracts.length === 0 ? (
                <Typography color="text.secondary">Aucun contrat trouvé</Typography>
              ) : (
                <List>
                  {contracts.map((contract, index) => (
                    <React.Fragment key={contract.id}>
                      <ListItem sx={{ px: 0 }}>
                        <ListItemIcon>
                          <ContractIcon color="primary" />
                        </ListItemIcon>
                        <ListItemText
                          primary={
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <Typography variant="body1" fontWeight="500">
                                {contract.type}
                              </Typography>
                              <Chip
                                label={contract.active ? 'Actif' : 'Inactif'}
                                color={contract.active ? 'success' : 'default'}
                                size="small"
                              />
                              {contract.is_expiring_soon && (
                                <Chip label="Expire bientôt" color="warning" size="small" />
                              )}
                            </Box>
                          }
                          secondary={
                            <Box>
                              <Typography variant="body2" color="text.secondary">
                                Du {contract.date_debut ? format(new Date(contract.date_debut), 'dd/MM/yyyy') : 'Date inconnue'}
                                {contract.date_fin && contract.date_fin !== 'null' && ` au ${format(new Date(contract.date_fin), 'dd/MM/yyyy')}`}
                              </Typography>
                              {contract.salaire && (
                                <Typography variant="body2" color="text.secondary">
                                  Salaire: {contract.salaire}€
                                </Typography>
                              )}
                            </Box>
                          }
                        />
                      </ListItem>
                      {index < contracts.length - 1 && <Divider />}
                    </React.Fragment>
                  ))}
                </List>
              )}
            </Box>
          )}



          {/* Onglet Compétences */}
          {tabValue === 1 && (
            <Box>
              <Typography variant="h6" fontWeight="600" gutterBottom>
                Compétences ({employee.skills?.length || 0})
              </Typography>
              
              {employee.skills && employee.skills.length > 0 ? (
                <List>
                  {employee.skills.map((skill, index) => (
                    <React.Fragment key={skill.id}>
                      <ListItem sx={{ px: 0 }}>
                        <ListItemText
                          primary={
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <Typography variant="body1" fontWeight="500">
                                {skill.skill_name}
                              </Typography>
                              <Chip
                                label={skill.skill_category}
                                size="small"
                                variant="outlined"
                              />
                            </Box>
                          }
                          secondary={
                            <Box sx={{ mt: 1 }}>
                              <Typography variant="body2" color="text.secondary" gutterBottom>
                                Niveau: {skill.level_display || skill.level}/4
                              </Typography>
                              <LinearProgress
                                variant="determinate"
                                value={(skill.level / 4) * 100}
                                sx={{ height: 6, borderRadius: 3, mb: 1 }}
                              />
                              {skill.certified && (
                                <Chip 
                                  label="Certifié" 
                                  size="small" 
                                  color="success" 
                                  sx={{ mt: 0.5 }}
                                />
                              )}
                            </Box>
                          }
                        />
                      </ListItem>
                      {index < employee.skills.length - 1 && <Divider />}
                    </React.Fragment>
                  ))}
                </List>
              ) : (
                <Typography color="text.secondary">
                  Aucune compétence évaluée
                </Typography>
              )}
              

            </Box>
          )}
        </CardContent>
      </Card>
    </Box>
  );
};

export default EmployeeDetail;