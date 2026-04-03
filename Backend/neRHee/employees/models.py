from django.db import models
from django.conf import settings
from django.core.exceptions import ValidationError
from datetime import date, timedelta, datetime
from django.utils import timezone

class Department(models.Model):
    name = models.CharField(max_length=100, unique=True)
    code = models.CharField(max_length=10, unique=True)
    description = models.TextField(blank=True)
    manager = models.ForeignKey('Employee', on_delete=models.SET_NULL, null=True, blank=True, related_name='managed_department')
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['name']
    
    def __str__(self):
        return self.name

class Employee(models.Model):
    user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='employee_profile')
    matricule = models.CharField(max_length=30, unique=True)
    poste = models.CharField(max_length=100, blank=True)
    service = models.CharField(max_length=100, blank=True)
    department = models.ForeignKey(Department, on_delete=models.SET_NULL, null=True, blank=True, related_name='employees')
    date_embauche = models.DateField(null=True, blank=True)
    statut = models.CharField(max_length=50, default='actif')
    photo = models.ImageField(upload_to='employees/photos/', blank=True, null=True)
    onboarding_status = models.CharField(max_length=20, choices=[
        ('not_started', 'Non commencé'),
        ('in_progress', 'En cours'),
        ('completed', 'Terminé')
    ], default='not_started')
    assigned_manager = models.ForeignKey('self', on_delete=models.SET_NULL, null=True, blank=True, related_name='managed_employees')

    def __str__(self):
        return f"{self.matricule} - {self.user.get_full_name()}"
    
    @property
    def onboarding_progress(self):
        """Calculate onboarding progress percentage"""
        total_items = self.onboarding_checklist.count()
        if total_items == 0:
            return 0
        completed_items = self.onboarding_checklist.filter(is_completed=True).count()
        progress = round((completed_items / total_items) * 100)
        
        # Auto-update onboarding status
        if progress == 0:
            self.onboarding_status = 'not_started'
        elif progress == 100:
            self.onboarding_status = 'completed'
        else:
            self.onboarding_status = 'in_progress'
        self.save(update_fields=['onboarding_status'])
        
        return progress

class Contract(models.Model):
    CONTRACT_TYPE = [
        ('CDI','CDI'),
        ('CDD','CDD'),
        ('Stage','Stage'),
    ]
    employee = models.ForeignKey(Employee, on_delete=models.CASCADE, related_name='contracts')
    type = models.CharField(max_length=20, choices=CONTRACT_TYPE)
    date_debut = models.DateField()
    date_fin = models.DateField(null=True, blank=True)
    salaire = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    active = models.BooleanField(default=True)

    def __str__(self):
        return f"{self.employee.matricule} - {self.type}"
    
    @property
    def is_expiring_soon(self):
        if not self.date_fin:
            return False
        from datetime import date, timedelta
        return self.date_fin <= date.today() + timedelta(days=30)
    
    @property
    def is_expired(self):
        if not self.date_fin:
            return False
        from datetime import date
        return self.date_fin < date.today()
    
    def clean(self):
        """Validation du modèle"""
        if self.type == 'CDI' and self.date_fin:
            # CDI avec date de fin (période d'essai)
            duration = (self.date_fin - self.date_debut).days
            if duration > 180:  # 6 mois max pour période d'essai CDI
                raise ValidationError('La période d\'essai CDI ne peut pas dépasser 6 mois')
        
        if self.date_fin and self.date_fin <= self.date_debut:
            raise ValidationError('La date de fin doit être postérieure à la date de début')
    
    def save(self, *args, **kwargs):
        self.clean()
        super().save(*args, **kwargs)
    
    def can_be_renewed(self):
        """Vérifie si le contrat peut être renouvelé"""
        if self.type == 'CDI':
            # CDI en période d'essai peut être renouvelé une seule fois
            if self.date_fin:
                duration = (date.today() - self.date_debut).days
                return duration <= 180
            return False  # CDI définitif ne se renouvelle pas
        return True  # CDD et Stage peuvent être renouvelés
    
    def convert_to_permanent(self):
        """Convertit un CDI en période d'essai en CDI définitif"""
        if self.type == 'CDI' and self.date_fin:
            self.date_fin = None
            self.save()
            return True
        return False

class Training(models.Model):
    STATUS_CHOICES = [
        ('pending', 'En attente'),
        ('approved', 'Approuvée'),
        ('rejected', 'Rejetée'),
    ]
    
    name = models.CharField(max_length=100)
    description = models.TextField()
    start_date = models.DateField()
    end_date = models.DateField()
    employees = models.ManyToManyField(Employee, related_name='trainings', blank=True)
    created_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='created_trainings')
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    approved_by = models.ForeignKey(settings.AUTH_USER_MODEL, null=True, blank=True, on_delete=models.SET_NULL, related_name='approved_trainings')
    approved_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True, null=True, blank=True)
    
    class Meta:
        ordering = ['-id']
    
    def clean(self):
        from datetime import datetime
        
        # Convertir les chaînes en objets date si nécessaire
        start_date = self.start_date
        end_date = self.end_date
        
        if isinstance(start_date, str):
            start_date = datetime.strptime(start_date, '%Y-%m-%d').date()
        if isinstance(end_date, str):
            end_date = datetime.strptime(end_date, '%Y-%m-%d').date()
            
        if end_date <= start_date:
            raise ValidationError('La date de fin doit être postérieure à la date de début')
        if start_date < date.today():
            raise ValidationError('La date de début ne peut pas être dans le passé')
    
    def save(self, *args, **kwargs):
        self.clean()
        super().save(*args, **kwargs)
    
    @property
    def duration_days(self):
        return (self.end_date - self.start_date).days + 1
    
    @property
    def is_active(self):
        today = date.today()
        return self.start_date <= today <= self.end_date and self.status == 'approved'
    
    def __str__(self):
        return f"{self.name} - {self.get_status_display()}"