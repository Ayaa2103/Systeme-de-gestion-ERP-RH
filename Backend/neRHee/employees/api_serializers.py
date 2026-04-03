from rest_framework import serializers
from .models import Employee, Contract, Training, Department

class DepartmentSerializer(serializers.ModelSerializer):
    manager_name = serializers.CharField(source='manager.user.get_full_name', read_only=True)
    employees_count = serializers.SerializerMethodField()
    
    class Meta:
        model = Department
        fields = ['id', 'name', 'code', 'description', 'manager', 'manager_name', 'employees_count', 'created_at']
        read_only_fields = ['id', 'created_at']
    
    def get_employees_count(self, obj):
        return obj.employees.filter(statut='actif').count()

class EmployeeSerializer(serializers.ModelSerializer):
    user_data = serializers.SerializerMethodField()
    department_name = serializers.CharField(source='department.name', read_only=True)
    manager_name = serializers.CharField(source='assigned_manager.user.get_full_name', read_only=True)
    onboarding_progress = serializers.ReadOnlyField()
    
    class Meta:
        model = Employee
        fields = ['id', 'user', 'user_data', 'matricule', 'poste', 'service', 'department', 
                 'department_name', 'date_embauche', 'statut', 'photo', 'onboarding_status', 
                 'assigned_manager', 'manager_name', 'onboarding_progress']
        read_only_fields = ['id', 'onboarding_progress']
    
    def get_user_data(self, obj):
        return {
            'id': obj.user.id,
            'username': obj.user.username,
            'email': obj.user.email,
            'first_name': obj.user.first_name,
            'last_name': obj.user.last_name,
            'phone': obj.user.phone,
            'full_name': obj.user.get_full_name()
        }

class ContractSerializer(serializers.ModelSerializer):
    employee_name = serializers.CharField(source='employee.user.get_full_name', read_only=True)
    employee_matricule = serializers.CharField(source='employee.matricule', read_only=True)
    type_display = serializers.CharField(source='get_type_display', read_only=True)
    is_expiring_soon = serializers.ReadOnlyField()
    is_expired = serializers.ReadOnlyField()
    
    class Meta:
        model = Contract
        fields = ['id', 'employee', 'employee_name', 'employee_matricule', 'type', 'type_display',
                 'date_debut', 'date_fin', 'salaire', 'active', 'is_expiring_soon', 'is_expired']
        read_only_fields = ['id']

class TrainingSerializer(serializers.ModelSerializer):
    created_by_name = serializers.CharField(source='created_by.get_full_name', read_only=True)
    approved_by_name = serializers.CharField(source='approved_by.get_full_name', read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    employees_data = serializers.SerializerMethodField()
    duration_days = serializers.ReadOnlyField()
    is_active = serializers.ReadOnlyField()
    
    class Meta:
        model = Training
        fields = ['id', 'name', 'description', 'start_date', 'end_date', 'employees', 'employees_data',
                 'created_by', 'created_by_name', 'status', 'status_display', 'approved_by', 
                 'approved_by_name', 'approved_at', 'created_at', 'duration_days', 'is_active']
        read_only_fields = ['id', 'created_by', 'approved_by', 'approved_at', 'created_at']
    
    def get_employees_data(self, obj):
        return [
            {
                'id': emp.id,
                'matricule': emp.matricule,
                'name': emp.user.get_full_name(),
                'poste': emp.poste
            }
            for emp in obj.employees.all()
        ]

class EmployeeCreateSerializer(serializers.Serializer):
    username = serializers.CharField(max_length=150)
    email = serializers.EmailField()
    first_name = serializers.CharField(max_length=30)
    last_name = serializers.CharField(max_length=30)
    password = serializers.CharField(min_length=8)
    phone = serializers.CharField(max_length=20, required=False)
    matricule = serializers.CharField(max_length=30)
    poste = serializers.CharField(max_length=100, required=False)
    service = serializers.CharField(max_length=100, required=False)
    department = serializers.PrimaryKeyRelatedField(queryset=Department.objects.all(), required=False)
    date_embauche = serializers.DateField(required=False)
    
    def validate_username(self, value):
        from core.models import User
        if User.objects.filter(username=value).exists():
            raise serializers.ValidationError("Ce nom d'utilisateur existe déjà")
        return value
    
    def validate_matricule(self, value):
        if Employee.objects.filter(matricule=value).exists():
            raise serializers.ValidationError("Ce matricule existe déjà")
        return value