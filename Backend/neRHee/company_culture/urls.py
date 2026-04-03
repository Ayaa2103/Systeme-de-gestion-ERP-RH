from django.urls import path
from . import views

urlpatterns = [
    # Dashboard
    path('', views.culture_dashboard, name='culture_dashboard'),
    
    # Company Pages
    path('page/<str:page_type>/', views.company_page_view, name='company_page_view'),
    path('page/<str:page_type>/edit/', views.company_page_edit, name='company_page_edit'),
    
    # Suggestions
    path('suggestions/', views.my_suggestions, name='my_suggestions'),
    path('suggestions/submit/', views.submit_suggestion, name='submit_suggestion'),
    path('suggestions/manage/', views.manage_suggestions, name='manage_suggestions'),
    path('suggestions/<int:pk>/respond/', views.respond_suggestion, name='respond_suggestion'),
]