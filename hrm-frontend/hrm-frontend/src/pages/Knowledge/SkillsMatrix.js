import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  FormControlLabel,
  Checkbox,
  Rating
} from '@mui/material';
import {
  Edit as EditIcon,
  Star as StarIcon,
  StarBorder as StarBorderIcon
} from '@mui/icons-material';
import { getSkillsMatrix, updateEmployeeSkill } from '../../services/knowledgeService';
import { getDepartments } from '../../services/hrService';

const SkillsMatrix = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [departments, setDepartments] = useState([]);
  const [selectedDepartment, setSelectedDepartment] = useState(searchParams.get('department') || '');
  const [matrixData, setMatrixData] = useState(null);
  const [editDialog, setEditDialog] = useState(false);
  const [selectedSkill, setSelectedSkill] = useState(null);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [skillLevel, setSkillLevel] = useState(0);
  const [isCertified, setIsCertified] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchDepartments();
  }, []);

  useEffect(() => {
    if (selectedDepartment) {
      fetchMatrix();
    }
  }, [selectedDepartment]);

  const fetchDepartments = async () => {
    try {
      const response = await getDepartments();
      setDepartments(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error('Erreur:', error);
    }
  };

  const fetchMatrix = async () => {
    if (!selectedDepartment) return;
    
    setLoading(true);
    try {
      const response = await getSkillsMatrix(selectedDepartment);
      setMatrixData(response);
    } catch (error) {
      console.error('Erreur:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEditSkill = (employee, skill) => {
    const employeeSkill = employee.skills.find(s => s.skill_id === skill.id);
    setSelectedEmployee(employee);
    setSelectedSkill(skill);
    setSkillLevel(employeeSkill?.level || 0);
    setIsCertified(employeeSkill?.certified || false);
    setEditDialog(true);
  };

  const handleSaveSkill = async () => {
    try {
      await updateEmployeeSkill(selectedEmployee.employee.id, selectedSkill.id, {
        level: skillLevel,
        certified: isCertified
      });
      await fetchMatrix();
      setEditDialog(false);
    } catch (error) {
      console.error('Erreur:', error);
    }
  };

  const getLevelColor = (level) => {
    const colors = {
      0: 'default',
      1: 'error',
      2: 'warning', 
      3: 'info',
      4: 'success'
    };
    return colors[level] || 'default';
  };

  const getLevelLabel = (level) => {
    const labels = {
      0: 'Non évalué',
      1: 'Débutant',
      2: 'Intermédiaire',
      3: 'Confirmé',
      4: 'Expert'
    };
    return labels[level] || 'Non évalué';
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" fontWeight="bold" gutterBottom color="primary">
          🎯 Matrice de Compétences
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Visualisez et gérez les compétences des employés par département
        </Typography>
      </Box>

      <Card elevation={0} sx={{ border: '1px solid #e0e0e0', borderRadius: 2, mb: 3 }}>
        <CardContent>
          <TextField
            select
            fullWidth
            label="Sélectionner un département"
            value={selectedDepartment}
            onChange={(e) => {
              setSelectedDepartment(e.target.value);
              setSearchParams({ department: e.target.value });
            }}
            SelectProps={{ native: true }}
          >
            <option value="">Choisir un département...</option>
            {departments.map((dept) => (
              <option key={dept.id} value={dept.id}>
                {dept.name}
              </option>
            ))}
          </TextField>
        </CardContent>
      </Card>

      {matrixData && (
        <Card elevation={0} sx={{ border: '1px solid #e0e0e0', borderRadius: 2 }}>
          <CardContent>
            <Typography variant="h6" fontWeight="600" gutterBottom>
              {matrixData.department.name} - Matrice des Compétences
            </Typography>
            
            <TableContainer sx={{ maxHeight: 600 }}>
              <Table stickyHeader>
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ minWidth: 200, fontWeight: 600 }}>
                      Employé
                    </TableCell>
                    {matrixData.skills.map((skill) => (
                      <TableCell 
                        key={skill.id} 
                        sx={{ minWidth: 120, fontWeight: 600, textAlign: 'center' }}
                      >
                        <Box>
                          <Typography variant="body2" fontWeight="600">
                            {skill.name}
                          </Typography>
                          {skill.category && (
                            <Typography variant="caption" color="text.secondary">
                              {skill.category}
                            </Typography>
                          )}
                        </Box>
                      </TableCell>
                    ))}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {matrixData.matrix.map((employee) => (
                    <TableRow key={employee.employee.id}>
                      <TableCell>
                        <Box>
                          <Typography variant="body2" fontWeight="600">
                            {employee.employee.name}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {employee.employee.matricule} • {employee.employee.poste}
                          </Typography>
                        </Box>
                      </TableCell>
                      {employee.skills.map((skill) => (
                        <TableCell key={skill.skill_id} sx={{ textAlign: 'center' }}>
                          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0.5 }}>
                            <Chip
                              label={getLevelLabel(skill.level)}
                              color={getLevelColor(skill.level)}
                              size="small"
                              sx={{ minWidth: 80 }}
                            />
                            {skill.certified && (
                              <StarIcon sx={{ color: '#ffd700', fontSize: 16 }} />
                            )}
                            <IconButton
                              size="small"
                              onClick={() => handleEditSkill(employee, matrixData.skills.find(s => s.id === skill.skill_id))}
                            >
                              <EditIcon fontSize="small" />
                            </IconButton>
                          </Box>
                        </TableCell>
                      ))}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>
      )}

      <Dialog open={editDialog} onClose={() => setEditDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          Modifier la Compétence
        </DialogTitle>
        <DialogContent>
          {selectedEmployee && selectedSkill && (
            <Box sx={{ pt: 2 }}>
              <Typography variant="body1" gutterBottom>
                <strong>Employé:</strong> {selectedEmployee.employee.name}
              </Typography>
              <Typography variant="body1" gutterBottom>
                <strong>Compétence:</strong> {selectedSkill.name}
              </Typography>
              
              <Box sx={{ mt: 3 }}>
                <Typography variant="body2" gutterBottom>
                  Niveau de maîtrise:
                </Typography>
                <Rating
                  value={skillLevel}
                  onChange={(event, newValue) => setSkillLevel(newValue || 0)}
                  max={4}
                  icon={<StarIcon />}
                  emptyIcon={<StarBorderIcon />}
                />
                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
                  {getLevelLabel(skillLevel)}
                </Typography>
              </Box>

              <FormControlLabel
                control={
                  <Checkbox
                    checked={isCertified}
                    onChange={(e) => setIsCertified(e.target.checked)}
                  />
                }
                label="Compétence certifiée"
                sx={{ mt: 2 }}
              />
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditDialog(false)}>
            Annuler
          </Button>
          <Button onClick={handleSaveSkill} variant="contained">
            Sauvegarder
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default SkillsMatrix;