#!/usr/bin/env python
import os
import sys
import django
from datetime import date

# Configuration Django
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'newRH.settings')
django.setup()

from core.models import User
from employees.models import Employee, Department

def create_test_employee():
    # Utiliser un département existant ou créer avec un code unique
    try:
        dept = Department.objects.first()
        if not dept:
            dept = Department.objects.create(
                name="Test Département",
                code=f'TEST{date.today().strftime("%m%d")}',
                description='Département de test'
            )
    except:
        dept = None
    
    # Créer un utilisateur
    user = User.objects.create_user(
        username=f'test_employee_{date.today().strftime("%Y%m%d")}',
        email='test@example.com',
        password='password123',
        first_name='Jean',
        last_name='Dupont',
        role='employee'
    )
    
    # Créer l'employé avec la date d'aujourd'hui
    employee = Employee.objects.create(
        user=user,
        matricule=f'EMP{date.today().strftime("%Y%m%d")}',
        poste='Développeur',
        service='Développement',
        department=dept,
        date_embauche=date.today(),  # Date d'aujourd'hui
        statut='actif'
    )
    
    print(f"✅ Employé créé: {employee.user.get_full_name()}")
    print(f"   Matricule: {employee.matricule}")
    print(f"   Date d'embauche: {employee.date_embauche}")
    print(f"   Département: {employee.department.name}")

if __name__ == '__main__':
    create_test_employee()