import React, { useState, useEffect } from 'react';
import {
  Grid,
  Card,
  CardContent,
  Typography,
  Box,
  Avatar,
  LinearProgress,
  Chip,
  IconButton,
  Paper,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Divider
} from '@mui/material';
import {
  People as PeopleIcon,
  Assignment as AssignmentIcon,
  School as SchoolIcon,
  TrendingUp as TrendingUpIcon,
  Event as EventIcon,
  Notifications as NotificationsIcon,
  CheckCircle as CheckCircleIcon,
  Schedule as ScheduleIcon,
  Warning as WarningIcon,
  Work as WorkIcon
} from '@mui/icons-material';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';

const EventsList = () => {
  const [events, setEvents] = useState([]);
  
  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const response = await api.get('/events/');
        setEvents(response.data.slice(0, 3));
      } catch (error) {
        console.error('Events fetch error:', error);
      }
    };
    fetchEvents();
  }, []);
  
  return (
    <Box sx={{ mt: 2 }}>
      {events.length > 0 ? events.map((event, index) => (
        <Box
          key={event.id || index}
          sx={{
            display: 'flex',
            alignItems: 'center',
            p: 2,
            mb: 1,
            backgroundColor: '#f8fafc',
            borderRadius: 2,
            border: '1px solid #e2e8f0',
          }}
        >
          <Avatar
            sx={{
              backgroundColor: '#1976d2',
              width: 32,
              height: 32,
              mr: 2
            }}
          >
            <EventIcon sx={{ fontSize: 16 }} />
          </Avatar>
          <Box sx={{ flex: 1 }}>
            <Typography variant="body2" fontWeight="600">
              {event.title || event.name}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {new Date(event.date).toLocaleDateString('fr-FR')}
            </Typography>
          </Box>
        </Box>
      )) : (
        <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 2 }}>
          Aucun événement à venir
        </Typography>
      )}
    </Box>
  );
};

const Dashboard = () => {
  const { user, employee, hasAnyRole } = useAuth();
  const [stats, setStats] = useState({});
  const [newEmployeesToday, setNewEmployeesToday] = useState([]);
  const [recentJobOffers, setRecentJobOffers] = useState([]);
  const [chartData, setChartData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.log('Dashboard mounted, user:', user);
    console.log('API base URL:', 'http://localhost:8000/api/v1');
    console.log('Token in localStorage:', localStorage.getItem('token'));
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      console.log('Fetching dashboard data...');
      
      // Récupérer les statistiques principales
      const statsResponse = await api.get('/dashboard/stats/');
      console.log('Stats response:', statsResponse.data);
      setStats(statsResponse.data);
      
      // Récupérer les données du graphique
      if (statsResponse.data.monthly_evolution) {
        setChartData(statsResponse.data.monthly_evolution);
      }
      
      // Récupérer les nouveaux employés seulement pour les rôles RH
      if (hasAnyRole(['hr_manager', 'hr_director', 'administrator'])) {
        try {
          const dashboardResponse = await api.get('/dashboard/employee-data/');
          console.log('Dashboard data response:', dashboardResponse.data);
          setNewEmployeesToday(Array.isArray(dashboardResponse.data.new_employees_today) ? dashboardResponse.data.new_employees_today : []);
        } catch (empError) {
          console.error('Erreur nouveaux employés:', empError);
          setNewEmployeesToday([]);
        }
        
        try {
          const offersResponse = await api.get('/dashboard/recent-job-offers/');
          console.log('Job offers response:', offersResponse.data);
          console.log('Job offers count:', offersResponse.data?.length || 0);
          setRecentJobOffers(Array.isArray(offersResponse.data) ? offersResponse.data : []);
        } catch (offerError) {
          console.error('Erreur offres emploi:', offerError);
          console.error('Error details:', offerError.response?.data);
          setRecentJobOffers([]);
        }
      }
      
    } catch (error) {
      console.error('Erreur lors du chargement des données:', error);
      console.error('Error details:', error.response?.data);
      // Définir des valeurs par défaut en cas d'erreur
      setStats({
        total_employees: 0,
        pending_requests: 0,
        active_trainings: 0,
        expiring_contracts: 0,
        new_employees_today: 0,
        active_job_offers: 0
      });
    } finally {
      setLoading(false);
    }
  };

  const StatCard = ({ title, value, icon, color, trend, subtitle }) => (
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
            <Typography variant="h4" fontWeight="bold" color={color}>
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
              width: 56,
              height: 56,
            }}
          >
            {icon}
          </Avatar>
        </Box>
        {trend && (
          <Box sx={{ mt: 2, display: 'flex', alignItems: 'center' }}>
            <TrendingUpIcon sx={{ color: 'success.main', mr: 1, fontSize: 16 }} />
            <Typography variant="body2" color="success.main">
              +{trend}% ce mois
            </Typography>
          </Box>
        )}
      </CardContent>
    </Card>
  );



  const pieData = [
    { name: 'Employés', value: stats.total_employees || 0, color: '#1976d2' },
    { name: 'En formation', value: stats.active_trainings || 0, color: '#2e7d32' },
    { name: 'Demandes', value: stats.pending_requests || 0, color: '#ed6c02' },
  ];

  const recentActivities = [
    { type: 'request', title: 'Nouvelle demande de congé', user: 'Marie Dubois', time: '2h', icon: <AssignmentIcon /> },
    { type: 'training', title: 'Formation terminée', user: 'Jean Martin', time: '4h', icon: <SchoolIcon /> },
    { type: 'employee', title: 'Nouvel employé', user: 'Sophie Laurent', time: '1j', icon: <PeopleIcon /> },
    { type: 'event', title: 'Réunion équipe', user: 'Équipe RH', time: '2j', icon: <EventIcon /> },
  ];

  if (loading) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography variant="h4" gutterBottom>Chargement des données...</Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Connexion à l'API: http://localhost:8000/api/v1
        </Typography>
        <LinearProgress />
      </Box>
    );
  }
  
  // Afficher les données brutes pour le débogage
  console.log('Current stats:', stats);
  console.log('New employees today:', newEmployeesToday);
  console.log('Recent job offers:', recentJobOffers);

  return (
    <Box>
      {/* En-tête de bienvenue */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" fontWeight="bold" gutterBottom>
          Bonjour, {user?.first_name || user?.username} 👋
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Voici un aperçu de votre espace de travail aujourd'hui
        </Typography>
      </Box>

      {/* Cartes de statistiques */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {hasAnyRole(['hr_manager', 'hr_director', 'administrator']) && (
          <>
            <Grid item xs={12} sm={6} md={3}>
              <StatCard
                title="Total Employés"
                value={stats.total_employees || 0}
                icon={<PeopleIcon />}
                color="#1976d2"
                trend={8}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <StatCard
                title="Demandes en attente"
                value={stats.pending_requests || 0}
                icon={<AssignmentIcon />}
                color="#ed6c02"
                subtitle="À traiter"
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <StatCard
                title="Formations actives"
                value={stats.active_trainings || 0}
                icon={<SchoolIcon />}
                color="#2e7d32"
                trend={15}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <StatCard
                title="Contrats expirants"
                value={stats.expiring_contracts || 0}
                icon={<WarningIcon />}
                color="#d32f2f"
                subtitle="30 prochains jours"
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <StatCard
                title="Nouveaux aujourd'hui"
                value={stats.new_employees_today || 0}
                icon={<PeopleIcon />}
                color="#9c27b0"
                subtitle="Employés"
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <StatCard
                title="Offres actives"
                value={stats.active_job_offers || 0}
                icon={<WorkIcon />}
                color="#00bcd4"
                subtitle="Publiées"
              />
            </Grid>
          </>
        )}

        {user?.role === 'employee' && (
          <>
            <Grid item xs={12} sm={6} md={4}>
              <StatCard
                title="Mes demandes"
                value={stats.my_requests || 0}
                icon={<AssignmentIcon />}
                color="#1976d2"
                subtitle="En cours"
              />
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <StatCard
                title="Formations"
                value={stats.my_trainings || 0}
                icon={<SchoolIcon />}
                color="#2e7d32"
                subtitle="Programmées"
              />
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <StatCard
                title="Congés restants"
                value={stats.remaining_leaves || 25}
                icon={<EventIcon />}
                color="#ed6c02"
                subtitle="Jours"
              />
            </Grid>
          </>
        )}
      </Grid>

      {/* Nouveaux employés du jour */}
      {hasAnyRole(['hr_manager', 'hr_director', 'administrator']) && newEmployeesToday.length > 0 && (
        <Paper elevation={3} sx={{ p: 4, mb: 4, background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white' }}>
          <Typography variant="h5" fontWeight="bold" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
            <PeopleIcon sx={{ mr: 1 }} /> 🎉 Nouveau(x) Employé(s) du Jour
          </Typography>
          <Grid container spacing={2}>
            {newEmployeesToday.map((employee, index) => (
              <Grid item xs={12} sm={6} md={4} key={employee.id || index}>
                <Paper elevation={1} sx={{ p: 2, background: 'rgba(255,255,255,0.1)', color: 'white', textAlign: 'center' }}>
                  {employee.photo ? (
                    <Avatar src={employee.photo} sx={{ width: 60, height: 60, mx: 'auto', mb: 1, border: '3px solid white' }} />
                  ) : (
                    <Avatar sx={{ width: 60, height: 60, mx: 'auto', mb: 1, background: 'rgba(255,255,255,0.3)' }}>
                      <PeopleIcon sx={{ fontSize: 24 }} />
                    </Avatar>
                  )}
                  <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                    {employee.user_data?.first_name} {employee.user_data?.last_name}
                  </Typography>
                  <Typography variant="body2" sx={{ opacity: 0.9, mb: 0.5 }}>
                    {employee.poste || 'Poste non défini'}
                  </Typography>
                  <Typography variant="caption" sx={{ opacity: 0.8 }}>
                    {employee.service || employee.department_name || 'Service non défini'}
                  </Typography>
                </Paper>
              </Grid>
            ))}
          </Grid>
        </Paper>
      )}

      <Grid container spacing={3}>
        {/* Graphique d'évolution */}
        {hasAnyRole(['hr_manager', 'hr_director']) && (
          <Grid item xs={12} md={8}>
            <Card elevation={0} sx={{ borderRadius: 3, border: '1px solid #e0e0e0' }}>
              <CardContent>
                <Typography variant="h6" fontWeight="600" gutterBottom>
                  Évolution mensuelle
                </Typography>
                <Box sx={{ height: 300, mt: 2 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                      <XAxis dataKey="name" stroke="#666" />
                      <YAxis stroke="#666" />
                      <Tooltip 
                        contentStyle={{
                          backgroundColor: 'white',
                          border: '1px solid #e0e0e0',
                          borderRadius: '8px',
                          boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                        }}
                      />
                      <Line 
                        type="monotone" 
                        dataKey="employees" 
                        stroke="#1976d2" 
                        strokeWidth={3}
                        dot={{ fill: '#1976d2', strokeWidth: 2, r: 4 }}
                      />
                      <Line 
                        type="monotone" 
                        dataKey="requests" 
                        stroke="#ed6c02" 
                        strokeWidth={3}
                        dot={{ fill: '#ed6c02', strokeWidth: 2, r: 4 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        )}

        {/* Répartition */}
        <Grid item xs={12} md={4}>
          <Card elevation={0} sx={{ borderRadius: 3, border: '1px solid #e0e0e0' }}>
            <CardContent>
              <Typography variant="h6" fontWeight="600" gutterBottom>
                Répartition
              </Typography>
              <Box sx={{ height: 250, mt: 2 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={40}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </Box>
              <Box sx={{ mt: 2 }}>
                {pieData.map((item, index) => (
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

        {/* Offres d'emploi actives */}
        <Grid item xs={12} md={6}>
          <Card 
            elevation={0} 
            sx={{ 
              borderRadius: 3, 
              background: 'linear-gradient(135deg, #28a745 0%, #20c997 100%)',
              color: 'white'
            }}
          >
            <CardContent>
              <Typography variant="h6" fontWeight="600" gutterBottom sx={{ color: 'white' }}>
                💼 Offres d'Emploi Actives
              </Typography>
              {recentJobOffers.length > 0 ? (
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  {recentJobOffers.slice(0, 3).map((offer, index) => (
                    <Box
                      key={offer.id || index}
                      sx={{
                        background: 'rgba(255,255,255,0.1)',
                        padding: 2,
                        borderRadius: 2,
                        minWidth: 280
                      }}
                    >
                      <Typography variant="subtitle1" fontWeight="600" sx={{ mb: 1, color: 'white' }}>
                        {offer.title}
                      </Typography>
                      <Typography variant="body2" sx={{ opacity: 0.75, mb: 0.5, color: 'white' }}>
                        📍 {offer.department || offer.location || 'Département non spécifié'}
                      </Typography>
                      <Typography variant="body2" sx={{ opacity: 0.75, mb: 0.5, color: 'white' }}>
                        🎯 {offer.employment_type || 'Type non spécifié'}
                      </Typography>
                      <Typography variant="body2" sx={{ opacity: 0.75, mb: 2, color: 'white' }}>
                        {offer.applications_count || 0} candidature(s)
                      </Typography>
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        <Chip 
                          label="Gérer" 
                          size="small" 
                          onClick={() => window.open(`/recruitment/job-offers/${offer.id}`, '_blank')}
                          sx={{ 
                            background: 'rgba(255,255,255,0.2)', 
                            color: 'white',
                            cursor: 'pointer',
                            '&:hover': { background: 'rgba(255,255,255,0.3)' }
                          }}
                        />
                      </Box>
                    </Box>
                  ))}
                </Box>
              ) : (
                <Box sx={{ textAlign: 'center', py: 3 }}>
                  <Avatar sx={{ backgroundColor: 'rgba(255,255,255,0.1)', width: 60, height: 60, mx: 'auto', mb: 2 }}>
                    <WorkIcon sx={{ color: 'white' }} />
                  </Avatar>
                  <Typography variant="body2" sx={{ color: 'white', opacity: 0.75 }}>
                    Aucune offre d'emploi active
                  </Typography>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>



        {/* Calendrier des événements */}
        <Grid item xs={12} md={6}>
          <Card elevation={0} sx={{ borderRadius: 3, border: '1px solid #e0e0e0' }}>
            <CardContent>
              <Typography variant="h6" fontWeight="600" gutterBottom>
                Événements à venir
              </Typography>
              <EventsList />
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Dashboard;