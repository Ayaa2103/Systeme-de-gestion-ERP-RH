from django.contrib import admin
from .models import (
    ChecklistItem, OnboardingPlan, OnboardingDocument, OnboardingTask, 
    OnboardingTraining, OnboardingFollowUp
)

@admin.register(ChecklistItem)
class ChecklistItemAdmin(admin.ModelAdmin):
    list_display = ['employee', 'item_name', 'is_completed', 'completion_date', 'completed_by']
    list_filter = ['is_completed', 'completion_date']
    search_fields = ['employee__user__first_name', 'employee__user__last_name', 'item_name']
    readonly_fields = ['completion_date', 'completed_by']

@admin.register(OnboardingPlan)
class OnboardingPlanAdmin(admin.ModelAdmin):
    list_display = ['employee', 'status', 'start_date', 'expected_completion_date', 'created_by', 'created_at']
    list_filter = ['status', 'created_at', 'start_date']
    search_fields = ['employee__user__first_name', 'employee__user__last_name']
    readonly_fields = ['created_at']

@admin.register(OnboardingDocument)
class OnboardingDocumentAdmin(admin.ModelAdmin):
    list_display = ['employee', 'title', 'document_type', 'is_mandatory', 'is_signed', 'signed_at']
    list_filter = ['document_type', 'is_mandatory', 'is_signed', 'created_at']
    search_fields = ['employee__user__first_name', 'employee__user__last_name', 'title']
    readonly_fields = ['created_at', 'signed_at']

@admin.register(OnboardingTask)
class OnboardingTaskAdmin(admin.ModelAdmin):
    list_display = ['employee', 'title', 'task_type', 'assigned_to', 'priority', 'due_date', 'is_completed']
    list_filter = ['task_type', 'priority', 'is_completed', 'due_date', 'created_at']
    search_fields = ['employee__user__first_name', 'employee__user__last_name', 'title', 'assigned_to__first_name']
    readonly_fields = ['created_at', 'completed_at']

@admin.register(OnboardingTraining)
class OnboardingTrainingAdmin(admin.ModelAdmin):
    list_display = ['employee', 'title', 'training_type', 'duration_hours', 'is_mandatory', 'is_completed', 'score']
    list_filter = ['training_type', 'is_mandatory', 'is_completed', 'scheduled_date']
    search_fields = ['employee__user__first_name', 'employee__user__last_name', 'title']
    readonly_fields = ['created_at']

@admin.register(OnboardingFollowUp)
class OnboardingFollowUpAdmin(admin.ModelAdmin):
    list_display = ['employee', 'follow_up_type', 'scheduled_date', 'conducted_date', 'conducted_by', 'is_completed', 'overall_rating']
    list_filter = ['follow_up_type', 'is_completed', 'scheduled_date', 'conducted_date']
    search_fields = ['employee__user__first_name', 'employee__user__last_name']
    readonly_fields = ['created_at']