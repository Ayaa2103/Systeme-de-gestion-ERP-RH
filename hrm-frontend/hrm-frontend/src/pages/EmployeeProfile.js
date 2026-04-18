import React, { useState, useEffect } from 'react';
import {
  Box, Card, CardContent, Typography, Grid, Chip, Divider,
  Alert, Button, Avatar, CircularProgress, LinearProgress,
} from '@mui/material';
import {
  Email as EmailIcon, Phone as PhoneIcon, Badge as BadgeIcon,
  Work as WorkIcon, Business as BusinessIcon, CalendarToday as CalendarIcon,
  Assignment as ContractIcon, School as SkillIcon,
  CheckCircle as CheckIcon, Cancel as CancelIcon, Person as PersonIcon,
  Star as StarIcon, StarBorder as StarBorderIcon,
} from '@mui/icons-material';
import { hrService } from '../services/hrService';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

/* ─── Helpers ────────────────────────────────────────────────────── */
const COLORS = ['#1976d2', '#9c27b0', '#2e7d32', '#e65100', '#0097a7', '#c62828'];
const avatarColor = (name = '') => COLORS[name.charCodeAt(0) % COLORS.length];

const formatDate = (d) =>
  d ? format(new Date(d), 'dd MMMM yyyy', { locale: fr }) : '—';

const statusStyle = {
  actif:    { label: 'Actif',    color: '#2e7d32', bg: '#e8f5e9' },
  inactif:  { label: 'Inactif',  color: '#c62828', bg: '#ffebee' },
  suspendu: { label: 'Suspendu', color: '#e65100', bg: '#fff3e0' },
  congé:    { label: 'Congé',    color: '#e65100', bg: '#fff3e0' },
};
const contractColor = { CDI: '#2e7d32', CDD: '#e65100', Stage: '#1976d2' };

const getRoleLabel = (role) => ({
  administrator: 'Administrateur', hr_director: 'Directeur RH',
  hr_manager: 'Responsable RH',   employee: 'Employé',
}[role] || role);

/* ─── Info row ───────────────────────────────────────────────────── */
const InfoRow = ({ icon, label, value }) => (
  <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5, mb: 2 }}>
    <Box sx={{ mt: 0.2, color: 'text.disabled', flexShrink: 0 }}>
      {React.cloneElement(icon, { sx: { fontSize: 17 } })}
    </Box>
    <Box>
      <Typography variant="caption" color="text.secondary" sx={{ display: 'block', lineHeight: 1.2, mb: 0.2 }}>
        {label}
      </Typography>
      <Typography variant="body2" fontWeight={500}>{value || '—'}</Typography>
    </Box>
  </Box>
);

/* ─── Section label ──────────────────────────────────────────────── */
const SectionTitle = ({ icon, children }) => (
  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
    {React.cloneElement(icon, { sx: { fontSize: 18, color: 'text.secondary' } })}
    <Typography variant="subtitle1" fontWeight={700}>{children}</Typography>
  </Box>
);

/* ─── Main ───────────────────────────────────────────────────────── */
const EmployeeProfile = () => {
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showAllSkills, setShowAllSkills] = useState(false);

  useEffect(() => { fetchProfile(); }, []);

  const fetchProfile = async () => {
    try {
      const res = await hrService.getMyProfile();
      setProfileData(res.data);
    } catch (_) {
      setError('Impossible de charger le profil.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return (
    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 300 }}>
      <CircularProgress />
    </Box>
  );

  if (error) return <Alert severity="error" sx={{ borderRadius: 2 }}>{error}</Alert>;

  const { user, employee, is_absent_today, contracts = [], skills = [] } = profileData || {};
  const fullName = `${user?.first_name || ''} ${user?.last_name || ''}`.trim();
  const initials = `${user?.first_name?.[0] || ''}${user?.last_name?.[0] || ''}`.toUpperCase();
  const ss = statusStyle[employee?.statut] || { label: employee?.statut, color: '#757575', bg: '#f5f5f5' };
  const activeContract = contracts.find(c => c.active);

  /* ── Cas : utilisateur sans profil employé (admin, etc.) ── */
  if (!employee) {
    return (
      <Box sx={{ width: '100%' }}>
        <Card elevation={0} sx={{ borderRadius: 3, border: '1px solid #e8ecf0', overflow: 'hidden' }}>
          <Box sx={{ height: 90, background: 'linear-gradient(135deg, #0f172a 0%, #1e3a5f 60%, #1e40af 100%)' }} />
          <CardContent sx={{ pt: 0, px: 3, pb: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'flex-end', gap: 2, mt: '-44px', mb: 2 }}>
              <Avatar sx={{ width: 88, height: 88, bgcolor: '#1976d2', fontSize: '1.8rem', fontWeight: 700, border: '4px solid white', boxShadow: '0 4px 12px rgba(0,0,0,0.12)' }}>
                {initials || <PersonIcon />}
              </Avatar>
              <Box sx={{ pb: 0.5 }}>
                <Typography variant="h5" fontWeight={700}>{fullName}</Typography>
                <Chip label={getRoleLabel(user?.role)} size="small" sx={{ bgcolor: '#e3f2fd', color: '#1976d2', fontWeight: 600, mt: 0.5 }} />
              </Box>
            </Box>
            <Divider sx={{ mb: 2.5 }} />
            <Grid container spacing={0}>
              <Grid item xs={12} sm={6} md={4}><InfoRow icon={<EmailIcon />} label="Email" value={user?.email} /></Grid>
              <Grid item xs={12} sm={6} md={4}><InfoRow icon={<PhoneIcon />} label="Téléphone" value={user?.phone} /></Grid>
              <Grid item xs={12} sm={6} md={4}><InfoRow icon={<BadgeIcon />} label="Nom d'utilisateur" value={user?.username} /></Grid>
            </Grid>
          </CardContent>
        </Card>
      </Box>
    );
  }

  const visibleSkills = showAllSkills ? skills : skills.slice(0, 6);

  return (
    <Box sx={{ width: '100%' }}>

      {/* Bannière profil */}
      <Card elevation={0} sx={{ borderRadius: 3, border: '1px solid #e8ecf0', mb: 3, overflow: 'hidden' }}>
        <Box sx={{ height: 100, background: 'linear-gradient(135deg, #0f172a 0%, #1e3a5f 60%, #1e40af 100%)' }} />
        <CardContent sx={{ pt: 0, px: 3, pb: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2, mt: '-48px', mb: 2 }}>
            <Avatar
              src={employee.photo ? `http://localhost:8000${employee.photo}` : undefined}
              sx={{
                width: 96, height: 96, bgcolor: avatarColor(fullName),
                fontSize: '2rem', fontWeight: 700,
                border: '4px solid white', boxShadow: '0 4px 12px rgba(0,0,0,0.15)', flexShrink: 0,
              }}
            >
              {!employee.photo && initials}
            </Avatar>
            <Box sx={{ flex: 1, minWidth: 0, pt: '52px' }}>
              <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 1 }}>
                <Box>
                  <Typography variant="h5" fontWeight={700}>{fullName}</Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                    {employee.poste || '—'}{employee.department_name ? ` · ${employee.department_name}` : ''}
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                    <Chip label={ss.label} size="small" sx={{ bgcolor: ss.bg, color: ss.color, fontWeight: 600, border: `1px solid ${ss.color}30` }} />
                    <Chip
                      label={is_absent_today ? 'Absent' : 'Présent'}
                      size="small"
                      sx={{ bgcolor: is_absent_today ? '#ffebee' : '#e8f5e9', color: is_absent_today ? '#c62828' : '#2e7d32', fontWeight: 600 }}
                    />
                    {activeContract && (
                      <Chip label={activeContract.type} size="small"
                        sx={{ bgcolor: `${contractColor[activeContract.type] || '#1976d2'}15`, color: contractColor[activeContract.type] || '#1976d2', fontWeight: 600 }} />
                    )}
                  </Box>
                </Box>
              </Box>
            </Box>
          </Box>

          <Divider sx={{ mb: 2.5 }} />
          <Grid container spacing={0}>
            <Grid item xs={12} sm={6} md={4}><InfoRow icon={<BadgeIcon />}    label="Matricule"       value={employee.matricule} /></Grid>
            <Grid item xs={12} sm={6} md={4}><InfoRow icon={<EmailIcon />}    label="Email"           value={user?.email} /></Grid>
            <Grid item xs={12} sm={6} md={4}><InfoRow icon={<PhoneIcon />}    label="Téléphone"       value={user?.phone} /></Grid>
            <Grid item xs={12} sm={6} md={4}><InfoRow icon={<BusinessIcon />} label="Département"     value={employee.department_name} /></Grid>
            <Grid item xs={12} sm={6} md={4}><InfoRow icon={<WorkIcon />}     label="Service"         value={employee.service} /></Grid>
            <Grid item xs={12} sm={6} md={4}><InfoRow icon={<CalendarIcon />} label="Date d'embauche" value={formatDate(employee.date_embauche)} /></Grid>
          </Grid>
        </CardContent>
      </Card>

      <Grid container spacing={3}>

        {/* Contrats */}
        <Grid item xs={12} md={contracts.length > 1 ? 12 : 6}>
          <Card elevation={0} sx={{ border: '1px solid #e8ecf0', borderRadius: 3 }}>
            <CardContent sx={{ p: 3 }}>
              <SectionTitle icon={<ContractIcon />}>Mes contrats ({contracts.length})</SectionTitle>
              {contracts.length === 0 ? (
                <Box sx={{ textAlign: 'center', py: 4, color: 'text.secondary' }}>
                  <ContractIcon sx={{ fontSize: 40, mb: 1, opacity: 0.3 }} />
                  <Typography variant="body2">Aucun contrat enregistré</Typography>
                </Box>
              ) : (
                <Grid container spacing={2}>
                  {contracts.map((c) => {
                    const cc = contractColor[c.type] || '#1976d2';
                    return (
                      <Grid item xs={12} sm={6} key={c.id}>
                        <Box sx={{ p: 2.5, borderRadius: 2, border: `1px solid ${c.active ? cc + '40' : '#e8ecf0'}`, bgcolor: c.active ? `${cc}08` : '#fafafa' }}>
                          <Box sx={{ display: 'flex', gap: 1, mb: 1.5, flexWrap: 'wrap' }}>
                            <Chip label={c.type} size="small" sx={{ bgcolor: `${cc}15`, color: cc, fontWeight: 700, fontSize: '0.7rem' }} />
                            <Chip
                              label={c.active ? 'Actif' : 'Inactif'} size="small"
                              sx={{ bgcolor: c.active ? '#e8f5e9' : '#f5f5f5', color: c.active ? '#2e7d32' : '#757575', fontWeight: 600, fontSize: '0.7rem' }}
                            />
                          </Box>
                          <Typography variant="body2" color="text.secondary">
                            Du <strong>{c.date_debut ? format(new Date(c.date_debut), 'dd/MM/yyyy') : '—'}</strong>
                            {c.date_fin && c.date_fin !== 'null' && <> au <strong>{format(new Date(c.date_fin), 'dd/MM/yyyy')}</strong></>}
                          </Typography>
                          {c.salaire && (
                            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                              Salaire : <strong>{Number(c.salaire).toLocaleString('fr-FR')} MAD</strong>
                            </Typography>
                          )}
                        </Box>
                      </Grid>
                    );
                  })}
                </Grid>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Compétences */}
        {skills.length > 0 && (
          <Grid item xs={12} md={contracts.length > 1 ? 12 : 6}>
            <Card elevation={0} sx={{ border: '1px solid #e8ecf0', borderRadius: 3 }}>
              <CardContent sx={{ p: 3 }}>
                <SectionTitle icon={<SkillIcon />}>Mes compétences ({skills.length})</SectionTitle>
                <Grid container spacing={2}>
                  {visibleSkills.map((skill) => (
                    <Grid item xs={12} sm={6} md={4} key={skill.id}>
                      <Box sx={{ p: 2, borderRadius: 2, border: '1px solid #e8ecf0', bgcolor: '#fafafa' }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                          <Box sx={{ flex: 1, minWidth: 0 }}>
                            <Typography variant="body2" fontWeight={600} noWrap>{skill.skill_name}</Typography>
                            <Chip label={skill.skill_category} size="small" variant="outlined" sx={{ fontSize: '0.65rem', height: 18, mt: 0.3 }} />
                          </Box>
                          <Typography variant="caption" fontWeight={700} color="primary" sx={{ ml: 1, flexShrink: 0 }}>
                            {skill.level_display || `Niv. ${skill.level}`}
                          </Typography>
                        </Box>
                        <LinearProgress variant="determinate" value={(skill.level / 4) * 100} sx={{ height: 5, borderRadius: 3 }} />
                      </Box>
                    </Grid>
                  ))}
                </Grid>
                {skills.length > 6 && (
                  <Box sx={{ mt: 2, textAlign: 'center' }}>
                    <Button variant="outlined" size="small" sx={{ borderRadius: 2, textTransform: 'none' }}
                      onClick={() => setShowAllSkills(v => !v)}>
                      {showAllSkills ? 'Voir moins' : `Voir toutes (${skills.length})`}
                    </Button>
                  </Box>
                )}
              </CardContent>
            </Card>
          </Grid>
        )}

      </Grid>
    </Box>
  );
};

export default EmployeeProfile;
