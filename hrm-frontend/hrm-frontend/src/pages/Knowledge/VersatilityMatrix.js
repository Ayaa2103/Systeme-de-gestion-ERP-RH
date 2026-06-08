import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  Box, Card, CardContent, Typography, Avatar, Chip, IconButton,
  Dialog, DialogContent, DialogActions, Button,
  Checkbox, Skeleton, Tooltip, Divider, Snackbar, Alert,
} from '@mui/material';
import {
  AccountTree as PolyIcon,
  ArrowBack as BackIcon,
  Business as DeptIcon,
  Star as StarIcon,
  CheckCircle as CheckIcon,
  Close as CloseIcon,
  People as PeopleIcon,
  Verified as CertIcon,
} from '@mui/icons-material';
import { getDepartments } from '../../services/hrService';
import { getVersatilityMatrix, updateEmployeePosition } from '../../services/knowledgeService';

/* Niveaux de polyvalence — différents de la matrice de compétences */
const LEVELS = [
  { value: 0, label: 'Non formé',  color: '#94a3b8', bg: '#f8fafc' },
  { value: 1, label: 'Accompagné', color: '#c62828', bg: '#ffebee' },
  { value: 2, label: 'Supervisé',  color: '#f57c00', bg: '#fff8e1' },
  { value: 3, label: 'Autonome',   color: '#1976d2', bg: '#e3f2fd' },
  { value: 4, label: 'Expert',     color: '#2e7d32', bg: '#e8f5e9' },
];

const DEPT_COLORS = ['#1976d2','#2e7d32','#7b1fa2','#e65100','#0891b2','#c62828','#5d4037','#0097a7'];
const deptColor = (name = '') => DEPT_COLORS[(name.charCodeAt(0) || 0) % DEPT_COLORS.length];

const AVATAR_COLORS = ['#1976d2','#388e3c','#d32f2f','#7b1fa2','#f57c00','#0097a7'];
const avatarColor = (name = '') => AVATAR_COLORS[(name.charCodeAt(0) || 0) % AVATAR_COLORS.length];

/* ── Cellule polyvalence — carrés horizontaux (≠ barres verticales compétences) ── */
const PolyCell = ({ level, certified, onEdit }) => {
  const lv = LEVELS[level] || LEVELS[0];
  return (
    <Box onClick={onEdit}
      sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0.5,
        py: 0.75, px: 0.5, borderRadius: 2, cursor: 'pointer',
        bgcolor: level > 0 ? `${lv.color}08` : 'transparent',
        transition: 'all 0.15s', '&:hover': { bgcolor: `${lv.color}18` } }}>

      {/* Carrés horizontaux empilés */}
      <Box sx={{ display: 'flex', gap: 0.3, alignItems: 'center' }}>
        {[1,2,3,4].map(i => (
          <Box key={i} sx={{
            width: i <= level ? 8 : 5,
            height: i <= level ? 8 : 5,
            borderRadius: 0.75,
            bgcolor: i <= level ? lv.color : '#e2e8f0',
            transition: 'all 0.2s',
          }} />
        ))}
      </Box>

      <Typography sx={{ fontSize: '0.62rem', fontWeight: level > 0 ? 700 : 400,
        color: level > 0 ? lv.color : '#94a3b8', whiteSpace: 'nowrap', lineHeight: 1 }}>
        {level > 0 ? lv.label : '—'}
      </Typography>

      {certified && <StarIcon sx={{ fontSize: 11, color: '#ffc107' }} />}
    </Box>
  );
};

/* ── Main ───────────────────────────────────────────────────────── */
const VersatilityMatrix = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const [departments,  setDepartments]  = useState([]);
  const [selDept,      setSelDept]      = useState(searchParams.get('department') || '');
  const [matrixData,   setMatrixData]   = useState(null);
  const [loading,      setLoading]      = useState(false);
  const [loadingDepts, setLoadingDepts] = useState(true);

  const [editDialog,   setEditDialog]   = useState(false);
  const [selEmployee,  setSelEmployee]  = useState(null);
  const [selPosition,  setSelPosition]  = useState(null);
  const [polyLevel,    setPolyLevel]    = useState(0);
  const [isCertified,  setIsCertified]  = useState(false);
  const [saving,       setSaving]       = useState(false);
  const [snack,        setSnack]        = useState({ open: false, msg: '', severity: 'success' });

  useEffect(() => {
    getDepartments()
      .then(r => setDepartments(Array.isArray(r.data) ? r.data : []))
      .catch(() => {})
      .finally(() => setLoadingDepts(false));
  }, []);

  useEffect(() => { if (selDept) fetchMatrix(); }, [selDept]);

  const fetchMatrix = async () => {
    setLoading(true);
    try {
      const res = await getVersatilityMatrix(selDept);
      setMatrixData(res);
    } catch (_) { setMatrixData(null); }
    finally { setLoading(false); }
  };

  const openEdit = (employee, position) => {
    const ep = employee.positions.find(p => p.position_id === position.id);
    setSelEmployee(employee);
    setSelPosition(position);
    setPolyLevel(ep?.level || 0);
    setIsCertified(ep?.certified || false);
    setEditDialog(true);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await updateEmployeePosition(selEmployee.employee.id, selPosition.id, {
        level: polyLevel, certified: isCertified,
      });
      setSnack({ open: true, msg: 'Polyvalence mise à jour', severity: 'success' });
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

  /* Stats */
  const totalEmp   = matrixData?.matrix?.length || 0;
  const totalPos   = matrixData?.positions?.length || 0;
  const allCells   = matrixData?.matrix?.flatMap(e => e.positions) || [];
  const evaluated  = allCells.filter(p => p.level > 0).length;
  const autonomous = allCells.filter(p => p.level >= 3).length;
  const certified  = allCells.filter(p => p.certified).length;
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
              <PolyIcon sx={{ fontSize: 22, color: 'white' }} />
            </Box>
            <Box>
              <Typography variant="h5" fontWeight={700} color="white">
                Matrice de Polyvalence
                {selDeptName && <span style={{ opacity: 0.7, fontWeight: 400, fontSize: '0.9rem' }}> — {selDeptName}</span>}
              </Typography>
              <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.65)', mt: 0.3 }}>
                Gérez la polyvalence des employés sur différents postes
              </Typography>
            </Box>
          </Box>
          {matrixData && (
            <Box sx={{ display: 'flex', gap: 2.5 }}>
              {[
                { label: 'Employés',   value: totalEmp,            color: '#60a5fa' },
                { label: 'Couverture', value: `${coverage}%`,      color: coverage >= 70 ? '#34d399' : '#fbbf24' },
                { label: 'Autonomes+', value: autonomous,          color: '#86efac' },
                { label: 'Certifiés',  value: certified,           color: '#fcd34d' },
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
              {[1,2,3,4].map(i => <Skeleton key={i} width={110} height={36} sx={{ borderRadius: 50 }} />)}
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
                    <Box sx={{ width: 8, height: 8, borderRadius: 0.5, bgcolor: active ? dc : '#e2e8f0', flexShrink: 0 }} />
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
            <Typography sx={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b',
              textTransform: 'uppercase', letterSpacing: '0.5px' }}>Légende :</Typography>
            {LEVELS.filter(l => l.value > 0).map(lv => (
              <Box key={lv.value} sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                <Box sx={{ display: 'flex', gap: 0.25, alignItems: 'center' }}>
                  {[1,2,3,4].map(i => (
                    <Box key={i} sx={{ width: i <= lv.value ? 7 : 5, height: i <= lv.value ? 7 : 5,
                      borderRadius: 0.5, bgcolor: i <= lv.value ? lv.color : '#e2e8f0' }} />
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
              Choisissez un département ci-dessus pour afficher sa matrice de polyvalence
            </Typography>
          </CardContent>
        </Card>
      ) : loading ? (
        <Card elevation={0} sx={{ border: '1px solid #e8ecf0', borderRadius: 3 }}>
          <Box sx={{ p: 2 }}>
            {[1,2,3,4].map(i => <Skeleton key={i} height={52} sx={{ mb: 0.75, borderRadius: 2 }} />)}
          </Box>
        </Card>
      ) : !matrixData || matrixData.matrix?.length === 0 ? (
        <Card elevation={0} sx={{ border: '1px solid #e8ecf0', borderRadius: 3 }}>
          <CardContent sx={{ textAlign: 'center', py: 7 }}>
            <PolyIcon sx={{ fontSize: 44, color: '#cbd5e1', mb: 1 }} />
            <Typography variant="body2" color="text.secondary">Aucune donnée pour ce département</Typography>
          </CardContent>
        </Card>
      ) : (
        <Card elevation={0} sx={{ border: '1px solid #e8ecf0', borderRadius: 3, overflow: 'hidden' }}>

          {/* Header */}
          <Box sx={{ background: 'linear-gradient(135deg,#0f172a,#1e3a5f,#1e40af)',
            px: 2.5, py: 1.5, display: 'flex', alignItems: 'center', gap: 2 }}>
            <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.12)', width: 28, height: 28, borderRadius: 1.5 }}>
              <PolyIcon sx={{ fontSize: 14, color: 'white' }} />
            </Avatar>
            <Typography sx={{ color: 'white', fontWeight: 700, fontSize: '0.88rem', flex: 1 }}>
              {matrixData.department?.name} — {totalEmp} employé{totalEmp !== 1 ? 's' : ''} · {totalPos} poste{totalPos !== 1 ? 's' : ''}
            </Typography>
            <Chip label={`${coverage}% couverture`} size="small"
              sx={{ bgcolor: 'rgba(255,255,255,0.15)', color: 'white', fontWeight: 700, fontSize: '0.7rem' }} />
          </Box>

          {/* Table */}
          <Box sx={{ overflowX: 'auto' }}>
            <table style={{ borderCollapse: 'collapse', width: '100%', tableLayout: 'fixed' }}>
              <colgroup>
                <col style={{ width: 220 }} />
                {matrixData.positions.map(p => <col key={p.id} style={{ width: 120 }} />)}
              </colgroup>
              <thead>
                <tr style={{ background: '#f8fafc' }}>
                  <th style={{ padding: '10px 16px', textAlign: 'left', borderBottom: '2px solid #e8ecf0',
                    fontSize: '0.7rem', fontWeight: 700, color: '#475569', textTransform: 'uppercase',
                    letterSpacing: '0.5px', position: 'sticky', left: 0, background: '#f8fafc', zIndex: 2 }}>
                    Employé
                  </th>
                  {matrixData.positions.map(pos => (
                    <th key={pos.id} style={{ padding: '10px 8px', textAlign: 'center',
                      borderBottom: '2px solid #e8ecf0', borderLeft: '1px solid #f1f5f9' }}>
                      <Typography sx={{ fontSize: '0.78rem', fontWeight: 700, color: '#1e293b', lineHeight: 1.2 }}>
                        {pos.name || pos.title}
                      </Typography>
                      {(pos.department || pos.department_name) && (
                        <Typography sx={{ fontSize: '0.62rem', color: '#94a3b8', mt: 0.25 }}>
                          {pos.department || pos.department_name}
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
                    {emp.positions.map(pos => (
                      <td key={pos.position_id}
                        style={{ padding: '4px 6px', textAlign: 'center', borderLeft: '1px solid #f1f5f9' }}>
                        <PolyCell
                          level={pos.level || 0}
                          certified={pos.certified}
                          onEdit={() => openEdit(emp, matrixData.positions.find(p => p.id === pos.position_id))}
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

      {/* Dialog édition */}
      <Dialog open={editDialog} onClose={() => setEditDialog(false)} maxWidth="sm" fullWidth
        PaperProps={{ sx: { borderRadius: 3, overflow: 'hidden' } }}>
        <Box sx={{ background: 'linear-gradient(135deg,#0f172a,#1e3a5f,#1e40af)', px: 3, py: 2.5,
          display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.12)', width: 30, height: 30, borderRadius: 1.5 }}>
              <PolyIcon sx={{ fontSize: 15, color: 'white' }} />
            </Avatar>
            <Box>
              <Typography sx={{ color: 'white', fontWeight: 700 }}>Modifier la polyvalence</Typography>
              {selEmployee && selPosition && (
                <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.6)' }}>
                  {selEmployee.employee.name} · {selPosition.name || selPosition.title}
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
          {selEmployee && selPosition && (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>

              {/* Contexte */}
              <Box sx={{ display: 'flex', gap: 2 }}>
                <Box sx={{ flex: 1, p: 1.5, bgcolor: '#f8fafc', borderRadius: 2, border: '1px solid #e8ecf0' }}>
                  <Typography sx={{ fontSize: '0.68rem', color: '#94a3b8', textTransform: 'uppercase',
                    letterSpacing: '0.4px', mb: 0.3 }}>Employé</Typography>
                  <Typography sx={{ fontSize: '0.875rem', fontWeight: 600, color: '#1e293b' }}>
                    {selEmployee.employee.name}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">{selEmployee.employee.matricule}</Typography>
                </Box>
                <Box sx={{ flex: 1, p: 1.5, bgcolor: '#f8fafc', borderRadius: 2, border: '1px solid #e8ecf0' }}>
                  <Typography sx={{ fontSize: '0.68rem', color: '#94a3b8', textTransform: 'uppercase',
                    letterSpacing: '0.4px', mb: 0.3 }}>Poste</Typography>
                  <Typography sx={{ fontSize: '0.875rem', fontWeight: 600, color: '#1e293b' }}>
                    {selPosition.name || selPosition.title}
                  </Typography>
                  {(selPosition.department || selPosition.department_name) && (
                    <Typography variant="caption" color="text.secondary">
                      {selPosition.department || selPosition.department_name}
                    </Typography>
                  )}
                </Box>
              </Box>

              {/* Sélection niveau polyvalence */}
              <Box>
                <Typography sx={{ fontSize: '0.78rem', fontWeight: 700, color: '#475569',
                  textTransform: 'uppercase', letterSpacing: '0.5px', mb: 1.25 }}>
                  Niveau de polyvalence
                </Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.75 }}>
                  {LEVELS.map(lv => (
                    <Box key={lv.value} onClick={() => setPolyLevel(lv.value)}
                      sx={{ display: 'flex', alignItems: 'center', gap: 2, p: 1.25, borderRadius: 2,
                        cursor: 'pointer', transition: 'all 0.15s',
                        border: `2px solid ${polyLevel === lv.value ? lv.color : '#e8ecf0'}`,
                        bgcolor: polyLevel === lv.value ? lv.bg : 'white',
                        '&:hover': { borderColor: lv.color, bgcolor: lv.bg } }}>

                      {/* Carrés visuels */}
                      <Box sx={{ display: 'flex', gap: 0.3, alignItems: 'center', width: 30, flexShrink: 0 }}>
                        {[1,2,3,4].map(i => (
                          <Box key={i} sx={{ width: i <= lv.value ? 8 : 5, height: i <= lv.value ? 8 : 5,
                            borderRadius: 0.75, bgcolor: i <= lv.value ? lv.color : '#e2e8f0',
                            transition: 'all 0.15s' }} />
                        ))}
                      </Box>

                      <Typography sx={{ fontSize: '0.875rem', flex: 1,
                        fontWeight: polyLevel === lv.value ? 700 : 500,
                        color: polyLevel === lv.value ? lv.color : '#1e293b' }}>
                        {lv.label}
                      </Typography>

                      {polyLevel === lv.value && (
                        <CheckIcon sx={{ fontSize: 16, color: lv.color, flexShrink: 0 }} />
                      )}
                    </Box>
                  ))}
                </Box>
              </Box>

              {/* Certification */}
              <Box onClick={() => setIsCertified(p => !p)}
                sx={{ p: 1.5, borderRadius: 2,
                  border: `2px solid ${isCertified ? '#ffc107' : '#e8ecf0'}`,
                  bgcolor: isCertified ? '#fffde7' : 'white', transition: 'all 0.15s',
                  display: 'flex', alignItems: 'center', gap: 1.5, cursor: 'pointer' }}>
                <CertIcon sx={{ fontSize: 22, color: isCertified ? '#ffc107' : '#e2e8f0' }} />
                <Box sx={{ flex: 1 }}>
                  <Typography sx={{ fontSize: '0.875rem', fontWeight: 600,
                    color: isCertified ? '#f57f00' : '#1e293b' }}>
                    Polyvalence certifiée
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    L'employé possède une habilitation officielle pour ce poste
                  </Typography>
                </Box>
                <Checkbox checked={isCertified} onChange={e => setIsCertified(e.target.checked)}
                  onClick={e => e.stopPropagation()}
                  sx={{ p: 0, '&.Mui-checked': { color: '#ffc107' } }} />
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

export default VersatilityMatrix;
