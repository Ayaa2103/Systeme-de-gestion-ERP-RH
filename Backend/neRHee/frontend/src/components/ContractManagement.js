import React, { useState, useEffect } from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Paper, Button, Chip, Box, Typography, IconButton, Tabs, Tab
} from '@mui/material';
import { Edit, Refresh, Visibility, Add, Warning } from '@mui/icons-material';
import { employeeService } from '../services/employeeService';
import ContractForm from './ContractForm';
import ContractDetails from './ContractDetails';

const ContractManagement = ({ employee, open, onClose }) => {
  const [contracts, setContracts] = useState([]);
  const [expiringContracts, setExpiringContracts] = useState([]);
  const [selectedContract, setSelectedContract] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [formMode, setFormMode] = useState('create');
  const [tabValue, setTabValue] = useState(0);

  useEffect(() => {
    if (employee && open) {
      loadContracts();
      loadExpiringContracts();
    }
  }, [employee, open]);

  const loadContracts = async () => {
    try {
      const response = await employeeService.getContracts();
      const employeeContracts = response.data.filter(c => c.employee === employee.id);
      setContracts(employeeContracts);
    } catch (error) {
      console.error('Erreur lors du chargement des contrats:', error);
    }
  };

  const loadExpiringContracts = async () => {
    try {
      const response = await employeeService.getExpiringContracts();
      setExpiringContracts(response.data);
    } catch (error) {
      console.error('Erreur lors du chargement des contrats expirants:', error);
    }
  };

  const handleCreateContract = () => {
    setFormMode('create');
    setSelectedContract(null);
    setShowForm(true);
  };

  const handleEditContract = (contract) => {
    setFormMode('edit');
    setSelectedContract(contract);
    setShowForm(true);
  };

  const handleRenewContract = (contract) => {
    setFormMode('renew');
    setSelectedContract(contract);
    setShowForm(true);
  };

  const handleViewDetails = (contract) => {
    setSelectedContract(contract);
    setShowDetails(true);
  };

  const handleConvertToPermanent = async (contract) => {
    try {
      await employeeService.convertToPermanent(contract.id);
      loadContracts();
    } catch (error) {
      console.error('Erreur lors de la conversion:', error);
    }
  };

  const renderContractsTable = (contractsList, showEmployee = false) => (
    <TableContainer component={Paper}>
      <Table size="small">
        <TableHead>
          <TableRow>
            {showEmployee && <TableCell>Employé</TableCell>}
            <TableCell>Type</TableCell>
            <TableCell>Date début</TableCell>
            <TableCell>Date fin</TableCell>
            <TableCell>Salaire</TableCell>
            <TableCell>Statut</TableCell>
            <TableCell>Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {contractsList.map((contract) => (
            <TableRow key={contract.id}>
              {showEmployee && (
                <TableCell>{contract.employee_name}</TableCell>
              )}
              <TableCell>{contract.type_display}</TableCell>
              <TableCell>
                {new Date(contract.date_debut).toLocaleDateString('fr-FR')}
              </TableCell>
              <TableCell>
                {contract.date_fin ? new Date(contract.date_fin).toLocaleDateString('fr-FR') : 'Indéterminée'}
              </TableCell>
              <TableCell>
                {contract.salaire ? `${contract.salaire} €` : '-'}
              </TableCell>
              <TableCell>
                <Box display="flex" gap={1}>
                  <Chip 
                    label={contract.active ? 'Actif' : 'Inactif'} 
                    color={contract.active ? 'success' : 'default'}
                    size="small"
                  />
                  {contract.is_expiring_soon && (
                    <Chip 
                      label="Expire bientôt" 
                      color="warning"
                      size="small"
                      icon={<Warning />}
                    />
                  )}
                  {contract.is_expired && (
                    <Chip 
                      label="Expiré" 
                      color="error"
                      size="small"
                    />
                  )}
                </Box>
              </TableCell>
              <TableCell>
                <IconButton size="small" onClick={() => handleViewDetails(contract)}>
                  <Visibility />
                </IconButton>
                <IconButton size="small" onClick={() => handleEditContract(contract)}>
                  <Edit />
                </IconButton>
                {contract.active && (
                  <IconButton size="small" onClick={() => handleRenewContract(contract)}>
                    <Refresh />
                  </IconButton>
                )}
                {contract.type === 'CDI' && contract.date_fin && (
                  <Button 
                    size="small" 
                    onClick={() => handleConvertToPermanent(contract)}
                    variant="outlined"
                  >
                    Confirmer CDI
                  </Button>
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );

  return (
    <>
      <Dialog open={open} onClose={onClose} maxWidth="lg" fullWidth>
        <DialogTitle>
          Gestion des Contrats - {employee?.user_data?.full_name}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
            <Tabs value={tabValue} onChange={(e, newValue) => setTabValue(newValue)}>
              <Tab label="Contrats de l'employé" />
              <Tab label="Contrats expirant bientôt" />
            </Tabs>
          </Box>

          {tabValue === 0 && (
            <Box>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                <Typography variant="h6">Contrats</Typography>
                <Button 
                  variant="contained" 
                  startIcon={<Add />}
                  onClick={handleCreateContract}
                >
                  Créer Contrat
                </Button>
              </Box>
              {renderContractsTable(contracts)}
            </Box>
          )}

          {tabValue === 1 && (
            <Box>
              <Typography variant="h6" gutterBottom>
                Contrats expirant dans les 30 prochains jours
              </Typography>
              {renderContractsTable(expiringContracts, true)}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>Fermer</Button>
        </DialogActions>
      </Dialog>

      <ContractForm
        open={showForm}
        onClose={() => setShowForm(false)}
        contract={selectedContract}
        employee={employee}
        mode={formMode}
        onSuccess={() => {
          setShowForm(false);
          loadContracts();
          loadExpiringContracts();
        }}
      />

      <ContractDetails
        open={showDetails}
        onClose={() => setShowDetails(false)}
        contract={selectedContract}
      />
    </>
  );
};

export default ContractManagement;