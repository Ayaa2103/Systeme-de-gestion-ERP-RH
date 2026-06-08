import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box, Card, CardContent, Typography, Button, Grid, Chip, Avatar,
  IconButton, Dialog, DialogContent, DialogActions, TextField,
  FormControl, Select, MenuItem, InputAdornment, Skeleton,
  Table, TableHead, TableBody, TableRow, TableCell, TableContainer,
  Snackbar, Alert, Tooltip, Divider, Pagination,
} from '@mui/material';
import {
  Add as AddIcon,
  GetApp as DownloadIcon,
  Description as DocIcon,
  ArrowBack as BackIcon,
  Search as SearchIcon,
  Close as CloseIcon,
  CheckCircle as CheckIcon,
  Upload as UploadIcon,
  PictureAsPdf as PdfIcon,
  TableChart as ExcelIcon,
  Article as WordIcon,
  Slideshow as PptIcon,
  TextSnippet as TxtIcon,
  FolderOpen as FolderIcon,
  CalendarToday as CalendarIcon,
  Tag as VersionIcon,
} from '@mui/icons-material';
import { getDocuments, uploadDocument } from '../../services/knowledgeService';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

const PER_PAGE = 10;

const CATEGORIES = {
  quality:    { label: 'Qualité',     color: '#1976d2', bg: '#e3f2fd' },
  production: { label: 'Production',  color: '#7b1fa2', bg: '#f3e5f5' },
  security:   { label: 'Sécurité',    color: '#c62828', bg: '#ffebee' },
  hr:         { label: 'RH',          color: '#2e7d32', bg: '#e8f5e9' },
  other:      { label: 'Autre',       color: '#64748b', bg: '#f1f5f9' },
};

const FILE_ICONS = {
  pdf:  { icon: <PdfIcon />,   color: '#c62828', bg: '#ffebee' },
  doc:  { icon: <WordIcon />,  color: '#1565c0', bg: '#e3f2fd' },
  docx: { icon: <WordIcon />,  color: '#1565c0', bg: '#e3f2fd' },
  xls:  { icon: <ExcelIcon />, color: '#2e7d32', bg: '#e8f5e9' },
  xlsx: { icon: <ExcelIcon />, color: '#2e7d32', bg: '#e8f5e9' },
  ppt:  { icon: <PptIcon />,   color: '#e65100', bg: '#fff3e0' },
  pptx: { icon: <PptIcon />,   color: '#e65100', bg: '#fff3e0' },
  txt:  { icon: <TxtIcon />,   color: '#64748b', bg: '#f1f5f9' },
};

const getFileConfig = (filename = '') => {
  const ext = filename.split('.').pop()?.toLowerCase();
  return FILE_ICONS[ext] || { icon: <DocIcon />, color: '#1976d2', bg: '#e3f2fd' };
};

const colSx = {
  fontSize: '0.7rem', fontWeight: 700, color: '#475569',
  textTransform: 'uppercase', letterSpacing: '0.5px',
  bgcolor: '#f8fafc', borderBottom: '2px solid #e8ecf0', py: 1.25, px: 2,
};

const fieldSx = {
  '& .MuiOutlinedInput-root': {
    borderRadius: 2, fontSize: '0.875rem',
    '&:hover fieldset': { borderColor: '#1976d2' },
    '&.Mui-focused fieldset': { borderColor: '#1976d2' },
  },
};

const SectionLabel = ({ label, required }) => (
  <Typography sx={{ fontSize: '0.78rem', fontWeight: 700, color: '#475569',
    textTransform: 'uppercase', letterSpacing: '0.5px', mb: 0.75 }}>
    {label} {required && <span style={{ color: '#ef4444' }}>*</span>}
  </Typography>
);

const Documents = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef();

  const [documents,  setDocuments]  = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [search,     setSearch]     = useState('');
  const [catFilter,  setCatFilter]  = useState('');
  const [page,       setPage]       = useState(1);
  const [dialog,     setDialog]     = useState(false);
  const [saving,     setSaving]     = useState(false);
  const [dragging,   setDragging]   = useState(false);
  const [snack,      setSnack]      = useState({ open: false, msg: '', severity: 'success' });

  const [form, setForm] = useState({
    title: '', category: '', description: '', version: '1.0', file: null,
  });

  useEffect(() => { load(); }, []);

  const load = async () => {
    setLoading(true);
    try {
      const res = await getDocuments();
      setDocuments(Array.isArray(res) ? res : res?.data || []);
    } catch (_) { setDocuments([]); }
    finally { setLoading(false); }
  };

  const set = (field, val) => setForm(p => ({ ...p, [field]: val }));

  const handleFile = (file) => {
    if (file) set('file', file);
  };

  const handleDrop = (e) => {
    e.preventDefault(); setDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) set('file', file);
  };

  const handleCreate = async () => {
    if (!form.title || !form.category) {
      setSnack({ open: true, msg: 'Titre et catégorie sont obligatoires', severity: 'error' }); return;
    }
    setSaving(true);
    try {
      const fd = new FormData();
      fd.append('title',       form.title);
      fd.append('category',    form.category);
      fd.append('description', form.description || '');
      fd.append('version',     form.version);
      if (form.file) {
        fd.append('file', form.file);
      } else {
        const blob = new Blob([form.description || 'Document'], { type: 'text/plain' });
        fd.append('file', blob, `${form.title.replace(/\s+/g,'_')}.txt`);
      }
      await uploadDocument(fd);
      setSnack({ open: true, msg: 'Document ajouté avec succès', severity: 'success' });
      setDialog(false);
      setForm({ title: '', category: '', description: '', version: '1.0', file: null });
      load();
    } catch (e) {
      setSnack({ open: true, msg: e.response?.data?.error || 'Erreur lors de l\'ajout', severity: 'error' });
    } finally { setSaving(false); }
  };

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return documents.filter(d =>
      (!q || d.title?.toLowerCase().includes(q) || d.description?.toLowerCase().includes(q)) &&
      (!catFilter || d.category === catFilter)
    );
  }, [documents, search, catFilter]);

  const pages = Math.ceil(filtered.length / PER_PAGE) || 1;
  const paged = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  const countByCategory = (cat) => documents.filter(d => d.category === cat).length;

  const openDialog = () => { setDialog(true); setForm({ title: '', category: '', description: '', version: '1.0', file: null }); };

  return (
    <Box sx={{ width: '100%' }}>

      {/* Banner */}
      <Card elevation={0} sx={{ borderRadius: 3, border: '1px solid #e8ecf0', mb: 3, overflow: 'hidden' }}>
        <Box sx={{ background: 'linear-gradient(135deg,#0f172a 0%,#1e3a5f 60%,#1e40af 100%)',
          px: 3, py: 2.5, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Button startIcon={<BackIcon />} onClick={() => navigate('/knowledge')} size="small"
              sx={{ color: 'rgba(255,255,255,0.7)', textTransform: 'none', borderRadius: 2,
                '&:hover': { bgcolor: 'rgba(255,255,255,0.1)', color: 'white' } }}>
              Retour
            </Button>
            <Box sx={{ p: 1.25, borderRadius: 2, bgcolor: 'rgba(255,255,255,0.12)', display: 'inline-flex' }}>
              <FolderIcon sx={{ fontSize: 22, color: 'white' }} />
            </Box>
            <Box>
              <Typography variant="h5" fontWeight={700} color="white">Gestion des Documents</Typography>
              <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.65)', mt: 0.3 }}>
                {documents.length} document{documents.length !== 1 ? 's' : ''} — base documentaire des connaissances
              </Typography>
            </Box>
          </Box>
          <Button startIcon={<AddIcon />} onClick={openDialog}
            sx={{ bgcolor: 'rgba(255,255,255,0.15)', color: 'white', border: '1px solid rgba(255,255,255,0.25)',
              borderRadius: 2, textTransform: 'none', fontWeight: 600,
              '&:hover': { bgcolor: 'rgba(255,255,255,0.25)' } }}>
            Ajouter un document
          </Button>
        </Box>
      </Card>

      {/* Stat cards par catégorie */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={6} sm={4} md>
          <Card elevation={0} onClick={() => setCatFilter('')}
            sx={{ border: `1px solid ${catFilter === '' ? '#1976d2' : '#e8ecf0'}`, borderRadius: 3,
              cursor: 'pointer', bgcolor: catFilter === '' ? '#eff6ff' : 'white', transition: 'all 0.2s',
              '&:hover': { boxShadow: '0 4px 16px rgba(25,118,210,0.1)', borderColor: '#1976d2' } }}>
            <CardContent sx={{ p: 2 }}>
              <Avatar sx={{ bgcolor: '#1976d212', width: 32, height: 32, mb: 1 }}>
                <DocIcon sx={{ color: '#1976d2', fontSize: 16 }} />
              </Avatar>
              {loading ? <Skeleton width={32} height={28} /> : (
                <Typography variant="h4" fontWeight={800} sx={{ color: '#1976d2', lineHeight: 1 }}>{documents.length}</Typography>
              )}
              <Typography variant="caption" color="text.secondary" sx={{ mt: 0.4, display: 'block' }}>Tous</Typography>
            </CardContent>
          </Card>
        </Grid>
        {Object.entries(CATEGORIES).map(([key, cfg]) => (
          <Grid item xs={6} sm={4} md key={key}>
            <Card elevation={0} onClick={() => setCatFilter(p => p === key ? '' : key)}
              sx={{ border: `1px solid ${catFilter === key ? cfg.color : `${cfg.color}20`}`, borderRadius: 3,
                cursor: 'pointer', bgcolor: catFilter === key ? cfg.bg : 'white', transition: 'all 0.2s',
                '&:hover': { boxShadow: `0 4px 16px ${cfg.color}15`, borderColor: `${cfg.color}45` } }}>
              <CardContent sx={{ p: 2 }}>
                <Box sx={{ width: 8, height: 8, borderRadius: 0.5, bgcolor: cfg.color, mb: 1 }} />
                {loading ? <Skeleton width={32} height={28} /> : (
                  <Typography variant="h4" fontWeight={800} sx={{ color: cfg.color, lineHeight: 1 }}>
                    {countByCategory(key)}
                  </Typography>
                )}
                <Typography variant="caption" color="text.secondary" sx={{ mt: 0.4, display: 'block' }}>{cfg.label}</Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Search + filter */}
      <Card elevation={0} sx={{ border: '1px solid #e8ecf0', borderRadius: 3, mb: 3 }}>
        <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center' }}>
            <TextField placeholder="Rechercher par titre ou description…" value={search}
              onChange={e => { setSearch(e.target.value); setPage(1); }} size="small"
              sx={{ flex: 1, minWidth: 220, '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
              InputProps={{ startAdornment: <InputAdornment position="start"><SearchIcon sx={{ fontSize: 17, color: '#94a3b8' }} /></InputAdornment> }} />
            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
              {[{ val: '', label: 'Tous' }, ...Object.entries(CATEGORIES).map(([k,v]) => ({ val: k, label: v.label }))].map(f => {
                const active = catFilter === f.val;
                const cfg = f.val ? CATEGORIES[f.val] : null;
                return (
                  <Box key={f.val} onClick={() => { setCatFilter(p => p === f.val ? '' : f.val); setPage(1); }}
                    sx={{ px: 1.5, py: 0.4, borderRadius: 50, cursor: 'pointer', fontSize: '0.78rem',
                      fontWeight: active ? 700 : 500, userSelect: 'none', transition: 'all 0.15s',
                      border: `1px solid ${active ? (cfg?.color || '#1976d2') : '#e8ecf0'}`,
                      bgcolor: active ? (cfg?.bg || '#eff6ff') : 'white',
                      color: active ? (cfg?.color || '#1976d2') : '#475569' }}>
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

      {/* Table */}
      <Card elevation={0} sx={{ border: '1px solid #e8ecf0', borderRadius: 3, overflow: 'hidden' }}>
        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell sx={colSx}>Document</TableCell>
                <TableCell sx={colSx}>Catégorie</TableCell>
                <TableCell sx={colSx}>Description</TableCell>
                <TableCell sx={colSx}>Version</TableCell>
                <TableCell sx={colSx}>Date</TableCell>
                <TableCell sx={{ ...colSx, textAlign: 'right' }}>Télécharger</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i}>
                    {[1,2,3,4,5,6].map(j => (
                      <TableCell key={j} sx={{ py: 1.5, px: 2 }}>
                        <Skeleton height={20} sx={{ borderRadius: 1 }} />
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : paged.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} sx={{ textAlign: 'center', py: 7 }}>
                    <FolderIcon sx={{ fontSize: 44, color: '#cbd5e1', display: 'block', mx: 'auto', mb: 1 }} />
                    <Typography variant="body2" color="text.secondary">
                      {search || catFilter ? 'Aucun résultat' : 'Aucun document disponible'}
                    </Typography>
                    {!search && !catFilter && (
                      <Button startIcon={<AddIcon />} onClick={openDialog}
                        sx={{ mt: 1.5, textTransform: 'none', fontWeight: 600 }}>
                        Ajouter le premier document
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ) : paged.map(doc => {
                const cat = CATEGORIES[doc.category] || CATEGORIES.other;
                const fc  = getFileConfig(doc.file || doc.title);
                const fileUrl = doc.file
                  ? (doc.file.startsWith('http') ? doc.file : `${process.env.REACT_APP_API_URL || 'http://localhost:8000'}${doc.file}`)
                  : null;
                return (
                  <TableRow key={doc.id} hover
                    sx={{ '&:last-child td': { border: 0 }, '& td': { borderBottom: '1px solid #f1f5f9' } }}>

                    {/* Document */}
                    <TableCell sx={{ py: 1.5, px: 2 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                        <Avatar sx={{ bgcolor: fc.bg, width: 34, height: 34, borderRadius: 1.5 }}>
                          {React.cloneElement(fc.icon, { sx: { color: fc.color, fontSize: 16 } })}
                        </Avatar>
                        <Box>
                          <Typography sx={{ fontSize: '0.875rem', fontWeight: 600, color: '#1e293b' }}>
                            {doc.title}
                          </Typography>
                          {doc.uploaded_by_name && (
                            <Typography variant="caption" color="text.secondary">
                              par {doc.uploaded_by_name}
                            </Typography>
                          )}
                        </Box>
                      </Box>
                    </TableCell>

                    {/* Catégorie */}
                    <TableCell sx={{ py: 1.5, px: 2 }}>
                      <Chip label={cat.label} size="small"
                        sx={{ bgcolor: cat.bg, color: cat.color, fontWeight: 700, fontSize: '0.7rem',
                          height: 22, border: `1px solid ${cat.color}30` }} />
                    </TableCell>

                    {/* Description */}
                    <TableCell sx={{ py: 1.5, px: 2, maxWidth: 250 }}>
                      <Typography sx={{ fontSize: '0.8rem', color: '#64748b',
                        overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {doc.description || '—'}
                      </Typography>
                    </TableCell>

                    {/* Version */}
                    <TableCell sx={{ py: 1.5, px: 2 }}>
                      <Chip label={`v${doc.version || '1.0'}`} size="small"
                        sx={{ bgcolor: '#f8fafc', color: '#475569', border: '1px solid #e2e8f0',
                          fontWeight: 600, fontSize: '0.7rem', height: 20 }} />
                    </TableCell>

                    {/* Date */}
                    <TableCell sx={{ py: 1.5, px: 2 }}>
                      <Typography sx={{ fontSize: '0.8rem', color: '#64748b' }}>
                        {doc.created_at ? format(new Date(doc.created_at), 'dd MMM yyyy', { locale: fr }) : '—'}
                      </Typography>
                    </TableCell>

                    {/* Télécharger */}
                    <TableCell sx={{ py: 1.5, px: 2, textAlign: 'right' }}>
                      {fileUrl ? (
                        <Tooltip title="Télécharger">
                          <IconButton size="small" component="a" href={fileUrl} download target="_blank"
                            sx={{ color: '#1976d2', bgcolor: '#eff6ff', borderRadius: 1.5, width: 28, height: 28,
                              '&:hover': { bgcolor: '#dbeafe' } }}>
                            <DownloadIcon sx={{ fontSize: 14 }} />
                          </IconButton>
                        </Tooltip>
                      ) : (
                        <Typography variant="caption" color="text.disabled">—</Typography>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>

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

      {/* ── Dialog Ajouter ── */}
      <Dialog open={dialog} onClose={() => setDialog(false)} maxWidth="sm" fullWidth
        PaperProps={{ sx: { borderRadius: 3, overflow: 'hidden' } }}>
        <Box sx={{ background: 'linear-gradient(135deg,#0f172a,#1e3a5f,#1e40af)', px: 3, py: 2.5,
          display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.12)', width: 30, height: 30, borderRadius: 1.5 }}>
              <UploadIcon sx={{ fontSize: 15, color: 'white' }} />
            </Avatar>
            <Typography sx={{ color: 'white', fontWeight: 700 }}>Ajouter un document</Typography>
          </Box>
          <IconButton size="small" onClick={() => setDialog(false)}
            sx={{ color: 'rgba(255,255,255,0.6)', '&:hover': { color: 'white' } }}>
            <CloseIcon fontSize="small" />
          </IconButton>
        </Box>

        <DialogContent sx={{ p: 3 }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>

            {/* Titre + version */}
            <Box sx={{ display: 'flex', gap: 2 }}>
              <Box sx={{ flex: 1 }}>
                <SectionLabel label="Titre" required />
                <TextField autoFocus fullWidth size="small" placeholder="ex: Procédure de sécurité…"
                  value={form.title} onChange={e => set('title', e.target.value)} sx={fieldSx} />
              </Box>
              <Box sx={{ width: 100 }}>
                <SectionLabel label="Version" />
                <TextField fullWidth size="small" placeholder="1.0"
                  value={form.version} onChange={e => set('version', e.target.value)} sx={fieldSx} />
              </Box>
            </Box>

            {/* Catégorie — pills */}
            <Box>
              <SectionLabel label="Catégorie" required />
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75 }}>
                {Object.entries(CATEGORIES).map(([key, cfg]) => (
                  <Box key={key} onClick={() => set('category', key)}
                    sx={{ px: 1.5, py: 0.5, borderRadius: 50, cursor: 'pointer', fontSize: '0.82rem',
                      fontWeight: form.category === key ? 700 : 500, userSelect: 'none', transition: 'all 0.15s',
                      border: `2px solid ${form.category === key ? cfg.color : '#e8ecf0'}`,
                      bgcolor: form.category === key ? cfg.bg : 'white',
                      color: form.category === key ? cfg.color : '#475569',
                      '&:hover': { borderColor: cfg.color, bgcolor: cfg.bg } }}>
                    {cfg.label}
                  </Box>
                ))}
              </Box>
            </Box>

            {/* Description */}
            <Box>
              <SectionLabel label="Description" />
              <TextField fullWidth multiline rows={2} size="small" placeholder="Brève description du document…"
                value={form.description} onChange={e => set('description', e.target.value)} sx={fieldSx} />
            </Box>

            {/* Zone fichier */}
            <Box>
              <SectionLabel label="Fichier" />
              <Box
                onDragOver={e => { e.preventDefault(); setDragging(true); }}
                onDragLeave={() => setDragging(false)}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                sx={{ border: `2px dashed ${dragging ? '#1976d2' : form.file ? '#2e7d32' : '#e2e8f0'}`,
                  borderRadius: 2, p: 2.5, textAlign: 'center', cursor: 'pointer', transition: 'all 0.2s',
                  bgcolor: dragging ? '#eff6ff' : form.file ? '#f0fdf4' : '#fafafa',
                  '&:hover': { borderColor: '#1976d2', bgcolor: '#eff6ff' } }}>
                <input ref={fileInputRef} type="file" hidden
                  accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt"
                  onChange={e => handleFile(e.target.files[0])} />
                {form.file ? (
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1.5 }}>
                    {(() => { const fc = getFileConfig(form.file.name); return (
                      <Avatar sx={{ bgcolor: fc.bg, width: 36, height: 36, borderRadius: 1.5 }}>
                        {React.cloneElement(fc.icon, { sx: { color: fc.color, fontSize: 18 } })}
                      </Avatar>
                    ); })()}
                    <Box sx={{ textAlign: 'left' }}>
                      <Typography sx={{ fontSize: '0.875rem', fontWeight: 600, color: '#2e7d32' }}>
                        {form.file.name}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {(form.file.size / 1024).toFixed(1)} Ko · Cliquer pour changer
                      </Typography>
                    </Box>
                    <CheckIcon sx={{ fontSize: 18, color: '#2e7d32', ml: 'auto' }} />
                  </Box>
                ) : (
                  <Box>
                    <UploadIcon sx={{ fontSize: 32, color: '#94a3b8', mb: 0.75 }} />
                    <Typography sx={{ fontSize: '0.875rem', color: '#475569', fontWeight: 500 }}>
                      Glisser-déposer ou cliquer pour sélectionner
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      PDF, Word, Excel, PowerPoint, TXT
                    </Typography>
                  </Box>
                )}
              </Box>
              <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
                Si aucun fichier n'est joint, un fichier texte sera créé automatiquement
              </Typography>
            </Box>

          </Box>
        </DialogContent>

        <DialogActions sx={{ px: 3, pb: 2.5, gap: 1 }}>
          <Button onClick={() => setDialog(false)}
            sx={{ borderRadius: 2, textTransform: 'none', color: '#64748b' }}>Annuler</Button>
          <Button onClick={handleCreate} variant="contained" disabled={!form.title || !form.category || saving}
            sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 600,
              background: 'linear-gradient(135deg,#1e3a5f,#1e40af)',
              '&:disabled': { opacity: 0.5 } }}>
            {saving ? 'Ajout…' : 'Ajouter le document'}
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

export default Documents;
