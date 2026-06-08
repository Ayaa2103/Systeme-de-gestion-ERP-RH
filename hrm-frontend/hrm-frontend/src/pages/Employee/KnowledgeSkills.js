import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box, Card, CardContent, Typography, Grid, Chip, Avatar,
  LinearProgress, Skeleton, Button, TextField, InputAdornment,
  Divider, Tooltip,
} from '@mui/material';
import {
  Psychology as SkillIcon,
  Description as DocIcon,
  GetApp as DownloadIcon,
  Search as SearchIcon,
  Star as StarIcon,
  Work as PositionIcon,
  ArrowBack as BackIcon,
  Lightbulb as KnowledgeIcon,
  Verified as CertIcon,
} from '@mui/icons-material';
import { knowledgeService } from '../../services/knowledgeService';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

/* ── Niveaux compétences ── */
const SKILL_LEVELS = {
  0: { label: 'Non évalué',  color: '#94a3b8', bg: '#f8fafc' },
  1: { label: 'Débutant',    color: '#c62828', bg: '#ffebee' },
  2: { label: 'Intermédiaire',color: '#f57c00', bg: '#fff8e1' },
  3: { label: 'Confirmé',    color: '#1976d2', bg: '#e3f2fd' },
  4: { label: 'Expert',      color: '#2e7d32', bg: '#e8f5e9' },
};

/* ── Niveaux polyvalence ── */
const POLY_LEVELS = {
  0: { label: 'Non formé',   color: '#94a3b8', bg: '#f8fafc' },
  1: { label: 'Accompagné',  color: '#c62828', bg: '#ffebee' },
  2: { label: 'Supervisé',   color: '#f57c00', bg: '#fff8e1' },
  3: { label: 'Autonome',    color: '#1976d2', bg: '#e3f2fd' },
  4: { label: 'Expert',      color: '#2e7d32', bg: '#e8f5e9' },
};

const DOC_CATEGORIES = {
  quality:    { label: 'Qualité',     color: '#1976d2', bg: '#e3f2fd' },
  production: { label: 'Production',  color: '#7b1fa2', bg: '#f3e5f5' },
  security:   { label: 'Sécurité',    color: '#c62828', bg: '#ffebee' },
  hr:         { label: 'RH',          color: '#2e7d32', bg: '#e8f5e9' },
  other:      { label: 'Autre',       color: '#64748b', bg: '#f1f5f9' },
};

const colSx = {
  fontSize: '0.68rem', fontWeight: 700, color: '#475569',
  textTransform: 'uppercase', letterSpacing: '0.5px', py: 1, px: 2,
  bgcolor: '#f8fafc', borderBottom: '2px solid #e8ecf0',
};

const NavHeader = ({ title, icon }) => (
  <Box sx={{ background: 'linear-gradient(135deg,#0f172a,#1e3a5f,#1e40af)',
    px: 2.5, py: 1.5, display: 'flex', alignItems: 'center', gap: 1.5 }}>
    <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.12)', width: 28, height: 28, borderRadius: 1.5 }}>
      {React.cloneElement(icon, { sx: { fontSize: 14, color: 'white' } })}
    </Avatar>
    <Typography sx={{ color: 'white', fontWeight: 700, fontSize: '0.88rem' }}>{title}</Typography>
  </Box>
);

/* ── Barre de niveau visuelle ── */
const LevelBars = ({ level, max = 4 }) => (
  <Box sx={{ display: 'flex', gap: 0.35, alignItems: 'flex-end', height: 16 }}>
    {Array.from({ length: max }).map((_, i) => {
      const lv = SKILL_LEVELS[level] || SKILL_LEVELS[0];
      return (
        <Box key={i} sx={{ width: 5, borderRadius: 1,
          height: `${i <= level - 1 ? (i + 1) * 3 + 3 : 3}px`,
          bgcolor: i <= level - 1 ? lv.color : '#e2e8f0' }} />
      );
    })}
  </Box>
);

const TABS = ['Compétences', 'Polyvalence', 'Documents'];

const KnowledgeSkills = () => {
  const navigate = useNavigate();
  const [skills,    setSkills]    = useState([]);
  const [positions, setPositions] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [tab,       setTab]       = useState(0);
  const [docSearch, setDocSearch] = useState('');
  const [docFilter, setDocFilter] = useState('');

  useEffect(() => {
    Promise.all([
      knowledgeService.getEmployeeSkills(),
      knowledgeService.getEmployeeDocuments(),
    ]).then(([skillsData, docsData]) => {
      setSkills(skillsData.skills    || []);
      setPositions(skillsData.positions || []);
      setDocuments(docsData.documents   || []);
    }).catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const groupedSkills = useMemo(() =>
    skills.reduce((acc, s) => {
      const cat = s.category || 'Autres';
      if (!acc[cat]) acc[cat] = [];
      acc[cat].push(s);
      return acc;
    }, {}), [skills]);

  const filteredDocs = useMemo(() => {
    const q = docSearch.toLowerCase();
    return documents.filter(d =>
      (!q || d.title?.toLowerCase().includes(q) || d.description?.toLowerCase().includes(q)) &&
      (!docFilter || d.category === docFilter)
    );
  }, [documents, docSearch, docFilter]);

  const certifiedCount  = skills.filter(s => s.certified).length;
  const avgLevel        = skills.length > 0
    ? (skills.reduce((s, k) => s + (k.level || 0), 0) / skills.length).toFixed(1)
    : 0;
  const autonomousCount = positions.filter(p => p.level >= 3).length;

  if (loading) return (
    <Box sx={{ p: 3 }}>
      {[1,2,3].map(i => <Skeleton key={i} variant="rounded" height={80} sx={{ mb: 2, borderRadius: 3 }} />)}
    </Box>
  );

  return (
    <Box sx={{ width: '100%' }}>

      {/* ── Banner ── */}
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
              <Typography variant="h5" fontWeight={700} color="white">Mes Connaissances</Typography>
              <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.65)', mt: 0.3 }}>
                Compétences · Polyvalence · Documents
              </Typography>
            </Box>
          </Box>
          <Box sx={{ display: 'flex', gap: 2.5 }}>
            {[
              { label: 'Compétences',  value: skills.length,    color: '#60a5fa' },
              { label: 'Certifiées',   value: certifiedCount,   color: '#fbbf24' },
              { label: 'Niveau moy.',  value: avgLevel,         color: '#86efac' },
            ].map(s => (
              <Box key={s.label} sx={{ textAlign: 'center' }}>
                <Typography sx={{ fontSize: '1.3rem', fontWeight: 800, color: s.color, lineHeight: 1 }}>{s.value}</Typography>
                <Typography sx={{ fontSize: '0.68rem', color: 'rgba(255,255,255,0.5)', mt: 0.2 }}>{s.label}</Typography>
              </Box>
            ))}
          </Box>
        </Box>
      </Card>

      {/* ── Tabs custom ── */}
      <Card elevation={0} sx={{ border: '1px solid #e8ecf0', borderRadius: 3, mb: 3 }}>
        <Box sx={{ display: 'flex', borderBottom: '1px solid #e8ecf0' }}>
          {TABS.map((t, i) => (
            <Box key={i} onClick={() => setTab(i)}
              sx={{ px: 2.5, py: 1.5, cursor: 'pointer', flex: 1, textAlign: 'center',
                borderBottom: `3px solid ${tab === i ? '#1976d2' : 'transparent'}`,
                color: tab === i ? '#1976d2' : '#64748b',
                fontWeight: tab === i ? 700 : 500, fontSize: '0.85rem', transition: 'all 0.15s',
                '&:hover': { color: '#1976d2', bgcolor: '#f8fafc' } }}>
              {t}
            </Box>
          ))}
        </Box>
      </Card>

      {/* ══ Onglet 0 — Compétences ══ */}
      {tab === 0 && (
        Object.keys(groupedSkills).length === 0 ? (
          <Card elevation={0} sx={{ borderRadius: 3, border: '2px dashed #e8ecf0' }}>
            <CardContent sx={{ textAlign: 'center', py: 7 }}>
              <SkillIcon sx={{ fontSize: 44, color: '#cbd5e1', mb: 1 }} />
              <Typography variant="body2" color="text.secondary">Aucune compétence assignée pour le moment</Typography>
            </CardContent>
          </Card>
        ) : (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            {/* Légende */}
            <Card elevation={0} sx={{ border: '1px solid #e8ecf0', borderRadius: 3 }}>
              <CardContent sx={{ p: 1.5, '&:last-child': { pb: 1.5 } }}>
                <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center' }}>
                  <Typography sx={{ fontSize: '0.72rem', fontWeight: 700, color: '#94a3b8',
                    textTransform: 'uppercase', letterSpacing: '0.5px' }}>Niveaux :</Typography>
                  {Object.entries(SKILL_LEVELS).filter(([k]) => k > 0).map(([k, v]) => (
                    <Box key={k} sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                      <LevelBars level={parseInt(k)} />
                      <Typography sx={{ fontSize: '0.72rem', color: v.color, fontWeight: 600 }}>{v.label}</Typography>
                    </Box>
                  ))}
                  <Divider orientation="vertical" flexItem />
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <StarIcon sx={{ fontSize: 14, color: '#ffc107' }} />
                    <Typography sx={{ fontSize: '0.72rem', color: '#64748b' }}>Certifié</Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>

            {Object.entries(groupedSkills).map(([cat, catSkills]) => (
              <Card key={cat} elevation={0} sx={{ borderRadius: 3, border: '1px solid #e8ecf0', overflow: 'hidden' }}>
                <NavHeader title={cat || 'Compétences générales'} icon={<SkillIcon />} />
                <Box>
                  {/* En-têtes de colonnes */}
                  <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 110px 120px 60px',
                    px: 2, py: 1, bgcolor: '#f8fafc', borderBottom: '2px solid #e8ecf0' }}>
                    {['Compétence', 'Niveau', 'Progression', 'Certif.'].map(h => (
                      <Typography key={h} sx={{ fontSize: '0.68rem', fontWeight: 700, color: '#475569',
                        textTransform: 'uppercase', letterSpacing: '0.5px' }}>{h}</Typography>
                    ))}
                  </Box>
                  {catSkills.map((skill, i) => {
                    const lv = SKILL_LEVELS[skill.level] || SKILL_LEVELS[0];
                    return (
                      <Box key={skill.id}>
                        <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 110px 120px 60px',
                          px: 2, py: 1.5, alignItems: 'center',
                          '&:hover': { bgcolor: '#f8fafc' }, transition: 'background 0.15s' }}>

                          {/* Compétence */}
                          <Box>
                            <Typography sx={{ fontSize: '0.875rem', fontWeight: 600, color: '#1e293b' }}>
                              {skill.name}
                            </Typography>
                            {skill.description && (
                              <Typography variant="caption" color="text.secondary" noWrap
                                sx={{ display: 'block', maxWidth: 220 }}>
                                {skill.description}
                              </Typography>
                            )}
                          </Box>

                          {/* Niveau */}
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <LevelBars level={skill.level || 0} />
                            <Chip label={skill.level_display || lv.label} size="small"
                              sx={{ bgcolor: lv.bg, color: lv.color, fontWeight: 700, fontSize: '0.65rem',
                                height: 20, border: `1px solid ${lv.color}25` }} />
                          </Box>

                          {/* Progression */}
                          <Box sx={{ pr: 1 }}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.4 }}>
                              <LinearProgress variant="determinate" value={(skill.level / 4) * 100}
                                sx={{ flex: 1, height: 5, borderRadius: 3, bgcolor: `${lv.color}12`,
                                  '& .MuiLinearProgress-bar': { bgcolor: lv.color, borderRadius: 3 } }} />
                              <Typography sx={{ fontSize: '0.68rem', fontWeight: 700, color: lv.color, ml: 1, minWidth: 28 }}>
                                {Math.round((skill.level / 4) * 100)}%
                              </Typography>
                            </Box>
                          </Box>

                          {/* Certification */}
                          <Box sx={{ textAlign: 'center' }}>
                            {skill.certified ? (
                              <Tooltip title={skill.certification_date
                                ? `Certifié le ${format(new Date(skill.certification_date), 'dd MMM yyyy', { locale: fr })}`
                                : 'Certifié'}>
                                <StarIcon sx={{ fontSize: 18, color: '#ffc107' }} />
                              </Tooltip>
                            ) : (
                              <StarIcon sx={{ fontSize: 18, color: '#e2e8f0' }} />
                            )}
                          </Box>
                        </Box>
                        {i < catSkills.length - 1 && <Divider />}
                      </Box>
                    );
                  })}
                </Box>
              </Card>
            ))}
          </Box>
        )
      )}

      {/* ══ Onglet 1 — Polyvalence ══ */}
      {tab === 1 && (
        positions.length === 0 ? (
          <Card elevation={0} sx={{ borderRadius: 3, border: '2px dashed #e8ecf0' }}>
            <CardContent sx={{ textAlign: 'center', py: 7 }}>
              <PositionIcon sx={{ fontSize: 44, color: '#cbd5e1', mb: 1 }} />
              <Typography variant="body2" color="text.secondary">Aucune polyvalence assignée pour le moment</Typography>
            </CardContent>
          </Card>
        ) : (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            {/* Stat polyvalence */}
            <Grid container spacing={2}>
              {[
                { label: 'Postes évalués', value: positions.length,    color: '#1976d2', bg: '#eff6ff' },
                { label: 'Autonomes+',     value: autonomousCount,     color: '#2e7d32', bg: '#e8f5e9' },
                { label: 'Non formés',     value: positions.filter(p => p.level === 0).length, color: '#94a3b8', bg: '#f8fafc' },
              ].map(s => (
                <Grid item xs={4} key={s.label}>
                  <Card elevation={0} sx={{ border: `1px solid ${s.color}20`, borderRadius: 3 }}>
                    <CardContent sx={{ p: 2, textAlign: 'center' }}>
                      <Typography variant="h4" fontWeight={800} sx={{ color: s.color, lineHeight: 1 }}>{s.value}</Typography>
                      <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>{s.label}</Typography>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>

            {/* Légende polyvalence */}
            <Card elevation={0} sx={{ border: '1px solid #e8ecf0', borderRadius: 3 }}>
              <CardContent sx={{ p: 1.5, '&:last-child': { pb: 1.5 } }}>
                <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center' }}>
                  <Typography sx={{ fontSize: '0.72rem', fontWeight: 700, color: '#94a3b8',
                    textTransform: 'uppercase', letterSpacing: '0.5px' }}>Autonomie :</Typography>
                  {Object.entries(POLY_LEVELS).filter(([k]) => k > 0).map(([k, v]) => (
                    <Box key={k} sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                      <Box sx={{ display: 'flex', gap: 0.25 }}>
                        {[1,2,3,4].map(i => (
                          <Box key={i} sx={{ width: i <= parseInt(k) ? 7 : 5, height: i <= parseInt(k) ? 7 : 5,
                            borderRadius: 0.75, bgcolor: i <= parseInt(k) ? v.color : '#e2e8f0' }} />
                        ))}
                      </Box>
                      <Typography sx={{ fontSize: '0.72rem', color: v.color, fontWeight: 600 }}>{v.label}</Typography>
                    </Box>
                  ))}
                </Box>
              </CardContent>
            </Card>

            {/* Tableau polyvalence */}
            <Card elevation={0} sx={{ borderRadius: 3, border: '1px solid #e8ecf0', overflow: 'hidden' }}>
              <NavHeader title="Ma polyvalence par poste" icon={<PositionIcon />} />
              <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 120px 130px',
                px: 2, py: 1, bgcolor: '#f8fafc', borderBottom: '2px solid #e8ecf0' }}>
                {['Poste / Département', 'Autonomie', 'Progression'].map(h => (
                  <Typography key={h} sx={{ fontSize: '0.68rem', fontWeight: 700, color: '#475569',
                    textTransform: 'uppercase', letterSpacing: '0.5px' }}>{h}</Typography>
                ))}
              </Box>
              {positions.map((pos, i) => {
                const lv = POLY_LEVELS[pos.level] || POLY_LEVELS[0];
                return (
                  <Box key={pos.id}>
                    <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 120px 130px',
                      px: 2, py: 1.5, alignItems: 'center',
                      '&:hover': { bgcolor: '#f8fafc' }, transition: 'background 0.15s' }}>
                      <Box>
                        <Typography sx={{ fontSize: '0.875rem', fontWeight: 600, color: '#1e293b' }}>
                          {pos.name}
                        </Typography>
                        {pos.department && (
                          <Typography variant="caption" color="text.secondary">{pos.department}</Typography>
                        )}
                      </Box>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Box sx={{ display: 'flex', gap: 0.25 }}>
                          {[1,2,3,4].map(i => (
                            <Box key={i} sx={{ width: i <= pos.level ? 8 : 5, height: i <= pos.level ? 8 : 5,
                              borderRadius: 0.75, bgcolor: i <= pos.level ? lv.color : '#e2e8f0' }} />
                          ))}
                        </Box>
                        <Chip label={pos.level_display || lv.label} size="small"
                          sx={{ bgcolor: lv.bg, color: lv.color, fontWeight: 700,
                            fontSize: '0.62rem', height: 18, border: `1px solid ${lv.color}25` }} />
                      </Box>
                      <Box sx={{ pr: 2 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <LinearProgress variant="determinate" value={(pos.level / 4) * 100}
                            sx={{ flex: 1, height: 5, borderRadius: 3, bgcolor: `${lv.color}12`,
                              '& .MuiLinearProgress-bar': { bgcolor: lv.color, borderRadius: 3 } }} />
                          <Typography sx={{ fontSize: '0.68rem', fontWeight: 700, color: lv.color, minWidth: 28 }}>
                            {Math.round((pos.level / 4) * 100)}%
                          </Typography>
                        </Box>
                      </Box>
                    </Box>
                    {i < positions.length - 1 && <Divider />}
                  </Box>
                );
              })}
            </Card>
          </Box>
        )
      )}

      {/* ══ Onglet 2 — Documents ══ */}
      {tab === 2 && (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          {/* Search + filter */}
          <Card elevation={0} sx={{ border: '1px solid #e8ecf0', borderRadius: 3 }}>
            <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
              <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center' }}>
                <TextField placeholder="Rechercher un document…" value={docSearch}
                  onChange={e => setDocSearch(e.target.value)} size="small"
                  sx={{ flex: 1, minWidth: 200, '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                  InputProps={{ startAdornment: <InputAdornment position="start"><SearchIcon sx={{ fontSize: 16, color: '#94a3b8' }} /></InputAdornment> }} />
                <Box sx={{ display: 'flex', gap: 1 }}>
                  {[{ val: '', label: 'Tous' }, ...Object.entries(DOC_CATEGORIES).map(([k,v]) => ({ val: k, label: v.label }))].map(f => {
                    const active = docFilter === f.val;
                    const cfg = f.val ? DOC_CATEGORIES[f.val] : null;
                    return (
                      <Box key={f.val} onClick={() => setDocFilter(p => p === f.val ? '' : f.val)}
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
              </Box>
            </CardContent>
          </Card>

          {/* Documents grid */}
          {filteredDocs.length === 0 ? (
            <Card elevation={0} sx={{ borderRadius: 3, border: '2px dashed #e8ecf0' }}>
              <CardContent sx={{ textAlign: 'center', py: 7 }}>
                <DocIcon sx={{ fontSize: 44, color: '#cbd5e1', mb: 1 }} />
                <Typography variant="body2" color="text.secondary">Aucun document trouvé</Typography>
              </CardContent>
            </Card>
          ) : (
            <Grid container spacing={2}>
              {filteredDocs.map(doc => {
                const cat = DOC_CATEGORIES[doc.category] || DOC_CATEGORIES.other;
                return (
                  <Grid item xs={12} sm={6} md={4} key={doc.id}>
                    <Card elevation={0} sx={{ borderRadius: 3, border: `1px solid ${cat.color}20`,
                      borderTop: `3px solid ${cat.color}`, height: '100%', overflow: 'hidden',
                      transition: 'all 0.2s', '&:hover': { boxShadow: `0 4px 16px ${cat.color}12` } }}>
                      <CardContent sx={{ p: 2.5 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1.5 }}>
                          <Box sx={{ flex: 1, minWidth: 0 }}>
                            <Typography sx={{ fontSize: '0.9rem', fontWeight: 700, color: '#1e293b', lineHeight: 1.3 }}>
                              {doc.title}
                            </Typography>
                          </Box>
                          {doc.file_url && (
                            <Tooltip title="Télécharger">
                              <Box component="a"
                                href={`${process.env.REACT_APP_API_URL || 'http://localhost:8000'}${doc.file_url}`}
                                download target="_blank" rel="noopener noreferrer"
                                sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center',
                                  width: 28, height: 28, borderRadius: 1.5, bgcolor: cat.bg, flexShrink: 0, ml: 1,
                                  color: cat.color, textDecoration: 'none',
                                  '&:hover': { filter: 'brightness(0.95)' } }}>
                                <DownloadIcon sx={{ fontSize: 15 }} />
                              </Box>
                            </Tooltip>
                          )}
                        </Box>

                        <Chip label={cat.label} size="small"
                          sx={{ bgcolor: cat.bg, color: cat.color, fontWeight: 700,
                            fontSize: '0.68rem', height: 20, border: `1px solid ${cat.color}25`, mb: 1.25 }} />

                        {doc.description && (
                          <Typography sx={{ fontSize: '0.78rem', color: '#64748b', lineHeight: 1.6, mb: 1.5,
                            overflow: 'hidden', display: '-webkit-box',
                            WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
                            {doc.description}
                          </Typography>
                        )}

                        <Divider sx={{ mb: 1.25 }} />
                        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                          <Chip label={`v${doc.version || '1.0'}`} size="small"
                            sx={{ bgcolor: '#f8fafc', color: '#64748b', fontSize: '0.65rem', height: 18 }} />
                          {doc.updated_at && (
                            <Typography variant="caption" color="text.secondary">
                              {format(new Date(doc.updated_at), 'dd MMM yyyy', { locale: fr })}
                            </Typography>
                          )}
                        </Box>
                      </CardContent>
                    </Card>
                  </Grid>
                );
              })}
            </Grid>
          )}
        </Box>
      )}
    </Box>
  );
};

export default KnowledgeSkills;
