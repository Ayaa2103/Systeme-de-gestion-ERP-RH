# Formulaire de Demande de Mission - Frontend

## Composant Créé

### Fichier: `src/pages/Employee/CreateMissionRequest.js`

## Alignement avec le Backend

### Modèle Backend: `MissionOrderRequest`
```python
class MissionOrderRequest(RequestBase):
    requester = models.ForeignKey(Employee, on_delete=models.CASCADE, related_name='mission_requests')
    approver = models.ForeignKey(USER, null=True, blank=True, on_delete=models.SET_NULL, related_name='mission_approved_requests')
    destination = models.CharField(max_length=255)        # ✅ Implémenté
    start_date = models.DateField()                       # ✅ Implémenté
    end_date = models.DateField()                         # ✅ Implémenté
    reason = models.TextField(blank=True)                 # ✅ Implémenté
    comment = models.TextField(blank=True)                # ✅ Implémenté (hérité de RequestBase)
```

### Champs du Formulaire Frontend
```javascript
const [formData, setFormData] = useState({
  destination: '',    // ✅ Correspond à destination (CharField)
  start_date: '',     // ✅ Correspond à start_date (DateField)
  end_date: '',       // ✅ Correspond à end_date (DateField)
  reason: '',         // ✅ Correspond à reason (TextField)
  comment: ''         // ✅ Correspond à comment (TextField hérité)
});
```

## Validations Implémentées

### Frontend (JavaScript)
```javascript
// 1. Champs obligatoires
if (!formData.destination || !formData.start_date || !formData.end_date) {
  setError('La destination et les dates sont obligatoires');
  return;
}

// 2. Date de fin > Date de début
if (new Date(formData.end_date) <= new Date(formData.start_date)) {
  setError('La date de fin doit être postérieure à la date de début');
  return;
}

// 3. Date de début >= Aujourd'hui
if (new Date(formData.start_date) < new Date().setHours(0,0,0,0)) {
  setError('La date de début ne peut pas être dans le passé');
  return;
}
```

### Backend (Python) - Correspondance
```python
def clean(self):
    # Même validation côté backend
    if self.end_date <= self.start_date:
        raise ValidationError('La date de fin doit être postérieure à la date de début')
    if self.pk is None and self.start_date < date.today():
        raise ValidationError('La date de début ne peut pas être dans le passé')
```

## API Endpoint

### URL: `POST /api/v1/requests/mission/create/`

### Service Frontend
```javascript
export const createMissionRequest = (data) => {
  return api.post('/requests/mission/create/', data);
};
```

### Vue Backend: `create_mission_request`
```python
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def create_mission_request(request):
    try:
        employee = request.user.employee_profile
    except Employee.DoesNotExist:
        return Response({'error': 'Employee profile not found'}, status=404)
    
    data = request.data.copy()
    data['requester'] = employee.id
    
    serializer = MissionOrderRequestSerializer(data=data)
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data, status=201)
    return Response(serializer.errors, status=400)
```

## Routes Ajoutées

### App.js
```javascript
<Route
  path="/employee/requests/create-mission"
  element={
    <ProtectedRoute roles={['employee']}>
      <MainLayout>
        <CreateMissionRequest />
      </MainLayout>
    </ProtectedRoute>
  }
/>
```

## Navigation

### Depuis: `http://localhost:3000/employee/requests`
- Bouton "Demande de Mission" → `/employee/requests/create-mission`

### Retour: Bouton "Retour" → `/employee/requests`

## Interface Utilisateur

### Champs du Formulaire
1. **Destination** (obligatoire)
   - Type: TextField
   - Placeholder: "Ex: Paris, Casablanca, Tunis..."

2. **Date de Début** (obligatoire)
   - Type: date
   - Validation: >= aujourd'hui

3. **Date de Fin** (obligatoire)
   - Type: date
   - Validation: > date de début

4. **Motif de la Mission** (optionnel)
   - Type: TextField multiline (4 lignes)
   - Placeholder: "Décrivez l'objectif et la nature de votre mission..."

5. **Commentaire** (optionnel)
   - Type: TextField multiline (3 lignes)
   - Placeholder: "Informations supplémentaires..."

### Boutons
- **Soumettre la Demande** (primaire, avec icône Send)
- **Annuler** (secondaire, retour à la liste)

## Gestion des États

### Loading
```javascript
const [loading, setLoading] = useState(false);
// Bouton désactivé pendant la soumission
disabled={loading}
{loading ? 'Soumission...' : 'Soumettre la Demande'}
```

### Messages
```javascript
const [error, setError] = useState('');     // Messages d'erreur
const [success, setSuccess] = useState(''); // Message de succès
```

### Redirection
```javascript
// Après succès, redirection automatique vers la liste des demandes
setTimeout(() => {
  navigate('/employee/requests');
}, 2000);
```

## Flux Complet

### 1. Employé Crée une Demande
```
1. Va sur /employee/requests
2. Clique sur "Demande de Mission"
3. Remplit le formulaire
4. Clique sur "Soumettre la Demande"
5. Voit le message de succès
6. Est redirigé vers /employee/requests
7. Voit sa demande avec statut "En attente"
```

### 2. RH Traite la Demande
```
1. Va sur /manage-requests
2. Onglet "Missions"
3. Voit la demande avec tous les détails
4. Clique sur "Approuver" ou "Rejeter"
5. Ajoute un commentaire (optionnel)
6. Confirme l'action
```

### 3. Employé Voit le Résultat
```
1. Retourne sur /employee/requests
2. Voit le statut mis à jour ("Approuvée" ou "Rejetée")
3. Peut voir les détails et commentaires RH
```

## Données Envoyées à l'API

### Exemple de Payload
```json
{
  "destination": "Paris",
  "start_date": "2024-02-15",
  "end_date": "2024-02-20",
  "reason": "Formation technique sur les nouvelles technologies",
  "comment": "Hébergement à prévoir"
}
```

### Réponse API (Succès)
```json
{
  "id": 12,
  "requester": 5,
  "requester_name": "John Doe",
  "requester_matricule": "EMP001",
  "destination": "Paris",
  "start_date": "2024-02-15",
  "end_date": "2024-02-20",
  "reason": "Formation technique sur les nouvelles technologies",
  "comment": "Hébergement à prévoir",
  "status": "pending",
  "status_display": "En attente",
  "approver": null,
  "approver_name": null,
  "created_at": "2024-01-15T10:30:00Z"
}
```

## Tests à Effectuer

### 1. Test de Création
- [ ] Formulaire s'affiche correctement
- [ ] Validations fonctionnent (champs obligatoires, dates)
- [ ] Soumission réussie
- [ ] Message de succès affiché
- [ ] Redirection vers la liste des demandes

### 2. Test d'Affichage
- [ ] Demande apparaît dans "Mes Demandes"
- [ ] Toutes les informations sont correctes
- [ ] Statut "En attente" affiché

### 3. Test RH
- [ ] Demande visible dans /manage-requests
- [ ] Tous les détails affichés correctement
- [ ] Approbation/Rejet fonctionne

## Prochaines Étapes

1. ✅ Formulaire de demande de mission - **TERMINÉ**
2. ⏳ Formulaire de demande de bulletin de paie
3. ⏳ Tests complets de bout en bout
4. ⏳ Amélioration de l'affichage des demandes dans MyRequests.js