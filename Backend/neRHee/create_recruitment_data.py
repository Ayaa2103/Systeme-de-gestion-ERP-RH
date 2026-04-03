#!/usr/bin/env python
import os
import sys
import django

# Configuration Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'newRH.settings')
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
django.setup()

from recruitment.models import JobOffer, Application
from django.contrib.auth import get_user_model
from datetime import datetime, timedelta

User = get_user_model()

def create_recruitment_data():
    print("Création des données de test pour le recrutement...")
    
    # Trouver un utilisateur HR
    hr_user = User.objects.filter(role__in=['hr_manager', 'hr_director']).first()
    if not hr_user:
        hr_user = User.objects.filter(is_staff=True).first()
    
    if not hr_user:
        print("Aucun utilisateur HR trouvé")
        return
    
    # Créer des offres d'emploi
    job_offers_data = [
        {
            'title': 'Développeur Frontend React',
            'department': 'Informatique',
            'description': '''Nous recherchons un développeur Frontend expérimenté en React pour rejoindre notre équipe dynamique.

Responsabilités:
• Développer des interfaces utilisateur modernes avec React
• Collaborer avec l'équipe UX/UI pour implémenter les designs
• Optimiser les performances des applications web
• Maintenir et améliorer le code existant

Environnement technique:
React, TypeScript, Material-UI, Redux, Git''',
            'required_skills': '''Compétences requises:
• 3+ années d'expérience en développement React
• Maîtrise de JavaScript ES6+ et TypeScript
• Connaissance des outils de build (Webpack, Vite)
• Expérience avec les tests unitaires (Jest, React Testing Library)
• Connaissance de Git et des méthodologies Agile

Compétences appréciées:
• Expérience avec Next.js
• Connaissance des API REST et GraphQL
• Notions de design UX/UI''',
            'experience_level': 'intermediate',
            'status': 'published'
        },
        {
            'title': 'Designer UX/UI Senior',
            'department': 'Design',
            'description': '''Rejoignez notre équipe design pour créer des expériences utilisateur exceptionnelles.

Mission:
• Concevoir des interfaces utilisateur intuitives et esthétiques
• Réaliser des recherches utilisateur et des tests d'utilisabilité
• Créer des prototypes interactifs
• Collaborer étroitement avec les équipes de développement
• Maintenir et faire évoluer le design system''',
            'required_skills': '''Profil recherché:
• 5+ années d'expérience en design UX/UI
• Maîtrise de Figma, Sketch, Adobe Creative Suite
• Expérience en recherche utilisateur et tests d'utilisabilité
• Connaissance des principes d'accessibilité web
• Portfolio démontrant des projets web et mobile

Atouts:
• Expérience en design system
• Notions de développement frontend
• Connaissance des méthodologies Design Thinking''',
            'experience_level': 'senior',
            'status': 'published'
        },
        {
            'title': 'Chef de Projet Digital',
            'department': 'Management',
            'description': '''Nous recherchons un Chef de Projet Digital pour piloter nos projets de transformation numérique.

Missions principales:
• Gérer des projets digitaux de A à Z
• Coordonner les équipes techniques et métier
• Assurer le respect des délais et budgets
• Communiquer avec les clients et parties prenantes
• Mettre en place les méthodologies Agile/Scrum''',
            'required_skills': '''Compétences requises:
• 4+ années d'expérience en gestion de projet digital
• Certification PMP ou équivalent appréciée
• Maîtrise des outils de gestion de projet (Jira, Trello, MS Project)
• Excellentes capacités de communication
• Anglais courant

Qualités personnelles:
• Leadership et esprit d'équipe
• Capacité d'adaptation et de résolution de problèmes
• Orientation résultats''',
            'experience_level': 'senior',
            'status': 'draft'
        }
    ]
    
    created_offers = []
    for offer_data in job_offers_data:
        offer, created = JobOffer.objects.get_or_create(
            title=offer_data['title'],
            defaults={
                **offer_data,
                'created_by': hr_user
            }
        )
        if created:
            print(f"✓ Offre créée: {offer.title}")
            created_offers.append(offer)
        else:
            print(f"- Offre existe déjà: {offer.title}")
            created_offers.append(offer)
    
    # Créer des candidatures pour les offres publiées
    published_offers = [offer for offer in created_offers if offer.status == 'published']
    
    if published_offers:
        applications_data = [
            {
                'first_name': 'Marie',
                'last_name': 'Dubois',
                'email': 'marie.dubois@email.com',
                'phone': '0123456789',
                'cover_letter': '''Madame, Monsieur,

Développeuse Frontend passionnée avec 4 années d'expérience en React, je suis très intéressée par le poste proposé dans votre entreprise.

Mon expérience m'a permis de maîtriser l'écosystème React moderne, incluant TypeScript, Redux et les dernières bonnes pratiques. J'ai notamment travaillé sur des applications e-commerce à fort trafic où la performance était cruciale.

Je serais ravie de contribuer à vos projets et d'apporter mon expertise technique à votre équipe.

Cordialement,
Marie Dubois''',
                'status': 'pending'
            },
            {
                'first_name': 'Jean',
                'last_name': 'Martin',
                'email': 'jean.martin@email.com',
                'phone': '0987654321',
                'cover_letter': '''Bonjour,

Designer UX/UI avec 6 ans d'expérience, je souhaite rejoindre votre équipe pour créer des expériences utilisateur mémorables.

Mon approche centrée utilisateur et ma maîtrise des outils de design me permettent de concevoir des interfaces à la fois belles et fonctionnelles. J'ai une expérience significative en recherche utilisateur et en tests d'utilisabilité.

Je suis convaincu que mon profil correspond parfaitement à vos attentes.

Bien à vous,
Jean Martin''',
                'status': 'reviewed'
            },
            {
                'first_name': 'Sophie',
                'last_name': 'Laurent',
                'email': 'sophie.laurent@email.com',
                'phone': '0147258369',
                'cover_letter': '''Madame, Monsieur,

Développeuse passionnée par les nouvelles technologies, je candidate pour le poste de Développeur Frontend React.

Diplômée d'une école d'ingénieur et forte de 3 ans d'expérience, j'ai développé une expertise solide en React et JavaScript moderne. Mon goût pour l'innovation et la qualité du code font de moi une candidate idéale.

J'aimerais beaucoup échanger avec vous sur ce poste.

Cordialement,
Sophie Laurent''',
                'status': 'interview'
            }
        ]
        
        for i, app_data in enumerate(applications_data):
            if i < len(published_offers):
                application, created = Application.objects.get_or_create(
                    email=app_data['email'],
                    job_offer=published_offers[i % len(published_offers)],
                    defaults=app_data
                )
                if created:
                    print(f"✓ Candidature créée: {application.first_name} {application.last_name}")
                else:
                    print(f"- Candidature existe déjà: {application.first_name} {application.last_name}")
    
    print(f"\nRésumé:")
    print(f"Offres d'emploi: {JobOffer.objects.count()}")
    print(f"Candidatures: {Application.objects.count()}")
    print("Données de test créées avec succès!")

if __name__ == '__main__':
    create_recruitment_data()