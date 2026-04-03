import React, { useState, useEffect } from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, Button, MenuItem, Box
} from '@mui/material';
import { employeeService } from '../services/employeeService';

const EmployeeForm = ({ open, onClose, employee, onSuccess }) => {
  const [formData, setFormData] = useState({
    matricule: '',
    poste: '',
    service: '',
    department: '',
    date_embauche: '',
    statut: 'actif'
  });
  const [departments, setDepartments] = useState([]);

  useEffect(() => {
    if (open) {
      loadDepartments();
      if (employee) {
        setFormData({
          matricule: employee.matricule || '',
          poste: employee.poste || '',
          service: employee.service || '',
          department: employee.department || '',
          date_embauche: employee.date_embauche || '',
          statut: employee.statut || 'actif'
        });
      }
    }
  }, [open, employee]);

  const loadDepartments = async () => {
    try {
      const response = await employeeService.getDepartments();
      setDepartments(response.data);
    } catch (error) {
      console.error('Erreur lors du chargement des départements:', error);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const submitData = {
        ...formData,
        department: formData.department || null,
        date_embauche: formData.date_embauche || null
      };

      await employeeService.updateEmployee(employee.id, submitData);
      onSuccess();
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <form onSubmit={handleSubmit}>
        <DialogTitle>Modifier l'Employé</DialogTitle>
        <DialogContent>
          <Box display="flex" flexDirection="column" gap={2} mt={1}>
            <TextField
              label="Matricule"
              name="matricule"
              value={formData.matricule}
              onChange={handleChange}
              required
              fullWidth
            />

            <TextField
              label="Poste"
              name="poste"
              value={formData.poste}
              onChange={handleChange}
              fullWidth
            />

            <TextField
              label="Service"
              name="service"
              value={formData.service}
              onChange={handleChange}
              fullWidth
            />

            <TextField
              select
              label="Département"
              name="department"
              value={formData.department}
              onChange={handleChange}
              fullWidth
            >
              <MenuItem value="">Aucun</MenuItem>
              {departments.map((dept) => (
                <MenuItem key={dept.id} value={dept.id}>
                  {dept.name}
                </MenuItem>
              ))}
            </TextField>

            <TextField
              type="date"
              label="Date d'embauche"
              name="date_embauche"
              value={formData.date_embauche}
              onChange={handleChange}
              fullWidth
              InputLabelProps={{ shrink: true }}
            />

            <TextField
              select
              label="Statut"
              name="statut"
              value={formData.statut}
              onChange={handleChange}
              required
              fullWidth
            >
              <MenuItem value="actif">Actif</MenuItem>
              <MenuItem value="inactif">Inactif</MenuItem>
              <MenuItem value="suspendu">Suspendu</MenuItem>
            </TextField>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>Annuler</Button>
          <Button type="submit" variant="contained">
            Sauvegarder
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default EmployeeForm;