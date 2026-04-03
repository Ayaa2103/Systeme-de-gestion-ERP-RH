import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
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
  Alert,
  Checkbox,
  FormControlLabel
} from '@mui/material';
import { ArrowBack as ArrowBackIcon } from '@mui/icons-material';
import { getContractDetail, updateContract } from '../../services/hrService';

const EditContract = () => {
  const { contractId } = useParams();
  const navigate = useNavigate();
  const [contract, setContract] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [formData, setFormData] = useState({
    type: 'CDI',
    date_debut: '',
    date_fin: '',
    salaire: '',
    active: true
  });

  useEffect(() => {
    fetchContract();
  }, [contractId]);

  const fetchContract = async () => {
    try {
      const response = await getContractDetail(contractId);
      const contractData = response.data;
      setContract(contractData);
      setFormData({
        type: contractData.type || 'CDI',
        date_debut: contractData.date_debut || '',
        date_fin: contractData.date_fin || '',
        salaire: contractData.salaire || '',
        active: contractData.active !== false
      });
    } catch (error) {
      setError('Erreur lors du chargement du contrat');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setError('');
      
      if (!formData.type || !formData.date_debut) {
        setError('Type et date de début sont obligatoires');
        return;
      }

      await updateContract(contractId, formData);
      setSuccess('Contrat modifié avec succès!');
      setTimeout(() => {
        navigate('/contracts');
      }, 2000);
    } catch (error) {
      setError(error.response?.data?.error || 'Erreur lors de la modification');
    }
  };

  if (loading) return <Typography>Chargement...</Typography>;

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate('/contracts')}
          sx={{ mr: 2 }}
        >
          Retour
        </Button>
        <Typography variant="h4" fontWeight="bold">
          Modifier le Contrat
        </Typography>
      </Box>

      {contract && (
        <Box sx={{ mb: 3, p: 2, bgcolor: '#f8f9fa', borderRadius: 1 }}>
          <Typography variant="h6">Employé: {contract.employee_name}</Typography>
          <Typography variant="body2" color="text.secondary">
            Matricule: {contract.employee_matricule}
          </Typography>
        </Box>
      )}

      {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}
      {success && <Alert severity="success" sx={{ mb: 3 }}>{success}</Alert>}

      <Card>
        <CardContent>
          <form onSubmit={handleSubmit}>
            <Grid container spacing={3}>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>Type de contrat</InputLabel>
                  <Select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                    label="Type de contrat"
                    required
                  >
                    <MenuItem value="CDI">CDI</MenuItem>
                    <MenuItem value="CDD">CDD</MenuItem>
                    <MenuItem value="Stage">Stage</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Salaire (€)"
                  type="number"
                  step="0.01"
                  value={formData.salaire}
                  onChange={(e) => setFormData({ ...formData, salaire: e.target.value })}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Date de début"
                  type="date"
                  InputLabelProps={{ shrink: true }}
                  value={formData.date_debut}
                  onChange={(e) => setFormData({ ...formData, date_debut: e.target.value })}
                  required
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Date de fin"
                  type="date"
                  InputLabelProps={{ shrink: true }}
                  value={formData.date_fin}
                  onChange={(e) => setFormData({ ...formData, date_fin: e.target.value })}
                />
              </Grid>

              <Grid item xs={12}>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={formData.active}
                      onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
                    />
                  }
                  label="Contrat actif"
                />
              </Grid>

              <Grid item xs={12}>
                <Box sx={{ display: 'flex', gap: 2 }}>
                  <Button
                    type="submit"
                    variant="contained"
                    size="large"
                  >
                    Sauvegarder
                  </Button>
                  <Button
                    variant="outlined"
                    size="large"
                    onClick={() => navigate('/contracts')}
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

export default EditContract;