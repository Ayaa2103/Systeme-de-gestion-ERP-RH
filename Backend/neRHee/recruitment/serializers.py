from rest_framework import serializers
from .models import JobOffer, Application, Interview, ProfileRecommendation

class JobOfferSerializer(serializers.ModelSerializer):
    created_by_name = serializers.CharField(source='created_by.get_full_name', read_only=True)
    applications_count = serializers.SerializerMethodField()
    experience_level_display = serializers.CharField(source='get_experience_level_display', read_only=True)
    
    class Meta:
        model = JobOffer
        fields = ['id', 'title', 'department', 'description', 'required_skills', 
                 'experience_level', 'experience_level_display', 'status', 'created_by', 'created_by_name',
                 'created_at', 'updated_at', 'published_at', 'applications_count']
        read_only_fields = ['id', 'created_at', 'updated_at', 'published_at']
    
    def get_applications_count(self, obj):
        return obj.applications.count()

class ApplicationSerializer(serializers.ModelSerializer):
    job_offer_title = serializers.CharField(source='job_offer.title', read_only=True)
    reviewed_by_name = serializers.CharField(source='reviewed_by.get_full_name', read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    interviews = serializers.SerializerMethodField()
    
    class Meta:
        model = Application
        fields = ['id', 'job_offer', 'job_offer_title', 'first_name', 'last_name', 
                 'email', 'phone', 'cv', 'cover_letter', 'status', 'status_display',
                 'applied_at', 'reviewed_by', 'reviewed_by_name', 'reviewed_at', 
                 'notes', 'source', 'interviews']
        read_only_fields = ['id', 'applied_at', 'reviewed_at']
    
    def get_interviews(self, obj):
        interviews = obj.interviews.all()
        return InterviewSerializer(interviews, many=True).data

class InterviewSerializer(serializers.ModelSerializer):
    interviewer_name = serializers.CharField(source='interviewer.get_full_name', read_only=True)
    application_candidate = serializers.CharField(source='application.full_name', read_only=True)
    
    class Meta:
        model = Interview
        fields = ['id', 'application', 'application_candidate', 'scheduled_date', 
                 'interviewer', 'interviewer_name', 'location', 'status', 
                 'feedback', 'score', 'created_at']
        read_only_fields = ['id', 'created_at']

class ProfileRecommendationSerializer(serializers.ModelSerializer):
    job_offer_title = serializers.CharField(source='job_offer.title', read_only=True)
    recommended_by_name = serializers.CharField(source='recommended_by.get_full_name', read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    
    class Meta:
        model = ProfileRecommendation
        fields = ['id', 'job_offer', 'job_offer_title', 'recommended_by', 
                 'recommended_by_name', 'candidate_name', 'candidate_email', 
                 'candidate_phone', 'relationship', 'recommendation_reason', 
                 'created_at', 'status', 'status_display']
        read_only_fields = ['id', 'created_at']
        
    def create(self, validated_data):
        return ProfileRecommendation.objects.create(**validated_data)