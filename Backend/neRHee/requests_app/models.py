from django.db import models
from django.conf import settings
from django.core.exceptions import ValidationError
from datetime import date
from employees.models import Employee

USER = settings.AUTH_USER_MODEL

class RequestBase(models.Model):
    REQUEST_STATUS = [
        ('pending','Pending'),
        ('approved','Approved'),
        ('rejected','Rejected'),
    ]
    # Pas de reverse relation automatique depuis la classe abstraite
    requester = models.ForeignKey(Employee, on_delete=models.CASCADE, related_name='+')
    created_at = models.DateTimeField(auto_now_add=True)
    status = models.CharField(max_length=20, choices=REQUEST_STATUS, default='pending')
    approver = models.ForeignKey(USER, null=True, blank=True, on_delete=models.SET_NULL, related_name='+')
    comment = models.TextField(blank=True)

    class Meta:
        abstract = True

class LeaveRequest(RequestBase):
    LEAVE_TYPES = [
        ('annual', 'Congé Annuel'),
        ('sick', 'Congé Maladie'),
        ('personal', 'Congé Personnel'),
    ]
    
    requester = models.ForeignKey(Employee, on_delete=models.CASCADE, related_name='leave_requests')
    approver = models.ForeignKey(USER, null=True, blank=True, on_delete=models.SET_NULL, related_name='leave_approved_requests')
    start_date = models.DateField()
    end_date = models.DateField()
    leave_type = models.CharField(max_length=50, choices=LEAVE_TYPES, default='annual')

    def clean(self):
        if self.end_date <= self.start_date:
            raise ValidationError('La date de fin doit être postérieure à la date de début')
        if self.pk is None and self.start_date < date.today():
            raise ValidationError('La date de début ne peut pas être dans le passé')
    
    def save(self, *args, **kwargs):
        skip_validation = kwargs.pop('skip_validation', False)
        if not skip_validation:
            self.clean()
        super().save(*args, **kwargs)

    def __str__(self):
        return f"Congé: {self.requester} ({self.start_date} -> {self.end_date})"

class AttestationRequest(RequestBase):
    requester = models.ForeignKey(Employee, on_delete=models.CASCADE, related_name='attestation_requests')
    approver = models.ForeignKey(USER, null=True, blank=True, on_delete=models.SET_NULL, related_name='attestation_approved_requests')
    purpose = models.CharField(max_length=255)
    attestation_type = models.CharField(max_length=100, default='employment')
    
    def __str__(self):
        return f"Attestation: {self.requester} - {self.attestation_type}"

class MissionOrderRequest(RequestBase):
    requester = models.ForeignKey(Employee, on_delete=models.CASCADE, related_name='mission_requests')
    approver = models.ForeignKey(USER, null=True, blank=True, on_delete=models.SET_NULL, related_name='mission_approved_requests')
    destination = models.CharField(max_length=255)
    start_date = models.DateField()
    end_date = models.DateField()
    reason = models.TextField(blank=True)
    
    def clean(self):
        if self.end_date <= self.start_date:
            raise ValidationError('La date de fin doit être postérieure à la date de début')
        if self.pk is None and self.start_date < date.today():
            raise ValidationError('La date de début ne peut pas être dans le passé')
    
    def save(self, *args, **kwargs):
        skip_validation = kwargs.pop('skip_validation', False)
        if not skip_validation:
            self.clean()
        super().save(*args, **kwargs)

class PayslipRequest(RequestBase):
    requester = models.ForeignKey(Employee, on_delete=models.CASCADE, related_name='payslip_requests')
    approver = models.ForeignKey(USER, null=True, blank=True, on_delete=models.SET_NULL, related_name='payslip_approved_requests')
    periode_mois = models.CharField(max_length=20)
    
    def __str__(self):
        return f"Bulletin: {self.requester} - {self.periode_mois}"
