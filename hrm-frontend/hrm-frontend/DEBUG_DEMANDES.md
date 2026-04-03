# Debug - Problème Boutons Approbation/Rejet

## Problème Identifié
Les boutons "Approuver" et "Rejeter" ne fonctionnent pas pour les demandes d'attestation et de bulletin de paie.

## Diagnostics Ajoutés

### 1. Logs Console Détaillés
```javascript
console.log('Processing request:', selectedRequest);
console.log('Action type:', actionType);
console.log('Request type:', selectedRequest.type);
console.log('Request ID:', selectedRequest.id);
console.log('Comment:', comment);
console.log('Correct URL format should be:', `/requests/${selectedRequest.type}/${selectedRequest.id}/${actionType}/`);
```

### 2. Alertes de Validation
```javascript
// Validation des données
if (!selectedRequest.type || !selectedRequest.id) {
  alert(`Données manquantes: type=${selectedRequest.type}, id=${selectedRequest.id}`);
  return;
}

// Messages de succès/erreur
alert('Demande approuvée avec succès!');
alert(`Erreur: ${errorMsg}`);
```

### 3. Vérifications Backend
```javascript
// URLs attendues par le backend
/api/v1/requests/attestation/5/approve/
/api/v1/requests/payslip/3/reject/
```

## Procédure de Test

### 1. Ouvrir la Console (F12)
```
1. Aller sur http://localhost:3000/manage-requests
2. Ouvrir F12 > Console
3. Cliquer sur un bouton "Approuver" ou "Rejeter"
4. Observer les logs
```

### 2. Vérifier les Données
```javascript
// Dans la console, vérifier:
Processing request: {
  id: 5,
  type: "attestation",  // ✅ Doit être présent
  requester_name: "...",
  // ... autres propriétés
}
```

### 3. Vérifier l'URL Générée
```javascript
// Doit afficher:
Correct URL format should be: /requests/attestation/5/approve/
Full URL: /requests/attestation/5/approve/
```

### 4. Vérifier la Réponse API
```javascript
// En cas de succès:
Approve response: {data: {...}, status: 200}

// En cas d'erreur:
Error status: 404 | 403 | 500
Error details: {...}
```

## Causes Possibles

### 1. Données Manquantes
```javascript
// Si selectedRequest.type est undefined
selectedRequest = {
  id: 5,
  type: undefined,  // ❌ PROBLÈME
  requester_name: "..."
}
```

### 2. URL Backend Incorrecte
```javascript
// Frontend envoie:
POST /api/v1/requests/attestation/5/approve/

// Backend attend peut-être:
POST /api/v1/requests/approve/attestation/5/
```

### 3. Permissions Insuffisantes
```javascript
// Erreur 403 Forbidden
// Vérifier que l'utilisateur est hr_manager ou hr_director
```

### 4. Token Expiré
```javascript
// Erreur 401 Unauthorized
// Se reconnecter
```

## Solutions Potentielles

### 1. Vérifier le Passage du Type
```javascript
// Dans openActionDialog, s'assurer que:
const openActionDialog = (request, action) => {
  const requestWithType = { ...request, type: tabLabels[tabValue].key };
  setSelectedRequest(requestWithType);
  setActionType(action);
  setDialogOpen(true);
};
```

### 2. Corriger les URLs si Nécessaire
```javascript
// Si le backend attend un format différent:
export const approveRequest = (type, id, comment = '') => {
  const url = `/requests/approve/${type}/${id}/`;  // Format alternatif
  return api.post(url, { comment });
};
```

### 3. Vérifier les Permissions
```javascript
// S'assurer que l'utilisateur connecté a le bon rôle
const user = JSON.parse(localStorage.getItem('user'));
console.log('User role:', user.role);
// Doit être 'hr_manager' ou 'hr_director'
```

## Test Complet

### 1. Créer une Demande d'Attestation (Employé)
```
1. Se connecter en tant qu'employé
2. Aller sur /employee/requests/create-attestation
3. Remplir et soumettre le formulaire
4. Vérifier que la demande est créée
```

### 2. Tester l'Approbation (RH)
```
1. Se connecter en tant que hr_manager
2. Aller sur /manage-requests
3. Onglet "Attestations"
4. Cliquer sur "Approuver"
5. Observer les logs dans la console
6. Vérifier les alertes
```

### 3. Vérifier le Résultat
```
1. L'alerte de succès doit s'afficher
2. La demande doit disparaître de la liste
3. Dans l'espace employé, le statut doit être "Approuvée"
```

## Logs Attendus (Succès)

### Console
```
Processing request: {id: 5, type: "attestation", requester_name: "John Doe", ...}
Action type: approve
Request type: attestation
Request ID: 5
Comment: 
Correct URL format should be: /requests/attestation/5/approve/
Approving request: attestation/5
Full URL: /requests/attestation/5/approve/
Comment: 
Approve response: {data: {...}, status: 200}
```

### Alertes
```
✅ "Demande approuvée avec succès!"
```

### Network (F12 > Network)
```
POST http://localhost:8000/api/v1/requests/attestation/5/approve/
Status: 200 OK
Response: {id: 5, status: "approved", ...}
```

## Logs d'Erreur Possibles

### 1. Données Manquantes
```
❌ "Données manquantes: type=undefined, id=5"
```

### 2. Erreur 404
```
❌ "Erreur: Not found"
Error status: 404
```

### 3. Erreur 403
```
❌ "Erreur: Permission denied"
Error status: 403
```

### 4. Erreur 500
```
❌ "Erreur: Internal server error"
Error status: 500
```

## Actions Correctives

### Si type=undefined
```javascript
// Vérifier dans openActionDialog:
onClick={() => openActionDialog({ ...request, type: tabLabels[tabValue].key }, 'approve')}
//                                          ^^^^ S'assurer que c'est bien passé
```

### Si URL incorrecte
```javascript
// Vérifier api_urls.py backend:
path('requests/<str:request_type>/<int:request_id>/approve/', approve_request)
//    ^^^^^^^^ ^^^^^^^^^^^^^^^^^ ^^^^^^^^^^^^^^^ ^^^^^^^^^
//    Doit correspondre exactement
```

### Si permissions
```javascript
// Vérifier le rôle utilisateur:
const user = JSON.parse(localStorage.getItem('user'));
if (!['hr_manager', 'hr_director'].includes(user.role)) {
  console.error('Permissions insuffisantes');
}
```

## Prochaines Étapes

1. ✅ Diagnostics ajoutés - **TERMINÉ**
2. ⏳ Tester avec les nouveaux logs
3. ⏳ Identifier la cause exacte
4. ⏳ Appliquer la correction appropriée
5. ⏳ Tester tous les types de demandes
6. ⏳ Retirer les alertes de debug