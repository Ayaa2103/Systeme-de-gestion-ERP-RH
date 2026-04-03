import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Tabs,
  Tab,
  Chip,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  IconButton,
  Badge,
  Grid
} from '@mui/material';
import {
  Assignment as AssignmentIcon,
  CheckCircle as CheckIcon,
  Cancel as CancelIcon,
  Schedule as ScheduleIcon,
  Person as PersonIcon,
  CalendarToday as CalendarIcon,
  Description as DescriptionIcon
} from '@mui/icons-material';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { getPendingRequests, approveRequest, rejectRequest } from '../../services/hrService';

const ManageRequests = () => {
  const [tabValue, setTabValue] = useState(0);
  const [requests, setRequests] = useState({
    leave: [],
    attestation: [],
    mission: [],
    payslip: []
  });
  const [loading, setLoading] = useState(true);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [actionType, setActionType] = useState('');
  const [comment, setComment] = useState('');

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      const response = await getPendingRequests();
      setRequests({
        leave: response.data.leave_requests || [],
        attestation: response.data.attestation_requests || [],
        mission: response.data.mission_requests || [],
        payslip: response.data.payslip_requests || []
      });
    } catch (error) {
      console.error('Erreur lors du chargement des demandes:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDirectAction = async (request, action) => {
    if (!request) {
      console.error('No request provided');
      alert('Aucune demande sélectionnée');
      return;
    }

    try {
      console.log('=== DIRECT ACTION DEBUG ===');
      console.log('Full request object:', JSON.stringify(request, null, 2));
      console.log('Action type:', action);
      console.log('Request type:', request.type);
      console.log('Request ID:', request.id);
      console.log('Request ID type:', typeof request.id);
      
      if (!request.type || !request.id) {
        console.error('Missing data:', { type: request.type, id: request.id });
        alert(`Données manquantes: type=${request.type}, id=${request.id}`);
        return;
      }
      
      const url = `/requests/${request.type}/${request.id}/${action}/`;
      console.log('Generated URL:', url);
      console.log('Full API URL will be:', `http://localhost:8000/api/v1${url}`);
      
      let response;
      if (action === 'approve') {
        console.log('Calling approveRequest with:', { type: request.type, id: request.id, comment: '' });
        response = await approveRequest(request.type, request.id, '');
        console.log('Approve response:', response);
        alert('Demande approuvée avec succès!');
      } else {
        console.log('Calling rejectRequest with:', { type: request.type, id: request.id, comment: '' });
        response = await rejectRequest(request.type, request.id, '');
        console.log('Reject response:', response);
        alert('Demande rejetée avec succès!');
      }

      await fetchRequests();
    } catch (error) {
      console.error('=== ERROR DEBUG ===');
      console.error('Full error object:', error);
      console.error('Error response:', error.response);
      console.error('Error response data:', error.response?.data);
      console.error('Error response status:', error.response?.status);
      console.error('Error response headers:', error.response?.headers);
      console.error('Error message:', error.message);
      console.error('Error config:', error.config);
      
      const errorMsg = error.response?.data?.error || error.response?.data?.detail || error.message || 'Erreur inconnue';
      alert(`Erreur: ${errorMsg}`);
    }
  };

  const handleAction = async () => {
    if (!selectedRequest) {
      alert('Aucune demande sélectionnée');
      return;
    }

    try {
      console.log('Processing request:', selectedRequest);
      console.log('Action type:', actionType);
      console.log('Request type:', selectedRequest.type);
      console.log('Request ID:', selectedRequest.id);
      console.log('Comment:', comment);
      
      if (!selectedRequest.type || !selectedRequest.id) {
        alert(`Données manquantes: type=${selectedRequest.type}, id=${selectedRequest.id}`);
        return;
      }
      
      console.log('Correct URL format should be:', `/requests/${selectedRequest.type}/${selectedRequest.id}/${actionType}/`);
      
      let response;
      if (actionType === 'approve') {
        response = await approveRequest(selectedRequest.type, selectedRequest.id, comment);
        console.log('Approve response:', response);
        alert('Demande approuvée avec succès!');
      } else {
        response = await rejectRequest(selectedRequest.type, selectedRequest.id, comment);
        console.log('Reject response:', response);
        alert('Demande rejetée avec succès!');
      }

      await fetchRequests();
      setDialogOpen(false);
      setComment('');
      setSelectedRequest(null);
    } catch (error) {
      console.error('Erreur lors du traitement de la demande:', error);
      console.error('Error details:', error.response?.data);
      console.error('Error status:', error.response?.status);
      console.error('Error message:', error.message);
      
      const errorMsg = error.response?.data?.error || error.response?.data?.detail || error.message || 'Erreur inconnue';
      alert(`Erreur: ${errorMsg}`);
    }
  };



  const openActionDialog = (request, action) => {
    setSelectedRequest(request);
    setActionType(action);
    setDialogOpen(true);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'warning';
      case 'approved': return 'success';
      case 'rejected': return 'error';
      default: return 'default';
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case 'pending': return 'En attente';
      case 'approved': return 'Approuvé';
      case 'rejected': return 'Rejeté';
      default: return status;
    }
  };

  const RequestCard = ({ request, type }) => (
    <Card
      elevation={0}
      sx={{
        mb: 2,
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
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Avatar sx={{ mr: 2, backgroundColor: '#1976d2' }}>
              <PersonIcon />
            </Avatar>
            <Box>
              <Typography variant="h6" fontWeight="600">
                {request.requester_name}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {request.requester_matricule}
              </Typography>
            </Box>
          </Box>
          <Chip
            label={getStatusLabel(request.status)}
            color={getStatusColor(request.status)}
            size="small"
          />
        </Box>

        {/* Détails spécifiques par type */}
        {type === 'leave' && (
          <Box sx={{ mb: 2 }}>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              <CalendarIcon sx={{ fontSize: 16, mr: 1, verticalAlign: 'middle' }} />
              Du {format(new Date(request.start_date), 'dd MMMM yyyy', { locale: fr })} 
              au {format(new Date(request.end_date), 'dd MMMM yyyy', { locale: fr })}
            </Typography>
            <Typography variant="body2">
              Type: {request.leave_type}
            </Typography>
          </Box>
        )}

        {type === 'attestation' && (
          <Box sx={{ mb: 2 }}>
            <Typography variant="body2" color="text.secondary">
              <DescriptionIcon sx={{ fontSize: 16, mr: 1, verticalAlign: 'middle' }} />
              {request.attestation_type} - {request.purpose}
            </Typography>
          </Box>
        )}

        {type === 'mission' && (
          <Box sx={{ mb: 2 }}>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              <CalendarIcon sx={{ fontSize: 16, mr: 1, verticalAlign: 'middle' }} />
              Du {format(new Date(request.start_date), 'dd MMMM yyyy', { locale: fr })} 
              au {format(new Date(request.end_date), 'dd MMMM yyyy', { locale: fr })}
            </Typography>
            <Typography variant="body2">
              Destination: {request.destination}
            </Typography>
          </Box>
        )}

        {type === 'payslip' && (
          <Box sx={{ mb: 2 }}>
            <Typography variant="body2" color="text.secondary">
              <DescriptionIcon sx={{ fontSize: 16, mr: 1, verticalAlign: 'middle' }} />
              Période: {request.periode_mois}
            </Typography>
          </Box>
        )}

        {request.comment && (
          <Typography variant="body2" sx={{ fontStyle: 'italic', mb: 2 }}>
            "{request.comment}"
          </Typography>
        )}

        <Typography variant="caption" color="text.secondary">
          Demandé le {format(new Date(request.created_at), 'dd MMMM yyyy à HH:mm', { locale: fr })}
        </Typography>

        {request.status === 'pending' && (
          <Box sx={{ mt: 2, display: 'flex', gap: 1 }}>
            <Button
              variant="contained"
              color="success"
              size="small"
              startIcon={<CheckIcon />}
              onClick={() => {
                if (type === 'attestation' || type === 'payslip') {
                  handleDirectAction({ ...request, type }, 'approve');
                } else {
                  openActionDialog({ ...request, type }, 'approve');
                }
              }}
            >
              Approuver
            </Button>
            <Button
              variant="outlined"
              color="error"
              size="small"
              startIcon={<CancelIcon />}
              onClick={() => {
                if (type === 'attestation' || type === 'payslip') {
                  handleDirectAction({ ...request, type }, 'reject');
                } else {
                  openActionDialog({ ...request, type }, 'reject');
                }
              }}
            >
              Rejeter
            </Button>
          </Box>
        )}
      </CardContent>
    </Card>
  );

  const tabLabels = [
    { label: 'Congés', key: 'leave', icon: <CalendarIcon /> },
    { label: 'Attestations', key: 'attestation', icon: <DescriptionIcon /> },
    { label: 'Missions', key: 'mission', icon: <AssignmentIcon /> },
    { label: 'Bulletins', key: 'payslip', icon: <DescriptionIcon /> }
  ];

  const currentRequests = requests[tabLabels[tabValue].key] || [];
  const pendingCount = currentRequests.filter(r => r.status === 'pending').length;

  return (
    <Box>
      {/* En-tête */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" fontWeight="bold" gutterBottom>
          Gestion des Demandes
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Traitement des demandes des employés
        </Typography>
      </Box>

      {/* Statistiques rapides */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        {tabLabels.map((tab, index) => {
          const tabRequests = requests[tab.key] || [];
          const pending = tabRequests.filter(r => r.status === 'pending').length;
          return (
            <Grid item xs={12} sm={3} key={tab.key}>
              <Card elevation={0} sx={{ border: '1px solid #e0e0e0', borderRadius: 2 }}>
                <CardContent sx={{ textAlign: 'center' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 1 }}>
                    {tab.icon}
                    <Typography variant="h5" fontWeight="bold" sx={{ ml: 1 }}>
                      {pending}
                    </Typography>
                  </Box>
                  <Typography variant="body2" color="text.secondary">
                    {tab.label} en attente
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          );
        })}
      </Grid>

      {/* Onglets */}
      <Card elevation={0} sx={{ border: '1px solid #e0e0e0', borderRadius: 2 }}>
        <Tabs
          value={tabValue}
          onChange={(e, newValue) => setTabValue(newValue)}
          sx={{ borderBottom: '1px solid #e0e0e0' }}
        >
          {tabLabels.map((tab, index) => {
            const pending = (requests[tab.key] || []).filter(r => r.status === 'pending').length;
            return (
              <Tab
                key={index}
                label={
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    {tab.icon}
                    <Typography sx={{ ml: 1 }}>{tab.label}</Typography>
                    {pending > 0 && (
                      <Badge badgeContent={pending} color="error" sx={{ ml: 1 }} />
                    )}
                  </Box>
                }
              />
            );
          })}
        </Tabs>

        <CardContent>
          {loading ? (
            <Typography>Chargement...</Typography>
          ) : currentRequests.length === 0 ? (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <ScheduleIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
              <Typography variant="h6" color="text.secondary">
                Aucune demande trouvée
              </Typography>
            </Box>
          ) : (
            <Box>
              {currentRequests.map((request) => (
                <RequestCard
                  key={request.id}
                  request={request}
                  type={tabLabels[tabValue].key}
                />
              ))}
            </Box>
          )}
        </CardContent>
      </Card>

      {/* Dialog d'action */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          {actionType === 'approve' ? 'Approuver la demande' : 'Rejeter la demande'}
        </DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            {selectedRequest && `Demande de ${selectedRequest.requester_name}`}
          </Typography>
          <TextField
            fullWidth
            multiline
            rows={3}
            label="Commentaire (optionnel)"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            sx={{ mt: 2 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>
            Annuler
          </Button>
          <Button
            onClick={handleAction}
            variant="contained"
            color={actionType === 'approve' ? 'success' : 'error'}
          >
            {actionType === 'approve' ? 'Approuver' : 'Rejeter'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ManageRequests;