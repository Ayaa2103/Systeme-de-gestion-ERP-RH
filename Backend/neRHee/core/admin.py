from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import User, HRPolicy, Event

@admin.register(User)
class CustomUserAdmin(UserAdmin):
    list_display = ('username', 'email', 'first_name', 'last_name', 'role', 'is_staff')
    list_filter = ('role', 'is_staff', 'is_superuser', 'is_active')
    fieldsets = UserAdmin.fieldsets + (
        ('Additional Info', {'fields': ('phone', 'role')}),
    )
    add_fieldsets = UserAdmin.add_fieldsets + (
        ('Additional Info', {'fields': ('phone', 'role')}),
    )

@admin.register(HRPolicy)
class HRPolicyAdmin(admin.ModelAdmin):
    list_display = ('name', 'created_by', 'created_at', 'is_active')
    list_filter = ('is_active', 'created_at')
    search_fields = ('name', 'description')



@admin.register(Event)
class EventAdmin(admin.ModelAdmin):
    list_display = ('name', 'date', 'location', 'created_by', 'status', 'created_at')
    list_filter = ('status', 'date', 'created_at')
    search_fields = ('name', 'description', 'location')
    readonly_fields = ('created_at', 'approved_at')