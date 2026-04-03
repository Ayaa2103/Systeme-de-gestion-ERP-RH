from django.db import models
from django.conf import settings
from django.utils import timezone

class CompanyPage(models.Model):
    PAGE_TYPES = [
        ('vision_mission', 'Vision & Mission'),
        ('values', 'Values'),
        ('policies', 'Internal Policies'),
        ('ethics', 'Code of Ethics'),
    ]
    
    page_type = models.CharField(max_length=20, choices=PAGE_TYPES, unique=True)
    title = models.CharField(max_length=200)
    content = models.TextField()
    last_updated = models.DateTimeField(auto_now=True)
    updated_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True)
    
    def __str__(self):
        return self.get_page_type_display()

class EmployeeSuggestion(models.Model):
    STATUS_CHOICES = [
        ('new', 'New'),
        ('received', 'Received'),
        ('answered', 'Answered'),
    ]
    
    employee = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    title = models.CharField(max_length=200)
    suggestion_text = models.TextField()
    date = models.DateTimeField(default=timezone.now)
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default='new')
    response = models.TextField(blank=True)
    responded_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True, related_name='responded_suggestions')
    response_date = models.DateTimeField(null=True, blank=True)
    
    class Meta:
        ordering = ['-date']
    
    def __str__(self):
        return f"{self.title} - {self.employee.get_full_name()}"