from django.shortcuts import render, redirect, get_object_or_404
from django.contrib.auth.decorators import login_required, user_passes_test
from django.contrib import messages
from django.http import JsonResponse
from django.utils import timezone
from datetime import date, timedelta
from .models import (
    ChecklistItem, OnboardingPlan, OnboardingDocument, OnboardingTask, 
    OnboardingTraining, OnboardingFollowUp, create_default_checklist, 
    get_onboarding_progress, create_onboarding_plan
)
from employees.models import Employee

def is_hr_manager_or_director(user):
    """Check if user is HR Manager or Director"""
    return user.role in ['hr_manager', 'hr_director']

def can_manage_onboarding(user, employee):
    """Check if user can manage this employee's onboarding"""
    if user.role in ['hr_manager', 'hr_director']:
        return True
    # Check if user is the assigned manager
    if hasattr(user, 'employee_profile') and employee.assigned_manager:
        return user.employee_profile == employee.assigned_manager
    return False

# Dashboard View
@user_passes_test(is_hr_manager_or_director)
def onboarding_dashboard(request):
    """Main onboarding dashboard with KPIs"""
    # Get employees in onboarding (those with onboarding plans)
    onboarding_employees = Employee.objects.filter(onboarding_plan__isnull=False).distinct()
    
    stats = {
        'total_new_employees': onboarding_employees.count(),
        'employees_in_progress': onboarding_employees.filter(onboarding_status='in_progress').count(),
        'completed_onboarding': onboarding_employees.filter(onboarding_status='completed').count(),
        'avg_progress': 0,
        'pending_tasks': OnboardingTask.objects.filter(is_completed=False).count(),

        'pending_trainings': OnboardingTraining.objects.filter(is_completed=False).count(),
        'pending_followups': OnboardingFollowUp.objects.filter(is_completed=False, scheduled_date__lte=date.today()).count()
    }
    
    # Calculate average progress
    if onboarding_employees.exists():
        total_progress = sum(emp.onboarding_progress for emp in onboarding_employees)
        stats['avg_progress'] = round(total_progress / onboarding_employees.count())
    
    recent_employees = onboarding_employees.order_by('-date_embauche')[:5]
    
    # Get urgent tasks and overdue items
    urgent_tasks = OnboardingTask.objects.filter(
        is_completed=False, 
        due_date__lte=date.today() + timedelta(days=3)
    ).order_by('due_date')[:10]
    
    overdue_followups = OnboardingFollowUp.objects.filter(
        is_completed=False,
        scheduled_date__lt=date.today()
    ).order_by('scheduled_date')[:5]
    
    return render(request, 'onboarding/dashboard.html', {
        'stats': stats,
        'recent_employees': recent_employees,
        'urgent_tasks': urgent_tasks,
        'overdue_followups': overdue_followups,
    })

# Employee Onboarding Views
@user_passes_test(is_hr_manager_or_director)
def employee_onboarding_list(request):
    """List all employees in onboarding"""
    employees = Employee.objects.filter(onboarding_plan__isnull=False).distinct()
    return render(request, 'onboarding/employee_list.html', {'employees': employees})

@user_passes_test(is_hr_manager_or_director)
def start_onboarding(request, pk):
    """Start onboarding process for an employee"""
    employee = get_object_or_404(Employee, pk=pk)
    
    if request.method == 'POST':
        start_date = request.POST.get('start_date')
        expected_completion_date = request.POST.get('expected_completion_date')
        manager_id = request.POST.get('assigned_manager')
        
        if start_date and expected_completion_date:
            from datetime import datetime
            start_date = datetime.strptime(start_date, '%Y-%m-%d').date()
            expected_completion_date = datetime.strptime(expected_completion_date, '%Y-%m-%d').date()
            
            # Assigner le manager si sélectionné
            if manager_id:
                try:
                    manager = Employee.objects.get(id=manager_id)
                    employee.assigned_manager = manager
                    employee.save()  # Sauvegarder le manager avant de créer le plan
                except Employee.DoesNotExist:
                    pass
            
            # Créer le plan d'intégration complet
            if not hasattr(employee, 'onboarding_plan'):
                plan = create_onboarding_plan(employee, request.user, start_date, expected_completion_date)
                employee.onboarding_status = 'in_progress'
                employee.save()
                messages.success(request, f'Plan d\'intégration créé pour {employee.user.get_full_name()}')
            else:
                messages.info(request, f'{employee.user.get_full_name()} a déjà un plan d\'intégration')
            
            return redirect('employee_onboarding_detail', pk=pk)
        else:
            messages.error(request, 'Veuillez remplir toutes les dates')
    
    # Check if already has onboarding
    if hasattr(employee, 'onboarding_plan'):
        messages.info(request, f'{employee.user.get_full_name()} a déjà un processus d\'onboarding')
        return redirect('employee_onboarding_detail', pk=pk)
    
    # Liste des managers potentiels (tous les employés actifs)
    potential_managers = Employee.objects.filter(statut='actif').exclude(id=employee.id)
    
    return render(request, 'onboarding/start_onboarding.html', {
        'employee': employee,
        'potential_managers': potential_managers
    })

@login_required
def employee_onboarding_detail(request, pk):
    """View employee onboarding details and status"""
    employee = get_object_or_404(Employee, pk=pk)
    
    # Check permissions
    if not can_manage_onboarding(request.user, employee):
        messages.error(request, 'Vous n\'avez pas l\'autorisation d\'accéder à cette page')
        return redirect('onboarding_dashboard')
    
    # Get all onboarding data
    onboarding_plan = getattr(employee, 'onboarding_plan', None)
    checklist_items = employee.onboarding_checklist.all()
    tasks = employee.onboarding_tasks.all()
    trainings = employee.onboarding_trainings.all()
    followups = employee.onboarding_followups.all()
    
    # Calculate statistics
    stats = {
        'total_tasks': tasks.count(),
        'completed_tasks': tasks.filter(is_completed=True).count(),
        'total_trainings': trainings.count(),
        'completed_trainings': trainings.filter(is_completed=True).count(),
        'total_followups': followups.count(),
        'completed_followups': followups.filter(is_completed=True).count(),
    }
    
    return render(request, 'onboarding/employee_detail.html', {
        'employee': employee,
        'onboarding_plan': onboarding_plan,
        'checklist_items': checklist_items,
        'tasks': tasks,
        'trainings': trainings,
        'followups': followups,
        'stats': stats,
    })

# Checklist Management Views
@login_required
def checklist_view(request, pk):
    """View and manage checklist for employee"""
    employee = get_object_or_404(Employee, pk=pk)
    
    # Check permissions
    if not can_manage_onboarding(request.user, employee):
        messages.error(request, 'Vous n\'avez pas l\'autorisation d\'accéder à cette page')
        return redirect('onboarding_dashboard')
    
    checklist_items = employee.onboarding_checklist.all()
    
    return render(request, 'onboarding/checklist.html', {
        'employee': employee,
        'checklist_items': checklist_items,
    })

@login_required
def toggle_checklist_item(request, pk):
    """Toggle checklist item completion status (AJAX)"""
    if request.method != 'POST':
        return JsonResponse({'error': 'Method not allowed'}, status=405)
    
    item = get_object_or_404(ChecklistItem, pk=pk)
    
    # Check permissions
    if not can_manage_onboarding(request.user, item.employee):
        return JsonResponse({'error': 'Permission denied'}, status=403)
    
    # Toggle completion status
    if item.is_completed:
        item.is_completed = False
        item.completion_date = None
        item.completed_by = None
    else:
        item.mark_completed(request.user)
    
    item.save()
    
    # Return updated data
    return JsonResponse({
        'success': True,
        'is_completed': item.is_completed,
        'completion_date': item.completion_date.strftime('%d/%m/%Y %H:%M') if item.completion_date else None,
        'completed_by': item.completed_by.get_full_name() if item.completed_by else None,
        'progress': item.employee.onboarding_progress
    })

# Progress Tracking Views
@user_passes_test(is_hr_manager_or_director)
def progress_overview(request):
    """Overview of all employees' onboarding progress"""
    employees = Employee.objects.filter(onboarding_plan__isnull=False).distinct()
    
    # Group by progress ranges
    progress_data = {
        'not_started': employees.filter(onboarding_status='not_started'),
        'in_progress': employees.filter(onboarding_status='in_progress'),
        'completed': employees.filter(onboarding_status='completed')
    }
    
    return render(request, 'onboarding/progress_overview.html', {
        'progress_data': progress_data,
        'employees': employees,
    })

# Add Employee to Onboarding
@user_passes_test(is_hr_manager_or_director)
def select_employee_for_onboarding(request):
    """Select an employee to add to onboarding process"""
    # Get employees who are not yet in onboarding
    available_employees = Employee.objects.exclude(onboarding_plan__isnull=False)
    
    if request.method == 'POST':
        employee_id = request.POST.get('employee_id')
        if employee_id:
            employee = get_object_or_404(Employee, pk=employee_id)
            return redirect('start_onboarding', pk=employee.pk)
    
    return render(request, 'onboarding/select_employee.html', {
        'available_employees': available_employees,
    })



# Task Management Views
@login_required
def complete_task(request, pk):
    """Mark a task as completed"""
    task = get_object_or_404(OnboardingTask, pk=pk)
    
    # Check if user is assigned to this task or can manage onboarding
    if request.user != task.assigned_to and not can_manage_onboarding(request.user, task.employee):
        messages.error(request, 'Vous n\'avez pas l\'autorisation de compléter cette tâche')
        return redirect('onboarding_dashboard')
    
    if request.method == 'POST':
        if not task.is_completed:
            task.mark_completed(request.user)
            messages.success(request, f'Tâche "{task.title}" marquée comme terminée')
        else:
            messages.info(request, 'Cette tâche est déjà terminée')
    
    return redirect('employee_onboarding_detail', pk=task.employee.pk)

# Training Management Views
@login_required
def complete_training(request, pk):
    """Mark a training as completed"""
    training = get_object_or_404(OnboardingTraining, pk=pk)
    
    # Check permissions
    if not can_manage_onboarding(request.user, training.employee):
        messages.error(request, 'Vous n\'avez pas l\'autorisation de modifier cette formation')
        return redirect('onboarding_dashboard')
    
    if request.method == 'POST':
        completion_date = request.POST.get('completion_date')
        score = request.POST.get('score')
        
        if completion_date:
            from datetime import datetime
            completion_date = datetime.strptime(completion_date, '%Y-%m-%d').date()
            training.mark_completed(completion_date, int(score) if score else None)
            messages.success(request, f'Formation "{training.title}" marquée comme terminée')
        else:
            messages.error(request, 'Veuillez fournir une date de completion')
    
    return redirect('employee_onboarding_detail', pk=training.employee.pk)

# Follow-up Management Views
@login_required
def conduct_followup(request, pk):
    """Conduct a follow-up meeting"""
    followup = get_object_or_404(OnboardingFollowUp, pk=pk)
    
    # Check permissions
    if request.user != followup.conducted_by and not can_manage_onboarding(request.user, followup.employee):
        messages.error(request, 'Vous n\'avez pas l\'autorisation de conduire ce suivi')
        return redirect('onboarding_dashboard')
    
    if request.method == 'POST':
        conducted_date = request.POST.get('conducted_date')
        employee_feedback = request.POST.get('employee_feedback')
        manager_feedback = request.POST.get('manager_feedback')
        hr_notes = request.POST.get('hr_notes')
        overall_rating = request.POST.get('overall_rating')
        
        if conducted_date:
            from datetime import datetime
            followup.conducted_date = datetime.strptime(conducted_date, '%Y-%m-%d').date()
            followup.employee_feedback = employee_feedback
            followup.manager_feedback = manager_feedback
            followup.hr_notes = hr_notes
            if overall_rating:
                followup.overall_rating = int(overall_rating)
            followup.is_completed = True
            followup.save()
            
            messages.success(request, f'Suivi "{followup.get_follow_up_type_display()}" enregistré')
            return redirect('employee_onboarding_detail', pk=followup.employee.pk)
        else:
            messages.error(request, 'Veuillez fournir une date de conduite')
    
    return render(request, 'onboarding/conduct_followup.html', {'followup': followup})



# Dashboard for employees
@login_required
def employee_onboarding_portal(request):
    """Portal for employees to view their onboarding progress"""
    if not hasattr(request.user, 'employee_profile'):
        messages.error(request, 'Vous n\'avez pas de profil employé')
        return redirect('login')
    
    employee = request.user.employee_profile
    
    # Get onboarding data
    onboarding_plan = getattr(employee, 'onboarding_plan', None)
    if not onboarding_plan:
        return render(request, 'onboarding/employee_portal_no_plan.html')
    
    documents = employee.onboarding_documents.all()
    tasks = employee.onboarding_tasks.filter(assigned_to=request.user)
    trainings = employee.onboarding_trainings.all()
    followups = employee.onboarding_followups.all()
    
    # Calculate progress
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
    
    return render(request, 'onboarding/employee_portal.html', {
        'employee': employee,
        'onboarding_plan': onboarding_plan,
        'tasks': tasks,
        'trainings': trainings,
        'followups': followups,
        'progress': progress,
    })