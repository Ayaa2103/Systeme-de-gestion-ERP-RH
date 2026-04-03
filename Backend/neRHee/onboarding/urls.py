from django.urls import path
from . import views

urlpatterns = [
    # Dashboard
    path('', views.onboarding_dashboard, name='onboarding_dashboard'),
    
    # Employee Onboarding Management
    path('employees/', views.employee_onboarding_list, name='employee_onboarding_list'),
    path('employees/<int:pk>/start/', views.start_onboarding, name='start_onboarding'),
    path('employees/<int:pk>/', views.employee_onboarding_detail, name='employee_onboarding_detail'),
    
    # Checklist Management (HR Manager + Assigned Manager)
    path('employees/<int:pk>/checklist/', views.checklist_view, name='checklist_view'),
    path('checklist-item/<int:pk>/toggle/', views.toggle_checklist_item, name='toggle_checklist_item'),
    
    # Progress Tracking (HR Manager only)
    path('progress/', views.progress_overview, name='progress_overview'),
    
    # Add employee to onboarding
    path('select-employee/', views.select_employee_for_onboarding, name='select_employee_for_onboarding'),
    

    
    # Task Management
    path('task/<int:pk>/complete/', views.complete_task, name='complete_task'),
    
    # Training Management
    path('training/<int:pk>/complete/', views.complete_training, name='complete_training'),
    
    # Follow-up Management
    path('followup/<int:pk>/conduct/', views.conduct_followup, name='conduct_followup'),
    
    # Employee Portal
    path('my-onboarding/', views.employee_onboarding_portal, name='employee_onboarding_portal'),
    

]