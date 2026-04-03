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
    path('events/<int:event_id>/approve/', views.approve_event, name='approve_event'),
    path('events/<int:event_id>/reject/', views.reject_event, name='reject_event'),
    path('system-management/', views.system_management, name='system_management'),
    path('kpi-dashboard/', views.kpi_dashboard, name='kpi_dashboard'),
]