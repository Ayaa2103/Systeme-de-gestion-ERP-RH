import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box, Card, CardContent, Typography, Button, Grid, Chip,
  IconButton, Menu, MenuItem, TextField, InputAdornment,
  CircularProgress, Divider,
} from '@mui/material';
import {
  Add as AddIcon,
  Work as WorkIcon,
  Search as SearchIcon,
  MoreVert as MoreVertIcon,
  Visibility as ViewIcon,
  Edit as EditIcon,
  Publish as PublishIcon,
  Close as CloseIcon,
  People as PeopleIcon,
  Assignment as DraftIcon,
  CheckCircle as PublishedIcon,
} from '@mui/icons-material';
import { getJobOffers, publishJobOffer, closeJobOffer } from '../../services/hrService';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

const statusConfig = {
  draft:     { label: 'Brouillon', color: '#e65100', bg: '#fff3e0' },
  published: { label: 'Publiée',   color: '#2e7d32', bg: '#e8f5e9' },
  closed:    { label: 'Fermée',    color: '#c62828', bg: '#ffebee' },
};

const expLabel = {
  junior:       'Junior (0-2 ans)',
  intermediate: 'Intermédiaire (2-5 ans)',
  senior:       'Senior (5+ ans)',
  expert:       'Expert (10+ ans)',
};

/* ── StatCard ─────────────────────────────────────────────────────── */
const StatCard = ({ title, value, icon, color, loading }) => (
  <Card elevation={0} sx={{
    border: '1px solid', borderColor: `${color}25`, borderRadius: 3,
    transition: 'all 0.3s ease',
    '&:hover': { boxShadow: `0 6px 20px ${color}18`, borderColor: `${color}45`, bgcolor: `${color}04` },
  }}>
    <CardContent sx={{ p: 2.5 }}>
      <Box sx={{ mb: 1.5 }}>
        <Box sx={{ p: 1, borderRadius: 2, bgcolor: `${color}12`, display: 'inline-flex' }}>
          {React.cloneElement(icon, { sx: { fontSize: 20, color } })}
        </Box>
      </Box>
      {loading ? (
        <Box sx={{ height: 48, display: 'flex', alignItems: 'center' }}>
          <CircularProgress size={20} sx={{ color }} />
        </Box>
      ) : (
        <>
          <Typography variant="h4" fontWeight={700} sx={{ color, lineHeight: 1 }}>{value}</Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5, fontSize: '0.8rem' }}>{title}</Typography>
        </>
      )}
    </CardContent>
  </Card>
);

/* ── Main ─────────────────────────────────────────────────────────── */
const JobOffersList = () => {
  const navigate = useNavigate();
  const [jobOffers, setJobOffers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedOffer, setSelectedOffer] = useState(null);

  useEffect(() => { fetchJobOffers(); }, []);

  const fetchJobOffers = async () => {
    try {
      const res = await getJobOffers();
      setJobOffers(res.data.results || res.data);
    } catch (_) {}
    finally { setLoading(false); }
  };

  const handlePublish = async (id) => {
    try { await publishJobOffer(id); await fetchJobOffers(); } catch (_) {}
    setAnchorEl(null);
  };

  const handleCloseOffer = async (id) => {
    try { await closeJobOffer(id); await fetchJobOffers(); } catch (_) {}
    setAnchorEl(null);
  };

  const filteredOffers = jobOffers.filter(o => {
    const q = searchTerm.toLowerCase();
    return (
      (!q || o.title?.toLowerCase().includes(q) || o.department?.toLowerCase().includes(q)) &&
      (!statusFilter || o.status === statusFilter)
    );
  });

  const published = jobOffers.filter(o => o.status === 'published').length;
  const drafts    = jobOffers.filter(o => o.status === 'draft').length;
  const totalApps = jobOffers.reduce((s, o) => s + (o.applications_count || 0), 0);

  return (
    <Box sx={{ width: '100%' }}>

      {/* ── Banner ── */}
      <Card elevation={0} sx={{ borderRadius: 3, border: '1px solid #e8ecf0', mb: 3, overflow: 'hidden' }}>
        <Box sx={{
          background: 'linear-gradient(135deg, #0f172a 0%, #1e3a5f 60%, #1e40af 100%)',
          px: 3, py: 2.5,
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        }}>
          <Box>
            <Typography variant="h5" fontWeight={700} color="white">Offres d'Emploi</Typography>
            <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.65)', mt: 0.3 }}>
              {jobOffers.length} offre{jobOffers.length !== 1 ? 's' : ''} au total
            </Typography>
          </Box>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => navigate('/job-offers/create')}
            sx={{
              bgcolor: 'rgba(255,255,255,0.15)', color: 'white',
              border: '1px solid rgba(255,255,255,0.25)',
              borderRadius: 2, textTransform: 'none', fontWeight: 600,
              backdropFilter: 'blur(8px)',
              '&:hover': { bgcolor: 'rgba(255,255,255,0.25)' },
            }}
          >
            Nouvelle Offre
          </Button>
        </Box>
      </Card>

      {/* ── StatCards ── */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={6} sm={3}>
          <StatCard title="Total Offres"  value={jobOffers.length} icon={<WorkIcon />}      color="#1976d2" loading={loading} />
        </Grid>
        <Grid item xs={6} sm={3}>
          <StatCard title="Publiées"      value={published}        icon={<PublishedIcon />} color="#2e7d32" loading={loading} />
        </Grid>
        <Grid item xs={6} sm={3}>
          <StatCard title="Brouillons"    value={drafts}           icon={<DraftIcon />}     color="#e65100" loading={loading} />
        </Grid>
        <Grid item xs={6} sm={3}>
          <StatCard title="Candidatures"  value={totalApps}        icon={<PeopleIcon />}    color="#7b1fa2" loading={loading} />
        </Grid>
      </Grid>

      {/* ── Filter bar ── */}
      <Card elevation={0} sx={{ border: '1px solid #e8ecf0', borderRadius: 3, mb: 3 }}>
        <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center' }}>
            <TextField
              placeholder="Rechercher par titre ou département…"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              size="small"
              sx={{ flex: 1, minWidth: 200, '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon sx={{ fontSize: 18, color: 'text.disabled' }} />
                  </InputAdornment>
                ),
              }}
            />
            <TextField
              select size="small"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              sx={{ width: 160, '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
              SelectProps={{ displayEmpty: true }}
            >
              <MenuItem value="">Tous les statuts</MenuItem>
              <MenuItem value="draft">Brouillon</MenuItem>
              <MenuItem value="published">Publiée</MenuItem>
              <MenuItem value="closed">Fermée</MenuItem>
            </TextField>
            <Typography variant="body2" color="text.secondary" sx={{ flexShrink: 0 }}>
              {filteredOffers.length} résultat{filteredOffers.length !== 1 ? 's' : ''}
            </Typography>
          </Box>
        </CardContent>
      </Card>

      {/* ── Offer cards / empty state ── */}
      {filteredOffers.length === 0 && !loading ? (
        <Card elevation={0} sx={{ border: '1px solid #e8ecf0', borderRadius: 3 }}>
          <CardContent sx={{ textAlign: 'center', py: 8 }}>
            <WorkIcon sx={{ fontSize: 56, color: 'text.disabled', mb: 1.5 }} />
            <Typography variant="h6" color="text.secondary">Aucune offre trouvée</Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
              {searchTerm || statusFilter
                ? 'Modifiez vos critères de recherche'
                : "Créez votre première offre d'emploi"}
            </Typography>
            {!searchTerm && !statusFilter && (
              <Button
                variant="contained" startIcon={<AddIcon />}
                onClick={() => navigate('/job-offers/create')}
                sx={{ mt: 2, borderRadius: 2, textTransform: 'none' }}
              >
                Créer une offre
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <Grid container spacing={2}>
          {filteredOffers.map((offer) => {
            const sc = statusConfig[offer.status] || { label: offer.status, color: '#757575', bg: '#f5f5f5' };
            return (
              <Grid item xs={12} md={6} key={offer.id}>
                <Card
                  elevation={0}
                  onClick={() => navigate(`/job-offers/${offer.id}`)}
                  sx={{
                    border: '1px solid #e8ecf0', borderRadius: 3, cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    '&:hover': { boxShadow: '0 4px 16px rgba(25,118,210,0.12)', borderColor: '#1976d230' },
                  }}
                >
                  <CardContent sx={{ p: 2.5 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <Box sx={{ flex: 1, minWidth: 0 }}>
                        <Box sx={{ display: 'flex', gap: 1, mb: 1, flexWrap: 'wrap' }}>
                          <Chip
                            label={sc.label} size="small"
                            sx={{ bgcolor: sc.bg, color: sc.color, fontWeight: 600, fontSize: '0.7rem', border: `1px solid ${sc.color}30` }}
                          />
                          {offer.experience_level && (
                            <Chip
                              label={expLabel[offer.experience_level] || offer.experience_level}
                              size="small" variant="outlined"
                              sx={{ fontSize: '0.7rem' }}
                            />
                          )}
                        </Box>
                        <Typography variant="subtitle1" fontWeight={700} noWrap>{offer.title}</Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                          {offer.department || '—'}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{
                          overflow: 'hidden', display: '-webkit-box',
                          WebkitLineClamp: 2, WebkitBoxOrient: 'vertical',
                          fontSize: '0.8rem', mb: 1.5,
                        }}>
                          {offer.description}
                        </Typography>
                      </Box>
                      <IconButton
                        size="small" sx={{ ml: 1, flexShrink: 0 }}
                        onClick={(e) => { e.stopPropagation(); setAnchorEl(e.currentTarget); setSelectedOffer(offer); }}
                      >
                        <MoreVertIcon fontSize="small" />
                      </IconButton>
                    </Box>

                    <Divider sx={{ mb: 1.5 }} />
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <PeopleIcon sx={{ fontSize: 15, color: 'text.disabled' }} />
                        <Typography variant="caption" color="text.secondary" fontWeight={500}>
                          {offer.applications_count || 0} candidature{(offer.applications_count || 0) !== 1 ? 's' : ''}
                        </Typography>
                      </Box>
                      {offer.created_at && (
                        <Typography variant="caption" color="text.disabled">
                          {format(new Date(offer.created_at), 'dd MMM yyyy', { locale: fr })}
                        </Typography>
                      )}
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            );
          })}
        </Grid>
      )}

      {/* ── Context menu ── */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={() => setAnchorEl(null)}
        PaperProps={{ elevation: 0, sx: { border: '1px solid #e8ecf0', borderRadius: 2, minWidth: 160 } }}
      >
        <MenuItem
          onClick={() => { navigate(`/job-offers/${selectedOffer?.id}`); setAnchorEl(null); }}
          sx={{ fontSize: '0.875rem' }}
        >
          <ViewIcon sx={{ mr: 1.5, fontSize: 18 }} />Voir détails
        </MenuItem>
        <MenuItem onClick={() => setAnchorEl(null)} sx={{ fontSize: '0.875rem' }}>
          <EditIcon sx={{ mr: 1.5, fontSize: 18 }} />Modifier
        </MenuItem>
        {selectedOffer?.status === 'draft' && (
          <MenuItem onClick={() => handlePublish(selectedOffer.id)} sx={{ fontSize: '0.875rem', color: '#2e7d32' }}>
            <PublishIcon sx={{ mr: 1.5, fontSize: 18 }} />Publier
          </MenuItem>
        )}
        {selectedOffer?.status === 'published' && (
          <MenuItem onClick={() => handleCloseOffer(selectedOffer.id)} sx={{ fontSize: '0.875rem', color: '#c62828' }}>
            <CloseIcon sx={{ mr: 1.5, fontSize: 18 }} />Fermer
          </MenuItem>
        )}
      </Menu>

    </Box>
  );
};

export default JobOffersList;
