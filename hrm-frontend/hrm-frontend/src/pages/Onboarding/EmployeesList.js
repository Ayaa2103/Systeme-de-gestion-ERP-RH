import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Grid,
  Avatar,
  LinearProgress,
  Chip,
  IconButton,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  InputAdornment
} from '@mui/material';
import {
  PersonAdd as PersonAddIcon,
  Visibility as ViewIcon,
  Search as SearchIcon,
  FilterList as FilterIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';

const EmployeesList = () => {
  const navigate = useNavigate();
  const [employees, setEmployees] = useState([]);
  const [filteredEmployees, setFilteredEmployees] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchEmployees();
  }, []);

  useEffect(() => {
    filterEmployees();
  }, [employees, searchTerm, statusFilter]);

  const fetchEmployees = async () => {
    try {
      const response = await api.get('/onboarding/employees-list/');
      setEmployees(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error('Erreur lors du chargement des employés:', error);
      setEmployees([]);
    }
    setLoading(false);
  };

  const filterEmployees = () => {
    let filtered = employees;

    // Filtrer par terme de recherche
    if (searchTerm) {
      filtered = filtered.filter(emp => 
        `${emp.user_data?.first_name} ${emp.user_data?.last_name}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
        emp.matricule.toLowerCase().includes(searchTerm.toLowerCase()) ||
        emp.poste.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filtrer par statut
    if (statusFilter !== 'all') {
      filtered = filtered.filter(emp => emp.onboarding_status === statusFilter);
    }

    setFilteredEmployees(filtered);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'success';
      case 'in_progress': return 'primary';
      case 'not_started': return 'warning';
      default: return 'default';
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case 'completed': return 'Terminé';
      case 'in_progress': return 'En cours';
      case 'not_started': return 'Non démarré';
      default: return 'Inconnu';
    }
  };

  const getProgressColor = (progress) => {
    if (progress >= 80) return '#2e7d32';
    if (progress >= 50) return '#1976d2';
    if (progress > 0) return '#ed6c02';
    return '#d32f2f';
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h4" fontWeight="bold" gutterBottom>
            Employés en Intégration
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Liste de tous les employés dans le processus d'intégration
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<PersonAddIcon />}
          onClick={() => navigate('/onboarding/add-employee')}
          sx={{ borderRadius: 2 }}
        >
          Ajouter Employé
        </Button>
      </Box>

      {/* Filtres */}
      <Card elevation={0} sx={{ border: '1px solid #e0e0e0', borderRadius: 2, mb: 3 }}>
        <CardContent>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                placeholder="Rechercher par nom, matricule ou poste..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            <Grid item xs={12} md={3}>
              <FormControl fullWidth>
                <InputLabel>Filtrer par statut</InputLabel>
                <Select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  label="Filtrer par statut"
                >
                  <MenuItem value="all">Tous</MenuItem>
                  <MenuItem value="not_started">Non démarré</MenuItem>
                  <MenuItem value="in_progress">En cours</MenuItem>
                  <MenuItem value="completed">Terminé</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={5}>
              <Typography variant="body2" color="text.secondary">
                {filteredEmployees.length} employé(s) trouvé(s) sur {employees.length} total
              </Typography>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Liste des employés */}
      {loading ? (
        <Box sx={{ textAlign: 'center', py: 4 }}>
          <Typography>Chargement...</Typography>
        </Box>
      ) : filteredEmployees.length === 0 ? (
        <Card elevation={0} sx={{ border: '1px solid #e0e0e0', borderRadius: 2 }}>
          <CardContent sx={{ textAlign: 'center', py: 4 }}>
            <Typography variant="h6" color="text.secondary" gutterBottom>
              Aucun employé trouvé
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {employees.length === 0 ? 
                'Aucun employé en intégration pour le moment.' : 
                'Aucun employé ne correspond aux critères de recherche.'
              }
            </Typography>
            {employees.length === 0 && (
              <Button
                variant="outlined"
                startIcon={<PersonAddIcon />}
                onClick={() => navigate('/onboarding/add-employee')}
                sx={{ mt: 2 }}
              >
                Ajouter le Premier Employé
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <Grid container spacing={3}>
          {filteredEmployees.map((employee) => (
            <Grid item xs={12} key={employee.id}>
              <Card 
                elevation={0} 
                sx={{ 
                  border: '1px solid #e0e0e0', 
                  borderRadius: 2,
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                    transform: 'translateY(-2px)',
                  }
                }}
              >
                <CardContent>
                  <Grid container spacing={3} alignItems="center">
                    <Grid item xs={12} md={4}>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Avatar
                          src={employee.photo ? `http://localhost:8000${employee.photo}` : null}
                          sx={{
                            mr: 2,
                            backgroundColor: '#1976d2',
                            width: 56,
                            height: 56
                          }}
                        >
                          {!employee.photo && (
                            `${employee.user_data?.first_name?.[0] || ''}${employee.user_data?.last_name?.[0] || ''}`
                          )}
                        </Avatar>
                        <Box>
                          <Typography variant="h6" fontWeight="600">
                            {employee.user_data?.first_name} {employee.user_data?.last_name}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {employee.poste} • {employee.matricule}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {employee.user_data?.email}
                          </Typography>
                        </Box>
                      </Box>
                    </Grid>

                    <Grid item xs={12} md={3}>
                      <Box sx={{ textAlign: 'center' }}>
                        <Typography variant="h4" fontWeight="bold" color={getProgressColor(employee.onboarding_progress || 0)}>
                          {employee.onboarding_progress || 0}%
                        </Typography>
                        <Typography variant="body2" color="text.secondary" gutterBottom>
                          Progression
                        </Typography>
                        <LinearProgress
                          variant="determinate"
                          value={employee.onboarding_progress || 0}
                          sx={{
                            height: 6,
                            borderRadius: 3,
                            backgroundColor: '#e0e0e0',
                            '& .MuiLinearProgress-bar': {
                              backgroundColor: getProgressColor(employee.onboarding_progress || 0),
                            }
                          }}
                        />
                      </Box>
                    </Grid>

                    <Grid item xs={12} md={3}>
                      <Box sx={{ textAlign: 'center' }}>
                        <Chip 
                          label={getStatusLabel(employee.onboarding_status)}
                          color={getStatusColor(employee.onboarding_status)}
                          sx={{ mb: 1 }}
                        />
                        <Typography variant="body2" color="text.secondary">
                          Embauché le: {new Date(employee.date_embauche).toLocaleDateString()}
                        </Typography>
                      </Box>
                    </Grid>

                    <Grid item xs={12} md={2}>
                      <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                        <IconButton
                          onClick={() => navigate(`/onboarding/employee/${employee.id}`)}
                          sx={{ 
                            backgroundColor: '#f5f5f5',
                            '&:hover': { backgroundColor: '#e0e0e0' }
                          }}
                        >
                          <ViewIcon />
                        </IconButton>
                      </Box>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
    </Box>
  );
};

export default EmployeesList;