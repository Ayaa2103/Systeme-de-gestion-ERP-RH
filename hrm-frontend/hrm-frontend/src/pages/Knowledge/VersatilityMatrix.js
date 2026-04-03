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
import { getDepartments } from '../../services/hrService';
import { getVersatilityMatrix, updateEmployeePosition } from '../../services/knowledgeService';

const VersatilityMatrix = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [departments, setDepartments] = useState([]);
  const [selectedDepartment, setSelectedDepartment] = useState(searchParams.get('department') || '');
  const [matrixData, setMatrixData] = useState(null);
  const [editDialog, setEditDialog] = useState(false);
  const [selectedPosition, setSelectedPosition] = useState(null);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [versatilityLevel, setVersatilityLevel] = useState(0);
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
      setDepartments([
        { id: 1, name: 'Informatique' },
        { id: 2, name: 'Ressources Humaines' },
        { id: 3, name: 'Finance' },
        { id: 4, name: 'Marketing' }
      ]);
    }
  };

  const fetchMatrix = async () => {
    if (!selectedDepartment) return;
    
    setLoading(true);
    try {
      const response = await getVersatilityMatrix(selectedDepartment);
      setMatrixData(response);
    } catch (error) {
      console.error('Erreur:', error);
      // Fallback avec données simulées
      const deptName = departments.find(d => d.id == selectedDepartment)?.name || 'Département';
      setMatrixData({
        department: { id: selectedDepartment, name: deptName },
        positions: [
          { id: 1, title: 'Poste 1', department: deptName },
          { id: 2, title: 'Poste 2', department: deptName }
        ],
        matrix: [
          {
            employee: { id: 1, name: 'Employé Test', matricule: 'EMP001', poste: 'Poste Test' },
            positions: [
              { position_id: 1, level: 2, certified: false },
              { position_id: 2, level: 1, certified: false }
            ]
          }
        ]
      });
    } finally {
      setLoading(false);
    }
  };

  const handleEditPosition = (employee, position) => {
    const employeePosition = employee.positions.find(p => p.position_id === position.id);
    setSelectedEmployee(employee);
    setSelectedPosition(position);
    setVersatilityLevel(employeePosition?.level || 0);
    setIsCertified(employeePosition?.certified || false);
    setEditDialog(true);
  };

  const handleSavePosition = async () => {
    try {
      await updateEmployeePosition(selectedEmployee.employee.id, selectedPosition.id, {
        level: versatilityLevel,
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
      0: 'Non formé',
      1: 'Accompagné',
      2: 'Supervisé',
      3: 'Autonome',
      4: 'Expert'
    };
    return labels[level] || 'Non formé';
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" fontWeight="bold" gutterBottom color="secondary">
          🔄 Matrice de Polyvalence
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Gérez la polyvalence des employés sur différents postes
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
              {matrixData.department.name} - Matrice de Polyvalence
            </Typography>
            
            <TableContainer sx={{ maxHeight: 600 }}>
              <Table stickyHeader>
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ minWidth: 200, fontWeight: 600 }}>
                      Employé
                    </TableCell>
                    {matrixData.positions.map((position) => (
                      <TableCell 
                        key={position.id} 
                        sx={{ minWidth: 120, fontWeight: 600, textAlign: 'center' }}
                      >
                        <Box>
                          <Typography variant="body2" fontWeight="600">
                            {position.name || position.title}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {position.department || 'Département'}
                          </Typography>
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
                      {employee.positions.map((position) => (
                        <TableCell key={position.position_id} sx={{ textAlign: 'center' }}>
                          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0.5 }}>
                            <Chip
                              label={getLevelLabel(position.level)}
                              color={getLevelColor(position.level)}
                              size="small"
                              sx={{ minWidth: 80 }}
                            />
                            {position.certified && (
                              <StarIcon sx={{ color: '#ffd700', fontSize: 16 }} />
                            )}
                            <IconButton
                              size="small"
                              onClick={() => handleEditPosition(employee, matrixData.positions.find(p => p.id === position.position_id))}
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
          Modifier la Polyvalence
        </DialogTitle>
        <DialogContent>
          {selectedEmployee && selectedPosition && (
            <Box sx={{ pt: 2 }}>
              <Typography variant="body1" gutterBottom>
                <strong>Employé:</strong> {selectedEmployee.employee.name}
              </Typography>
              <Typography variant="body1" gutterBottom>
                <strong>Poste:</strong> {selectedPosition.name || selectedPosition.title}
              </Typography>
              
              <Box sx={{ mt: 3 }}>
                <Typography variant="body2" gutterBottom>
                  Niveau de polyvalence:
                </Typography>
                <Rating
                  value={versatilityLevel}
                  onChange={(event, newValue) => setVersatilityLevel(newValue || 0)}
                  max={4}
                  icon={<StarIcon />}
                  emptyIcon={<StarBorderIcon />}
                />
                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
                  {getLevelLabel(versatilityLevel)}
                </Typography>
              </Box>

              <FormControlLabel
                control={
                  <Checkbox
                    checked={isCertified}
                    onChange={(e) => setIsCertified(e.target.checked)}
                  />
                }
                label="Polyvalence certifiée"
                sx={{ mt: 2 }}
              />
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditDialog(false)}>
            Annuler
          </Button>
          <Button onClick={handleSavePosition} variant="contained">
            Sauvegarder
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default VersatilityMatrix;