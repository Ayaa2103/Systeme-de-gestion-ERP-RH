from django.db import models
from django.contrib.auth.models import AbstractUser, Group
from django.db.models.signals import post_save
from django.dispatch import receiver

class User(AbstractUser):
    ROLE_CHOICES = [
        ('employee', 'Employee'),
        ('hr_manager', 'Responsable RH'),
        ('hr_director', 'HR Director'),
        ('administrator', 'Administrator'),
    ]
    
    phone = models.CharField(max_length=20, blank=True, null=True)
    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default='employee')
    
    def __str__(self):
        return f"{self.username} - {self.get_full_name()}"
    
    def save(self, *args, **kwargs):
        is_new = self.pk is None
        super().save(*args, **kwargs)
        
        # Auto-assign to group based on role
        if self.role:
            group_name = self.role.replace('_', ' ').title()
            group, created = Group.objects.get_or_create(name=group_name)
            self.groups.clear()
            self.groups.add(group)

@receiver(post_save, sender=User)
def create_employee_profile(sender, instance, created, **kwargs):
    if created and instance.role == 'employee':
        from employees.models import Employee
        try:
            Employee.objects.get_or_create(
                user=instance,
                defaults={
                    'matricule': f"EMP{instance.id:04d}",
                    'poste': 'Non défini',
                    'service': 'Non défini',
                    'statut': 'actif'
                }
            )
        except Exception:
            pass  # Éviter les erreurs lors de la création


class HRPolicy(models.Model):
    name = models.CharField(max_length=100)
    description = models.TextField()
    created_by = models.ForeignKey(User, on_delete=models.CASCADE)
    created_at = models.DateTimeField(auto_now_add=True)
    is_active = models.BooleanField(default=True)
    
    def __str__(self):
        return self.name



class Event(models.Model):
    STATUS_CHOICES = [
        ('pending', 'En attente'),
        ('approved', 'Approuvé'),
        ('rejected', 'Rejeté'),
    ]
    
    name = models.CharField(max_length=100)
    description = models.TextField()
    date = models.DateField()
    location = models.CharField(max_length=200)
    created_by = models.ForeignKey(User, on_delete=models.CASCADE, related_name='created_events')
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    approved_by = models.ForeignKey(User, null=True, blank=True, on_delete=models.SET_NULL, related_name='approved_events')
    approved_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return f"{self.name} - {self.get_status_display()}"


class Notification(models.Model):
    NOTIFICATION_TYPES = [
        ('request_created', 'Demande créée'),
        ('request_status', 'Statut de demande'),
        ('event_created', 'Événement créé'),
        ('event_status', 'Statut événement'),
        ('application_received', 'Candidature reçue'),
        ('recommendation_status', 'Statut de recommandation'),
        ('onboarding_started', 'Intégration démarrée'),
        ('culture_suggestion', 'Nouvelle suggestion'),
        ('culture_response', 'Réponse à une suggestion'),
        ('contract_created', 'Contrat créé'),
        ('contract_renewed', 'Contrat renouvelé'),
        ('contract_expiring', 'Contrat expirant'),
        ('system', 'Système'),
    ]

    recipient = models.ForeignKey(User, on_delete=models.CASCADE, related_name='notifications')
    actor = models.ForeignKey(User, null=True, blank=True, on_delete=models.SET_NULL, related_name='sent_notifications')
    notification_type = models.CharField(max_length=40, choices=NOTIFICATION_TYPES, default='system')
    title = models.CharField(max_length=160)
    message = models.TextField(blank=True)
    link = models.CharField(max_length=255, blank=True)
    is_read = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['recipient', 'is_read', '-created_at']),
            models.Index(fields=['notification_type', '-created_at']),
        ]

    def __str__(self):
        return f"{self.title} -> {self.recipient}"
