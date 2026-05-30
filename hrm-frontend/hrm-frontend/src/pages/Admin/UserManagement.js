import React, { useState, useEffect } from 'react';
import {
  Box, Card, CardContent, Typography, Button, Grid, Chip,
  IconButton, Menu, MenuItem, TextField, InputAdornment,
  CircularProgress, Divider, Dialog, DialogTitle, DialogContent,
  DialogActions, Alert, Avatar,
} from '@mui/material';
import {
  People as PeopleIcon,
  Add as AddIcon,
  Search as SearchIcon,
  MoreVert as MoreVertIcon,
  Edit as EditIcon,
  LockReset as ResetPwdIcon,
  Block as DeactivateIcon,
  CheckCircle as ActivateIcon,
  AdminPanelSettings as AdminIcon,
  ManageAccounts as ManageIcon,
  Person as PersonIcon,
  SupervisedUserCircle as DirectorIcon,
} from '@mui/icons-material';
import { getUsers, createUser, updateUser, resetUserPassword, toggleUserActive } from '../../services/hrService';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

const roleConfig = {
  administrator: { label: 'Administrateur', color: '#c62828', bg: '#ffebee', icon: <AdminIcon sx={{ fontSize: 14 }} /> },
  hr_director:   { label: 'Dir. RH',        color: '#6a1b9a', bg: '#f3e5f5', icon: <DirectorIcon sx={{ fontSize: 14 }} /> },
  hr_manager:    { label: 'Resp. RH',       color: '#1565c0', bg: '#e3f2fd', icon: <ManageIcon sx={{ fontSize: 14 }} /> },
  employee:      { label: 'Employé',        color: '#2e7d32', bg: '#e8f5e9', icon: <PersonIcon sx={{ fontSize: 14 }} /> },
};

const AVATAR_COLORS = ['#1565c0', '#6a1b9a', '#c62828', '#2e7d32', '#e65100', '#00695c'];
const avatarColor = (id) => AVATAR_COLORS[id % AVATAR_COLORS.length];

const initials = (u) =>
  u.first_name && u.last_name
    ? `${u.first_name[0]}${u.last_name[0]}`.toUpperCase()
    : u.username?.[0]?.toUpperCase() || 'U';

const ROLE_CHOICES = [
  { value: 'employee',      label: 'Employé' },
  { value: 'hr_manager',    label: 'Responsable RH' },
  { value: 'hr_director',   label: 'Directeur RH' },
  { value: 'administrator', label: 'Administrateur' },
];

const fieldSx = { '& .MuiOutlinedInput-root': { borderRadius: 2 } };

const emptyForm = { username: '', email: '', first_name: '', last_name: '', phone: '', role: 'employee', password: '' };

const UserManagement = () => {
  const [users, setUsers]             = useState([]);
  const [loading, setLoading]         = useState(true);
  const [searchTerm, setSearchTerm]   = useState('');
  const [roleFilter, setRoleFilter]   = useState('');
  const [anchorEl, setAnchorEl]       = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);

  // Dialogs
  const [createDialog, setCreateDialog]   = useState(false);
  const [editDialog, setEditDialog]       = useState(false);
  const [resetDialog, setResetDialog]     = useState(false);

  // Forms
  const [form, setForm]           = useState(emptyForm);
  const [newPassword, setNewPassword] = useState('');
  const [formError, setFormError] = useState('');
  const [saving, setSaving]       = useState(false);

  useEffect(() => { fetchUsers(); }, []);

  const fetchUsers = async () => {
    try {
      const res = await getUsers();
      setUsers(res.data);
    } catch (_) {}
    finally { setLoading(false); }
  };

  const filtered = users.filter(u => {
    const q = searchTerm.toLowerCase();
    const matchSearch = !q ||
      u.username?.toLowerCase().includes(q) ||
      u.first_name?.toLowerCase().includes(q) ||
      u.last_name?.toLowerCase().includes(q) ||
      u.email?.toLowerCase().includes(q);
    const matchRole = !roleFilter || u.role === roleFilter;
    return matchSearch && matchRole;
  });

  const countByRole = (role) => users.filter(u => u.role === role).length;
  const activeCount = users.filter(u => u.is_active).length;

  /* ── Actions ─────────────────────────────────────────────── */
  const openEdit = (user) => {
    document.activeElement?.blur();
    setSelectedUser(user);
    setForm({ username: user.username, email: user.email, first_name: user.first_name, last_name: user.last_name, phone: user.phone || '', role: user.role, password: '' });
    setFormError('');
    setAnchorEl(null);
    setEditDialog(true);
  };

  const openReset = (user) => {
    document.activeElement?.blur();
    setSelectedUser(user);
    setNewPassword('');
    setFormError('');
    setAnchorEl(null);
    setResetDialog(true);
  };

  const handleToggleActive = async (user) => {
    setAnchorEl(null);
    try {
      await toggleUserActive(user.id);
      await fetchUsers();
    } catch (_) {}
  };

  const handleCreate = async () => {
    setFormError('');
    if (!form.username || !form.password || !form.email) {
      setFormError("Nom d'utilisateur, email et mot de passe sont obligatoires.");
      return;
    }
    setSaving(true);
    try {
      await createUser(form);
      await fetchUsers();
      setCreateDialog(false);
      setForm(emptyForm);
    } catch (err) {
      setFormError(err.response?.data?.error || 'Erreur lors de la création');
    } finally { setSaving(false); }
  };

  const handleEdit = async () => {
    setFormError('');
    setSaving(true);
    try {
      await updateUser(selectedUser.id, { first_name: form.first_name, last_name: form.last_name, email: form.email, phone: form.phone, role: form.role });
      await fetchUsers();
      setEditDialog(false);
    } catch (err) {
      setFormError(err.response?.data?.error || 'Erreur lors de la modification');
    } finally { setSaving(false); }
  };

  const handleResetPassword = async () => {
    setFormError('');
    if (!newPassword || newPassword.length < 6) {
      setFormError('Le mot de passe doit contenir au moins 6 caractères.');
      return;
    }
    setSaving(true);
    try {
      await resetUserPassword(selectedUser.id, newPassword);
      setResetDialog(false);
    } catch (err) {
      setFormError(err.response?.data?.error || 'Erreur');
    } finally { setSaving(false); }
  };

  /* ── Render ───────────────────────────────────────────────── */
  return (
    <Box sx={{ width: '100%' }}>

      {/* Banner */}
      <Card elevation={0} sx={{ borderRadius: 3, border: '1px solid #e8ecf0', mb: 3, overflow: 'hidden' }}>
        <Box sx={{
          background: 'linear-gradient(135deg, #0f172a 0%, #1e3a5f 60%, #1e40af 100%)',
          px: 3, py: 2.5, display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        }}>
          <Box>
            <Typography variant="h5" fontWeight={700} color="white">Gestion des Utilisateurs</Typography>
            <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.65)', mt: 0.3 }}>
              {users.length} compte{users.length !== 1 ? 's' : ''} · {activeCount} actif{activeCount !== 1 ? 's' : ''}
            </Typography>
          </Box>
          <Button
            variant="contained" startIcon={<AddIcon />}
            onClick={() => { document.activeElement?.blur(); setForm(emptyForm); setFormError(''); setCreateDialog(true); }}
            sx={{
              bgcolor: 'rgba(255,255,255,0.15)', color: 'white',
              border: '1px solid rgba(255,255,255,0.25)', borderRadius: 2,
              textTransform: 'none', fontWeight: 600, backdropFilter: 'blur(8px)',
              '&:hover': { bgcolor: 'rgba(255,255,255,0.25)' },
            }}
          >
            Nouveau Compte
          </Button>
        </Box>
      </Card>

      {/* Stat cards */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        {ROLE_CHOICES.map(({ value, label }) => {
          const rc = roleConfig[value];
          return (
            <Grid item xs={6} sm={3} key={value}>
              <Card elevation={0} sx={{ border: '1px solid #e8ecf0', borderRadius: 3,
                transition: 'all 0.3s', '&:hover': { boxShadow: `0 6px 20px ${rc.color}18`, borderColor: `${rc.color}45` } }}>
                <CardContent sx={{ p: 2.5 }}>
                  <Box sx={{ p: 1, borderRadius: 2, bgcolor: rc.bg, display: 'inline-flex', mb: 1.5 }}>
                    {React.cloneElement(rc.icon, { sx: { fontSize: 20, color: rc.color } })}
                  </Box>
                  {loading ? <CircularProgress size={20} sx={{ color: rc.color }} /> : (
                    <>
                      <Typography variant="h4" fontWeight={700} sx={{ color: rc.color, lineHeight: 1 }}>{countByRole(value)}</Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5, fontSize: '0.8rem' }}>{label}</Typography>
                    </>
                  )}
                </CardContent>
              </Card>
            </Grid>
          );
        })}
      </Grid>

      {/* Filter bar */}
      <Card elevation={0} sx={{ border: '1px solid #e8ecf0', borderRadius: 3, mb: 3 }}>
        <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center' }}>
            <TextField
              placeholder="Rechercher par nom, username, email…"
              value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
              size="small" sx={{ flex: 1, minWidth: 200, ...fieldSx }}
              disabled={createDialog || editDialog || resetDialog}
              InputProps={{ startAdornment: <InputAdornment position="start"><SearchIcon sx={{ fontSize: 18, color: 'text.disabled' }} /></InputAdornment> }}
            />
            <TextField
              select size="small" value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)}
              sx={{ width: 180, ...fieldSx }} SelectProps={{ displayEmpty: true }}
              disabled={createDialog || editDialog || resetDialog}
            >
              <MenuItem value="">Tous les rôles</MenuItem>
              {ROLE_CHOICES.map(r => <MenuItem key={r.value} value={r.value}>{r.label}</MenuItem>)}
            </TextField>
            <Typography variant="body2" color="text.secondary" sx={{ flexShrink: 0 }}>
              {filtered.length} résultat{filtered.length !== 1 ? 's' : ''}
            </Typography>
          </Box>
        </CardContent>
      </Card>

      {/* User cards */}
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}><CircularProgress /></Box>
      ) : filtered.length === 0 ? (
        <Card elevation={0} sx={{ border: '1px solid #e8ecf0', borderRadius: 3 }}>
          <CardContent sx={{ textAlign: 'center', py: 8 }}>
            <PeopleIcon sx={{ fontSize: 56, color: 'text.disabled', mb: 1.5 }} />
            <Typography variant="h6" color="text.secondary">Aucun utilisateur trouvé</Typography>
          </CardContent>
        </Card>
      ) : (
        <Grid container spacing={2}>
          {filtered.map((u) => {
            const rc = roleConfig[u.role] || roleConfig.employee;
            return (
              <Grid item xs={12} md={6} lg={4} key={u.id}>
                <Card elevation={0} sx={{
                  border: '1px solid #e8ecf0', borderRadius: 3,
                  borderLeft: `4px solid ${u.is_active ? rc.color : '#bdbdbd'}`,
                  opacity: u.is_active ? 1 : 0.65,
                  transition: 'all 0.2s',
                  '&:hover': { boxShadow: '0 4px 16px rgba(25,118,210,0.10)', borderColor: '#1976d230' },
                }}>
                  <CardContent sx={{ p: 2.5 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'center', flex: 1, minWidth: 0 }}>
                        <Avatar sx={{ width: 42, height: 42, bgcolor: avatarColor(u.id), fontWeight: 700, fontSize: '0.95rem', flexShrink: 0 }}>
                          {initials(u)}
                        </Avatar>
                        <Box sx={{ minWidth: 0 }}>
                          <Typography variant="subtitle2" fontWeight={700} noWrap>
                            {u.first_name || u.last_name ? `${u.first_name} ${u.last_name}`.trim() : u.username}
                          </Typography>
                          <Typography variant="caption" color="text.secondary" noWrap>@{u.username}</Typography>
                        </Box>
                      </Box>
                      <IconButton size="small" sx={{ flexShrink: 0, ml: 0.5 }}
                        onClick={(e) => { setAnchorEl(e.currentTarget); setSelectedUser(u); }}>
                        <MoreVertIcon fontSize="small" />
                      </IconButton>
                    </Box>

                    <Box sx={{ display: 'flex', gap: 1, mt: 1.5, flexWrap: 'wrap' }}>
                      <Chip label={rc.label} size="small"
                        sx={{ bgcolor: rc.bg, color: rc.color, fontWeight: 600, fontSize: '0.7rem', border: `1px solid ${rc.color}30` }} />
                      <Chip
                        label={u.is_active ? 'Actif' : 'Inactif'} size="small"
                        sx={{ bgcolor: u.is_active ? '#e8f5e9' : '#f5f5f5', color: u.is_active ? '#2e7d32' : '#757575', fontWeight: 600, fontSize: '0.7rem' }}
                      />
                    </Box>

                    <Divider sx={{ my: 1.5 }} />
                    <Typography variant="caption" color="text.secondary" noWrap sx={{ display: 'block' }}>{u.email || '—'}</Typography>
                    {u.date_joined && (
                      <Typography variant="caption" color="text.disabled">
                        Créé le {format(new Date(u.date_joined), 'dd MMM yyyy', { locale: fr })}
                      </Typography>
                    )}
                  </CardContent>
                </Card>
              </Grid>
            );
          })}
        </Grid>
      )}

      {/* Context menu */}
      <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={() => setAnchorEl(null)}
        PaperProps={{ elevation: 0, sx: { border: '1px solid #e8ecf0', borderRadius: 2, minWidth: 180 } }}>
        <MenuItem onClick={() => openEdit(selectedUser)} sx={{ fontSize: '0.875rem' }}>
          <EditIcon sx={{ mr: 1.5, fontSize: 18 }} />Modifier
        </MenuItem>
        <MenuItem onClick={() => openReset(selectedUser)} sx={{ fontSize: '0.875rem' }}>
          <ResetPwdIcon sx={{ mr: 1.5, fontSize: 18 }} />Réinitialiser MDP
        </MenuItem>
        <Divider />
        <MenuItem onClick={() => handleToggleActive(selectedUser)}
          sx={{ fontSize: '0.875rem', color: selectedUser?.is_active ? '#c62828' : '#2e7d32' }}>
          {selectedUser?.is_active
            ? <><DeactivateIcon sx={{ mr: 1.5, fontSize: 18 }} />Désactiver</>
            : <><ActivateIcon sx={{ mr: 1.5, fontSize: 18 }} />Activer</>}
        </MenuItem>
      </Menu>

      {/* Dialog — Créer */}
      <UserFormDialog
        open={createDialog} onClose={() => setCreateDialog(false)}
        title="Nouveau Compte Utilisateur"
        form={form} setForm={setForm}
        onSubmit={handleCreate} saving={saving} error={formError}
        isCreate
      />

      {/* Dialog — Modifier */}
      <UserFormDialog
        open={editDialog} onClose={() => setEditDialog(false)}
        title="Modifier l'Utilisateur"
        form={form} setForm={setForm}
        onSubmit={handleEdit} saving={saving} error={formError}
      />

      {/* Dialog — Reset MDP */}
      <Dialog open={resetDialog} onClose={() => setResetDialog(false)} maxWidth="xs" fullWidth
        TransitionProps={{ onEntered: () => document.getElementById('reset-pwd-input')?.focus() }}>
        <DialogTitle sx={{
          background: 'linear-gradient(135deg, #0f172a 0%, #1e3a5f 60%, #1e40af 100%)',
          color: 'white', py: 2,
        }}>
          Réinitialiser le Mot de Passe
        </DialogTitle>
        <DialogContent sx={{ pt: 3 }}>
          {formError && <Alert severity="error" sx={{ mb: 2 }}>{formError}</Alert>}
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Compte : <strong>@{selectedUser?.username}</strong>
          </Typography>
          <TextField id="reset-pwd-input" fullWidth label="Nouveau mot de passe" type="password"
            value={newPassword} onChange={(e) => setNewPassword(e.target.value)}
            sx={fieldSx} helperText="Minimum 6 caractères" />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setResetDialog(false)} sx={{ textTransform: 'none' }}>Annuler</Button>
          <Button onClick={handleResetPassword} variant="contained" disabled={saving}
            startIcon={saving ? <CircularProgress size={16} /> : <ResetPwdIcon />}
            sx={{ textTransform: 'none', borderRadius: 2 }}>
            Réinitialiser
          </Button>
        </DialogActions>
      </Dialog>

    </Box>
  );
};

/* ── Sub-component: UserFormDialog ───────────────────────── */
const UserFormDialog = ({ open, onClose, title, form, setForm, onSubmit, saving, error, isCreate }) => {
  const f = (field) => (e) => setForm(prev => ({ ...prev, [field]: e.target.value }));
  const firstFieldRef = React.useRef(null);
  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth
      TransitionProps={{ onEntered: () => firstFieldRef.current?.focus() }}>
      <DialogTitle sx={{
        background: 'linear-gradient(135deg, #0f172a 0%, #1e3a5f 60%, #1e40af 100%)',
        color: 'white', py: 2,
      }}>
        {title}
      </DialogTitle>
      <DialogContent sx={{ pt: 3 }}>
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        <Grid container spacing={2}>
          <Grid item xs={6}>
            <TextField inputRef={firstFieldRef} fullWidth label="Prénom" value={form.first_name} onChange={f('first_name')} sx={fieldSx} />
          </Grid>
          <Grid item xs={6}>
            <TextField fullWidth label="Nom" value={form.last_name} onChange={f('last_name')} sx={fieldSx} />
          </Grid>
          <Grid item xs={12}>
            <TextField fullWidth label="Nom d'utilisateur *" value={form.username} onChange={f('username')} disabled={!isCreate} sx={fieldSx} />
          </Grid>
          <Grid item xs={12}>
            <TextField fullWidth label="Email *" type="email" value={form.email} onChange={f('email')} sx={fieldSx} />
          </Grid>
          <Grid item xs={6}>
            <TextField fullWidth label="Téléphone" value={form.phone} onChange={f('phone')} sx={fieldSx} />
          </Grid>
          <Grid item xs={6}>
            <TextField select fullWidth label="Rôle" value={form.role} onChange={f('role')} sx={fieldSx}>
              {ROLE_CHOICES.map(r => <MenuItem key={r.value} value={r.value}>{r.label}</MenuItem>)}
            </TextField>
          </Grid>
          {isCreate && (
            <Grid item xs={12}>
              <TextField fullWidth label="Mot de passe *" type="password" value={form.password} onChange={f('password')} sx={fieldSx} helperText="Minimum 6 caractères" />
            </Grid>
          )}
        </Grid>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={onClose} sx={{ textTransform: 'none' }}>Annuler</Button>
        <Button onClick={onSubmit} variant="contained" disabled={saving}
          startIcon={saving ? <CircularProgress size={16} /> : null}
          sx={{ textTransform: 'none', borderRadius: 2 }}>
          {isCreate ? 'Créer le compte' : 'Enregistrer'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default UserManagement;
