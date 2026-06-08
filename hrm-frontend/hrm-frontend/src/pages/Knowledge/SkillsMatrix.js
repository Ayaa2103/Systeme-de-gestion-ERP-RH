import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  Box, Card, CardContent, Typography, Avatar, Chip, IconButton,
  Dialog, DialogContent, DialogActions, Button, Checkbox,
  FormControlLabel, Skeleton, Tooltip, Grid, Divider, Snackbar, Alert,
} from '@mui/material';
import {
  Psychology as SkillIcon,
  Edit as EditIcon,
  Star as StarIcon,
  ArrowBack as BackIcon,
  StarBorder as StarBorderIcon,
  Business as DeptIcon,
  CheckCircle as CheckIcon,
  Close as CloseIcon,
  People as PeopleIcon,
  TrendingUp as TrendingIcon,
} from '@mui/icons-material';
import { getSkillsMatrix, updateEmployeeSkill } from '../../services/knowledgeService';
import { getDepartments } from '../../services/hrService';

const LEVELS = [
  { value: 0, label: 'Non évalué', color: '#94a3b8', bg: '#f8fafc', bar: 0 },
  { value: 1, label: 'Débutant',      color: '#e65100', bg: '#fff7ed', bar: 1 },
  { value: 2, label: 'Intermédiaire', color: '#f57c00', bg: '#fff8e1', bar: 2 },
  { value: 3, label: 'Confirmé',      color: '#1976d2', bg: '#e3f2fd', bar: 3 },
  { value: 4, label: 'Expert',        color: '#2e7d32', bg: '#e8f5e9', bar: 4 },
];

const DEPT_COLORS = ['#1976d2','#2e7d32','#7b1fa2','#e65100','#0891b2','#c62828','#5d4037','#0097a7'];
const deptColor = (name = '') => DEPT_COLORS[(name.charCodeAt(0) || 0) % DEPT_COLORS.length];

const COLORS = ['#1976d2','#388e3c','#d32f2f','#7b1fa2','#f57c00','#0097a7'];
const avatarColor = (name = '') => COLORS[(name.charCodeAt(0) || 0) % COLORS.length];

/* ── Cell niveau visuel ─────────────────────────────────────────── */
const LevelCell = ({ level, certified, onEdit }) => {
  const lv = LEVELS[level] || LEVELS[0];
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0.5,
      py: 0.75, px: 0.5, borderRadius: 2, cursor: 'pointer',
      bgcolor: level > 0 ? `${lv.color}08` : 'transparent',
      transition: 'all 0.15s', '&:hover': { bgcolor: `${lv.color}15` } }}
      onClick={onEdit}>

      {/* Barre de niveau */}
      <Box sx={{ display: 'flex', gap: 0.3, alignItems: 'flex-end', height: 18 }}>
        {[1,2,3,4].map(i => (
          <Box key={i} sx={{
            width: 5, borderRadius: 1,
            height: i <= level ? `${i * 4 + 4}px` : '4px',
            bgcolor: i <= level ? lv.color : '#e2e8f0',
            transition: 'all 0.2s',
          }} />
        ))}
      </Box>

      <Typography sx={{ fontSize: '0.62rem', fontWeight: level > 0 ? 700 : 400,
        color: level > 0 ? lv.color : '#94a3b8', whiteSpace: 'nowrap', lineHeight: 1 }}>
        {level > 0 ? lv.label : '—'}
      </Typography>

      {certified && (
        <StarIcon sx={{ fontSize: 11, color: '#ffc107' }} />
      )}
    </Box>
  );
};

/* ── Main ───────────────────────────────────────────────────────── */
const SkillsMatrix = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const [departments,   setDepartments]   = useState([]);
  const [selDept,       setSelDept]       = useState(searchParams.get('department') || '');
  const [matrixData,    setMatrixData]    = useState(null);
  const [loading,       setLoading]       = useState(false);
  const [loadingDepts,  setLoadingDepts]  = useState(true);

  const [editDialog,    setEditDialog]    = useState(false);
  const [selEmployee,   setSelEmployee]   = useState(null);
  const [selSkill,      setSelSkill]      = useState(null);
  const [skillLevel,    setSkillLevel]    = useState(0);
  const [isCertified,   setIsCertified]   = useState(false);
  const [saving,        setSaving]        = useState(false);
  const [snack,         setSnack]         = useState({ open: false, msg: '', severity: 'success' });

  useEffect(() => {
    getDepartments()
      .then(r => setDepartments(Array.isArray(r.data) ? r.data : []))
      .catch(() => {})
      .finally(() => setLoadingDepts(false));
  }, []);

  useEffect(() => {
    if (selDept) fetchMatrix();
  }, [selDept]);

  const fetchMatrix = async () => {
    setLoading(true);
    try {
      const res = await getSkillsMatrix(selDept);
      setMatrixData(res);
    } catch (_) { setMatrixData(null); }
    finally { setLoading(false); }
  };

  const openEdit = (employee, skill) => {
    const es = employee.skills.find(s => s.skill_id === skill.id);
    setSelEmployee(employee);
    setSelSkill(skill);
    setSkillLevel(es?.level || 0);
    setIsCertified(es?.certified || false);
    setEditDialog(true);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await updateEmployeeSkill(selEmployee.employee.id, selSkill.id, {
        level: skillLevel, certified: isCertified,
      });
      setSnack({ open: true, msg: 'Compétence mise à jour', severity: 'success' });
      fetchMatrix();
      setEditDialog(false);
    } catch (_) {
      setSnack({ open: true, msg: 'Erreur lors de la mise à jour', severity: 'error' });
    } finally { setSaving(false); }
  };

  const chooseDept = (id) => {
    setSelDept(String(id));
    setSearchParams({ department: id });
  };

  // Stats
  const totalEmp   = matrixData?.matrix?.length || 0;
  const totalSkill = matrixData?.skills?.length || 0;
  const allCells   = matrixData?.matrix?.flatMap(e => e.skills) || [];
  const evaluated  = allCells.filter(s => s.level > 0).length;
  const certified  = allCells.filter(s => s.certified).length;
  const coverage   = allCells.length > 0 ? Math.round((evaluated / allCells.length) * 100) : 0;

  const selDeptName = departments.find(d => String(d.id) === String(selDept))?.name || '';

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
              <SkillIcon sx={{ fontSize: 22, color: 'white' }} />
            </Box>
            <Box>
              <Typography variant="h5" fontWeight={700} color="white">
                Matrice de Compétences
                {selDeptName && <span style={{ opacity: 0.7, fontWeight: 400, fontSize: '0.9rem' }}> — {selDeptName}</span>}
              </Typography>
              <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.65)', mt: 0.3 }}>
                Visualisez et éditez les niveaux de compétences par département
              </Typography>
            </Box>
          </Box>
          {matrixData && (
            <Box sx={{ display: 'flex', gap: 2.5 }}>
              {[
                { label: 'Employés',  value: totalEmp,   color: '#60a5fa' },
                { label: 'Couverture',value: `${coverage}%`, color: coverage >= 70 ? '#34d399' : '#fbbf24' },
                { label: 'Certifiés', value: certified,  color: '#a78bfa' },
              ].map(s => (
                <Box key={s.label} sx={{ textAlign: 'center' }}>
                  <Typography sx={{ fontSize: '1.3rem', fontWeight: 800, color: s.color, lineHeight: 1 }}>{s.value}</Typography>
                  <Typography sx={{ fontSize: '0.68rem', color: 'rgba(255,255,255,0.5)', mt: 0.2 }}>{s.label}</Typography>
                </Box>
              ))}
            </Box>
          )}
        </Box>
      </Card>

      {/* Sélection département */}
      <Card elevation={0} sx={{ border: '1px solid #e8ecf0', borderRadius: 3, mb: 3, overflow: 'hidden' }}>
        <Box sx={{ background: 'linear-gradient(135deg,#0f172a,#1e3a5f,#1e40af)',
          px: 2.5, py: 1.5, display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.12)', width: 28, height: 28, borderRadius: 1.5 }}>
            <DeptIcon sx={{ fontSize: 14, color: 'white' }} />
          </Avatar>
          <Typography sx={{ color: 'white', fontWeight: 700, fontSize: '0.88rem' }}>Choisir un département</Typography>
        </Box>
        <CardContent sx={{ p: 2 }}>
          {loadingDepts ? (
            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
              {[1,2,3,4].map(i => <Skeleton key={i} width={100} height={36} sx={{ borderRadius: 50 }} />)}
            </Box>
          ) : departments.length === 0 ? (
            <Typography variant="caption" color="text.secondary">Aucun département configuré</Typography>
          ) : (
            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
              {departments.map(dept => {
                const active = String(selDept) === String(dept.id);
                const dc = deptColor(dept.name);
                return (
                  <Box key={dept.id} onClick={() => chooseDept(dept.id)}
                    sx={{ display: 'flex', alignItems: 'center', gap: 0.75, px: 1.5, py: 0.6,
                      borderRadius: 50, cursor: 'pointer', fontWeight: active ? 700 : 500,
                      fontSize: '0.82rem', userSelect: 'none', transition: 'all 0.15s',
                      border: `2px solid ${active ? dc : '#e8ecf0'}`,
                      bgcolor: active ? `${dc}10` : 'white',
                      color: active ? dc : '#475569',
                      '&:hover': { borderColor: dc, bgcolor: `${dc}08` } }}>
                    <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: active ? dc : '#e2e8f0', flexShrink: 0 }} />
                    {dept.name}
                    {dept.code && (
                      <Chip label={dept.code} size="small"
                        sx={{ ml: 0.25, height: 16, fontSize: '0.6rem', fontWeight: 700,
                          bgcolor: active ? `${dc}20` : '#f1f5f9', color: active ? dc : '#64748b' }} />
                    )}
                  </Box>
                );
              })}
            </Box>
          )}
        </CardContent>
      </Card>

      {/* Légende */}
      <Card elevation={0} sx={{ border: '1px solid #e8ecf0', borderRadius: 3, mb: 3 }}>
        <CardContent sx={{ p: 1.5, '&:last-child': { pb: 1.5 } }}>
          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center' }}>
            <Typography sx={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Légende :
            </Typography>
            {LEVELS.filter(l => l.value > 0).map(lv => (
              <Box key={lv.value} sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                <Box sx={{ display: 'flex', gap: 0.25, alignItems: 'flex-end', height: 14 }}>
                  {[1,2,3,4].map(i => (
                    <Box key={i} sx={{ width: 4, borderRadius: 0.5,
                      height: `${i <= lv.value ? i * 3 + 3 : 3}px`,
                      bgcolor: i <= lv.value ? lv.color : '#e2e8f0' }} />
                  ))}
                </Box>
                <Typography sx={{ fontSize: '0.72rem', color: lv.color, fontWeight: 600 }}>{lv.label}</Typography>
              </Box>
            ))}
            <Divider orientation="vertical" flexItem />
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <StarIcon sx={{ fontSize: 14, color: '#ffc107' }} />
              <Typography sx={{ fontSize: '0.72rem', color: '#64748b' }}>Certifié</Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <EditIcon sx={{ fontSize: 13, color: '#94a3b8' }} />
              <Typography sx={{ fontSize: '0.72rem', color: '#64748b' }}>Cliquer sur une cellule pour modifier</Typography>
            </Box>
          </Box>
        </CardContent>
      </Card>

      {/* Matrix */}
      {!selDept ? (
        <Card elevation={0} sx={{ border: '2px dashed #e8ecf0', borderRadius: 3 }}>
          <CardContent sx={{ textAlign: 'center', py: 8 }}>
            <DeptIcon sx={{ fontSize: 48, color: '#cbd5e1', mb: 1.5 }} />
            <Typography variant="body1" fontWeight={600} color="text.secondary">Sélectionnez un département</Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
              Choisissez un département ci-dessus pour afficher sa matrice de compétences
            </Typography>
          </CardContent>
        </Card>
      ) : loading ? (
        <Card elevation={0} sx={{ border: '1px solid #e8ecf0', borderRadius: 3, overflow: 'hidden' }}>
          <Box sx={{ p: 2 }}>
            {[1,2,3,4].map(i => <Skeleton key={i} height={52} sx={{ mb: 0.75, borderRadius: 2 }} />)}
          </Box>
        </Card>
      ) : !matrixData || matrixData.matrix?.length === 0 ? (
        <Card elevation={0} sx={{ border: '1px solid #e8ecf0', borderRadius: 3 }}>
          <CardContent sx={{ textAlign: 'center', py: 7 }}>
            <SkillIcon sx={{ fontSize: 44, color: '#cbd5e1', mb: 1 }} />
            <Typography variant="body2" color="text.secondary">Aucune donnée pour ce département</Typography>
          </CardContent>
        </Card>
      ) : (
        <Card elevation={0} sx={{ border: '1px solid #e8ecf0', borderRadius: 3, overflow: 'hidden' }}>

          {/* Header de la matrice */}
          <Box sx={{ background: 'linear-gradient(135deg,#0f172a,#1e3a5f,#1e40af)',
            px: 2.5, py: 1.5, display: 'flex', alignItems: 'center', gap: 2 }}>
            <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.12)', width: 28, height: 28, borderRadius: 1.5 }}>
              <SkillIcon sx={{ fontSize: 14, color: 'white' }} />
            </Avatar>
            <Typography sx={{ color: 'white', fontWeight: 700, fontSize: '0.88rem', flex: 1 }}>
              {matrixData.department?.name} — {totalEmp} employé{totalEmp !== 1 ? 's' : ''} · {totalSkill} compétence{totalSkill !== 1 ? 's' : ''}
            </Typography>
            <Chip label={`${coverage}% couverture`} size="small"
              sx={{ bgcolor: 'rgba(255,255,255,0.15)', color: 'white', fontWeight: 700, fontSize: '0.7rem' }} />
          </Box>

          {/* Table */}
          <Box sx={{ overflowX: 'auto' }}>
            <table style={{ borderCollapse: 'collapse', width: '100%', tableLayout: 'fixed' }}>
              <colgroup>
                <col style={{ width: 220 }} />
                {matrixData.skills.map(s => (
                  <col key={s.id} style={{ width: 110 }} />
                ))}
              </colgroup>
              <thead>
                <tr style={{ background: '#f8fafc' }}>
                  {/* Colonne employé */}
                  <th style={{ padding: '10px 16px', textAlign: 'left', borderBottom: '2px solid #e8ecf0',
                    fontSize: '0.7rem', fontWeight: 700, color: '#475569', textTransform: 'uppercase',
                    letterSpacing: '0.5px', position: 'sticky', left: 0, background: '#f8fafc', zIndex: 2 }}>
                    Employé
                  </th>
                  {matrixData.skills.map(skill => (
                    <th key={skill.id} style={{ padding: '10px 8px', textAlign: 'center',
                      borderBottom: '2px solid #e8ecf0', borderLeft: '1px solid #f1f5f9' }}>
                      <Typography sx={{ fontSize: '0.78rem', fontWeight: 700, color: '#1e293b', lineHeight: 1.2 }}>
                        {skill.name}
                      </Typography>
                      {skill.category && (
                        <Typography sx={{ fontSize: '0.62rem', color: '#94a3b8', mt: 0.25 }}>
                          {skill.category}
                        </Typography>
                      )}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {matrixData.matrix.map((emp, ri) => (
                  <tr key={emp.employee.id}
                    style={{ background: ri % 2 === 0 ? 'white' : '#fafbfc',
                      borderBottom: '1px solid #f1f5f9' }}>

                    {/* Employé */}
                    <td style={{ padding: '8px 16px', position: 'sticky', left: 0,
                      background: ri % 2 === 0 ? 'white' : '#fafbfc', zIndex: 1,
                      borderRight: '2px solid #e8ecf0' }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25 }}>
                        <Avatar sx={{ bgcolor: avatarColor(emp.employee.name), width: 30, height: 30,
                          fontSize: '0.72rem', fontWeight: 700, flexShrink: 0 }}>
                          {emp.employee.name?.[0]?.toUpperCase() || '?'}
                        </Avatar>
                        <Box sx={{ minWidth: 0 }}>
                          <Typography sx={{ fontSize: '0.8rem', fontWeight: 600, color: '#1e293b' }} noWrap>
                            {emp.employee.name}
                          </Typography>
                          <Typography sx={{ fontSize: '0.68rem', color: '#94a3b8' }} noWrap>
                            {emp.employee.matricule}
                          </Typography>
                        </Box>
                      </Box>
                    </td>

                    {/* Cells de compétences */}
                    {emp.skills.map(skill => (
                      <td key={skill.skill_id}
                        style={{ padding: '4px 6px', textAlign: 'center', borderLeft: '1px solid #f1f5f9' }}>
                        <LevelCell
                          level={skill.level || 0}
                          certified={skill.certified}
                          onEdit={() => openEdit(emp, matrixData.skills.find(s => s.id === skill.skill_id))}
                        />
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </Box>
        </Card>
      )}

      {/* Dialog édition compétence */}
      <Dialog open={editDialog} onClose={() => setEditDialog(false)} maxWidth="sm" fullWidth
        PaperProps={{ sx: { borderRadius: 3, overflow: 'hidden' } }}>
        <Box sx={{ background: 'linear-gradient(135deg,#0f172a,#1e3a5f,#1e40af)', px: 3, py: 2.5,
          display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.12)', width: 30, height: 30, borderRadius: 1.5 }}>
              <SkillIcon sx={{ fontSize: 15, color: 'white' }} />
            </Avatar>
            <Box>
              <Typography sx={{ color: 'white', fontWeight: 700 }}>Modifier la compétence</Typography>
              {selEmployee && selSkill && (
                <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.6)' }}>
                  {selEmployee.employee.name} · {selSkill.name}
                </Typography>
              )}
            </Box>
          </Box>
          <IconButton size="small" onClick={() => setEditDialog(false)}
            sx={{ color: 'rgba(255,255,255,0.6)', '&:hover': { color: 'white' } }}>
            <CloseIcon fontSize="small" />
          </IconButton>
        </Box>

        <DialogContent sx={{ p: 3 }}>
          {selEmployee && selSkill && (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>

              {/* Contexte */}
              <Box sx={{ display: 'flex', gap: 2 }}>
                <Box sx={{ flex: 1, p: 1.5, bgcolor: '#f8fafc', borderRadius: 2, border: '1px solid #e8ecf0' }}>
                  <Typography sx={{ fontSize: '0.68rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.4px', mb: 0.3 }}>
                    Employé
                  </Typography>
                  <Typography sx={{ fontSize: '0.875rem', fontWeight: 600, color: '#1e293b' }}>
                    {selEmployee.employee.name}
                  </Typography>
                </Box>
                <Box sx={{ flex: 1, p: 1.5, bgcolor: '#f8fafc', borderRadius: 2, border: '1px solid #e8ecf0' }}>
                  <Typography sx={{ fontSize: '0.68rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.4px', mb: 0.3 }}>
                    Compétence
                  </Typography>
                  <Typography sx={{ fontSize: '0.875rem', fontWeight: 600, color: '#1e293b' }}>
                    {selSkill.name}
                  </Typography>
                  {selSkill.category && (
                    <Typography variant="caption" color="text.secondary">{selSkill.category}</Typography>
                  )}
                </Box>
              </Box>

              {/* Sélection niveau */}
              <Box>
                <Typography sx={{ fontSize: '0.78rem', fontWeight: 700, color: '#475569',
                  textTransform: 'uppercase', letterSpacing: '0.5px', mb: 1.25 }}>
                  Niveau de maîtrise
                </Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.75 }}>
                  {LEVELS.map(lv => (
                    <Box key={lv.value} onClick={() => setSkillLevel(lv.value)}
                      sx={{ display: 'flex', alignItems: 'center', gap: 2, p: 1.25, borderRadius: 2,
                        cursor: 'pointer', transition: 'all 0.15s',
                        border: `2px solid ${skillLevel === lv.value ? lv.color : '#e8ecf0'}`,
                        bgcolor: skillLevel === lv.value ? lv.bg : 'white',
                        '&:hover': { borderColor: lv.color, bgcolor: lv.bg } }}>

                      {/* Barre visuelle */}
                      <Box sx={{ display: 'flex', gap: 0.3, alignItems: 'flex-end', height: 20, width: 28, flexShrink: 0 }}>
                        {[1,2,3,4].map(i => (
                          <Box key={i} sx={{ width: 5, borderRadius: 1,
                            height: `${i <= lv.value ? i * 4 + 4 : 4}px`,
                            bgcolor: i <= lv.value ? lv.color : '#e2e8f0' }} />
                        ))}
                      </Box>

                      <Box sx={{ flex: 1 }}>
                        <Typography sx={{ fontSize: '0.875rem', fontWeight: skillLevel === lv.value ? 700 : 500,
                          color: skillLevel === lv.value ? lv.color : '#1e293b' }}>
                          {lv.label}
                        </Typography>
                      </Box>

                      {skillLevel === lv.value && (
                        <CheckIcon sx={{ fontSize: 16, color: lv.color, flexShrink: 0 }} />
                      )}
                    </Box>
                  ))}
                </Box>
              </Box>

              {/* Certification */}
              <Box sx={{ p: 1.5, borderRadius: 2, border: `2px solid ${isCertified ? '#ffc107' : '#e8ecf0'}`,
                bgcolor: isCertified ? '#fffde7' : 'white', transition: 'all 0.15s',
                display: 'flex', alignItems: 'center', gap: 1.5, cursor: 'pointer' }}
                onClick={() => setIsCertified(p => !p)}>
                <StarIcon sx={{ fontSize: 22, color: isCertified ? '#ffc107' : '#e2e8f0' }} />
                <Box sx={{ flex: 1 }}>
                  <Typography sx={{ fontSize: '0.875rem', fontWeight: 600,
                    color: isCertified ? '#f57f00' : '#1e293b' }}>
                    Compétence certifiée
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    L'employé possède une certification officielle pour cette compétence
                  </Typography>
                </Box>
                <Checkbox checked={isCertified} onChange={e => setIsCertified(e.target.checked)}
                  sx={{ p: 0, '&.Mui-checked': { color: '#ffc107' } }} onClick={e => e.stopPropagation()} />
              </Box>

            </Box>
          )}
        </DialogContent>

        <DialogActions sx={{ px: 3, pb: 2.5, gap: 1 }}>
          <Button onClick={() => setEditDialog(false)}
            sx={{ borderRadius: 2, textTransform: 'none', color: '#64748b' }}>Annuler</Button>
          <Button onClick={handleSave} variant="contained" disabled={saving}
            sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 600,
              background: 'linear-gradient(135deg,#1e3a5f,#1e40af)' }}>
            Enregistrer
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

export default SkillsMatrix;
