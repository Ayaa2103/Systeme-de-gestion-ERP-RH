import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box, Card, CardContent, Typography, TextField, Button,
  FormControl, Select, MenuItem, Grid, Alert, Avatar, Chip, Divider,
} from '@mui/material';
import {
  ArrowBack as BackIcon,
  Work as WorkIcon,
  Business as DeptIcon,
  Psychology as SkillsIcon,
  Description as DescIcon,
  TrendingUp as LevelIcon,
  CheckCircle as CheckIcon,
  SaveAlt as SaveIcon,
  Publish as PublishIcon,
} from '@mui/icons-material';
import { createJobOffer, getDepartments } from '../../services/hrService';

const fieldSx = {
  '& .MuiOutlinedInput-root': {
    borderRadius: 2,
    fontSize: '0.875rem',
    '&:hover fieldset': { borderColor: '#1976d2' },
    '&.Mui-focused fieldset': { borderColor: '#1976d2' },
  },
  '& .MuiInputLabel-root.Mui-focused': { color: '#1976d2' },
};

const LEVELS = [
  { value: 'junior',       label: 'Junior',        sub: '0 – 2 ans',  color: '#2e7d32', bg: '#e8f5e9' },
  { value: 'intermediate', label: 'Intermédiaire', sub: '2 – 5 ans',  color: '#1976d2', bg: '#e3f2fd' },
  { value: 'senior',       label: 'Senior',        sub: '5 – 10 ans', color: '#7b1fa2', bg: '#f3e5f5' },
  { value: 'expert',       label: 'Expert',        sub: '10+ ans',    color: '#e65100', bg: '#fff3e0' },
];

const SectionLabel = ({ icon, label, required }) => (
  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
    <Avatar sx={{ bgcolor: '#1976d212', width: 26, height: 26 }}>
      {React.cloneElement(icon, { sx: { color: '#1976d2', fontSize: 14 } })}
    </Avatar>
    <Typography sx={{ fontSize: '0.78rem', fontWeight: 700, color: '#475569',
      textTransform: 'uppercase', letterSpacing: '0.5px' }}>
      {label} {required && <span style={{ color: '#ef4444' }}>*</span>}
    </Typography>
  </Box>
);

const CreateJobOffer = () => {
  const navigate = useNavigate();
  const [loading, setLoading]       = useState(false);
  const [error, setError]           = useState('');
  const [departments, setDepartments] = useState([]);
  const [formData, setFormData]     = useState({
    title: '', department: '', description: '',
    required_skills: '', experience_level: '',
  });

  useEffect(() => {
    getDepartments()
      .then(r => setDepartments(r.data || []))
      .catch(() => {});
  }, []);

  const set = (field, val) => setFormData(p => ({ ...p, [field]: val }));

  const filled = [
    formData.title, formData.department, formData.description,
    formData.required_skills, formData.experience_level,
  ].filter(Boolean).length;
  const progress = Math.round((filled / 5) * 100);

  const handleSubmit = async (asDraft = false) => {
    if (!formData.title.trim()) {
      setError('Le titre du poste est obligatoire.'); return;
    }
    if (!formData.experience_level) {
      setError('Le niveau d\'expérience est obligatoire.'); return;
    }
    if (!formData.description.trim()) {
      setError('La description est obligatoire.'); return;
    }
    if (!formData.required_skills.trim()) {
      setError('Les compétences requises sont obligatoires.'); return;
    }

    setLoading(true);
    setError('');
    try {
      await createJobOffer({ ...formData, status: asDraft ? 'draft' : 'published' });
      navigate('/job-offers');
    } catch (e) {
      const data = e.response?.data;
      if (!data) {
        setError('Erreur lors de la création de l\'offre'); return;
      }
      if (typeof data === 'string') { setError(data); return; }
      if (data.error)  { setError(data.error);  return; }
      if (data.detail) { setError(data.detail); return; }
      // Erreurs de validation Django : { field: ["msg"] }
      const LABELS = { title: 'Titre', department: 'Département', description: 'Description',
        required_skills: 'Compétences', experience_level: 'Expérience', status: 'Statut' };
      const msgs = Object.entries(data)
        .map(([f, errs]) => `${LABELS[f] || f} : ${Array.isArray(errs) ? errs[0] : errs}`)
        .join(' · ');
      setError(msgs || 'Erreur lors de la création de l\'offre');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ width: '100%' }}>

      {/* Banner */}
      <Card elevation={0} sx={{ borderRadius: 3, border: '1px solid #e8ecf0', mb: 3, overflow: 'hidden' }}>
        <Box sx={{ background: 'linear-gradient(135deg,#0f172a 0%,#1e3a5f 60%,#1e40af 100%)',
          px: 3, py: 2.5, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Button startIcon={<BackIcon />} onClick={() => navigate('/job-offers')} size="small"
              sx={{ color: 'rgba(255,255,255,0.7)', textTransform: 'none', borderRadius: 2,
                '&:hover': { bgcolor: 'rgba(255,255,255,0.1)', color: 'white' } }}>
              Retour
            </Button>
            <Box sx={{ p: 1.25, borderRadius: 2, bgcolor: 'rgba(255,255,255,0.12)', display: 'inline-flex' }}>
              <WorkIcon sx={{ fontSize: 22, color: 'white' }} />
            </Box>
            <Box>
              <Typography variant="h5" fontWeight={700} color="white">Nouvelle offre d'emploi</Typography>
              <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.65)', mt: 0.3 }}>
                Renseignez les informations du poste
              </Typography>
            </Box>
          </Box>
          {/* Progress indicator */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Box sx={{ display: 'flex', gap: 0.5 }}>
              {[1,2,3,4,5].map(i => (
                <Box key={i} sx={{ width: 24, height: 4, borderRadius: 2,
                  bgcolor: i <= filled ? '#60a5fa' : 'rgba(255,255,255,0.2)' }} />
              ))}
            </Box>
            <Typography sx={{ color: 'rgba(255,255,255,0.65)', fontSize: '0.78rem' }}>
              {filled}/5 champs
            </Typography>
          </Box>
        </Box>
      </Card>

      <Grid container spacing={3}>

        {/* ── Formulaire principal ── */}
        <Grid item xs={12} lg={8}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>

            {error && <Alert severity="error" sx={{ borderRadius: 2 }} onClose={() => setError('')}>{error}</Alert>}

            {/* Section 1 : Identification */}
            <Card elevation={0} sx={{ border: '1px solid #e8ecf0', borderRadius: 3 }}>
              <Box sx={{ background: 'linear-gradient(135deg,#0f172a,#1e3a5f,#1e40af)',
                px: 2.5, py: 1.5, display: 'flex', alignItems: 'center', gap: 1.5, borderRadius: '12px 12px 0 0' }}>
                <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.12)', width: 28, height: 28, borderRadius: 1.5 }}>
                  <WorkIcon sx={{ fontSize: 14, color: 'white' }} />
                </Avatar>
                <Typography sx={{ color: 'white', fontWeight: 700, fontSize: '0.88rem' }}>Identification du poste</Typography>
              </Box>
              <CardContent sx={{ p: 3 }}>
                <Grid container spacing={2.5}>
                  <Grid item xs={12} md={7}>
                    <SectionLabel icon={<WorkIcon />} label="Titre du poste" required />
                    <TextField fullWidth size="small" placeholder="ex: Développeur Full-Stack React/Django"
                      value={formData.title} onChange={e => set('title', e.target.value)} sx={fieldSx} />
                  </Grid>
                  <Grid item xs={12} md={5}>
                    <SectionLabel icon={<DeptIcon />} label="Département" />
                    <FormControl fullWidth size="small">
                      <Select value={formData.department} displayEmpty
                        onChange={e => set('department', e.target.value)}
                        renderValue={v => v || <span style={{ color: '#94a3b8', fontSize: '0.875rem' }}>Sélectionner…</span>}
                        sx={{ borderRadius: 2, fontSize: '0.875rem' }}>
                        {departments.map(d => (
                          <MenuItem key={d.id} value={d.name}>{d.name}</MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>

            {/* Section 2 : Niveau d'expérience */}
            <Card elevation={0} sx={{ border: '1px solid #e8ecf0', borderRadius: 3 }}>
              <Box sx={{ background: 'linear-gradient(135deg,#0f172a,#1e3a5f,#1e40af)',
                px: 2.5, py: 1.5, display: 'flex', alignItems: 'center', gap: 1.5, borderRadius: '12px 12px 0 0' }}>
                <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.12)', width: 28, height: 28, borderRadius: 1.5 }}>
                  <LevelIcon sx={{ fontSize: 14, color: 'white' }} />
                </Avatar>
                <Typography sx={{ color: 'white', fontWeight: 700, fontSize: '0.88rem' }}>
                  Niveau d'expérience <span style={{ color: 'rgba(255,255,255,0.5)', fontWeight: 400, fontSize: '0.78rem' }}>*</span>
                </Typography>
              </Box>
              <CardContent sx={{ p: 3 }}>
                <Grid container spacing={1.5}>
                  {LEVELS.map(lvl => (
                    <Grid item xs={6} sm={3} key={lvl.value}>
                      <Box onClick={() => set('experience_level', lvl.value)}
                        sx={{ p: 1.75, borderRadius: 2, cursor: 'pointer', textAlign: 'center',
                          border: `2px solid ${formData.experience_level === lvl.value ? lvl.color : '#e8ecf0'}`,
                          bgcolor: formData.experience_level === lvl.value ? lvl.bg : 'white',
                          transition: 'all 0.15s',
                          '&:hover': { borderColor: lvl.color, bgcolor: lvl.bg } }}>
                        <Typography sx={{ fontSize: '0.9rem', fontWeight: 800,
                          color: formData.experience_level === lvl.value ? lvl.color : '#1e293b' }}>
                          {lvl.label}
                        </Typography>
                        <Typography sx={{ fontSize: '0.7rem',
                          color: formData.experience_level === lvl.value ? lvl.color : '#94a3b8', mt: 0.2 }}>
                          {lvl.sub}
                        </Typography>
                      </Box>
                    </Grid>
                  ))}
                </Grid>
              </CardContent>
            </Card>

            {/* Section 3 : Description */}
            <Card elevation={0} sx={{ border: '1px solid #e8ecf0', borderRadius: 3 }}>
              <Box sx={{ background: 'linear-gradient(135deg,#0f172a,#1e3a5f,#1e40af)',
                px: 2.5, py: 1.5, display: 'flex', alignItems: 'center', gap: 1.5, borderRadius: '12px 12px 0 0' }}>
                <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.12)', width: 28, height: 28, borderRadius: 1.5 }}>
                  <DescIcon sx={{ fontSize: 14, color: 'white' }} />
                </Avatar>
                <Typography sx={{ color: 'white', fontWeight: 700, fontSize: '0.88rem' }}>
                  Description du poste <span style={{ color: 'rgba(255,255,255,0.5)', fontWeight: 400, fontSize: '0.78rem' }}>*</span>
                </Typography>
              </Box>
              <CardContent sx={{ p: 3 }}>
                <TextField fullWidth multiline rows={6}
                  placeholder="Décrivez les missions principales, les responsabilités, le contexte de l'équipe et les objectifs du poste..."
                  value={formData.description} onChange={e => set('description', e.target.value)} sx={fieldSx} />
                <Typography variant="caption" color="text.secondary" sx={{ mt: 0.75, display: 'block' }}>
                  {formData.description.length} caractère{formData.description.length !== 1 ? 's' : ''}
                  {formData.description.length < 100 && formData.description.length > 0 && (
                    <span style={{ color: '#f57c00' }}> — minimum recommandé : 100 caractères</span>
                  )}
                </Typography>
              </CardContent>
            </Card>

            {/* Section 4 : Compétences */}
            <Card elevation={0} sx={{ border: '1px solid #e8ecf0', borderRadius: 3 }}>
              <Box sx={{ background: 'linear-gradient(135deg,#0f172a,#1e3a5f,#1e40af)',
                px: 2.5, py: 1.5, display: 'flex', alignItems: 'center', gap: 1.5, borderRadius: '12px 12px 0 0' }}>
                <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.12)', width: 28, height: 28, borderRadius: 1.5 }}>
                  <SkillsIcon sx={{ fontSize: 14, color: 'white' }} />
                </Avatar>
                <Typography sx={{ color: 'white', fontWeight: 700, fontSize: '0.88rem' }}>Compétences requises</Typography>
              </Box>
              <CardContent sx={{ p: 3 }}>
                <TextField fullWidth multiline rows={4}
                  placeholder="ex: React, Node.js, Python, communication, gestion de projet, travail en équipe..."
                  value={formData.required_skills} onChange={e => set('required_skills', e.target.value)} sx={fieldSx} />
                {/* Aperçu des compétences en chips */}
                {formData.required_skills && (
                  <Box sx={{ display: 'flex', gap: 0.75, flexWrap: 'wrap', mt: 1.5 }}>
                    {formData.required_skills.split(',').map(s => s.trim()).filter(Boolean).slice(0, 8).map((s, i) => (
                      <Chip key={i} label={s} size="small"
                        sx={{ bgcolor: '#eff6ff', color: '#1976d2', border: '1px solid #bfdbfe',
                          fontWeight: 600, fontSize: '0.7rem', height: 22 }} />
                    ))}
                    {formData.required_skills.split(',').filter(s => s.trim()).length > 8 && (
                      <Chip label={`+${formData.required_skills.split(',').filter(s => s.trim()).length - 8}`} size="small"
                        sx={{ bgcolor: '#f8fafc', color: '#64748b', fontSize: '0.7rem', height: 22 }} />
                    )}
                  </Box>
                )}
                <Typography variant="caption" color="text.secondary" sx={{ mt: 0.75, display: 'block' }}>
                  Séparez les compétences par des virgules
                </Typography>
              </CardContent>
            </Card>

          </Box>
        </Grid>

        {/* ── Panneau latéral ── */}
        <Grid item xs={12} lg={4}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, position: 'sticky', top: 24 }}>

            {/* Récapitulatif */}
            <Card elevation={0} sx={{ border: '1px solid #e8ecf0', borderRadius: 3, overflow: 'hidden' }}>
              <Box sx={{ background: 'linear-gradient(135deg,#0f172a,#1e3a5f,#1e40af)',
                px: 2.5, py: 1.5, display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.12)', width: 28, height: 28, borderRadius: 1.5 }}>
                  <CheckIcon sx={{ fontSize: 14, color: 'white' }} />
                </Avatar>
                <Typography sx={{ color: 'white', fontWeight: 700, fontSize: '0.88rem' }}>Récapitulatif</Typography>
              </Box>
              <CardContent sx={{ p: 2.5 }}>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.25 }}>
                  {[
                    { label: 'Titre',       value: formData.title,            icon: <WorkIcon sx={{ fontSize: 14 }} /> },
                    { label: 'Département', value: formData.department,        icon: <DeptIcon sx={{ fontSize: 14 }} /> },
                    { label: 'Expérience',  value: LEVELS.find(l => l.value === formData.experience_level)?.label, icon: <LevelIcon sx={{ fontSize: 14 }} /> },
                    { label: 'Description', value: formData.description ? `${formData.description.length} car.` : null, icon: <DescIcon sx={{ fontSize: 14 }} /> },
                    { label: 'Compétences', value: formData.required_skills ? `${formData.required_skills.split(',').filter(s => s.trim()).length} listée(s)` : null, icon: <SkillsIcon sx={{ fontSize: 14 }} /> },
                  ].map((item, i) => (
                    <Box key={i} sx={{ display: 'flex', alignItems: 'center', gap: 1.25,
                      p: 1, borderRadius: 2, bgcolor: item.value ? '#f0fdf4' : '#f8fafc',
                      border: `1px solid ${item.value ? '#a7f3d030' : '#f1f5f9'}` }}>
                      <Avatar sx={{ bgcolor: item.value ? '#2e7d3215' : '#f1f5f9', width: 24, height: 24 }}>
                        {React.cloneElement(item.icon, { sx: { ...item.icon.props.sx, color: item.value ? '#2e7d32' : '#94a3b8' } })}
                      </Avatar>
                      <Box sx={{ flex: 1, minWidth: 0 }}>
                        <Typography sx={{ fontSize: '0.7rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.4px' }}>
                          {item.label}
                        </Typography>
                        <Typography sx={{ fontSize: '0.78rem', fontWeight: 600,
                          color: item.value ? '#1e293b' : '#cbd5e1' }} noWrap>
                          {item.value || 'Non renseigné'}
                        </Typography>
                      </Box>
                      {item.value && <CheckIcon sx={{ fontSize: 14, color: '#2e7d32', flexShrink: 0 }} />}
                    </Box>
                  ))}
                </Box>

                <Divider sx={{ my: 2 }} />

                {/* Barre de progression */}
                <Box sx={{ mb: 0.5, display: 'flex', justifyContent: 'space-between' }}>
                  <Typography sx={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600 }}>Complétude</Typography>
                  <Typography sx={{ fontSize: '0.75rem', color: progress === 100 ? '#2e7d32' : '#f57c00', fontWeight: 700 }}>{progress}%</Typography>
                </Box>
                <Box sx={{ height: 6, bgcolor: '#f1f5f9', borderRadius: 3, overflow: 'hidden' }}>
                  <Box sx={{ height: '100%', width: `${progress}%`, borderRadius: 3,
                    bgcolor: progress === 100 ? '#2e7d32' : progress >= 60 ? '#f57c00' : '#1976d2',
                    transition: 'width 0.3s ease' }} />
                </Box>
              </CardContent>
            </Card>

            {/* Boutons d'action */}
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
              <Button fullWidth variant="contained" startIcon={<PublishIcon />}
                onClick={() => handleSubmit(false)} disabled={loading}
                sx={{ py: 1.25, borderRadius: 2, textTransform: 'none', fontWeight: 700, fontSize: '0.9rem',
                  background: 'linear-gradient(135deg,#1e3a5f,#1e40af)',
                  '&:hover': { background: 'linear-gradient(135deg,#0f172a,#1e3a5f)' } }}>
                {loading ? 'Création…' : 'Créer & publier'}
              </Button>
              <Button fullWidth variant="outlined" startIcon={<SaveIcon />}
                onClick={() => handleSubmit(true)} disabled={loading}
                sx={{ py: 1.1, borderRadius: 2, textTransform: 'none', fontWeight: 600,
                  borderColor: '#e2e8f0', color: '#475569',
                  '&:hover': { borderColor: '#1976d2', color: '#1976d2', bgcolor: '#eff6ff' } }}>
                Enregistrer en brouillon
              </Button>
              <Button fullWidth onClick={() => navigate('/job-offers')} disabled={loading}
                sx={{ py: 1, borderRadius: 2, textTransform: 'none', color: '#94a3b8',
                  '&:hover': { bgcolor: '#f8fafc' } }}>
                Annuler
              </Button>
            </Box>

          </Box>
        </Grid>
      </Grid>
    </Box>
  );
};

export default CreateJobOffer;
