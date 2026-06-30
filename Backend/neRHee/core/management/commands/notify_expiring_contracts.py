from datetime import date, timedelta

from django.core.management.base import BaseCommand

from core.models import Notification
from core.notifications import create_notifications_for_roles
from employees.models import Contract


class Command(BaseCommand):
    help = "Notifie les RH des contrats actifs qui expirent dans les 30 prochains jours"

    def handle(self, *args, **options):
        contracts = Contract.objects.filter(
            active=True,
            date_fin__isnull=False,
            date_fin__gte=date.today(),
            date_fin__lte=date.today() + timedelta(days=30),
        ).select_related('employee__user')

        sent = 0
        for contract in contracts:
            link = f'/contracts?highlight={contract.id}'
            already_notified = Notification.objects.filter(
                notification_type='contract_expiring',
                link=link,
            ).exists()
            if already_notified:
                continue

            days_left = (contract.date_fin - date.today()).days
            create_notifications_for_roles(
                ['hr_manager', 'hr_director'],
                title='Contrat arrivant à expiration',
                message=(
                    f"Le contrat {contract.type} de "
                    f"{contract.employee.user.get_full_name() or contract.employee.user.username} "
                    f"expire le {contract.date_fin.strftime('%d/%m/%Y')} (dans {days_left} jours)."
                ),
                notification_type='contract_expiring',
                link=link,
            )
            sent += 1

        self.stdout.write(self.style.SUCCESS(f'{sent} notification(s) de contrat expirant envoyée(s)'))
