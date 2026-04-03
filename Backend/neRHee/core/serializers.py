from rest_framework import serializers
from .models import User, Event, HRPolicy

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name', 'role', 'phone']
        extra_kwargs = {'password': {'write_only': True}}

class EventSerializer(serializers.ModelSerializer):
    created_by_name = serializers.CharField(source='created_by.get_full_name', read_only=True)
    approved_by_name = serializers.CharField(source='approved_by.get_full_name', read_only=True)
    
    class Meta:
        model = Event
        fields = ['id', 'name', 'description', 'date', 'location', 'status', 
                 'created_by', 'created_by_name', 'approved_by', 'approved_by_name', 
                 'approved_at', 'created_at']

class HRPolicySerializer(serializers.ModelSerializer):
    created_by_name = serializers.CharField(source='created_by.get_full_name', read_only=True)
    
    class Meta:
        model = HRPolicy
        fields = ['id', 'name', 'description', 'created_by', 'created_by_name', 
                 'created_at', 'is_active']