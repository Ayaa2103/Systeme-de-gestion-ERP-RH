from django.core.management.base import BaseCommand
from django.contrib.auth.models import Group, Permission

class Command(BaseCommand):
    help = 'Setup user groups and permissions'

    def handle(self, *args, **options):
        # Create groups
        employee_group, _ = Group.objects.get_or_create(name='Employee')
        hr_manager_group, _ = Group.objects.get_or_create(name='Hr Manager')
        hr_director_group, _ = Group.objects.get_or_create(name='Hr Director')
        admin_group, _ = Group.objects.get_or_create(name='Administrator')

        self.stdout.write(self.style.SUCCESS('Successfully setup groups'))