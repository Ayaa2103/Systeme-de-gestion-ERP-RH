import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box, Card, CardContent, Typography, Button, Grid, Avatar,
  Dialog, DialogContent, DialogActions, TextField, Chip,
  Snackbar, Alert, Skeleton, IconButton, Divider,
} from '@mui/material';
import {
  Edit as EditIcon,
  Save as SaveIcon,
  ArrowBack as BackIcon,
  Visibility as ViewIcon,
  Close as CloseIcon,
  CheckCircle as CheckIcon,
  AddCircleOutline as AddIcon,
  Gavel as EthicsIcon,
  Star as ValuesIcon,
  TrackChanges as MissionIcon,
  Policy as PolicyIcon,
  CalendarToday as CalendarIcon,
  CorporateFare as CultureIcon,
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';
import { getCompanyPages, updateCompanyPage } from '../../services/cultureService';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

const PAGE_TYPES = [
  { type: 'vision_mission', title: 'Vision & Mission',    icon: <MissionIcon />, color: '#1976d2', bg: '#e3f2fd',
    desc: 'La raison d\'être de l\'entreprise et ses aspirations à long terme.' },
  { type: 'values',         title: 'Valeurs',             icon: <ValuesIcon />,  color: '#f57c00', bg: '#fff3e0',
    desc: 'Les principes fondamentaux qui guident les comportements et décisions.' },
  { type: 'policies',       title: 'Politiques Internes', icon: <PolicyIcon />,  color: '#2e7d32', bg: '#e8f5e9',
    desc: 'Les règles et procédures internes à respecter au quotidien.' },
  { type: 'ethics',         title: 'Code d\'Éthique',     icon: <EthicsIcon />,  color: '#7b1fa2', bg: '#f3e5f5',
    desc: 'Les engagements éthiques et déontologiques de l\'organisation.' },
];

const fieldSx = {
  '& .MuiOutlinedInput-root': {
    borderRadius: 2, fontSize: '0.875rem',
    '&:hover fieldset': { borderColor: '#1976d2' },
    '&.Mui-focused fieldset': { borderColor: '#1976d2' },
  },
};

const ManagePages = () => {
  const navigate = useNavigate();
  const { hasAnyRole } = useAuth();
  const canEdit = hasAnyRole(['hr_manager', 'hr_director']);

  const [pages,      setPages]      = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [editDialog, setEditDialog] = useState(false);
  const [selPage,    setSelPage]    = useState(null);
  const [form,       setForm]       = useState({ title: '', content: '' });
  const [saving,     setSaving]     = useState(false);
  const [snack,      setSnack]      = useState({ open: false, msg: '', severity: 'success' });

  useEffect(() => { load(); }, []);

  const load = async () => {
    setLoading(true);
    try {
      const res = await getCompanyPages();
      const d = res.data;
      setPages(d?.results || (Array.isArray(d) ? d : []));
    } catch (_) { setPages([]); }
    finally { setLoading(false); }
  };

  const openEdit = (pt) => {
    const existing = pages.find(p => p.page_type === pt.type);
    setSelPage({ ...pt, id: existing?.id });
    setForm({ title: existing?.title || pt.title, content: existing?.content || '' });
    setEditDialog(true);
  };

  const handleSave = async () => {
    if (!form.title.trim() || !form.content.trim()) {
      setSnack({ open: true, msg: 'Titre et contenu sont obligatoires', severity: 'error' }); return;
    }
    setSaving(true);
    try {
      await updateCompanyPage(selPage.id || null, {
        title: form.title.trim(),
        content: form.content.trim(),
        page_type: selPage.type,
      });
      setSnack({ open: true, msg: 'Page mise à jour avec succès', severity: 'success' });
      setEditDialog(false);
      load();
    } catch (e) {
      setSnack({ open: true, msg: e.response?.data?.detail || 'Erreur lors de la sauvegarde', severity: 'error' });
    } finally { setSaving(false); }
  };

  const configuredCount = PAGE_TYPES.filter(pt => pages.find(p => p.page_type === pt.type)).length;

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
              <CultureIcon sx={{ fontSize: 22, color: 'white' }} />
            </Box>
            <Box>
              <Typography variant="h5" fontWeight={700} color="white">Pages de Culture</Typography>
              <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.65)', mt: 0.3 }}>
                {configuredCount}/{PAGE_TYPES.length} pages configurées
              </Typography>
            </Box>
          </Box>
          {/* Progress dots */}
          <Box sx={{ display: 'flex', gap: 0.5 }}>
            {PAGE_TYPES.map((pt, i) => {
              const exists = pages.find(p => p.page_type === pt.type);
              return (
                <Box key={i} sx={{ width: 28, height: 4, borderRadius: 2,
                  bgcolor: exists ? '#60a5fa' : 'rgba(255,255,255,0.2)' }} />
              );
            })}
          </Box>
        </Box>
      </Card>

      {/* Grille des pages */}
      <Grid container spacing={3}>
        {PAGE_TYPES.map(pt => {
          const existing = pages.find(p => p.page_type === pt.type);
          const configured = !!existing;

          return (
            <Grid item xs={12} md={6} key={pt.type}>
              <Card elevation={0} sx={{
                border: `1px solid ${configured ? `${pt.color}30` : '#e8ecf0'}`,
                borderTop: `3px solid ${configured ? pt.color : '#e8ecf0'}`,
                borderRadius: 3, height: '100%', overflow: 'hidden',
                transition: 'all 0.2s',
                '&:hover': { boxShadow: `0 6px 24px ${pt.color}15`, borderTopColor: pt.color } }}>
                <CardContent sx={{ p: 0, height: '100%', display: 'flex', flexDirection: 'column' }}>

                  {/* Header de la card */}
                  <Box sx={{ px: 2.5, pt: 2.5, pb: 1.5, display: 'flex', alignItems: 'flex-start', gap: 1.5 }}>
                    <Avatar sx={{ bgcolor: pt.bg, width: 44, height: 44, borderRadius: 2, flexShrink: 0 }}>
                      {React.cloneElement(pt.icon, { sx: { color: pt.color, fontSize: 22 } })}
                    </Avatar>
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.3 }}>
                        <Typography sx={{ fontSize: '1rem', fontWeight: 700, color: '#1e293b' }}>
                          {pt.title}
                        </Typography>
                        <Chip
                          label={configured ? 'Configurée' : 'Non configurée'}
                          size="small"
                          sx={{ bgcolor: configured ? `${pt.color}10` : '#f1f5f9',
                            color: configured ? pt.color : '#94a3b8',
                            border: `1px solid ${configured ? `${pt.color}30` : '#e2e8f0'}`,
                            fontWeight: 700, fontSize: '0.65rem', height: 18 }} />
                      </Box>
                      <Typography sx={{ fontSize: '0.78rem', color: '#64748b', lineHeight: 1.5 }}>
                        {pt.desc}
                      </Typography>
                    </Box>
                  </Box>

                  <Divider />

                  {/* Contenu */}
                  <Box sx={{ px: 2.5, py: 2, flex: 1 }}>
                    {loading ? (
                      <Skeleton variant="text" height={20} sx={{ mb: 0.5 }} />
                    ) : configured ? (
                      <Box>
                        <Typography sx={{ fontSize: '0.82rem', color: '#475569', lineHeight: 1.7,
                          overflow: 'hidden', display: '-webkit-box',
                          WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', mb: 1.5 }}>
                          {existing.content}
                        </Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                          <CalendarIcon sx={{ fontSize: 13, color: '#94a3b8' }} />
                          <Typography variant="caption" color="text.secondary">
                            Mis à jour le {existing.last_updated
                              ? format(new Date(existing.last_updated), 'dd MMM yyyy', { locale: fr })
                              : '—'}
                          </Typography>
                        </Box>
                      </Box>
                    ) : (
                      <Box sx={{ textAlign: 'center', py: 2 }}>
                        <Typography sx={{ fontSize: '0.82rem', color: '#94a3b8', fontStyle: 'italic' }}>
                          Cette page n'a pas encore été configurée.
                        </Typography>
                        {canEdit && (
                          <Typography sx={{ fontSize: '0.78rem', color: pt.color, mt: 0.5 }}>
                            Cliquez sur "Modifier" pour ajouter du contenu.
                          </Typography>
                        )}
                      </Box>
                    )}
                  </Box>

                  <Divider />

                  {/* Actions */}
                  <Box sx={{ px: 2, py: 1.25, display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
                    {configured && (
                      <Button size="small" startIcon={<ViewIcon sx={{ fontSize: 14 }} />}
                        onClick={() => navigate(`/culture/pages/${pt.type}`)}
                        sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 600, fontSize: '0.78rem',
                          color: pt.color, border: `1px solid ${pt.color}25`,
                          '&:hover': { bgcolor: pt.bg } }}>
                        Voir
                      </Button>
                    )}
                    {canEdit && (
                      <Button size="small"
                        startIcon={configured ? <EditIcon sx={{ fontSize: 14 }} /> : <AddIcon sx={{ fontSize: 14 }} />}
                        onClick={() => openEdit(pt)}
                        variant={configured ? 'outlined' : 'contained'}
                        sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 600, fontSize: '0.78rem',
                          ...(configured ? {
                            color: '#475569', borderColor: '#e2e8f0',
                            '&:hover': { borderColor: pt.color, color: pt.color }
                          } : {
                            bgcolor: pt.color, '&:hover': { filter: 'brightness(0.9)' },
                          }) }}>
                        {configured ? 'Modifier' : 'Configurer'}
                      </Button>
                    )}
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          );
        })}
      </Grid>

      {/* Dialog d'édition */}
      <Dialog open={editDialog} onClose={() => { setEditDialog(false); }} maxWidth="md" fullWidth
        PaperProps={{ sx: { borderRadius: 3, overflow: 'hidden' } }}>

        {/* Header */}
        <Box sx={{ background: 'linear-gradient(135deg,#0f172a,#1e3a5f,#1e40af)',
          px: 3, py: 2.5, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.75 }}>
            {selPage && (
              <Avatar sx={{ bgcolor: PAGE_TYPES.find(p => p.type === selPage.type)?.bg || '#eff6ff',
                width: 38, height: 38, borderRadius: 2 }}>
                {selPage && React.cloneElement(
                  PAGE_TYPES.find(p => p.type === selPage.type)?.icon || <CultureIcon />,
                  { sx: { color: PAGE_TYPES.find(p => p.type === selPage.type)?.color || '#1976d2', fontSize: 20 } }
                )}
              </Avatar>
            )}
            <Box>
              <Typography sx={{ color: 'white', fontWeight: 700, fontSize: '1rem' }}>
                {selPage?.id ? 'Modifier' : 'Configurer'} — {selPage?.title}
              </Typography>
              <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.6)' }}>
                {selPage?.id ? 'Mise à jour du contenu existant' : 'Création d\'une nouvelle page'}
              </Typography>
            </Box>
          </Box>
          <IconButton size="small" onClick={() => setEditDialog(false)}
            sx={{ color: 'rgba(255,255,255,0.6)', '&:hover': { color: 'white' } }}>
            <CloseIcon fontSize="small" />
          </IconButton>
        </Box>

        <DialogContent sx={{ p: 3 }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>

            {/* Titre */}
            <Box>
              <Typography sx={{ fontSize: '0.78rem', fontWeight: 700, color: '#475569',
                textTransform: 'uppercase', letterSpacing: '0.5px', mb: 0.75 }}>
                Titre <span style={{ color: '#ef4444' }}>*</span>
              </Typography>
              <TextField autoFocus fullWidth size="small"
                placeholder="Titre de la page…"
                value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))}
                sx={fieldSx} />
            </Box>

            {/* Contenu */}
            <Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.75 }}>
                <Typography sx={{ fontSize: '0.78rem', fontWeight: 700, color: '#475569',
                  textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  Contenu <span style={{ color: '#ef4444' }}>*</span>
                </Typography>
                <Typography sx={{ fontSize: '0.72rem', color: '#94a3b8' }}>
                  {form.content.length} caractères
                </Typography>
              </Box>
              <TextField fullWidth multiline rows={12}
                placeholder="Rédigez le contenu de la page…&#10;&#10;Utilisez des sauts de ligne pour structurer votre texte."
                value={form.content} onChange={e => setForm(p => ({ ...p, content: e.target.value }))}
                sx={{ ...fieldSx, '& .MuiOutlinedInput-root': { ...fieldSx['& .MuiOutlinedInput-root'], p: 1.5 } }} />
            </Box>

            {/* Aperçu rapide */}
            {form.content && (
              <Box sx={{ p: 2, bgcolor: '#f8fafc', borderRadius: 2, border: '1px solid #e8ecf0' }}>
                <Typography sx={{ fontSize: '0.72rem', fontWeight: 700, color: '#94a3b8',
                  textTransform: 'uppercase', letterSpacing: '0.5px', mb: 0.75 }}>
                  Aperçu (3 premières lignes)
                </Typography>
                <Typography sx={{ fontSize: '0.82rem', color: '#475569', lineHeight: 1.7,
                  overflow: 'hidden', display: '-webkit-box',
                  WebkitLineClamp: 3, WebkitBoxOrient: 'vertical' }}>
                  {form.content}
                </Typography>
              </Box>
            )}
          </Box>
        </DialogContent>

        <DialogActions sx={{ px: 3, pb: 2.5, gap: 1 }}>
          <Button onClick={() => setEditDialog(false)}
            sx={{ borderRadius: 2, textTransform: 'none', color: '#64748b' }}>Annuler</Button>
          <Button onClick={handleSave} variant="contained" startIcon={<SaveIcon sx={{ fontSize: 16 }} />}
            disabled={saving || !form.title.trim() || !form.content.trim()}
            sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 600,
              background: 'linear-gradient(135deg,#1e3a5f,#1e40af)' }}>
            {saving ? 'Sauvegarde…' : 'Sauvegarder'}
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar open={snack.open} autoHideDuration={3500}
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

export default ManagePages;
