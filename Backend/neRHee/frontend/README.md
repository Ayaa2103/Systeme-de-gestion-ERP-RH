# Frontend React - ERP RH

## Fonctionnalités Implémentées

### Gestion des Employés
- ✅ Liste des employés avec actions fonctionnelles
- ✅ Bouton "Modifier" fonctionnel pour éditer les informations employé
- ✅ Bouton "Contrat" fonctionnel pour gérer les contrats

### Gestion des Contrats
- ✅ **Détails** : Affichage complet des informations du contrat
- ✅ **Modifier** : Modification des contrats existants
- ✅ **Renouveler** : Renouvellement des contrats qui vont expirer
- ✅ **Créer contrat** : Création de nouveaux contrats
- ✅ **Liste des contrats expirant bientôt** : Vue dédiée aux contrats à renouveler
- ✅ **Conversion CDI** : Conversion des CDI en période d'essai vers CDI définitif

### Améliorations
- ❌ **Département supprimé du menu** (comme demandé)
- ✅ Interface moderne avec Material-UI
- ✅ Gestion des erreurs et états de chargement
- ✅ Respect des APIs Django existantes

## Installation et Démarrage

### Prérequis
- Node.js (version 16 ou supérieure)
- Le serveur Django doit être démarré sur http://localhost:8000

### Démarrage Rapide
```bash
# Méthode 1: Script automatique
double-clic sur start.bat

# Méthode 2: Commandes manuelles
cd frontend
npm install
npm start
```

L'application sera accessible sur http://localhost:3000

## Structure du Projet

```
frontend/
├── src/
│   ├── components/
│   │   ├── EmployeeList.js          # Liste des employés
│   │   ├── EmployeeForm.js          # Formulaire modification employé
│   │   ├── ContractManagement.js    # Gestion complète des contrats
│   │   ├── ContractForm.js          # Formulaire contrat (créer/modifier/renouveler)
│   │   └── ContractDetails.js       # Détails d'un contrat
│   ├── services/
│   │   ├── api.js                   # Configuration Axios
│   │   └── employeeService.js       # Services API employés/contrats
│   ├── pages/
│   │   └── HRDashboard.js          # Page principale RH
│   ├── App.js                       # Composant principal
│   └── index.js                     # Point d'entrée
├── public/
│   └── index.html
├── package.json
└── README.md
```

## APIs Utilisées

### Employés
- `GET /api/v1/employees/` - Liste des employés
- `PUT /api/v1/employees/{id}/` - Modifier un employé
- `GET /api/v1/departments/` - Liste des départements

### Contrats
- `GET /api/v1/contracts/` - Liste des contrats
- `POST /api/v1/contracts/` - Créer un contrat
- `PUT /api/v1/contracts/{id}/` - Modifier un contrat
- `POST /api/v1/contracts/{id}/renew/` - Renouveler un contrat
- `POST /api/v1/contracts/{id}/convert_to_permanent/` - Convertir en CDI définitif
- `GET /api/v1/contracts/expiring/` - Contrats expirant bientôt

## Fonctionnalités Détaillées

### 1. Liste des Employés
- Affichage de tous les employés avec leurs informations
- Actions : Modifier et Contrats fonctionnelles
- Interface responsive avec Material-UI

### 2. Modification d'Employé
- Formulaire modal pour modifier les informations
- Champs : matricule, poste, service, département, date d'embauche, statut
- Validation et gestion d'erreurs

### 3. Gestion des Contrats
Interface complète avec onglets :

#### Onglet "Contrats de l'employé"
- Liste des contrats de l'employé sélectionné
- Actions par contrat :
  - **Voir** : Détails complets du contrat
  - **Modifier** : Édition des informations
  - **Renouveler** : Création d'un nouveau contrat basé sur l'ancien
  - **Confirmer CDI** : Pour les CDI en période d'essai
- Bouton "Créer Contrat" pour ajouter un nouveau contrat

#### Onglet "Contrats expirant bientôt"
- Vue globale des contrats expirant dans les 30 prochains jours
- Alertes visuelles avec badges colorés
- Actions de renouvellement rapide

### 4. Formulaires de Contrat
- **Création** : Nouveau contrat pour un employé
- **Modification** : Édition d'un contrat existant  
- **Renouvellement** : Nouveau contrat basé sur l'ancien (désactive l'ancien)
- Validation des dates et types de contrat
- Gestion spéciale pour les CDI (période d'essai optionnelle)

### 5. Détails de Contrat
- Affichage complet des informations
- Badges de statut (Actif/Inactif, Expire bientôt, Expiré)
- Information spéciale pour les CDI en période d'essai

## Corrections Apportées

1. ✅ **Boutons Modifier et Contrat fonctionnels** dans la liste des employés
2. ✅ **Ajout de toutes les fonctionnalités contrat** :
   - Détails complets
   - Modification
   - Renouvellement  
   - Création
   - Liste des contrats expirants
3. ✅ **Interface moderne et intuitive**
4. ✅ **Respect du backend Django existant**
5. ✅ **Gestion des erreurs et états de chargement**

## Notes Techniques

- Utilise les APIs REST Django existantes
- Authentification par token (à implémenter selon besoins)
- Interface responsive Material-UI
- Gestion d'état locale avec React hooks
- Validation côté client et serveur