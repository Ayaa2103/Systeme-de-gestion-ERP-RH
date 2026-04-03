#!/usr/bin/env python
import os
import sys
import django

# Configuration Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'newRH.settings')
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
django.setup()

from company_culture.models import CompanyPage, EmployeeSuggestion
from django.contrib.auth import get_user_model

User = get_user_model()

def create_sample_data():
    print("Création des données de test pour la culture d'entreprise...")
    
    # Créer des pages de culture d'entreprise
    pages_data = [
        {
            'page_type': 'vision_mission',
            'title': 'Vision & Mission',
            'content': '''Notre Vision:
Devenir le leader dans notre domaine en offrant des solutions innovantes et durables.

Notre Mission:
Fournir des services de qualité exceptionnelle tout en respectant nos valeurs fondamentales et en contribuant au développement de nos employés et de la communauté.'''
        },
        {
            'page_type': 'values',
            'title': 'Nos Valeurs',
            'content': '''Nos valeurs fondamentales:

1. Excellence: Nous visons l'excellence dans tout ce que nous faisons
2. Intégrité: Nous agissons avec honnêteté et transparence
3. Innovation: Nous encourageons la créativité et l'innovation
4. Respect: Nous respectons nos collègues, clients et partenaires
5. Collaboration: Nous travaillons ensemble pour atteindre nos objectifs'''
        },
        {
            'page_type': 'policies',
            'title': 'Politiques Internes',
            'content': '''Politiques importantes:

• Politique de télétravail: Flexibilité dans l'organisation du travail
• Politique de formation: Développement continu des compétences
• Politique de diversité: Promotion de l'égalité et de l'inclusion
• Politique environnementale: Engagement pour le développement durable
• Politique de confidentialité: Protection des données et informations'''
        },
        {
            'page_type': 'ethics',
            'title': 'Code d\'Éthique',
            'content': '''Code d'éthique et de conduite:

1. Respect des lois et réglementations
2. Prévention des conflits d'intérêts
3. Protection des informations confidentielles
4. Respect de la dignité humaine
5. Responsabilité sociale et environnementale
6. Transparence dans les communications
7. Équité dans les relations professionnelles'''
        }
    ]
    
    for page_data in pages_data:
        page, created = CompanyPage.objects.get_or_create(
            page_type=page_data['page_type'],
            defaults={
                'title': page_data['title'],
                'content': page_data['content']
            }
        )
        if created:
            print(f"✓ Page créée: {page.title}")
        else:
            print(f"- Page existe déjà: {page.title}")
    
    # Créer quelques suggestions d'exemple
    try:
        # Trouver un utilisateur existant ou créer un utilisateur de test
        user = User.objects.filter(role='employee').first()
        if not user:
            user = User.objects.filter(is_staff=False).first()
        
        if user:
            suggestions_data = [
                {
                    'title': 'Amélioration de l\'espace de travail',
                    'suggestion_text': 'Je suggère d\'ajouter plus de plantes dans les bureaux pour améliorer la qualité de l\'air et créer un environnement plus agréable.',
                    'status': 'new'
                },
                {
                    'title': 'Programme de formation en ligne',
                    'suggestion_text': 'Il serait intéressant de mettre en place une plateforme de formation en ligne pour permettre aux employés de se former à leur rythme.',
                    'status': 'received'
                },
                {
                    'title': 'Journée bien-être',
                    'suggestion_text': 'Organiser une journée bien-être mensuelle avec des activités de relaxation et de team building.',
                    'status': 'answered'
                }
            ]
            
            for suggestion_data in suggestions_data:
                suggestion, created = EmployeeSuggestion.objects.get_or_create(
                    employee=user,
                    title=suggestion_data['title'],
                    defaults={
                        'suggestion_text': suggestion_data['suggestion_text'],
                        'status': suggestion_data['status']
                    }
                )
                if created:
                    print(f"✓ Suggestion créée: {suggestion.title}")
                else:
                    print(f"- Suggestion existe déjà: {suggestion.title}")
        else:
            print("Aucun utilisateur trouvé pour créer des suggestions")
    
    except Exception as e:
        print(f"Erreur lors de la création des suggestions: {e}")
    
    print("\nDonnées de test créées avec succès!")
    print(f"Pages de culture: {CompanyPage.objects.count()}")
    print(f"Suggestions: {EmployeeSuggestion.objects.count()}")

if __name__ == '__main__':
    create_sample_data()