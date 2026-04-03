from django.urls import path
from . import views

app_name = 'knowledge_management'

urlpatterns = [
    # Dashboard
    path('', views.dashboard, name='dashboard'),
    
    # Maîtrise de compétences
    path('skills/matrix/', views.skills_matrix, name='skills_matrix'),
    path('departments/matrix/', views.department_matrix, name='department_matrix'),
    path('skills/quick-update/<int:employee_id>/<int:skill_id>/', views.quick_skill_update, name='quick_skill_update'),
    path('skills/my/', views.employee_skills, name='my_skills'),
    path('skills/employee/<int:employee_id>/', views.employee_skills, name='employee_skills'),
    path('skills/update/<int:employee_id>/', views.update_employee_skill, name='add_employee_skill'),
    path('skills/update/<int:employee_id>/<int:skill_id>/', views.update_employee_skill, name='update_employee_skill'),
    
    # Polyvalence
    path('versatility/', views.versatility_matrix, name='versatility_matrix'),
    path('versatility/quick-update/<int:employee_id>/<int:position_id>/', views.quick_position_update, name='quick_position_update'),
    path('versatility/update/<int:employee_id>/', views.update_employee_position, name='add_employee_position'),
    path('versatility/update/<int:employee_id>/<int:position_id>/', views.update_employee_position, name='update_employee_position'),
    
    # Gestion des connaissances
    path('documents/', views.documents_list, name='documents_list'),
    path('documents/upload/', views.upload_document, name='upload_document'),
    path('documents/<int:document_id>/', views.document_detail, name='document_detail'),
    
    # Recommandations
    path('recommendations/', views.my_recommendations, name='my_recommendations'),
    
    # Administration
    path('manage/', views.manage_skills_positions, name='manage_skills_positions'),
]