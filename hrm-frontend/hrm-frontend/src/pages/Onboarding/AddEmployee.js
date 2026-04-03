import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Alert,
  Avatar,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  ListItemSecondaryAction,
  IconButton
} from '@mui/material';
import {
  PersonAdd as PersonAddIcon,
  Add as AddIcon,
  Person as PersonIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';

const AddEmployee = () => {
  const navigate = useNavigate();
  const [employees, setEmployees] = useState([]);
  const [selectedEmployee, setSelectedEmployee] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState({ show: false, message: '', severity: 'success' });

  useEffect(() => {
    fetchAvailableEmployees();
  }, []);

  const fetchAvailableEmployees = async () => {
    try {
      const response = await api.get('/onboarding/employees/');
      setEmployees(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error('Erreur lors du chargement des employés:', error);
      setEmployees([]);
    }
  };

  const handleStartOnboarding = async () => {
    if (!selectedEmployee || !startDate || !endDate) {
      setAlert({ show: true, message: 'Veuillez remplir tous les champs', severity: 'error' });
      return;
    }

    setLoading(true);
    try {
      // Créer le plan d'intégration complet (checklist, tâches, formations, suivis)
      const response = await api.post('/onboarding/start/', {
        employee_id: selectedEmployee,
        start_date: startDate,
        expected_completion_date: endDate
      });

      setAlert({ 
        show: true, 
        message: 'Plan d\'intégration complet créé avec succès (checklist, tâches, formations, suivis)', 
        severity: 'success' 
      });
      
      // Rediriger vers le détail de l'employé après 2 secondes
      setTimeout(() => {
        navigate(`/onboarding/employee/${selectedEmployee}`);
      }, 2000);
    } catch (error) {
      const errorMessage = error.response?.data?.error || 'Erreur lors du démarrage de l\'intégration';
      setAlert({ show: true, message: errorMessage, severity: 'error' });
    }
    setLoading(false);
  };

  const selectedEmployeeData = employees.find(emp => emp.id === selectedEmployee);

  return (
    <Box>
      {alert.show && (
        <Alert 
          severity={alert.severity} 
          onClose={() => setAlert({ ...alert, show: false })}
          sx={{ mb: 2 }}
        >
          {alert.message}
        </Alert>
      )}

      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h4" fontWeight="bold" gutterBottom>
            Ajouter un Employé à l'Intégration
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Sélectionner un employé et démarrer son processus d'intégration
          </Typography>
        </Box>
      </Box>

      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Card elevation={0} sx={{ border: '1px solid #e0e0e0', borderRadius: 2 }}>
            <CardContent>
              <Typography variant="h6" fontWeight="600" gutterBottom>
                Informations d'Intégration
              </Typography>

              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <FormControl fullWidth>
                    <InputLabel>Sélectionner un Employé</InputLabel>
                    <Select
                      value={selectedEmployee}
                      onChange={(e) => setSelectedEmployee(e.target.value)}
                      label="Sélectionner un Employé"
                    >
                      {employees.map((employee) => (
                        <MenuItem key={employee.id} value={employee.id}>
                          {employee.user_data?.first_name} {employee.user_data?.last_name} - {employee.matricule}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>

                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    type="date"
                    label="Date de Début"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    InputLabelProps={{ shrink: true }}
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    type="date"
                    label="Date de Fin Prévue"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    InputLabelProps={{ shrink: true }}
                  />
                </Grid>

                <Grid item xs={12}>
                  <Button
                    variant="contained"
                    startIcon={<PersonAddIcon />}
                    onClick={handleStartOnboarding}
                    disabled={loading || !selectedEmployee || !startDate || !endDate}
                    fullWidth
                    sx={{ mt: 2 }}
                  >
                    {loading ? 'Démarrage...' : 'Démarrer l\'Intégration'}
                  </Button>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          {selectedEmployeeData && (
            <Card elevation={0} sx={{ border: '1px solid #e0e0e0', borderRadius: 2 }}>
              <CardContent>
                <Typography variant="h6" fontWeight="600" gutterBottom>
                  Aperçu de l'Employé
                </Typography>

                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Avatar
                    sx={{
                      mr: 2,
                      backgroundColor: '#1976d2',
                      width: 64,
                      height: 64
                    }}
                  >
                    {selectedEmployeeData.user_data?.first_name?.[0]}
                    {selectedEmployeeData.user_data?.last_name?.[0]}
                  </Avatar>
                  <Box>
                    <Typography variant="h6" fontWeight="600">
                      {selectedEmployeeData.user_data?.first_name} {selectedEmployeeData.user_data?.last_name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {selectedEmployeeData.poste}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Matricule: {selectedEmployeeData.matricule}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Email: {selectedEmployeeData.user_data?.email}
                    </Typography>
                  </Box>
                </Box>

                <Typography variant="body2" color="text.secondary">
                  Un plan d'intégration complet sera créé automatiquement incluant :
                </Typography>
                <List dense>
                  <ListItem>
                    <ListItemText primary="• Checklist d'intégration (12 étapes)" />
                  </ListItem>
                  <ListItem>
                    <ListItemText primary="• Tâches assignées (RH, IT, Manager, Employé)" />
                  </ListItem>
                  <ListItem>
                    <ListItemText primary="• Formations obligatoires (Sécurité, Qualité, Culture)" />
                  </ListItem>
                  <ListItem>
                    <ListItemText primary="• Points de suivi (Semaine 1, Mois 1, Mois 3)" />
                  </ListItem>
                  <ListItem>
                    <ListItemText primary="• Documents à signer" />
                  </ListItem>
                </List>
              </CardContent>
            </Card>
          )}
        </Grid>
      </Grid>
    </Box>
  );
};

export default AddEmployee;