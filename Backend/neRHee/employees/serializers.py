from rest_framework import serializers
from .models import Employee, Contract, Training, Department
from core.models import User

class UserBasicSerializer(serializers.ModelSerializer):
    full_name = serializers.CharField(source='get_full_name', read_only=True)
    
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name', 'full_name', 'phone']

class DepartmentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Department
        fields = ['id', 'name', 'code', 'description']

class EmployeeSerializer(serializers.ModelSerializer):
    user = UserBasicSerializer(read_only=True)
    user_id = serializers.IntegerField(write_only=True, required=False)
    department_name = serializers.CharField(source='department.name', read_only=True)
    full_name = serializers.CharField(source='user.get_full_name', read_only=True)
    
    class Meta:
        model = Employee
        fields = ['id', 'user', 'user_id', 'matricule', 'poste', 'service', 
                 'department', 'department_name', 'date_embauche', 'statut', 
                 'photo', 'onboarding_status', 'assigned_manager', 'full_name']

class ContractSerializer(serializers.ModelSerializer):
    employee_name = serializers.CharField(source='employee.user.get_full_name', read_only=True)
    employee_matricule = serializers.CharField(source='employee.matricule', read_only=True)
    employee_photo = serializers.ImageField(source='employee.photo', read_only=True)
    is_expiring_soon = serializers.BooleanField(read_only=True)
    is_expired = serializers.BooleanField(read_only=True)
    
    class Meta:
        model = Contract
        fields = ['id', 'employee', 'employee_name', 'employee_matricule', 'employee_photo',
                 'type', 'date_debut', 'date_fin', 'salaire', 'active',
                 'is_expiring_soon', 'is_expired']

class TrainingSerializer(serializers.ModelSerializer):
    created_by_name = serializers.CharField(source='created_by.get_full_name', read_only=True)
    approved_by_name = serializers.CharField(source='approved_by.get_full_name', read_only=True)
    employees_count = serializers.IntegerField(source='employees.count', read_only=True)
    employees = EmployeeSerializer(many=True, read_only=True)
    duration_days = serializers.IntegerField(read_only=True)
    is_active = serializers.BooleanField(read_only=True)
    
    class Meta:
        model = Training
        fields = ['id', 'name', 'description', 'start_date', 'end_date', 
                 'employees', 'employees_count', 'created_by', 'created_by_name',
                 'status', 'approved_by', 'approved_by_name', 'approved_at', 
                 'created_at', 'duration_days', 'is_active']