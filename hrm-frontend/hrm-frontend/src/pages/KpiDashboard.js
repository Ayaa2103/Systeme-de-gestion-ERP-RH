import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box, Card, CardContent, Typography, Grid, Alert, CircularProgress,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Paper, Chip, Button, LinearProgress
} from '@mui/material';
import {
  PersonOff, CalendarToday, TrendingUp, Group, Schedule,
  School, BarChart, ArrowBack, Assignment, People
} from '@mui/icons-material';

import { getKpiData } from '../services/kpiService';



const KpiDashboard = () => {
  const navigate = useNavigate();
  const [kpiData, setKpiData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchKpiData();
  }, []);

  const fetchKpiData = async () => {
    try {
      console.log('Fetching KPI data...');
      const response = await getKpiData();
      console.log('KPI response:', response);
      setKpiData(response.data);
    } catch (error) {
      console.error('KPI fetch error:', error);
      console.error('Error response:', error.response);
      setError(`Erreur lors du chargement des KPI: ${error.response?.data?.error || error.message}`);
    } finally {
      setLoading(false);
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
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'between', alignItems: 'center', mb: 4 }}>
        <Box>
          <Typography variant="h4" fontWeight="bold" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
Analytics Dashboard
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Vue d'ensemble des indicateurs de performance RH
          </Typography>
        </Box>
        <Chip label={new Date().toLocaleDateString('fr-FR')} color="primary" />
      </Box>

      {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

      {kpiData && (
        <>
          {/* Absence KPIs */}
          <Typography variant="h5" sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 1 }}>
  Indicateurs d'Absence
          </Typography>
          
          <Grid container spacing={3} sx={{ mb: 4 }}>
            <Grid item xs={12} md={4}>
              <Card sx={{ borderLeft: '4px solid #e74a3b' }}>
                <CardContent>
                  <Box display="flex" justifyContent="between" alignItems="center">
                    <Box>
                      <Typography variant="caption" color="error" fontWeight="bold">
                        ABSENTS AUJOURD'HUI
                      </Typography>
                      <Typography variant="h4" fontWeight="bold">
                        {kpiData.absent_today}
                      </Typography>
                    </Box>
                    <PersonOff sx={{ fontSize: 40, color: 'grey.400' }} />
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} md={4}>
              <Card sx={{ borderLeft: '4px solid #f6c23e' }}>
                <CardContent>
                  <Box display="flex" justifyContent="between" alignItems="center">
                    <Box>
                      <Typography variant="caption" color="warning.main" fontWeight="bold">
                        ABSENCES CE MOIS
                      </Typography>
                      <Typography variant="h4" fontWeight="bold">
                        {kpiData.total_absences}
                      </Typography>
                    </Box>
                    <CalendarToday sx={{ fontSize: 40, color: 'grey.400' }} />
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} md={4}>
              <Card sx={{ borderLeft: '4px solid #36b9cc' }}>
                <CardContent>
                  <Box display="flex" justifyContent="between" alignItems="center">
                    <Box sx={{ width: '100%' }}>
                      <Typography variant="caption" color="info.main" fontWeight="bold">
                        TAUX D'ABSENCE
                      </Typography>
                      <Box display="flex" alignItems="center" gap={2}>
                        <Typography variant="h4" fontWeight="bold">
                          {kpiData.absence_rate}%
                        </Typography>
                        <Box sx={{ flexGrow: 1 }}>
                          <LinearProgress 
                            variant="determinate" 
                            value={kpiData.absence_rate} 
                            color="info"
                            sx={{ height: 8, borderRadius: 4 }}
                          />
                        </Box>
                      </Box>
                    </Box>
                    <TrendingUp sx={{ fontSize: 40, color: 'grey.400' }} />
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          {/* Second Row KPIs */}
          <Grid container spacing={3} sx={{ mb: 4 }}>
            <Grid item xs={12} md={4}>
              <Card sx={{ borderLeft: '4px solid #4e73df' }}>
                <CardContent>
                  <Box display="flex" justifyContent="between" alignItems="center">
                    <Box>
                      <Typography variant="caption" color="primary" fontWeight="bold">
                        MOYENNE/EMPLOYÉ
                      </Typography>
                      <Typography variant="h4" fontWeight="bold">
                        {kpiData.avg_absence_days} jours
                      </Typography>
                    </Box>
                    <Schedule sx={{ fontSize: 40, color: 'grey.400' }} />
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} md={4}>
              <Card sx={{ borderLeft: '4px solid #1cc88a' }}>
                <CardContent>
                  <Box display="flex" justifyContent="between" alignItems="center">
                    <Box>
                      <Typography variant="caption" color="success.main" fontWeight="bold">
                        EFFECTIF TOTAL
                      </Typography>
                      <Typography variant="h4" fontWeight="bold">
                        {kpiData.total_employees}
                      </Typography>
                    </Box>
                    <Group sx={{ fontSize: 40, color: 'grey.400' }} />
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} md={4}>
              <Card sx={{ borderLeft: '4px solid #f6c23e' }}>
                <CardContent>
                  <Box display="flex" justifyContent="between" alignItems="center">
                    <Box>
                      <Typography variant="caption" color="warning.main" fontWeight="bold">
                        DEMANDES PENDANTES
                      </Typography>
                      <Typography variant="h4" fontWeight="bold">
                        {kpiData.pending_requests}
                      </Typography>
                    </Box>
                    <Schedule sx={{ fontSize: 40, color: 'grey.400' }} />
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          {/* Training KPIs */}
          <Typography variant="h5" sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 1 }}>
  Indicateurs de Formation
          </Typography>

          <Grid container spacing={3} sx={{ mb: 4 }}>
            <Grid item xs={12} md={6}>
              <Card sx={{ borderLeft: '4px solid #36b9cc' }}>
                <CardContent>
                  <Box display="flex" justifyContent="between" alignItems="center">
                    <Box>
                      <Typography variant="caption" color="info.main" fontWeight="bold">
                        NOMBRE TOTAL DE FORMATIONS
                      </Typography>
                      <Typography variant="h4" fontWeight="bold">
                        {kpiData.training_stats?.total_trainings || 0}
                      </Typography>
                    </Box>
                    <School sx={{ fontSize: 40, color: 'grey.400' }} />
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} md={6}>
              <Card sx={{ borderLeft: '4px solid #1cc88a' }}>
                <CardContent>
                  <Box display="flex" justifyContent="between" alignItems="center">
                    <Box sx={{ width: '100%' }}>
                      <Typography variant="caption" color="success.main" fontWeight="bold">
                        TAUX DE PARTICIPATION
                      </Typography>
                      <Box display="flex" alignItems="center" gap={2}>
                        <Typography variant="h4" fontWeight="bold">
                          {kpiData.training_stats?.participation_rate || 0}%
                        </Typography>
                        <Box sx={{ flexGrow: 1 }}>
                          <LinearProgress 
                            variant="determinate" 
                            value={kpiData.training_stats?.participation_rate || 0} 
                            color="success"
                            sx={{ height: 8, borderRadius: 4 }}
                          />
                        </Box>
                      </Box>
                    </Box>
                    <BarChart sx={{ fontSize: 40, color: 'grey.400' }} />
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          {/* Alerts Section */}
          {kpiData.employees_over_threshold?.length > 0 && (
            <Card sx={{ mb: 4, borderTop: '4px solid #e74a3b' }}>
              <CardContent>
                <Typography variant="h6" color="error" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                  ⚠️ Alertes - Seuil d'Absence Dépassé
                </Typography>
                <TableContainer>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>Employé</TableCell>
                        <TableCell>Matricule</TableCell>
                        <TableCell>Jours d'Absence</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {kpiData.employees_over_threshold.map((item) => (
                        <TableRow key={item.id}>
                          <TableCell>{item.name}</TableCell>
                          <TableCell>{item.matricule}</TableCell>
                          <TableCell>
                            <Chip label={`${item.absence_days} jours`} color="error" size="small" />
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </CardContent>
            </Card>
          )}

          {/* Training Table */}
          <Card sx={{ mb: 4 }}>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
Formations par Employé
              </Typography>
              <TableContainer sx={{ maxHeight: 400, overflow: 'auto' }}>
                <Table stickyHeader>
                  <TableHead>
                    <TableRow>
                      <TableCell>Nom Salarié</TableCell>
                      <TableCell>Matricule</TableCell>
                      <TableCell>Service</TableCell>
                      <TableCell>Formations Effectuées</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {kpiData.training_stats?.employees_training_data?.length > 0 ? kpiData.training_stats.employees_training_data.map((item, index) => (
                      <TableRow key={index} hover>
                        <TableCell>{item.employee?.user?.get_full_name || 'N/A'}</TableCell>
                        <TableCell>{item.employee?.matricule || 'N/A'}</TableCell>
                        <TableCell>{item.employee?.service || 'Non défini'}</TableCell>
                        <TableCell>
                          <Chip 
                            label={item.training_count || 0}
                            color={item.training_count > 0 ? 'success' : 'default'}
                            size="small"
                          />
                        </TableCell>
                      </TableRow>
                    )) : (
                      <TableRow>
                        <TableCell colSpan={4} align="center">
                          <Typography color="text.secondary">Aucune donnée de formation disponible</Typography>
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>

          {/* Chart Section */}
          <Card sx={{ mb: 4 }}>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
Analyse des Absences par Employé
              </Typography>
              <TableContainer sx={{ maxHeight: 400, overflow: 'auto' }}>
                <Table stickyHeader>
                  <TableHead>
                    <TableRow>
                      <TableCell>Employé</TableCell>
                      <TableCell>Jours d'Absence</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {kpiData?.chart_data?.length > 0 ? kpiData.chart_data.map((item, index) => (
                      <TableRow key={index} hover>
                        <TableCell>{item.name || 'N/A'}</TableCell>
                        <TableCell>
                          <Chip 
                            label={`${item.days || 0} jours`} 
                            color={item.days > 5 ? 'error' : item.days > 2 ? 'warning' : 'success'} 
                            size="small" 
                          />
                        </TableCell>
                      </TableRow>
                    )) : (
                      <TableRow>
                        <TableCell colSpan={2} align="center">
                          <Typography color="text.secondary">Aucune donnée d'absence disponible</Typography>
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <Box display="flex" justifyContent="center" gap={2} sx={{ mb: 4 }}>
            <Button
              variant="outlined"
              startIcon={<ArrowBack />}
              onClick={() => navigate('/dashboard')}
              size="large"
            >
              Retour Dashboard
            </Button>
            <Button
              variant="contained"
              startIcon={<Assignment />}
              onClick={() => navigate('/requests')}
              size="large"
            >
              Gérer Demandes
            </Button>
            <Button
              variant="contained"
              startIcon={<People />}
              onClick={() => navigate('/employees')}
              size="large"
              color="info"
            >
              Liste Employés
            </Button>
          </Box>
        </>
      )}
    </Box>
  );
};

export default KpiDashboard;