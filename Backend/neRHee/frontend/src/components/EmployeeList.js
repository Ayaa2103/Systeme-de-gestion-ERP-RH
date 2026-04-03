import React, { useState, useEffect } from 'react';
import {
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Paper, IconButton, Chip, Box, Typography, Button
} from '@mui/material';
import { Edit, Description, Visibility } from '@mui/icons-material';
import { employeeService } from '../services/employeeService';

const EmployeeList = ({ onEditEmployee, onViewContracts }) => {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadEmployees();
  }, []);

  const loadEmployees = async () => {
    try {
      const response = await employeeService.getEmployees();
      setEmployees(response.data);
    } catch (error) {
      console.error('Erreur lors du chargement des employés:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <Typography>Chargement...</Typography>;

  return (
    <Box>
      <Typography variant="h5" gutterBottom>
        Gestion des Employés
      </Typography>
      
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Matricule</TableCell>
              <TableCell>Nom</TableCell>
              <TableCell>Poste</TableCell>
              <TableCell>Service</TableCell>
              <TableCell>Département</TableCell>
              <TableCell>Date d'embauche</TableCell>
              <TableCell>Statut</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {employees.map((employee) => (
              <TableRow key={employee.id}>
                <TableCell>{employee.matricule}</TableCell>
                <TableCell>{employee.user_data?.full_name}</TableCell>
                <TableCell>{employee.poste || '-'}</TableCell>
                <TableCell>{employee.service || '-'}</TableCell>
                <TableCell>{employee.department_name || '-'}</TableCell>
                <TableCell>
                  {employee.date_embauche ? new Date(employee.date_embauche).toLocaleDateString('fr-FR') : '-'}
                </TableCell>
                <TableCell>
                  <Chip 
                    label={employee.statut} 
                    color={employee.statut === 'actif' ? 'success' : 'default'}
                    size="small"
                  />
                </TableCell>
                <TableCell>
                  <IconButton 
                    size="small" 
                    onClick={() => onEditEmployee(employee)}
                    title="Modifier"
                  >
                    <Edit />
                  </IconButton>
                  <IconButton 
                    size="small" 
                    onClick={() => onViewContracts(employee)}
                    title="Contrats"
                  >
                    <Description />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default EmployeeList;