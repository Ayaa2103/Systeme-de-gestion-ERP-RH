import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box, Card, CardContent, Typography, Button, Grid, Avatar,
  Chip, Skeleton, TextField, InputAdornment,
} from '@mui/material';
import {
  HowToReg as RecommendIcon,
  Work as WorkIcon,
  Search as SearchIcon,
  ArrowBack as BackIcon,
  Business as DeptIcon,
  ArrowForward as ArrowIcon,
} from '@mui/icons-material';
import api from '../../services/api';

const expLabel = {
  junior:       'Junior',
  intermediate: 'Intermédiaire',
  senior:       'Senior',
  expert:       'Expert',
};

const EmployeeRecommend = () => {
  const navigate = useNavigate();
  const [offers,   setOffers]   = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [search,   setSearch]   = useState('');

  useEffect(() => {
    api.get('/recruitment/public-jobs/')
      .then(r => setOffers(Array.isArray(r.data) ? r.data : r.data?.results || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const filtered = offers.filter(o => {
    const q = search.toLowerCase();
    return !q || o.title?.toLowerCase().includes(q) || o.department?.toLowerCase().includes(q);
  });

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
              <RecommendIcon sx={{ fontSize: 22, color: 'white' }} />
            </Box>
            <Box>
              <Typography variant="h5" fontWeight={700} color="white">Recommander un profil</Typography>
              <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.65)', mt: 0.3 }}>
                Choisissez un poste puis recommandez un candidat
              </Typography>
            </Box>
          </Box>
          <Chip label={`${offers.length} offre${offers.length !== 1 ? 's' : ''} active${offers.length !== 1 ? 's' : ''}`}
            sx={{ bgcolor: 'rgba(255,255,255,0.15)', color: 'white', fontWeight: 700, border: '1px solid rgba(255,255,255,0.25)' }} />
        </Box>
      </Card>

      {/* Search */}
      <Card elevation={0} sx={{ border: '1px solid #e8ecf0', borderRadius: 3, mb: 3 }}>
        <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
          <TextField placeholder="Rechercher par titre ou département…" value={search}
            onChange={e => setSearch(e.target.value)} size="small" fullWidth
            sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
            InputProps={{ startAdornment: <InputAdornment position="start"><SearchIcon sx={{ fontSize: 17, color: '#94a3b8' }} /></InputAdornment> }} />
        </CardContent>
      </Card>

      {/* Liste des offres */}
      {loading ? (
        <Grid container spacing={2}>
          {[1,2,3,4].map(i => <Grid item xs={12} sm={6} key={i}><Skeleton variant="rounded" height={140} sx={{ borderRadius: 3 }} /></Grid>)}
        </Grid>
      ) : filtered.length === 0 ? (
        <Card elevation={0} sx={{ borderRadius: 3, border: '2px dashed #e8ecf0' }}>
          <CardContent sx={{ textAlign: 'center', py: 7 }}>
            <WorkIcon sx={{ fontSize: 44, color: '#cbd5e1', mb: 1 }} />
            <Typography variant="body2" color="text.secondary">
              {search ? 'Aucune offre ne correspond à votre recherche' : 'Aucune offre active pour le moment'}
            </Typography>
          </CardContent>
        </Card>
      ) : (
        <Grid container spacing={2}>
          {filtered.map(offer => (
            <Grid item xs={12} sm={6} key={offer.id}>
              <Card elevation={0} sx={{ borderRadius: 3, border: '1px solid #e8ecf0',
                borderLeft: '4px solid #0891b2', height: '100%',
                transition: 'all 0.2s', '&:hover': { boxShadow: '0 6px 24px rgba(8,145,178,0.12)', transform: 'translateY(-2px)' } }}>
                <CardContent sx={{ p: 2.5, display: 'flex', flexDirection: 'column', gap: 1.5, height: '100%' }}>
                  <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5 }}>
                    <Avatar sx={{ bgcolor: '#ecfeff', width: 40, height: 40, borderRadius: 2, flexShrink: 0 }}>
                      <WorkIcon sx={{ color: '#0891b2', fontSize: 20 }} />
                    </Avatar>
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      <Typography sx={{ fontSize: '0.95rem', fontWeight: 700, color: '#1e293b', lineHeight: 1.3 }}>
                        {offer.title}
                      </Typography>
                      {offer.department && (
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 0.3 }}>
                          <DeptIcon sx={{ fontSize: 13, color: '#94a3b8' }} />
                          <Typography variant="caption" color="text.secondary">{offer.department}</Typography>
                        </Box>
                      )}
                    </Box>
                  </Box>

                  <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                    {offer.experience_level && (
                      <Chip label={expLabel[offer.experience_level] || offer.experience_level} size="small"
                        sx={{ bgcolor: '#e3f2fd', color: '#1565c0', fontWeight: 600, fontSize: '0.7rem', height: 22 }} />
                    )}
                    <Chip label="Publiée" size="small"
                      sx={{ bgcolor: '#e8f5e9', color: '#2e7d32', fontWeight: 600, fontSize: '0.7rem', height: 22 }} />
                  </Box>

                  {offer.description && (
                    <Typography sx={{ fontSize: '0.78rem', color: '#64748b', lineHeight: 1.6, flex: 1,
                      overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
                      {offer.description}
                    </Typography>
                  )}

                  <Button variant="contained" endIcon={<ArrowIcon sx={{ fontSize: 16 }} />}
                    onClick={() => navigate(`/employee/recommend/${offer.id}`)}
                    sx={{ alignSelf: 'flex-start', borderRadius: 2, textTransform: 'none', fontWeight: 600,
                      fontSize: '0.82rem', bgcolor: '#0891b2', '&:hover': { bgcolor: '#0e7490' }, py: 0.75, px: 1.75 }}>
                    Recommander un profil
                  </Button>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
    </Box>
  );
};

export default EmployeeRecommend;
