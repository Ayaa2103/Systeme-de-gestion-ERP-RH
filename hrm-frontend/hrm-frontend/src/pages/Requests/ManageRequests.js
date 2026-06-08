import React, { useState, useEffect } from 'react';
import {
  Box, Card, CardContent, Typography, Tabs, Tab, Chip, Button,
  Dialog, DialogTitle, DialogContent, DialogActions, TextField,
  Avatar, IconButton, Grid, Divider, Alert, Snackbar, Skeleton,
} from '@mui/material';
import {
  CheckCircle as CheckIcon,
  Cancel as RejectIcon,
  Schedule as ScheduleIcon,
  CalendarToday as CalendarIcon,
  Description as DocIcon,
  Assignment as MissionIcon,
  ArrowBack as BackIcon,
  Inbox as InboxIcon,
  Close as CloseIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { getPendingRequests, approveRequest, rejectRequest } from '../../services/hrService';

const COLORS = ['#1976d2','#9c27b0','#2e7d32','#e65100','#0097a7','#c62828'];
const avatarColor = (name = '') => COLORS[(name.charCodeAt(0) || 0) % COLORS.length];

const TAB_CONFIG = [
  { label: 'Congés',       key: 'leave',       icon: <CalendarIcon sx={{ fontSize: 16 }} />, color: '#1976d2', bg: '#eff6ff',  apiKey: 'leave_requests'       },
  { label: 'Attestations', key: 'attestation', icon: <DocIcon     sx={{ fontSize: 16 }} />, color: '#7b1fa2', bg: '#fdf4ff',  apiKey: 'attestation_requests' },
  { label: 'Missions',     key: 'mission',     icon: <MissionIcon sx={{ fontSize: 16 }} />, color: '#e65100', bg: '#fff7ed',  apiKey: 'mission_requests'     },
  { label: 'Bulletins',    key: 'payslip',     icon: <DocIcon     sx={{ fontSize: 16 }} />, color: '#2e7d32', bg: '#f0fdf4',  apiKey: 'payslip_requests'     },
];

const ManageRequests = () => {
  const navigate = useNavigate();
  const [tabValue, setTabValue]   = useState(0);
  const [requests, setRequests]   = useState({ leave: [], attestation: [], mission: [], payslip: [] });
  const [loading, setLoading]     = useState(true);
  const [dialog, setDialog]       = useState({ open: false, request: null, action: '' });
  const [comment, setComment]     = useState('');
  const [saving, setSaving]       = useState(false);
  const [snack, setSnack]         = useState({ open: false, msg: '', severity: 'success' });

  useEffect(() => { fetchRequests(); }, []);

  const fetchRequests = async () => {
    setLoading(true);
    try {
      const res = await getPendingRequests();
      setRequests({
        leave:       res.data.leave_requests        || [],
        attestation: res.data.attestation_requests  || [],
        mission:     res.data.mission_requests      || [],
        payslip:     res.data.payslip_requests      || [],
      });
    } catch (_) {}
    finally { setLoading(false); }
  };

  const openDialog = (request, type, action) => {
    setDialog({ open: true, request: { ...request, type }, action });
    setComment('');
  };

  const closeDialog = () => setDialog({ open: false, request: null, action: '' });

  const handleAction = async () => {
    const { request, action } = dialog;
    if (!request?.type || !request?.id) return;
    setSaving(true);
    try {
      if (action === 'approve') await approveRequest(request.type, request.id, comment);
      else                      await rejectRequest(request.type, request.id, comment);
      setSnack({ open: true, msg: action === 'approve' ? 'Demande approuvée' : 'Demande rejetée', severity: action === 'approve' ? 'success' : 'info' });
      closeDialog();
      fetchRequests();
    } catch (e) {
      setSnack({ open: true, msg: e.response?.data?.error || 'Erreur lors du traitement', severity: 'error' });
    } finally { setSaving(false); }
  };

  const currentTab  = TAB_CONFIG[tabValue];
  const currentList = requests[currentTab.key] || [];
  const pending     = (req) => req.status === 'pending';

  const RequestRow = ({ request, type }) => {
    const tc = TAB_CONFIG.find(t => t.key === type);
    const name = request.requester_name || '—';
    return (
      <Box sx={{ px: 2.5, py: 1.75, display: 'flex', alignItems: 'center', gap: 2,
        transition: 'background 0.15s', '&:hover': { bgcolor: '#f8fafc' } }}>

        {/* Avatar */}
        <Avatar sx={{ bgcolor: avatarColor(name), width: 38, height: 38, fontSize: '0.85rem', fontWeight: 700, flexShrink: 0 }}>
          {name[0]?.toUpperCase() || '?'}
        </Avatar>

        {/* Info */}
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
            <Typography sx={{ fontSize: '0.875rem', fontWeight: 600, color: '#1e293b' }}>{name}</Typography>
            {request.requester_matricule && (
              <Typography variant="caption" color="text.secondary">· {request.requester_matricule}</Typography>
            )}
          </Box>
          <Box sx={{ display: 'flex', gap: 1.5, mt: 0.4, flexWrap: 'wrap', alignItems: 'center' }}>
            {type === 'leave' && request.start_date && (
              <Typography variant="caption" color="text.secondary">
                {format(new Date(request.start_date), 'dd MMM', { locale: fr })} → {format(new Date(request.end_date), 'dd MMM yyyy', { locale: fr })}
              </Typography>
            )}
            {type === 'attestation' && (
              <Typography variant="caption" color="text.secondary">{request.attestation_type} · {request.purpose}</Typography>
            )}
            {type === 'mission' && request.start_date && (
              <Typography variant="caption" color="text.secondary">
                {request.destination} · {format(new Date(request.start_date), 'dd MMM', { locale: fr })} → {format(new Date(request.end_date), 'dd MMM', { locale: fr })}
              </Typography>
            )}
            {type === 'payslip' && (
              <Typography variant="caption" color="text.secondary">Période : {request.periode_mois}</Typography>
            )}
            <Typography variant="caption" sx={{ color: '#94a3b8' }}>
              · {format(new Date(request.created_at), 'dd/MM/yyyy', { locale: fr })}
            </Typography>
          </Box>
        </Box>

        {/* Status chip */}
        {!pending(request) && (
          <Chip
            label={request.status === 'approved' ? 'Approuvé' : 'Rejeté'}
            size="small"
            sx={{ bgcolor: request.status === 'approved' ? '#e8f5e9' : '#ffebee',
              color: request.status === 'approved' ? '#2e7d32' : '#c62828',
              fontWeight: 700, fontSize: '0.68rem', height: 22 }} />
        )}

        {/* Actions */}
        {pending(request) && (
          <Box sx={{ display: 'flex', gap: 0.75, flexShrink: 0 }}>
            <Button variant="contained" size="small" startIcon={<CheckIcon sx={{ fontSize: 14 }} />}
              onClick={() => openDialog(request, type, 'approve')}
              sx={{ bgcolor: '#2e7d32', '&:hover': { bgcolor: '#1b5e20' }, borderRadius: 2,
                textTransform: 'none', fontWeight: 600, fontSize: '0.75rem', py: 0.5, px: 1.25 }}>
              Approuver
            </Button>
            <Button variant="outlined" size="small" startIcon={<RejectIcon sx={{ fontSize: 14 }} />}
              onClick={() => openDialog(request, type, 'reject')}
              sx={{ borderColor: '#c62828', color: '#c62828', '&:hover': { bgcolor: '#ffebee', borderColor: '#c62828' },
                borderRadius: 2, textTransform: 'none', fontWeight: 600, fontSize: '0.75rem', py: 0.5, px: 1.25 }}>
              Rejeter
            </Button>
          </Box>
        )}
      </Box>
    );
  };

  return (
    <Box sx={{ width: '100%' }}>

      {/* Banner */}
      <Card elevation={0} sx={{ borderRadius: 3, border: '1px solid #e8ecf0', mb: 3, overflow: 'hidden' }}>
        <Box sx={{ background: 'linear-gradient(135deg,#0f172a 0%,#1e3a5f 60%,#1e40af 100%)',
          px: 3, py: 2.5, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Button startIcon={<BackIcon />} onClick={() => navigate('/dashboard')} size="small"
              sx={{ color: 'rgba(255,255,255,0.7)', textTransform: 'none', borderRadius: 2,
                '&:hover': { bgcolor: 'rgba(255,255,255,0.1)', color: 'white' } }}>
              Retour
            </Button>
            <Box sx={{ p: 1.25, borderRadius: 2, bgcolor: 'rgba(255,255,255,0.12)', display: 'inline-flex' }}>
              <InboxIcon sx={{ fontSize: 22, color: 'white' }} />
            </Box>
            <Box>
              <Typography variant="h5" fontWeight={700} color="white">Gestion des Demandes</Typography>
              <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.65)', mt: 0.3 }}>
                {TAB_CONFIG.reduce((s, t) => s + (requests[t.key]?.filter(pending).length || 0), 0)} demande(s) en attente
              </Typography>
            </Box>
          </Box>
        </Box>
      </Card>

      {/* Stat cards */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        {TAB_CONFIG.map(tab => {
          const count = (requests[tab.key] || []).filter(pending).length;
          return (
            <Grid item xs={6} sm={3} key={tab.key}>
              <Card elevation={0} onClick={() => setTabValue(TAB_CONFIG.indexOf(tab))}
                sx={{ border: '1px solid', borderColor: tabValue === TAB_CONFIG.indexOf(tab) ? `${tab.color}50` : `${tab.color}15`,
                  borderRadius: 3, cursor: 'pointer', transition: 'all 0.2s',
                  bgcolor: tabValue === TAB_CONFIG.indexOf(tab) ? `${tab.color}06` : 'white',
                  '&:hover': { boxShadow: `0 4px 16px ${tab.color}15`, borderColor: `${tab.color}40` } }}>
                <CardContent sx={{ p: 2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.75 }}>
                    <Avatar sx={{ bgcolor: `${tab.color}12`, width: 30, height: 30 }}>
                      {React.cloneElement(tab.icon, { sx: { color: tab.color, fontSize: 15 } })}
                    </Avatar>
                    <Typography sx={{ fontSize: '0.75rem', fontWeight: 600, color: '#475569' }}>{tab.label}</Typography>
                  </Box>
                  <Typography variant="h4" fontWeight={800} sx={{ color: tab.color, lineHeight: 1 }}>{count}</Typography>
                  <Typography variant="caption" color="text.secondary">en attente</Typography>
                </CardContent>
              </Card>
            </Grid>
          );
        })}
      </Grid>

      {/* Tabs + content */}
      <Card elevation={0} sx={{ border: '1px solid #e8ecf0', borderRadius: 3, overflow: 'hidden' }}>
        <Box sx={{ borderBottom: '1px solid #e8ecf0', bgcolor: '#f8fafc' }}>
          <Tabs value={tabValue} onChange={(_, v) => setTabValue(v)}
            sx={{ minHeight: 48, '& .MuiTab-root': { minHeight: 48, textTransform: 'none', fontWeight: 600, fontSize: '0.85rem' },
              '& .MuiTabs-indicator': { height: 3, borderRadius: '3px 3px 0 0' } }}>
            {TAB_CONFIG.map((tab, i) => {
              const count = (requests[tab.key] || []).filter(pending).length;
              return (
                <Tab key={tab.key} label={
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                    {tab.label}
                    {count > 0 && (
                      <Box sx={{ bgcolor: tab.color, color: 'white', borderRadius: '50%', width: 18, height: 18,
                        display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.65rem', fontWeight: 700 }}>
                        {count}
                      </Box>
                    )}
                  </Box>
                } />
              );
            })}
          </Tabs>
        </Box>

        {loading ? (
          <Box sx={{ p: 2 }}>
            {[1,2,3].map(i => <Skeleton key={i} height={64} sx={{ mb: 0.5, borderRadius: 2 }} />)}
          </Box>
        ) : currentList.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 6 }}>
            <Box sx={{ p: 2, borderRadius: 3, bgcolor: '#f8fafc', display: 'inline-flex', mb: 1.5 }}>
              <CheckIcon sx={{ fontSize: 40, color: '#2e7d32', opacity: 0.5 }} />
            </Box>
            <Typography variant="body1" fontWeight={600} color="text.secondary">Aucune demande</Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
              Pas de demande {currentTab.label.toLowerCase()} pour le moment
            </Typography>
          </Box>
        ) : (
          currentList.map((req, i) => (
            <React.Fragment key={req.id}>
              <RequestRow request={req} type={currentTab.key} />
              {i < currentList.length - 1 && <Divider />}
            </React.Fragment>
          ))
        )}
      </Card>

      {/* Action dialog */}
      <Dialog open={dialog.open} onClose={closeDialog} maxWidth="sm" fullWidth
        TransitionProps={{ onEntered: () => {} }}
        PaperProps={{ sx: { borderRadius: 3, overflow: 'hidden' } }}>
        <Box sx={{ background: dialog.action === 'approve'
          ? 'linear-gradient(135deg,#1b5e20,#2e7d32)' : 'linear-gradient(135deg,#7f0000,#c62828)',
          px: 3, py: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Typography variant="h6" fontWeight={700} color="white">
            {dialog.action === 'approve' ? 'Approuver la demande' : 'Rejeter la demande'}
          </Typography>
          <IconButton size="small" onClick={closeDialog} sx={{ color: 'rgba(255,255,255,0.7)', '&:hover': { color: 'white' } }}>
            <CloseIcon fontSize="small" />
          </IconButton>
        </Box>
        <DialogContent sx={{ pt: 2.5 }}>
          {dialog.request && (
            <Box sx={{ p: 1.5, bgcolor: '#f8fafc', borderRadius: 2, border: '1px solid #e8ecf0', mb: 2 }}>
              <Typography sx={{ fontSize: '0.85rem', fontWeight: 600, color: '#1e293b' }}>
                {dialog.request.requester_name}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {currentTab.label} · {dialog.request.requester_matricule}
              </Typography>
            </Box>
          )}
          <TextField autoFocus fullWidth multiline rows={3} label="Commentaire (optionnel)"
            value={comment} onChange={e => setComment(e.target.value)}
            sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }} />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2.5, gap: 1 }}>
          <Button onClick={closeDialog} sx={{ borderRadius: 2, textTransform: 'none', color: '#64748b' }}>Annuler</Button>
          <Button onClick={handleAction} disabled={saving} variant="contained"
            sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 600,
              bgcolor: dialog.action === 'approve' ? '#2e7d32' : '#c62828',
              '&:hover': { bgcolor: dialog.action === 'approve' ? '#1b5e20' : '#b71c1c' } }}>
            {dialog.action === 'approve' ? 'Confirmer l\'approbation' : 'Confirmer le rejet'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar */}
      <Snackbar open={snack.open} autoHideDuration={3500} onClose={() => setSnack(p => ({ ...p, open: false }))}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}>
        <Alert severity={snack.severity} onClose={() => setSnack(p => ({ ...p, open: false }))}
          sx={{ borderRadius: 2, boxShadow: '0 4px 16px rgba(0,0,0,0.12)' }}>
          {snack.msg}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default ManageRequests;
