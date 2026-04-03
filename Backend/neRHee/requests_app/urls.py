from django.urls import path
from . import views

urlpatterns = [
    path('my-requests/', views.my_requests, name='my_requests'),
    path('create-leave/', views.create_leave_request, name='create_leave_request'),
    path('create-attestation/', views.create_attestation_request, name='create_attestation_request'),
    path('create-mission/', views.create_mission_request, name='create_mission_request'),
    path('create-payslip/', views.create_payslip_request, name='create_payslip_request'),
    path('manage/', views.manage_requests, name='manage_requests'),
    path('approve/<str:request_type>/<int:request_id>/', views.approve_request, name='approve_request'),
    path('reject/<str:request_type>/<int:request_id>/', views.reject_request, name='reject_request'),
]