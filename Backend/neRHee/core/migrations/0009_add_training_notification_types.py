from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('core', '0008_add_job_offer_created_notification_type'),
    ]

    operations = [
        migrations.AlterField(
            model_name='notification',
            name='notification_type',
            field=models.CharField(
                choices=[
                    ('request_created', 'Demande créée'),
                    ('request_status', 'Statut de demande'),
                    ('event_created', 'Événement créé'),
                    ('event_status', 'Statut événement'),
                    ('application_received', 'Candidature reçue'),
                    ('interview_scheduled', 'Entretien programmé'),
                    ('application_status', 'Statut de candidature'),
                    ('recommendation_status', 'Statut de recommandation'),
                    ('onboarding_started', 'Intégration démarrée'),
                    ('culture_suggestion', 'Nouvelle suggestion'),
                    ('culture_response', 'Réponse à une suggestion'),
                    ('contract_created', 'Contrat créé'),
                    ('contract_renewed', 'Contrat renouvelé'),
                    ('contract_expiring', 'Contrat expirant'),
                    ('job_offer_created', "Offre d'emploi créée"),
                    ('training_created', 'Formation créée'),
                    ('training_status', 'Statut de formation'),
                    ('system', 'Système'),
                ],
                default='system',
                max_length=40,
            ),
        ),
    ]
