from django.urls import path, include
from core.api_views import (
    login_api, dashboard_stats, events_list, create_event, approve_event, reject_event,
    hr_policies_list, new_employees_today, recent_job_offers, health_check, employee_dashboard_data, kpi_data,
    users_list, create_user, update_user, reset_user_password, toggle_user_active,
)
from employees.api_views import (
    employees_list, employee_detail, create_employee, update_employee, delete_employee,
    contracts_list, create_contract, contract_detail, update_contract, renew_contract, expiring_contracts,
    trainings_list, create_training, approve_training, reject_training,
    departments_list, positions_list, employee_contracts, employee_trainings, my_trainings, my_profile
)
from requests_app.api_views import (
    pending_requests, my_requests, create_leave_request, create_attestation_request,
    create_mission_request, create_payslip_request, approve_request, reject_request
)
from recruitment.api_views import (
    job_offers_list, create_job_offer, job_offer_detail, update_job_offer, publish_job_offer, close_job_offer,
    applications_list, application_detail, update_application_status, create_interview, submit_interview_feedback,
    profile_recommendations_list, update_recommendation_status, recruitment_dashboard_stats,
    public_job_offers, public_job_detail, apply_to_job, recommend_profile
)
from company_culture.api_views import CompanyPageViewSet, EmployeeSuggestionViewSet
from knowledge_management.api_views import (
    knowledge_dashboard_stats, skills_list, create_skill, positions_list, create_position,
    skills_matrix, update_employee_skill, versatility_matrix, update_employee_position,
    documents_list, upload_document, employee_skills, employee_documents
)
from onboarding.api_views import (
    OnboardingPlanViewSet, ChecklistItemViewSet, new_employees_today, onboarding_stats, start_employee_onboarding, all_employees, onboarding_employees_list, employee_checklist, employee_trainings, complete_training, my_onboarding
)
from rest_framework.routers import DefaultRouter

urlpatterns = [
    # Health check
    path('health/', health_check, name='health_check'),
    
    # Authentication
    path('auth/login/', login_api, name='api_login'),
    
    # Dashboard
    path('dashboard/stats/', dashboard_stats, name='dashboard_stats'),
    
    # Events
    path('events/', events_list, name='events_list'),
    path('events/create/', create_event, name='create_event'),
    path('events/<int:event_id>/approve/', approve_event, name='approve_event'),
    path('events/<int:event_id>/reject/', reject_event, name='reject_event'),
    
    # HR Policies
    path('hr-policies/', hr_policies_list, name='hr_policies_list'),
    
    # Dashboard data  
    path('dashboard/new-employees-today/', new_employees_today, name='new_employees_today'),
    path('dashboard/recent-job-offers/', recent_job_offers, name='recent_job_offers'),
    path('dashboard/employee-data/', employee_dashboard_data, name='employee_dashboard_data'),
    
    # KPI Dashboard
    path('kpi/', kpi_data, name='kpi_data'),

    # User management (admin only)
    path('users/', users_list, name='users_list'),
    path('users/create/', create_user, name='create_user'),
    path('users/<int:user_id>/update/', update_user, name='update_user'),
    path('users/<int:user_id>/reset-password/', reset_user_password, name='reset_user_password'),
    path('users/<int:user_id>/toggle-active/', toggle_user_active, name='toggle_user_active'),
    
    # Employees
    path('employees/', employees_list, name='api_employees_list'),
    path('employees/<int:employee_id>/', employee_detail, name='api_employee_detail'),
    path('employees/create/', create_employee, name='api_create_employee'),
    path('employees/<int:employee_id>/update/', update_employee, name='api_update_employee'),
    path('employees/<int:employee_id>/delete/', delete_employee, name='api_delete_employee'),
    
    # Departments
    path('departments/', departments_list, name='departments_list'),
    path('positions/', positions_list, name='positions_list'),
    
    # Employee details
    path('employees/<int:employee_id>/contracts/', employee_contracts, name='employee_contracts'),
    path('employees/<int:employee_id>/trainings/', employee_trainings, name='employee_trainings'),
    path('employees/my-trainings/', my_trainings, name='my_trainings'),
    path('employees/my-profile/', my_profile, name='my_profile'),
    
    # Contracts
    path('contracts/', contracts_list, name='contracts_list'),
    path('contracts/create/', create_contract, name='create_contract'),
    path('contracts/<int:contract_id>/', contract_detail, name='contract_detail'),
    path('contracts/<int:contract_id>/update/', update_contract, name='update_contract'),
    path('contracts/<int:contract_id>/renew/', renew_contract, name='renew_contract'),
    path('contracts/expiring/', expiring_contracts, name='expiring_contracts'),
    
    # Trainings
    path('trainings/', trainings_list, name='trainings_list'),
    path('trainings/create/', create_training, name='create_training'),
    path('trainings/<int:training_id>/approve/', approve_training, name='approve_training'),
    path('trainings/<int:training_id>/reject/', reject_training, name='reject_training'),
    
    # Requests
    path('requests/pending/', pending_requests, name='pending_requests'),
    path('requests/my/', my_requests, name='my_requests'),
    path('requests/leave/create/', create_leave_request, name='create_leave_request'),
    path('requests/attestation/create/', create_attestation_request, name='create_attestation_request'),
    path('requests/mission/create/', create_mission_request, name='create_mission_request'),
    path('requests/payslip/create/', create_payslip_request, name='create_payslip_request'),
    path('requests/<str:request_type>/<int:request_id>/approve/', approve_request, name='approve_request'),
    path('requests/<str:request_type>/<int:request_id>/reject/', reject_request, name='reject_request'),
    
    # Recruitment
    path('recruitment/job-offers/', job_offers_list, name='job_offers_list'),
    path('recruitment/job-offers/create/', create_job_offer, name='create_job_offer'),
    path('recruitment/job-offers/<int:job_offer_id>/', job_offer_detail, name='job_offer_detail'),
    path('recruitment/job-offers/<int:job_offer_id>/update/', update_job_offer, name='update_job_offer'),
    path('recruitment/job-offers/<int:job_offer_id>/publish/', publish_job_offer, name='publish_job_offer'),
    path('recruitment/job-offers/<int:job_offer_id>/close/', close_job_offer, name='close_job_offer'),
    path('recruitment/applications/', applications_list, name='applications_list'),
    path('recruitment/applications/<int:application_id>/', application_detail, name='application_detail'),
    path('recruitment/applications/<int:application_id>/update-status/', update_application_status, name='update_application_status'),
    path('recruitment/applications/<int:application_id>/interviews/create/', create_interview, name='create_interview'),
    path('recruitment/interviews/<int:interview_id>/feedback/', submit_interview_feedback, name='submit_interview_feedback'),
    path('recruitment/profile-recommendations/', profile_recommendations_list, name='profile_recommendations_list'),
    path('recruitment/profile-recommendations/<int:recommendation_id>/update-status/', update_recommendation_status, name='update_recommendation_status'),
    path('recruitment/dashboard/stats/', recruitment_dashboard_stats, name='recruitment_dashboard_stats'),
    
    # Knowledge Management
    path('knowledge/dashboard/stats/', knowledge_dashboard_stats, name='knowledge_dashboard_stats'),
    path('knowledge/skills/', skills_list, name='skills_list'),
    path('knowledge/skills/create/', create_skill, name='create_skill'),
    path('knowledge/positions/', positions_list, name='positions_list'),
    path('knowledge/positions/create/', create_position, name='create_position'),
    path('knowledge/skills-matrix/', skills_matrix, name='skills_matrix'),
    path('knowledge/employees/<int:employee_id>/skills/<int:skill_id>/', update_employee_skill, name='update_employee_skill'),
    path('knowledge/versatility-matrix/', versatility_matrix, name='versatility_matrix'),
    path('knowledge/employees/<int:employee_id>/positions/<int:position_id>/', update_employee_position, name='update_employee_position'),
    path('knowledge/documents/', documents_list, name='documents_list'),
    path('knowledge/documents/upload/', upload_document, name='upload_document'),
    
    # Employee Knowledge Access
    path('knowledge/employee/skills/', employee_skills, name='employee_skills'),
    path('knowledge/employee/documents/', employee_documents, name='employee_documents'),
    
    # Public Job Offers for Employees
    path('recruitment/public-jobs/', public_job_offers, name='public_job_offers'),
    path('recruitment/public-jobs/<int:job_offer_id>/', public_job_detail, name='public_job_detail'),
    path('recruitment/public-jobs/<int:job_offer_id>/apply/', apply_to_job, name='apply_to_job'),
    path('recruitment/public-jobs/<int:job_offer_id>/recommend/', recommend_profile, name='recommend_profile'),
    
    # Onboarding
    path('onboarding/stats/', onboarding_stats, name='onboarding_stats'),
    path('onboarding/new-employees/', new_employees_today, name='new_employees_today'),
    path('onboarding/start/', start_employee_onboarding, name='start_employee_onboarding'),
    path('onboarding/employees/', all_employees, name='all_employees'),
    path('onboarding/employees-list/', onboarding_employees_list, name='onboarding_employees_list'),
    path('onboarding/employee/<int:employee_id>/checklist/', employee_checklist, name='employee_checklist'),
    path('onboarding/employee/<int:employee_id>/trainings/', employee_trainings, name='employee_trainings'),
    path('onboarding/training/<int:training_id>/complete/', complete_training, name='complete_training'),
    path('onboarding/my-onboarding/', my_onboarding, name='my_onboarding'),
]

# Router for ViewSets
router = DefaultRouter()
router.register(r'company-pages', CompanyPageViewSet)
router.register(r'suggestions', EmployeeSuggestionViewSet)
router.register(r'onboarding/plans', OnboardingPlanViewSet)
router.register(r'onboarding/checklist', ChecklistItemViewSet)

urlpatterns += router.urls