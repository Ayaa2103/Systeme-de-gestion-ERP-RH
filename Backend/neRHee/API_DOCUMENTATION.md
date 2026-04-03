# API Documentation pour Frontend React

## Base URL
```
http://localhost:8000/api/v1/
```

## Authentication

### Login
```
POST /api/v1/auth/login/
Content-Type: application/json

{
  "username": "string",
  "password": "string"
}

Response:
{
  "token": "string",
  "user": {
    "id": number,
    "username": "string",
    "email": "string",
    "first_name": "string",
    "last_name": "string",
    "role": "employee|hr_manager|hr_director|administrator"
  },
  "employee": {
    "id": number,
    "matricule": "string",
    "poste": "string",
    "service": "string",
    "department": "string"
  }
}
```

### Logout
```
POST /api/v1/auth/logout/
Authorization: Token <token>
```

## Core APIs

### Dashboard Stats
```
GET /api/v1/dashboard/stats/
Authorization: Token <token>
```

### KPI Dashboard (HR Director only)
```
GET /api/v1/kpi/dashboard/
Authorization: Token <token>
```

### HR Policies
```
GET /api/v1/hr-policies/
POST /api/v1/hr-policies/
GET /api/v1/hr-policies/{id}/
PUT /api/v1/hr-policies/{id}/
DELETE /api/v1/hr-policies/{id}/
```

### Events
```
GET /api/v1/events/
POST /api/v1/events/
GET /api/v1/events/{id}/
PUT /api/v1/events/{id}/
DELETE /api/v1/events/{id}/
POST /api/v1/events/{id}/approve/
POST /api/v1/events/{id}/reject/
```

## Employee Management APIs

### Departments
```
GET /api/v1/departments/
POST /api/v1/departments/
GET /api/v1/departments/{id}/
PUT /api/v1/departments/{id}/
DELETE /api/v1/departments/{id}/
```

### Employees
```
GET /api/v1/employees/
POST /api/v1/employees/
GET /api/v1/employees/{id}/
PUT /api/v1/employees/{id}/
DELETE /api/v1/employees/{id}/
GET /api/v1/employees/{id}/contracts/
GET /api/v1/employees/{id}/trainings/
```

### Contracts
```
GET /api/v1/contracts/
POST /api/v1/contracts/
GET /api/v1/contracts/{id}/
PUT /api/v1/contracts/{id}/
DELETE /api/v1/contracts/{id}/
GET /api/v1/contracts/expiring/
```

### Trainings
```
GET /api/v1/trainings/
POST /api/v1/trainings/
GET /api/v1/trainings/{id}/
PUT /api/v1/trainings/{id}/
DELETE /api/v1/trainings/{id}/
POST /api/v1/trainings/{id}/approve/
POST /api/v1/trainings/{id}/reject/
```

## Request Management APIs

### Leave Requests
```
GET /api/v1/leave-requests/
POST /api/v1/leave-requests/
GET /api/v1/leave-requests/{id}/
PUT /api/v1/leave-requests/{id}/
DELETE /api/v1/leave-requests/{id}/
POST /api/v1/leave-requests/{id}/approve/
POST /api/v1/leave-requests/{id}/reject/
```

### Attestation Requests
```
GET /api/v1/attestation-requests/
POST /api/v1/attestation-requests/
GET /api/v1/attestation-requests/{id}/
PUT /api/v1/attestation-requests/{id}/
DELETE /api/v1/attestation-requests/{id}/
POST /api/v1/attestation-requests/{id}/approve/
POST /api/v1/attestation-requests/{id}/reject/
```

### Mission Requests
```
GET /api/v1/mission-requests/
POST /api/v1/mission-requests/
GET /api/v1/mission-requests/{id}/
PUT /api/v1/mission-requests/{id}/
DELETE /api/v1/mission-requests/{id}/
POST /api/v1/mission-requests/{id}/approve/
POST /api/v1/mission-requests/{id}/reject/
```

### Payslip Requests
```
GET /api/v1/payslip-requests/
POST /api/v1/payslip-requests/
GET /api/v1/payslip-requests/{id}/
PUT /api/v1/payslip-requests/{id}/
DELETE /api/v1/payslip-requests/{id}/
POST /api/v1/payslip-requests/{id}/approve/
POST /api/v1/payslip-requests/{id}/reject/
```

## Recruitment APIs

### Job Offers
```
GET /api/v1/job-offers/
POST /api/v1/job-offers/
GET /api/v1/job-offers/{id}/
PUT /api/v1/job-offers/{id}/
DELETE /api/v1/job-offers/{id}/
POST /api/v1/job-offers/{id}/publish/
POST /api/v1/job-offers/{id}/close/
```

### Applications
```
GET /api/v1/applications/
POST /api/v1/applications/
GET /api/v1/applications/{id}/
PUT /api/v1/applications/{id}/
DELETE /api/v1/applications/{id}/
POST /api/v1/applications/{id}/update_status/
```

### Interviews
```
GET /api/v1/interviews/
POST /api/v1/interviews/
GET /api/v1/interviews/{id}/
PUT /api/v1/interviews/{id}/
DELETE /api/v1/interviews/{id}/
POST /api/v1/interviews/{id}/complete/
```

### Profile Recommendations
```
GET /api/v1/profile-recommendations/
POST /api/v1/profile-recommendations/
GET /api/v1/profile-recommendations/{id}/
PUT /api/v1/profile-recommendations/{id}/
DELETE /api/v1/profile-recommendations/{id}/
POST /api/v1/profile-recommendations/{id}/update_status/
```

## Company Culture APIs

### Company Pages
```
GET /api/v1/company-pages/
POST /api/v1/company-pages/
GET /api/v1/company-pages/{id}/
PUT /api/v1/company-pages/{id}/
DELETE /api/v1/company-pages/{id}/
```

### Employee Suggestions
```
GET /api/v1/suggestions/
POST /api/v1/suggestions/
GET /api/v1/suggestions/{id}/
PUT /api/v1/suggestions/{id}/
DELETE /api/v1/suggestions/{id}/
POST /api/v1/suggestions/{id}/respond/
```

## Headers Required

Pour toutes les requêtes authentifiées :
```
Authorization: Token <your-token>
Content-Type: application/json
```

## Permissions par Rôle

### Employee
- Lecture : Propres données, offres d'emploi publiques, pages culture
- Écriture : Propres demandes, suggestions, candidatures

### HR Manager
- Lecture : Tous les employés, demandes, formations
- Écriture : Gestion employés, contrats, formations, traitement demandes

### HR Director
- Lecture : Toutes les données, KPIs
- Écriture : Approbation formations/événements, politiques RH

### Administrator
- Lecture/Écriture : Accès complet à toutes les fonctionnalités

## Codes de Statut

- 200: Succès
- 201: Créé avec succès
- 400: Erreur de validation
- 401: Non authentifié
- 403: Permission refusée
- 404: Non trouvé
- 500: Erreur serveur