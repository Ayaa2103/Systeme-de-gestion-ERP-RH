import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import {
  Box, Card, CardContent, Typography, Button, Grid, Chip, Avatar,
  Divider, Skeleton,
} from '@mui/material';
import {
  CorporateFare as CultureIcon,
  Lightbulb as SuggestionIcon,
  Add as AddIcon,
  ArrowForward as ArrowIcon,
  ArrowBack as BackIcon,
  Gavel as EthicsIcon,
  Star as ValuesIcon,
  TrackChanges as MissionIcon,
  Policy as PolicyIcon,
  CheckCircle as AnsweredIcon,
  Schedule as PendingIcon,
  People as PeopleIcon,
  Settings as ManageIcon,
} from '@mui/icons-material';
import { getCompanyPages, getSuggestions } from '../../services/cultureService';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

const STATUS = {
  new:      { label: 'Nouvelle',  color: '#0288d1', bg: '#e1f5fe' },
  received: { label: 'Reçue',     color: '#f57c00', bg: '#fff8e1' },
  answered: { label: 'Répondue',  color: '#2e7d32', bg: '#e8f5e9' },
};

const COLORS = ['#1976d2','#388e3c','#d32f2f','#7b1fa2','#f57c00','#0097a7'];
const avatarColor = (name = '') => COLORS[(name.charCodeAt(0) || 0) % COLORS.length];

const PAGE_TYPES = [
  { type: 'vision_mission', title: 'Vision & Mission', icon: <MissionIcon />, color: '#1976d2', bg: '#e3f2fd' },
  { type: 'values',         title: 'Valeurs',           icon: <ValuesIcon />,  color: '#f57c00', bg: '#fff3e0' },
  { type: 'policies',       title: 'Politiques',        icon: <PolicyIcon />,  color: '#2e7d32', bg: '#e8f5e9' },
  { type: 'ethics',         title: 'Code d\'Éthique',  icon: <EthicsIcon />,  color: '#7b1fa2', bg: '#f3e5f5' },
];

const NavHeader = ({ title, icon, action }) => (
  <Box sx={{ background: 'linear-gradient(135deg,#0f172a,#1e3a5f,#1e40af)',
    px: 2.5, py: 1.5, display: 'flex', alignItems: 'center', gap: 1.5 }}>
    <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.12)', width: 28, height: 28, borderRadius: 1.5 }}>
      {React.cloneElement(icon, { sx: { fontSize: 14, color: 'white' } })}
    </Avatar>
    <Typography sx={{ color: 'white', fontWeight: 700, fontSize: '0.88rem', flex: 1 }}>{title}</Typography>
    {action}
  </Box>
);

const CultureDashboard = () => {
  const navigate = useNavigate();
  const { hasAnyRole, user } = useAuth();
  const isHR       = hasAnyRole(['hr_manager', 'hr_director']);
  const isEmployee = user?.role === 'employee';

  const [pages,       setPages]       = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  const [loading,     setLoading]     = useState(true);

  useEffect(() => { load(); }, []);

  const load = async () => {
    setLoading(true);
    const [pagesRes, sugRes] = await Promise.allSettled([
      getCompanyPages(),
      getSuggestions(),
    ]);
    if (pagesRes.status === 'fulfilled') {
      const d = pagesRes.value.data;
      setPages(d?.results || (Array.isArray(d) ? d : []));
    }
    if (sugRes.status === 'fulfilled') {
      const d = sugRes.value.data;
      setSuggestions(d?.results || (Array.isArray(d) ? d : []));
    }
    setLoading(false);
  };

  const newCount      = suggestions.filter(s => s.status === 'new').length;
  const answeredCount = suggestions.filter(s => s.status === 'answered').length;

  return (
    <Box sx={{ width: '100%' }}>

      {/* Banner */}
      <Card elevation={0} sx={{ borderRadius: 3, border: '1px solid #e8ecf0', mb: 3, overflow: 'hidden' }}>
        <Box sx={{ background: 'linear-gradient(135deg,#0f172a 0%,#1e3a5f 60%,#1e40af 100%)',
          px: 3, py: 2.5, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Button startIcon={<BackIcon />} onClick={() => navigate('/dashboard')} size="small"
              sx={{ color: 'rgba(255,255,255,0.7)', textTransform: 'none', borderRadius: 2,
                '&:hover': { bgcolor: 'rgba(255,255,255,0.1)', color: 'white' } }}>
              Retour
            </Button>
            <Box sx={{ p: 1.25, borderRadius: 2, bgcolor: 'rgba(255,255,255,0.12)', display: 'inline-flex' }}>
              <CultureIcon sx={{ fontSize: 22, color: 'white' }} />
            </Box>
            <Box>
              <Typography variant="h5" fontWeight={700} color="white">Culture d'Entreprise</Typography>
              <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.65)', mt: 0.3 }}>
                Valeurs, politiques et suggestions des équipes
              </Typography>
            </Box>
          </Box>
          <Box sx={{ display: 'flex', gap: 1.5 }}>
            {isHR && (
              <Button startIcon={<ManageIcon />} onClick={() => navigate('/culture/pages')} size="small"
                sx={{ color: 'rgba(255,255,255,0.8)', border: '1px solid rgba(255,255,255,0.25)',
                  borderRadius: 2, textTransform: 'none', fontWeight: 600,
                  '&:hover': { bgcolor: 'rgba(255,255,255,0.1)' } }}>
                Gérer les pages
              </Button>
            )}
            {!isEmployee && (
              <Button startIcon={<AddIcon />} onClick={() => navigate('/culture/suggestions/create')}
                sx={{ bgcolor: 'rgba(255,255,255,0.15)', color: 'white',
                  border: '1px solid rgba(255,255,255,0.25)', borderRadius: 2,
                  textTransform: 'none', fontWeight: 600,
                  '&:hover': { bgcolor: 'rgba(255,255,255,0.25)' } }}>
                Nouvelle suggestion
              </Button>
            )}
          </Box>
        </Box>
      </Card>

      {/* Stat cards */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        {[
          { label: 'Pages culture',       value: pages.length,   color: '#1976d2', icon: <CultureIcon /> },
          { label: 'Total suggestions',   value: suggestions.length, color: '#0891b2', icon: <SuggestionIcon /> },
          { label: 'En attente',          value: newCount,       color: '#f57c00', icon: <PendingIcon /> },
          { label: 'Répondues',           value: answeredCount,  color: '#2e7d32', icon: <AnsweredIcon /> },
        ].map((s, i) => (
          <Grid item xs={6} sm={3} key={i}>
            <Card elevation={0} sx={{ border: `1px solid ${s.color}20`, borderRadius: 3, height: '100%',
              transition: 'all 0.2s', '&:hover': { boxShadow: `0 4px 16px ${s.color}12` } }}>
              <CardContent sx={{ p: 2.5 }}>
                <Avatar sx={{ bgcolor: `${s.color}12`, width: 36, height: 36, mb: 1.5 }}>
                  {React.cloneElement(s.icon, { sx: { color: s.color, fontSize: 18 } })}
                </Avatar>
                {loading ? <Skeleton width={40} height={30} /> : (
                  <Typography variant="h4" fontWeight={800} sx={{ color: s.color, lineHeight: 1 }}>{s.value}</Typography>
                )}
                <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>{s.label}</Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Grid container spacing={3}>

        {/* Pages culture */}
        <Grid item xs={12} md={5}>
          <Card elevation={0} sx={{ borderRadius: 3, border: '1px solid #e8ecf0', overflow: 'hidden', height: '100%' }}>
            <NavHeader title="Pages de culture" icon={<CultureIcon />}
              action={isHR && (
                <Button size="small" endIcon={<ArrowIcon sx={{ fontSize: 13 }} />}
                  onClick={() => navigate('/culture/pages')}
                  sx={{ color: 'rgba(255,255,255,0.7)', textTransform: 'none', fontSize: '0.75rem',
                    '&:hover': { color: 'white' } }}>
                  Gérer
                </Button>
              )} />
            <CardContent sx={{ p: 2 }}>
              <Grid container spacing={1.5}>
                {PAGE_TYPES.map(pt => {
                  const existing = pages.find(p => p.page_type === pt.type);
                  return (
                    <Grid item xs={6} key={pt.type}>
                      <Box onClick={() => navigate(`/culture/pages/${pt.type}`)}
                        sx={{ p: 2, borderRadius: 2, cursor: 'pointer', textAlign: 'center',
                          border: `1px solid ${existing ? `${pt.color}25` : '#e8ecf0'}`,
                          bgcolor: existing ? pt.bg : '#f8fafc', transition: 'all 0.15s',
                          '&:hover': { bgcolor: pt.bg, borderColor: `${pt.color}40`,
                            transform: 'translateY(-2px)', boxShadow: `0 4px 12px ${pt.color}10` } }}>
                        <Avatar sx={{ bgcolor: `${pt.color}15`, width: 38, height: 38, mx: 'auto', mb: 1 }}>
                          {React.cloneElement(pt.icon, { sx: { color: pt.color, fontSize: 18 } })}
                        </Avatar>
                        <Typography sx={{ fontSize: '0.8rem', fontWeight: 700, color: '#1e293b', lineHeight: 1.2 }}>
                          {pt.title}
                        </Typography>
                        {existing ? (
                          <Typography variant="caption" sx={{ color: pt.color, mt: 0.3, display: 'block' }}>
                            Mis à jour
                          </Typography>
                        ) : (
                          <Typography variant="caption" sx={{ color: '#94a3b8', mt: 0.3, display: 'block' }}>
                            Non configuré
                          </Typography>
                        )}
                      </Box>
                    </Grid>
                  );
                })}
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* Suggestions récentes */}
        <Grid item xs={12} md={7}>
          <Card elevation={0} sx={{ borderRadius: 3, border: '1px solid #e8ecf0', overflow: 'hidden', height: '100%' }}>
            <NavHeader title="Suggestions récentes" icon={<SuggestionIcon />}
              action={
                <Button size="small" endIcon={<ArrowIcon sx={{ fontSize: 13 }} />}
                  onClick={() => navigate('/culture/suggestions')}
                  sx={{ color: 'rgba(255,255,255,0.7)', textTransform: 'none', fontSize: '0.75rem',
                    '&:hover': { color: 'white' } }}>
                  Voir tout
                </Button>
              } />

            <CardContent sx={{ p: 0 }}>
              {loading ? (
                <Box sx={{ p: 2 }}>{[1,2,3].map(i => <Skeleton key={i} height={64} sx={{ mb: 0.5, borderRadius: 2 }} />)}</Box>
              ) : suggestions.length === 0 ? (
                <Box sx={{ textAlign: 'center', py: 6 }}>
                  <SuggestionIcon sx={{ fontSize: 44, color: '#cbd5e1', mb: 1 }} />
                  <Typography variant="body2" color="text.secondary">Aucune suggestion pour le moment</Typography>
                  {!isEmployee && (
                    <Button startIcon={<AddIcon />} onClick={() => navigate('/culture/suggestions/create')}
                      sx={{ mt: 1.5, textTransform: 'none', fontWeight: 600 }}>
                      Soumettre une idée
                    </Button>
                  )}
                </Box>
              ) : (
                suggestions.slice(0, 5).map((sug, i) => {
                  const sc = STATUS[sug.status] || STATUS.new;
                  const name = sug.employee_name || '—';
                  return (
                    <React.Fragment key={sug.id}>
                      <Box sx={{ px: 2.5, py: 1.75, display: 'flex', alignItems: 'flex-start', gap: 1.5,
                        transition: 'background 0.15s', '&:hover': { bgcolor: '#f8fafc' } }}>
                        <Avatar sx={{ bgcolor: avatarColor(name), width: 34, height: 34,
                          fontSize: '0.78rem', fontWeight: 700, flexShrink: 0, mt: 0.25 }}>
                          {name[0]?.toUpperCase() || '?'}
                        </Avatar>
                        <Box sx={{ flex: 1, minWidth: 0 }}>
                          <Typography sx={{ fontSize: '0.875rem', fontWeight: 600, color: '#1e293b' }} noWrap>
                            {sug.title}
                          </Typography>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.3 }}>
                            <Typography variant="caption" color="text.secondary">{name}</Typography>
                            {sug.date && (
                              <>
                                <Typography sx={{ color: '#94a3b8', fontSize: '0.7rem' }}>·</Typography>
                                <Typography variant="caption" color="text.secondary">
                                  {format(new Date(sug.date), 'dd MMM yyyy', { locale: fr })}
                                </Typography>
                              </>
                            )}
                          </Box>
                        </Box>
                        <Chip label={sc.label} size="small"
                          sx={{ bgcolor: sc.bg, color: sc.color, fontWeight: 700, fontSize: '0.68rem',
                            height: 20, border: `1px solid ${sc.color}25`, flexShrink: 0 }} />
                      </Box>
                      {i < Math.min(suggestions.length, 5) - 1 && <Divider />}
                    </React.Fragment>
                  );
                })
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default CultureDashboard;
