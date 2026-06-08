import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box, Card, CardContent, Typography, Button, Grid, Avatar, Chip,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Alert, Skeleton, Divider, Pagination, Tooltip,
} from '@mui/material';
import {
  ArrowBack as BackIcon,
  Assignment as RequestIcon,
  BeachAccess as LeaveIcon,
  Description as AttestationIcon,
  FlightTakeoff as MissionIcon,
  ReceiptLong as PayslipIcon,
  Add as AddIcon,
  CheckCircle as ApprovedIcon,
  Cancel as RejectedIcon,
  Schedule as PendingIcon,
  CalendarToday as CalendarIcon,
} from '@mui/icons-material';
import { getMyRequests } from '../../services/employeeService';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

const PER_PAGE = 8;

const STATUS = {
  pending:  { label: 'En attente', color: '#f57c00', bg: '#fff8e1', icon: <PendingIcon /> },
  approved: { label: 'Approuvée',  color: '#2e7d32', bg: '#e8f5e9', icon: <ApprovedIcon /> },
  rejected: { label: 'Rejetée',    color: '#c62828', bg: '#ffebee', icon: <RejectedIcon /> },
};

const TABS = [
  { key: 'all',         label: 'Toutes',       icon: <RequestIcon />,     color: '#1976d2', bg: '#eff6ff',  dataKey: null },
  { key: 'leave',       label: 'Congés',        icon: <LeaveIcon />,       color: '#1976d2', bg: '#eff6ff',  dataKey: 'leave_requests' },
  { key: 'attestation', label: 'Attestations',  icon: <AttestationIcon />, color: '#7b1fa2', bg: '#fdf4ff',  dataKey: 'attestation_requests' },
  { key: 'mission',     label: 'Missions',      icon: <MissionIcon />,     color: '#e65100', bg: '#fff7ed',  dataKey: 'mission_requests' },
  { key: 'payslip',     label: 'Bulletins',     icon: <PayslipIcon />,     color: '#2e7d32', bg: '#f0fdf4',  dataKey: 'payslip_requests' },
];

const CREATE_LINKS = [
  { label: 'Congé',       icon: <LeaveIcon />,       color: '#1976d2', bg: '#eff6ff', path: '/employee/requests/create-leave' },
  { label: 'Attestation', icon: <AttestationIcon />, color: '#7b1fa2', bg: '#fdf4ff', path: '/employee/requests/create-attestation' },
  { label: 'Mission',     icon: <MissionIcon />,     color: '#e65100', bg: '#fff7ed', path: '/employee/requests/create-mission' },
  { label: 'Bulletin',    icon: <PayslipIcon />,     color: '#2e7d32', bg: '#f0fdf4', path: '/employee/requests/create-payslip' },
];

const colSx = {
  fontSize: '0.7rem', fontWeight: 700, color: '#475569',
  textTransform: 'uppercase', letterSpacing: '0.5px',
  bgcolor: '#f8fafc', borderBottom: '2px solid #e8ecf0', py: 1.25, px: 2,
};

const MyRequests = () => {
  const navigate = useNavigate();
  const [data,    setData]    = useState(null);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState('');
  const [tab,     setTab]     = useState('all');
  const [page,    setPage]    = useState(1);

  useEffect(() => { load(); }, []);

  const load = async () => {
    setLoading(true);
    try {
      const res = await getMyRequests();
      setData(res.data);
    } catch (_) { setError('Erreur lors du chargement des demandes'); }
    finally { setLoading(false); }
  };

  /* Flatten all requests */
  const allRequests = useMemo(() => {
    if (!data) return [];
    return [
      ...(data.leave_requests       || []).map(r => ({ ...r, _type: 'leave',       _label: 'Congé' })),
      ...(data.attestation_requests || []).map(r => ({ ...r, _type: 'attestation', _label: 'Attestation' })),
      ...(data.mission_requests     || []).map(r => ({ ...r, _type: 'mission',     _label: 'Mission' })),
      ...(data.payslip_requests     || []).map(r => ({ ...r, _type: 'payslip',     _label: 'Bulletin' })),
    ].sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
  }, [data]);

  const displayed = useMemo(() => {
    if (tab === 'all') return allRequests;
    const t = TABS.find(t => t.key === tab);
    return allRequests.filter(r => r._type === tab);
  }, [allRequests, tab]);

  const pages = Math.ceil(displayed.length / PER_PAGE) || 1;
  const paged = displayed.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  const counts = {
    all:         allRequests.length,
    pending:     allRequests.filter(r => r.status === 'pending').length,
    approved:    allRequests.filter(r => r.status === 'approved').length,
    leave:       (data?.leave_requests || []).length,
    attestation: (data?.attestation_requests || []).length,
    mission:     (data?.mission_requests || []).length,
    payslip:     (data?.payslip_requests || []).length,
  };

  const getDetail = (req) => {
    if (req._type === 'leave')
      return req.start_date && req.end_date
        ? `${format(new Date(req.start_date), 'dd MMM', { locale: fr })} → ${format(new Date(req.end_date), 'dd MMM yyyy', { locale: fr })}`
        : req.leave_type || '—';
    if (req._type === 'attestation') return `${req.attestation_type || ''} · ${req.purpose || ''}`;
    if (req._type === 'mission')
      return req.destination
        ? `${req.destination}${req.start_date ? ` · ${format(new Date(req.start_date), 'dd MMM', { locale: fr })}` : ''}`
        : '—';
    if (req._type === 'payslip') return req.periode_mois || '—';
    return '—';
  };

  const tabConfig = TABS.find(t => t.key === tab) || TABS[0];

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
              <RequestIcon sx={{ fontSize: 22, color: 'white' }} />
            </Box>
            <Box>
              <Typography variant="h5" fontWeight={700} color="white">Mes Demandes</Typography>
              <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.65)', mt: 0.3 }}>
                {counts.all} demande{counts.all !== 1 ? 's' : ''} · {counts.pending} en attente
              </Typography>
            </Box>
          </Box>
          {/* Mini stats */}
          <Box sx={{ display: 'flex', gap: 2.5 }}>
            {[
              { label: 'En attente', value: counts.pending,  color: counts.pending > 0 ? '#fbbf24' : '#86efac' },
              { label: 'Approuvées', value: counts.approved, color: '#86efac' },
            ].map(s => (
              <Box key={s.label} sx={{ textAlign: 'center' }}>
                <Typography sx={{ fontSize: '1.3rem', fontWeight: 800, color: s.color, lineHeight: 1 }}>{s.value}</Typography>
                <Typography sx={{ fontSize: '0.68rem', color: 'rgba(255,255,255,0.5)', mt: 0.2 }}>{s.label}</Typography>
              </Box>
            ))}
          </Box>
        </Box>
      </Card>

      {error && <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>{error}</Alert>}

      {/* Nouvelle demande — boutons */}
      <Card elevation={0} sx={{ border: '1px solid #e8ecf0', borderRadius: 3, mb: 3 }}>
        <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
          <Typography sx={{ fontSize: '0.72rem', fontWeight: 700, color: '#94a3b8',
            textTransform: 'uppercase', letterSpacing: '0.5px', mb: 1.5 }}>
            Nouvelle demande
          </Typography>
          <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap' }}>
            {CREATE_LINKS.map(l => (
              <Button key={l.path} size="small" startIcon={React.cloneElement(l.icon, { sx: { fontSize: 15 } })}
                onClick={() => navigate(l.path)}
                sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 600, fontSize: '0.8rem',
                  color: l.color, border: `1px solid ${l.color}25`, bgcolor: l.bg,
                  '&:hover': { filter: 'brightness(0.95)' }, py: 0.6 }}>
                {l.label}
              </Button>
            ))}
          </Box>
        </CardContent>
      </Card>

      {/* Stat cards + tabs */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        {TABS.map(t => {
          const cnt = t.key === 'all' ? counts.all : counts[t.key] ?? 0;
          const active = tab === t.key;
          return (
            <Grid item xs={6} sm={4} md key={t.key}>
              <Card elevation={0} onClick={() => { setTab(t.key); setPage(1); }}
                sx={{ border: `1px solid ${active ? t.color : `${t.color}20`}`, borderRadius: 3,
                  cursor: 'pointer', bgcolor: active ? t.bg : 'white', transition: 'all 0.18s',
                  '&:hover': { borderColor: `${t.color}50`, boxShadow: `0 4px 14px ${t.color}12` } }}>
                <CardContent sx={{ p: 1.75 }}>
                  <Avatar sx={{ bgcolor: active ? `${t.color}20` : `${t.color}10`, width: 28, height: 28, mb: 1 }}>
                    {React.cloneElement(t.icon, { sx: { color: t.color, fontSize: 14 } })}
                  </Avatar>
                  {loading ? <Skeleton width={32} height={26} /> : (
                    <Typography variant="h4" fontWeight={800} sx={{ color: t.color, lineHeight: 1 }}>{cnt}</Typography>
                  )}
                  <Typography variant="caption" color="text.secondary" sx={{ mt: 0.3, display: 'block', fontSize: '0.72rem' }}>
                    {t.label}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          );
        })}
      </Grid>

      {/* Tableau unifié */}
      <Card elevation={0} sx={{ border: '1px solid #e8ecf0', borderRadius: 3, overflow: 'hidden' }}>
        {/* Header */}
        <Box sx={{ background: 'linear-gradient(135deg,#0f172a,#1e3a5f,#1e40af)',
          px: 2.5, py: 1.5, display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.12)', width: 28, height: 28, borderRadius: 1.5 }}>
            {React.cloneElement(tabConfig.icon, { sx: { fontSize: 14, color: 'white' } })}
          </Avatar>
          <Typography sx={{ color: 'white', fontWeight: 700, fontSize: '0.88rem', flex: 1 }}>
            {tab === 'all' ? 'Toutes mes demandes' : `Mes demandes — ${tabConfig.label}`}
          </Typography>
          <Chip label={`${displayed.length} résultat${displayed.length !== 1 ? 's' : ''}`} size="small"
            sx={{ bgcolor: 'rgba(255,255,255,0.15)', color: 'white', height: 20, fontSize: '0.7rem' }} />
        </Box>

        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell sx={colSx}>Type</TableCell>
                <TableCell sx={colSx}>Détails</TableCell>
                <TableCell sx={colSx}>Statut</TableCell>
                <TableCell sx={colSx}>Date de demande</TableCell>
                {tab === 'all' && <TableCell sx={colSx}>Commentaire</TableCell>}
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i}>
                    {[1,2,3,4].map(j => (
                      <TableCell key={j} sx={{ py: 1.5, px: 2 }}>
                        <Skeleton height={20} sx={{ borderRadius: 1 }} />
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : paged.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={tab === 'all' ? 5 : 4} sx={{ textAlign: 'center', py: 6 }}>
                    <RequestIcon sx={{ fontSize: 40, color: '#cbd5e1', display: 'block', mx: 'auto', mb: 1 }} />
                    <Typography variant="body2" color="text.secondary">
                      Aucune demande {tab !== 'all' ? `de type "${tabConfig.label}"` : ''} pour le moment
                    </Typography>
                    {tab !== 'all' && (
                      <Button size="small" startIcon={<AddIcon />}
                        onClick={() => navigate(CREATE_LINKS.find(l => l.path.includes(tab))?.path || '/employee/requests/create-leave')}
                        sx={{ mt: 1.5, textTransform: 'none', fontWeight: 600 }}>
                        Créer une demande
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ) : paged.map((req, i) => {
                const sc = STATUS[req.status] || STATUS.pending;
                const tabDef = TABS.find(t => t.key === req._type) || TABS[1];
                return (
                  <TableRow key={`${req._type}-${req.id}`} hover
                    sx={{ '&:last-child td': { border: 0 }, '& td': { borderBottom: '1px solid #f1f5f9' } }}>

                    {/* Type */}
                    <TableCell sx={{ py: 1.5, px: 2 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Avatar sx={{ bgcolor: tabDef.bg, width: 28, height: 28, borderRadius: 1.5 }}>
                          {React.cloneElement(tabDef.icon, { sx: { color: tabDef.color, fontSize: 13 } })}
                        </Avatar>
                        <Typography sx={{ fontSize: '0.82rem', fontWeight: 600, color: '#1e293b' }}>
                          {req._label}
                        </Typography>
                      </Box>
                    </TableCell>

                    {/* Détails */}
                    <TableCell sx={{ py: 1.5, px: 2 }}>
                      <Typography sx={{ fontSize: '0.8rem', color: '#475569' }}>
                        {getDetail(req)}
                      </Typography>
                    </TableCell>

                    {/* Statut */}
                    <TableCell sx={{ py: 1.5, px: 2 }}>
                      <Chip label={sc.label} size="small"
                        sx={{ bgcolor: sc.bg, color: sc.color, fontWeight: 700, fontSize: '0.7rem',
                          height: 22, border: `1px solid ${sc.color}25` }} />
                    </TableCell>

                    {/* Date */}
                    <TableCell sx={{ py: 1.5, px: 2 }}>
                      <Typography sx={{ fontSize: '0.78rem', color: '#64748b' }}>
                        {req.created_at ? format(new Date(req.created_at), 'dd MMM yyyy', { locale: fr }) : '—'}
                      </Typography>
                    </TableCell>

                    {/* Commentaire (onglet "Toutes" uniquement) */}
                    {tab === 'all' && (
                      <TableCell sx={{ py: 1.5, px: 2 }}>
                        <Typography sx={{ fontSize: '0.75rem', color: '#64748b',
                          maxWidth: 180, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {req.comment || req.notes || '—'}
                        </Typography>
                      </TableCell>
                    )}
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>

        {/* Pagination */}
        {!loading && displayed.length > PER_PAGE && (
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            px: 2.5, py: 1.5, borderTop: '1px solid #f1f5f9' }}>
            <Typography sx={{ fontSize: '0.75rem', color: '#64748b' }}>
              {(page - 1) * PER_PAGE + 1}–{Math.min(page * PER_PAGE, displayed.length)} sur {displayed.length}
            </Typography>
            <Pagination count={pages} page={page} onChange={(_, v) => setPage(v)}
              size="small" shape="rounded"
              sx={{ '& .MuiPaginationItem-root': { fontSize: '0.75rem', minWidth: 28, height: 28 } }} />
          </Box>
        )}
      </Card>
    </Box>
  );
};

export default MyRequests;
