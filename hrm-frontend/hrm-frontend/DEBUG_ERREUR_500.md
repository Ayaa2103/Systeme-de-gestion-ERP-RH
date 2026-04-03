# Debug Erreur 500 - Approbation/Rejet

## Problème
Erreur 500 "Request failed with status code 500" lors de l'approbation/rejet des attestations et bulletins.

## Diagnostics Ajoutés

### Frontend (Console Browser)
```javascript
=== DIRECT ACTION DEBUG ===
Full request object: {...}
Action type: approve/reject
Request type: attestation/payslip
Request ID: 5
Generated URL: /requests/attestation/5/approve/
Full API URL: http://localhost:8000/api/v1/requests/attestation/5/approve/
```

### Backend (Terminal Django)
```python
=== APPROVE REQUEST DEBUG ===
User: admin
User role: hr_manager
Request type: attestation
Request ID: 5
Request data: {'comment': ''}
Found request: Attestation: EMP001 - employment
Current status: pending
Comment: ''
Saving request with skip_validation=True
```

## Procédure de Test

### 1. Préparer l'Environnement
```bash
# Terminal 1: Démarrer Django avec logs
cd C:\Users\HP\neRHee
python manage.py runserver

# Terminal 2: Surveiller les logs
# Regarder la sortie du serveur Django
```

### 2. Tester Frontend
```bash
# Navigateur
1. Aller sur http://localhost:3000/manage-requests
2. Ouvrir F12 > Console
3. Cliquer sur "Approuver" pour une attestation
4. Observer les logs frontend ET backend
```

### 3. Analyser les Logs

#### Frontend - Logs Attendus
```javascript
=== DIRECT ACTION DEBUG ===
Full request object: {
  "id": 5,
  "type": "attestation",
  "requester_name": "John Doe",
  "requester_matricule": "EMP001",
  "purpose": "Demande de visa",
  "attestation_type": "employment",
  "status": "pending",
  "created_at": "2024-01-15T10:30:00Z"
}
Action type: approve
Request type: attestation
Request ID: 5
Request ID type: number
Generated URL: /requests/attestation/5/approve/
Full API URL will be: http://localhost:8000/api/v1/requests/attestation/5/approve/
Calling approveRequest with: {type: "attestation", id: 5, comment: ""}
```

#### Backend - Logs Attendus
```python
=== APPROVE REQUEST DEBUG ===
User: admin
User role: hr_manager
Request type: attestation
Request ID: 5
Request data: {'comment': ''}
Found request: Attestation: EMP001 - John Doe - employment
Current status: pending
Comment: ''
Saving request with skip_validation=True
Request saved successfully
Serialized data: {...}
```

## Causes Possibles de l'Erreur 500

### 1. Problème de Modèle (Duplication de Champs)
```python
# Dans models.py, il y a duplication:
class RequestBase(models.Model):
    requester = models.ForeignKey(Employee, ...)  # Champ de base
    approver = models.ForeignKey(USER, ...)       # Champ de base

class AttestationRequest(RequestBase):
    requester = models.ForeignKey(Employee, ...)  # ❌ DUPLICATION
    approver = models.ForeignKey(USER, ...)       # ❌ DUPLICATION
```

### 2. Problème de Permissions
```python
# Vérifier que l'utilisateur a le bon rôle
if request.user.role not in ['hr_manager', 'hr_director']:
    return Response({'error': 'Permission denied'}, status=403)
```

### 3. Problème de Validation
```python
# Le save() peut échouer même avec skip_validation=True
req.save(skip_validation=True)  # Peut encore lever une exception
```

### 4. Problème de Sérialisation
```python
# Le serializer peut échouer
serializer = serializer_class(req)
return Response(serializer.data)  # Peut lever une exception
```

## Solutions à Tester

### Solution 1: Corriger les Modèles
```python
# Supprimer les duplications dans models.py
class AttestationRequest(RequestBase):
    # ❌ Supprimer ces lignes:
    # requester = models.ForeignKey(Employee, ...)
    # approver = models.ForeignKey(USER, ...)
    
    # ✅ Garder seulement:
    purpose = models.CharField(max_length=255)
    attestation_type = models.CharField(max_length=100, default='employment')
```

### Solution 2: Gestion d'Erreur Robuste
```python
try:
    req.save()
except Exception as e:
    print(f"Save error: {e}")
    # Essayer sans skip_validation
    req.save()
```

### Solution 3: Vérification des Données
```python
# Vérifier que l'objet existe et est valide
if not hasattr(req, 'status'):
    return Response({'error': 'Invalid request object'}, status=400)
```

## Test Étape par Étape

### 1. Créer une Demande d'Attestation
```bash
# En tant qu'employé
1. http://localhost:3000/employee/requests/create-attestation
2. Remplir: Type=employment, Objectif=Test
3. Soumettre
4. Vérifier création dans la base
```

### 2. Vérifier la Demande (RH)
```bash
# En tant que RH
1. http://localhost:3000/manage-requests
2. Onglet "Attestations"
3. Vérifier que la demande apparaît
4. Noter l'ID de la demande
```

### 3. Tester l'Approbation
```bash
# Avec logs activés
1. Cliquer "Approuver"
2. Observer console frontend
3. Observer terminal Django backend
4. Identifier où l'erreur se produit
```

## Logs d'Erreur à Surveiller

### Frontend
```javascript
=== ERROR DEBUG ===
Full error object: Error: Request failed with status code 500
Error response: {data: {...}, status: 500, ...}
Error response data: {error: "Internal server error: ..."}
```

### Backend
```python
=== APPROVE REQUEST DEBUG ===
User: admin
Request type: attestation
Request ID: 5
Found request: Attestation: ...
Unexpected error: [ERROR MESSAGE]
Error type: <class 'django.db.utils.IntegrityError'>
Traceback (most recent call last):
  ...
```

## Actions Correctives

### Si Erreur de Modèle
```python
# Corriger models.py en supprimant les duplications
# Faire une migration
python manage.py makemigrations
python manage.py migrate
```

### Si Erreur de Permissions
```python
# Vérifier le rôle utilisateur
user = User.objects.get(username='admin')
print(f"User role: {user.role}")
# Doit être 'hr_manager' ou 'hr_director'
```

### Si Erreur de Base de Données
```sql
-- Vérifier la structure de la table
SELECT * FROM requests_app_attestationrequest WHERE id = 5;
-- Vérifier les contraintes
```

## Résultat Attendu

### Succès
```
Frontend: "Demande approuvée avec succès!"
Backend: "Request saved successfully"
Status: 200 OK
Demande disparaît de la liste
```

### Échec avec Diagnostic
```
Frontend: "Erreur: [message détaillé]"
Backend: Traceback complet de l'erreur
Identification de la cause exacte
```

## Prochaines Étapes

1. ✅ Logs détaillés ajoutés - **TERMINÉ**
2. ⏳ Tester et observer les logs
3. ⏳ Identifier la cause exacte de l'erreur 500
4. ⏳ Appliquer la correction appropriée
5. ⏳ Retirer les logs de debug