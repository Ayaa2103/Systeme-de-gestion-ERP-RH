#!/usr/bin/env python
import os
import sys
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'newRH.settings')
django.setup()

from django.test import Client
from core.models import User

def test_login():
    print("=== Test API de connexion ===\n")
    
    # Afficher les utilisateurs RH
    hr_users = User.objects.filter(role__in=['hr_manager', 'hr_director'])
    print("Utilisateurs RH disponibles:")
    for user in hr_users:
        print(f"- {user.username} ({user.role})")
    
    print("\n" + "="*40)
    
    # Test de l'API de login
    client = Client()
    
    username = input("Entrez le username à tester: ")
    password = input("Entrez le mot de passe: ")
    
    response = client.post('/api/v1/auth/login/', {
        'username': username,
        'password': password
    }, content_type='application/json')
    
    print(f"\nStatut de la réponse: {response.status_code}")
    
    if response.status_code == 200:
        print("✅ Connexion réussie!")
        data = response.json()
        print(f"Token: {data.get('token', 'N/A')[:20]}...")
        print(f"Utilisateur: {data.get('user', {}).get('username')}")
        print(f"Rôle: {data.get('user', {}).get('role')}")
    else:
        print("❌ Échec de la connexion")
        print(f"Erreur: {response.content}")

if __name__ == "__main__":
    test_login()