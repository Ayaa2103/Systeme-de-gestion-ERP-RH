import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Avatar,
  Chip,
  Divider,
  Alert
} from '@mui/material';
import {
  Person as PersonIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  Badge as BadgeIcon,
  Work as WorkIcon,
  Business as BusinessIcon,
  CalendarToday as CalendarIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  Star as StarIcon,
  StarBorder as StarBorderIcon
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import { getEmployeeDetail, getEmployees } from '../services/hrService';

const Profile = () => {
  const { user } = useAuth();
  const [employee, setEmployee] = useState(null);
  const [contracts, setContracts] = useState([]);
  const [skills, setSkills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      if (user.role === 'employee') {
        // Pour les employés, récupérer leur profil
        const response = await getEmployeeDetail(user.employee_id);
        setEmployee(response.data);
        setSkills(response.data.skills || []);
      } else {
        // Pour les RH, essayer de récupérer leur profil employé s'il existe
        try {
          const employees = await getEmployees();
          const hrEmployee = employees.data.find(emp => emp.user?.id === user.id);
          if (hrEmployee) {
            const response = await getEmployeeDetail(hrEmployee.id);
            setEmployee(response.data);
            setSkills(response.data.skills || []);
          }
        } catch (e) {
          // Pas de profil employé pour cet utilisateur RH
          console.log('No employee profile found for HR user');
        }
      }
    } catch (error) {
      setError('Erreur lors du chargement du profil');
    } finally {
      setLoading(false);
    }
  };

  const renderStars = (level) => {
    return Array.from({ length: 5 }, (_, i) => (
      i < level ? 
        <StarIcon key={i} sx={{ color: '#ffc107', fontSize: 16 }} /> : 
        <StarBorderIcon key={i} sx={{ color: '#e0e0e0', fontSize: 16 }} />
    ));
  };

  const getLevelDisplay = (level) => {
    const levels = ['Non évalué', 'Débutant', 'Intermédiaire', 'Confirmé', 'Expert'];
    return levels[level] || 'Non évalué';
  };

  if (loading) return <Typography>Chargement...</Typography>;

  return (
    <Box>
      <Typography variant="h4" fontWeight="bold" gutterBottom>
        Mon Profil
      </Typography>

      {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

      {employee && (
        <Box sx={{ mb: 3 }}>
          <Chip
            icon={employee.is_absent_today ? <CancelIcon /> : <CheckCircleIcon />}
            label={employee.is_absent_today ? "🚫 Absent aujourd'hui" : "Présent"}
            color={employee.is_absent_today ? "error" : "success"}
            size="medium"
          />
        </Box>
      )}

      <Grid container spacing={3}>
        {/* Informations Personnelles */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Informations Personnelles
              </Typography>
              <Divider sx={{ mb: 2 }} />
              
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Avatar 
                  sx={{ mr: 2, bgcolor: 'primary.main', width: 56, height: 56 }}
                  src={employee?.photo ? `${process.env.REACT_APP_API_URL || 'http://localhost:8000'}${employee.photo}` : undefined}
                >
                  {!employee?.photo && <PersonIcon />}
                </Avatar>
                <Box>
                  <Typography variant="body1" fontWeight="600">
                    {user.first_name} {user.last_name}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Nom complet
                  </Typography>
                </Box>
              </Box>

              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <EmailIcon sx={{ mr: 2, color: 'text.secondary' }} />
                <Box>
                  <Typography variant="body1">{user.email}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Email
                  </Typography>
                </Box>
              </Box>

              {user.phone && (
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <PhoneIcon sx={{ mr: 2, color: 'text.secondary' }} />
                  <Box>
                    <Typography variant="body1">{user.phone}</Typography>
                    <Typography variant="body2" color="text.secondary">
                      Téléphone
                    </Typography>
                  </Box>
                </Box>
              )}

              {employee && (
                <>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <BadgeIcon sx={{ mr: 2, color: 'text.secondary' }} />
                    <Box>
                      <Typography variant="body1">{employee.matricule}</Typography>
                      <Typography variant="body2" color="text.secondary">
                        Matricule
                      </Typography>
                    </Box>
                  </Box>

                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <WorkIcon sx={{ mr: 2, color: 'text.secondary' }} />
                    <Box>
                      <Typography variant="body1">{employee.poste || 'Non renseigné'}</Typography>
                      <Typography variant="body2" color="text.secondary">
                        Poste
                      </Typography>
                    </Box>
                  </Box>

                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <BusinessIcon sx={{ mr: 2, color: 'text.secondary' }} />
                    <Box>
                      <Typography variant="body1">{employee.department_name || 'Non renseigné'}</Typography>
                      <Typography variant="body2" color="text.secondary">
                        Département
                      </Typography>
                    </Box>
                  </Box>

                  {employee.date_embauche && (
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <CalendarIcon sx={{ mr: 2, color: 'text.secondary' }} />
                      <Box>
                        <Typography variant="body1">
                          {new Date(employee.date_embauche).toLocaleDateString('fr-FR')}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Date d'embauche
                        </Typography>
                      </Box>
                    </Box>
                  )}

                  <Box sx={{ mt: 2 }}>
                    <Chip 
                      label={employee.statut} 
                      color={employee.statut === 'actif' ? 'success' : 'default'}
                      size="small"
                    />
                  </Box>
                </>
              )}

              {!employee && (
                <Box sx={{ mt: 2 }}>
                  <Typography variant="body2" color="text.secondary">
                    Rôle: {user.role === 'hr_manager' ? 'Responsable RH' : 
                           user.role === 'hr_director' ? 'Directeur RH' : 
                           user.role === 'administrator' ? 'Administrateur' : user.role}
                  </Typography>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Compétences */}
        {skills.length > 0 && (
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Mes Compétences
                </Typography>
                <Divider sx={{ mb: 2 }} />
                
                {skills.map((skill, index) => (
                  <Box key={index} sx={{ mb: 2, p: 2, border: '1px solid #e0e0e0', borderRadius: 1 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Box>
                        <Typography variant="body1" fontWeight="600">
                          {skill.skill_name}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {skill.skill_category}
                        </Typography>
                      </Box>
                      <Box sx={{ textAlign: 'right' }}>
                        <Box sx={{ mb: 0.5 }}>
                          {renderStars(skill.level)}
                        </Box>
                        <Typography variant="caption" color="text.secondary">
                          {getLevelDisplay(skill.level)}
                        </Typography>
                      </Box>
                    </Box>
                  </Box>
                ))}
              </CardContent>
            </Card>
          </Grid>
        )}

        {/* Informations utilisateur pour les RH sans profil employé */}
        {!employee && (
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Informations Utilisateur
                </Typography>
                <Divider sx={{ mb: 2 }} />
                
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  Vous êtes connecté en tant qu'utilisateur RH sans profil employé associé.
                </Typography>
                
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <PersonIcon sx={{ mr: 2, color: 'text.secondary' }} />
                  <Box>
                    <Typography variant="body1">{user.username}</Typography>
                    <Typography variant="body2" color="text.secondary">
                      Nom d'utilisateur
                    </Typography>
                  </Box>
                </Box>

                <Box sx={{ mt: 2 }}>
                  <Chip 
                    label={user.role === 'hr_manager' ? 'Responsable RH' : 
                           user.role === 'hr_director' ? 'Directeur RH' : 
                           user.role === 'administrator' ? 'Administrateur' : user.role}
                    color="primary"
                    size="small"
                  />
                </Box>
              </CardContent>
            </Card>
          </Grid>
        )}
      </Grid>
    </Box>
  );
};

export default Profile;