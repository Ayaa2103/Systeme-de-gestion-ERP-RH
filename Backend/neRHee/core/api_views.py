from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.response import Response
from rest_framework import status
from django.contrib.auth import authenticate
from django.utils import timezone
from datetime import date, timedelta
from .models import User, Event, HRPolicy, Notification
from employees.models import Employee, Contract, Training
from requests_app.models import LeaveRequest, AttestationRequest, MissionOrderRequest, PayslipRequest
from recruitment.models import JobOffer, Application
from .serializers import UserSerializer, EventSerializer, HRPolicySerializer, NotificationSerializer
from .notifications import create_notification, create_notifications_for_roles

@api_view(['POST'])
@permission_classes([AllowAny])
def login_api(request):
    username = request.data.get('username')
    password = request.data.get('password')
    
    if not username or not password:
        return Response({'error': 'Username and password required'}, status=status.HTTP_400_BAD_REQUEST)
    
    user = authenticate(username=username, password=password)
    if user:
        from rest_framework.authtoken.models import Token
        token, created = Token.objects.get_or_create(user=user)
        
        # Get employee profile if exists
        employee_data = None
        if hasattr(user, 'employee_profile'):
            employee_data = {
                'id': user.employee_profile.id,
                'matricule': user.employee_profile.matricule,
                'poste': user.employee_profile.poste,
                'service': user.employee_profile.service,
                'department': user.employee_profile.department.name if user.employee_profile.department else None
            }
        
        return Response({
            'token': token.key,
            'user': {
                'id': user.id,
                'username': user.username,
                'email': user.email,
                'first_name': user.first_name,
                'last_name': user.last_name,
                'role': user.role
            },
            'employee': employee_data
        })
    
    return Response({'error': 'Invalid credentials'}, status=status.HTTP_401_UNAUTHORIZED)

@api_view(['GET'])
@permission_classes([AllowAny])
def health_check(request):
    """Endpoint de test pour vérifier que l'API fonctionne"""
    return Response({
        'status': 'OK',
        'message': 'API Django fonctionne correctement',
        'timestamp': timezone.now().isoformat()
    })

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def dashboard_stats(request):
    """API pour les statistiques du tableau de bord - utilise exactement la même logique que le dashboard Django"""
    user = request.user
    
    if user.role in ['hr_manager', 'hr_director', 'administrator']:
        # Utiliser exactement la même logique que dans core/views.py dashboard
        try:
            stats = {
                'total_employees': Employee.objects.filter(statut='actif').count(),
                'pending_requests': (
                    LeaveRequest.objects.filter(status='pending').count() +
                    AttestationRequest.objects.filter(status='pending').count() +
                    MissionOrderRequest.objects.filter(status='pending').count() +
                    PayslipRequest.objects.filter(status='pending').count()
                ),
                'active_trainings': Training.objects.filter(
                    status='approved',
                    start_date__lte=date.today(),
                    end_date__gte=date.today()
                ).count(),
                'expiring_contracts': Contract.objects.filter(
                    active=True,
                    date_fin__lte=date.today() + timedelta(days=30),
                    date_fin__gte=date.today()
                ).count()
            }
            
            # Ajouter les nouvelles métriques
            from employees.utils import get_new_employees_today
            new_employees = get_new_employees_today()
            stats['new_employees_today'] = new_employees.count()
            stats['active_job_offers'] = JobOffer.objects.filter(status='published').count()
            stats['pending_applications'] = Application.objects.filter(status='pending').count()
            
            # Ajouter les données d'évolution mensuelle
            from django.db.models import Count
            from django.db.models.functions import TruncMonth
            import calendar
            
            # Calculer les 6 derniers mois
            monthly_data = []
            today = date.today()
            
            for i in range(5, -1, -1):  # 6 derniers mois
                target_date = date(today.year, today.month, 1) - timedelta(days=i*30)
                if target_date.month > 12:
                    target_date = target_date.replace(year=target_date.year + 1, month=target_date.month - 12)
                
                month_start = target_date.replace(day=1)
                if target_date.month == 12:
                    month_end = date(target_date.year + 1, 1, 1) - timedelta(days=1)
                else:
                    month_end = date(target_date.year, target_date.month + 1, 1) - timedelta(days=1)
                
                # Compter les employés embauchés ce mois
                employees_count = Employee.objects.filter(
                    date_embauche__gte=month_start,
                    date_embauche__lte=month_end
                ).count()
                
                # Compter les demandes créées ce mois
                requests_count = (
                    LeaveRequest.objects.filter(created_at__gte=month_start, created_at__lte=month_end).count() +
                    AttestationRequest.objects.filter(created_at__gte=month_start, created_at__lte=month_end).count() +
                    MissionOrderRequest.objects.filter(created_at__gte=month_start, created_at__lte=month_end).count() +
                    PayslipRequest.objects.filter(created_at__gte=month_start, created_at__lte=month_end).count()
                )
                
                monthly_data.append({
                    'name': calendar.month_name[target_date.month][:3],
                    'employees': employees_count,
                    'requests': requests_count
                })
            
            stats['monthly_evolution'] = monthly_data
            
        except Exception as e:
            # Valeurs par défaut en cas d'erreur (même logique que views.py)
            stats = {
                'total_employees': 0,
                'pending_requests': 0,
                'active_trainings': 0,
                'expiring_contracts': 0,
                'new_employees_today': 0,
                'active_job_offers': 0,
                'pending_applications': 0
            }
    else:
        # Statistiques pour employé
        try:
            employee = user.employee_profile
            stats = {
                'my_requests': (
                    employee.leave_requests.filter(status='pending').count() +
                    employee.attestation_requests.filter(status='pending').count() +
                    employee.mission_requests.filter(status='pending').count() +
                    employee.payslip_requests.filter(status='pending').count()
                ),
                'my_trainings': employee.trainings.filter(status='approved').count(),
                'remaining_leaves': 25  # À calculer selon la logique métier
            }
        except:
            stats = {'my_requests': 0, 'my_trainings': 0, 'remaining_leaves': 0}
    
    return Response(stats)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def events_list(request):
    """Liste des événements selon le rôle"""
    user = request.user
    
    if user.role == 'hr_director':
        events = Event.objects.all()
    elif user.role == 'hr_manager':
        events = Event.objects.filter(created_by=user)
    else:
        events = Event.objects.filter(status='approved')
    
    serializer = EventSerializer(events, many=True)
    return Response(serializer.data)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def create_event(request):
    """Créer un événement"""
    if request.user.role not in ['hr_manager', 'hr_director']:
        return Response({'error': 'Permission denied'}, status=status.HTTP_403_FORBIDDEN)
    
    data = request.data.copy()
    data['created_by'] = request.user.id
    data['status'] = 'pending'
    
    serializer = EventSerializer(data=data)
    if serializer.is_valid():
        event = serializer.save()
        create_notifications_for_roles(
            ['hr_director'],
            title='Nouvel événement à valider',
            message=f"{request.user.get_full_name() or request.user.username} a créé l'événement « {event.name} ».",
            notification_type='event_created',
            actor=request.user,
            link='/events',
            exclude_user=request.user,
        )
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def approve_event(request, event_id):
    """Approuver un événement"""
    if request.user.role != 'hr_director':
        return Response({'error': 'Permission denied'}, status=status.HTTP_403_FORBIDDEN)
    
    try:
        event = Event.objects.get(id=event_id)
        event.status = 'approved'
        event.approved_by = request.user
        event.approved_at = timezone.now()
        event.save()
        create_notification(
            event.created_by,
            title='Événement approuvé',
            message=f"L'événement « {event.name} » a été approuvé.",
            notification_type='event_status',
            actor=request.user,
            link='/events',
        )
        create_notifications_for_roles(
            ['employee', 'hr_manager', 'administrator'],
            title='Nouvel événement publié',
            message=f"L'événement « {event.name} » est maintenant visible.",
            notification_type='event_status',
            actor=request.user,
            link='/events',
        )
        
        serializer = EventSerializer(event)
        return Response(serializer.data)
    except Event.DoesNotExist:
        return Response({'error': 'Event not found'}, status=status.HTTP_404_NOT_FOUND)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def reject_event(request, event_id):
    """Rejeter un événement"""
    if request.user.role != 'hr_director':
        return Response({'error': 'Permission denied'}, status=status.HTTP_403_FORBIDDEN)
    
    try:
        event = Event.objects.get(id=event_id)
        event.status = 'cancelled'
        event.approved_by = request.user
        event.approved_at = timezone.now()
        event.save()
        create_notification(
            event.created_by,
            title='Événement rejeté',
            message=f"L'événement « {event.name} » a été rejeté.",
            notification_type='event_status',
            actor=request.user,
            link='/events',
        )
        
        serializer = EventSerializer(event)
        return Response(serializer.data)
    except Event.DoesNotExist:
        return Response({'error': 'Event not found'}, status=status.HTTP_404_NOT_FOUND)

@api_view(['PUT', 'PATCH'])
@permission_classes([IsAuthenticated])
def update_event(request, event_id):
    """Modifier un événement — hr_director uniquement"""
    if request.user.role != 'hr_director':
        return Response({'error': 'Permission refusée'}, status=status.HTTP_403_FORBIDDEN)
    try:
        event = Event.objects.get(id=event_id)
        serializer = EventSerializer(event, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    except Event.DoesNotExist:
        return Response({'error': 'Événement introuvable'}, status=status.HTTP_404_NOT_FOUND)

@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def delete_event(request, event_id):
    """Supprimer un événement — hr_director uniquement"""
    if request.user.role != 'hr_director':
        return Response({'error': 'Permission refusée'}, status=status.HTTP_403_FORBIDDEN)
    try:
        event = Event.objects.get(id=event_id)
        event.delete()
        return Response({'message': 'Événement supprimé'}, status=status.HTTP_204_NO_CONTENT)
    except Event.DoesNotExist:
        return Response({'error': 'Événement introuvable'}, status=status.HTTP_404_NOT_FOUND)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def hr_policies_list(request):
    """Liste des politiques RH"""
    policies = HRPolicy.objects.filter(is_active=True)
    serializer = HRPolicySerializer(policies, many=True)
    return Response(serializer.data)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def new_employees_today(request):
    """Nouveaux employés du jour - SEULEMENT ceux embauchés aujourd'hui"""
    if request.user.role not in ['hr_manager', 'hr_director', 'administrator']:
        return Response({'error': 'Permission denied'}, status=status.HTTP_403_FORBIDDEN)
    
    # Filtrer STRICTEMENT par date_embauche = aujourd'hui
    today = date.today()
    today_employees = Employee.objects.filter(
        date_embauche=today,
        statut='actif'
    ).select_related('user', 'department')
    
    print(f"DEBUG: Recherche employés pour la date: {today}")
    print(f"DEBUG: Employés trouvés: {today_employees.count()}")
    
    employees_data = []
    for emp in today_employees:
        print(f"DEBUG: Employé {emp.user.get_full_name()}, date_embauche: {emp.date_embauche}")
        emp_data = {
            'id': emp.id,
            'user_data': {
                'first_name': emp.user.first_name,
                'last_name': emp.user.last_name,
                'email': emp.user.email
            },
            'matricule': emp.matricule,
            'poste': emp.poste,
            'service': emp.service,
            'department_name': emp.department.name if emp.department else None,
            'photo': emp.photo.url if emp.photo else None,
            'date_embauche': emp.date_embauche
        }
        employees_data.append(emp_data)
    
    return Response(employees_data)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def recent_job_offers(request):
    """Offres d'emploi actives - utilise la même logique que le dashboard Django"""
    if request.user.role not in ['hr_manager', 'hr_director', 'administrator']:
        return Response({'error': 'Permission denied'}, status=status.HTTP_403_FORBIDDEN)
    
    # Debug: Vérifier toutes les offres d'emploi
    all_offers = JobOffer.objects.all()
    print(f"Total job offers in DB: {all_offers.count()}")
    for offer in all_offers:
        print(f"Offer: {offer.title}, Status: {offer.status}")
    
    # Utiliser la même logique que dans le dashboard Django
    active_job_offers = JobOffer.objects.filter(status='published').order_by('-created_at')[:5]
    print(f"Active job offers found: {active_job_offers.count()}")
    
    offers_data = []
    for offer in active_job_offers:
        offer_data = {
            'id': offer.id,
            'title': offer.title,
            'department': offer.department,
            'location': getattr(offer, 'location', ''),
            'employment_type': offer.get_experience_level_display(),
            'experience_level': offer.get_experience_level_display(),
            'description': offer.description,
            'created_at': offer.created_at,
            'applications_count': offer.applications.count()
        }
        offers_data.append(offer_data)
    
    return Response(offers_data)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def employee_dashboard_data(request):
    """Données complètes du dashboard employé incluant les offres d'emploi"""
    user = request.user
    
    # Nouveaux employés du jour - STRICTEMENT ceux embauchés aujourd'hui
    today = date.today()
    new_employees = Employee.objects.filter(
        date_embauche=today,
        statut='actif'
    ).select_related('user', 'department')
    
    new_employees_data = []
    for emp in new_employees:
        new_employees_data.append({
            'id': emp.id,
            'user_data': {
                'first_name': emp.user.first_name,
                'last_name': emp.user.last_name,
                'email': emp.user.email
            },
            'matricule': emp.matricule,
            'poste': emp.poste,
            'service': emp.service,
            'department_name': emp.department.name if emp.department else None,
            'photo': emp.photo.url if emp.photo else None,
            'date_embauche': emp.date_embauche
        })
    
    # Offres d'emploi actives (visible par tous)
    active_job_offers = JobOffer.objects.filter(status='published').order_by('-created_at')[:3]
    
    job_offers_data = []
    for offer in active_job_offers:
        job_offers_data.append({
            'id': offer.id,
            'title': offer.title,
            'department': offer.department,
            'experience_level': offer.get_experience_level_display(),
            'description': offer.description
        })
    
    return Response({
        'new_employees_today': new_employees_data,
        'active_job_offers': job_offers_data
    })

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def users_list(request):
    """Liste tous les utilisateurs - admin uniquement"""
    if request.user.role != 'administrator':
        return Response({'error': 'Permission denied'}, status=status.HTTP_403_FORBIDDEN)
    users = User.objects.all().order_by('date_joined')
    serializer = UserSerializer(users, many=True)
    return Response(serializer.data)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def create_user(request):
    """Créer un compte utilisateur - admin uniquement"""
    if request.user.role != 'administrator':
        return Response({'error': 'Permission denied'}, status=status.HTTP_403_FORBIDDEN)

    data = request.data
    if User.objects.filter(username=data.get('username')).exists():
        return Response({'error': "Ce nom d'utilisateur existe déjà"}, status=status.HTTP_400_BAD_REQUEST)
    if User.objects.filter(email=data.get('email')).exists():
        return Response({'error': 'Cet email est déjà utilisé'}, status=status.HTTP_400_BAD_REQUEST)

    try:
        user = User.objects.create_user(
            username=data['username'],
            email=data.get('email', ''),
            password=data['password'],
            first_name=data.get('first_name', ''),
            last_name=data.get('last_name', ''),
            phone=data.get('phone', ''),
            role=data.get('role', 'employee'),
        )
        serializer = UserSerializer(user)
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)


@api_view(['PUT'])
@permission_classes([IsAuthenticated])
def update_user(request, user_id):
    """Modifier le rôle ou les infos d'un utilisateur - admin uniquement"""
    if request.user.role != 'administrator':
        return Response({'error': 'Permission denied'}, status=status.HTTP_403_FORBIDDEN)
    try:
        user = User.objects.get(id=user_id)
    except User.DoesNotExist:
        return Response({'error': 'Utilisateur non trouvé'}, status=status.HTTP_404_NOT_FOUND)

    for field in ('first_name', 'last_name', 'email', 'phone', 'role'):
        if field in request.data:
            setattr(user, field, request.data[field])
    user.save()
    serializer = UserSerializer(user)
    return Response(serializer.data)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def reset_user_password(request, user_id):
    """Réinitialiser le mot de passe d'un utilisateur - admin uniquement"""
    if request.user.role != 'administrator':
        return Response({'error': 'Permission denied'}, status=status.HTTP_403_FORBIDDEN)
    try:
        user = User.objects.get(id=user_id)
    except User.DoesNotExist:
        return Response({'error': 'Utilisateur non trouvé'}, status=status.HTTP_404_NOT_FOUND)

    new_password = request.data.get('new_password')
    if not new_password or len(new_password) < 6:
        return Response({'error': 'Le mot de passe doit contenir au moins 6 caractères'}, status=status.HTTP_400_BAD_REQUEST)

    user.set_password(new_password)
    user.save()
    return Response({'message': 'Mot de passe réinitialisé avec succès'})


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def toggle_user_active(request, user_id):
    """Activer / désactiver un compte utilisateur - admin uniquement"""
    if request.user.role != 'administrator':
        return Response({'error': 'Permission denied'}, status=status.HTTP_403_FORBIDDEN)
    if request.user.id == user_id:
        return Response({'error': 'Vous ne pouvez pas désactiver votre propre compte'}, status=status.HTTP_400_BAD_REQUEST)
    try:
        user = User.objects.get(id=user_id)
    except User.DoesNotExist:
        return Response({'error': 'Utilisateur non trouvé'}, status=status.HTTP_404_NOT_FOUND)

    user.is_active = not user.is_active
    user.save()
    serializer = UserSerializer(user)
    return Response(serializer.data)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def kpi_data(request):
    """API KPI simplifié"""
    if request.user.role != 'hr_director':
        return Response({'error': 'Permission denied'}, status=status.HTTP_403_FORBIDDEN)
    
    try:
        from datetime import date
        
        # Basic stats
        total_employees = Employee.objects.count()
        pending_requests = (LeaveRequest.objects.filter(status='pending').count() + 
                           AttestationRequest.objects.filter(status='pending').count() +
                           MissionOrderRequest.objects.filter(status='pending').count() +
                           PayslipRequest.objects.filter(status='pending').count())
        
        # Simple absence data
        today = date.today()
        absent_today = Employee.objects.filter(
            leave_requests__status='approved',
            leave_requests__start_date__lte=today,
            leave_requests__end_date__gte=today
        ).distinct().count()
        
        total_absences = LeaveRequest.objects.filter(status='approved').count()
        absence_rate = round((total_absences / max(total_employees, 1)) * 100, 2)
        avg_absence_days = round(total_absences / max(total_employees, 1), 2)
        
        # Chart data - all employees with their absence days
        chart_data = []
        for employee in Employee.objects.all()[:20]:  # Limit to 20 for performance
            absence_days = employee.leave_requests.filter(status='approved').count()
            chart_data.append({
                'name': employee.user.get_full_name(),
                'days': absence_days
            })
        
        # Training data
        employees_training_data = []
        total_trainings = 0
        for employee in Employee.objects.all()[:20]:  # Limit to 20
            training_count = employee.trainings.filter(status='approved').count()
            total_trainings += training_count
            employees_training_data.append({
                'employee': {
                    'user': {'get_full_name': employee.user.get_full_name()},
                    'matricule': employee.matricule,
                    'service': getattr(employee, 'service', 'Non défini')
                },
                'training_count': training_count
            })
        
        participation_rate = round((len([e for e in employees_training_data if e['training_count'] > 0]) / max(len(employees_training_data), 1) * 100), 2)
        
        return Response({
            'total_employees': total_employees,
            'pending_requests': pending_requests,
            'absent_today': absent_today,
            'total_absences': total_absences,
            'absence_rate': absence_rate,
            'avg_absence_days': avg_absence_days,
            'employees_over_threshold': [],
            'chart_data': chart_data,
            'training_stats': {
                'employees_training_data': employees_training_data,
                'total_trainings': total_trainings,
                'participation_rate': participation_rate
            }
        })
    except Exception as e:
        return Response({
            'total_employees': 0,
            'pending_requests': 0,
            'absent_today': 0,
            'total_absences': 0,
            'absence_rate': 0,
            'avg_absence_days': 0,
            'employees_over_threshold': [],
            'chart_data': [],
            'training_stats': {'employees_training_data': [], 'total_trainings': 0, 'participation_rate': 0}
        })


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def notifications_list(request):
    notifications = request.user.notifications.all()[:30]
    serializer = NotificationSerializer(notifications, many=True)
    return Response({
        'unread_count': request.user.notifications.filter(is_read=False).count(),
        'notifications': serializer.data,
    })


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def mark_notification_read(request, notification_id):
    try:
        notification = Notification.objects.get(id=notification_id, recipient=request.user)
    except Notification.DoesNotExist:
        return Response({'error': 'Notification not found'}, status=status.HTTP_404_NOT_FOUND)

    notification.is_read = True
    notification.save(update_fields=['is_read'])
    return Response(NotificationSerializer(notification).data)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def mark_all_notifications_read(request):
    request.user.notifications.filter(is_read=False).update(is_read=True)
    return Response({'message': 'Notifications marquées comme lues', 'unread_count': 0})
