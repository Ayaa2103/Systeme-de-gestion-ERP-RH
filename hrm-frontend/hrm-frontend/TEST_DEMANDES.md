# Test des Demandes d'Attestation

## Correction Finale Appliquée

### URLs Backend (api_urls.py)
```python
path('requests/<str:request_type>/<int:request_id>/approve/', approve_request)
path('requests/<str:request_type>/<int:request_id>/reject/', reject_request)
```

### URLs Frontend (hrService.js) - CORRIGÉ
```javascript
// Format correct
/requests/${type}/${id}/approve/
/requests/${type}/${id}/reject/

// Exemple concret pour attestation ID 5
/requests/attestation/5/approve/
/requests/attestation/5/reject/
```

## URLs Complètes

### Approbation
```
Frontend envoie: POST http://localhost:8000/api/v1/requests/attestation/5/approve/
Backend attend:  POST /api/v1/requests/<str:request_type>/<int:request_id>/approve/
✅ MATCH
```

### Rejet
```
Frontend envoie: POST http://localhost:8000/api/v1/requests/attestation/5/reject/
Backend attend:  POST /api/v1/requests/<str:request_type>/<int:request_id>/reject/
✅ MATCH
```

## Procédure de Test

### 1. Créer une demande d'attestation (Employé)
```bash
# Se connecter en tant qu'employé
# Aller sur: http://localhost:3000/employee/requests/create-attestation

Données de test:
- Type: employment (Attestation de Travail)
- Objectif: Demande de visa
- Commentaire: Urgent
```

### 2. Vérifier la demande (RH)
```bash
# Se connecter en tant que hr_manager ou hr_director
# Aller sur: http://localhost:3000/manage-requests
# Onglet: Attestations

Vérifier:
- La demande apparaît dans la liste
- Statut: "En attente"
- Nom de l'employé visible
- Détails de la demande visibles
```

### 3. Approuver la demande
```bash
# Cliquer sur "Approuver"
# Ajouter un commentaire (optionnel): "Approuvé"
# Cliquer sur "Approuver" dans le dialog

Console devrait afficher:
- Processing request: {id: 5, type: "attestation", ...}
- Action type: approve
- Full URL: /requests/attestation/5/approve/
- Approve response: {data: {...}}
```

### 4. Vérifier le résultat
```bash
# La demande devrait disparaître de la liste "En attente"
# Retourner sur l'espace employé
# Aller sur: http://localhost:3000/employee/requests
# Vérifier que le statut est "Approuvée"
```

## Débogage

### Ouvrir la Console du Navigateur (F12)
```javascript
// Logs attendus lors de l'approbation:
Processing request: {id: 5, type: "attestation", requester_name: "...", ...}
Action type: approve
Request URL will be: /requests/approve/attestation/5/
Approving request: attestation/5
Full URL: /requests/attestation/5/approve/
Comment: "Approuvé"
Approve response: {data: {...}, status: 200}
```

### Vérifier l'onglet Network (F12 > Network)
```
Request URL: http://localhost:8000/api/v1/requests/attestation/5/approve/
Request Method: POST
Status Code: 200 OK
Request Headers:
  Authorization: Token xxxxx
  Content-Type: application/json
Request Payload:
  {comment: "Approuvé"}
Response:
  {id: 5, status: "approved", ...}
```

## Erreurs Possibles

### 1. Erreur 404 Not Found
```
Cause: URL incorrecte
Solution: Vérifier que le format est /requests/${type}/${id}/approve/
```

### 2. Erreur 403 Forbidden
```
Cause: Permissions insuffisantes
Solution: Se connecter avec un compte hr_manager ou hr_director
```

### 3. Erreur 401 Unauthorized
```
Cause: Token invalide ou expiré
Solution: Se reconnecter
```

### 4. Erreur 500 Internal Server Error
```
Cause: Erreur backend
Solution: Vérifier les logs Django
```

## Vérification Backend

### Logs Django
```bash
# Dans le terminal où Django tourne, vérifier:
POST /api/v1/requests/attestation/5/approve/ 200 OK
```

### Base de données
```sql
-- Vérifier que le statut a changé
SELECT id, status, approver_id FROM requests_app_attestationrequest WHERE id = 5;
-- Résultat attendu: status = 'approved', approver_id = <id_du_rh>
```

## Types de Demandes Supportés

| Type | Clé | URL Exemple |
|------|-----|-------------|
| Congés | leave | /requests/leave/5/approve/ |
| Attestations | attestation | /requests/attestation/5/approve/ |
| Missions | mission | /requests/mission/5/approve/ |
| Bulletins | payslip | /requests/payslip/5/approve/ |

## Checklist de Vérification

- [ ] Backend Django en cours d'exécution (port 8000)
- [ ] Frontend React en cours d'exécution (port 3000)
- [ ] Utilisateur RH connecté (hr_manager ou hr_director)
- [ ] Au moins une demande d'attestation en attente
- [ ] Console du navigateur ouverte (F12)
- [ ] Onglet Network ouvert pour voir les requêtes
- [ ] Bouton "Approuver" cliqué
- [ ] Dialog de confirmation affiché
- [ ] Requête POST envoyée avec succès (200 OK)
- [ ] Demande disparue de la liste "En attente"
- [ ] Statut mis à jour dans l'espace employé

## Résultat Attendu

✅ La demande d'attestation est approuvée
✅ Le statut passe de "pending" à "approved"
✅ L'approbateur est enregistré (request.user)
✅ Le commentaire est sauvegardé (si fourni)
✅ La demande disparaît de la liste des demandes en attente
✅ L'employé voit le statut "Approuvée" dans ses demandes
