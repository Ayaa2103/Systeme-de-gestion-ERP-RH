from django.contrib import admin
from .models import Employee, Contract, Training, Department

@admin.register(Department)
class DepartmentAdmin(admin.ModelAdmin):
    list_display = ('name', 'code', 'manager', 'created_at')
    list_filter = ('created_at',)
    search_fields = ('name', 'code', 'description')

@admin.register(Employee)
class EmployeeAdmin(admin.ModelAdmin):
    list_display = ('matricule', 'user', 'poste', 'service', 'department', 'date_embauche', 'statut')
    list_filter = ('statut', 'service', 'department', 'date_embauche')
    search_fields = ('matricule', 'user__username', 'user__first_name', 'user__last_name')
    
    def get_queryset(self, request):
        return super().get_queryset(request).select_related('user', 'department')

@admin.register(Contract)
class ContractAdmin(admin.ModelAdmin):
    list_display = ('employee', 'type', 'date_debut', 'date_fin', 'salaire', 'active')
    list_filter = ('type', 'active', 'date_debut')
    search_fields = ('employee__matricule', 'employee__user__username')

@admin.register(Training)
class TrainingAdmin(admin.ModelAdmin):
    list_display = ('name', 'start_date', 'end_date', 'created_by')
    list_filter = ('start_date', 'end_date')
    search_fields = ('name', 'description')
    filter_horizontal = ('employees',)