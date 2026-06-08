import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box, Card, CardContent, Typography, Button, Avatar, Skeleton, Chip, Divider,
  Dialog, DialogContent, DialogActions, TextField, IconButton, Snackbar, Alert,
} from '@mui/material';
import {
  ArrowBack as BackIcon,
  Edit as EditIcon,
  CalendarToday as CalendarIcon,
  Gavel as EthicsIcon,
  Star as ValuesIcon,
  TrackChanges as MissionIcon,
  Policy as PolicyIcon,
  CorporateFare as CultureIcon,
  Close as CloseIcon,
  Save as SaveIcon,
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';
import { getCompanyPages, updateCompanyPage } from '../../services/cultureService';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

const PAGE_META = {
  vision_mission: { title: 'Vision & Mission',    icon: <MissionIcon />, color: '#1976d2', bg: '#e3f2fd' },
  values:         { title: 'Valeurs',             icon: <ValuesIcon />,  color: '#f57c00', bg: '#fff3e0' },
  policies:       { title: 'Politiques Internes', icon: <PolicyIcon />,  color: '#2e7d32', bg: '#e8f5e9' },
  ethics:         { title: 'Code d\'Éthique',     icon: <EthicsIcon />,  color: '#7b1fa2', bg: '#f3e5f5' },
};

const ViewPage = () => {
  const { pageType } = useParams();
  const navigate     = useNavigate();
  const { hasAnyRole } = useAuth();
  const canEdit = hasAnyRole(['hr_manager', 'hr_director']);

  const [page,       setPage]       = useState(null);
  const [loading,    setLoading]    = useState(true);
  const [editDialog, setEditDialog] = useState(false);
  const [form,       setForm]       = useState({ title: '', content: '' });
  const [saving,     setSaving]     = useState(false);
  const [snack,      setSnack]      = useState({ open: false, msg: '', severity: 'success' });

  const meta = PAGE_META[pageType] || { title: pageType, icon: <CultureIcon />, color: '#1976d2', bg: '#e3f2fd' };

  useEffect(() => { load(); }, [pageType]);

  const load = async () => {
    setLoading(true);
    try {
      const res = await getCompanyPages();
      const d = res.data;
      const all = d?.results || (Array.isArray(d) ? d : []);
      const found = all.find(p => p.page_type === pageType);
      setPage(found || { page_type: pageType, title: meta.title, content: null, last_updated: null });
    } catch (_) {
      setPage({ page_type: pageType, title: meta.title, content: null, last_updated: null });
    } finally { setLoading(false); }
  };

  const openEdit = () => {
    setForm({ title: page?.title || meta.title, content: page?.content || '' });
    setEditDialog(true);
  };

  const handleSave = async () => {
    if (!form.title.trim() || !form.content.trim()) {
      setSnack({ open: true, msg: 'Titre et contenu sont obligatoires', severity: 'error' }); return;
    }
    setSaving(true);
    try {
      await updateCompanyPage(page?.id || null, {
        title: form.title.trim(),
        content: form.content.trim(),
        page_type: pageType,
      });
      setSnack({ open: true, msg: 'Page mise à jour avec succès', severity: 'success' });
      setEditDialog(false);
      load();
    } catch (e) {
      setSnack({ open: true, msg: e.response?.data?.detail || 'Erreur lors de la sauvegarde', severity: 'error' });
    } finally { setSaving(false); }
  };

  /* Formatte le contenu en paragraphes */
  const renderContent = (content) => {
    if (!content) return null;
    return content.split('\n').map((line, i) => {
      const isEmpty = line.trim() === '';
      const isHeader = !isEmpty && line.includes(':') && line.length < 60;
      return (
        <Typography key={i} sx={{
          mb: isEmpty ? 1.5 : 0.75,
          fontSize: isHeader ? '0.95rem' : '0.9rem',
          fontWeight: isHeader ? 700 : 400,
          color: isHeader ? '#1e293b' : '#475569',
          lineHeight: 1.8,
        }}>
          {line || ' '}
        </Typography>
      );
    });
  };

  return (
    <Box sx={{ width: '100%' }}>

      {/* Banner */}
      <Card elevation={0} sx={{ borderRadius: 3, border: '1px solid #e8ecf0', mb: 3, overflow: 'hidden' }}>
        <Box sx={{ background: 'linear-gradient(135deg,#0f172a 0%,#1e3a5f 60%,#1e40af 100%)',
          px: 3, py: 3, position: 'relative', overflow: 'hidden' }}>
          <Box sx={{ position: 'absolute', top: -30, right: -30, width: 140, height: 140, borderRadius: '50%',
            bgcolor: 'rgba(255,255,255,0.03)', pointerEvents: 'none' }} />

          <Button startIcon={<BackIcon />} onClick={() => navigate('/culture')} size="small"
            sx={{ color: 'rgba(255,255,255,0.6)', textTransform: 'none', borderRadius: 2, mb: 2,
              '&:hover': { bgcolor: 'rgba(255,255,255,0.08)', color: 'white' } }}>
            Retour à la Culture
          </Button>

          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.15)', width: 52, height: 52, borderRadius: 2.5,
                border: '1px solid rgba(255,255,255,0.2)' }}>
                {React.cloneElement(meta.icon, { sx: { color: 'white', fontSize: 26 } })}
              </Avatar>
              <Box>
                {loading ? (
                  <Skeleton width={220} height={32} sx={{ bgcolor: 'rgba(255,255,255,0.1)' }} />
                ) : (
                  <Typography variant="h5" fontWeight={700} color="white">
                    {page?.title || meta.title}
                  </Typography>
                )}
                {page?.last_updated && (
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, mt: 0.5 }}>
                    <CalendarIcon sx={{ fontSize: 13, color: 'rgba(255,255,255,0.5)' }} />
                    <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.6)' }}>
                      Mis à jour le {format(new Date(page.last_updated), 'dd MMMM yyyy', { locale: fr })}
                    </Typography>
                  </Box>
                )}
              </Box>
            </Box>

            {canEdit && (
              <Button startIcon={<EditIcon sx={{ fontSize: 16 }} />}
                onClick={openEdit} size="small"
                sx={{ color: 'rgba(255,255,255,0.8)', border: '1px solid rgba(255,255,255,0.25)',
                  borderRadius: 2, textTransform: 'none', fontWeight: 600,
                  '&:hover': { bgcolor: 'rgba(255,255,255,0.1)' } }}>
                Modifier le contenu
              </Button>
            )}
          </Box>
        </Box>
      </Card>

      {/* Contenu */}
      <Card elevation={0} sx={{ border: `1px solid ${meta.color}20`, borderRadius: 3,
        borderTop: `3px solid ${meta.color}`, overflow: 'hidden' }}>

        {/* Header de la card */}
        <Box sx={{ px: 3, py: 2, display: 'flex', alignItems: 'center', gap: 1.5,
          bgcolor: meta.bg, borderBottom: `1px solid ${meta.color}15` }}>
          <Avatar sx={{ bgcolor: `${meta.color}15`, width: 32, height: 32, borderRadius: 1.5 }}>
            {React.cloneElement(meta.icon, { sx: { color: meta.color, fontSize: 16 } })}
          </Avatar>
          <Typography sx={{ fontSize: '0.875rem', fontWeight: 700, color: meta.color }}>
            {meta.title}
          </Typography>
          <Chip label="Officiel" size="small"
            sx={{ ml: 'auto', bgcolor: `${meta.color}12`, color: meta.color, fontWeight: 700,
              fontSize: '0.65rem', height: 20, border: `1px solid ${meta.color}25` }} />
        </Box>

        <CardContent sx={{ p: 4 }}>
          {loading ? (
            <Box>
              {[1,2,3,4,5,6,7].map(i => (
                <Skeleton key={i} variant="text" height={22}
                  sx={{ mb: 0.75, width: i % 3 === 0 ? '70%' : '100%', borderRadius: 1 }} />
              ))}
            </Box>
          ) : page?.content ? (
            <Box>
              {renderContent(page.content)}
            </Box>
          ) : (
            <Box sx={{ textAlign: 'center', py: 7 }}>
              <Avatar sx={{ bgcolor: meta.bg, width: 64, height: 64, borderRadius: 3, mx: 'auto', mb: 2 }}>
                {React.cloneElement(meta.icon, { sx: { color: meta.color, fontSize: 32 } })}
              </Avatar>
              <Typography variant="h6" fontWeight={600} color="text.secondary" gutterBottom>
                Page non encore configurée
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3, maxWidth: 400, mx: 'auto' }}>
                Le contenu de cette page n'a pas encore été rédigé. Il sera disponible prochainement.
              </Typography>
              {canEdit && (
                <Button variant="contained" startIcon={<EditIcon />}
                  onClick={openEdit}
                  sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 600,
                    bgcolor: meta.color, '&:hover': { filter: 'brightness(0.9)' } }}>
                  Configurer cette page
                </Button>
              )}
            </Box>
          )}
        </CardContent>

        {/* Footer navigation entre les pages */}
        {!loading && page?.content && (
          <>
            <Divider />
            <Box sx={{ px: 3, py: 2, display: 'flex', gap: 1.5, flexWrap: 'wrap' }}>
              <Typography sx={{ fontSize: '0.78rem', color: '#64748b', fontWeight: 600,
                alignSelf: 'center', mr: 1 }}>
                Autres pages :
              </Typography>
              {Object.entries(PAGE_META).filter(([key]) => key !== pageType).map(([key, pm]) => (
                <Box key={key} onClick={() => navigate(`/culture/pages/${key}`)}
                  sx={{ display: 'flex', alignItems: 'center', gap: 0.75, px: 1.25, py: 0.4,
                    borderRadius: 50, cursor: 'pointer', fontSize: '0.78rem', fontWeight: 500,
                    border: `1px solid ${pm.color}25`, bgcolor: 'white', color: pm.color,
                    transition: 'all 0.15s', '&:hover': { bgcolor: pm.bg } }}>
                  <Avatar sx={{ bgcolor: pm.bg, width: 18, height: 18 }}>
                    {React.cloneElement(pm.icon, { sx: { color: pm.color, fontSize: 10 } })}
                  </Avatar>
                  {pm.title}
                </Box>
              ))}
            </Box>
          </>
        )}
      </Card>

      {/* ── Dialog d'édition inline ── */}
      <Dialog open={editDialog} onClose={() => setEditDialog(false)} maxWidth="md" fullWidth
        PaperProps={{ sx: { borderRadius: 3, overflow: 'hidden' } }}>
        <Box sx={{ background: 'linear-gradient(135deg,#0f172a,#1e3a5f,#1e40af)',
          px: 3, py: 2.5, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.75 }}>
            <Avatar sx={{ bgcolor: meta.bg, width: 38, height: 38, borderRadius: 2 }}>
              {React.cloneElement(meta.icon, { sx: { color: meta.color, fontSize: 20 } })}
            </Avatar>
            <Box>
              <Typography sx={{ color: 'white', fontWeight: 700, fontSize: '1rem' }}>
                {page?.id ? 'Modifier' : 'Configurer'} — {meta.title}
              </Typography>
              <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.6)' }}>
                {page?.id ? 'Mise à jour du contenu' : 'Première configuration'}
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
            <Box>
              <Typography sx={{ fontSize: '0.78rem', fontWeight: 700, color: '#475569',
                textTransform: 'uppercase', letterSpacing: '0.5px', mb: 0.75 }}>
                Titre <span style={{ color: '#ef4444' }}>*</span>
              </Typography>
              <TextField autoFocus fullWidth size="small" value={form.title}
                onChange={e => setForm(p => ({ ...p, title: e.target.value }))}
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2, fontSize: '0.875rem' } }} />
            </Box>
            <Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.75 }}>
                <Typography sx={{ fontSize: '0.78rem', fontWeight: 700, color: '#475569',
                  textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  Contenu <span style={{ color: '#ef4444' }}>*</span>
                </Typography>
                <Typography sx={{ fontSize: '0.72rem', color: '#94a3b8' }}>
                  {form.content.length} car.
                </Typography>
              </Box>
              <TextField fullWidth multiline rows={12} value={form.content}
                onChange={e => setForm(p => ({ ...p, content: e.target.value }))}
                placeholder="Rédigez le contenu de la page…"
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2, fontSize: '0.875rem' } }} />
            </Box>
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

export default ViewPage;
