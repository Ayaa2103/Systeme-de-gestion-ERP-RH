import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box, Card, CardContent, Typography, Button, Grid, Chip, Avatar,
  IconButton, Menu, MenuItem, Dialog, DialogContent, DialogActions,
  TextField, Divider, Snackbar, Alert, Skeleton, Tooltip,
} from '@mui/material';
import {
  Lightbulb as SuggestionIcon,
  MoreVert as MoreVertIcon,
  Reply as ReplyIcon,
  Add as AddIcon,
  ArrowBack as BackIcon,
  CheckCircle as AnsweredIcon,
  Schedule as PendingIcon,
  Close as CloseIcon,
  Send as SendIcon,
  CorporateFare as CultureIcon,
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';
import { getSuggestions, getSuggestionDetail, respondToSuggestion } from '../../services/cultureService';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

const STATUS = {
  new:      { label: 'Nouvelle',  color: '#0288d1', bg: '#e1f5fe' },
  received: { label: 'Reçue',     color: '#f57c00', bg: '#fff8e1' },
  answered: { label: 'Répondue',  color: '#2e7d32', bg: '#e8f5e9' },
};

const COLORS = ['#1976d2','#388e3c','#d32f2f','#7b1fa2','#f57c00','#0097a7'];
const avatarColor = (name = '') => COLORS[(name.charCodeAt(0) || 0) % COLORS.length];

const TABS = [
  { label: 'Toutes',      filter: null },
  { label: 'Nouvelles',   filter: 'new' },
  { label: 'Reçues',      filter: 'received' },
  { label: 'Répondues',   filter: 'answered' },
];

const ManageSuggestions = () => {
  const navigate = useNavigate();
  const { hasAnyRole, user } = useAuth();
  const isDirector = hasAnyRole(['hr_director']);
  const isEmployee = user?.role === 'employee';

  const [suggestions,   setSuggestions]   = useState([]);
  const [loading,       setLoading]       = useState(true);
  const [tab,           setTab]           = useState(0);
  const [anchorEl,      setAnchorEl]      = useState(null);
  const [selected,      setSelected]      = useState(null);
  const [replyDialog,   setReplyDialog]   = useState(false);
  const [detailDialog,  setDetailDialog]  = useState(false);
  const [detailData,    setDetailData]    = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [replyText,     setReplyText]     = useState('');
  const [saving,        setSaving]        = useState(false);
  const [snack,         setSnack]         = useState({ open: false, msg: '', severity: 'success' });

  useEffect(() => { load(); }, []);

  const load = async () => {
    setLoading(true);
    try {
      const res = await getSuggestions();
      setSuggestions(res.data?.results || res.data || []);
    } catch (_) {}
    finally { setLoading(false); }
  };

  const openDetail = async (sug) => {
    setSelected(sug);
    setDetailData(null);
    setDetailDialog(true);
    setAnchorEl(null);
    setDetailLoading(true);
    try {
      const res = await getSuggestionDetail(sug.id);
      setDetailData(res.data);
    } catch (_) {
      setDetailData(sug);
    } finally { setDetailLoading(false); }
  };

  const openReply = (sug) => {
    setSelected(sug);
    setReplyText(sug.response || '');
    setReplyDialog(true);
    setAnchorEl(null);
  };

  const submitReply = async () => {
    setSaving(true);
    try {
      await respondToSuggestion(selected.id, replyText);
      setSnack({ open: true, msg: 'Réponse envoyée avec succès', severity: 'success' });
      setReplyDialog(false); setReplyText('');
      load();
    } catch (_) {
      setSnack({ open: true, msg: 'Erreur lors de l\'envoi', severity: 'error' });
    } finally { setSaving(false); }
  };

  const displayed = TABS[tab].filter
    ? suggestions.filter(s => s.status === TABS[tab].filter)
    : suggestions;

  const counts = {
    total:    suggestions.length,
    new:      suggestions.filter(s => s.status === 'new').length,
    received: suggestions.filter(s => s.status === 'received').length,
    answered: suggestions.filter(s => s.status === 'answered').length,
  };

  return (
    <Box sx={{ width: '100%' }}>

      {/* Banner */}
      <Card elevation={0} sx={{ borderRadius: 3, border: '1px solid #e8ecf0', mb: 3, overflow: 'hidden' }}>
        <Box sx={{ background: 'linear-gradient(135deg,#0f172a 0%,#1e3a5f 60%,#1e40af 100%)',
          px: 3, py: 2.5, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Button startIcon={<BackIcon />} onClick={() => navigate('/culture')} size="small"
              sx={{ color: 'rgba(255,255,255,0.7)', textTransform: 'none', borderRadius: 2,
                '&:hover': { bgcolor: 'rgba(255,255,255,0.1)', color: 'white' } }}>
              Retour
            </Button>
            <Box sx={{ p: 1.25, borderRadius: 2, bgcolor: 'rgba(255,255,255,0.12)', display: 'inline-flex' }}>
              <SuggestionIcon sx={{ fontSize: 22, color: 'white' }} />
            </Box>
            <Box>
              <Typography variant="h5" fontWeight={700} color="white">Suggestions des employés</Typography>
              <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.65)', mt: 0.3 }}>
                {suggestions.length} suggestion{suggestions.length !== 1 ? 's' : ''} · {counts.new} en attente
              </Typography>
            </Box>
          </Box>
          {!isEmployee && (
            <Button startIcon={<AddIcon />} onClick={() => navigate('/culture/suggestions/create')}
              sx={{ bgcolor: 'rgba(255,255,255,0.15)', color: 'white', border: '1px solid rgba(255,255,255,0.25)',
                borderRadius: 2, textTransform: 'none', fontWeight: 600,
                '&:hover': { bgcolor: 'rgba(255,255,255,0.25)' } }}>
              Nouvelle suggestion
            </Button>
          )}
        </Box>
      </Card>

      {/* Stat cards */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        {[
          { label: 'Total',    value: counts.total,    color: '#1976d2', key: 0 },
          { label: 'Nouvelles',value: counts.new,      color: '#0288d1', key: 1 },
          { label: 'Reçues',   value: counts.received, color: '#f57c00', key: 2 },
          { label: 'Répondues',value: counts.answered, color: '#2e7d32', key: 3 },
        ].map(s => (
          <Grid item xs={6} sm={3} key={s.key}>
            <Card elevation={0} onClick={() => setTab(s.key)}
              sx={{ border: `1px solid ${tab === s.key ? s.color : `${s.color}20`}`, borderRadius: 3,
                cursor: 'pointer', bgcolor: tab === s.key ? `${s.color}06` : 'white', transition: 'all 0.2s',
                '&:hover': { boxShadow: `0 4px 16px ${s.color}15`, borderColor: `${s.color}45` } }}>
              <CardContent sx={{ p: 2 }}>
                <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: s.color, mb: 1 }} />
                {loading ? <Skeleton width={36} height={30} /> : (
                  <Typography variant="h4" fontWeight={800} sx={{ color: s.color, lineHeight: 1 }}>{s.value}</Typography>
                )}
                <Typography variant="caption" color="text.secondary" sx={{ mt: 0.4, display: 'block' }}>{s.label}</Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Tabs + liste */}
      <Card elevation={0} sx={{ border: '1px solid #e8ecf0', borderRadius: 3, overflow: 'hidden' }}>
        {/* Tabs */}
        <Box sx={{ borderBottom: '1px solid #e8ecf0', bgcolor: '#f8fafc', display: 'flex' }}>
          {TABS.map((t, i) => {
            const cnt = i === 0 ? suggestions.length : (i === 1 ? counts.new : i === 2 ? counts.received : counts.answered);
            return (
              <Box key={i} onClick={() => setTab(i)}
                sx={{ px: 2.5, py: 1.5, cursor: 'pointer', borderBottom: `3px solid ${tab === i ? '#1976d2' : 'transparent'}`,
                  color: tab === i ? '#1976d2' : '#64748b', fontWeight: tab === i ? 700 : 500,
                  fontSize: '0.82rem', display: 'flex', alignItems: 'center', gap: 0.75,
                  transition: 'all 0.15s', '&:hover': { color: '#1976d2', bgcolor: '#eff6ff' } }}>
                {t.label}
                {cnt > 0 && i > 0 && (
                  <Box sx={{ width: 18, height: 18, borderRadius: '50%', bgcolor: tab === i ? '#1976d2' : '#e2e8f0',
                    color: tab === i ? 'white' : '#64748b', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '0.62rem', fontWeight: 700 }}>
                    {cnt}
                  </Box>
                )}
              </Box>
            );
          })}
        </Box>

        {/* Contenu */}
        {loading ? (
          <Box sx={{ p: 2 }}>{[1,2,3].map(i => <Skeleton key={i} height={100} sx={{ mb: 1, borderRadius: 2 }} />)}</Box>
        ) : displayed.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 7 }}>
            <SuggestionIcon sx={{ fontSize: 44, color: '#cbd5e1', mb: 1 }} />
            <Typography variant="body2" color="text.secondary">Aucune suggestion dans cette catégorie</Typography>
          </Box>
        ) : (
          displayed.map((sug, i) => {
            const sc = STATUS[sug.status] || STATUS.new;
            const name = sug.employee_name || '—';
            return (
              <React.Fragment key={sug.id}>
                <Box sx={{ px: 2.5, py: 2, transition: 'background 0.15s', '&:hover': { bgcolor: '#fafbfc' } }}>
                  <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.75 }}>
                    <Avatar sx={{ bgcolor: avatarColor(name), width: 38, height: 38,
                      fontSize: '0.85rem', fontWeight: 700, flexShrink: 0 }}>
                      {name[0]?.toUpperCase() || '?'}
                    </Avatar>
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.3 }}>
                        <Typography sx={{ fontSize: '0.875rem', fontWeight: 700, color: '#1e293b' }}>
                          {sug.title}
                        </Typography>
                        <Chip label={sc.label} size="small"
                          sx={{ bgcolor: sc.bg, color: sc.color, fontWeight: 700, fontSize: '0.65rem',
                            height: 18, border: `1px solid ${sc.color}25` }} />
                      </Box>
                      <Typography variant="caption" color="text.secondary">
                        {name} · {sug.date ? format(new Date(sug.date), 'dd MMM yyyy', { locale: fr }) : '—'}
                      </Typography>
                      {sug.suggestion_text && (
                        <Typography sx={{ fontSize: '0.82rem', color: '#475569', mt: 0.75, lineHeight: 1.6,
                          overflow: 'hidden', display: '-webkit-box',
                          WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
                          {sug.suggestion_text}
                        </Typography>
                      )}
                      {sug.response && (
                        <Box sx={{ mt: 1.25, p: 1.25, bgcolor: '#f0fdf4', borderRadius: 2,
                          border: '1px solid #a7f3d030' }}>
                          <Typography sx={{ fontSize: '0.72rem', fontWeight: 700, color: '#2e7d32', mb: 0.3 }}>
                            Réponse de {sug.responded_by_name} :
                          </Typography>
                          <Typography sx={{ fontSize: '0.8rem', color: '#334155', lineHeight: 1.55 }}>
                            {sug.response}
                          </Typography>
                        </Box>
                      )}
                    </Box>
                    <Box sx={{ flexShrink: 0, display: 'flex', gap: 0.5 }}>
                      {isDirector && sug.status === 'new' && (
                        <Tooltip title="Répondre">
                          <IconButton size="small" onClick={() => openReply(sug)}
                            sx={{ color: '#2e7d32', bgcolor: '#e8f5e9', borderRadius: 1.5, width: 28, height: 28,
                              '&:hover': { bgcolor: '#c8e6c9' } }}>
                            <ReplyIcon sx={{ fontSize: 14 }} />
                          </IconButton>
                        </Tooltip>
                      )}
                      <IconButton size="small"
                        onClick={e => { setAnchorEl(e.currentTarget); setSelected(sug); }}
                        sx={{ color: '#475569', bgcolor: '#f8fafc', borderRadius: 1.5, width: 28, height: 28,
                          '&:hover': { bgcolor: '#f1f5f9' } }}>
                        <MoreVertIcon sx={{ fontSize: 14 }} />
                      </IconButton>
                    </Box>
                  </Box>
                </Box>
                {i < displayed.length - 1 && <Divider />}
              </React.Fragment>
            );
          })
        )}
      </Card>

      {/* Context menu */}
      <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={() => setAnchorEl(null)}
        PaperProps={{ elevation: 0, sx: { border: '1px solid #e8ecf0', borderRadius: 2, minWidth: 170 } }}>
        {isDirector && selected?.status === 'new' && (
          <MenuItem onClick={() => openReply(selected)} sx={{ fontSize: '0.875rem', gap: 1.5, color: '#2e7d32' }}>
            <ReplyIcon sx={{ fontSize: 17 }} /> Répondre
          </MenuItem>
        )}
        <MenuItem onClick={() => openDetail(selected)}
          sx={{ fontSize: '0.875rem', gap: 1.5 }}>
          <ReplyIcon sx={{ fontSize: 17, color: '#1976d2' }} /> Voir les détails
        </MenuItem>
      </Menu>

      {/* Dialog réponse */}
      <Dialog open={replyDialog} onClose={() => setReplyDialog(false)} maxWidth="sm" fullWidth
        PaperProps={{ sx: { borderRadius: 3, overflow: 'hidden' } }}>
        <Box sx={{ background: 'linear-gradient(135deg,#0f172a,#1e3a5f,#1e40af)', px: 3, py: 2,
          display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.12)', width: 30, height: 30, borderRadius: 1.5 }}>
              <ReplyIcon sx={{ fontSize: 15, color: 'white' }} />
            </Avatar>
            <Box>
              <Typography sx={{ color: 'white', fontWeight: 700 }}>Répondre à la suggestion</Typography>
              {selected && <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.6)' }}>{selected.employee_name}</Typography>}
            </Box>
          </Box>
          <IconButton size="small" onClick={() => setReplyDialog(false)}
            sx={{ color: 'rgba(255,255,255,0.6)', '&:hover': { color: 'white' } }}>
            <CloseIcon fontSize="small" />
          </IconButton>
        </Box>

        <DialogContent sx={{ p: 3 }}>
          {selected && (
            <Box sx={{ p: 1.75, bgcolor: '#f8fafc', borderRadius: 2, border: '1px solid #e8ecf0', mb: 2.5 }}>
              <Typography sx={{ fontSize: '0.875rem', fontWeight: 700, color: '#1e293b', mb: 0.3 }}>
                {selected.title}
              </Typography>
              {selected.suggestion_text && (
                <Typography sx={{ fontSize: '0.8rem', color: '#475569', lineHeight: 1.6 }}>
                  {selected.suggestion_text}
                </Typography>
              )}
            </Box>
          )}
          <Box>
            <Typography sx={{ fontSize: '0.78rem', fontWeight: 700, color: '#475569',
              textTransform: 'uppercase', letterSpacing: '0.5px', mb: 0.75 }}>
              Votre réponse <span style={{ color: '#ef4444' }}>*</span>
            </Typography>
            <TextField autoFocus fullWidth multiline rows={4} size="small"
              placeholder="Rédigez votre réponse pour l'employé…"
              value={replyText} onChange={e => setReplyText(e.target.value)}
              sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2, fontSize: '0.875rem' } }} />
          </Box>
        </DialogContent>

        <DialogActions sx={{ px: 3, pb: 2.5, gap: 1 }}>
          <Button onClick={() => setReplyDialog(false)}
            sx={{ borderRadius: 2, textTransform: 'none', color: '#64748b' }}>Annuler</Button>
          <Button onClick={submitReply} variant="contained" disabled={!replyText.trim() || saving}
            startIcon={<SendIcon sx={{ fontSize: 16 }} />}
            sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 600,
              background: 'linear-gradient(135deg,#1e3a5f,#1e40af)' }}>
            Envoyer la réponse
          </Button>
        </DialogActions>
      </Dialog>

      {/* ── Dialog détail suggestion ── */}
      <Dialog open={detailDialog} onClose={() => setDetailDialog(false)} maxWidth="sm" fullWidth
        PaperProps={{ sx: { borderRadius: 3, overflow: 'hidden' } }}>
        {/* Header */}
        <Box sx={{ background: 'linear-gradient(135deg,#0f172a,#1e3a5f,#1e40af)', px: 3, py: 2,
          display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.12)', width: 30, height: 30, borderRadius: 1.5 }}>
              <SuggestionIcon sx={{ fontSize: 15, color: 'white' }} />
            </Avatar>
            <Box>
              <Typography sx={{ color: 'white', fontWeight: 700 }}>Détails de la suggestion</Typography>
              {selected && (
                <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.6)' }}>
                  {selected.employee_name}
                </Typography>
              )}
            </Box>
          </Box>
          <IconButton size="small" onClick={() => setDetailDialog(false)}
            sx={{ color: 'rgba(255,255,255,0.6)', '&:hover': { color: 'white' } }}>
            <CloseIcon fontSize="small" />
          </IconButton>
        </Box>

        <DialogContent sx={{ p: 3 }}>
          {detailLoading ? (
            <Box>{[1,2,3].map(i => <Skeleton key={i} height={24} sx={{ mb: 1, borderRadius: 1 }} />)}</Box>
          ) : detailData && (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>

              {/* Badge statut */}
              {(() => { const sc = STATUS[detailData.status] || STATUS.new; return (
                <Box sx={{ p: 1.25, borderRadius: 2, bgcolor: sc.bg, border: `1px solid ${sc.color}20`,
                  display: 'inline-flex', alignItems: 'center', gap: 1, alignSelf: 'flex-start' }}>
                  <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: sc.color }} />
                  <Typography sx={{ fontSize: '0.82rem', fontWeight: 700, color: sc.color }}>{sc.label}</Typography>
                </Box>
              ); })()}

              {/* Titre */}
              <Box>
                <Typography sx={{ fontSize: '0.68rem', color: '#94a3b8', textTransform: 'uppercase',
                  letterSpacing: '0.4px', mb: 0.5 }}>Titre</Typography>
                <Typography sx={{ fontSize: '1rem', fontWeight: 700, color: '#1e293b' }}>
                  {detailData.title}
                </Typography>
              </Box>

              {/* Auteur + Date */}
              <Box sx={{ display: 'flex', gap: 2 }}>
                <Box sx={{ flex: 1, p: 1.5, bgcolor: '#f8fafc', borderRadius: 2, border: '1px solid #e8ecf0' }}>
                  <Typography sx={{ fontSize: '0.68rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.4px', mb: 0.3 }}>
                    Soumis par
                  </Typography>
                  <Typography sx={{ fontSize: '0.875rem', fontWeight: 600, color: '#1e293b' }}>
                    {detailData.employee_name || '—'}
                  </Typography>
                </Box>
                <Box sx={{ flex: 1, p: 1.5, bgcolor: '#f8fafc', borderRadius: 2, border: '1px solid #e8ecf0' }}>
                  <Typography sx={{ fontSize: '0.68rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.4px', mb: 0.3 }}>
                    Date
                  </Typography>
                  <Typography sx={{ fontSize: '0.875rem', fontWeight: 600, color: '#1e293b' }}>
                    {detailData.date ? format(new Date(detailData.date), 'dd MMM yyyy', { locale: fr }) : '—'}
                  </Typography>
                </Box>
              </Box>

              {/* Texte de la suggestion */}
              <Box>
                <Typography sx={{ fontSize: '0.68rem', color: '#94a3b8', textTransform: 'uppercase',
                  letterSpacing: '0.4px', mb: 0.75 }}>Description</Typography>
                <Typography sx={{ fontSize: '0.875rem', color: '#475569', lineHeight: 1.75,
                  p: 1.75, bgcolor: '#f8fafc', borderRadius: 2, border: '1px solid #e8ecf0',
                  whiteSpace: 'pre-line' }}>
                  {detailData.suggestion_text}
                </Typography>
              </Box>

              {/* Réponse existante */}
              {detailData.response && (
                <Box sx={{ p: 1.75, bgcolor: '#f0fdf4', borderRadius: 2, border: '1px solid #a7f3d030' }}>
                  <Typography sx={{ fontSize: '0.72rem', fontWeight: 700, color: '#2e7d32', mb: 0.5 }}>
                    Réponse de {detailData.responded_by_name} :
                  </Typography>
                  <Typography sx={{ fontSize: '0.875rem', color: '#334155', lineHeight: 1.65 }}>
                    {detailData.response}
                  </Typography>
                  {detailData.response_date && (
                    <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
                      {format(new Date(detailData.response_date), "dd MMM yyyy 'à' HH'h'mm", { locale: fr })}
                    </Typography>
                  )}
                </Box>
              )}

              {/* Champ réponse pour hr_director sur suggestions nouvelles */}
              {isDirector && detailData.status === 'new' && (
                <Box sx={{ p: 2, bgcolor: '#fff8e1', borderRadius: 2, border: '1px solid #ffe0b2' }}>
                  <Typography sx={{ fontSize: '0.78rem', fontWeight: 700, color: '#e65100', mb: 1 }}>
                    Cette suggestion attend votre réponse
                  </Typography>
                  <Button size="small" variant="contained" startIcon={<ReplyIcon sx={{ fontSize: 14 }} />}
                    onClick={() => { setDetailDialog(false); openReply(selected); }}
                    sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 600,
                      bgcolor: '#2e7d32', '&:hover': { bgcolor: '#1b5e20' } }}>
                    Rédiger une réponse
                  </Button>
                </Box>
              )}
            </Box>
          )}
        </DialogContent>

        <DialogActions sx={{ px: 3, pb: 2.5 }}>
          <Button onClick={() => setDetailDialog(false)}
            sx={{ borderRadius: 2, textTransform: 'none', color: '#64748b' }}>Fermer</Button>
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

export default ManageSuggestions;
