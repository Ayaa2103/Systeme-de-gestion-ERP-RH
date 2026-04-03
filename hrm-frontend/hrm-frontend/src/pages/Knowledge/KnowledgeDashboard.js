import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Grid,
  Avatar,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Fab
} from '@mui/material';
import {
  Psychology as SkillIcon,
  Work as PositionIcon,
  Description as DocumentIcon,
  TrendingUp as TrendingUpIcon,
  People as PeopleIcon,
  Assessment as MatrixIcon,
  Add as AddIcon
} from '@mui/icons-material';
import { getKnowledgeStats, getSkills, getPositions, getDocuments, createSkill, createPosition } from '../../services/knowledgeService';
import { getDepartments } from '../../services/hrService';

const KnowledgeDashboard = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState({});
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openSkillDialog, setOpenSkillDialog] = useState(false);
  const [openPositionDialog, setOpenPositionDialog] = useState(false);
  const [newSkill, setNewSkill] = useState({ name: '', category: '', description: '' });
  const [newPosition, setNewPosition] = useState({ name: '', department: '', description: '' });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [statsRes, deptsRes] = await Promise.all([
        getKnowledgeStats().catch(() => ({})),
        getDepartments().catch(() => ({ data: [] }))
      ]);

      setStats(statsRes || {});
      setDepartments(Array.isArray(deptsRes.data) ? deptsRes.data : []);
    } catch (error) {
      console.error('Erreur:', error);
      setStats({
        total_skills: 25,
        total_positions: 12,
        total_documents: 8,
        total_employees_with_skills: 45,
        avg_skills_per_employee: 3.2
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateSkill = async () => {
    try {
      await createSkill(newSkill);
      setOpenSkillDialog(false);
      setNewSkill({ name: '', category: '', description: '' });
      fetchData();
    } catch (error) {
      console.error('Erreur création compétence:', error);
    }
  };

  const handleCreatePosition = async () => {
    try {
      await createPosition(newPosition);
      setOpenPositionDialog(false);
      setNewPosition({ name: '', department: '', description: '' });
      fetchData();
    } catch (error) {
      console.error('Erreur création poste:', error);
    }
  };

  const StatCard = ({ title, value, icon, color, onClick }) => (
    <Card
      elevation={0}
      sx={{
        border: '1px solid #e0e0e0',
        borderRadius: 2,
        cursor: onClick ? 'pointer' : 'default',
        transition: 'all 0.3s ease',
        '&:hover': onClick ? {
          boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
          transform: 'translateY(-2px)',
        } : {}
      }}
      onClick={onClick}
    >
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box>
            <Typography variant="h4" color={color} fontWeight="bold">
              {value}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {title}
            </Typography>
          </Box>
          <Avatar sx={{ backgroundColor: color, width: 56, height: 56 }}>
            {icon}
          </Avatar>
        </Box>
      </CardContent>
    </Card>
  );

  return (
    <Box>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" fontWeight="bold" gutterBottom>
          Gestion des Connaissances & Compétences
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Tableau de bord des compétences, polyvalence et documents
        </Typography>
      </Box>

      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={2.4}>
          <Box sx={{ position: 'relative' }}>
            <StatCard
              title="Compétences"
              value={stats.total_skills || 0}
              icon={<SkillIcon />}
              color="#1976d2"
              onClick={() => navigate('/knowledge/skills')}
            />
            <Fab
              size="small"
              color="primary"
              onClick={() => setOpenSkillDialog(true)}
              sx={{ position: 'absolute', top: 8, right: 8 }}
            >
              <AddIcon />
            </Fab>
          </Box>
        </Grid>
        <Grid item xs={12} sm={6} md={2.4}>
          <Box sx={{ position: 'relative' }}>
            <StatCard
              title="Postes"
              value={stats.total_positions || 0}
              icon={<PositionIcon />}
              color="#2e7d32"
              onClick={() => navigate('/knowledge/positions')}
            />
            <Fab
              size="small"
              color="secondary"
              onClick={() => setOpenPositionDialog(true)}
              sx={{ position: 'absolute', top: 8, right: 8 }}
            >
              <AddIcon />
            </Fab>
          </Box>
        </Grid>
        <Grid item xs={12} sm={6} md={2.4}>
          <StatCard
            title="Documents"
            value={stats.total_documents || 0}
            icon={<DocumentIcon />}
            color="#ed6c02"
            onClick={() => navigate('/knowledge/documents')}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={2.4}>
          <StatCard
            title="Employés Évalués"
            value={stats.total_employees_with_skills || 0}
            icon={<PeopleIcon />}
            color="#9c27b0"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={2.4}>
          <StatCard
            title="Moy. Compétences"
            value={Math.round((stats.avg_skills_per_employee || 0) * 10) / 10}
            icon={<TrendingUpIcon />}
            color="#d32f2f"
          />
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Card elevation={0} sx={{ border: '1px solid #e0e0e0', borderRadius: 2 }}>
            <CardContent>
              <Typography variant="h6" fontWeight="600" gutterBottom>
                Matrices de Compétences
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Visualisez et gérez les compétences par département
              </Typography>
              
              <Grid container spacing={1}>
                {departments.map((dept) => (
                  <Grid item xs={6} key={dept.id}>
                    <Button
                      fullWidth
                      variant="outlined"
                      startIcon={<MatrixIcon />}
                      onClick={() => navigate(`/knowledge/skills-matrix?department=${dept.id}`)}
                      sx={{ mb: 1 }}
                    >
                      {dept.name}
                    </Button>
                  </Grid>
                ))}
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card elevation={0} sx={{ border: '1px solid #e0e0e0', borderRadius: 2 }}>
            <CardContent>
              <Typography variant="h6" fontWeight="600" gutterBottom>
                Matrices de Polyvalence
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Gérez la polyvalence des employés sur différents postes
              </Typography>
              
              <Grid container spacing={1}>
                {departments.map((dept) => (
                  <Grid item xs={6} key={dept.id}>
                    <Button
                      fullWidth
                      variant="outlined"
                      startIcon={<PositionIcon />}
                      onClick={() => navigate(`/knowledge/versatility-matrix?department=${dept.id}`)}
                      sx={{ mb: 1 }}
                    >
                      {dept.name}
                    </Button>
                  </Grid>
                ))}
              </Grid>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Dialog Compétence */}
      <Dialog open={openSkillDialog} onClose={() => setOpenSkillDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Ajouter une Compétence</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Nom"
            fullWidth
            variant="outlined"
            value={newSkill.name}
            onChange={(e) => setNewSkill({ ...newSkill, name: e.target.value })}
            sx={{ mb: 2 }}
          />
          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel>Catégorie</InputLabel>
            <Select
              value={newSkill.category}
              label="Catégorie"
              onChange={(e) => setNewSkill({ ...newSkill, category: e.target.value })}
            >
              <MenuItem value="Technique">Technique</MenuItem>
              <MenuItem value="Management">Management</MenuItem>
              <MenuItem value="Communication">Communication</MenuItem>
              <MenuItem value="Qualité">Qualité</MenuItem>
              <MenuItem value="Sécurité">Sécurité</MenuItem>
              <MenuItem value="Linguistique">Linguistique</MenuItem>
              <MenuItem value="Informatique">Informatique</MenuItem>
            </Select>
          </FormControl>
          <TextField
            margin="dense"
            label="Description"
            fullWidth
            multiline
            rows={3}
            variant="outlined"
            value={newSkill.description}
            onChange={(e) => setNewSkill({ ...newSkill, description: e.target.value })}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenSkillDialog(false)}>Annuler</Button>
          <Button onClick={handleCreateSkill} variant="contained">Ajouter</Button>
        </DialogActions>
      </Dialog>

      {/* Dialog Poste */}
      <Dialog open={openPositionDialog} onClose={() => setOpenPositionDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Ajouter un Poste</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Nom du poste"
            fullWidth
            variant="outlined"
            value={newPosition.name}
            onChange={(e) => setNewPosition({ ...newPosition, name: e.target.value })}
            sx={{ mb: 2 }}
          />
          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel>Département</InputLabel>
            <Select
              value={newPosition.department}
              label="Département"
              onChange={(e) => setNewPosition({ ...newPosition, department: e.target.value })}
            >
              {departments.map((dept) => (
                <MenuItem key={dept.id} value={dept.id}>
                  {dept.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <TextField
            margin="dense"
            label="Description"
            fullWidth
            multiline
            rows={3}
            variant="outlined"
            value={newPosition.description}
            onChange={(e) => setNewPosition({ ...newPosition, description: e.target.value })}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenPositionDialog(false)}>Annuler</Button>
          <Button onClick={handleCreatePosition} variant="contained">Ajouter</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default KnowledgeDashboard;