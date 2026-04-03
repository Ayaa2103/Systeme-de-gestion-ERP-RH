from django.contrib import admin
from .models import CompanyPage, EmployeeSuggestion

@admin.register(CompanyPage)
class CompanyPageAdmin(admin.ModelAdmin):
    list_display = ['page_type', 'title', 'last_updated', 'updated_by']
    list_filter = ['page_type', 'last_updated']
    search_fields = ['title', 'content']

@admin.register(EmployeeSuggestion)
class EmployeeSuggestionAdmin(admin.ModelAdmin):
    list_display = ['title', 'employee', 'date', 'status', 'responded_by']
    list_filter = ['status', 'date']
    search_fields = ['title', 'suggestion_text', 'employee__first_name', 'employee__last_name']
    readonly_fields = ['date']