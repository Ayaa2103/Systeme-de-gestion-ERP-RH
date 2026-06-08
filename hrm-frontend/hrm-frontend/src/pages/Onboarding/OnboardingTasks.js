import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box, Card, CardContent, Typography, Button, Grid, Avatar, Chip,
  Dialog, DialogContent, DialogActions, TextField, Alert, Checkbox,
  IconButton, Divider, LinearProgress, Skeleton, Snackbar, Tooltip,
  Collapse,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Assignment as TaskIcon,
  CheckCircle as CheckIcon,
  Schedule as PendingIcon,
  ArrowBack as BackIcon,
  HowToReg as OnboardIcon,
  ExpandMore as ExpandIcon,
  ExpandLess as CollapseIcon,
  Close as CloseIcon,
  Save as SaveIcon,
  PlaylistAdd as AddTaskIcon,
} from '@mui/icons-material';
import api from '../../services/api';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

const COLORS = ['#1976d2','#388e3c','#d32f2f','#7b1fa2','#f57c00','#0097a7'];
const avatarColor = (n = '') => COLORS[(n.charCodeAt(0) || 0) % COLORS.length];
const progressColor = (p) => p === 100 ? '#2e7d32' : p >= 50 ? '#1976d2' : p > 0 ? '#f57c00' : '#c62828';

const fieldSx = {
  '& .MuiOutlinedInput-root': {
    borderRadius: 2, fontSize: '0.875rem',
    '&:hover fieldset': { borderColor: '#1976d2' },
    '&.Mui-focused fieldset': { borderColor: '#1976d2' },
  },
};

const SLabel = ({ label, required }) => (
  <Typography sx={{ fontSize: '0.75rem', fontWeight: 700, color: '#475569',
    textTransform: 'uppercase', letterSpacing: '0.5px', mb: 0.75 }}>
    {label}{required && <span style={{ color: '#ef4444', marginLeft: 3 }}>*</span>}
  </Typography>
);

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

const OnboardingTasks = () => {
  const navigate = useNavigate();
  const [empList,   setEmpList]   = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [expanded,  setExpanded]  = useState({});

  const [dialog,    setDialog]    = useState({ open: false, task: null, empId: null });
  const [form,      setForm]      = useState({ employee: '', item_name: '' });
  const [saving,    setSaving]    = useState(false);
  const [snack,     setSnack]     = useState({ open: false, msg: '', severity: 'success' });

  useEffect(() => { load(); }, []);

  const load = async () => {
    setLoading(true);
    try {
      const [empRes, listRes] = await Promise.all([
        api.get('/onboarding/employees/'),
        api.get('/onboarding/employees-list/'),
      ]);
      setEmployees(Array.isArray(empRes.data) ? empRes.data : []);
      const list = Array.isArray(listRes.data) ? listRes.data : [];

      const withTasks = await Promise.allSettled(
        list.map(async emp => {
          try {
            const r = await api.get(`/onboarding/employee/${emp.id}/checklist/`);
            const tasks = Array.isArray(r.data) ? r.data : [];
            const done  = tasks.filter(t => t.is_completed).length;
            return { ...emp, tasks, done, total: tasks.length,
              progress: tasks.length > 0 ? Math.round((done / tasks.length) * 100) : 0 };
          } catch (_) {
            return { ...emp, tasks: [], done: 0, total: 0, progress: 0 };
          }
        })
      );
      setEmpList(withTasks.map(r => r.status === 'fulfilled' ? r.value : {}));
    } catch (_) { setEmpList([]); }
    finally { setLoading(false); }
  };

  const openAdd = (empId = '') => {
    setForm({ employee: empId || '', item_name: '' });
    setDialog({ open: true, task: null, empId: empId || null });
  };

  const openEdit = (task) => {
    setForm({ employee: task.employee || '', item_name: task.item_name || '' });
    setDialog({ open: true, task, empId: null });
  };

  const closeDialog = () => setDialog({ open: false, task: null, empId: null });

  const handleSave = async () => {
    if (!form.employee || !form.item_name.trim()) {
      setSnack({ open: true, msg: 'Employé et nom de tâche sont obligatoires', severity: 'error' }); return;
    }
    setSaving(true);
    try {
      if (dialog.task) {
        await api.put(`/onboarding/checklist/${dialog.task.id}/`, form);
        setSnack({ open: true, msg: 'Tâche modifiée avec succès', severity: 'success' });
      } else {
        await api.post('/onboarding/checklist/', form);
        setSnack({ open: true, msg: 'Tâche ajoutée avec succès', severity: 'success' });
      }
      closeDialog();
      load();
    } catch (_) {
      setSnack({ open: true, msg: 'Erreur lors de l\'opération', severity: 'error' });
    } finally { setSaving(false); }
  };

  const handleDelete = async (taskId) => {
    if (!window.confirm('Supprimer cette tâche définitivement ?')) return;
    try {
      await api.delete(`/onboarding/checklist/${taskId}/`);
      setSnack({ open: true, msg: 'Tâche supprimée', severity: 'info' });
      load();
    } catch (_) {
      setSnack({ open: true, msg: 'Erreur lors de la suppression', severity: 'error' });
    }
  };

  const toggleTask = async (taskId) => {
    try {
      await api.post(`/onboarding/checklist/${taskId}/toggle/`);
      load();
    } catch (_) {
      setSnack({ open: true, msg: 'Erreur lors de la mise à jour', severity: 'error' });
    }
  };

  const totalDone  = empList.reduce((s, e) => s + (e.done  || 0), 0);
  const totalTasks = empList.reduce((s, e) => s + (e.total || 0), 0);
  const totalPending = totalTasks - totalDone;

  return (
    <Box sx={{ width: '100%' }}>

      {/* Banner */}
      <Card elevation={0} sx={{ borderRadius: 3, border: '1px solid #e8ecf0', mb: 3, overflow: 'hidden' }}>
        <Box sx={{ background: 'linear-gradient(135deg,#0f172a 0%,#1e3a5f 60%,#1e40af 100%)',
          px: 3, py: 2.5, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Button startIcon={<BackIcon />} onClick={() => navigate('/onboarding')} size="small"
              sx={{ color: 'rgba(255,255,255,0.7)', textTransform: 'none', borderRadius: 2,
                '&:hover': { bgcolor: 'rgba(255,255,255,0.1)', color: 'white' } }}>
              Retour
            </Button>
            <Box sx={{ p: 1.25, borderRadius: 2, bgcolor: 'rgba(255,255,255,0.12)', display: 'inline-flex' }}>
              <TaskIcon sx={{ fontSize: 22, color: 'white' }} />
            </Box>
            <Box>
              <Typography variant="h5" fontWeight={700} color="white">Tâches d'intégration</Typography>
              <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.65)', mt: 0.3 }}>
                Suivi des tâches par employé · {empList.length} employé{empList.length !== 1 ? 's' : ''}
              </Typography>
            </Box>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            {/* Mini stats */}
            {[
              { label: 'Complétées', value: totalDone,    color: '#86efac' },
              { label: 'En attente', value: totalPending, color: '#fbbf24' },
            ].map(s => (
              <Box key={s.label} sx={{ textAlign: 'center' }}>
                <Typography sx={{ fontSize: '1.3rem', fontWeight: 800, color: s.color, lineHeight: 1 }}>{s.value}</Typography>
                <Typography sx={{ fontSize: '0.68rem', color: 'rgba(255,255,255,0.5)', mt: 0.2 }}>{s.label}</Typography>
              </Box>
            ))}
            <Button startIcon={<AddIcon />} onClick={() => openAdd()}
              sx={{ bgcolor: 'rgba(255,255,255,0.15)', color: 'white',
                border: '1px solid rgba(255,255,255,0.25)', borderRadius: 2,
                textTransform: 'none', fontWeight: 600,
                '&:hover': { bgcolor: 'rgba(255,255,255,0.25)' } }}>
              Nouvelle tâche
            </Button>
          </Box>
        </Box>
      </Card>

      {/* Stat cards */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        {[
          { label: 'Employés en intégration', value: empList.length,  color: '#1976d2', icon: <OnboardIcon /> },
          { label: 'Tâches complétées',        value: totalDone,       color: '#2e7d32', icon: <CheckIcon /> },
          { label: 'Tâches en attente',         value: totalPending,    color: '#f57c00', icon: <PendingIcon /> },
          { label: 'Total tâches',              value: totalTasks,      color: '#7b1fa2', icon: <TaskIcon /> },
        ].map((s, i) => (
          <Grid item xs={6} sm={3} key={i}>
            <Card elevation={0} sx={{ border: `1px solid ${s.color}20`, borderRadius: 3 }}>
              <CardContent sx={{ p: 2.5 }}>
                <Avatar sx={{ bgcolor: `${s.color}12`, width: 34, height: 34, mb: 1.5 }}>
                  {React.cloneElement(s.icon, { sx: { color: s.color, fontSize: 16 } })}
                </Avatar>
                {loading ? <Skeleton width={36} height={30} /> : (
                  <Typography variant="h4" fontWeight={800} sx={{ color: s.color, lineHeight: 1 }}>{s.value}</Typography>
                )}
                <Typography variant="caption" color="text.secondary" sx={{ mt: 0.4, display: 'block' }}>{s.label}</Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Liste employés avec tâches */}
      {loading ? (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {[1,2,3].map(i => <Skeleton key={i} variant="rounded" height={80} sx={{ borderRadius: 3 }} />)}
        </Box>
      ) : empList.length === 0 ? (
        <Card elevation={0} sx={{ borderRadius: 3, border: '2px dashed #e8ecf0' }}>
          <CardContent sx={{ textAlign: 'center', py: 7 }}>
            <OnboardIcon sx={{ fontSize: 44, color: '#cbd5e1', mb: 1 }} />
            <Typography variant="body2" color="text.secondary">Aucun employé en intégration</Typography>
          </CardContent>
        </Card>
      ) : (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {empList.map(emp => {
            const name = `${emp.user_data?.first_name || ''} ${emp.user_data?.last_name || ''}`.trim();
            const pc   = progressColor(emp.progress || 0);
            const open = !!expanded[emp.id];

            return (
              <Card key={emp.id} elevation={0}
                sx={{ borderRadius: 3, border: '1px solid #e8ecf0', overflow: 'hidden',
                  borderLeft: `4px solid ${pc}` }}>

                {/* Header employé */}
                <Box sx={{ px: 2.5, py: 2, display: 'flex', alignItems: 'center', gap: 2,
                  cursor: 'pointer', '&:hover': { bgcolor: '#f8fafc' }, transition: 'background 0.15s' }}
                  onClick={() => setExpanded(p => ({ ...p, [emp.id]: !p[emp.id] }))}>
                  <Avatar sx={{ bgcolor: avatarColor(name), width: 40, height: 40, fontSize: '0.9rem', fontWeight: 700, flexShrink: 0 }}>
                    {name[0]?.toUpperCase() || '?'}
                  </Avatar>
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Typography sx={{ fontSize: '0.95rem', fontWeight: 700, color: '#1e293b' }}>{name}</Typography>
                    <Typography variant="caption" color="text.secondary">
                      {emp.matricule}{emp.poste ? ` · ${emp.poste}` : ''}
                    </Typography>
                  </Box>

                  {/* Progression */}
                  <Box sx={{ minWidth: 140, display: { xs: 'none', sm: 'block' } }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.4 }}>
                      <Typography sx={{ fontSize: '0.72rem', color: '#64748b' }}>Progression</Typography>
                      <Typography sx={{ fontSize: '0.72rem', fontWeight: 700, color: pc }}>{emp.progress}%</Typography>
                    </Box>
                    <LinearProgress variant="determinate" value={emp.progress || 0}
                      sx={{ height: 5, borderRadius: 3, bgcolor: `${pc}15`,
                        '& .MuiLinearProgress-bar': { bgcolor: pc, borderRadius: 3 } }} />
                  </Box>

                  <Chip label={`${emp.done}/${emp.total}`} size="small"
                    sx={{ bgcolor: `${pc}10`, color: pc, fontWeight: 700, fontSize: '0.72rem',
                      border: `1px solid ${pc}25`, minWidth: 58 }} />

                  <Tooltip title="Ajouter une tâche">
                    <IconButton size="small" onClick={e => { e.stopPropagation(); openAdd(emp.id); }}
                      sx={{ color: '#1976d2', bgcolor: '#eff6ff', borderRadius: 1.5, width: 30, height: 30,
                        '&:hover': { bgcolor: '#dbeafe' } }}>
                      <AddTaskIcon sx={{ fontSize: 15 }} />
                    </IconButton>
                  </Tooltip>

                  {open ? <CollapseIcon sx={{ color: '#94a3b8', fontSize: 20 }} />
                        : <ExpandIcon   sx={{ color: '#94a3b8', fontSize: 20 }} />}
                </Box>

                {/* Tâches dépliables */}
                <Collapse in={open}>
                  <Divider />
                  {emp.tasks.length === 0 ? (
                    <Box sx={{ textAlign: 'center', py: 4 }}>
                      <TaskIcon sx={{ fontSize: 34, color: '#cbd5e1', mb: 0.75 }} />
                      <Typography variant="caption" color="text.secondary" display="block">
                        Aucune tâche assignée
                      </Typography>
                      <Button size="small" startIcon={<AddIcon />}
                        onClick={() => openAdd(emp.id)}
                        sx={{ mt: 1.25, textTransform: 'none', fontWeight: 600, fontSize: '0.78rem' }}>
                        Ajouter une tâche
                      </Button>
                    </Box>
                  ) : (
                    <Box>
                      {emp.tasks.map((task, i) => (
                        <React.Fragment key={task.id}>
                          <Box sx={{ px: 2.5, py: 1.25, display: 'flex', alignItems: 'center', gap: 1.5,
                            bgcolor: task.is_completed ? '#fafffe' : 'white',
                            '&:hover': { bgcolor: '#f8fafc' } }}>
                            <Checkbox size="small" checked={task.is_completed}
                              onChange={() => toggleTask(task.id)}
                              sx={{ p: 0, color: '#94a3b8', '&.Mui-checked': { color: '#2e7d32' } }} />
                            <Box sx={{ flex: 1, minWidth: 0 }}>
                              <Typography sx={{ fontSize: '0.85rem', fontWeight: task.is_completed ? 400 : 600,
                                color: task.is_completed ? '#64748b' : '#1e293b',
                                textDecoration: task.is_completed ? 'line-through' : 'none' }}>
                                {task.item_name}
                              </Typography>
                              {task.is_completed && task.completion_date && (
                                <Typography variant="caption" sx={{ color: '#2e7d32' }}>
                                  ✓ Terminé le {format(new Date(task.completion_date), 'dd MMM yyyy', { locale: fr })}
                                  {task.completed_by_name ? ` par ${task.completed_by_name}` : ''}
                                </Typography>
                              )}
                            </Box>
                            <Chip label={task.is_completed ? 'Terminé' : 'En attente'} size="small"
                              sx={{ bgcolor: task.is_completed ? '#e8f5e9' : '#fff8e1',
                                color: task.is_completed ? '#2e7d32' : '#f57c00',
                                fontWeight: 700, fontSize: '0.65rem', height: 20,
                                border: `1px solid ${task.is_completed ? '#a5d6a7' : '#ffe082'}` }} />
                            <Box sx={{ display: 'flex', gap: 0.5, flexShrink: 0 }}>
                              <Tooltip title="Modifier">
                                <IconButton size="small" onClick={() => openEdit(task)}
                                  sx={{ color: '#1976d2', bgcolor: '#eff6ff', borderRadius: 1.5, width: 26, height: 26,
                                    '&:hover': { bgcolor: '#dbeafe' } }}>
                                  <EditIcon sx={{ fontSize: 13 }} />
                                </IconButton>
                              </Tooltip>
                              <Tooltip title="Supprimer">
                                <IconButton size="small" onClick={() => handleDelete(task.id)}
                                  sx={{ color: '#c62828', bgcolor: '#ffebee', borderRadius: 1.5, width: 26, height: 26,
                                    '&:hover': { bgcolor: '#ffcdd2' } }}>
                                  <DeleteIcon sx={{ fontSize: 13 }} />
                                </IconButton>
                              </Tooltip>
                            </Box>
                          </Box>
                          {i < emp.tasks.length - 1 && <Divider />}
                        </React.Fragment>
                      ))}
                      {/* Bouton ajouter en bas de la liste */}
                      <Divider />
                      <Box sx={{ px: 2.5, py: 1.25 }}>
                        <Button size="small" startIcon={<AddIcon sx={{ fontSize: 14 }} />}
                          onClick={() => openAdd(emp.id)}
                          sx={{ textTransform: 'none', fontWeight: 600, fontSize: '0.78rem',
                            color: '#1976d2', '&:hover': { bgcolor: '#eff6ff' } }}>
                          Ajouter une tâche
                        </Button>
                      </Box>
                    </Box>
                  )}
                </Collapse>
              </Card>
            );
          })}
        </Box>
      )}

      {/* ── Dialog Ajouter / Modifier ── */}
      <Dialog open={dialog.open} onClose={closeDialog} maxWidth="sm" fullWidth
        PaperProps={{ sx: { borderRadius: 3, overflow: 'hidden' } }}>
        <Box sx={{ background: 'linear-gradient(135deg,#0f172a,#1e3a5f,#1e40af)',
          px: 3, py: 2.5, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.75 }}>
            <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.15)', width: 36, height: 36, borderRadius: 2 }}>
              {dialog.task ? <EditIcon sx={{ color: 'white', fontSize: 18 }} /> : <AddIcon sx={{ color: 'white', fontSize: 20 }} />}
            </Avatar>
            <Box>
              <Typography sx={{ color: 'white', fontWeight: 700, fontSize: '1rem', lineHeight: 1.2 }}>
                {dialog.task ? 'Modifier la tâche' : 'Nouvelle tâche d\'intégration'}
              </Typography>
              <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.6)' }}>
                {dialog.task ? 'Mettre à jour le nom ou l\'assignation' : 'Ajouter à la checklist d\'un employé'}
              </Typography>
            </Box>
          </Box>
          <IconButton size="small" onClick={closeDialog}
            sx={{ color: 'rgba(255,255,255,0.6)', '&:hover': { color: 'white' } }}>
            <CloseIcon fontSize="small" />
          </IconButton>
        </Box>

        <DialogContent sx={{ p: 3 }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>

            {/* Sélection employé */}
            <Box>
              <SLabel label="Employé" required />
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {employees.map(emp => {
                  const n = `${emp.user_data?.first_name || ''} ${emp.user_data?.last_name || ''}`.trim();
                  const sel = form.employee === emp.id;
                  return (
                    <Box key={emp.id} onClick={() => setForm(p => ({ ...p, employee: emp.id }))}
                      sx={{ display: 'flex', alignItems: 'center', gap: 0.75, px: 1.25, py: 0.6,
                        borderRadius: 2, cursor: 'pointer', transition: 'all 0.15s',
                        border: `2px solid ${sel ? '#1976d2' : '#e8ecf0'}`,
                        bgcolor: sel ? '#eff6ff' : 'white',
                        '&:hover': { borderColor: '#1976d2', bgcolor: '#f0f9ff' } }}>
                      <Avatar sx={{ bgcolor: avatarColor(n), width: 22, height: 22, fontSize: '0.6rem', fontWeight: 700 }}>
                        {n[0]?.toUpperCase() || '?'}
                      </Avatar>
                      <Typography sx={{ fontSize: '0.8rem', fontWeight: sel ? 700 : 500,
                        color: sel ? '#1976d2' : '#334155' }}>
                        {n || emp.matricule}
                      </Typography>
                      {sel && <CheckIcon sx={{ fontSize: 14, color: '#1976d2' }} />}
                    </Box>
                  );
                })}
              </Box>
            </Box>

            {/* Nom de la tâche */}
            <Box>
              <SLabel label="Nom de la tâche" required />
              <TextField autoFocus fullWidth size="small" value={form.item_name}
                onChange={e => setForm(p => ({ ...p, item_name: e.target.value }))}
                placeholder="ex: Remise du badge, Présentation équipe, Signature contrat…"
                sx={fieldSx} />
            </Box>
          </Box>
        </DialogContent>

        <DialogActions sx={{ px: 3, pb: 3, gap: 1.5 }}>
          <Button onClick={closeDialog}
            sx={{ borderRadius: 2, textTransform: 'none', color: '#64748b', flex: 1,
              border: '1px solid #e2e8f0', '&:hover': { bgcolor: '#f8fafc' } }}>
            Annuler
          </Button>
          <Button onClick={handleSave} variant="contained" disabled={saving || !form.employee || !form.item_name.trim()}
            startIcon={dialog.task ? <SaveIcon sx={{ fontSize: 16 }} /> : <AddIcon sx={{ fontSize: 16 }} />}
            sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 700, flex: 2,
              background: 'linear-gradient(135deg,#1e3a5f,#1e40af)',
              '&:hover': { background: 'linear-gradient(135deg,#0f172a,#1e3a5f)' },
              '&:disabled': { opacity: 0.5 } }}>
            {saving ? 'Enregistrement…' : dialog.task ? 'Enregistrer' : 'Ajouter la tâche'}
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

export default OnboardingTasks;
