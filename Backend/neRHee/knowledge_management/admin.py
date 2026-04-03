from django.contrib import admin
from .models import (
    Skill, Position, EmployeeSkill, EmployeePosition, Document, DocumentVersion, 
    TrainingRecommendation, DepartmentSkillMatrix, PositionSkillRequirement
)

@admin.register(Skill)
class SkillAdmin(admin.ModelAdmin):
    list_display = ['name', 'category', 'is_core_skill', 'created_at']
    list_filter = ['category', 'is_core_skill', 'created_at']
    search_fields = ['name', 'description']
    filter_horizontal = ['departments']

@admin.register(Position)
class PositionAdmin(admin.ModelAdmin):
    list_display = ['name', 'department']
    list_filter = ['department']
    search_fields = ['name', 'description']

@admin.register(EmployeeSkill)
class EmployeeSkillAdmin(admin.ModelAdmin):
    list_display = ['employee', 'skill', 'level', 'certified', 'last_updated']
    list_filter = ['level', 'certified', 'skill__category', 'last_updated']
    search_fields = ['employee__user__first_name', 'employee__user__last_name', 'skill__name']

@admin.register(EmployeePosition)
class EmployeePositionAdmin(admin.ModelAdmin):
    list_display = ['employee', 'position', 'autonomy_level', 'is_current', 'last_updated']
    list_filter = ['autonomy_level', 'is_current', 'position__department', 'last_updated']
    search_fields = ['employee__user__first_name', 'employee__user__last_name', 'position__name']

@admin.register(Document)
class DocumentAdmin(admin.ModelAdmin):
    list_display = ['title', 'category', 'version', 'created_by', 'created_at', 'is_active']
    list_filter = ['category', 'is_active', 'created_at']
    search_fields = ['title', 'description']

@admin.register(DocumentVersion)
class DocumentVersionAdmin(admin.ModelAdmin):
    list_display = ['document', 'version', 'created_by', 'created_at']
    list_filter = ['created_at']
    search_fields = ['document__title', 'version']

@admin.register(DepartmentSkillMatrix)
class DepartmentSkillMatrixAdmin(admin.ModelAdmin):
    list_display = ['department', 'skill', 'target_coverage', 'priority']
    list_filter = ['department', 'priority', 'skill__category']
    search_fields = ['department__name', 'skill__name']

@admin.register(PositionSkillRequirement)
class PositionSkillRequirementAdmin(admin.ModelAdmin):
    list_display = ['position', 'skill', 'minimum_level', 'is_mandatory']
    list_filter = ['minimum_level', 'is_mandatory', 'position__department']
    search_fields = ['position__name', 'skill__name']

@admin.register(TrainingRecommendation)
class TrainingRecommendationAdmin(admin.ModelAdmin):
    list_display = ['employee', 'skill', 'position', 'priority', 'status', 'created_at']
    list_filter = ['status', 'priority', 'created_at']
    search_fields = ['employee__user__first_name', 'employee__user__last_name']