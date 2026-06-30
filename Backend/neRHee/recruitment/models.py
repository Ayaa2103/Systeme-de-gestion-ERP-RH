from django.db import models
from django.conf import settings
from django.utils import timezone

class JobOffer(models.Model):
    STATUS_CHOICES = [
        ('draft', 'Brouillon'),
        ('published', 'Publié'),
        ('closed', 'Fermé'),
    ]
    
    EXPERIENCE_LEVELS = [
        ('junior', 'Junior (0-2 ans)'),
        ('intermediate', 'Intermédiaire (2-5 ans)'),
        ('senior', 'Senior (5+ ans)'),
        ('expert', 'Expert (10+ ans)'),
    ]
    
    title = models.CharField(max_length=200)
    department = models.CharField(max_length=100)
    description = models.TextField()
    required_skills = models.TextField()
    experience_level = models.CharField(max_length=20, choices=EXPERIENCE_LEVELS)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='draft')
    created_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='created_job_offers')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    published_at = models.DateTimeField(null=True, blank=True)
    
    class Meta:
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.title} - {self.get_status_display()}"
    
    def publish(self):
        self.status = 'published'
        self.published_at = timezone.now()
        self.save()
    
    def close(self):
        self.status = 'closed'
        self.save()
    
    @property
    def is_active(self):
        return self.status == 'published'

class Application(models.Model):
    STATUS_CHOICES = [
        ('pending', 'En attente'),
        ('reviewed', 'Examiné'),
        ('interview', 'Entretien'),
        ('accepted', 'Accepté'),
        ('rejected', 'Rejeté'),
    ]
    
    job_offer = models.ForeignKey(JobOffer, on_delete=models.CASCADE, related_name='applications')
    applicant = models.ForeignKey(settings.AUTH_USER_MODEL, null=True, blank=True, on_delete=models.SET_NULL, related_name='job_applications')
    first_name = models.CharField(max_length=100)
    last_name = models.CharField(max_length=100)
    email = models.EmailField()
    phone = models.CharField(max_length=20)
    cv = models.FileField(upload_to='recruitment/cvs/')
    cover_letter = models.TextField(blank=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    applied_at = models.DateTimeField(auto_now_add=True)
    reviewed_by = models.ForeignKey(settings.AUTH_USER_MODEL, null=True, blank=True, on_delete=models.SET_NULL, related_name='reviewed_applications')
    reviewed_at = models.DateTimeField(null=True, blank=True)
    notes = models.TextField(blank=True)
    source = models.CharField(max_length=20, choices=[('web', 'Site Web'), ('email', 'Email')], default='web')
    
    class Meta:
        ordering = ['-applied_at']
    
    def __str__(self):
        return f"{self.first_name} {self.last_name} - {self.job_offer.title}"
    
    @property
    def full_name(self):
        return f"{self.first_name} {self.last_name}"

class Interview(models.Model):
    STATUS_CHOICES = [
        ('scheduled', 'Programmé'),
        ('completed', 'Terminé'),
        ('cancelled', 'Annulé'),
    ]
    
    application = models.ForeignKey(Application, on_delete=models.CASCADE, related_name='interviews')
    scheduled_date = models.DateTimeField()
    interviewer = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='conducted_interviews')
    location = models.CharField(max_length=200, blank=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='scheduled')
    feedback = models.TextField(blank=True)
    score = models.IntegerField(null=True, blank=True, help_text="Score sur 10")
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['-scheduled_date']
    
    def __str__(self):
        return f"Entretien - {self.application.full_name} - {self.scheduled_date.strftime('%d/%m/%Y %H:%M')}"

class ProfileRecommendation(models.Model):
    job_offer = models.ForeignKey(JobOffer, on_delete=models.CASCADE, related_name='recommendations')
    recommended_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    candidate_name = models.CharField(max_length=100)
    candidate_email = models.EmailField()
    candidate_phone = models.CharField(max_length=20, blank=True)
    relationship = models.CharField(max_length=100, help_text="Relation avec le candidat")
    recommendation_reason = models.TextField(help_text="Pourquoi recommandez-vous ce profil?")
    created_at = models.DateTimeField(auto_now_add=True)
    status = models.CharField(max_length=20, choices=[
        ('pending', 'En attente'),
        ('contacted', 'Contacté'),
        ('rejected', 'Rejeté')
    ], default='pending')
    
    def __str__(self):
        return f"{self.candidate_name} recommandé pour {self.job_offer.title}"