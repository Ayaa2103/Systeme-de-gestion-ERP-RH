from django.contrib import admin
from .models import LeaveRequest, AttestationRequest, MissionOrderRequest, PayslipRequest

@admin.register(LeaveRequest)
class LeaveRequestAdmin(admin.ModelAdmin):
    list_display = ('requester', 'start_date', 'end_date', 'leave_type', 'status', 'created_at')
    list_filter = ('status', 'leave_type', 'created_at')
    search_fields = ('requester__matricule', 'requester__user__username')

@admin.register(AttestationRequest)
class AttestationRequestAdmin(admin.ModelAdmin):
    list_display = ('requester', 'purpose', 'attestation_type', 'status', 'created_at')
    list_filter = ('status', 'attestation_type', 'created_at')
    search_fields = ('requester__matricule', 'purpose')

@admin.register(MissionOrderRequest)
class MissionOrderRequestAdmin(admin.ModelAdmin):
    list_display = ('requester', 'destination', 'start_date', 'end_date', 'status', 'created_at')
    list_filter = ('status', 'created_at')
    search_fields = ('requester__matricule', 'destination')

@admin.register(PayslipRequest)
class PayslipRequestAdmin(admin.ModelAdmin):
    list_display = ('requester', 'periode_mois', 'status', 'created_at')
    list_filter = ('status', 'created_at')
    search_fields = ('requester__matricule', 'periode_mois')