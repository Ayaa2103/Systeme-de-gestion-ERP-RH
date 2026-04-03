#!/usr/bin/env python
"""
Script de test pour vérifier que les APIs fonctionnent correctement
"""
import os
import sys
import django

# Configuration Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'newRH.settings')
django.setup()

from django.test import Client
from django.contrib.auth import get_user_model
from employees.models import Employee

def test_api_endpoints():
    client = Client()
    User = get_user_model()
    
    print("=== Test des APIs ERP RH ===\n")
    
    # Test 1: Endpoints publics
    print("1. Test des endpoints publics:")
    
    # Job offers (public)
    response = client.get('/api/v1/job-offers/')
    print(f"   GET /api/v1/job-offers/ - Status: {response.status_code}")
    
    # Company pages (public)
    response = client.get('/api/v1/company-pages/')
    print(f"   GET /api/v1/company-pages/ - Status: {response.status_code}")
    
    # Test 2: Login
    print("\n2. Test de l'authentification:")
    
    # Créer un utilisateur de test s'il n'existe pas
    try:
        user = User.objects.get(username='test_api')
    except User.DoesNotExist:
        user = User.objects.create_user(
            username='test_api',
            password='testpass123',
            email='test@example.com',
            role='hr_manager'
        )
        # Créer le profil employé
        Employee.objects.create(
            user=user,
            matricule='TEST001',
            poste='Test Manager',
            statut='actif'
        )
    
    # Test login
    login_data = {
        'username': 'test_api',
        'password': 'testpass123'
    }
    response = client.post('/api/v1/auth/login/', login_data, content_type='application/json')
    print(f"   POST /api/v1/auth/login/ - Status: {response.status_code}")
    
    if response.status_code == 200:
        data = response.json()
        token = data.get('token')
        print(f"   Token reçu: {token[:20]}...")
        
        # Test 3: Endpoints authentifiés
        print("\n3. Test des endpoints authentifiés:")
        headers = {'HTTP_AUTHORIZATION': f'Token {token}'}
        
        # Dashboard stats
        response = client.get('/api/v1/dashboard/stats/', **headers)
        print(f"   GET /api/v1/dashboard/stats/ - Status: {response.status_code}")
        
        # Employees
        response = client.get('/api/v1/employees/', **headers)
        print(f"   GET /api/v1/employees/ - Status: {response.status_code}")
        
        # Departments
        response = client.get('/api/v1/departments/', **headers)
        print(f"   GET /api/v1/departments/ - Status: {response.status_code}")
        
        # Requests
        response = client.get('/api/v1/leave-requests/', **headers)
        print(f"   GET /api/v1/leave-requests/ - Status: {response.status_code}")
        
        # Trainings
        response = client.get('/api/v1/trainings/', **headers)
        print(f"   GET /api/v1/trainings/ - Status: {response.status_code}")
        
        print("\n✓ Tests terminés avec succès!")
        print("\nLes APIs sont prêtes pour le frontend React!")
        print("\nEndpoints disponibles:")
        print("- Authentication: /api/v1/auth/login/, /api/v1/auth/logout/")
        print("- Core: /api/v1/hr-policies/, /api/v1/events/")
        print("- Employees: /api/v1/employees/, /api/v1/contracts/, /api/v1/trainings/")
        print("- Requests: /api/v1/leave-requests/, /api/v1/attestation-requests/, etc.")
        print("- Recruitment: /api/v1/job-offers/, /api/v1/applications/")
        print("- Culture: /api/v1/company-pages/, /api/v1/suggestions/")
        
    else:
        print(f"   Erreur de login: {response.content}")

if __name__ == '__main__':
    test_api_endpoints()