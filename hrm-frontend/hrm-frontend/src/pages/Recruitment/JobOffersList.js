import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box, Card, CardContent, Typography, Button, Grid, Chip, Avatar,
  IconButton, Menu, MenuItem, TextField, InputAdornment,
  Table, TableHead, TableBody, TableRow, TableCell, TableContainer,
  Pagination, Skeleton, Tooltip, Divider,
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
  ArrowBack as BackIcon,
  CheckCircle as PublishedIcon,
  Assignment as DraftIcon,
  TuneOutlined as FilterIcon,
  Delete as DeleteIcon,
} from '@mui/icons-material';
import { getJobOffers, publishJobOffer, closeJobOffer, deleteJobOffer } from '../../services/hrService';
import { useAuth } from '../../contexts/AuthContext';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

const PER_PAGE = 10;

const statusConfig = {
  draft:     { label: 'Brouillon', color: '#e65100', bg: '#fff3e0' },
  published: { label: 'Publiée',   color: '#2e7d32', bg: '#e8f5e9' },
  closed:    { label: 'Fermée',    color: '#757575', bg: '#f5f5f5' },
};

const expLabel = {
  junior:       'Junior',
  intermediate: 'Intermédiaire',
  senior:       'Senior',
  expert:       'Expert',
};

const colSx = {
  fontSize: '0.7rem', fontWeight: 700, color: '#475569',
  textTransform: 'uppercase', letterSpacing: '0.5px',
  bgcolor: '#f8fafc', borderBottom: '2px solid #e8ecf0',
  py: 1.25, px: 2,
};

/* ── StatCard ────────────────────────────────────────────────────── */
const StatCard = ({ label, value, icon, color, active, onClick, loading }) => (
  <Card elevation={0} onClick={onClick}
    sx={{ border: `1px solid ${active ? color : `${color}20`}`, borderRadius: 3, height: '100%',
      cursor: 'pointer', transition: 'all 0.2s',
      bgcolor: active ? `${color}06` : 'white',
      '&:hover': { boxShadow: `0 4px 16px ${color}15`, borderColor: `${color}45` } }}>
    <CardContent sx={{ p: 2.5 }}>
      <Avatar sx={{ bgcolor: `${color}12`, width: 36, height: 36, mb: 1.5 }}>
        {React.cloneElement(icon, { sx: { color, fontSize: 18 } })}
      </Avatar>
      {loading ? <Skeleton width={40} height={32} /> : (
        <Typography variant="h4" fontWeight={800} sx={{ color, lineHeight: 1 }}>{value}</Typography>
      )}
      <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>{label}</Typography>
    </CardContent>
  </Card>
);

/* ── Main ────────────────────────────────────────────────────────── */
const JobOffersList = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const isAdmin = user?.role === 'administrator';

  const [jobOffers, setJobOffers]       = useState([]);
  const [loading, setLoading]           = useState(true);
  const [searchTerm, setSearchTerm]     = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage]                 = useState(1);
  const [anchorEl, setAnchorEl]         = useState(null);
  const [selectedOffer, setSelectedOffer] = useState(null);

  useEffect(() => { fetchJobOffers(); }, []);

  const fetchJobOffers = async () => {
    setLoading(true);
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

  const handleDelete = async (id) => {
    if (!window.confirm('Supprimer cette offre définitivement ?')) return;
    try { await deleteJobOffer(id); await fetchJobOffers(); } catch (_) {}
    setAnchorEl(null);
  };

  const published  = jobOffers.filter(o => o.status === 'published').length;
  const drafts     = jobOffers.filter(o => o.status === 'draft').length;
  const closed     = jobOffers.filter(o => o.status === 'closed').length;
  const totalApps  = jobOffers.reduce((s, o) => s + (o.applications_count || 0), 0);

  const filtered = useMemo(() => {
    const q = searchTerm.toLowerCase();
    return jobOffers.filter(o =>
      (!q || o.title?.toLowerCase().includes(q) || o.department?.toLowerCase().includes(q)) &&
      (!statusFilter || o.status === statusFilter)
    );
  }, [jobOffers, searchTerm, statusFilter]);

  const pages   = Math.ceil(filtered.length / PER_PAGE) || 1;
  const paged   = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  const handleFilter = (val) => {
    setStatusFilter(prev => prev === val ? '' : val);
    setPage(1);
  };

  const handleSearch = (v) => { setSearchTerm(v); setPage(1); };

  return (
    <Box sx={{ width: '100%' }}>

      {/* ── Banner ── */}
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
              <WorkIcon sx={{ fontSize: 22, color: 'white' }} />
            </Box>
            <Box>
              <Typography variant="h5" fontWeight={700} color="white">Offres d'Emploi</Typography>
              <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.65)', mt: 0.3 }}>
                {jobOffers.length} offre{jobOffers.length !== 1 ? 's' : ''} · {totalApps} candidature{totalApps !== 1 ? 's' : ''}
              </Typography>
            </Box>
          </Box>
          {!isAdmin && (
            <Button startIcon={<AddIcon />} onClick={() => navigate('/job-offers/create')}
              sx={{ bgcolor: 'rgba(255,255,255,0.15)', color: 'white',
                border: '1px solid rgba(255,255,255,0.25)', borderRadius: 2,
                textTransform: 'none', fontWeight: 600, backdropFilter: 'blur(8px)',
                '&:hover': { bgcolor: 'rgba(255,255,255,0.25)' } }}>
              Nouvelle offre
            </Button>
          )}
        </Box>
      </Card>

      {/* ── Stats (cliquables = filtre rapide) ── */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={6} sm={3}>
          <StatCard label="Total" value={jobOffers.length} icon={<WorkIcon />} color="#1976d2"
            active={statusFilter === ''} onClick={() => handleFilter('')} loading={loading} />
        </Grid>
        <Grid item xs={6} sm={3}>
          <StatCard label="Publiées" value={published} icon={<PublishedIcon />} color="#2e7d32"
            active={statusFilter === 'published'} onClick={() => handleFilter('published')} loading={loading} />
        </Grid>
        <Grid item xs={6} sm={3}>
          <StatCard label="Brouillons" value={drafts} icon={<DraftIcon />} color="#e65100"
            active={statusFilter === 'draft'} onClick={() => handleFilter('draft')} loading={loading} />
        </Grid>
        <Grid item xs={6} sm={3}>
          <StatCard label="Candidatures reçues" value={totalApps} icon={<PeopleIcon />} color="#7b1fa2"
            active={false} onClick={() => navigate('/recruitment/applications')} loading={loading} />
        </Grid>
      </Grid>

      {/* ── Search + filter ── */}
      <Card elevation={0} sx={{ border: '1px solid #e8ecf0', borderRadius: 3, mb: 3 }}>
        <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center' }}>
            <TextField placeholder="Rechercher par titre ou département…" value={searchTerm}
              onChange={(e) => handleSearch(e.target.value)} size="small"
              sx={{ flex: 1, minWidth: 220, '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
              InputProps={{ startAdornment: <InputAdornment position="start"><SearchIcon sx={{ fontSize: 17, color: '#94a3b8' }} /></InputAdornment> }} />

            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
              {[
                { val: '',          label: 'Tous' },
                { val: 'published', label: 'Publiées' },
                { val: 'draft',     label: 'Brouillons' },
                { val: 'closed',    label: 'Fermées' },
              ].map(f => {
                const active = statusFilter === f.val;
                const sc = f.val ? statusConfig[f.val] : null;
                return (
                  <Box key={f.val} onClick={() => handleFilter(f.val)}
                    sx={{ px: 1.5, py: 0.5, borderRadius: 50, cursor: 'pointer', fontSize: '0.78rem', fontWeight: active ? 700 : 500,
                      border: `1px solid ${active ? (sc?.color || '#1976d2') : '#e8ecf0'}`,
                      bgcolor: active ? (sc?.bg || '#eff6ff') : 'white',
                      color: active ? (sc?.color || '#1976d2') : '#475569',
                      transition: 'all 0.15s', userSelect: 'none',
                      '&:hover': { borderColor: sc?.color || '#1976d2' } }}>
                    {f.label}
                  </Box>
                );
              })}
            </Box>

            <Chip label={`${filtered.length} résultat${filtered.length !== 1 ? 's' : ''}`} size="small"
              sx={{ bgcolor: '#eff6ff', color: '#1976d2', fontWeight: 600, border: '1px solid #bfdbfe' }} />
          </Box>
        </CardContent>
      </Card>

      {/* ── Table ── */}
      <Card elevation={0} sx={{ border: '1px solid #e8ecf0', borderRadius: 3, overflow: 'hidden' }}>
        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell sx={colSx}>Offre</TableCell>
                <TableCell sx={colSx}>Expérience</TableCell>
                <TableCell sx={colSx}>Statut</TableCell>
                <TableCell sx={{ ...colSx, textAlign: 'center' }}>Candidatures</TableCell>
                <TableCell sx={colSx}>Date</TableCell>
                <TableCell sx={{ ...colSx, textAlign: 'right' }}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i}>
                    {Array.from({ length: 6 }).map((_, j) => (
                      <TableCell key={j} sx={{ py: 1.5, px: 2 }}>
                        <Skeleton height={20} sx={{ borderRadius: 1 }} />
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : paged.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} sx={{ textAlign: 'center', py: 6 }}>
                    <WorkIcon sx={{ fontSize: 44, color: '#cbd5e1', display: 'block', mx: 'auto', mb: 1 }} />
                    <Typography variant="body2" color="text.secondary">
                      {searchTerm || statusFilter ? 'Aucun résultat pour ces critères' : 'Aucune offre disponible'}
                    </Typography>
                    {!isAdmin && !searchTerm && !statusFilter && (
                      <Button startIcon={<AddIcon />} onClick={() => navigate('/job-offers/create')}
                        sx={{ mt: 1.5, textTransform: 'none', fontWeight: 600 }}>
                        Créer une offre
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ) : (
                paged.map((offer) => {
                  const sc = statusConfig[offer.status] || statusConfig.draft;
                  return (
                    <TableRow key={offer.id} hover
                      onClick={() => navigate(`/job-offers/${offer.id}`)}
                      sx={{ cursor: 'pointer', '&:last-child td': { border: 0 },
                        '& td': { borderBottom: '1px solid #f1f5f9' } }}>

                      {/* Offre */}
                      <TableCell sx={{ py: 1.5, px: 2 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                          <Avatar sx={{ bgcolor: `${sc.color}12`, width: 34, height: 34, borderRadius: 1.5 }}>
                            <WorkIcon sx={{ color: sc.color, fontSize: 16 }} />
                          </Avatar>
                          <Box>
                            <Typography sx={{ fontSize: '0.875rem', fontWeight: 600, color: '#1e293b' }}>
                              {offer.title}
                            </Typography>
                            {offer.department && (
                              <Typography variant="caption" color="text.secondary">{offer.department}</Typography>
                            )}
                          </Box>
                        </Box>
                      </TableCell>

                      {/* Expérience */}
                      <TableCell sx={{ py: 1.5, px: 2 }}>
                        <Typography sx={{ fontSize: '0.8rem', color: '#475569' }}>
                          {expLabel[offer.experience_level] || offer.experience_level || '—'}
                        </Typography>
                      </TableCell>

                      {/* Statut */}
                      <TableCell sx={{ py: 1.5, px: 2 }}>
                        <Chip label={sc.label} size="small"
                          sx={{ bgcolor: sc.bg, color: sc.color, fontWeight: 700, fontSize: '0.7rem',
                            height: 22, border: `1px solid ${sc.color}30` }} />
                      </TableCell>

                      {/* Candidatures */}
                      <TableCell sx={{ py: 1.5, px: 2, textAlign: 'center' }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0.5 }}>
                          <PeopleIcon sx={{ fontSize: 14, color: '#94a3b8' }} />
                          <Typography sx={{ fontSize: '0.875rem', fontWeight: 600, color: '#475569' }}>
                            {offer.applications_count ?? 0}
                          </Typography>
                        </Box>
                      </TableCell>

                      {/* Date */}
                      <TableCell sx={{ py: 1.5, px: 2 }}>
                        <Typography sx={{ fontSize: '0.8rem', color: '#64748b' }}>
                          {offer.created_at ? format(new Date(offer.created_at), 'dd MMM yyyy', { locale: fr }) : '—'}
                        </Typography>
                      </TableCell>

                      {/* Actions */}
                      <TableCell sx={{ py: 1.5, px: 2 }} onClick={e => e.stopPropagation()}>
                        <Box sx={{ display: 'flex', gap: 0.5, justifyContent: 'flex-end' }}>
                          <Tooltip title="Voir">
                            <IconButton size="small" onClick={() => navigate(`/job-offers/${offer.id}`)}
                              sx={{ color: '#1976d2', bgcolor: '#eff6ff', borderRadius: 1.5, width: 28, height: 28,
                                '&:hover': { bgcolor: '#dbeafe' } }}>
                              <ViewIcon sx={{ fontSize: 14 }} />
                            </IconButton>
                          </Tooltip>
                          {!isAdmin && (
                            <Tooltip title="Plus d'actions">
                              <IconButton size="small"
                                onClick={(e) => { setAnchorEl(e.currentTarget); setSelectedOffer(offer); }}
                                sx={{ color: '#475569', bgcolor: '#f8fafc', borderRadius: 1.5, width: 28, height: 28,
                                  '&:hover': { bgcolor: '#f1f5f9' } }}>
                                <MoreVertIcon sx={{ fontSize: 14 }} />
                              </IconButton>
                            </Tooltip>
                          )}
                        </Box>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </TableContainer>

        {/* Pagination */}
        {!loading && filtered.length > PER_PAGE && (
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            px: 2.5, py: 1.5, borderTop: '1px solid #f1f5f9' }}>
            <Typography sx={{ fontSize: '0.75rem', color: '#64748b' }}>
              {(page - 1) * PER_PAGE + 1}–{Math.min(page * PER_PAGE, filtered.length)} sur {filtered.length}
            </Typography>
            <Pagination count={pages} page={page} onChange={(_, v) => setPage(v)}
              size="small" shape="rounded"
              sx={{ '& .MuiPaginationItem-root': { fontSize: '0.75rem', minWidth: 28, height: 28 } }} />
          </Box>
        )}
      </Card>

      {/* ── Context menu ── */}
      <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={() => setAnchorEl(null)}
        PaperProps={{ elevation: 0, sx: { border: '1px solid #e8ecf0', borderRadius: 2, minWidth: 170 } }}>
        <MenuItem onClick={() => { navigate(`/job-offers/${selectedOffer?.id}`); setAnchorEl(null); }}
          sx={{ fontSize: '0.875rem', gap: 1.5 }}>
          <ViewIcon sx={{ fontSize: 17, color: '#1976d2' }} /> Voir les détails
        </MenuItem>
        <MenuItem onClick={() => { navigate(`/job-offers/${selectedOffer?.id}/edit`); setAnchorEl(null); }}
          sx={{ fontSize: '0.875rem', gap: 1.5 }}>
          <EditIcon sx={{ fontSize: 17, color: '#475569' }} /> Modifier
        </MenuItem>
        <Divider />
        {selectedOffer?.status === 'draft' && (
          <MenuItem onClick={() => handlePublish(selectedOffer.id)}
            sx={{ fontSize: '0.875rem', gap: 1.5, color: '#2e7d32' }}>
            <PublishIcon sx={{ fontSize: 17 }} /> Publier l'offre
          </MenuItem>
        )}
        {selectedOffer?.status === 'published' && (
          <MenuItem onClick={() => handleCloseOffer(selectedOffer.id)}
            sx={{ fontSize: '0.875rem', gap: 1.5, color: '#c62828' }}>
            <CloseIcon sx={{ fontSize: 17 }} /> Fermer l'offre
          </MenuItem>
        )}
        {(isAdmin || user?.role === 'hr_manager') && (
          <>
            <Divider />
            <MenuItem onClick={() => handleDelete(selectedOffer?.id)}
              sx={{ fontSize: '0.875rem', gap: 1.5, color: '#c62828' }}>
              <DeleteIcon sx={{ fontSize: 17 }} /> Supprimer l'offre
            </MenuItem>
          </>
        )}
      </Menu>

    </Box>
  );
};

export default JobOffersList;
