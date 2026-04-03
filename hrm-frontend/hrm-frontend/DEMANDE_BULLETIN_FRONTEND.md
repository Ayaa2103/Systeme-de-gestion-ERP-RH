# Formulaire de Demande de Bulletin de Paie - Frontend

## Composant Créé

### Fichier: `src/pages/Employee/CreatePayslipRequest.js`

## Alignement avec le Backend

### Modèle Backend: `PayslipRequest`
```python
class PayslipRequest(RequestBase):
    requester = models.ForeignKey(Employee, on_delete=models.CASCADE, related_name='payslip_requests')
    approver = models.ForeignKey(USER, null=True, blank=True, on_delete=models.SET_NULL, related_name='payslip_approved_requests')
    periode_mois = models.CharField(max_length=20)        # ✅ Implémenté
    comment = models.TextField(blank=True)                # ✅ Implémenté (hérité de RequestBase)
```

### Champs du Formulaire Frontend
```javascript
const [formData, setFormData] = useState({
  periode_mois: '',   // ✅ Correspond à periode_mois (CharField, max_length=20)
  comment: ''         // ✅ Correspond à comment (TextField hérité)
});
```

## Fonctionnalité Spéciale: Génération des Périodes

### Logique Frontend
```javascript
const generateMonthOptions = () => {
  const options = [];
  const currentDate = new Date();
  
  // Génère les 12 derniers mois
  for (let i = 0; i < 12; i++) {
    const date = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1);
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const monthName = date.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' });
    const value = `${month.toString().padStart(2, '0')}/${year}`;
    
    options.push({
      value: value,        // Format: "01/2024", "12/2023", etc.
      label: monthName     // Format: "Janvier 2024", "Décembre 2023", etc.
    });
  }
  
  return options;
};
```

### Exemples de Valeurs Générées
```javascript
// Si nous sommes en Janvier 2024, génère:
[
  { value: "01/2024", label: "Janvier 2024" },      // Mois actuel
  { value: "12/2023", label: "Décembre 2023" },     // Mois précédent
  { value: "11/2023", label: "Novembre 2023" },
  { value: "10/2023", label: "Octobre 2023" },
  // ... jusqu'à 12 mois en arrière
  { value: "02/2023", label: "Février 2023" }
]
```

## Validations Implémentées

### Frontend (JavaScript)
```javascript
// Champ obligatoire
if (!formData.periode_mois) {
  setError('La période est obligatoire');
  return;
}
```

### Contraintes Backend
- `periode_mois` : CharField avec max_length=20
- Format attendu : Compatible avec les valeurs générées ("MM/YYYY")

## API Endpoint

### URL: `POST /api/v1/requests/payslip/create/`

### Service Frontend
```javascript
export const createPayslipRequest = (data) => {
  return api.post('/requests/payslip/create/', data);
};
```

### Vue Backend: `create_payslip_request`
```python
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def create_payslip_request(request):
    try:
        employee = request.user.employee_profile
    except Employee.DoesNotExist:
        return Response({'error': 'Employee profile not found'}, status=404)
    
    data = request.data.copy()
    data['requester'] = employee.id
    
    serializer = PayslipRequestSerializer(data=data)
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data, status=201)
    return Response(serializer.errors, status=400)
```

## Routes Ajoutées

### App.js
```javascript
<Route
  path="/employee/requests/create-payslip"
  element={
    <ProtectedRoute roles={['employee']}>
      <MainLayout>
        <CreatePayslipRequest />
      </MainLayout>
    </ProtectedRoute>
  }
/>
```

## Interface Utilisateur

### Champs du Formulaire
1. **Période** (obligatoire)
   - Type: Select (dropdown)
   - Options: 12 derniers mois générés automatiquement
   - Format affiché: "Janvier 2024", "Décembre 2023", etc.
   - Valeur envoyée: "01/2024", "12/2023", etc.

2. **Commentaire** (optionnel)
   - Type: TextField multiline (4 lignes)
   - Placeholder: "Précisez la raison de votre demande si nécessaire..."

### Boutons
- **Soumettre la Demande** (primaire, avec icône Send)
- **Annuler** (secondaire, retour à la liste)

## Avantages de l'Implémentation

### 1. Génération Automatique des Périodes
- Pas besoin de saisie manuelle
- Format cohérent garanti
- Limite aux 12 derniers mois (logique métier)
- Mise à jour automatique chaque mois

### 2. Interface Utilisateur Intuitive
- Dropdown avec noms de mois en français
- Tri chronologique (plus récent en premier)
- Validation simple (sélection obligatoire)

### 3. Compatibilité Backend
- Format de données compatible
- Respect des contraintes de longueur
- Pas de validation complexe côté serveur nécessaire

## Données Envoyées à l'API

### Exemple de Payload
```json
{
  "periode_mois": "12/2023",
  "comment": "Bulletin nécessaire pour dossier bancaire"
}
```

### Réponse API (Succès)
```json
{
  "id": 15,
  "requester": 5,
  "requester_name": "John Doe",
  "requester_matricule": "EMP001",
  "periode_mois": "12/2023",
  "comment": "Bulletin nécessaire pour dossier bancaire",
  "status": "pending",
  "status_display": "En attente",
  "approver": null,
  "approver_name": null,
  "created_at": "2024-01-15T10:30:00Z"
}
```

## Affichage dans MyRequests.js

### Tableau des Bulletins de Paie
```javascript
// Dans MyRequests.js, section "Demandes de Bulletin de Paie"
<TableRow key={request.id}>
  <TableCell>{request.periode_mois}</TableCell>        // "12/2023"
  <TableCell>
    <Chip 
      label={getStatusLabel(request.status)} 
      color={getStatusColor(request.status)}
      size="small"
    />
  </TableCell>
  <TableCell>{new Date(request.created_at).toLocaleDateString('fr-FR')}</TableCell>
</TableRow>
```

## Affichage dans ManageRequests.js (RH)

### Carte de Demande de Bulletin
```javascript
// Dans ManageRequests.js, type === 'payslip'
{type === 'payslip' && (
  <Box sx={{ mb: 2 }}>
    <Typography variant="body2" color="text.secondary">
      <DescriptionIcon sx={{ fontSize: 16, mr: 1, verticalAlign: 'middle' }} />
      Période: {request.periode_mois}
    </Typography>
  </Box>
)}
```

## Tests à Effectuer

### 1. Test de Génération des Périodes
- [ ] 12 options générées
- [ ] Mois actuel en premier
- [ ] Format correct (MM/YYYY)
- [ ] Libellés en français

### 2. Test de Création
- [ ] Sélection de période obligatoire
- [ ] Commentaire optionnel
- [ ] Soumission réussie
- [ ] Message de succès
- [ ] Redirection vers liste

### 3. Test d'Affichage
- [ ] Demande dans "Mes Demandes"
- [ ] Période correctement affichée
- [ ] Statut "En attente"

### 4. Test RH
- [ ] Demande visible dans /manage-requests
- [ ] Onglet "Bulletins"
- [ ] Période et commentaire visibles
- [ ] Approbation/Rejet fonctionne

## Navigation

### Accès au Formulaire
```
http://localhost:3000/employee/requests
↓ Clic sur "Demande de Bulletin"
http://localhost:3000/employee/requests/create-payslip
```

### Retour
```
Bouton "Retour" ou "Annuler"
↓
http://localhost:3000/employee/requests
```

## Cas d'Usage Typiques

### 1. Dossier Bancaire
```
Période: "12/2023" (Décembre 2023)
Commentaire: "Bulletin nécessaire pour dossier de prêt immobilier"
```

### 2. Déclaration Fiscale
```
Période: "12/2023" (Décembre 2023)
Commentaire: "Dernier bulletin de l'année pour déclaration d'impôts"
```

### 3. Changement d'Emploi
```
Période: "01/2024" (Janvier 2024)
Commentaire: "Bulletin pour nouveau dossier employeur"
```

## Prochaines Étapes

1. ✅ Formulaire de demande de bulletin - **TERMINÉ**
2. ⏳ Tests complets des 4 types de demandes
3. ⏳ Amélioration de l'affichage des périodes dans MyRequests
4. ⏳ Validation côté RH des formats de période