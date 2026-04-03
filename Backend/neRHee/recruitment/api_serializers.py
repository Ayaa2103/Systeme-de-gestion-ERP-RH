from rest_framework import serializers
from .models import JobOffer, Application, Interview, ProfileRecommendation

class JobOfferSerializer(serializers.ModelSerializer):
    created_by_name = serializers.CharField(source='created_by.get_full_name', read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    experience_level_display = serializers.CharField(source='get_experience_level_display', read_only=True)
    applications_count = serializers.SerializerMethodField()
    is_active = serializers.ReadOnlyField()
    
    class Meta:
        model = JobOffer
        fields = ['id', 'title', 'department', 'description', 'required_skills', 'experience_level',
                 'experience_level_display', 'status', 'status_display', 'created_by', 'created_by_name',
                 'created_at', 'updated_at', 'published_at', 'applications_count', 'is_active']
        read_only_fields = ['id', 'created_by', 'created_at', 'updated_at', 'published_at']
    
    def get_applications_count(self, obj):
        return obj.applications.count()

class ApplicationSerializer(serializers.ModelSerializer):
    job_offer_title = serializers.CharField(source='job_offer.title', read_only=True)
    reviewed_by_name = serializers.CharField(source='reviewed_by.get_full_name', read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    full_name = serializers.ReadOnlyField()
    
    class Meta:
        model = Application
        fields = ['id', 'job_offer', 'job_offer_title', 'first_name', 'last_name', 'full_name',
                 'email', 'phone', 'cv', 'cover_letter', 'status', 'status_display', 'applied_at',
                 'reviewed_by', 'reviewed_by_name', 'reviewed_at', 'notes', 'source']
        read_only_fields = ['id', 'applied_at', 'reviewed_by', 'reviewed_at']

class InterviewSerializer(serializers.ModelSerializer):
    application_data = serializers.SerializerMethodField()
    interviewer_name = serializers.CharField(source='interviewer.get_full_name', read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    
    class Meta:
        model = Interview
        fields = ['id', 'application', 'application_data', 'scheduled_date', 'interviewer',
                 'interviewer_name', 'location', 'status', 'status_display', 'feedback',
                 'score', 'created_at']
        read_only_fields = ['id', 'created_at']
    
    def get_application_data(self, obj):
        return {
            'id': obj.application.id,
            'candidate_name': obj.application.full_name,
            'job_title': obj.application.job_offer.title,
            'email': obj.application.email,
            'phone': obj.application.phone
        }

class ProfileRecommendationSerializer(serializers.ModelSerializer):
    job_offer_title = serializers.CharField(source='job_offer.title', read_only=True)
    recommended_by_name = serializers.CharField(source='recommended_by.get_full_name', read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    
    class Meta:
        model = ProfileRecommendation
        fields = ['id', 'job_offer', 'job_offer_title', 'recommended_by', 'recommended_by_name',
                 'candidate_name', 'candidate_email', 'candidate_phone', 'relationship',
                 'recommendation_reason', 'created_at', 'status', 'status_display']
        read_only_fields = ['id', 'recommended_by', 'created_at']