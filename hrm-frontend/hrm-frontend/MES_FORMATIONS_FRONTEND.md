# Page Mes Formations - Frontend Employé

## Composant Créé

### Fichier: `src/pages/Employee/MyTrainings.js`

## Alignement avec le Backend

### API Backend: `/api/v1/employees/my-trainings/`
```python
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def my_trainings(request):
    """Mes formations approuvées (pour l'employé connecté)"""
    try:
        employee = request.user.employee_profile
    except Employee.DoesNotExist:
        return Response({'error': 'Employee profile not found'}, status=404)
    
    # Récupérer toutes les formations approuvées de l'employé connecté
    trainings = Training.objects.filter(
        employees=employee, 
        status='approved'
    ).select_related('created_by', 'approved_by').order_by('-start_date')
```

### Service Frontend
```javascript
export const getMyTrainings = () => {
  return api.get('/employees/my-trainings/');
};
```

## Fonctionnalités Implémentées

### 1. Affichage des Formations
- **Formations approuvées uniquement** : `status='approved'`
- **Tri par date** : Plus récentes en premier (`-start_date`)
- **Informations complètes** : Nom, description, dates, durée, organisateur

### 2. Statuts Dynamiques
```javascript
const getTrainingStatus = (training) => {
  const today = new Date();
  const startDate = new Date(training.start_date);
  const endDate = new Date(training.end_date);

  if (today < startDate) {
    return { label: 'À venir', color: 'info', icon: <Schedule /> };
  } else if (today >= startDate && today <= endDate) {
    return { label: 'En cours', color: 'warning', icon: <School /> };
  } else {
    return { label: 'Terminée', color: 'success', icon: <CheckCircle /> };
  }
};
```

### 3. Interface Utilisateur
- **Cards responsives** : Grid layout adaptatif
- **Hover effects** : Animation au survol
- **Icônes contextuelles** : Statut, calendrier, durée, organisateur
- **Formatage des dates** : Format français complet

## Données Affichées

### Informations Principales
- **Nom de la formation** : `training.name`
- **Description** : `training.description`
- **Statut dynamique** : À venir / En cours / Terminée

### Détails Temporels
- **Dates** : `start_date` → `end_date`
- **Durée** : `duration_days` (calculée automatiquement)
- **Date d'approbation** : `approved_at`

### Informations Organisationnelles
- **Organisée par** : `created_by_name`
- **Approuvée par** : `approved_by_name`

## Interface Utilisateur

### Layout Principal
```javascript
<Grid container spacing={3}>
  {trainings.map((training) => (
    <Grid item xs={12} md={6} lg={4} key={training.id}>
      <Card>
        {/* Contenu de la formation */}
      </Card>
    </Grid>
  ))}
</Grid>
```

### Card de Formation
```javascript
<Card>
  <CardContent>
    {/* En-tête avec nom et statut */}
    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
      <Typography variant="h6">{training.name}</Typography>
      <Chip icon={status.icon} label={status.label} color={status.color} />
    </Box>

    {/* Description */}
    <Typography variant="body2">{training.description}</Typography>

    {/* Détails avec icônes */}
    <Box>
      <CalendarToday /> Du {formatDate(start_date)} au {formatDate(end_date)}
      <Schedule /> Durée: {duration_days} jour(s)
      <Person /> Organisée par: {created_by_name}
    </Box>

    {/* Footer avec dates d'approbation */}
    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
      <Typography variant="caption">Approuvée le {formatDate(approved_at)}</Typography>
      <Typography variant="caption">Par: {approved_by_name}</Typography>
    </Box>
  </CardContent>
</Card>
```

### État Vide
```javascript
{trainings.length === 0 && (
  <Card>
    <CardContent sx={{ textAlign: 'center', py: 6 }}>
      <School sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
      <Typography variant="h6" color="text.secondary">
        Aucune formation assignée
      </Typography>
      <Typography variant="body2" color="text.secondary">
        Vous n'avez actuellement aucune formation approuvée.
      </Typography>
    </CardContent>
  </Card>
)}
```

## Routes et Navigation

### Route Ajoutée
```javascript
<Route
  path="/employee/trainings"
  element={
    <ProtectedRoute roles={['employee']}>
      <MainLayout>
        <MyTrainings />
      </MainLayout>
    </ProtectedRoute>
  }
/>
```

### Accès depuis le Menu
```javascript
// Dans Sidebar.js - Section Formations
{ title: 'Mes formations', icon: <SchoolIcon />, path: '/employee/trainings', roles: ['employee'] }
```

## Gestion des États

### Loading
```javascript
const [loading, setLoading] = useState(true);

if (loading) {
  return (
    <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
      <CircularProgress />
    </Box>
  );
}
```

### Erreur
```javascript
const [error, setError] = useState('');

{error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}
```

### Données
```javascript
const [trainings, setTrainings] = useState([]);

useEffect(() => {
  fetchTrainings();
}, []);

const fetchTrainings = async () => {
  try {
    const response = await getMyTrainings();
    setTrainings(response.data);
  } catch (error) {
    setError('Erreur lors du chargement des formations');
  } finally {
    setLoading(false);
  }
};
```

## Responsive Design

### Breakpoints
- **xs={12}** : Mobile (1 colonne)
- **md={6}** : Tablette (2 colonnes)
- **lg={4}** : Desktop (3 colonnes)

### Adaptations Mobile
- Cards pleine largeur
- Texte adaptatif
- Icônes optimisées

## Permissions et Sécurité

### Backend
- **Authentification requise** : `@permission_classes([IsAuthenticated])`
- **Profil employé requis** : `request.user.employee_profile`
- **Formations personnelles uniquement** : `employees=employee`

### Frontend
- **Route protégée** : `roles={['employee']}`
- **Menu conditionnel** : Visible pour les employés uniquement

## Cas d'Usage

### 1. Employé avec Formations
```
1. Employé se connecte
2. Va sur "Mes formations" depuis le menu
3. Voit ses formations approuvées
4. Peut voir le statut (à venir/en cours/terminée)
5. Consulte les détails (dates, durée, organisateur)
```

### 2. Employé sans Formation
```
1. Employé se connecte
2. Va sur "Mes formations"
3. Voit le message "Aucune formation assignée"
4. Interface claire et informative
```

### 3. Formation en Cours
```
1. Formation avec start_date <= aujourd'hui <= end_date
2. Statut "En cours" avec icône School et couleur warning
3. Mise en évidence visuelle
```

## Tests à Effectuer

### 1. Test avec Formations
- [ ] Créer des formations (RH)
- [ ] Assigner un employé aux formations
- [ ] Approuver les formations (Directeur RH)
- [ ] Se connecter en tant qu'employé
- [ ] Vérifier l'affichage dans "Mes formations"

### 2. Test États
- [ ] Formation à venir (start_date > aujourd'hui)
- [ ] Formation en cours (start_date <= aujourd'hui <= end_date)
- [ ] Formation terminée (end_date < aujourd'hui)

### 3. Test Responsive
- [ ] Affichage mobile (1 colonne)
- [ ] Affichage tablette (2 colonnes)
- [ ] Affichage desktop (3 colonnes)

### 4. Test Erreurs
- [ ] Employé sans profil
- [ ] Erreur réseau
- [ ] Aucune formation assignée

## Prochaines Améliorations

### 1. Détail de Formation
```javascript
// Page détaillée pour chaque formation
/employee/trainings/:id
```

### 2. Filtres et Recherche
```javascript
// Filtrer par statut, date, organisateur
const [filters, setFilters] = useState({
  status: 'all',
  search: ''
});
```

### 3. Notifications
```javascript
// Alertes pour formations à venir
// Rappels pour formations en cours
```

### 4. Évaluations
```javascript
// Système d'évaluation post-formation
// Feedback et notes
```

## Résultat Final

Les employés ont maintenant accès à une **page dédiée** pour consulter leurs formations approuvées avec :
- ✅ **Interface intuitive** avec statuts dynamiques
- ✅ **Informations complètes** sur chaque formation
- ✅ **Design responsive** adapté à tous les écrans
- ✅ **Alignement parfait** avec le backend existant