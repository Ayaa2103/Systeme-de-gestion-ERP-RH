from rest_framework import serializers
from .models import Skill, Position, EmployeeSkill, EmployeePosition, Document, DepartmentSkillMatrix
from employees.models import Department

class SkillSerializer(serializers.ModelSerializer):
    departments_names = serializers.SerializerMethodField()
    
    class Meta:
        model = Skill
        fields = ['id', 'name', 'description', 'category', 'is_core_skill', 
                 'created_at', 'departments', 'departments_names']
        read_only_fields = ['id', 'created_at']
    
    def get_departments_names(self, obj):
        return [dept.name for dept in obj.departments.all()]

class PositionSerializer(serializers.ModelSerializer):
    department_name = serializers.CharField(source='department.name', read_only=True)
    required_skills_count = serializers.SerializerMethodField()
    
    class Meta:
        model = Position
        fields = ['id', 'name', 'description', 'department', 'department_name', 'required_skills_count']
        read_only_fields = ['id']
    
    def get_required_skills_count(self, obj):
        return obj.required_skills.count()

class EmployeeSkillSerializer(serializers.ModelSerializer):
    skill_name = serializers.CharField(source='skill.name', read_only=True)
    skill_category = serializers.CharField(source='skill.category', read_only=True)
    employee_name = serializers.CharField(source='employee.user.get_full_name', read_only=True)
    updated_by_name = serializers.CharField(source='updated_by.get_full_name', read_only=True)
    level_display = serializers.CharField(source='get_level_display', read_only=True)
    
    class Meta:
        model = EmployeeSkill
        fields = ['id', 'employee', 'employee_name', 'skill', 'skill_name', 'skill_category',
                 'level', 'level_display', 'certified', 'certification_date', 
                 'last_updated', 'updated_by', 'updated_by_name']
        read_only_fields = ['id', 'last_updated']

class EmployeePositionSerializer(serializers.ModelSerializer):
    position_name = serializers.CharField(source='position.name', read_only=True)
    employee_name = serializers.CharField(source='employee.user.get_full_name', read_only=True)
    updated_by_name = serializers.CharField(source='updated_by.get_full_name', read_only=True)
    autonomy_level_display = serializers.CharField(source='get_autonomy_level_display', read_only=True)
    
    class Meta:
        model = EmployeePosition
        fields = ['id', 'employee', 'employee_name', 'position', 'position_name',
                 'autonomy_level', 'autonomy_level_display', 'is_current', 
                 'start_date', 'end_date', 'last_updated', 'updated_by', 'updated_by_name']
        read_only_fields = ['id', 'last_updated']

class DocumentSerializer(serializers.ModelSerializer):
    created_by_name = serializers.CharField(source='created_by.get_full_name', read_only=True)
    category_display = serializers.CharField(source='get_category_display', read_only=True)
    
    class Meta:
        model = Document
        fields = ['id', 'title', 'description', 'category', 'category_display', 
                 'file', 'version', 'created_by', 'created_by_name', 
                 'created_at', 'updated_at', 'is_active']
        read_only_fields = ['id', 'created_at', 'updated_at']

class DepartmentSkillMatrixSerializer(serializers.ModelSerializer):
    department_name = serializers.CharField(source='department.name', read_only=True)
    skill_name = serializers.CharField(source='skill.name', read_only=True)
    priority_display = serializers.CharField(source='get_priority_display', read_only=True)
    
    class Meta:
        model = DepartmentSkillMatrix
        fields = ['id', 'department', 'department_name', 'skill', 'skill_name',
                 'target_coverage', 'priority', 'priority_display']
        read_only_fields = ['id']