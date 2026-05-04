from django.urls import path
from . import views

urlpatterns = [
    path('login/', views.user_login, name='login'),
    path('logout/', views.user_logout, name='logout'),
    path('dashboard/', views.dashboard, name='dashboard'),
    path('profile/', views.profile, name='profile'),
    path('hr-policies/', views.hr_policies, name='hr_policies'),
    path('hr-policies/create/', views.create_policy, name='create_policy'),
    path('hr-policies/<int:policy_id>/edit/', views.edit_policy, name='edit_policy'),
    path('events/', views.manage_events, name='manage_events'),
    path('events/create/', views.create_event, name='create_event'),
    path('events/<int:event_id>/', views.event_detail, name='event_detail'),
    path('events/<int:event_id>/approve/', views.approve_event, name='approve_event'),
    path('events/<int:event_id>/reject/', views.reject_event, name='reject_event'),
    path('users/', views.manage_users, name='manage_users'),
    path('users/create/', views.admin_create_user, name='admin_create_user'),
    path('users/<int:user_id>/edit/', views.admin_edit_user, name='admin_edit_user'),
    path('users/<int:user_id>/toggle/', views.admin_toggle_user, name='admin_toggle_user'),
    path('system-management/', views.system_management, name='system_management'),
    path('system-management/structures/', views.department_structure_management, name='department_structure_management'),
    path('system-management/structures/departments/create/', views.department_create, name='department_create'),
    path('system-management/structures/departments/<int:department_id>/edit/', views.department_edit, name='department_edit'),
    path('system-management/structures/positions/create/', views.position_create, name='position_create'),
    path('system-management/structures/positions/<int:position_id>/edit/', views.position_edit, name='position_edit'),
    path('kpi-dashboard/', views.kpi_dashboard, name='kpi_dashboard'),
]
