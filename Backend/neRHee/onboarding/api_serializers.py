from rest_framework import serializers
from .models import ChecklistItem, OnboardingPlan, OnboardingTask, OnboardingFollowUp
from employees.models import Employee

class ChecklistItemSerializer(serializers.ModelSerializer):
    completed_by_name = serializers.CharField(source='completed_by.get_full_name', read_only=True)
    
    class Meta:
        model = ChecklistItem
        fields = ['id', 'employee', 'item_name', 'is_completed', 'completion_date', 
                 'completed_by', 'completed_by_name', 'created_at']
        read_only_fields = ['id', 'created_at', 'completed_by', 'completion_date']

class OnboardingPlanSerializer(serializers.ModelSerializer):
    employee_name = serializers.CharField(source='employee.user.get_full_name', read_only=True)
    created_by_name = serializers.CharField(source='created_by.get_full_name', read_only=True)
    
    class Meta:
        model = OnboardingPlan
        fields = ['id', 'employee', 'employee_name', 'created_by', 'created_by_name',
                 'start_date', 'expected_completion_date', 'actual_completion_date',
                 'status', 'notes', 'created_at']
        read_only_fields = ['id', 'created_by', 'created_at']

class OnboardingTaskSerializer(serializers.ModelSerializer):
    employee_name = serializers.CharField(source='employee.user.get_full_name', read_only=True)
    assigned_to_name = serializers.CharField(source='assigned_to.get_full_name', read_only=True)
    
    class Meta:
        model = OnboardingTask
        fields = ['id', 'employee', 'employee_name', 'task_type', 'title', 'description',
                 'assigned_to', 'assigned_to_name', 'priority', 'due_date', 'is_completed',
                 'completed_at', 'created_at']
        read_only_fields = ['id', 'created_at', 'completed_at']

class NewEmployeeSerializer(serializers.ModelSerializer):
    user_data = serializers.SerializerMethodField()
    onboarding_progress = serializers.ReadOnlyField()
    
    class Meta:
        model = Employee
        fields = ['id', 'user_data', 'matricule', 'poste', 'date_embauche', 
                 'onboarding_status', 'onboarding_progress']
    
    def get_user_data(self, obj):
        return {
            'first_name': obj.user.first_name,
            'last_name': obj.user.last_name,
            'email': obj.user.email
        }