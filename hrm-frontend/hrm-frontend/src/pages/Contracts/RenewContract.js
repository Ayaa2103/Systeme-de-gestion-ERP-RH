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
  Alert
} from '@mui/material';
import { ArrowBack as ArrowBackIcon } from '@mui/icons-material';
import { getContractDetail, renewContract } from '../../services/hrService';
import { format } from 'date-fns';

const RenewContract = () => {
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
    salaire: ''
  });

  useEffect(() => {
    fetchContract();
  }, [contractId]);

  const fetchContract = async () => {
    try {
      const response = await getContractDetail(contractId);
      const contractData = response.data;
      setContract(contractData);
      
      // Use contract end date as new start date, or today if no end date
      const startDate = contractData.date_fin || new Date().toISOString().split('T')[0];
      
      setFormData({
        type: contractData.type || 'CDI',
        date_debut: startDate,
        date_fin: '',
        salaire: contractData.salaire || ''
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

      await renewContract(contractId, formData);
      setSuccess('Contrat renouvelé avec succès!');
      setTimeout(() => {
        navigate('/contracts');
      }, 2000);
    } catch (error) {
      setError(error.response?.data?.error || 'Erreur lors du renouvellement');
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
          Renouveler le Contrat
        </Typography>
      </Box>

      {contract && (
        <>
          <Box sx={{ mb: 3, p: 2, bgcolor: '#f8f9fa', borderRadius: 1 }}>
            <Typography variant="h6">
              Renouveler le Contrat de {contract.employee_name}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Matricule: {contract.employee_matricule}
            </Typography>
          </Box>

          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>Contrat Actuel</Typography>
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Typography variant="body2">
                    <strong>Type:</strong> {contract.type}
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2">
                    <strong>Date fin:</strong> {contract.date_fin ? format(new Date(contract.date_fin), 'dd/MM/yyyy') : 'Indéterminée'}
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2">
                    <strong>Salaire:</strong> {contract.salaire ? `${contract.salaire} €` : 'Non défini'}
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2">
                    <strong>Statut:</strong> {contract.active ? 'Actif' : 'Inactif'}
                  </Typography>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </>
      )}

      {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}
      {success && <Alert severity="success" sx={{ mb: 3 }}>{success}</Alert>}

      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>Renouvellement Manuel</Typography>
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
                <Box sx={{ display: 'flex', gap: 2 }}>
                  <Button
                    type="submit"
                    variant="contained"
                    size="large"
                    color="success"
                  >
                    Renouveler le Contrat
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

export default RenewContract;