from django.shortcuts import render, redirect, get_object_or_404
from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.decorators import login_required, user_passes_test
from django.contrib import messages
from django.http import JsonResponse
from .models import User, HRPolicy
from employees.models import Employee
from requests_app.models import LeaveRequest, AttestationRequest, MissionOrderRequest, PayslipRequest

def is_hr_manager_or_director(user):
    return user.role in ['hr_manager', 'hr_director']

def user_login(request):
    if request.method == 'POST':
        username = request.POST['username']
        password = request.POST['password']
        user = authenticate(request, username=username, password=password)
        if user:
            login(request, user)
            return redirect('dashboard')
        messages.error(request, 'Invalid credentials')
    return render(request, 'core/login.html')

def user_logout(request):
    logout(request)
    return redirect('login')

@login_required
def dashboard(request):
    from employees.utils import get_new_employees_today
    from recruitment.models import JobOffer
    
    # Offres d'emploi actives
    active_job_offers = JobOffer.objects.filter(status='published').order_by('-created_at')[:5]
    
    context = {
        'user': request.user,
        'new_employees_today': get_new_employees_today(),
        'active_job_offers': active_job_offers
    }
    
    if request.user.role == 'employee':
        return render(request, 'core/employee_dashboard.html', context)
    elif request.user.role == 'hr_manager':
        # Ajouter des statistiques pour le HR Manager
        from datetime import date, timedelta
        from employees.models import Contract, Training
        
        try:
            context.update({
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
            })
        except Exception:
            # Valeurs par défaut en cas d'erreur
            context.update({
                'total_employees': 0,
                'pending_requests': 0,
                'active_trainings': 0,
                'expiring_contracts': 0
            })
        
        return render(request, 'core/hr_manager_dashboard.html', context)
    elif request.user.role == 'hr_director':
        return render(request, 'core/hr_director_dashboard.html', context)
    elif request.user.role == 'administrator':
        from datetime import date, timedelta
        from employees.models import Contract
        from recruitment.models import JobOffer
        try:
            context.update({
                'total_employees': Employee.objects.filter(statut='actif').count(),
                'total_users': User.objects.count(),
                'active_offers': JobOffer.objects.filter(status='published').count(),
                'expiring_contracts': Contract.objects.filter(
                    active=True,
                    date_fin__lte=date.today() + timedelta(days=30),
                    date_fin__gte=date.today()
                ).count(),
            })
        except Exception:
            context.update({'total_employees': 0, 'total_users': 0, 'active_offers': 0, 'expiring_contracts': 0})
        return render(request, 'core/admin_dashboard.html', context)
    return render(request, 'core/dashboard.html', context)

@login_required
def profile(request):
    try:
        employee = request.user.employee_profile
        contracts = employee.contracts.filter(active=True)
        
        # Check if employee is absent today
        from employees.utils import is_employee_absent_today
        is_absent = is_employee_absent_today(employee)
        
        # Get employee skills
        from knowledge_management.models import EmployeeSkill
        skills = EmployeeSkill.objects.filter(employee=employee).select_related('skill').order_by('skill__category', 'skill__name')
        
        return render(request, 'core/profile.html', {
            'employee': employee, 
            'contracts': contracts,
            'is_absent': is_absent,
            'skills': skills
        })
    except Employee.DoesNotExist:
        return render(request, 'core/profile.html', {'user': request.user})

def is_hr_director(user):
    return user.role == 'hr_director'

def is_administrator(user):
    return user.role == 'administrator'

@login_required
def hr_policies(request):
    policies = HRPolicy.objects.filter(is_active=True)
    return render(request, 'core/hr_policies.html', {'policies': policies})

@user_passes_test(is_administrator)
def manage_users(request):
    users = User.objects.all().order_by('date_joined')
    return render(request, 'core/users.html', {'users': users})


@user_passes_test(is_administrator)
def admin_create_user(request):
    if request.method == 'POST':
        username  = request.POST.get('username', '').strip()
        email     = request.POST.get('email', '').strip()
        first_name = request.POST.get('first_name', '').strip()
        last_name  = request.POST.get('last_name', '').strip()
        phone      = request.POST.get('phone', '').strip()
        role       = request.POST.get('role', 'employee')
        password   = request.POST.get('password', '')

        if User.objects.filter(username=username).exists():
            messages.error(request, "Ce nom d'utilisateur existe déjà.")
        elif User.objects.filter(email=email).exists():
            messages.error(request, "Cet email est déjà utilisé.")
        elif len(password) < 6:
            messages.error(request, "Le mot de passe doit contenir au moins 6 caractères.")
        else:
            User.objects.create_user(
                username=username, email=email, password=password,
                first_name=first_name, last_name=last_name,
                phone=phone, role=role,
            )
            messages.success(request, f"Compte « {username} » créé avec succès.")
            return redirect('manage_users')
    return render(request, 'core/user_form.html', {'action': 'create'})


@user_passes_test(is_administrator)
def admin_edit_user(request, user_id):
    from django.shortcuts import get_object_or_404
    target = get_object_or_404(User, id=user_id)
    if request.method == 'POST':
        target.first_name = request.POST.get('first_name', target.first_name)
        target.last_name  = request.POST.get('last_name',  target.last_name)
        target.email      = request.POST.get('email',      target.email)
        target.phone      = request.POST.get('phone',      target.phone or '')
        target.role       = request.POST.get('role',       target.role)
        new_pwd = request.POST.get('new_password', '').strip()
        if new_pwd:
            if len(new_pwd) < 6:
                messages.error(request, "Le mot de passe doit contenir au moins 6 caractères.")
                return render(request, 'core/user_form.html', {'action': 'edit', 'target': target})
            target.set_password(new_pwd)
        target.save()
        messages.success(request, "Compte mis à jour avec succès.")
        return redirect('manage_users')
    return render(request, 'core/user_form.html', {'action': 'edit', 'target': target})


@user_passes_test(is_administrator)
def admin_toggle_user(request, user_id):
    from django.shortcuts import get_object_or_404
    if request.method == 'POST':
        target = get_object_or_404(User, id=user_id)
        if target.id == request.user.id:
            messages.error(request, "Vous ne pouvez pas désactiver votre propre compte.")
        else:
            target.is_active = not target.is_active
            target.save()
            state = "activé" if target.is_active else "désactivé"
            messages.success(request, f"Compte « {target.username} » {state}.")
    return redirect('manage_users')


@user_passes_test(is_administrator)
def system_management(request):
    return render(request, 'core/system_management.html')

@user_passes_test(is_administrator)
def department_structure_management(request):
    from employees.models import Department
    from knowledge_management.models import Position

    context = {
        'departments_count': Department.objects.count(),
        'positions_count': Position.objects.count(),
        'departments': Department.objects.select_related('manager__user').order_by('name'),
        'positions': Position.objects.select_related('department').order_by('department__name', 'name'),
    }
    return render(request, 'core/department_structure_management.html', context)

@user_passes_test(is_administrator)

def department_create(request):
    from employees.forms import DepartmentForm

    form = DepartmentForm(request.POST or None)
    if request.method == 'POST' and form.is_valid():
        department = form.save()
        messages.success(request, f'Département "{department.name}" créé avec succès.')
        return redirect('department_structure_management')

    return render(request, 'core/department_form.html', {
        'form': form,
        'title': 'Nouveau département',
        'submit_label': 'Créer le département',
    })

@user_passes_test(is_administrator)
def department_edit(request, department_id):
    from employees.models import Department
    from employees.forms import DepartmentForm

    department = get_object_or_404(Department, id=department_id)
    form = DepartmentForm(request.POST or None, instance=department)
    if request.method == 'POST' and form.is_valid():
        department = form.save()
        messages.success(request, f'Département "{department.name}" mis à jour avec succès.')
        return redirect('department_structure_management')

    return render(request, 'core/department_form.html', {
        'form': form,
        'title': f'Modifier {department.name}',
        'submit_label': 'Enregistrer les changements',
        'department': department,
    })

@user_passes_test(is_administrator)
def position_create(request):
    from knowledge_management.forms import PositionForm

    form = PositionForm(request.POST or None)
    if request.method == 'POST' and form.is_valid():
        position = form.save()
        messages.success(request, f'Poste "{position.name}" créé avec succès.')
        return redirect('department_structure_management')

    return render(request, 'core/position_form.html', {
        'form': form,
        'title': 'Nouveau poste / structure',
        'submit_label': 'Créer le poste',
    })

@user_passes_test(is_administrator)
def position_edit(request, position_id):
    from knowledge_management.models import Position
    from knowledge_management.forms import PositionForm

    position = get_object_or_404(Position, id=position_id)
    form = PositionForm(request.POST or None, instance=position)
    if request.method == 'POST' and form.is_valid():
        position = form.save()
        messages.success(request, f'Poste "{position.name}" mis à jour avec succès.')
        return redirect('department_structure_management')

    return render(request, 'core/position_form.html', {
        'form': form,
        'title': f'Modifier {position.name}',
        'submit_label': 'Enregistrer les changements',
        'position': position,
    })

@user_passes_test(is_hr_director)
def kpi_dashboard(request):
    import json
    from employees.utils import (
        get_employees_absent_today, get_total_absences_this_month,
        get_total_absence_days_this_month, get_average_absence_days_per_employee,
        get_absence_rate, get_employees_exceeding_threshold, get_absence_data_for_chart,
        get_training_stats
    )
    
    try:
        total_employees = Employee.objects.count()
        pending_requests = (LeaveRequest.objects.filter(status='pending').count() + 
                           AttestationRequest.objects.filter(status='pending').count() +
                           MissionOrderRequest.objects.filter(status='pending').count() +
                           PayslipRequest.objects.filter(status='pending').count())
        
        # Absence KPIs
        absent_today = get_employees_absent_today().count()
        total_absences = get_total_absences_this_month()
        absence_rate = get_absence_rate()
        avg_absence_days = get_average_absence_days_per_employee()
        employees_over_threshold = get_employees_exceeding_threshold()
        chart_data = json.dumps(get_absence_data_for_chart())
        
        # Training KPIs
        training_stats = get_training_stats()
        
        context = {
            'total_employees': total_employees,
            'pending_requests': pending_requests,
            'absent_today': absent_today,
            'total_absences': total_absences,
            'absence_rate': absence_rate,
            'avg_absence_days': avg_absence_days,
            'employees_over_threshold': employees_over_threshold,
            'chart_data': chart_data,
            'training_stats': training_stats,
        }
    except Exception as e:
        messages.error(request, f'Erreur lors du calcul des KPI: {str(e)}')
        context = {
            'total_employees': 0,
            'pending_requests': 0,
            'absent_today': 0,
            'total_absences': 0,
            'absence_rate': 0,
            'avg_absence_days': 0,
            'employees_over_threshold': [],
            'chart_data': '[]',
            'training_stats': {'employees_training_data': [], 'total_trainings': 0, 'participation_rate': 0},
        }
    
    return render(request, 'core/kpi_dashboard.html', context)

@user_passes_test(is_hr_director)
def create_policy(request):
    if request.method == 'POST':
        HRPolicy.objects.create(
            name=request.POST['name'],
            description=request.POST['description'],
            created_by=request.user,
            is_active=True
        )
        messages.success(request, 'Politique RH créée avec succès')
        return redirect('hr_policies')
    
    return render(request, 'core/create_policy.html')

@user_passes_test(is_hr_director)
def edit_policy(request, policy_id):
    from django.shortcuts import get_object_or_404
    policy = get_object_or_404(HRPolicy, id=policy_id)
    
    if request.method == 'POST':
        policy.name = request.POST['name']
        policy.description = request.POST['description']
        policy.is_active = 'is_active' in request.POST
        policy.save()
        
        messages.success(request, 'Politique RH modifiée avec succès')
        return redirect('hr_policies')
    
    return render(request, 'core/edit_policy.html', {'policy': policy})

@login_required
def manage_events(request):
    from .models import Event
    if request.user.role in ['hr_director', 'administrator']:
        events = Event.objects.all().order_by('-created_at')
    elif request.user.role == 'hr_manager':
        events = Event.objects.filter(created_by=request.user).order_by('-created_at')
    else:
        events = Event.objects.filter(status='approved').order_by('-created_at')
    return render(request, 'core/events.html', {'events': events})

@login_required
def event_detail(request, event_id):
    from .models import Event

    if request.user.role in ['hr_director', 'administrator']:
        event = get_object_or_404(Event, id=event_id)
    elif request.user.role == 'hr_manager':
        event = get_object_or_404(Event, id=event_id, created_by=request.user)
    else:
        event = get_object_or_404(Event, id=event_id, status='approved')

    return render(request, 'core/event_detail.html', {'event': event})

@user_passes_test(is_hr_manager_or_director)
def create_event(request):
    from .models import Event
    if request.method == 'POST':
        Event.objects.create(
            name=request.POST['name'],
            description=request.POST['description'],
            date=request.POST['date'],
            location=request.POST['location'],
            created_by=request.user,
            status='pending'
        )
        messages.success(request, 'Événement créé et en attente de validation')
        return redirect('manage_events')
    
    return render(request, 'core/create_event.html')

@user_passes_test(is_hr_director)
def approve_event(request, event_id):
    from .models import Event
    from django.utils import timezone
    event = get_object_or_404(Event, id=event_id)
    event.status = 'approved'
    event.approved_by = request.user
    event.approved_at = timezone.now()
    event.save()
    
    messages.success(request, f'Événement "{event.name}" approuvé')
    return redirect('manage_events')

@user_passes_test(is_hr_director)
def reject_event(request, event_id):
    from .models import Event
    from django.utils import timezone
    event = get_object_or_404(Event, id=event_id)
    event.status = 'rejected'
    event.approved_by = request.user
    event.approved_at = timezone.now()
    event.save()
    
    messages.success(request, f'Événement "{event.name}" rejeté')
    return redirect('manage_events')
