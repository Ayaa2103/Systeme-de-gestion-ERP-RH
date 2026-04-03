#!/usr/bin/env python
import os
import sys
import django

# Configuration Django
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'newRH.settings')
django.setup()

from core.models import User
from recruitment.models import JobOffer

def create_test_job_offer():
    # Récupérer un utilisateur admin ou HR
    user = User.objects.filter(role__in=['hr_manager', 'hr_director', 'administrator']).first()
    if not user:
        print("❌ Aucun utilisateur RH trouvé")
        return
    
    # Créer une offre d'emploi
    job_offer = JobOffer.objects.create(
        title='Développeur Full Stack',
        department='Informatique',
        description='Nous recherchons un développeur full stack expérimenté pour rejoindre notre équipe.',
        required_skills='React, Django, Python, JavaScript',
        experience_level='intermediate',
        status='published',  # Important: status published
        created_by=user
    )
    
    print(f"✅ Offre d'emploi créée: {job_offer.title}")
    print(f"   Département: {job_offer.department}")
    print(f"   Status: {job_offer.status}")
    print(f"   ID: {job_offer.id}")

if __name__ == '__main__':
    create_test_job_offer()