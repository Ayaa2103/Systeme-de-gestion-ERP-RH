#!/usr/bin/env python
import os
import sys
import django
import requests
import json

# Configuration Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'newRH.settings')
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
django.setup()

from django.contrib.auth import get_user_model
from rest_framework.authtoken.models import Token

User = get_user_model()

def test_culture_api():
    print("Test de l'API Culture d'entreprise...")
    
    # Créer ou récupérer un token pour un utilisateur
    try:
        user = User.objects.filter(is_staff=True).first()
        if not user:
            user = User.objects.first()
        
        if not user:
            print("Aucun utilisateur trouvé")
            return
            
        token, created = Token.objects.get_or_create(user=user)
        print(f"Token pour {user.username}: {token.key}")
        
        # Test GET pages
        print("\n1. Test GET /api/v1/company-pages/")
        response = requests.get('http://localhost:8000/api/v1/company-pages/')
        print(f"Status: {response.status_code}")
        if response.status_code == 200:
            data = response.json()
            print(f"Nombre de pages: {data.get('count', len(data))}")
            if 'results' in data:
                for page in data['results']:
                    print(f"  - {page['page_type']}: {page['title']}")
        
        # Test PUT mise à jour
        print("\n2. Test PUT mise à jour d'une page")
        headers = {
            'Authorization': f'Token {token.key}',
            'Content-Type': 'application/json'
        }
        
        # Récupérer la première page
        response = requests.get('http://localhost:8000/api/v1/company-pages/')
        if response.status_code == 200:
            data = response.json()
            pages = data.get('results', data)
            if pages:
                first_page = pages[0]
                page_id = first_page['id']
                
                # Mettre à jour la page
                update_data = {
                    'title': 'Test Titre Modifié',
                    'content': 'Contenu de test modifié le ' + str(datetime.now()),
                    'page_type': first_page['page_type']
                }
                
                response = requests.put(
                    f'http://localhost:8000/api/v1/company-pages/{page_id}/',
                    headers=headers,
                    data=json.dumps(update_data)
                )
                
                print(f"Status mise à jour: {response.status_code}")
                if response.status_code == 200:
                    print("✓ Mise à jour réussie")
                    updated_page = response.json()
                    print(f"Nouveau titre: {updated_page['title']}")
                else:
                    print(f"✗ Erreur: {response.text}")
        
        # Test POST création
        print("\n3. Test POST création d'une nouvelle page")
        new_page_data = {
            'title': 'Page de Test',
            'content': 'Contenu de test pour nouvelle page',
            'page_type': 'test_page'
        }
        
        response = requests.post(
            'http://localhost:8000/api/v1/company-pages/',
            headers=headers,
            data=json.dumps(new_page_data)
        )
        
        print(f"Status création: {response.status_code}")
        if response.status_code == 201:
            print("✓ Création réussie")
            new_page = response.json()
            print(f"ID nouvelle page: {new_page['id']}")
        else:
            print(f"✗ Erreur: {response.text}")
            
    except Exception as e:
        print(f"Erreur: {e}")

if __name__ == '__main__':
    from datetime import datetime
    test_culture_api()