import React, { useState, useEffect } from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, Button, MenuItem, Box, Typography
} from '@mui/material';
import { employeeService } from '../services/employeeService';

const ContractForm = ({ open, onClose, contract, employee, mode, onSuccess }) => {
  const [formData, setFormData] = useState({
    employee: '',
    type: '',
    date_debut: '',
    date_fin: '',
    salaire: ''
  });

  useEffect(() => {
    if (open) {
      if (mode === 'edit' && contract) {
        setFormData({
          employee: contract.employee,
          type: contract.type,
          date_debut: contract.date_debut,
          date_fin: contract.date_fin || '',
          salaire: contract.salaire || ''
        });
      } else if (mode === 'create' && employee) {
        setFormData({
          employee: employee.id,
          type: '',
          date_debut: '',
          date_fin: '',
          salaire: ''
        });
      } else if (mode === 'renew' && contract) {
        const today = new Date();
        const nextYear = new Date(today.getFullYear() + 1, today.getMonth(), today.getDate());
        
        setFormData({
          employee: contract.employee,
          type: contract.type,
          date_debut: today.toISOString().split('T')[0],
          date_fin: contract.type === 'CDI' ? '' : nextYear.toISOString().split('T')[0],
          salaire: contract.salaire || ''
        });
      }
    }
  }, [open, contract, employee, mode]);

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
        date_fin: formData.date_fin || null,
        salaire: formData.salaire ? parseFloat(formData.salaire) : null
      };

      if (mode === 'create') {
        await employeeService.createContract(submitData);
        alert('Contrat créé avec succès!');
      } else if (mode === 'edit') {
        await employeeService.updateContract(contract.id, submitData);
        alert('Contrat modifié avec succès!');
      } else if (mode === 'renew') {
        await employeeService.renewContract(contract.id, submitData);
        alert('Contrat renouvelé avec succès!');
      }
      
      onSuccess();
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
      alert('Erreur lors de l\'opération sur le contrat');
    }
  };

  const getTitle = () => {
    switch (mode) {
      case 'create': return 'Créer un Contrat';
      case 'edit': return 'Modifier le Contrat';
      case 'renew': return 'Renouveler le Contrat';
      default: return 'Contrat';
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <form onSubmit={handleSubmit}>
        <DialogTitle>{getTitle()}</DialogTitle>
        <DialogContent>
          <Box display="flex" flexDirection="column" gap={2} mt={1}>
            <TextField
              select
              label="Type de contrat"
              name="type"
              value={formData.type}
              onChange={handleChange}
              required
              fullWidth
            >
              <MenuItem value="CDI">CDI</MenuItem>
              <MenuItem value="CDD">CDD</MenuItem>
              <MenuItem value="Stage">Stage</MenuItem>
            </TextField>

            <TextField
              type="date"
              label="Date de début"
              name="date_debut"
              value={formData.date_debut}
              onChange={handleChange}
              required
              fullWidth
              InputLabelProps={{ shrink: true }}
            />

            {formData.type !== 'CDI' && (
              <TextField
                type="date"
                label="Date de fin"
                name="date_fin"
                value={formData.date_fin}
                onChange={handleChange}
                fullWidth
                InputLabelProps={{ shrink: true }}
                helperText={formData.type === 'CDI' ? 'Optionnel pour période d\'essai' : 'Obligatoire pour CDD/Stage'}
              />
            )}

            <TextField
              type="number"
              label="Salaire (€)"
              name="salaire"
              value={formData.salaire}
              onChange={handleChange}
              fullWidth
              inputProps={{ step: "0.01", min: "0" }}
            />

            {mode === 'renew' && (
              <Typography variant="body2" color="text.secondary">
                Un nouveau contrat sera créé et l'ancien sera désactivé.
              </Typography>
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>Annuler</Button>
          <Button type="submit" variant="contained">
            {mode === 'renew' ? 'Renouveler' : 'Sauvegarder'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default ContractForm;