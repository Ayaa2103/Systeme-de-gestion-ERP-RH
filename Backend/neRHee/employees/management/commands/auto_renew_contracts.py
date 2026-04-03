from django.core.management.base import BaseCommand
from employees.models import Contract

class Command(BaseCommand):
    help = 'Renouvelle automatiquement les contrats CDI éligibles'

    def handle(self, *args, **options):
        contracts = Contract.objects.filter(type='CDI', active=True)
        renewed_count = 0
        
        for contract in contracts:
            if contract.should_auto_renew():
                new_contract = contract.auto_renew()
                if new_contract:
                    renewed_count += 1
                    self.stdout.write(f'Contrat renouvelé: {contract.employee.user.get_full_name()}')
        
        self.stdout.write(self.style.SUCCESS(f'{renewed_count} contrats renouvelés automatiquement'))