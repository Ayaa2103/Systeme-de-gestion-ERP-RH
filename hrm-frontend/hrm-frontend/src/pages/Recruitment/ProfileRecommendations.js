import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box, Card, CardContent, Typography, Button, Grid, Chip, Avatar,
  Divider, IconButton, Menu, MenuItem, Dialog, DialogContent,
  DialogActions, TextField, InputAdornment, Skeleton,
  Snackbar, Alert, Tooltip,
} from '@mui/material';
import {
  HowToReg as RecommendIcon,
  Person as PersonIcon,
  Work as WorkIcon,
  MoreVert as MoreVertIcon,
  CheckCircle as ContactedIcon,
  Cancel as RejectIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  Search as SearchIcon,
  ArrowBack as BackIcon,
  Close as CloseIcon,
  Groups as GroupsIcon,
  Schedule as PendingIcon,
  Visibility as ViewIcon,
} from '@mui/icons-material';
import { getProfileRecommendations, updateRecommendationStatus } from '../../services/hrService';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

const STATUS = {
  pending:   { label: 'En attente', color: '#f57c00', bg: '#fff8e1' },
  contacted: { label: 'Contacté',   color: '#0288d1', bg: '#e1f5fe' },
  rejected:  { label: 'Rejeté',     color: '#c62828', bg: '#ffebee' },
};

const COLORS = ['#1976d2','#388e3c','#d32f2f','#7b1fa2','#f57c00','#0097a7','#c2185b','#5d4037'];
const avatarColor = (name = '') => COLORS[(name.charCodeAt(0) || 0) % COLORS.length];

const NavHeader = ({ title, icon }) => (
  <Box sx={{ background: 'linear-gradient(135deg,#0f172a,#1e3a5f,#1e40af)',
    px: 2.5, py: 1.5, display: 'flex', alignItems: 'center', gap: 1.5 }}>
    <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.12)', width: 28, height: 28, borderRadius: 1.5 }}>
      {React.cloneElement(icon, { sx: { fontSize: 14, color: 'white' } })}
    </Avatar>
    <Typography sx={{ color: 'white', fontWeight: 700, fontSize: '0.88rem' }}>{title}</Typography>
  </Box>
);

const ProfileRecommendations = () => {
  const navigate = useNavigate();

  const [recs,       setRecs]       = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [search,     setSearch]     = useState('');
  const [filter,     setFilter]     = useState('');
  const [anchorEl,   setAnchorEl]   = useState(null);
  const [selected,   setSelected]   = useState(null);
  const [detail,     setDetail]     = useState(false);
  const [snack,      setSnack]      = useState({ open: false, msg: '', severity: 'success' });

  useEffect(() => { load(); }, []);

  const load = async () => {
    setLoading(true);
    try {
      const res = await getProfileRecommendations();
      setRecs(res.data.results || res.data);
    } catch (_) {}
    finally { setLoading(false); }
  };

  const handleStatus = async (id, status) => {
    try {
      await updateRecommendationStatus(id, { status });
      setSnack({ open: true, msg: `Statut mis à jour : ${STATUS[status]?.label}`, severity: 'success' });
      load();
    } catch (_) {
      setSnack({ open: true, msg: 'Erreur lors de la mise à jour', severity: 'error' });
    }
    setAnchorEl(null);
    setDetail(false);
  };

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return recs.filter(r =>
      (!q || `${r.candidate_name} ${r.job_offer_title} ${r.recommended_by_name}`.toLowerCase().includes(q)) &&
      (!filter || r.status === filter)
    );
  }, [recs, search, filter]);

  const counts = {
    total:     recs.length,
    pending:   recs.filter(r => r.status === 'pending').length,
    contacted: recs.filter(r => r.status === 'contacted').length,
    rejected:  recs.filter(r => r.status === 'rejected').length,
  };

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
              <Typography variant="h5" fontWeight={700} color="white">Recommandations de profils</Typography>
              <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.65)', mt: 0.3 }}>
                Profils recommandés par les employés pour les postes ouverts
              </Typography>
            </Box>
          </Box>
          {/* Mini stats */}
          <Box sx={{ display: 'flex', gap: 2.5 }}>
            {[
              { label: 'En attente', value: counts.pending,   color: '#fbbf24' },
              { label: 'Contactés',  value: counts.contacted, color: '#60a5fa' },
            ].map(s => (
              <Box key={s.label} sx={{ textAlign: 'center' }}>
                <Typography sx={{ fontSize: '1.3rem', fontWeight: 800, color: s.color, lineHeight: 1 }}>{s.value}</Typography>
                <Typography sx={{ fontSize: '0.68rem', color: 'rgba(255,255,255,0.5)', mt: 0.2 }}>{s.label}</Typography>
              </Box>
            ))}
          </Box>
        </Box>
      </Card>

      {/* Stat cards */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        {[
          { label: 'Total',      value: counts.total,     color: '#1976d2', key: '' },
          { label: 'En attente', value: counts.pending,   color: '#f57c00', key: 'pending' },
          { label: 'Contactés',  value: counts.contacted, color: '#0288d1', key: 'contacted' },
          { label: 'Rejetés',    value: counts.rejected,  color: '#c62828', key: 'rejected' },
        ].map(s => {
          const active = filter === s.key;
          return (
            <Grid item xs={6} sm={3} key={s.key}>
              <Card elevation={0} onClick={() => setFilter(p => p === s.key ? '' : s.key)}
                sx={{ border: `1px solid ${active ? s.color : `${s.color}20`}`, borderRadius: 3,
                  cursor: 'pointer', transition: 'all 0.2s', bgcolor: active ? `${s.color}06` : 'white',
                  '&:hover': { boxShadow: `0 4px 16px ${s.color}15`, borderColor: `${s.color}45` } }}>
                <CardContent sx={{ p: 2 }}>
                  <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: s.color, mb: 1 }} />
                  {loading ? <Skeleton width={40} height={30} /> : (
                    <Typography variant="h4" fontWeight={800} sx={{ color: s.color, lineHeight: 1 }}>{s.value}</Typography>
                  )}
                  <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>{s.label}</Typography>
                </CardContent>
              </Card>
            </Grid>
          );
        })}
      </Grid>

      {/* Search + filter pills */}
      <Card elevation={0} sx={{ border: '1px solid #e8ecf0', borderRadius: 3, mb: 3 }}>
        <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center' }}>
            <TextField placeholder="Rechercher par candidat, poste, recommandant…" value={search}
              onChange={e => setSearch(e.target.value)} size="small"
              sx={{ flex: 1, minWidth: 220, '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
              InputProps={{ startAdornment: <InputAdornment position="start"><SearchIcon sx={{ fontSize: 17, color: '#94a3b8' }} /></InputAdornment> }} />
            <Box sx={{ display: 'flex', gap: 1 }}>
              {[{ val: '', label: 'Tous' }, ...Object.entries(STATUS).map(([k, v]) => ({ val: k, label: v.label }))].map(f => {
                const active = filter === f.val;
                const sc = f.val ? STATUS[f.val] : null;
                return (
                  <Box key={f.val} onClick={() => setFilter(p => p === f.val ? '' : f.val)}
                    sx={{ px: 1.5, py: 0.4, borderRadius: 50, cursor: 'pointer', fontSize: '0.78rem',
                      fontWeight: active ? 700 : 500, userSelect: 'none', transition: 'all 0.15s',
                      border: `1px solid ${active ? (sc?.color || '#1976d2') : '#e8ecf0'}`,
                      bgcolor: active ? (sc?.bg || '#eff6ff') : 'white',
                      color: active ? (sc?.color || '#1976d2') : '#475569',
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

      {/* Liste */}
      {loading ? (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {[1,2,3].map(i => <Skeleton key={i} variant="rounded" height={120} sx={{ borderRadius: 3 }} />)}
        </Box>
      ) : filtered.length === 0 ? (
        <Card elevation={0} sx={{ border: '1px solid #e8ecf0', borderRadius: 3 }}>
          <CardContent sx={{ textAlign: 'center', py: 7 }}>
            <RecommendIcon sx={{ fontSize: 48, color: '#cbd5e1', mb: 1.5 }} />
            <Typography variant="body1" fontWeight={600} color="text.secondary">Aucune recommandation</Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
              {search || filter ? 'Aucun résultat pour ces critères' : 'Aucune recommandation reçue pour le moment'}
            </Typography>
          </CardContent>
        </Card>
      ) : (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {filtered.map(rec => {
            const sc = STATUS[rec.status] || STATUS.pending;
            const candidateName = rec.candidate_name || '—';
            return (
              <Card key={rec.id} elevation={0}
                sx={{ border: '1px solid #e8ecf0', borderLeft: `4px solid ${sc.color}`,
                  borderRadius: 3, transition: 'all 0.2s',
                  '&:hover': { boxShadow: `0 4px 20px ${sc.color}10`, borderColor: `${sc.color}40` } }}>
                <CardContent sx={{ p: 2.5 }}>
                  <Box sx={{ display: 'flex', gap: 2, alignItems: 'flex-start' }}>

                    {/* Avatar candidat */}
                    <Avatar sx={{ bgcolor: avatarColor(candidateName), width: 46, height: 46,
                      fontSize: '1rem', fontWeight: 700, flexShrink: 0 }}>
                      {candidateName[0]?.toUpperCase() || '?'}
                    </Avatar>

                    {/* Infos */}
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 1 }}>
                        <Box>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.4 }}>
                            <Typography sx={{ fontSize: '0.95rem', fontWeight: 700, color: '#1e293b' }}>
                              {candidateName}
                            </Typography>
                            <Chip label={sc.label} size="small"
                              sx={{ bgcolor: sc.bg, color: sc.color, fontWeight: 700, fontSize: '0.68rem',
                                height: 20, border: `1px solid ${sc.color}30` }} />
                          </Box>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                            <WorkIcon sx={{ fontSize: 13, color: '#94a3b8' }} />
                            <Typography variant="caption" sx={{ color: '#475569', fontWeight: 500 }}>
                              {rec.job_offer_title || '—'}
                            </Typography>
                          </Box>
                        </Box>

                        {/* Actions + menu */}
                        <Box sx={{ display: 'flex', gap: 0.75, alignItems: 'center', flexShrink: 0 }}>
                          <Tooltip title="Voir les détails">
                            <IconButton size="small"
                              onClick={() => { setSelected(rec); setDetail(true); }}
                              sx={{ color: '#1976d2', bgcolor: '#eff6ff', borderRadius: 1.5, width: 28, height: 28,
                                '&:hover': { bgcolor: '#dbeafe' } }}>
                              <ViewIcon sx={{ fontSize: 14 }} />
                            </IconButton>
                          </Tooltip>
                          <IconButton size="small"
                            onClick={e => { setAnchorEl(e.currentTarget); setSelected(rec); }}
                            sx={{ color: '#475569', bgcolor: '#f8fafc', borderRadius: 1.5, width: 28, height: 28,
                              '&:hover': { bgcolor: '#f1f5f9' } }}>
                            <MoreVertIcon sx={{ fontSize: 14 }} />
                          </IconButton>
                        </Box>
                      </Box>

                      <Divider sx={{ my: 1.25 }} />

                      <Grid container spacing={2}>
                        {/* Contact */}
                        <Grid item xs={12} sm={4}>
                          <Typography sx={{ fontSize: '0.68rem', color: '#94a3b8', textTransform: 'uppercase',
                            letterSpacing: '0.4px', mb: 0.5 }}>Contact</Typography>
                          {rec.candidate_email && (
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 0.3 }}>
                              <EmailIcon sx={{ fontSize: 12, color: '#94a3b8' }} />
                              <Typography sx={{ fontSize: '0.78rem', color: '#334155' }}>{rec.candidate_email}</Typography>
                            </Box>
                          )}
                          {rec.candidate_phone && (
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                              <PhoneIcon sx={{ fontSize: 12, color: '#94a3b8' }} />
                              <Typography sx={{ fontSize: '0.78rem', color: '#334155' }}>{rec.candidate_phone}</Typography>
                            </Box>
                          )}
                        </Grid>

                        {/* Recommandé par */}
                        <Grid item xs={12} sm={4}>
                          <Typography sx={{ fontSize: '0.68rem', color: '#94a3b8', textTransform: 'uppercase',
                            letterSpacing: '0.4px', mb: 0.5 }}>Recommandé par</Typography>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                            <Avatar sx={{ width: 20, height: 20, bgcolor: avatarColor(rec.recommended_by_name || ''),
                              fontSize: '0.6rem', fontWeight: 700 }}>
                              {rec.recommended_by_name?.[0]?.toUpperCase() || '?'}
                            </Avatar>
                            <Typography sx={{ fontSize: '0.78rem', fontWeight: 600, color: '#334155' }}>
                              {rec.recommended_by_name || '—'}
                            </Typography>
                          </Box>
                          {rec.relationship && (
                            <Typography variant="caption" sx={{ color: '#94a3b8', ml: 0.5 }}>
                              {rec.relationship}
                            </Typography>
                          )}
                        </Grid>

                        {/* Raison */}
                        <Grid item xs={12} sm={4}>
                          <Typography sx={{ fontSize: '0.68rem', color: '#94a3b8', textTransform: 'uppercase',
                            letterSpacing: '0.4px', mb: 0.5 }}>Raison</Typography>
                          <Typography sx={{ fontSize: '0.78rem', color: '#475569', lineHeight: 1.5,
                            overflow: 'hidden', display: '-webkit-box',
                            WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
                            {rec.recommendation_reason || '—'}
                          </Typography>
                        </Grid>
                      </Grid>

                      {/* Quick actions */}
                      <Box sx={{ display: 'flex', gap: 1, mt: 1.5, pt: 1.5, borderTop: '1px solid #f1f5f9', flexWrap: 'wrap' }}>
                        {rec.status !== 'contacted' && (
                          <Button size="small" startIcon={<ContactedIcon sx={{ fontSize: 13 }} />}
                            onClick={() => handleStatus(rec.id, 'contacted')}
                            sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 600, fontSize: '0.75rem',
                              color: '#0288d1', border: '1px solid #b3e5fc', bgcolor: '#e1f5fe',
                              '&:hover': { bgcolor: '#b3e5fc' }, py: 0.4 }}>
                            Marquer contacté
                          </Button>
                        )}
                        {rec.status !== 'rejected' && (
                          <Button size="small" startIcon={<RejectIcon sx={{ fontSize: 13 }} />}
                            onClick={() => handleStatus(rec.id, 'rejected')}
                            sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 600, fontSize: '0.75rem',
                              color: '#c62828', border: '1px solid #ffcdd2', bgcolor: '#ffebee',
                              '&:hover': { bgcolor: '#ffcdd2' }, py: 0.4 }}>
                            Rejeter
                          </Button>
                        )}
                        {rec.status !== 'pending' && (
                          <Button size="small" startIcon={<PendingIcon sx={{ fontSize: 13 }} />}
                            onClick={() => handleStatus(rec.id, 'pending')}
                            sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 600, fontSize: '0.75rem',
                              color: '#f57c00', border: '1px solid #ffe0b2', bgcolor: '#fff3e0',
                              '&:hover': { bgcolor: '#ffe0b2' }, py: 0.4 }}>
                            Remettre en attente
                          </Button>
                        )}
                        {rec.created_at && (
                          <Typography variant="caption" sx={{ color: '#94a3b8', ml: 'auto', alignSelf: 'center' }}>
                            {format(new Date(rec.created_at), 'dd MMM yyyy', { locale: fr })}
                          </Typography>
                        )}
                      </Box>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            );
          })}
        </Box>
      )}

      {/* Context menu */}
      <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={() => setAnchorEl(null)}
        PaperProps={{ elevation: 0, sx: { border: '1px solid #e8ecf0', borderRadius: 2, minWidth: 190 } }}>
        <MenuItem onClick={() => { setDetail(true); setAnchorEl(null); }}
          sx={{ fontSize: '0.875rem', gap: 1.5 }}>
          <ViewIcon sx={{ fontSize: 17, color: '#1976d2' }} /> Voir les détails
        </MenuItem>
        <Divider />
        {selected?.status !== 'contacted' && (
          <MenuItem onClick={() => handleStatus(selected.id, 'contacted')}
            sx={{ fontSize: '0.875rem', gap: 1.5, color: '#0288d1' }}>
            <ContactedIcon sx={{ fontSize: 17 }} /> Marquer contacté
          </MenuItem>
        )}
        {selected?.status !== 'pending' && (
          <MenuItem onClick={() => handleStatus(selected.id, 'pending')}
            sx={{ fontSize: '0.875rem', gap: 1.5, color: '#f57c00' }}>
            <PendingIcon sx={{ fontSize: 17 }} /> Remettre en attente
          </MenuItem>
        )}
        {selected?.status !== 'rejected' && (
          <MenuItem onClick={() => handleStatus(selected.id, 'rejected')}
            sx={{ fontSize: '0.875rem', gap: 1.5, color: '#c62828' }}>
            <RejectIcon sx={{ fontSize: 17 }} /> Rejeter
          </MenuItem>
        )}
      </Menu>

      {/* Dialog détails */}
      <Dialog open={detail} onClose={() => setDetail(false)} maxWidth="sm" fullWidth
        PaperProps={{ sx: { borderRadius: 3, overflow: 'hidden' } }}>
        <Box sx={{ background: 'linear-gradient(135deg,#0f172a,#1e3a5f,#1e40af)', px: 3, py: 2.5,
          display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            {selected && (
              <Avatar sx={{ bgcolor: avatarColor(selected.candidate_name || ''), width: 42, height: 42,
                fontSize: '1rem', fontWeight: 700, border: '2px solid rgba(255,255,255,0.25)' }}>
                {selected.candidate_name?.[0]?.toUpperCase() || '?'}
              </Avatar>
            )}
            <Box>
              <Typography sx={{ color: 'white', fontWeight: 700, fontSize: '1rem' }}>
                {selected?.candidate_name || '—'}
              </Typography>
              <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.6)' }}>
                {selected?.job_offer_title || '—'}
              </Typography>
            </Box>
          </Box>
          <IconButton size="small" onClick={() => setDetail(false)}
            sx={{ color: 'rgba(255,255,255,0.6)', '&:hover': { color: 'white' } }}>
            <CloseIcon fontSize="small" />
          </IconButton>
        </Box>

        <DialogContent sx={{ p: 3 }}>
          {selected && (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>

              {/* Statut actuel */}
              {(() => { const sc = STATUS[selected.status] || STATUS.pending; return (
                <Box sx={{ p: 1.5, borderRadius: 2, bgcolor: sc.bg, border: `1px solid ${sc.color}20`,
                  display: 'flex', alignItems: 'center', gap: 1.5 }}>
                  <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: sc.color }} />
                  <Typography sx={{ fontSize: '0.875rem', fontWeight: 700, color: sc.color }}>{sc.label}</Typography>
                </Box>
              ); })()}

              {/* Infos grille */}
              <Grid container spacing={1.5}>
                {[
                  { label: 'Email',          value: selected.candidate_email,   icon: <EmailIcon /> },
                  { label: 'Téléphone',      value: selected.candidate_phone,   icon: <PhoneIcon /> },
                  { label: 'Recommandé par', value: selected.recommended_by_name, icon: <PersonIcon /> },
                  { label: 'Relation',       value: selected.relationship,      icon: <GroupsIcon /> },
                ].map(row => (
                  <Grid item xs={12} sm={6} key={row.label}>
                    <Box sx={{ p: 1.5, bgcolor: '#f8fafc', borderRadius: 2, border: '1px solid #e8ecf0' }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, mb: 0.4 }}>
                        {React.cloneElement(row.icon, { sx: { fontSize: 13, color: '#94a3b8' } })}
                        <Typography sx={{ fontSize: '0.68rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.4px' }}>
                          {row.label}
                        </Typography>
                      </Box>
                      <Typography sx={{ fontSize: '0.82rem', fontWeight: 600, color: '#1e293b' }}>
                        {row.value || '—'}
                      </Typography>
                    </Box>
                  </Grid>
                ))}
              </Grid>

              {/* Raison */}
              {selected.recommendation_reason && (
                <Box>
                  <Typography sx={{ fontSize: '0.68rem', color: '#94a3b8', textTransform: 'uppercase',
                    letterSpacing: '0.4px', mb: 0.75 }}>
                    Raison de la recommandation
                  </Typography>
                  <Typography sx={{ fontSize: '0.875rem', color: '#475569', lineHeight: 1.75,
                    whiteSpace: 'pre-line', p: 1.5, bgcolor: '#f8fafc', borderRadius: 2,
                    border: '1px solid #e8ecf0' }}>
                    {selected.recommendation_reason}
                  </Typography>
                </Box>
              )}
            </Box>
          )}
        </DialogContent>

        <DialogActions sx={{ px: 3, pb: 2.5, gap: 1, flexWrap: 'wrap' }}>
          <Button onClick={() => setDetail(false)}
            sx={{ borderRadius: 2, textTransform: 'none', color: '#64748b', flex: 1 }}>
            Fermer
          </Button>
          {selected?.status !== 'contacted' && (
            <Button onClick={() => handleStatus(selected.id, 'contacted')} variant="contained"
              sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 600, flex: 1,
                bgcolor: '#0288d1', '&:hover': { bgcolor: '#0277bd' } }}>
              Marquer contacté
            </Button>
          )}
          {selected?.status !== 'rejected' && (
            <Button onClick={() => handleStatus(selected.id, 'rejected')} variant="outlined"
              sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 600, flex: 1,
                borderColor: '#ffcdd2', color: '#c62828', '&:hover': { bgcolor: '#ffebee' } }}>
              Rejeter
            </Button>
          )}
        </DialogActions>
      </Dialog>

      <Snackbar open={snack.open} autoHideDuration={3000}
        onClose={() => setSnack(p => ({ ...p, open: false }))}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}>
        <Alert severity={snack.severity} onClose={() => setSnack(p => ({ ...p, open: false }))}
          sx={{ borderRadius: 2, boxShadow: '0 4px 16px rgba(0,0,0,0.12)' }}>
          {snack.msg}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default ProfileRecommendations;
