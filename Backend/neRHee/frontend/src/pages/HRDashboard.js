import React, { useState } from 'react';
import { Box, Container, Typography, Paper } from '@mui/material';
import EmployeeList from '../components/EmployeeList';
import EmployeeForm from '../components/EmployeeForm';
import ContractManagement from '../components/ContractManagement';

const HRDashboard = () => {
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [showEmployeeForm, setShowEmployeeForm] = useState(false);
  const [showContractManagement, setShowContractManagement] = useState(false);

  const handleEditEmployee = (employee) => {
    setSelectedEmployee(employee);
    setShowEmployeeForm(true);
  };

  const handleViewContracts = (employee) => {
    setSelectedEmployee(employee);
    setShowContractManagement(true);
  };

  const handleEmployeeFormClose = () => {
    setShowEmployeeForm(false);
    setSelectedEmployee(null);
  };

  const handleContractManagementClose = () => {
    setShowContractManagement(false);
    setSelectedEmployee(null);
  };

  return (
    <Container maxWidth="xl">
      <Box py={3}>
        <Typography variant="h4" gutterBottom>
          Espace RH - Gestion des Employés
        </Typography>
        
        <Paper sx={{ p: 3 }}>
          <EmployeeList 
            onEditEmployee={handleEditEmployee}
            onViewContracts={handleViewContracts}
          />
        </Paper>

        <EmployeeForm
          open={showEmployeeForm}
          onClose={handleEmployeeFormClose}
          employee={selectedEmployee}
          onSuccess={() => {
            handleEmployeeFormClose();
            window.location.reload(); // Recharger la liste
          }}
        />

        <ContractManagement
          open={showContractManagement}
          onClose={handleContractManagementClose}
          employee={selectedEmployee}
        />
      </Box>
    </Container>
  );
};

export default HRDashboard;