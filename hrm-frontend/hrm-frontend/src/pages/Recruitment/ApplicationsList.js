import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Grid,
  Chip,
  Avatar,
  IconButton,
  Menu,
  MenuItem,
  TextField,
  InputAdornment,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper
} from '@mui/material';
import {
  Person as PersonIcon,
  Search as SearchIcon,
  MoreVert as MoreVertIcon,
  Visibility as ViewIcon,
  CheckCircle as AcceptIcon,
  Cancel as RejectIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  Download as DownloadIcon
} from '@mui/icons-material';
import { getApplications, updateApplicationStatus } from '../../services/hrService';

const ApplicationsList = () => {
  const navigate = useNavigate();
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedApplication, setSelectedApplication] = useState(null);

  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    try {
      const response = await getApplications();
      setApplications(response.data.results || response.data);
    } catch (error) {
      console.error('Erreur:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (id, status) => {
    try {
      await updateApplicationStatus(id, status);
      await fetchApplications();
      setAnchorEl(null);
    } catch (error) {
      console.error('Erreur:', error);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      'pending': 'warning',
      'reviewed': 'info',
      'interview': 'primary',
      'accepted': 'success',
      'rejected': 'error'
    };
    return colors[status] || 'default';
  };

  const getStatusLabel = (status) => {
    const labels = {
      'pending': 'En attente',
      'reviewed': 'Examiné',
      'interview': 'Entretien',
      'accepted': 'Accepté',
      'rejected': 'Rejeté'
    };
    return labels[status] || status;
  };

  const filteredApplications = applications.filter(app => {
    const matchesSearch = app.first_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         app.last_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         app.job_offer_title?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = !statusFilter || app.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <Box>
      {/* En-tête */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" fontWeight="bold" gutterBottom>
          Candidatures
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Gestion des candidatures reçues pour les offres d'emploi
        </Typography>
      </Box>

      {/* Statistiques */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={2.4}>
          <Card elevation={0} sx={{ border: '1px solid #e0e0e0', borderRadius: 2 }}>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="h4" color="primary" fontWeight="bold">
                {applications.length}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Total
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={2.4}>
          <Card elevation={0} sx={{ border: '1px solid #e0e0e0', borderRadius: 2 }}>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="h4" color="warning.main" fontWeight="bold">
                {applications.filter(a => a.status === 'pending').length}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                En attente
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={2.4}>
          <Card elevation={0} sx={{ border: '1px solid #e0e0e0', borderRadius: 2 }}>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="h4" color="primary.main" fontWeight="bold">
                {applications.filter(a => a.status === 'interview').length}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Entretiens
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={2.4}>
          <Card elevation={0} sx={{ border: '1px solid #e0e0e0', borderRadius: 2 }}>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="h4" color="success.main" fontWeight="bold">
                {applications.filter(a => a.status === 'accepted').length}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Acceptées
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={2.4}>
          <Card elevation={0} sx={{ border: '1px solid #e0e0e0', borderRadius: 2 }}>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="h4" color="error.main" fontWeight="bold">
                {applications.filter(a => a.status === 'rejected').length}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Rejetées
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Filtres */}
      <Card elevation={0} sx={{ border: '1px solid #e0e0e0', borderRadius: 2, mb: 3 }}>
        <CardContent>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                placeholder="Rechercher par nom ou poste..."
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
              <TextField
                fullWidth
                select
                label="Statut"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                SelectProps={{ native: true }}
              >
                <option value="">Tous les statuts</option>
                <option value="pending">En attente</option>
                <option value="reviewed">Examiné</option>
                <option value="interview">Entretien</option>
                <option value="accepted">Accepté</option>
                <option value="rejected">Rejeté</option>
              </TextField>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Tableau des candidatures */}
      <Card elevation={0} sx={{ border: '1px solid #e0e0e0', borderRadius: 2 }}>
        <CardContent>
          <TableContainer component={Paper} elevation={0}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Candidat</TableCell>
                  <TableCell>Poste</TableCell>
                  <TableCell>Contact</TableCell>
                  <TableCell>Statut</TableCell>
                  <TableCell>Date</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredApplications.map((application) => (
                  <TableRow key={application.id}>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Avatar sx={{ mr: 2, backgroundColor: '#1976d2' }}>
                          <PersonIcon />
                        </Avatar>
                        <Box>
                          <Typography variant="subtitle2" fontWeight="600">
                            {application.first_name} {application.last_name}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {application.source === 'email' ? 'Email' : 'Site Web'}
                          </Typography>
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" fontWeight="500">
                        {application.job_offer_title}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Box>
                        <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
                          <EmailIcon sx={{ fontSize: 16, mr: 1 }} />
                          {application.email}
                        </Typography>
                        {application.phone && (
                          <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center' }}>
                            <PhoneIcon sx={{ fontSize: 16, mr: 1 }} />
                            {application.phone}
                          </Typography>
                        )}
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={getStatusLabel(application.status)}
                        color={getStatusColor(application.status)}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {new Date(application.applied_at).toLocaleDateString()}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        <IconButton
                          size="small"
                          onClick={() => navigate(`/recruitment/applications/${application.id}`)}
                        >
                          <ViewIcon />
                        </IconButton>
                        {application.cv && (
                          <IconButton size="small">
                            <DownloadIcon />
                          </IconButton>
                        )}
                        <IconButton
                          size="small"
                          onClick={(e) => {
                            setAnchorEl(e.currentTarget);
                            setSelectedApplication(application);
                          }}
                        >
                          <MoreVertIcon />
                        </IconButton>
                      </Box>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>

      {/* Menu contextuel */}
      <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={() => setAnchorEl(null)}>
        <MenuItem onClick={() => {
          navigate(`/recruitment/applications/${selectedApplication?.id}`);
          setAnchorEl(null);
        }}>
          <ViewIcon sx={{ mr: 1 }} />
          Voir Détails
        </MenuItem>
        {selectedApplication?.status === 'pending' && (
          <>
            <MenuItem onClick={() => handleUpdateStatus(selectedApplication.id, 'reviewed')}>
              Marquer comme Examiné
            </MenuItem>
            <MenuItem onClick={() => handleUpdateStatus(selectedApplication.id, 'interview')}>
              Programmer Entretien
            </MenuItem>
          </>
        )}
        {selectedApplication?.status === 'interview' && (
          <>
            <MenuItem onClick={() => handleUpdateStatus(selectedApplication.id, 'accepted')}>
              <AcceptIcon sx={{ mr: 1 }} />
              Accepter
            </MenuItem>
            <MenuItem onClick={() => handleUpdateStatus(selectedApplication.id, 'rejected')}>
              <RejectIcon sx={{ mr: 1 }} />
              Rejeter
            </MenuItem>
          </>
        )}
      </Menu>
    </Box>
  );
};

export default ApplicationsList;