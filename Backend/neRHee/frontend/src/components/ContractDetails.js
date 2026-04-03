import React from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  Button, Typography, Box, Chip, Divider
} from '@mui/material';

const ContractDetails = ({ open, onClose, contract }) => {
  if (!contract) return null;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Détails du Contrat</DialogTitle>
      <DialogContent>
        <Box display="flex" flexDirection="column" gap={2}>
          <Box>
            <Typography variant="subtitle2" color="text.secondary">
              Employé
            </Typography>
            <Typography variant="body1">
              {contract.employee_name} ({contract.employee_matricule})
            </Typography>
          </Box>

          <Divider />

          <Box>
            <Typography variant="subtitle2" color="text.secondary">
              Type de contrat
            </Typography>
            <Typography variant="body1">
              {contract.type_display}
            </Typography>
          </Box>

          <Box>
            <Typography variant="subtitle2" color="text.secondary">
              Période
            </Typography>
            <Typography variant="body1">
              Du {new Date(contract.date_debut).toLocaleDateString('fr-FR')}
              {contract.date_fin && (
                <> au {new Date(contract.date_fin).toLocaleDateString('fr-FR')}</>
              )}
              {!contract.date_fin && <> (Durée indéterminée)</>}
            </Typography>
          </Box>

          {contract.salaire && (
            <Box>
              <Typography variant="subtitle2" color="text.secondary">
                Salaire
              </Typography>
              <Typography variant="body1">
                {contract.salaire} €
              </Typography>
            </Box>
          )}

          <Box>
            <Typography variant="subtitle2" color="text.secondary">
              Statut
            </Typography>
            <Box display="flex" gap={1} mt={1}>
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
          </Box>

          {contract.type === 'CDI' && contract.date_fin && (
            <Box>
              <Typography variant="body2" color="info.main">
                ℹ️ Ce CDI est en période d'essai jusqu'au {new Date(contract.date_fin).toLocaleDateString('fr-FR')}
              </Typography>
            </Box>
          )}
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Fermer</Button>
      </DialogActions>
    </Dialog>
  );
};

export default ContractDetails;