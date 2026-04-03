from rest_framework import serializers
from .models import CompanyPage, EmployeeSuggestion

class CompanyPageSerializer(serializers.ModelSerializer):
    updated_by_name = serializers.CharField(source='updated_by.get_full_name', read_only=True)
    page_type_display = serializers.CharField(source='get_page_type_display', read_only=True)
    
    class Meta:
        model = CompanyPage
        fields = ['id', 'page_type', 'page_type_display', 'title', 'content', 
                 'last_updated', 'updated_by', 'updated_by_name']
        read_only_fields = ['id', 'last_updated', 'updated_by']

class EmployeeSuggestionSerializer(serializers.ModelSerializer):
    employee_name = serializers.CharField(source='employee.get_full_name', read_only=True)
    responded_by_name = serializers.CharField(source='responded_by.get_full_name', read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    
    class Meta:
        model = EmployeeSuggestion
        fields = ['id', 'employee', 'employee_name', 'title', 'suggestion_text', 'date',
                 'status', 'status_display', 'response', 'responded_by', 'responded_by_name',
                 'response_date']
        read_only_fields = ['id', 'employee', 'date', 'responded_by', 'response_date']