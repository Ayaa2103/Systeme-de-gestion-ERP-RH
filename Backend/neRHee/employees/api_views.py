from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from django.shortcuts import get_object_or_404
from django.utils import timezone
from django.db import models
from datetime import date, timedelta
from .models import Employee, Contract, Training, Department
from .serializers import EmployeeSerializer, ContractSerializer, TrainingSerializer, DepartmentSerializer
from core.models import User
from core.notifications import create_notification

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def employees_list(request):
    """Liste des employés avec filtres"""
    if request.user.role not in ['hr_manager', 'hr_director', 'administrator']:
        return Response({'error': 'Permission denied'}, status=status.HTTP_403_FORBIDDEN)
    
    employees = Employee.objects.select_related('user', 'department').all()
    
    # Filtres
    status_filter = request.GET.get('status')
    department_filter = request.GET.get('department')
    search = request.GET.get('search')
    
    if status_filter:
        employees = employees.filter(statut=status_filter)
    if department_filter:
        employees = employees.filter(department_id=department_filter)
    if search:
        employees = employees.filter(
            user__first_name__icontains=search
        ) | employees.filter(
            user__last_name__icontains=search
        ) | employees.filter(
            matricule__icontains=search
        )
    
    # Ajouter le statut d'absence pour chaque employé
    from employees.utils import is_employee_absent_today
    employees_data = []
    for employee in employees:
        employee_data = {
            'id': employee.id,
            'user': {
                'first_name': employee.user.first_name,
                'last_name': employee.user.last_name,
                'email': employee.user.email
            },
            'matricule': employee.matricule,
            'poste': employee.poste,
            'service': employee.service,
            'department_name': employee.department.name if employee.department else None,
            'date_embauche': employee.date_embauche,
            'statut': employee.statut,
            'photo': employee.photo.url if employee.photo else None,
            'onboarding_status': employee.onboarding_status,
            'is_absent_today': is_employee_absent_today(employee)
        }
        employees_data.append(employee_data)
    
    return Response(employees_data)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def employee_detail(request, employee_id):
    """Détail d'un employé avec compétences, formations et statut présence"""
    if request.user.role not in ['hr_manager', 'hr_director', 'administrator']:
        return Response({'error': 'Permission denied'}, status=status.HTTP_403_FORBIDDEN)
    
    try:
        employee = Employee.objects.select_related('user', 'department').get(id=employee_id)
        
        # Vérifier si l'employé est absent aujourd'hui
        from employees.utils import is_employee_absent_today
        is_absent = is_employee_absent_today(employee)
        
        # Récupérer les compétences
        try:
            from knowledge_management.models import EmployeeSkill
            skills = EmployeeSkill.objects.filter(employee=employee).select_related('skill')
            skills_data = []
            for skill in skills:
                skills_data.append({
                    'id': skill.id,
                    'skill_name': skill.skill.name,
                    'skill_category': skill.skill.category or 'Général',
                    'level': skill.level,
                    'level_display': skill.get_level_display(),
                    'certified': skill.certified,
                    'certification_date': skill.certification_date,
                    'last_updated': skill.last_updated
                })
        except Exception as e:
            print(f"Erreur compétences: {e}")
            skills_data = []
        
        # Récupérer les formations d'intégration
        try:
            from onboarding.models import OnboardingTraining
            onboarding_trainings = OnboardingTraining.objects.filter(employee=employee)
            onboarding_trainings_data = []
            for training in onboarding_trainings:
                onboarding_trainings_data.append({
                    'id': training.id,
                    'name': training.name,
                    'description': training.description,
                    'is_completed': training.is_completed,
                    'completion_date': training.completion_date,
                    'score': training.score
                })
        except:
            onboarding_trainings_data = []
        
        employee_data = {
            'id': employee.id,
            'user': {
                'first_name': employee.user.first_name,
                'last_name': employee.user.last_name,
                'email': employee.user.email,
                'phone': getattr(employee.user, 'phone', '')
            },
            'matricule': employee.matricule,
            'poste': employee.poste,
            'service': employee.service,
            'department_name': employee.department.name if employee.department else None,
            'date_embauche': employee.date_embauche,
            'statut': employee.statut,
            'photo': employee.photo.url if employee.photo else None,
            'assigned_manager': {
                'id': employee.assigned_manager.id,
                'name': employee.assigned_manager.user.get_full_name(),
                'matricule': employee.assigned_manager.matricule,
                'poste': employee.assigned_manager.poste
            } if employee.assigned_manager else None,
            'onboarding_status': employee.onboarding_status,
            'onboarding_progress': employee.onboarding_progress,
            'is_absent_today': is_absent,
            'skills': skills_data,
            'onboarding_trainings': onboarding_trainings_data
        }
        
        return Response(employee_data)
    except Employee.DoesNotExist:
        return Response({'error': 'Employee not found'}, status=status.HTTP_404_NOT_FOUND)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def create_employee(request):
    """Créer un nouvel employé"""
    if request.user.role not in ['hr_manager', 'administrator']:
        return Response({'error': 'Permission denied'}, status=status.HTTP_403_FORBIDDEN)
    
    # Créer l'utilisateur d'abord
    user_data = {
        'username': request.data.get('username'),
        'email': request.data.get('email'),
        'first_name': request.data.get('first_name'),
        'last_name': request.data.get('last_name'),
        'password': request.data.get('password', 'temp123'),
        'role': 'employee'
    }
    
    # Vérifier l'unicité
    if User.objects.filter(username=user_data['username']).exists():
        return Response({'error': 'Username already exists'}, status=status.HTTP_400_BAD_REQUEST)
    
    if Employee.objects.filter(matricule=request.data.get('matricule')).exists():
        return Response({'error': 'Matricule already exists'}, status=status.HTTP_400_BAD_REQUEST)
    
    try:
        user = User.objects.create_user(**user_data)

        # Le signal post_save crée automatiquement un Employee — on le récupère et on le met à jour
        try:
            employee = Employee.objects.get(user=user)
        except Employee.DoesNotExist:
            employee = Employee(user=user)

        employee.matricule = request.data.get('matricule', employee.matricule)
        employee.poste = request.data.get('poste', '')
        employee.service = request.data.get('service', '')
        employee.date_embauche = request.data.get('date_embauche') or None

        department_id = request.data.get('department')
        if department_id:
            employee.department_id = department_id

        employee.save()

        serializer = EmployeeSerializer(employee)
        return Response(serializer.data, status=status.HTTP_201_CREATED)

    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

@api_view(['PUT'])
@permission_classes([IsAuthenticated])
def update_employee(request, employee_id):
    """Modifier un employé"""
    if request.user.role not in ['hr_manager', 'hr_director', 'administrator']:
        return Response({'error': 'Permission denied'}, status=status.HTTP_403_FORBIDDEN)
    
    employee = get_object_or_404(Employee, id=employee_id)
    
    # Mettre à jour les données utilisateur
    user = employee.user
    user.first_name = request.data.get('first_name', user.first_name)
    user.last_name = request.data.get('last_name', user.last_name)
    user.email = request.data.get('email', user.email)
    user.phone = request.data.get('phone', user.phone)
    user.save()
    
    # Mettre à jour les données employé
    serializer = EmployeeSerializer(employee, data=request.data, partial=True)
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def delete_employee(request, employee_id):
    """Supprimer un employé (administrateur seulement)"""
    if request.user.role != 'administrator':
        return Response({'error': 'Permission denied'}, status=status.HTTP_403_FORBIDDEN)
    
    try:
        employee = get_object_or_404(Employee, id=employee_id)
        user = employee.user
        
        # Supprimer l'employé et l'utilisateur associé
        employee.delete()
        user.delete()
        
        return Response({'message': 'Employee deleted successfully'}, status=status.HTTP_204_NO_CONTENT)
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def contracts_list(request):
    """Liste des contrats"""
    if request.user.role not in ['hr_manager', 'hr_director', 'administrator']:
        return Response({'error': 'Permission denied'}, status=status.HTTP_403_FORBIDDEN)
    
    contracts = Contract.objects.select_related('employee__user').all()
    
    # Filtres
    employee_filter = request.GET.get('employee')
    type_filter = request.GET.get('type')
    active_filter = request.GET.get('active')
    
    if employee_filter:
        contracts = contracts.filter(employee_id=employee_filter)
    if type_filter:
        contracts = contracts.filter(type=type_filter)
    if active_filter:
        contracts = contracts.filter(active=active_filter.lower() == 'true')
    
    serializer = ContractSerializer(contracts, many=True)
    return Response(serializer.data)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def create_contract(request):
    """Créer un contrat"""
    if request.user.role not in ['hr_manager', 'hr_director']:
        return Response({'error': 'Permission denied'}, status=status.HTTP_403_FORBIDDEN)
    
    try:
        serializer = ContractSerializer(data=request.data)
        if serializer.is_valid():
            contract = serializer.save()
            create_notification(
                contract.employee.user,
                title='Nouveau contrat',
                message=f"Un contrat {contract.type} a été créé pour vous.",
                notification_type='contract_created',
                actor=request.user,
                link='/profile',
            )
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response({'error': 'Données invalides', 'details': serializer.errors}, status=status.HTTP_400_BAD_REQUEST)
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def contract_detail(request, contract_id):
    """Détail d'un contrat"""
    if request.user.role not in ['hr_manager', 'hr_director', 'administrator']:
        return Response({'error': 'Permission denied'}, status=status.HTTP_403_FORBIDDEN)
    
    contract = get_object_or_404(Contract, id=contract_id)
    serializer = ContractSerializer(contract)
    return Response(serializer.data)

@api_view(['PUT'])
@permission_classes([IsAuthenticated])
def update_contract(request, contract_id):
    """Modifier un contrat"""
    if request.user.role not in ['hr_manager', 'hr_director']:
        return Response({'error': 'Permission denied'}, status=status.HTTP_403_FORBIDDEN)
    
    try:
        contract = get_object_or_404(Contract, id=contract_id)
        
        # Nettoyer les données
        data = request.data.copy()
        if 'salaire' in data and data['salaire'] == '':
            data['salaire'] = None
        if 'date_fin' in data and data['date_fin'] == '':
            data['date_fin'] = None
            
        serializer = ContractSerializer(contract, data=data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response({'error': 'Données invalides', 'details': serializer.errors}, status=status.HTTP_400_BAD_REQUEST)
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def renew_contract(request, contract_id):
    """Renouveler un contrat"""
    if request.user.role not in ['hr_manager', 'hr_director']:
        return Response({'error': 'Permission denied'}, status=status.HTTP_403_FORBIDDEN)
    
    try:
        old_contract = get_object_or_404(Contract, id=contract_id)
        
        # Nettoyer les données
        data = request.data.copy()
        if 'salaire' in data and data['salaire'] == '':
            data['salaire'] = None
        if 'date_fin' in data and data['date_fin'] == '':
            data['date_fin'] = None
        
        # Désactiver l'ancien contrat
        old_contract.active = False
        old_contract.save()
        
        # Créer le nouveau contrat
        new_contract_data = {
            'employee': old_contract.employee.id,
            'type': data.get('type', old_contract.type),
            'date_debut': data.get('date_debut'),
            'date_fin': data.get('date_fin'),
            'salaire': data.get('salaire', old_contract.salaire),
            'active': True
        }
        
        serializer = ContractSerializer(data=new_contract_data)
        if serializer.is_valid():
            new_contract = serializer.save()
            create_notification(
                new_contract.employee.user,
                title='Contrat renouvelé',
                message=f"Votre contrat a été renouvelé ({new_contract.type}).",
                notification_type='contract_renewed',
                actor=request.user,
                link='/profile',
            )
            return Response(ContractSerializer(new_contract).data, status=status.HTTP_201_CREATED)
        
        # Si erreur, réactiver l'ancien contrat
        old_contract.active = True
        old_contract.save()
        
        return Response({'error': 'Données invalides', 'details': serializer.errors}, status=status.HTTP_400_BAD_REQUEST)
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def expiring_contracts(request):
    """Contrats expirant bientôt"""
    if request.user.role not in ['hr_manager', 'hr_director', 'administrator']:
        return Response({'error': 'Permission denied'}, status=status.HTTP_403_FORBIDDEN)
    
    contracts = Contract.objects.filter(
        active=True,
        date_fin__lte=date.today() + timedelta(days=30),
        date_fin__gte=date.today()
    ).select_related('employee__user')
    
    serializer = ContractSerializer(contracts, many=True)
    return Response(serializer.data)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def trainings_list(request):
    """Liste des formations"""
    if request.user.role not in ['hr_manager', 'hr_director']:
        return Response({'error': 'Permission denied'}, status=status.HTTP_403_FORBIDDEN)
    
    if request.user.role == 'hr_director':
        trainings = Training.objects.all()
    else:
        trainings = Training.objects.filter(created_by=request.user)
    
    trainings = trainings.select_related('created_by', 'approved_by').prefetch_related('employees').order_by('-created_at')
    
    serializer = TrainingSerializer(trainings, many=True)
    return Response(serializer.data)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def create_training(request):
    """Créer une formation"""
    if request.user.role not in ['hr_manager', 'hr_director']:
        return Response({'error': 'Permission denied'}, status=status.HTTP_403_FORBIDDEN)
    
    data = request.data.copy()
    data['created_by'] = request.user.id
    data['status'] = 'pending'
    
    serializer = TrainingSerializer(data=data)
    if serializer.is_valid():
        training = serializer.save()
        
        # Ajouter les employés sélectionnés
        employee_ids = request.data.get('employee_ids', [])
        if employee_ids:
            employees = Employee.objects.filter(id__in=employee_ids)
            training.employees.set(employees)
        
        return Response(TrainingSerializer(training).data, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def approve_training(request, training_id):
    """Approuver une formation"""
    if request.user.role != 'hr_director':
        return Response({'error': 'Permission denied'}, status=status.HTTP_403_FORBIDDEN)
    
    training = get_object_or_404(Training, id=training_id)
    
    if training.status != 'pending':
        return Response({'error': 'Training already processed'}, status=status.HTTP_400_BAD_REQUEST)
    
    training.status = 'approved'
    training.approved_by = request.user
    training.approved_at = timezone.now()
    training.save()
    
    serializer = TrainingSerializer(training)
    return Response(serializer.data)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def reject_training(request, training_id):
    """Rejeter une formation"""
    if request.user.role != 'hr_director':
        return Response({'error': 'Permission denied'}, status=status.HTTP_403_FORBIDDEN)
    
    training = get_object_or_404(Training, id=training_id)
    
    if training.status != 'pending':
        return Response({'error': 'Training already processed'}, status=status.HTTP_400_BAD_REQUEST)
    
    training.status = 'rejected'
    training.approved_by = request.user
    training.approved_at = timezone.now()
    training.save()
    
    serializer = TrainingSerializer(training)
    return Response(serializer.data)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def departments_list(request):
    """Liste des départements"""
    departments = Department.objects.annotate(
        employee_count=models.Count('employees'),
        position_count=models.Count('positions'),
    ).all()
    data = []
    for d in departments:
        data.append({
            'id': d.id,
            'name': d.name,
            'code': d.code,
            'description': d.description,
            'manager_id': d.manager_id,
            'manager_name': d.manager.user.get_full_name() if d.manager else None,
            'employee_count': d.employee_count,
            'position_count': d.position_count,
        })
    return Response(data)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def create_department(request):
    if request.user.role not in ['administrator', 'hr_manager', 'hr_director']:
        return Response({'error': 'Permission refusée'}, status=status.HTTP_403_FORBIDDEN)
    name = request.data.get('name', '').strip()
    code = request.data.get('code', '').strip()
    description = request.data.get('description', '').strip()
    if not name or not code:
        return Response({'error': 'Nom et code sont requis'}, status=400)
    if Department.objects.filter(name=name).exists():
        return Response({'error': 'Ce nom de département existe déjà'}, status=400)
    if Department.objects.filter(code=code).exists():
        return Response({'error': 'Ce code existe déjà'}, status=400)
    dept = Department.objects.create(name=name, code=code, description=description)
    return Response({'id': dept.id, 'name': dept.name, 'code': dept.code, 'description': dept.description}, status=201)

@api_view(['PUT', 'PATCH'])
@permission_classes([IsAuthenticated])
def update_department(request, dept_id):
    if request.user.role not in ['administrator', 'hr_manager', 'hr_director']:
        return Response({'error': 'Permission refusée'}, status=status.HTTP_403_FORBIDDEN)
    dept = get_object_or_404(Department, id=dept_id)
    dept.name = request.data.get('name', dept.name).strip()
    dept.code = request.data.get('code', dept.code).strip()
    dept.description = request.data.get('description', dept.description).strip()
    if Department.objects.filter(name=dept.name).exclude(id=dept_id).exists():
        return Response({'error': 'Ce nom de département existe déjà'}, status=400)
    if Department.objects.filter(code=dept.code).exclude(id=dept_id).exists():
        return Response({'error': 'Ce code existe déjà'}, status=400)
    dept.save()
    return Response({'id': dept.id, 'name': dept.name, 'code': dept.code, 'description': dept.description})

@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def delete_department(request, dept_id):
    if request.user.role not in ['administrator', 'hr_manager', 'hr_director']:
        return Response({'error': 'Permission refusée'}, status=status.HTTP_403_FORBIDDEN)
    dept = get_object_or_404(Department, id=dept_id)
    dept.delete()
    return Response({'message': 'Département supprimé'})

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def positions_list(request):
    """Liste des postes avec info département"""
    try:
        from knowledge_management.models import Position
        positions = Position.objects.select_related('department').all().order_by('department__name', 'name')
        data = [{'id': p.id, 'name': p.name, 'description': p.description,
                 'department_id': p.department_id, 'department_name': p.department.name} for p in positions]
        return Response(data)
    except:
        return Response([])

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def create_position_api(request):
    if request.user.role not in ['administrator', 'hr_manager', 'hr_director']:
        return Response({'error': 'Permission refusée'}, status=status.HTTP_403_FORBIDDEN)
    from knowledge_management.models import Position
    name = request.data.get('name', '').strip()
    dept_id = request.data.get('department_id')
    description = request.data.get('description', '').strip()
    if not name or not dept_id:
        return Response({'error': 'Nom et département sont requis'}, status=400)
    dept = get_object_or_404(Department, id=dept_id)
    if Position.objects.filter(name=name, department=dept).exists():
        return Response({'error': 'Ce poste existe déjà dans ce département'}, status=400)
    pos = Position.objects.create(name=name, department=dept, description=description)
    return Response({'id': pos.id, 'name': pos.name, 'department_id': dept.id, 'department_name': dept.name, 'description': pos.description}, status=201)

@api_view(['PUT', 'PATCH'])
@permission_classes([IsAuthenticated])
def update_position_api(request, pos_id):
    if request.user.role not in ['administrator', 'hr_manager', 'hr_director']:
        return Response({'error': 'Permission refusée'}, status=status.HTTP_403_FORBIDDEN)
    from knowledge_management.models import Position
    pos = get_object_or_404(Position, id=pos_id)
    pos.name = request.data.get('name', pos.name).strip()
    pos.description = request.data.get('description', pos.description).strip()
    dept_id = request.data.get('department_id')
    if dept_id:
        pos.department = get_object_or_404(Department, id=dept_id)
    if Position.objects.filter(name=pos.name, department=pos.department).exclude(id=pos_id).exists():
        return Response({'error': 'Ce poste existe déjà dans ce département'}, status=400)
    pos.save()
    return Response({'id': pos.id, 'name': pos.name, 'department_id': pos.department_id, 'department_name': pos.department.name, 'description': pos.description})

@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def delete_position_api(request, pos_id):
    if request.user.role not in ['administrator', 'hr_manager', 'hr_director']:
        return Response({'error': 'Permission refusée'}, status=status.HTTP_403_FORBIDDEN)
    from knowledge_management.models import Position
    pos = get_object_or_404(Position, id=pos_id)
    pos.delete()
    return Response({'message': 'Poste supprimé'})

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def employee_contracts(request, employee_id):
    """Contrats d'un employé"""
    if request.user.role not in ['hr_manager', 'hr_director', 'administrator']:
        return Response({'error': 'Permission denied'}, status=status.HTTP_403_FORBIDDEN)
    
    employee = get_object_or_404(Employee, id=employee_id)
    contracts = Contract.objects.filter(employee=employee).order_by('-date_debut')
    serializer = ContractSerializer(contracts, many=True)
    return Response(serializer.data)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def employee_trainings(request, employee_id):
    """Formations approuvées d'un employé"""
    if request.user.role not in ['hr_manager', 'hr_director', 'administrator']:
        return Response({'error': 'Permission denied'}, status=status.HTTP_403_FORBIDDEN)
    
    employee = get_object_or_404(Employee, id=employee_id)
    
    # Récupérer toutes les formations approuvées de l'employé
    trainings = Training.objects.filter(
        employees=employee, 
        status='approved'
    ).select_related('created_by', 'approved_by').order_by('-start_date')
    
    trainings_data = []
    for training in trainings:
        trainings_data.append({
            'id': training.id,
            'name': training.name,
            'description': training.description,
            'start_date': training.start_date,
            'end_date': training.end_date,
            'status': training.status,
            'status_display': training.get_status_display(),
            'created_by': training.created_by.get_full_name(),
            'approved_by': training.approved_by.get_full_name() if training.approved_by else None,
            'approved_at': training.approved_at,
            'duration_days': training.duration_days,
            'is_active': training.is_active
        })
    
    return Response(trainings_data)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def my_trainings(request):
    """Mes formations approuvées (pour l'employé connecté)"""
    try:
        employee = request.user.employee_profile
    except Employee.DoesNotExist:
        return Response({'error': 'Employee profile not found'}, status=status.HTTP_404_NOT_FOUND)
    
    # Récupérer toutes les formations approuvées de l'employé connecté
    trainings = Training.objects.filter(
        employees=employee, 
        status='approved'
    ).select_related('created_by', 'approved_by').order_by('-start_date')
    
    trainings_data = []
    for training in trainings:
        trainings_data.append({
            'id': training.id,
            'name': training.name,
            'description': training.description,
            'start_date': training.start_date,
            'end_date': training.end_date,
            'status': training.status,
            'status_display': training.get_status_display(),
            'created_by_name': training.created_by.get_full_name(),
            'approved_by_name': training.approved_by.get_full_name() if training.approved_by else None,
            'approved_at': training.approved_at,
            'created_at': training.created_at,
            'duration_days': training.duration_days,
            'is_active': training.is_active
        })
    
    return Response(trainings_data)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def my_profile(request):
    """Mon profil complet (pour l'employé connecté)"""
    user = request.user
    
    # Si l'utilisateur a un profil employé
    if hasattr(user, 'employee_profile'):
        employee = user.employee_profile
        
        # Vérifier si l'employé est absent aujourd'hui
        from employees.utils import is_employee_absent_today
        is_absent = is_employee_absent_today(employee)
        
        # Récupérer les contrats
        contracts = Contract.objects.filter(employee=employee).order_by('-date_debut')
        contracts_data = []
        for contract in contracts:
            contracts_data.append({
                'id': contract.id,
                'type': contract.type,
                'date_debut': contract.date_debut,
                'date_fin': contract.date_fin,
                'salaire': contract.salaire,
                'active': contract.active
            })
        
        # Récupérer les compétences
        try:
            from knowledge_management.models import EmployeeSkill
            skills = EmployeeSkill.objects.filter(employee=employee).select_related('skill')
            skills_data = []
            for skill in skills:
                skills_data.append({
                    'id': skill.id,
                    'skill_name': skill.skill.name,
                    'skill_category': skill.skill.category or 'Général',
                    'level': skill.level,
                    'level_display': skill.get_level_display(),
                    'certified': skill.certified,
                    'certification_date': skill.certification_date
                })
        except:
            skills_data = []
        
        profile_data = {
            'user': {
                'first_name': user.first_name,
                'last_name': user.last_name,
                'email': user.email,
                'phone': getattr(user, 'phone', '')
            },
            'employee': {
                'id': employee.id,
                'matricule': employee.matricule,
                'poste': employee.poste,
                'service': employee.service,
                'department_name': employee.department.name if employee.department else 'Non renseigné',
                'date_embauche': employee.date_embauche,
                'statut': employee.statut,
                'photo': employee.photo.url if employee.photo else None
            },
            'is_absent_today': is_absent,
            'contracts': contracts_data,
            'skills': skills_data
        }
    else:
        # Utilisateur sans profil employé (HR, Admin)
        profile_data = {
            'user': {
                'username': user.username,
                'first_name': user.first_name,
                'last_name': user.last_name,
                'email': user.email,
                'phone': getattr(user, 'phone', ''),
                'role': user.get_role_display()
            },
            'employee': None,
            'is_absent_today': False,
            'contracts': [],
            'skills': []
        }
    
    return Response(profile_data)