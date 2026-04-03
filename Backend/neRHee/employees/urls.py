from django.urls import path
from . import views

urlpatterns = [
    path('', views.employee_list, name='employee_list'),
    path('<int:employee_id>/', views.employee_detail, name='employee_detail'),
    path('<int:employee_id>/edit/', views.edit_employee, name='edit_employee'),
    path('<int:employee_id>/delete/', views.delete_employee, name='delete_employee'),
    path('<int:employee_id>/create-contract/', views.create_contract, name='create_contract'),
    path('create/', views.create_employee, name='create_employee'),
    path('contracts/', views.manage_contracts, name='manage_contracts'),
    path('contracts/create/', views.create_contract_general, name='create_contract_general'),
    path('contracts/expiring/', views.expiring_contracts, name='expiring_contracts'),
    path('contract/<int:contract_id>/', views.contract_detail, name='contract_detail'),
    path('contract/<int:contract_id>/edit/', views.edit_contract, name='edit_contract'),
    path('contract/<int:contract_id>/renew/', views.renew_contract, name='renew_contract'),
    path('training/', views.manage_training, name='manage_training'),
    path('training/create/', views.create_training, name='create_training'),
    path('training/<int:training_id>/approve/', views.approve_training, name='approve_training'),
    path('training/<int:training_id>/reject/', views.reject_training, name='reject_training'),
    path('training/<int:training_id>/detail/', views.training_detail, name='training_detail'),
    path('my-trainings/', views.my_trainings, name='my_trainings'),
    path('my-trainings/<int:training_id>/', views.employee_training_detail, name='employee_training_detail'),
]