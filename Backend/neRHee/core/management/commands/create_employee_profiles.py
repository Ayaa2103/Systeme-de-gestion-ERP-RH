from django.core.management.base import BaseCommand
from core.models import User
from employees.models import Employee

class Command(BaseCommand):
    help = 'Create employee profiles for users without one'

    def handle(self, *args, **options):
        users_without_profile = User.objects.filter(employee_profile__isnull=True, role='employee')
        
        for user in users_without_profile:
            Employee.objects.create(
                user=user,
                matricule=f"EMP{user.id:04d}",
                poste="Non défini",
                service="Non défini",
                statut="actif"
            )
            self.stdout.write(f"Profil créé pour {user.username}")
        
        self.stdout.write(self.style.SUCCESS(f'{users_without_profile.count()} profils créés'))