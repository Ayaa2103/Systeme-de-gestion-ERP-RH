import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Avatar,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Chip,
  LinearProgress,
  Paper,
  Tabs,
  Tab
} from '@mui/material';
import {
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  People as PeopleIcon,
  Assignment as AssignmentIcon,
  School as SchoolIcon,
  Warning as WarningIcon,
  CheckCircle as CheckCircleIcon,
  Schedule as ScheduleIcon
} from '@mui/icons-material';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area
} from 'recharts';
import api from '../../services/api';

const KPIDashboard = () => {
  const [kpiData, setKpiData] = useState({});
  const [loading, setLoading] = useState(true);
  const [tabValue, setTabValue] = useState(0);

  useEffect(() => {
    fetchKPIData();
  }, []);

  const fetchKPIData = async () => {
    try {
      const response = await api.get('/kpi/dashboard/');
      setKpiData(response.data);
    } catch (error) {
      console.error('Erreur lors du chargement des KPIs:', error);
      // Données de démonstration en cas d'erreur
      setKpiData({
        total_employees: 67,
        pending_requests: 12,
        absent_today: 5,
        total_absences: 28,
        absence_rate: 8.5,
        avg_absence_days: 2.3,
        employees_over_threshold: [
          { id: 1, name: 'Marie Dubois', matricule: 'EMP001', absence_days: 15 },
          { id: 2, name: 'Jean Martin', matricule: 'EMP002', absence_days: 12 }
        ],
        chart_data: [
          { month: 'Jan', absences: 20, requests: 8, trainings: 3 },
          { month: 'Fév', absences: 25, requests: 12, trainings: 5 },
          { month: 'Mar', absences: 18, requests: 10, trainings: 4 },
          { month: 'Avr', absences: 28, requests: 15, trainings: 6 },
          { month: 'Mai', absences: 22, requests: 9, trainings: 7 },
          { month: 'Jun', absences: 30, requests: 18, trainings: 8 }
        ],
        training_stats: {
          total_trainings: 15,
          participation_rate: 85,
          employees_training_data: [
            { department: 'IT', participants: 12, total: 15 },
            { department: 'RH', participants: 8, total: 10 },
            { department: 'Finance', participants: 6, total: 8 }
          ]
        }
      });
    } finally {
      setLoading(false);
    }
  };

  const StatCard = ({ title, value, icon, color, trend, subtitle, percentage }) => (
    <Card
      elevation={0}
      sx={{
        background: `linear-gradient(135deg, ${color}15 0%, ${color}05 100%)`,
        border: `1px solid ${color}20`,
        borderRadius: 3,
        transition: 'all 0.3s ease',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: `0 8px 25px ${color}25`,
        }
      }}
    >
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box>
            <Typography variant="h3" fontWeight="bold" color={color}>
              {value}
            </Typography>
            <Typography variant="body1" color="text.secondary" fontWeight="500">
              {title}
            </Typography>
            {subtitle && (
              <Typography variant="body2" color="text.secondary">
                {subtitle}
              </Typography>
            )}
          </Box>
          <Avatar
            sx={{
              backgroundColor: color,
              width: 64,
              height: 64,
            }}
          >
            {icon}
          </Avatar>
        </Box>
        {trend && (
          <Box sx={{ mt: 2, display: 'flex', alignItems: 'center' }}>
            {trend > 0 ? (
              <TrendingUpIcon sx={{ color: 'success.main', mr: 1 }} />
            ) : (
              <TrendingDownIcon sx={{ color: 'error.main', mr: 1 }} />
            )}
            <Typography variant="body2" color={trend > 0 ? 'success.main' : 'error.main'}>
              {Math.abs(trend)}% vs mois dernier
            </Typography>
          </Box>
        )}
        {percentage !== undefined && (
          <Box sx={{ mt: 2 }}>
            <LinearProgress
              variant="determinate"
              value={percentage}
              sx={{
                height: 8,
                borderRadius: 4,
                backgroundColor: `${color}20`,
                '& .MuiLinearProgress-bar': {
                  backgroundColor: color,
                }
              }}
            />
            <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
              {percentage}% de l'objectif
            </Typography>
          </Box>
        )}
      </CardContent>
    </Card>
  );

  const pieColors = ['#1976d2', '#2e7d32', '#ed6c02', '#d32f2f', '#7b1fa2'];

  const absenceData = [
    { name: 'Présents', value: (kpiData.total_employees || 67) - (kpiData.absent_today || 5), color: '#2e7d32' },
    { name: 'Absents', value: kpiData.absent_today || 5, color: '#ed6c02' },
    { name: 'En formation', value: 8, color: '#1976d2' },
  ];

  if (loading) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography variant="h4" gutterBottom>Chargement des KPIs...</Typography>
        <LinearProgress />
      </Box>
    );
  }

  return (
    <Box>
      {/* En-tête */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" fontWeight="bold" gutterBottom>
          Tableau de Bord KPI
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Indicateurs de performance des ressources humaines
        </Typography>
      </Box>

      {/* KPIs principaux */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Total Employés"
            value={kpiData.total_employees || 0}
            icon={<PeopleIcon />}
            color="#1976d2"
            trend={5}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Demandes en attente"
            value={kpiData.pending_requests || 0}
            icon={<AssignmentIcon />}
            color="#ed6c02"
            trend={-12}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Absents aujourd'hui"
            value={kpiData.absent_today || 0}
            icon={<WarningIcon />}
            color="#d32f2f"
            subtitle={`${kpiData.absence_rate || 0}% taux d'absence`}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Formations actives"
            value={kpiData.training_stats?.total_trainings || 0}
            icon={<SchoolIcon />}
            color="#2e7d32"
            percentage={kpiData.training_stats?.participation_rate || 0}
          />
        </Grid>
      </Grid>

      {/* Onglets pour différentes vues */}
      <Card elevation={0} sx={{ mb: 3, border: '1px solid #e0e0e0', borderRadius: 2 }}>
        <Tabs
          value={tabValue}
          onChange={(e, newValue) => setTabValue(newValue)}
          sx={{ borderBottom: '1px solid #e0e0e0' }}
        >
          <Tab label="Vue d'ensemble" />
          <Tab label="Absences" />
          <Tab label="Formations" />
          <Tab label="Alertes" />
        </Tabs>
      </Card>

      {/* Contenu des onglets */}
      {tabValue === 0 && (
        <Grid container spacing={3}>
          {/* Graphique d'évolution */}
          <Grid item xs={12} lg={8}>
            <Card elevation={0} sx={{ border: '1px solid #e0e0e0', borderRadius: 2 }}>
              <CardContent>
                <Typography variant="h6" fontWeight="600" gutterBottom>
                  Évolution mensuelle
                </Typography>
                <Box sx={{ height: 350, mt: 2 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={kpiData.chart_data || []}>
                      <defs>
                        <linearGradient id="colorAbsences" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#d32f2f" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="#d32f2f" stopOpacity={0}/>
                        </linearGradient>
                        <linearGradient id="colorRequests" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#ed6c02" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="#ed6c02" stopOpacity={0}/>
                        </linearGradient>
                        <linearGradient id="colorTrainings" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#2e7d32" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="#2e7d32" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                      <XAxis dataKey="month" stroke="#666" />
                      <YAxis stroke="#666" />
                      <Tooltip 
                        contentStyle={{
                          backgroundColor: 'white',
                          border: '1px solid #e0e0e0',
                          borderRadius: '8px',
                          boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                        }}
                      />
                      <Area
                        type="monotone"
                        dataKey="absences"
                        stroke="#d32f2f"
                        fillOpacity={1}
                        fill="url(#colorAbsences)"
                        strokeWidth={2}
                      />
                      <Area
                        type="monotone"
                        dataKey="requests"
                        stroke="#ed6c02"
                        fillOpacity={1}
                        fill="url(#colorRequests)"
                        strokeWidth={2}
                      />
                      <Area
                        type="monotone"
                        dataKey="trainings"
                        stroke="#2e7d32"
                        fillOpacity={1}
                        fill="url(#colorTrainings)"
                        strokeWidth={2}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          {/* Répartition présence */}
          <Grid item xs={12} lg={4}>
            <Card elevation={0} sx={{ border: '1px solid #e0e0e0', borderRadius: 2 }}>
              <CardContent>
                <Typography variant="h6" fontWeight="600" gutterBottom>
                  Présence aujourd'hui
                </Typography>
                <Box sx={{ height: 300, mt: 2 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={absenceData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={100}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {absenceData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </Box>
                <Box sx={{ mt: 2 }}>
                  {absenceData.map((item, index) => (
                    <Box key={index} sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <Box
                        sx={{
                          width: 12,
                          height: 12,
                          backgroundColor: item.color,
                          borderRadius: '50%',
                          mr: 1
                        }}
                      />
                      <Typography variant="body2" sx={{ flex: 1 }}>
                        {item.name}
                      </Typography>
                      <Typography variant="body2" fontWeight="600">
                        {item.value}
                      </Typography>
                    </Box>
                  ))}
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {tabValue === 1 && (
        <Grid container spacing={3}>
          <Grid item xs={12} md={8}>
            <Card elevation={0} sx={{ border: '1px solid #e0e0e0', borderRadius: 2 }}>
              <CardContent>
                <Typography variant="h6" fontWeight="600" gutterBottom>
                  Statistiques d'absence
                </Typography>
                <Grid container spacing={2} sx={{ mt: 1 }}>
                  <Grid item xs={6}>
                    <Box sx={{ textAlign: 'center', p: 2 }}>
                      <Typography variant="h4" color="error.main" fontWeight="bold">
                        {kpiData.total_absences || 0}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Total absences ce mois
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={6}>
                    <Box sx={{ textAlign: 'center', p: 2 }}>
                      <Typography variant="h4" color="warning.main" fontWeight="bold">
                        {kpiData.avg_absence_days || 0}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Moyenne jours/employé
                      </Typography>
                    </Box>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={4}>
            <Card elevation={0} sx={{ border: '1px solid #e0e0e0', borderRadius: 2 }}>
              <CardContent>
                <Typography variant="h6" fontWeight="600" gutterBottom>
                  Employés à surveiller
                </Typography>
                <List>
                  {(kpiData.employees_over_threshold || []).map((employee) => (
                    <ListItem key={employee.id} sx={{ px: 0 }}>
                      <ListItemAvatar>
                        <Avatar sx={{ backgroundColor: '#d32f2f' }}>
                          <WarningIcon />
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText
                        primary={employee.name}
                        secondary={`${employee.matricule} • ${employee.absence_days} jours`}
                      />
                    </ListItem>
                  ))}
                </List>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {tabValue === 2 && (
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Card elevation={0} sx={{ border: '1px solid #e0e0e0', borderRadius: 2 }}>
              <CardContent>
                <Typography variant="h6" fontWeight="600" gutterBottom>
                  Participation aux formations par département
                </Typography>
                <Box sx={{ height: 300, mt: 2 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={kpiData.training_stats?.employees_training_data || []}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="department" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="participants" fill="#2e7d32" name="Participants" />
                      <Bar dataKey="total" fill="#e0e0e0" name="Total employés" />
                    </BarChart>
                  </ResponsiveContainer>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {tabValue === 3 && (
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Card elevation={0} sx={{ border: '1px solid #e0e0e0', borderRadius: 2 }}>
              <CardContent>
                <Typography variant="h6" fontWeight="600" gutterBottom>
                  Alertes et notifications
                </Typography>
                <List>
                  <ListItem>
                    <ListItemAvatar>
                      <Avatar sx={{ backgroundColor: '#ed6c02' }}>
                        <WarningIcon />
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary="Contrats expirants"
                      secondary="3 contrats expirent dans les 30 prochains jours"
                    />
                    <Chip label="Urgent" color="warning" size="small" />
                  </ListItem>
                  <ListItem>
                    <ListItemAvatar>
                      <Avatar sx={{ backgroundColor: '#1976d2' }}>
                        <ScheduleIcon />
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary="Formations en attente"
                      secondary="5 formations attendent une approbation"
                    />
                    <Chip label="Action requise" color="primary" size="small" />
                  </ListItem>
                  <ListItem>
                    <ListItemAvatar>
                      <Avatar sx={{ backgroundColor: '#2e7d32' }}>
                        <CheckCircleIcon />
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary="Objectifs atteints"
                      secondary="Taux de participation aux formations: 85%"
                    />
                    <Chip label="Succès" color="success" size="small" />
                  </ListItem>
                </List>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}
    </Box>
  );
};

export default KPIDashboard;