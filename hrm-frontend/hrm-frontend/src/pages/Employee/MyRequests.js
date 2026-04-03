import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box, Card, CardContent, Typography, Button, Grid,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Chip, Alert, CircularProgress, Fab
} from '@mui/material';
import { Add as AddIcon, ArrowBack } from '@mui/icons-material';
import { getMyRequests } from '../../services/employeeService';

const MyRequests = () => {
  const navigate = useNavigate();
  const [requests, setRequests] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      const response = await getMyRequests();
      setRequests(response.data);
    } catch (error) {
      setError('Erreur lors du chargement des demandes');
      console.error('Requests fetch error:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'approved': return 'success';
      case 'rejected': return 'error';
      default: return 'warning';
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case 'pending': return 'En attente';
      case 'approved': return 'Approuvée';
      case 'rejected': return 'Rejetée';
      default: return status;
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <Button
          startIcon={<ArrowBack />}
          onClick={() => navigate('/employee/dashboard')}
          sx={{ mr: 2 }}
        >
          Retour
        </Button>
        <Typography variant="h4" fontWeight="bold">
          Mes Demandes
        </Typography>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

      {/* Quick Actions */}
      <Grid container spacing={2} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Button
            variant="contained"
            fullWidth
            onClick={() => navigate('/employee/requests/create-leave')}
          >
            Demande de Congé
          </Button>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Button
            variant="contained"
            fullWidth
            onClick={() => navigate('/employee/requests/create-attestation')}
          >
            Demande d'Attestation
          </Button>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Button
            variant="contained"
            fullWidth
            onClick={() => navigate('/employee/requests/create-mission')}
          >
            Demande de Mission
          </Button>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Button
            variant="contained"
            fullWidth
            onClick={() => navigate('/employee/requests/create-payslip')}
          >
            Demande de Bulletin
          </Button>
        </Grid>
      </Grid>

      {requests && (
        <>
          {/* Leave Requests */}
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>Demandes de Congé</Typography>
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Date Début</TableCell>
                      <TableCell>Date Fin</TableCell>
                      <TableCell>Type</TableCell>
                      <TableCell>Statut</TableCell>
                      <TableCell>Créée le</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {requests.leave_requests?.length > 0 ? (
                      requests.leave_requests.map((request) => (
                        <TableRow key={request.id}>
                          <TableCell>{new Date(request.start_date).toLocaleDateString('fr-FR')}</TableCell>
                          <TableCell>{new Date(request.end_date).toLocaleDateString('fr-FR')}</TableCell>
                          <TableCell>{request.leave_type}</TableCell>
                          <TableCell>
                            <Chip 
                              label={getStatusLabel(request.status)} 
                              color={getStatusColor(request.status)}
                              size="small"
                            />
                          </TableCell>
                          <TableCell>{new Date(request.created_at).toLocaleDateString('fr-FR')}</TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={5} align="center">Aucune demande de congé</TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>

          {/* Attestation Requests */}
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>Demandes d'Attestation</Typography>
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Objectif</TableCell>
                      <TableCell>Type</TableCell>
                      <TableCell>Statut</TableCell>
                      <TableCell>Créée le</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {requests.attestation_requests?.length > 0 ? (
                      requests.attestation_requests.map((request) => (
                        <TableRow key={request.id}>
                          <TableCell>{request.purpose}</TableCell>
                          <TableCell>{request.attestation_type}</TableCell>
                          <TableCell>
                            <Chip 
                              label={getStatusLabel(request.status)} 
                              color={getStatusColor(request.status)}
                              size="small"
                            />
                          </TableCell>
                          <TableCell>{new Date(request.created_at).toLocaleDateString('fr-FR')}</TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={4} align="center">Aucune demande d'attestation</TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>

          {/* Mission Requests */}
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>Demandes de Mission</Typography>
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Destination</TableCell>
                      <TableCell>Date Début</TableCell>
                      <TableCell>Date Fin</TableCell>
                      <TableCell>Statut</TableCell>
                      <TableCell>Créée le</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {requests.mission_requests?.length > 0 ? (
                      requests.mission_requests.map((request) => (
                        <TableRow key={request.id}>
                          <TableCell>{request.destination}</TableCell>
                          <TableCell>{new Date(request.start_date).toLocaleDateString('fr-FR')}</TableCell>
                          <TableCell>{new Date(request.end_date).toLocaleDateString('fr-FR')}</TableCell>
                          <TableCell>
                            <Chip 
                              label={getStatusLabel(request.status)} 
                              color={getStatusColor(request.status)}
                              size="small"
                            />
                          </TableCell>
                          <TableCell>{new Date(request.created_at).toLocaleDateString('fr-FR')}</TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={5} align="center">Aucune demande de mission</TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>

          {/* Payslip Requests */}
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>Demandes de Bulletin de Paie</Typography>
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Période</TableCell>
                      <TableCell>Statut</TableCell>
                      <TableCell>Créée le</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {requests.payslip_requests?.length > 0 ? (
                      requests.payslip_requests.map((request) => (
                        <TableRow key={request.id}>
                          <TableCell>{request.periode_mois}</TableCell>
                          <TableCell>
                            <Chip 
                              label={getStatusLabel(request.status)} 
                              color={getStatusColor(request.status)}
                              size="small"
                            />
                          </TableCell>
                          <TableCell>{new Date(request.created_at).toLocaleDateString('fr-FR')}</TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={3} align="center">Aucune demande de bulletin</TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        </>
      )}
    </Box>
  );
};

export default MyRequests;