# ERP RH Frontend - React Application

Application React moderne pour le système de gestion des ressources humaines.

## 🚀 Fonctionnalités

- **Design moderne** avec Material-UI
- **Thème bleu/noir/blanc** professionnel
- **Authentification** par token
- **Dashboard interactif** avec graphiques
- **Menu latéral** hiérarchique
- **Responsive design**
- **Gestion des rôles** utilisateur

## 📋 Prérequis

- Node.js 16+ 
- npm ou yarn
- Backend Django en cours d'exécution sur http://localhost:8000

## 🛠️ Installation

1. **Installer Node.js** (si pas déjà fait)
   ```bash
   # Télécharger depuis https://nodejs.org
   # Ou utiliser le script fourni
   py install_nodejs.py
   ```

2. **Installer les dépendances**
   ```bash
   cd hrm-frontend
   npm install
   ```

3. **Démarrer l'application**
   ```bash
   npm start
   ```

L'application sera accessible sur http://localhost:3000

## 🎨 Design

- **Couleurs principales** : Bleu (#1976d2), Noir (#212121), Blanc (#ffffff)
- **Police** : Inter (Google Fonts)
- **Composants** : Material-UI v5
- **Graphiques** : Recharts
- **Animations** : Transitions CSS et Material-UI

## 📱 Pages Créées

- ✅ **Login** - Page de connexion moderne avec animations
- ✅ **Dashboard** - Tableau de bord avec statistiques et graphiques
- ✅ **Layout** - Structure avec sidebar fixe et header

## 🔧 Structure

```
src/
├── components/
│   ├── Layout/
│   │   ├── Sidebar.js      # Menu latéral
│   │   └── MainLayout.js   # Layout principal
│   └── Common/
│       └── ProtectedRoute.js # Route protégée
├── contexts/
│   └── AuthContext.js      # Contexte d'authentification
├── pages/
│   ├── Login.js           # Page de connexion
│   └── Dashboard.js       # Tableau de bord
├── services/
│   ├── api.js            # Configuration Axios
│   └── auth.js           # Service d'authentification
├── styles/
│   └── theme.js          # Thème Material-UI
└── App.js                # Composant principal
```

## 🔐 Authentification

L'application utilise l'authentification par token JWT avec le backend Django :

- **Login** : POST /api/v1/auth/login/
- **Token** : Stocké dans localStorage
- **Intercepteurs** : Ajout automatique du token aux requêtes

## 👥 Gestion des Rôles

- **Employee** : Dashboard personnel, demandes
- **HR Manager** : Gestion employés, demandes, formations
- **HR Director** : Approbations, KPIs, politiques
- **Administrator** : Accès complet

## 🚀 Prochaines Étapes

1. Ajouter les pages de gestion des employés
2. Implémenter les formulaires de demandes
3. Créer les pages de recrutement
4. Ajouter les notifications en temps réel
5. Optimiser pour mobile

## 📞 Support

Pour toute question, contactez l'équipe de développement.