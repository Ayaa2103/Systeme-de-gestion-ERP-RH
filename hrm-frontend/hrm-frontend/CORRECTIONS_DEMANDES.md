# Corrections - Gestion des Demandes d'Attestation

## Problème Identifié
Les boutons d'approbation/rejet des demandes d'attestation ne fonctionnaient pas dans la page `/manage-requests`.

## Cause du Problème
Les URLs API dans le service frontend ne correspondaient pas au format attendu par le backend Django.

### URLs Incorrectes (Avant)
```javascript
// Frontend envoyait :
/requests/${type}/${id}/approve/
/requests/${type}/${id}/reject/

// Backend attendait :
/requests/approve/${type}/${id}/
/requests/reject/${type}/${id}/
```

## Corrections Appliquées

### 1. Service hrService.js
**Fichier**: `src/services/hrService.js`

**Changements**:
```javascript
// AVANT
export const approveRequest = (type, id, comment = '') => {
  return api.post(`/requests/${type}/${id}/approve/`, { comment });
};

export const rejectRequest = (type, id, comment = '') => {
  return api.post(`/requests/${type}/${id}/reject/`, { comment });
};

// APRÈS
export const approveRequest = (type, id, comment = '') => {
  return api.post(`/requests/approve/${type}/${id}/`, { comment });
};

export const rejectRequest = (type, id, comment = '') => {
  return api.post(`/requests/reject/${type}/${id}/`, { comment });
};
```

## Architecture Backend (Référence)

### URLs API Backend
**Fichier**: `api_urls.py`
```python
path('requests/pending/', pending_requests, name='pending_requests'),
path('requests/my/', my_requests, name='my_requests'),
path('requests/<str:request_type>/<int:request_id>/approve/', approve_request, name='approve_request'),
path('requests/<str:request_type>/<int:request_id>/reject/', reject_request, name='reject_request'),
```

### Vues API Backend
**Fichier**: `requests_app/api_views.py`

Les vues API gèrent :
- ✅ Récupération des demandes en attente (RH uniquement)
- ✅ Approbation des demandes avec commentaire optionnel
- ✅ Rejet des demandes avec commentaire optionnel
- ✅ Validation des permissions (hr_manager, hr_director)
- ✅ Support de tous les types de demandes (leave, attestation, mission, payslip)

### Serializers
**Fichier**: `requests_app/serializers.py`

Chaque type de demande a son serializer avec :
- Nom complet du demandeur
- Matricule du demandeur
- Nom de l'approbateur
- Statut avec libellé
- Toutes les informations spécifiques au type

## Fonctionnement Après Correction

### 1. Récupération des Demandes
```javascript
// Frontend appelle
GET /api/requests/pending/

// Backend retourne
{
  "leave_requests": [...],
  "attestation_requests": [...],
  "mission_requests": [...],
  "payslip_requests": [...]
}
```

### 2. Approbation d'une Demande
```javascript
// Frontend appelle
POST /api/requests/approve/attestation/5/
Body: { "comment": "Approuvé" }

// Backend met à jour
- status = 'approved'
- approver = request.user
- comment = "Approuvé" (si fourni)
```

### 3. Rejet d'une Demande
```javascript
// Frontend appelle
POST /api/requests/reject/attestation/5/
Body: { "comment": "Refusé" }

// Backend met à jour
- status = 'rejected'
- approver = request.user
- comment = "Refusé" (si fourni)
```

## Tests à Effectuer

### 1. Test d'Approbation
1. Se connecter en tant que RH (hr_manager ou hr_director)
2. Aller sur `/manage-requests`
3. Cliquer sur "Approuver" pour une demande d'attestation
4. Ajouter un commentaire (optionnel)
5. Confirmer l'approbation
6. Vérifier que la demande disparaît de la liste des demandes en attente

### 2. Test de Rejet
1. Se connecter en tant que RH
2. Aller sur `/manage-requests`
3. Cliquer sur "Rejeter" pour une demande d'attestation
4. Ajouter un commentaire (optionnel)
5. Confirmer le rejet
6. Vérifier que la demande disparaît de la liste des demandes en attente

### 3. Test Employé
1. Se connecter en tant qu'employé
2. Créer une demande d'attestation
3. Vérifier qu'elle apparaît dans "Mes Demandes" avec statut "En attente"
4. Se connecter en tant que RH
5. Approuver/Rejeter la demande
6. Se reconnecter en tant qu'employé
7. Vérifier que le statut est mis à jour dans "Mes Demandes"

## Types de Demandes Supportés

| Type | Clé API | Modèle Backend |
|------|---------|----------------|
| Congés | `leave` | LeaveRequest |
| Attestations | `attestation` | AttestationRequest |
| Missions | `mission` | MissionOrderRequest |
| Bulletins | `payslip` | PayslipRequest |

## Permissions

### Backend
- **Approbation/Rejet** : `hr_manager` ou `hr_director`
- **Création** : Tous les employés
- **Consultation** : Propriétaire de la demande ou RH

### Frontend
- **Page `/manage-requests`** : Protégée par rôles `['hr_manager', 'hr_director']`
- **Page `/employee/requests`** : Protégée par rôle `['employee']`

## Statuts des Demandes

| Statut | Valeur | Libellé |
|--------|--------|---------|
| En attente | `pending` | En attente |
| Approuvé | `approved` | Approuvé |
| Rejeté | `rejected` | Rejeté |

## Prochaines Étapes

1. ✅ Correction des URLs API - **TERMINÉ**
2. ⏳ Tester l'approbation/rejet des demandes
3. ⏳ Vérifier la mise à jour en temps réel
4. ⏳ Ajouter des notifications de succès/erreur
5. ⏳ Implémenter les demandes de mission et bulletin de paie (frontend)
