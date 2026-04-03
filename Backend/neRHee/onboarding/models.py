from django.db import models
from django.conf import settings
from employees.models import Employee
from django.utils import timezone

class ChecklistItem(models.Model):
    """
    Onboarding checklist items for each employee
    Managed by: HR Manager + Assigned Manager
    """
    employee = models.ForeignKey(Employee, on_delete=models.CASCADE, related_name='onboarding_checklist')
    item_name = models.CharField(max_length=200)
    is_completed = models.BooleanField(default=False)
    completion_date = models.DateTimeField(null=True, blank=True)
    completed_by = models.ForeignKey(settings.AUTH_USER_MODEL, null=True, blank=True, on_delete=models.SET_NULL, related_name='completed_checklist_items')
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['id']
    
    def __str__(self):
        return f"{self.employee.user.get_full_name()} - {self.item_name}"
    
    def mark_completed(self, user):
        """Mark item as completed"""
        self.is_completed = True
        self.completion_date = timezone.now()
        self.completed_by = user
        self.save()

def create_default_checklist(employee):
    """Create default checklist items for employee"""
    default_items = [
        'Documents administratifs fournis',
        'Compte informatique créé',
        'Matériel informatique attribué',
        'Badge d\'accès créé',
        'Bureau attribué',
        'Présentation à l\'équipe effectuée',
        'Formation sécurité suivie',
        'Formation qualité suivie',
        'Formation culture d\'entreprise suivie',
        'Entretien semaine 1 effectué',
        'Entretien mois 1 effectué',
        'Évaluation période d\'essai effectuée'
    ]
    
    for item_name in default_items:
        ChecklistItem.objects.get_or_create(
            employee=employee,
            item_name=item_name
        )

class OnboardingPlan(models.Model):
    """Plan d'intégration pour un employé"""
    employee = models.OneToOneField(Employee, on_delete=models.CASCADE, related_name='onboarding_plan')
    created_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='created_onboarding_plans')
    created_at = models.DateTimeField(auto_now_add=True)
    start_date = models.DateField()
    expected_completion_date = models.DateField()
    actual_completion_date = models.DateField(null=True, blank=True)
    status = models.CharField(max_length=20, choices=[
        ('draft', 'Brouillon'),
        ('active', 'Actif'),
        ('completed', 'Terminé'),
        ('cancelled', 'Annulé')
    ], default='draft')
    notes = models.TextField(blank=True)
    
    def __str__(self):
        return f"Plan d'intégration - {self.employee.user.get_full_name()}"

class OnboardingDocument(models.Model):
    """Documents à signer pendant l'intégration"""
    DOCUMENT_TYPES = [
        ('contract', 'Contrat de travail'),
        ('internal_rules', 'Règlement intérieur'),
        ('it_charter', 'Charte informatique'),
        ('security_sheet', 'Fiche sécurité'),
        ('confidentiality', 'Accord de confidentialité'),
        ('other', 'Autre')
    ]
    
    employee = models.ForeignKey(Employee, on_delete=models.CASCADE, related_name='onboarding_documents')
    document_type = models.CharField(max_length=20, choices=DOCUMENT_TYPES)
    title = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    file_path = models.FileField(upload_to='onboarding/documents/', blank=True)
    is_mandatory = models.BooleanField(default=True)
    is_signed = models.BooleanField(default=False)
    signed_at = models.DateTimeField(null=True, blank=True)
    signed_by = models.ForeignKey(settings.AUTH_USER_MODEL, null=True, blank=True, on_delete=models.SET_NULL, related_name='signed_documents')
    created_at = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return f"{self.employee.user.get_full_name()} - {self.title}"
    
    def sign_document(self, user):
        """Signer le document"""
        self.is_signed = True
        self.signed_at = timezone.now()
        self.signed_by = user
        self.save()

class OnboardingTask(models.Model):
    """Tâches d'intégration assignées"""
    TASK_TYPES = [
        ('hr', 'Tâche RH'),
        ('it', 'Tâche IT'),
        ('manager', 'Tâche Manager'),
        ('employee', 'Tâche Employé'),
        ('logistics', 'Tâche Logistique')
    ]
    
    PRIORITY_CHOICES = [
        ('low', 'Basse'),
        ('medium', 'Moyenne'),
        ('high', 'Haute'),
        ('urgent', 'Urgente')
    ]
    
    employee = models.ForeignKey(Employee, on_delete=models.CASCADE, related_name='onboarding_tasks')
    task_type = models.CharField(max_length=20, choices=TASK_TYPES)
    title = models.CharField(max_length=200)
    description = models.TextField()
    assigned_to = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='assigned_onboarding_tasks')
    priority = models.CharField(max_length=10, choices=PRIORITY_CHOICES, default='medium')
    due_date = models.DateField()
    is_completed = models.BooleanField(default=False)
    completed_at = models.DateTimeField(null=True, blank=True)
    completed_by = models.ForeignKey(settings.AUTH_USER_MODEL, null=True, blank=True, on_delete=models.SET_NULL, related_name='completed_onboarding_tasks')
    created_at = models.DateTimeField(auto_now_add=True)
    created_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='created_onboarding_tasks')
    
    class Meta:
        ordering = ['due_date', '-priority']
    
    def __str__(self):
        return f"{self.employee.user.get_full_name()} - {self.title}"
    
    def mark_completed(self, user):
        """Marquer la tâche comme terminée"""
        self.is_completed = True
        self.completed_at = timezone.now()
        self.completed_by = user
        self.save()

class OnboardingTraining(models.Model):
    """Formations obligatoires d'intégration"""
    TRAINING_TYPES = [
        ('security', 'Formation Sécurité'),
        ('quality', 'Formation Qualité'),
        ('software', 'Formation Logiciels'),
        ('processes', 'Formation Processus'),
        ('company_culture', 'Culture d\'entreprise'),
        ('other', 'Autre')
    ]
    
    employee = models.ForeignKey(Employee, on_delete=models.CASCADE, related_name='onboarding_trainings')
    training_type = models.CharField(max_length=20, choices=TRAINING_TYPES)
    title = models.CharField(max_length=200)
    description = models.TextField()
    duration_hours = models.PositiveIntegerField()
    is_mandatory = models.BooleanField(default=True)
    scheduled_date = models.DateField(null=True, blank=True)
    is_completed = models.BooleanField(default=False)
    completion_date = models.DateField(null=True, blank=True)
    score = models.PositiveIntegerField(null=True, blank=True, help_text="Score sur 100")
    trainer = models.ForeignKey(settings.AUTH_USER_MODEL, null=True, blank=True, on_delete=models.SET_NULL, related_name='conducted_trainings')
    created_at = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return f"{self.employee.user.get_full_name()} - {self.title}"
    
    def mark_completed(self, completion_date, score=None):
        """Marquer la formation comme terminée"""
        self.is_completed = True
        self.completion_date = completion_date
        if score:
            self.score = score
        self.save()

class OnboardingFollowUp(models.Model):
    """Suivi et évaluations d'intégration"""
    FOLLOW_UP_TYPES = [
        ('week_1', 'Suivi Semaine 1'),
        ('month_1', 'Suivi Mois 1'),
        ('month_3', 'Suivi Mois 3'),
        ('trial_period', 'Évaluation Période d\'essai'),
        ('other', 'Autre')
    ]
    
    employee = models.ForeignKey(Employee, on_delete=models.CASCADE, related_name='onboarding_followups')
    follow_up_type = models.CharField(max_length=20, choices=FOLLOW_UP_TYPES)
    scheduled_date = models.DateField()
    conducted_date = models.DateField(null=True, blank=True)
    conducted_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='conducted_followups')
    employee_feedback = models.TextField(blank=True)
    manager_feedback = models.TextField(blank=True)
    hr_notes = models.TextField(blank=True)
    overall_rating = models.PositiveIntegerField(null=True, blank=True, help_text="Note sur 5")
    is_completed = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['scheduled_date']
    
    def __str__(self):
        return f"{self.employee.user.get_full_name()} - {self.get_follow_up_type_display()}"

def get_onboarding_progress(employee):
    """Calculate onboarding progress percentage for employee"""
    total_items = employee.onboarding_checklist.count()
    if total_items == 0:
        return 0
    completed_items = employee.onboarding_checklist.filter(is_completed=True).count()
    return round((completed_items / total_items) * 100)

def create_onboarding_plan(employee, created_by, start_date, expected_completion_date):
    """Créer un plan d'intégration complet"""
    from datetime import timedelta
    
    # Créer le plan principal
    plan = OnboardingPlan.objects.create(
        employee=employee,
        created_by=created_by,
        start_date=start_date,
        expected_completion_date=expected_completion_date,
        status='active'
    )
    
    # Créer les tâches automatiques
    manager_user = employee.assigned_manager.user if employee.assigned_manager else created_by
    
    tasks = [
        ('hr', 'Créer le profil employé', 'Créer le profil complet de l\'employé dans le système', created_by, 'high', start_date),
        ('it', 'Créer compte informatique', 'Créer email, accès réseau et comptes utilisateur', created_by, 'high', start_date),
        ('it', 'Préparer matériel', 'Préparer PC, téléphone et équipements nécessaires', created_by, 'medium', start_date + timedelta(days=1)),
        ('logistics', 'Préparer bureau et badge', 'Attribuer bureau et créer badge d\'accès', created_by, 'medium', start_date + timedelta(days=1)),
        ('manager', 'Présentation équipe', 'Présenter le nouvel employé à l\'équipe', manager_user, 'high', start_date),
        ('employee', 'Lecture procédures', 'Lire les procédures de l\'entreprise', employee.user, 'medium', start_date + timedelta(days=2))
    ]
    
    for task_type, title, description, assigned_to, priority, due_date in tasks:
        OnboardingTask.objects.create(
            employee=employee,
            task_type=task_type,
            title=title,
            description=description,
            assigned_to=assigned_to,
            priority=priority,
            due_date=due_date,
            created_by=created_by
        )
    
    # Créer les formations obligatoires
    trainings = [
        ('security', 'Formation Sécurité', 'Formation aux règles de sécurité', 4),
        ('quality', 'Formation Qualité', 'Formation aux processus qualité', 2),
        ('company_culture', 'Culture d\'entreprise', 'Présentation de l\'entreprise et ses valeurs', 3),
        ('processes', 'Processus internes', 'Formation aux processus internes', 6)
    ]
    
    for training_type, title, description, duration in trainings:
        OnboardingTraining.objects.create(
            employee=employee,
            training_type=training_type,
            title=title,
            description=description,
            duration_hours=duration,
            is_mandatory=True,
            scheduled_date=start_date + timedelta(days=3)
        )
    
    # Créer les points de suivi
    followups = [
        ('week_1', start_date + timedelta(days=7)),
        ('month_1', start_date + timedelta(days=30)),
        ('month_3', start_date + timedelta(days=90))
    ]
    
    for followup_type, scheduled_date in followups:
        OnboardingFollowUp.objects.create(
            employee=employee,
            follow_up_type=followup_type,
            scheduled_date=scheduled_date,
            conducted_by=created_by
        )
    
    # Créer la checklist par défaut
    create_default_checklist(employee)
    
    return plan