import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box, Card, CardContent, Typography, Button, Grid, Avatar,
  Dialog, DialogContent, DialogActions, TextField,
  FormControl, Select, MenuItem, Skeleton, Divider, Chip,
  Snackbar, Alert, IconButton,
} from '@mui/material';
import {
  Psychology as SkillIcon,
  Work as PositionIcon,
  Description as DocumentIcon,
  TrendingUp as TrendingIcon,
  People as PeopleIcon,
  Assessment as MatrixIcon,
  Add as AddIcon,
  ArrowBack as BackIcon,
  ArrowForward as ArrowIcon,
  Close as CloseIcon,
  CheckCircle as CheckIcon,
  AccountTree as VerstaIcon,
  Lightbulb as KnowledgeIcon,
  Upload as UploadIcon,
} from '@mui/icons-material';
import { getKnowledgeStats, createSkill, createPosition } from '../../services/knowledgeService';
import { getDepartments } from '../../services/hrService';

const CATEGORIES = ['Technique','Management','Communication','Qualité','Sécurité','Linguistique','Informatique'];

const COLORS = ['#1976d2','#2e7d32','#7b1fa2','#e65100','#0891b2','#c62828','#5d4037','#0097a7'];
const deptColor = (name = '') => COLORS[(name.charCodeAt(0) || 0) % COLORS.length];

const fieldSx = {
  '& .MuiOutlinedInput-root': {
    borderRadius: 2, fontSize: '0.875rem',
    '&:hover fieldset': { borderColor: '#1976d2' },
    '&.Mui-focused fieldset': { borderColor: '#1976d2' },
  },
};

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

const KnowledgeDashboard = () => {
  const navigate = useNavigate();

  const [stats,       setStats]       = useState({});
  const [departments, setDepartments] = useState([]);
  const [loading,     setLoading]     = useState(true);

  const [skillDialog,    setSkillDialog]    = useState(false);
  const [positionDialog, setPositionDialog] = useState(false);
  const [newSkill,    setNewSkill]    = useState({ name: '', category: '', description: '' });
  const [newPosition, setNewPosition] = useState({ name: '', department: '', description: '' });
  const [saving,      setSaving]      = useState(false);
  const [snack,       setSnack]       = useState({ open: false, msg: '', severity: 'success' });

  useEffect(() => { load(); }, []);

  const load = async () => {
    setLoading(true);
    const [statsRes, deptsRes] = await Promise.allSettled([
      getKnowledgeStats(),
      getDepartments(),
    ]);
    if (statsRes.status === 'fulfilled') setStats(statsRes.value?.data || statsRes.value || {});
    if (deptsRes.status === 'fulfilled') setDepartments(Array.isArray(deptsRes.value.data) ? deptsRes.value.data : []);
    setLoading(false);
  };

  const handleCreateSkill = async () => {
    if (!newSkill.name) return;
    setSaving(true);
    try {
      await createSkill(newSkill);
      setSkillDialog(false);
      setNewSkill({ name: '', category: '', description: '' });
      setSnack({ open: true, msg: 'Compétence créée avec succès', severity: 'success' });
      load();
    } catch (_) {
      setSnack({ open: true, msg: 'Erreur lors de la création', severity: 'error' });
    } finally { setSaving(false); }
  };

  const handleCreatePosition = async () => {
    if (!newPosition.name || !newPosition.department) return;
    setSaving(true);
    try {
      await createPosition(newPosition);
      setPositionDialog(false);
      setNewPosition({ name: '', department: '', description: '' });
      setSnack({ open: true, msg: 'Poste créé avec succès', severity: 'success' });
      load();
    } catch (_) {
      setSnack({ open: true, msg: 'Erreur lors de la création', severity: 'error' });
    } finally { setSaving(false); }
  };

  const kpis = [
    { label: 'Compétences',        value: stats.total_skills                  ?? 0,  color: '#1976d2', icon: <SkillIcon />,   path: '/knowledge/skills-matrix',      action: () => setSkillDialog(true) },
    { label: 'Postes définis',     value: stats.total_positions               ?? 0,  color: '#2e7d32', icon: <PositionIcon />, path: '/knowledge/versatility-matrix', action: () => setPositionDialog(true) },
    { label: 'Documents',          value: stats.total_documents               ?? 0,  color: '#e65100', icon: <DocumentIcon />, path: '/knowledge/documents' },
    { label: 'Employés évalués',   value: stats.total_employees_with_skills   ?? 0,  color: '#7b1fa2', icon: <PeopleIcon /> },
    { label: 'Moy. compétences',   value: Math.round((stats.avg_skills_per_employee ?? 0) * 10) / 10, color: '#0891b2', icon: <TrendingIcon /> },
  ];

  const quickLinks = [
    { label: 'Matrice des compétences', sub: 'Niveaux par employé & département', icon: <MatrixIcon />,  color: '#1976d2', bg: '#eff6ff', path: '/knowledge/skills-matrix' },
    { label: 'Matrice de polyvalence',  sub: 'Couverture des postes par employé', icon: <VerstaIcon />,  color: '#2e7d32', bg: '#f0fdf4', path: '/knowledge/versatility-matrix' },
    { label: 'Documents',               sub: 'Référentiels et guides internes',   icon: <DocumentIcon />,color: '#e65100', bg: '#fff7ed', path: '/knowledge/documents' },
  ];

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
              <KnowledgeIcon sx={{ fontSize: 22, color: 'white' }} />
            </Box>
            <Box>
              <Typography variant="h5" fontWeight={700} color="white">Connaissances & Compétences</Typography>
              <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.65)', mt: 0.3 }}>
                Gestion des compétences, polyvalence et documents
              </Typography>
            </Box>
          </Box>
          <Box sx={{ display: 'flex', gap: 1.5 }}>
            <Button startIcon={<AddIcon />} onClick={() => setSkillDialog(true)} size="small"
              sx={{ color: 'rgba(255,255,255,0.8)', border: '1px solid rgba(255,255,255,0.25)',
                borderRadius: 2, textTransform: 'none', fontWeight: 600,
                '&:hover': { bgcolor: 'rgba(255,255,255,0.1)' } }}>
              Compétence
            </Button>
            <Button startIcon={<AddIcon />} onClick={() => setPositionDialog(true)} size="small"
              sx={{ bgcolor: 'rgba(255,255,255,0.15)', color: 'white',
                border: '1px solid rgba(255,255,255,0.25)', borderRadius: 2,
                textTransform: 'none', fontWeight: 600,
                '&:hover': { bgcolor: 'rgba(255,255,255,0.25)' } }}>
              Poste
            </Button>
          </Box>
        </Box>
      </Card>

      {/* KPI Cards */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        {kpis.map((k, i) => (
          <Grid item xs={6} sm={4} md key={i}>
            <Card elevation={0} onClick={k.path ? () => navigate(k.path) : undefined}
              sx={{ border: '1px solid', borderColor: `${k.color}20`, borderRadius: 3, height: '100%',
                cursor: k.path ? 'pointer' : 'default', transition: 'all 0.2s',
                '&:hover': k.path ? { boxShadow: `0 4px 16px ${k.color}15`, borderColor: `${k.color}40`, transform: 'translateY(-2px)' } : {} }}>
              <CardContent sx={{ p: 2.5 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <Box>
                    {loading ? <Skeleton width={44} height={36} /> : (
                      <Typography variant="h3" fontWeight={800} sx={{ color: k.color, lineHeight: 1 }}>{k.value}</Typography>
                    )}
                    <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>{k.label}</Typography>
                  </Box>
                  <Avatar sx={{ bgcolor: `${k.color}12`, width: 40, height: 40 }}>
                    {React.cloneElement(k.icon, { sx: { color: k.color, fontSize: 20 } })}
                  </Avatar>
                </Box>
                {k.action && (
                  <Button size="small" startIcon={<AddIcon sx={{ fontSize: 13 }} />}
                    onClick={e => { e.stopPropagation(); k.action(); }}
                    sx={{ mt: 1.5, textTransform: 'none', fontWeight: 600, fontSize: '0.72rem',
                      color: k.color, border: `1px solid ${k.color}30`, borderRadius: 2, py: 0.3,
                      '&:hover': { bgcolor: `${k.color}08` } }}>
                    Ajouter
                  </Button>
                )}
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Grid container spacing={3}>

        {/* Accès rapide */}
        <Grid item xs={12} md={4}>
          <Card elevation={0} sx={{ borderRadius: 3, border: '1px solid #e8ecf0', overflow: 'hidden', height: '100%' }}>
            <NavHeader title="Accès rapide" icon={<ArrowIcon />} />
            <CardContent sx={{ p: 2, display: 'flex', flexDirection: 'column', gap: 1.5 }}>
              {quickLinks.map(link => (
                <Box key={link.path} onClick={() => navigate(link.path)}
                  sx={{ display: 'flex', alignItems: 'center', gap: 1.5, p: 1.5, borderRadius: 2,
                    cursor: 'pointer', border: '1px solid #f1f5f9', bgcolor: 'white',
                    transition: 'all 0.15s',
                    '&:hover': { bgcolor: link.bg, borderColor: `${link.color}20`, transform: 'translateX(4px)' } }}>
                  <Avatar sx={{ bgcolor: link.bg, width: 38, height: 38 }}>
                    {React.cloneElement(link.icon, { sx: { color: link.color, fontSize: 18 } })}
                  </Avatar>
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Typography sx={{ fontSize: '0.875rem', fontWeight: 700, color: '#1e293b' }}>{link.label}</Typography>
                    <Typography variant="caption" color="text.secondary">{link.sub}</Typography>
                  </Box>
                  <ArrowIcon sx={{ fontSize: 16, color: '#94a3b8', flexShrink: 0 }} />
                </Box>
              ))}

              <Divider />

              {/* Upload document */}
              <Box onClick={() => navigate('/knowledge/documents')}
                sx={{ display: 'flex', alignItems: 'center', gap: 1.5, p: 1.5, borderRadius: 2,
                  cursor: 'pointer', border: '1px dashed #e8ecf0', bgcolor: '#fafafa',
                  transition: 'all 0.15s', '&:hover': { bgcolor: '#eff6ff', borderColor: '#bfdbfe' } }}>
                <Avatar sx={{ bgcolor: '#eff6ff', width: 38, height: 38 }}>
                  <UploadIcon sx={{ color: '#1976d2', fontSize: 18 }} />
                </Avatar>
                <Box>
                  <Typography sx={{ fontSize: '0.875rem', fontWeight: 600, color: '#1e293b' }}>Ajouter un document</Typography>
                  <Typography variant="caption" color="text.secondary">PDF, Word, Excel…</Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Matrices par département */}
        <Grid item xs={12} md={4}>
          <Card elevation={0} sx={{ borderRadius: 3, border: '1px solid #e8ecf0', overflow: 'hidden', height: '100%' }}>
            <NavHeader title="Matrices de compétences" icon={<MatrixIcon />}
              action={
                <Button size="small" endIcon={<ArrowIcon sx={{ fontSize: 13 }} />}
                  onClick={() => navigate('/knowledge/skills-matrix')}
                  sx={{ color: 'rgba(255,255,255,0.7)', textTransform: 'none', fontSize: '0.75rem',
                    '&:hover': { color: 'white' } }}>
                  Voir tout
                </Button>
              } />
            <CardContent sx={{ p: 2 }}>
              {loading ? (
                [1,2,3].map(i => <Skeleton key={i} height={40} sx={{ mb: 0.75, borderRadius: 2 }} />)
              ) : departments.length === 0 ? (
                <Box sx={{ textAlign: 'center', py: 4 }}>
                  <MatrixIcon sx={{ fontSize: 36, color: '#cbd5e1', mb: 1 }} />
                  <Typography variant="caption" color="text.secondary" display="block">
                    Aucun département configuré
                  </Typography>
                </Box>
              ) : (
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.75 }}>
                  {departments.slice(0, 6).map(dept => {
                    const dc = deptColor(dept.name);
                    return (
                      <Box key={dept.id} onClick={() => navigate(`/knowledge/skills-matrix?department=${dept.id}`)}
                        sx={{ display: 'flex', alignItems: 'center', gap: 1.5, p: 1.25, borderRadius: 2,
                          cursor: 'pointer', border: '1px solid #f1f5f9', bgcolor: 'white', transition: 'all 0.15s',
                          '&:hover': { bgcolor: `${dc}08`, borderColor: `${dc}25` } }}>
                        <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: dc, flexShrink: 0 }} />
                        <Typography sx={{ fontSize: '0.82rem', fontWeight: 600, color: '#1e293b', flex: 1 }} noWrap>
                          {dept.name}
                        </Typography>
                        {dept.code && (
                          <Chip label={dept.code} size="small"
                            sx={{ bgcolor: `${dc}10`, color: dc, fontWeight: 700, fontSize: '0.65rem', height: 18 }} />
                        )}
                        <MatrixIcon sx={{ fontSize: 14, color: '#94a3b8' }} />
                      </Box>
                    );
                  })}
                  {departments.length > 6 && (
                    <Typography variant="caption" color="text.secondary" sx={{ textAlign: 'center', pt: 0.5 }}>
                      + {departments.length - 6} autres départements
                    </Typography>
                  )}
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Polyvalence par département */}
        <Grid item xs={12} md={4}>
          <Card elevation={0} sx={{ borderRadius: 3, border: '1px solid #e8ecf0', overflow: 'hidden', height: '100%' }}>
            <NavHeader title="Matrices de polyvalence" icon={<VerstaIcon />}
              action={
                <Button size="small" endIcon={<ArrowIcon sx={{ fontSize: 13 }} />}
                  onClick={() => navigate('/knowledge/versatility-matrix')}
                  sx={{ color: 'rgba(255,255,255,0.7)', textTransform: 'none', fontSize: '0.75rem',
                    '&:hover': { color: 'white' } }}>
                  Voir tout
                </Button>
              } />
            <CardContent sx={{ p: 2 }}>
              {loading ? (
                [1,2,3].map(i => <Skeleton key={i} height={40} sx={{ mb: 0.75, borderRadius: 2 }} />)
              ) : departments.length === 0 ? (
                <Box sx={{ textAlign: 'center', py: 4 }}>
                  <VerstaIcon sx={{ fontSize: 36, color: '#cbd5e1', mb: 1 }} />
                  <Typography variant="caption" color="text.secondary" display="block">
                    Aucun département configuré
                  </Typography>
                </Box>
              ) : (
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.75 }}>
                  {departments.slice(0, 6).map(dept => {
                    const dc = deptColor(dept.name);
                    return (
                      <Box key={dept.id} onClick={() => navigate(`/knowledge/versatility-matrix?department=${dept.id}`)}
                        sx={{ display: 'flex', alignItems: 'center', gap: 1.5, p: 1.25, borderRadius: 2,
                          cursor: 'pointer', border: '1px solid #f1f5f9', bgcolor: 'white', transition: 'all 0.15s',
                          '&:hover': { bgcolor: `${dc}08`, borderColor: `${dc}25` } }}>
                        <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: dc, flexShrink: 0 }} />
                        <Typography sx={{ fontSize: '0.82rem', fontWeight: 600, color: '#1e293b', flex: 1 }} noWrap>
                          {dept.name}
                        </Typography>
                        {dept.code && (
                          <Chip label={dept.code} size="small"
                            sx={{ bgcolor: `${dc}10`, color: dc, fontWeight: 700, fontSize: '0.65rem', height: 18 }} />
                        )}
                        <VerstaIcon sx={{ fontSize: 14, color: '#94a3b8' }} />
                      </Box>
                    );
                  })}
                  {departments.length > 6 && (
                    <Typography variant="caption" color="text.secondary" sx={{ textAlign: 'center', pt: 0.5 }}>
                      + {departments.length - 6} autres départements
                    </Typography>
                  )}
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* ── Dialog Compétence ── */}
      <Dialog open={skillDialog} onClose={() => setSkillDialog(false)} maxWidth="sm" fullWidth
        PaperProps={{ sx: { borderRadius: 3, overflow: 'hidden' } }}>
        <Box sx={{ background: 'linear-gradient(135deg,#0f172a,#1e3a5f,#1e40af)', px: 3, py: 2,
          display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.12)', width: 30, height: 30, borderRadius: 1.5 }}>
              <SkillIcon sx={{ fontSize: 15, color: 'white' }} />
            </Avatar>
            <Typography sx={{ color: 'white', fontWeight: 700 }}>Nouvelle compétence</Typography>
          </Box>
          <IconButton size="small" onClick={() => setSkillDialog(false)}
            sx={{ color: 'rgba(255,255,255,0.6)', '&:hover': { color: 'white' } }}>
            <CloseIcon fontSize="small" />
          </IconButton>
        </Box>
        <DialogContent sx={{ p: 3 }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Box>
              <Typography sx={{ fontSize: '0.78rem', fontWeight: 700, color: '#475569',
                textTransform: 'uppercase', letterSpacing: '0.5px', mb: 0.75 }}>
                Nom <span style={{ color: '#ef4444' }}>*</span>
              </Typography>
              <TextField autoFocus fullWidth size="small" placeholder="ex: React.js, Gestion de projet…"
                value={newSkill.name} onChange={e => setNewSkill(p => ({ ...p, name: e.target.value }))} sx={fieldSx} />
            </Box>
            <Box>
              <Typography sx={{ fontSize: '0.78rem', fontWeight: 700, color: '#475569',
                textTransform: 'uppercase', letterSpacing: '0.5px', mb: 0.75 }}>Catégorie</Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75 }}>
                {CATEGORIES.map(cat => (
                  <Box key={cat} onClick={() => setNewSkill(p => ({ ...p, category: cat }))}
                    sx={{ px: 1.5, py: 0.4, borderRadius: 50, cursor: 'pointer', fontSize: '0.78rem',
                      fontWeight: newSkill.category === cat ? 700 : 500, userSelect: 'none', transition: 'all 0.15s',
                      border: `1px solid ${newSkill.category === cat ? '#1976d2' : '#e8ecf0'}`,
                      bgcolor: newSkill.category === cat ? '#eff6ff' : 'white',
                      color: newSkill.category === cat ? '#1976d2' : '#475569' }}>
                    {cat}
                  </Box>
                ))}
              </Box>
            </Box>
            <Box>
              <Typography sx={{ fontSize: '0.78rem', fontWeight: 700, color: '#475569',
                textTransform: 'uppercase', letterSpacing: '0.5px', mb: 0.75 }}>Description</Typography>
              <TextField fullWidth multiline rows={3} size="small" placeholder="Description optionnelle…"
                value={newSkill.description} onChange={e => setNewSkill(p => ({ ...p, description: e.target.value }))} sx={fieldSx} />
            </Box>
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2.5, gap: 1 }}>
          <Button onClick={() => setSkillDialog(false)}
            sx={{ borderRadius: 2, textTransform: 'none', color: '#64748b' }}>Annuler</Button>
          <Button onClick={handleCreateSkill} variant="contained" disabled={!newSkill.name || saving}
            sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 600,
              background: 'linear-gradient(135deg,#1e3a5f,#1e40af)' }}>
            Créer la compétence
          </Button>
        </DialogActions>
      </Dialog>

      {/* ── Dialog Poste ── */}
      <Dialog open={positionDialog} onClose={() => setPositionDialog(false)} maxWidth="sm" fullWidth
        PaperProps={{ sx: { borderRadius: 3, overflow: 'hidden' } }}>
        <Box sx={{ background: 'linear-gradient(135deg,#0f172a,#1e3a5f,#1e40af)', px: 3, py: 2,
          display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.12)', width: 30, height: 30, borderRadius: 1.5 }}>
              <PositionIcon sx={{ fontSize: 15, color: 'white' }} />
            </Avatar>
            <Typography sx={{ color: 'white', fontWeight: 700 }}>Nouveau poste</Typography>
          </Box>
          <IconButton size="small" onClick={() => setPositionDialog(false)}
            sx={{ color: 'rgba(255,255,255,0.6)', '&:hover': { color: 'white' } }}>
            <CloseIcon fontSize="small" />
          </IconButton>
        </Box>
        <DialogContent sx={{ p: 3 }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Box>
              <Typography sx={{ fontSize: '0.78rem', fontWeight: 700, color: '#475569',
                textTransform: 'uppercase', letterSpacing: '0.5px', mb: 0.75 }}>
                Nom du poste <span style={{ color: '#ef4444' }}>*</span>
              </Typography>
              <TextField autoFocus fullWidth size="small" placeholder="ex: Développeur, Chef de projet…"
                value={newPosition.name} onChange={e => setNewPosition(p => ({ ...p, name: e.target.value }))} sx={fieldSx} />
            </Box>
            <Box>
              <Typography sx={{ fontSize: '0.78rem', fontWeight: 700, color: '#475569',
                textTransform: 'uppercase', letterSpacing: '0.5px', mb: 0.75 }}>
                Département <span style={{ color: '#ef4444' }}>*</span>
              </Typography>
              <FormControl fullWidth size="small">
                <Select value={newPosition.department} displayEmpty
                  onChange={e => setNewPosition(p => ({ ...p, department: e.target.value }))}
                  renderValue={v => v ? departments.find(d => d.id === v)?.name : <span style={{ color: '#94a3b8', fontSize: '0.875rem' }}>Sélectionner…</span>}
                  sx={{ borderRadius: 2, fontSize: '0.875rem' }}>
                  {departments.map(d => <MenuItem key={d.id} value={d.id}>{d.name}</MenuItem>)}
                </Select>
              </FormControl>
            </Box>
            <Box>
              <Typography sx={{ fontSize: '0.78rem', fontWeight: 700, color: '#475569',
                textTransform: 'uppercase', letterSpacing: '0.5px', mb: 0.75 }}>Description</Typography>
              <TextField fullWidth multiline rows={3} size="small" placeholder="Description optionnelle…"
                value={newPosition.description} onChange={e => setNewPosition(p => ({ ...p, description: e.target.value }))} sx={fieldSx} />
            </Box>
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2.5, gap: 1 }}>
          <Button onClick={() => setPositionDialog(false)}
            sx={{ borderRadius: 2, textTransform: 'none', color: '#64748b' }}>Annuler</Button>
          <Button onClick={handleCreatePosition} variant="contained"
            disabled={!newPosition.name || !newPosition.department || saving}
            sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 600,
              background: 'linear-gradient(135deg,#1e3a5f,#1e40af)' }}>
            Créer le poste
          </Button>
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

export default KnowledgeDashboard;
