from django.contrib import admin
from .models import JobOffer, Application, Interview, ProfileRecommendation

@admin.register(JobOffer)
class JobOfferAdmin(admin.ModelAdmin):
    list_display = ['title', 'department', 'experience_level', 'status', 'created_by', 'created_at']
    list_filter = ['status', 'experience_level', 'department', 'created_at']
    search_fields = ['title', 'department', 'description']
    readonly_fields = ['created_at', 'updated_at', 'published_at']

@admin.register(Application)
class ApplicationAdmin(admin.ModelAdmin):
    list_display = ['full_name', 'job_offer', 'email', 'status', 'applied_at']
    list_filter = ['status', 'applied_at', 'job_offer']
    search_fields = ['first_name', 'last_name', 'email']
    readonly_fields = ['applied_at', 'reviewed_at']

@admin.register(Interview)
class InterviewAdmin(admin.ModelAdmin):
    list_display = ['application', 'scheduled_date', 'interviewer', 'status', 'score']
    list_filter = ['status', 'scheduled_date', 'interviewer']
    search_fields = ['application__first_name', 'application__last_name']
    readonly_fields = ['created_at']

@admin.register(ProfileRecommendation)
class ProfileRecommendationAdmin(admin.ModelAdmin):
    list_display = ['candidate_name', 'job_offer', 'recommended_by', 'status', 'created_at']
    list_filter = ['status', 'created_at']
    search_fields = ['candidate_name', 'candidate_email', 'recommended_by__username']