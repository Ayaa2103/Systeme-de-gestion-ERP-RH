import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box, Card, CardContent, Typography, Avatar, Grid, Chip, Button,
  Tabs, Tab, List, ListItem, ListItemText, ListItemIcon, Divider,
  LinearProgress, IconButton, Skeleton, Tooltip,
} from '@mui/material';
import {
  Email as EmailIcon,
  Phone as PhoneIcon,
  Work as WorkIcon,
  CalendarToday as CalendarIcon,
  Assignment as ContractIcon,
  Edit as EditIcon,
  ArrowBack as ArrowBackIcon,
  Badge as BadgeIcon,
  Business as BusinessIcon,
  CheckCircle as CheckIcon,
  Warning as WarningIcon,
  School as SkillIcon,
  LocationOn as LocationIcon,
} from '@mui/icons-material';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { getEmployeeDetail, getEmployeeContracts } from '../../services/hrService';
import { useAuth } from '../../contexts/AuthContext';

/* ─── couleurs avatar ────────────────────────────────────────────── */
const COLORS = ['#1976d2', '#9c27b0', '#2e7d32', '#e65100', '#0097a7', '#c62828'];
const avatarColor = (name = '') => COLORS[name.charCodeAt(0) % COLORS.length];

/* ─── Info row ───────────────────────────────────────────────────── */
const InfoRow = ({ icon, label, value }) => (
  <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5, mb: 2 }}>
    <Box sx={{ mt: 0.2, color: 'text.disabled', flexShrink: 0 }}>
      {React.cloneElement(icon, { sx: { fontSize: 18 } })}
    </Box>
    <Box>
      <Typography variant="caption" color="text.secondary" sx={{ display: 'block', lineHeight: 1.2, mb: 0.2 }}>
        {label}
      </Typography>
      <Typography variant="body2" fontWeight={500}>
        {value || '—'}
      </Typography>
    </Box>
  </Box>
);

/* ─── Status helpers ─────────────────────────────────────────────── */
const statusStyle = { actif: { label: 'Actif', color: '#2e7d32', bg: '#e8f5e9' }, inactif: { label: 'Inactif', color: '#c62828', bg: '#ffebee' }, 'congé': { label: 'Congé', color: '#e65100', bg: '#fff3e0' } };
const contractStyle = { CDI: '#2e7d32', CDD: '#e65100', Stage: '#1976d2' };

/* ─── Main ───────────────────────────────────────────────────────── */
const EmployeeDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [employee, setEmployee] = useState(null);
  const [contracts, setContracts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState(0);

  useEffect(() => { fetchData(); }, [id]);

  const fetchData = async () => {
    try {
      const [empRes, contractsRes] = await Promise.all([
        getEmployeeDetail(id),
        getEmployeeContracts(id),
      ]);
      setEmployee(empRes.data);
      setContracts(contractsRes.data);
    } catch (_) {}
    finally { setLoading(false); }
  };

  if (loading) {
    return (
      <Box sx={{ width: '100%' }}>
        <Skeleton variant="rectangular" height={180} sx={{ borderRadius: 3, mb: 2 }} />
        <Skeleton variant="rectangular" height={300} sx={{ borderRadius: 3 }} />
      </Box>
    );
  }

  if (!employee) {
    return (
      <Box sx={{ p: 4, textAlign: 'center' }}>
        <Typography color="text.secondary">Employé introuvable.</Typography>
        <Button sx={{ mt: 2 }} onClick={() => navigate('/employees')}>Retour à la liste</Button>
      </Box>
    );
  }

  const fullName = `${employee.user?.first_name || ''} ${employee.user?.last_name || ''}`.trim();
  const initials = `${employee.user?.first_name?.[0] || ''}${employee.user?.last_name?.[0] || ''}`.toUpperCase();
  const ss = statusStyle[employee.statut] || { label: employee.statut, color: '#757575', bg: '#f5f5f5' };
  const activeContract = contracts.find(c => c.active);

  return (
    <Box sx={{ width: '100%' }}>

      {/* Bouton retour */}
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2, gap: 1 }}>
        <IconButton size="small" onClick={() => navigate('/employees')} sx={{ border: '1px solid #e8ecf0' }}>
          <ArrowBackIcon fontSize="small" />
        </IconButton>
        <Typography variant="body2" color="text.secondary">Retour à la liste</Typography>
      </Box>

      {/* Bannière profil */}
      <Card elevation={0} sx={{ borderRadius: 3, border: '1px solid #e8ecf0', mb: 3, overflow: 'visible' }}>
        {/* Bandeau couleur */}
        <Box
          sx={{
            height: 100,
            background: 'linear-gradient(135deg, #0f172a 0%, #1e3a5f 60%, #1e40af 100%)',
            borderRadius: '12px 12px 0 0',
          }}
        />
        <CardContent sx={{ pt: 0, px: 3, pb: 3 }}>
          {/* Avatar + nom + bouton Modifier */}
          <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2, mt: '-48px', mb: 2 }}>
            <Avatar
              src={employee.photo}
              sx={{
                width: 96, height: 96,
                bgcolor: avatarColor(fullName),
                fontSize: '2rem', fontWeight: 700,
                border: '4px solid white',
                boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                flexShrink: 0,
              }}
            >
              {!employee.photo && initials}
            </Avatar>
            <Box sx={{ flex: 1, minWidth: 0, pt: '52px' }}>
              <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 1 }}>
                <Box>
                  <Typography variant="h5" fontWeight={700}>{fullName}</Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>{employee.poste || '—'}</Typography>
                  <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                    <Chip
                      label={ss.label}
                      size="small"
                      sx={{ bgcolor: ss.bg, color: ss.color, fontWeight: 600, border: `1px solid ${ss.color}30` }}
                    />
                    <Chip
                      label={employee.is_absent_today ? 'Absent' : 'Présent'}
                      size="small"
                      sx={{
                        bgcolor: employee.is_absent_today ? '#ffebee' : '#e8f5e9',
                        color: employee.is_absent_today ? '#c62828' : '#2e7d32',
                        fontWeight: 600,
                      }}
                    />
                    {activeContract && (
                      <Chip
                        label={activeContract.type}
                        size="small"
                        sx={{ bgcolor: `${contractStyle[activeContract.type] || '#1976d2'}15`, color: contractStyle[activeContract.type] || '#1976d2', fontWeight: 600 }}
                      />
                    )}
                  </Box>
                </Box>
                <Button
                  variant="outlined"
                  size="small"
                  startIcon={<EditIcon />}
                  onClick={() => navigate(`/employees/edit/${id}`)}
                  sx={{ borderRadius: 2, textTransform: 'none', flexShrink: 0, mt: 0.5 }}
                >
                  Modifier
                </Button>
              </Box>
            </Box>
          </Box>

          {/* Infos en grille */}
          <Divider sx={{ mb: 2.5 }} />
          <Grid container spacing={0}>
            <Grid item xs={12} sm={6} md={4}>
              <InfoRow icon={<BadgeIcon />} label="Matricule" value={employee.matricule} />
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <InfoRow icon={<EmailIcon />} label="Email" value={employee.user?.email} />
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <InfoRow icon={<PhoneIcon />} label="Téléphone" value={employee.user?.phone} />
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <InfoRow icon={<BusinessIcon />} label="Département" value={employee.department_name} />
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <InfoRow icon={<WorkIcon />} label="Service" value={employee.service} />
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <InfoRow
                icon={<CalendarIcon />}
                label="Date d'embauche"
                value={
                  employee.date_embauche && employee.date_embauche !== 'null'
                    ? format(new Date(employee.date_embauche), 'dd MMMM yyyy', { locale: fr })
                    : null
                }
              />
            </Grid>
          </Grid>

          {/* Barre d'intégration */}
          {employee.onboarding_status !== 'completed' && (
            <Box sx={{ mt: 1, p: 2, bgcolor: '#f8fafc', borderRadius: 2, border: '1px solid #e8ecf0' }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="caption" fontWeight={600} color="text.secondary">
                  Progression d'intégration
                </Typography>
                <Typography variant="caption" fontWeight={700} color="primary">
                  {employee.onboarding_progress || 0}%
                </Typography>
              </Box>
              <LinearProgress
                variant="determinate"
                value={employee.onboarding_progress || 0}
                sx={{ height: 6, borderRadius: 3 }}
              />
            </Box>
          )}
        </CardContent>
      </Card>

      {/* Onglets */}
      <Card elevation={0} sx={{ border: '1px solid #e8ecf0', borderRadius: 3 }}>
        <Tabs
          value={tab}
          onChange={(_, v) => setTab(v)}
          sx={{
            px: 2,
            borderBottom: '1px solid #e8ecf0',
            '& .MuiTab-root': { textTransform: 'none', fontWeight: 500, fontSize: '0.85rem', minHeight: 48 },
            '& .Mui-selected': { fontWeight: 700 },
          }}
        >
          <Tab label={`Contrats (${contracts.length})`} />
          <Tab label={`Compétences (${employee.skills?.length || 0})`} />
        </Tabs>

        <CardContent sx={{ p: 3 }}>

          {/* ── Contrats ── */}
          {tab === 0 && (
            <Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2.5 }}>
                <Typography variant="subtitle1" fontWeight={700}>Historique des contrats</Typography>
                {user?.role === 'administrator' ? (
                  <Button variant="outlined" size="small" sx={{ textTransform: 'none', borderRadius: 2 }} onClick={() => navigate('/contracts')}>
                    Voir tous les contrats
                  </Button>
                ) : (
                  <Button variant="contained" size="small" sx={{ textTransform: 'none', borderRadius: 2 }} onClick={() => navigate(`/employees/${id}/create-contract`)}>
                    + Nouveau contrat
                  </Button>
                )}
              </Box>

              {contracts.length === 0 ? (
                <Box sx={{ textAlign: 'center', py: 5, color: 'text.secondary' }}>
                  <ContractIcon sx={{ fontSize: 48, mb: 1, opacity: 0.3 }} />
                  <Typography variant="body2">Aucun contrat enregistré</Typography>
                </Box>
              ) : (
                <Grid container spacing={2}>
                  {contracts.map((contract) => {
                    const cc = contractStyle[contract.type] || '#1976d2';
                    return (
                      <Grid item xs={12} sm={6} key={contract.id}>
                        <Box sx={{
                          p: 2.5, borderRadius: 2,
                          border: `1px solid ${contract.active ? cc + '40' : '#e8ecf0'}`,
                          bgcolor: contract.active ? `${cc}08` : '#fafafa',
                          position: 'relative',
                        }}>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1.5 }}>
                            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                              <Chip
                                label={contract.type}
                                size="small"
                                sx={{ bgcolor: `${cc}15`, color: cc, fontWeight: 700, fontSize: '0.7rem' }}
                              />
                              <Chip
                                label={contract.active ? 'Actif' : 'Inactif'}
                                size="small"
                                sx={{
                                  bgcolor: contract.active ? '#e8f5e9' : '#f5f5f5',
                                  color: contract.active ? '#2e7d32' : '#757575',
                                  fontWeight: 600, fontSize: '0.7rem',
                                }}
                              />
                              {contract.is_expiring_soon && (
                                <Chip label="Expire bientôt" size="small" color="warning" sx={{ fontSize: '0.7rem' }} />
                              )}
                            </Box>
                          </Box>
                          <Typography variant="body2" color="text.secondary">
                            Du <strong>{contract.date_debut ? format(new Date(contract.date_debut), 'dd/MM/yyyy') : '—'}</strong>
                            {contract.date_fin && contract.date_fin !== 'null' && (
                              <> au <strong>{format(new Date(contract.date_fin), 'dd/MM/yyyy')}</strong></>
                            )}
                          </Typography>
                          {contract.salaire && (
                            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                              Salaire : <strong>{contract.salaire} MAD</strong>
                            </Typography>
                          )}
                        </Box>
                      </Grid>
                    );
                  })}
                </Grid>
              )}
            </Box>
          )}

          {/* ── Compétences ── */}
          {tab === 1 && (
            <Box>
              <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 2.5 }}>
                Compétences évaluées
              </Typography>
              {!employee.skills || employee.skills.length === 0 ? (
                <Box sx={{ textAlign: 'center', py: 5, color: 'text.secondary' }}>
                  <SkillIcon sx={{ fontSize: 48, mb: 1, opacity: 0.3 }} />
                  <Typography variant="body2">Aucune compétence évaluée</Typography>
                </Box>
              ) : (
                <Grid container spacing={2}>
                  {employee.skills.map((skill) => (
                    <Grid item xs={12} sm={6} key={skill.id}>
                      <Box sx={{ p: 2, borderRadius: 2, border: '1px solid #e8ecf0', bgcolor: '#fafafa' }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                          <Box>
                            <Typography variant="body2" fontWeight={600}>{skill.skill_name}</Typography>
                            <Chip label={skill.skill_category} size="small" variant="outlined" sx={{ fontSize: '0.65rem', height: 18, mt: 0.3 }} />
                          </Box>
                          <Box sx={{ textAlign: 'right' }}>
                            <Typography variant="caption" fontWeight={700} color="primary">
                              {skill.level_display || `Niv. ${skill.level}`}
                            </Typography>
                            {skill.certified && (
                              <Box><Chip label="Certifié" size="small" color="success" sx={{ fontSize: '0.65rem', height: 18 }} /></Box>
                            )}
                          </Box>
                        </Box>
                        <LinearProgress
                          variant="determinate"
                          value={(skill.level / 4) * 100}
                          sx={{ height: 5, borderRadius: 3 }}
                        />
                      </Box>
                    </Grid>
                  ))}
                </Grid>
              )}
            </Box>
          )}

        </CardContent>
      </Card>
    </Box>
  );
};

export default EmployeeDetail;
