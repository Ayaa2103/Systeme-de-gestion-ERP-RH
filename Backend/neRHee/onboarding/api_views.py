from rest_framework import viewsets, status
from rest_framework.decorators import action, api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from .models import ChecklistItem, OnboardingPlan, OnboardingTask
from .api_serializers import ChecklistItemSerializer, OnboardingPlanSerializer, OnboardingTaskSerializer, NewEmployeeSerializer
from employees.models import Employee
from core.notifications import create_notification
from datetime import date, timedelta

class OnboardingPlanViewSet(viewsets.ModelViewSet):
    queryset = OnboardingPlan.objects.all()
    serializer_class = OnboardingPlanSerializer
    permission_classes = [IsAuthenticated]
    
    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)

class ChecklistItemViewSet(viewsets.ModelViewSet):
    queryset = ChecklistItem.objects.all()
    serializer_class = ChecklistItemSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        queryset = ChecklistItem.objects.all()
        employee_id = self.request.query_params.get('employee', None)
        if employee_id is not None:
            queryset = queryset.filter(employee_id=employee_id)
        return queryset.select_related('employee__user', 'completed_by').order_by('id')
    
    def list(self, request, *args, **kwargs):
        queryset = self.get_queryset()
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)
    
    @action(detail=True, methods=['post'])
    def toggle(self, request, pk=None):
        item = self.get_object()
        item.is_completed = not item.is_completed
        if item.is_completed:
            item.mark_completed(request.user)
        else:
            item.completion_date = None
            item.completed_by = None
        item.save()
        
        serializer = self.get_serializer(item)
        return Response(serializer.data)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def new_employees_today(request):
    # Récupérer les employés avec plans d'onboarding (comme dans le backend)
    new_employees = Employee.objects.filter(
        onboarding_plan__isnull=False
    ).select_related('user').distinct().order_by('-date_embauche')[:5]
    
    # Ajouter le progrès d'onboarding
    employees_data = []
    for emp in new_employees:
        from .models import get_onboarding_progress
        progress = get_onboarding_progress(emp)
        
        emp_data = {
            'id': emp.id,
            'user_data': {
                'first_name': emp.user.first_name,
                'last_name': emp.user.last_name,
                'email': emp.user.email
            },
            'matricule': emp.matricule,
            'poste': emp.poste,
            'date_embauche': emp.date_embauche,
            'onboarding_progress': progress,
            'onboarding_status': getattr(emp, 'onboarding_status', 'not_started')
        }
        employees_data.append(emp_data)
    
    return Response(employees_data)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def onboarding_stats(request):
    """Statistiques exactement comme dans le backend Django"""
    from .models import OnboardingTask, OnboardingTraining, OnboardingFollowUp
    from datetime import date
    
    # Employés avec plans d'onboarding (comme dans le backend)
    onboarding_employees = Employee.objects.filter(onboarding_plan__isnull=False).distinct()
    
    # Calculer la progression moyenne
    avg_progress = 0
    if onboarding_employees.exists():
        from .models import get_onboarding_progress
        total_progress = sum(get_onboarding_progress(emp) for emp in onboarding_employees)
        avg_progress = round(total_progress / onboarding_employees.count())
    
    stats = {
        'total_new_employees': onboarding_employees.count(),
        'employees_in_progress': onboarding_employees.filter(onboarding_status='in_progress').count(),
        'completed_onboarding': onboarding_employees.filter(onboarding_status='completed').count(),
        'avg_progress': avg_progress,
        'pending_tasks': OnboardingTask.objects.filter(is_completed=False).count(),
        'pending_trainings': OnboardingTraining.objects.filter(is_completed=False).count(),
        'pending_followups': OnboardingFollowUp.objects.filter(
            is_completed=False, 
            scheduled_date__lte=date.today()
        ).count()
    }
    return Response(stats)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def start_employee_onboarding(request):
    employee_id = request.data.get('employee_id')
    start_date = request.data.get('start_date')
    expected_completion_date = request.data.get('expected_completion_date')
    
    try:
        employee = Employee.objects.get(id=employee_id)
        
        # Vérifier si l'employé a déjà un plan d'onboarding
        if hasattr(employee, 'onboarding_plan'):
            return Response({'error': 'Cet employé a déjà un plan d\'intégration'}, status=400)
        
        from .models import create_onboarding_plan
        from datetime import datetime, date
        
        # Convertir les dates si elles sont fournies
        if start_date:
            if isinstance(start_date, str):
                start_date = datetime.strptime(start_date, '%Y-%m-%d').date()
        else:
            start_date = date.today()
            
        if expected_completion_date:
            if isinstance(expected_completion_date, str):
                expected_completion_date = datetime.strptime(expected_completion_date, '%Y-%m-%d').date()
        else:
            from datetime import timedelta
            expected_completion_date = start_date + timedelta(days=90)  # 3 mois par défaut
        
        # Créer le plan d'intégration complet (checklist, tâches, formations, suivis)
        plan = create_onboarding_plan(employee, request.user, start_date, expected_completion_date)
        
        # Mettre à jour le statut de l'employé
        employee.onboarding_status = 'in_progress'
        employee.save()

        create_notification(
            employee.user,
            title='Votre intégration a démarré',
            message="Bienvenue dans l'équipe ! Votre plan d'intégration est disponible.",
            notification_type='onboarding_started',
            actor=request.user,
            link='/employee/onboarding',
        )

        return Response({
            'message': 'Plan d\'intégration complet créé avec succès',
            'plan_id': plan.id,
            'employee_id': employee.id
        })
        
    except Employee.DoesNotExist:
        return Response({'error': 'Employé non trouvé'}, status=404)
    except Exception as e:
        return Response({'error': f'Erreur lors de la création: {str(e)}'}, status=500)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def all_employees(request):
    """Récupérer tous les employés pour les sélecteurs"""
    employees = Employee.objects.filter(statut='actif').select_related('user')
    employees_data = []
    for emp in employees:
        emp_data = {
            'id': emp.id,
            'user_data': {
                'first_name': emp.user.first_name,
                'last_name': emp.user.last_name,
                'email': emp.user.email
            },
            'matricule': emp.matricule,
            'poste': emp.poste,
        }
        employees_data.append(emp_data)
    return Response(employees_data)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def onboarding_employees_list(request):
    """Récupérer tous les employés qui ont des plans d'onboarding"""
    employees = Employee.objects.filter(
        onboarding_plan__isnull=False
    ).select_related('user').distinct()
    
    employees_data = []
    for emp in employees:
        from .models import get_onboarding_progress
        progress = get_onboarding_progress(emp)
        
        # Déterminer le statut basé sur le progrès
        if progress == 0:
            status = 'not_started'
        elif progress == 100:
            status = 'completed'
        else:
            status = 'in_progress'
        
        emp_data = {
            'id': emp.id,
            'user_data': {
                'first_name': emp.user.first_name,
                'last_name': emp.user.last_name,
                'email': emp.user.email
            },
            'matricule': emp.matricule,
            'poste': emp.poste,
            'date_embauche': emp.date_embauche,
            'photo': emp.photo.url if emp.photo else None,
            'onboarding_progress': progress,
            'onboarding_status': status
        }
        employees_data.append(emp_data)
    
    return Response(employees_data)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def employee_checklist(request, employee_id):
    """Récupérer la checklist d'un employé spécifique"""
    try:
        employee = Employee.objects.get(id=employee_id)
        checklist_items = ChecklistItem.objects.filter(employee=employee).order_by('id')
        serializer = ChecklistItemSerializer(checklist_items, many=True)
        return Response(serializer.data)
    except Employee.DoesNotExist:
        return Response({'error': 'Employé non trouvé'}, status=404)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def employee_trainings(request, employee_id):
    """Récupérer les formations d'onboarding d'un employé"""
    try:
        from .models import OnboardingTraining
        employee = Employee.objects.get(id=employee_id)
        trainings = OnboardingTraining.objects.filter(employee=employee).order_by('id')
        
        trainings_data = []
        for training in trainings:
            training_data = {
                'id': training.id,
                'training_type': training.training_type,
                'title': training.title,
                'description': training.description,
                'duration_hours': training.duration_hours,
                'is_mandatory': training.is_mandatory,
                'scheduled_date': training.scheduled_date,
                'is_completed': training.is_completed,
                'completion_date': training.completion_date,
                'score': training.score,
                'trainer': training.trainer.get_full_name() if training.trainer else None
            }
            trainings_data.append(training_data)
        
        return Response(trainings_data)
    except Employee.DoesNotExist:
        return Response({'error': 'Employé non trouvé'}, status=404)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def complete_training(request, training_id):
    """Marquer une formation comme terminée avec date et score"""
    try:
        from .models import OnboardingTraining
        from datetime import datetime
        
        training = OnboardingTraining.objects.get(id=training_id)
        completion_date = request.data.get('completion_date')
        score = request.data.get('score')
        
        if completion_date:
            if isinstance(completion_date, str):
                completion_date = datetime.strptime(completion_date, '%Y-%m-%d').date()
            training.mark_completed(completion_date, int(score) if score else None)
            
            return Response({
                'message': 'Formation marquée comme terminée',
                'training_id': training.id,
                'completion_date': training.completion_date,
                'score': training.score
            })
        else:
            return Response({'error': 'Date de completion requise'}, status=400)
    except OnboardingTraining.DoesNotExist:
        return Response({'error': 'Formation non trouvée'}, status=404)
    except Exception as e:
        return Response({'error': str(e)}, status=500)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def complete_onboarding_task(request, task_id):
    """Marquer une tâche d'intégration comme terminée"""
    try:
        task = OnboardingTask.objects.get(id=task_id)
    except OnboardingTask.DoesNotExist:
        return Response({'error': 'Tâche non trouvée'}, status=404)

    if task.assigned_to_id != request.user.id:
        return Response({'error': 'Permission denied'}, status=403)

    task.mark_completed(request.user)

    return Response({
        'id': task.id,
        'is_completed': task.is_completed,
        'completion_date': task.completed_at,
    })

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def my_onboarding(request):
    """Portail d'intégration pour l'employé connecté - utilise exactement la même logique que views.py"""
    if not hasattr(request.user, 'employee_profile'):
        return Response({'error': 'Vous n\'avez pas de profil employé'}, status=404)
    
    employee = request.user.employee_profile
    
    # Vérifier si l'employé a un plan d'onboarding
    if not hasattr(employee, 'onboarding_plan'):
        return Response({
            'has_plan': False,
            'message': 'Aucun plan d\'intégration assigné'
        })
    
    onboarding_plan = employee.onboarding_plan

    
    # Récupérer les données
    documents = employee.onboarding_documents.all()
    tasks = employee.onboarding_tasks.filter(assigned_to=request.user)
    trainings = employee.onboarding_trainings.all()
    followups = employee.onboarding_followups.all()
    
    # Calculer la progression
    progress = {
        'documents': {
            'total': documents.count(),
            'completed': documents.filter(is_signed=True).count()
        },
        'tasks': {
            'total': tasks.count(),
            'completed': tasks.filter(is_completed=True).count()
        },
        'trainings': {
            'total': trainings.count(),
            'completed': trainings.filter(is_completed=True).count()
        }
    }
    
    total_items = progress['documents']['total'] + progress['tasks']['total'] + progress['trainings']['total']
    completed_items = progress['documents']['completed'] + progress['tasks']['completed'] + progress['trainings']['completed']
    overall_progress = round((completed_items / total_items * 100)) if total_items > 0 else 0
    
    return Response({
        'has_plan': True,
        'employee': {
            'id': employee.id,
            'name': employee.user.get_full_name(),
            'matricule': employee.matricule,
            'poste': employee.poste,
            'date_embauche': employee.date_embauche
        },
        'onboarding_plan': {
            'id': onboarding_plan.id,
            'start_date': onboarding_plan.start_date,
            'expected_completion_date': onboarding_plan.expected_completion_date,
            'status': getattr(employee, 'onboarding_status', 'in_progress')
        },
        'tasks': [{
            'id': task.id,
            'title': task.title,
            'description': task.description,
            'due_date': task.due_date,
            'is_completed': task.is_completed,
            'completion_date': task.completed_at,
            'priority': task.priority
        } for task in tasks],
        'trainings': [{
            'id': training.id,
            'title': training.title,
            'description': training.description,
            'training_type': training.training_type,
            'duration_hours': training.duration_hours,
            'scheduled_date': training.scheduled_date,
            'is_completed': training.is_completed,
            'completion_date': training.completion_date,
            'score': training.score,
            'is_mandatory': training.is_mandatory
        } for training in trainings],
        'documents': [{
            'id': doc.id,
            'title': doc.title,
            'description': doc.description,
            'document_type': doc.document_type,
            'is_signed': doc.is_signed,
            'signed_date': doc.signed_date
        } for doc in documents],
        'followups': [{
            'id': followup.id,
            'follow_up_type': followup.follow_up_type,
            'follow_up_type_display': followup.get_follow_up_type_display(),
            'scheduled_date': followup.scheduled_date,
            'conducted_date': followup.conducted_date,
            'is_completed': followup.is_completed,
            'overall_rating': followup.overall_rating
        } for followup in followups],
        'stats': {
            'overall_progress': overall_progress,
            'tasks': progress['tasks'],
            'trainings': progress['trainings'],
            'documents': {
                'total': progress['documents']['total'],
                'signed': progress['documents']['completed']
            }
        }
    })