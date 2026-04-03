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
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Chip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Assignment as PlanIcon,
  Schedule as ScheduleIcon
} from '@mui/icons-material';
import api from '../../services/api';

const OnboardingPlans = () => {
  const [plans, setPlans] = useState([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState(null);
  const [formData, setFormData] = useState({
    employee: '',
    start_date: '',
    expected_completion_date: '',
    status: 'draft',
    notes: ''
  });
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState({ show: false, message: '', severity: 'success' });

  useEffect(() => {
    fetchPlans();
  }, []);

  const fetchPlans = async () => {
    try {
      const response = await api.get('/onboarding/plans/');
      setPlans(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error('Erreur lors du chargement des plans:', error);
      setPlans([]);
    }
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      if (editingPlan) {
        await api.put(`/onboarding/plans/${editingPlan.id}/`, formData);
        setAlert({ show: true, message: 'Plan modifié avec succès', severity: 'success' });
      } else {
        await api.post('/onboarding/plans/', formData);
        setAlert({ show: true, message: 'Plan créé avec succès', severity: 'success' });
      }
      fetchPlans();
      handleCloseDialog();
    } catch (error) {
      setAlert({ show: true, message: 'Erreur lors de l\'opération', severity: 'error' });
    }
    setLoading(false);
  };

  const handleEdit = (plan) => {
    setEditingPlan(plan);
    setFormData({
      employee: plan.employee,
      start_date: plan.start_date,
      expected_completion_date: plan.expected_completion_date,
      status: plan.status,
      notes: plan.notes
    });
    setDialogOpen(true);
  };

  const handleDelete = async (planId) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer ce plan ?')) {
      try {
        await api.delete(`/onboarding/plans/${planId}/`);
        setAlert({ show: true, message: 'Plan supprimé avec succès', severity: 'success' });
        fetchPlans();
      } catch (error) {
        setAlert({ show: true, message: 'Erreur lors de la suppression', severity: 'error' });
      }
    }
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setEditingPlan(null);
    setFormData({
      employee: '',
      start_date: '',
      expected_completion_date: '',
      status: 'draft',
      notes: ''
    });
  };

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
            Plans d'Intégration
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Gérer les plans d'intégration pour les nouveaux employés
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setDialogOpen(true)}
          sx={{ borderRadius: 2 }}
        >
          Nouveau Plan
        </Button>
      </Box>

      <Grid container spacing={3}>
        {Array.isArray(plans) && plans.map((plan) => (
          <Grid item xs={12} md={6} lg={4} key={plan.id}>
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
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <PlanIcon sx={{ mr: 1, color: '#1976d2' }} />
                  <Typography variant="h6" fontWeight="600">
                    Plan - {plan.employee_name}
                  </Typography>
                </Box>

                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  {plan.notes || 'Aucune note'}
                </Typography>

                <Box sx={{ display: 'flex', gap: 1, mb: 2, flexWrap: 'wrap' }}>
                  <Chip 
                    label={plan.status === 'draft' ? 'Brouillon' : plan.status === 'active' ? 'Actif' : plan.status === 'completed' ? 'Terminé' : 'Annulé'} 
                    size="small" 
                    color={plan.status === 'active' ? 'primary' : plan.status === 'completed' ? 'success' : 'default'}
                  />
                  <Chip 
                    label={`Début: ${new Date(plan.start_date).toLocaleDateString()}`} 
                    size="small" 
                    variant="outlined"
                  />
                  <Chip 
                    label={`Fin prévue: ${new Date(plan.expected_completion_date).toLocaleDateString()}`} 
                    size="small" 
                    variant="outlined"
                  />
                </Box>

                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  Créé par: {plan.created_by_name}
                </Typography>

                <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
                  <IconButton 
                    size="small" 
                    onClick={() => handleEdit(plan)}
                    sx={{ color: '#1976d2' }}
                  >
                    <EditIcon />
                  </IconButton>
                  <IconButton 
                    size="small" 
                    onClick={() => handleDelete(plan.id)}
                    sx={{ color: '#d32f2f' }}
                  >
                    <DeleteIcon />
                  </IconButton>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        )) || (
          <Grid item xs={12}>
            <Typography variant="body1" color="text.secondary" textAlign="center">
              Aucun plan d'intégration trouvé
            </Typography>
          </Grid>
        )}
      </Grid>

      <Dialog open={dialogOpen} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>
          {editingPlan ? 'Modifier le Plan' : 'Nouveau Plan d\'Intégration'}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                type="number"
                label="ID Employé"
                value={formData.employee}
                onChange={(e) => setFormData({ ...formData, employee: e.target.value })}
                helperText="ID de l'employé pour ce plan d'intégration"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                type="date"
                label="Date de début"
                value={formData.start_date}
                onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                type="date"
                label="Date de fin prévue"
                value={formData.expected_completion_date}
                onChange={(e) => setFormData({ ...formData, expected_completion_date: e.target.value })}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>Statut</InputLabel>
                <Select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  label="Statut"
                >
                  <MenuItem value="draft">Brouillon</MenuItem>
                  <MenuItem value="active">Actif</MenuItem>
                  <MenuItem value="completed">Terminé</MenuItem>
                  <MenuItem value="cancelled">Annulé</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                rows={3}
                label="Notes"
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Annuler</Button>
          <Button 
            onClick={handleSubmit} 
            variant="contained"
            disabled={loading}
          >
            {editingPlan ? 'Modifier' : 'Créer'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default OnboardingPlans;