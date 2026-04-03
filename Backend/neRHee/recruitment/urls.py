from django.urls import path
from . import views

app_name = 'recruitment'

urlpatterns = [
    # Dashboard
    path('', views.recruitment_dashboard, name='recruitment_dashboard'),
    
    # Job Offers Management (HR Manager/Director)
    path('job-offers/', views.job_offer_list, name='job_offer_list'),
    path('job-offers/create/', views.job_offer_create, name='job_offer_create'),
    path('job-offers/<int:pk>/', views.job_offer_detail, name='job_offer_detail'),
    path('job-offers/<int:pk>/edit/', views.job_offer_edit, name='job_offer_edit'),
    path('job-offers/<int:pk>/publish/', views.job_offer_publish, name='job_offer_publish'),
    path('job-offers/<int:pk>/close/', views.job_offer_close, name='job_offer_close'),
    
    # Applications Management (HR Manager/Director)
    path('applications/', views.application_list, name='application_list'),
    path('applications/<int:pk>/', views.application_detail, name='application_detail'),
    path('applications/<int:pk>/update-status/', views.application_update_status, name='application_update_status'),
    
    # Interviews Management (HR Manager/Director)
    path('applications/<int:application_pk>/interview/create/', views.interview_create, name='interview_create'),
    path('interviews/<int:pk>/', views.interview_detail, name='interview_detail'),
    path('interviews/<int:pk>/feedback/', views.interview_feedback, name='interview_feedback'),
    
    # Public URLs (for candidates)
    path('jobs/', views.public_job_offers, name='public_job_offers'),
    path('jobs/<int:pk>/', views.public_job_detail, name='public_job_detail'),
    path('jobs/<int:pk>/apply/', views.apply_job, name='apply_job'),
    
    # Profile Recommendation
    path('recommend/<int:job_offer_id>/', views.recommend_profile, name='recommend_profile'),
    path('recommendations/', views.profile_recommendations, name='profile_recommendations'),
    path('recommendations/<int:recommendation_id>/update/', views.update_recommendation_status, name='update_recommendation_status'),
]