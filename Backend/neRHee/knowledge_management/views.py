from django.shortcuts import render, get_object_or_404, redirect
from django.contrib.auth.decorators import login_required, user_passes_test
from django.contrib import messages
from django.db.models import Q, Count, Avg
from django.http import JsonResponse
from django.db import models
from employees.models import Employee, Department
from .models import Skill, Position, EmployeeSkill, EmployeePosition, Document, TrainingRecommendation, DepartmentSkillMatrix
from .forms import SkillForm, PositionForm, EmployeeSkillForm, EmployeePositionForm, DocumentForm, QuickPositionForm
from django.db.models import Count, Avg
import json

def is_hr_staff(user):
    return user.role in ['hr_manager', 'hr_director', 'administrator']

@login_required
def dashboard(request):
    """Dashboard principal Formation et Gestion de Connaissances"""
    context = {
        'total_skills': Skill.objects.count(),
        'total_positions': Position.objects.count(),
        'total_documents': Document.objects.filter(is_active=True).count(),
        'my_recommendations': TrainingRecommendation.objects.filter(
            employee__user=request.user, status='pending'
        ).count() if hasattr(request.user, 'employee_profile') else 0,
    }
    return render(request, 'knowledge_management/dashboard.html', context)

# === MAÎTRISE DE COMPÉTENCES ===
@login_required
def skills_matrix(request):
    """Matrice des compétences par département"""
    departments = Department.objects.all().order_by('name')
    selected_department = request.GET.get('department')
    
    context = {
        'departments': departments,
        'selected_department': selected_department,
    }
    
    if selected_department:
        try:
            dept = Department.objects.get(id=selected_department)
            context['selected_department_obj'] = dept
            
            # Compétences du département + compétences transversales
            skills = Skill.objects.filter(
                models.Q(departments=dept) | models.Q(is_core_skill=True)
            ).distinct().order_by('category', 'name')
            
            # Employés du département
            employees = Employee.objects.filter(department=dept).select_related('user').prefetch_related('skills__skill')
            
            # Créer automatiquement les EmployeeSkill manquants
            for employee in employees:
                for skill in skills:
                    EmployeeSkill.objects.get_or_create(
                        employee=employee,
                        skill=skill,
                        defaults={
                            'level': 0,  # Non évalué
                            'updated_by': request.user
                        }
                    )
            
            matrix_data = []
            for employee in employees:
                # Recharger les compétences après création
                skills_dict = {skill.skill.id: skill for skill in employee.skills.all()}
                employee_data = {
                    'employee': employee,
                    'skills_list': [skills_dict.get(skill.id) for skill in skills]
                }
                matrix_data.append(employee_data)
            
            context.update({
                'skills': skills,
                'matrix_data': matrix_data,
                'employees_count': employees.count(),
                'skills_count': skills.count(),
            })
            
        except Department.DoesNotExist:
            messages.error(request, "Département non trouvé")
    
    return render(request, 'knowledge_management/skills_matrix.html', context)

@login_required
def employee_skills(request, employee_id=None):
    """Compétences individuelles d'un employé"""
    if employee_id:
        employee = get_object_or_404(Employee, id=employee_id)
        if request.user.role == 'employee' and request.user.employee_profile != employee:
            messages.error(request, "Accès non autorisé")
            return redirect('knowledge_management:my_skills')
    else:
        try:
            employee = Employee.objects.get(user=request.user)
        except Employee.DoesNotExist:
            # Si l'utilisateur RH n'a pas de profil employé, créer un profil automatiquement
            if request.user.role in ['hr_manager', 'hr_director']:
                from employees.models import Department
                # Créer ou récupérer le département RH
                hr_dept, created = Department.objects.get_or_create(
                    name='Ressources Humaines',
                    defaults={'code': 'RH', 'description': 'Département des Ressources Humaines'}
                )
                
                # Créer le profil employé pour le RH
                import random
                matricule = f"RH{random.randint(1000, 9999)}"
                while Employee.objects.filter(matricule=matricule).exists():
                    matricule = f"RH{random.randint(1000, 9999)}"
                
                employee = Employee.objects.create(
                    user=request.user,
                    matricule=matricule,
                    poste='Responsable RH' if request.user.role == 'hr_manager' else 'Directeur RH',
                    department=hr_dept,
                    statut='actif'
                )
                messages.success(request, "Profil employé créé automatiquement")
            else:
                messages.error(request, "Profil employé non trouvé")
                return redirect('knowledge_management:dashboard')
    
    # Créer automatiquement les compétences manquantes si l'employé a un département
    if employee.department:
        dept_skills = Skill.objects.filter(
            models.Q(departments=employee.department) | models.Q(is_core_skill=True)
        ).distinct()
        
        for skill in dept_skills:
            EmployeeSkill.objects.get_or_create(
                employee=employee,
                skill=skill,
                defaults={
                    'level': 0,
                    'updated_by': request.user
                }
            )
    
    skills = employee.skills.select_related('skill').order_by('skill__category', 'skill__name')
    recommendations = employee.training_recommendations.filter(status='pending', skill__isnull=False)
    
    context = {
        'employee': employee,
        'skills': skills,
        'recommendations': recommendations,
        'can_edit': is_hr_staff(request.user),
    }
    return render(request, 'knowledge_management/employee_skills.html', context)

@login_required
@user_passes_test(is_hr_staff)
def quick_skill_update(request, employee_id, skill_id):
    """Mise à jour rapide d'une compétence depuis la matrice"""
    employee = get_object_or_404(Employee, id=employee_id)
    skill = get_object_or_404(Skill, id=skill_id)
    
    try:
        employee_skill = EmployeeSkill.objects.get(employee=employee, skill=skill)
    except EmployeeSkill.DoesNotExist:
        employee_skill = EmployeeSkill.objects.create(
            employee=employee,
            skill=skill,
            level=0,
            updated_by=request.user
        )
    
    if request.method == 'POST':
        level = int(request.POST.get('level', 0))
        certified = request.POST.get('certified') == 'on'
        
        employee_skill.level = level
        employee_skill.certified = certified
        employee_skill.updated_by = request.user
        employee_skill.save()
        
        messages.success(request, f"Compétence {skill.name} mise à jour pour {employee.user.get_full_name()}")
        from django.urls import reverse
        url = reverse('knowledge_management:skills_matrix') + f'?department={employee.department.id}'
        return redirect(url)
    
    context = {
        'employee': employee,
        'skill': skill,
        'current_level': employee_skill.level,
        'is_certified': employee_skill.certified,
    }
    return render(request, 'knowledge_management/quick_skill_update.html', context)

@login_required
@user_passes_test(is_hr_staff)
def update_employee_skill(request, employee_id, skill_id=None):
    """Mettre à jour/ajouter une compétence"""
    employee = get_object_or_404(Employee, id=employee_id)
    
    if skill_id:
        employee_skill = get_object_or_404(EmployeeSkill, employee=employee, skill_id=skill_id)
        form = EmployeeSkillForm(request.POST or None, instance=employee_skill, employee=employee)
    else:
        form = EmployeeSkillForm(request.POST or None, employee=employee)
    
    if request.method == 'POST' and form.is_valid():
        skill_obj = form.save(commit=False)
        skill_obj.employee = employee
        skill_obj.updated_by = request.user
        skill_obj.save()
        
        messages.success(request, "Compétence mise à jour")
        return redirect('knowledge_management:employee_skills', employee_id=employee.id)
    
    context = {
        'form': form,
        'employee': employee,
        'is_update': bool(skill_id),
    }
    return render(request, 'knowledge_management/update_skill.html', context)

# === POLYVALENCE ===
@login_required
def department_matrix(request):
    """Matrice de compétences par département"""
    departments = Department.objects.all().order_by('name')
    selected_department = request.GET.get('department')
    
    context = {
        'departments': departments,
        'selected_department': selected_department,
    }
    
    if selected_department:
        try:
            dept = Department.objects.get(id=selected_department)
            context['selected_department_obj'] = dept
            
            # Statistiques du département
            employees = dept.employees.all()
            context['employees_count'] = employees.count()
            context['skills_count'] = dept.skills.count()
            context['positions_count'] = dept.positions.count()
            
            # Matrice des compétences
            skill_matrices = []
            matrices = DepartmentSkillMatrix.objects.filter(department=dept).select_related('skill')
            
            for matrix in matrices:
                # Calculer la couverture actuelle
                competent_employees = EmployeeSkill.objects.filter(
                    employee__department=dept,
                    skill=matrix.skill,
                    level__gte=2  # Niveau intermédiaire minimum
                ).count()
                
                current_coverage = 0
                if context['employees_count'] > 0:
                    current_coverage = round((competent_employees / context['employees_count']) * 100)
                
                gap = max(0, matrix.target_coverage - current_coverage)
                
                skill_matrices.append({
                    'skill': matrix.skill,
                    'target_coverage': matrix.target_coverage,
                    'priority': matrix.priority,
                    'competent_employees': competent_employees,
                    'current_coverage': current_coverage,
                    'gap': gap,
                })
            
            context['skill_matrices'] = skill_matrices
            
            # Couverture moyenne
            if skill_matrices:
                context['avg_coverage'] = round(sum(m['current_coverage'] for m in skill_matrices) / len(skill_matrices))
            else:
                context['avg_coverage'] = 0
            
            # Top employés polyvalents
            top_employees = employees.annotate(
                skills_count=Count('skills')
            ).order_by('-skills_count')[:5]
            context['top_versatile_employees'] = top_employees
            
            # Données pour le graphique des niveaux
            skill_levels = [0, 0, 0, 0]  # Débutant, Intermédiaire, Confirmé, Expert
            for employee in employees:
                for skill in employee.skills.all():
                    if skill.level <= 4:
                        skill_levels[skill.level - 1] += 1
            
            context['skill_levels_data'] = json.dumps(skill_levels)
            
        except Department.DoesNotExist:
            messages.error(request, "Département non trouvé")
    
    return render(request, 'knowledge_management/department_matrix.html', context)

@login_required
def versatility_matrix(request):
    """Matrice de polyvalence Employés × Postes par département"""
    departments = Department.objects.all().order_by('name')
    selected_department = request.GET.get('department')
    
    context = {
        'departments': departments,
        'selected_department': selected_department,
    }
    
    if selected_department:
        try:
            dept = Department.objects.get(id=selected_department)
            context['selected_department_obj'] = dept
            
            positions = Position.objects.filter(department=dept).order_by('name')
            employees = Employee.objects.filter(department=dept).select_related('user').prefetch_related('positions__position')
            
            matrix_data = []
            for employee in employees:
                positions_dict = {pos.position.id: pos for pos in employee.positions.all()}
                employee_data = {
                    'employee': employee,
                    'positions_data': []
                }
                
                for position in positions:
                    emp_pos = positions_dict.get(position.id)
                    employee_data['positions_data'].append({
                        'position': position,
                        'employee_position': emp_pos
                    })
                
                matrix_data.append(employee_data)
            
            context.update({
                'positions': positions,
                'matrix_data': matrix_data,
                'employees_count': employees.count(),
                'positions_count': positions.count(),
            })
            
        except Department.DoesNotExist:
            messages.error(request, "Département non trouvé")
    
    return render(request, 'knowledge_management/versatility_matrix.html', context)

@login_required
@user_passes_test(is_hr_staff)
def quick_position_update(request, employee_id, position_id):
    """Mise à jour rapide du niveau d'autonomie depuis la matrice"""
    employee = get_object_or_404(Employee, id=employee_id)
    position = get_object_or_404(Position, id=position_id)
    
    try:
        employee_position = EmployeePosition.objects.get(employee=employee, position=position)
    except EmployeePosition.DoesNotExist:
        employee_position = EmployeePosition.objects.create(
            employee=employee,
            position=position,
            autonomy_level=1,
            updated_by=request.user
        )
    
    if request.method == 'POST':
        autonomy_level = int(request.POST.get('autonomy_level', 1))
        
        employee_position.autonomy_level = autonomy_level
        employee_position.updated_by = request.user
        employee_position.save()
        
        messages.success(request, f"Niveau d'autonomie mis à jour pour {position.name}")
        from django.urls import reverse
        url = reverse('knowledge_management:versatility_matrix') + f'?department={employee.department.id}'
        return redirect(url)
    
    context = {
        'employee': employee,
        'position': position,
        'current_level': employee_position.autonomy_level,
        'autonomy_choices': EmployeePosition.AUTONOMY_LEVELS,
    }
    return render(request, 'knowledge_management/quick_position_update.html', context)

@login_required
@user_passes_test(is_hr_staff)
def update_employee_position(request, employee_id, position_id=None):
    """Mettre à jour/ajouter une polyvalence"""
    employee = get_object_or_404(Employee, id=employee_id)
    
    if position_id:
        employee_position = get_object_or_404(EmployeePosition, employee=employee, position_id=position_id)
        form = EmployeePositionForm(request.POST or None, instance=employee_position)
    else:
        form = EmployeePositionForm(request.POST or None)
    
    if request.method == 'POST' and form.is_valid():
        pos_obj = form.save(commit=False)
        pos_obj.employee = employee
        pos_obj.updated_by = request.user
        pos_obj.save()
        
        messages.success(request, "Polyvalence mise à jour")
        return redirect('knowledge_management:versatility_matrix')
    
    context = {
        'form': form,
        'employee': employee,
        'is_update': bool(position_id),
    }
    return render(request, 'knowledge_management/update_position.html', context)

# === GESTION DES CONNAISSANCES ===
@login_required
def documents_list(request):
    """Liste des documents"""
    category = request.GET.get('category', '')
    search = request.GET.get('search', '')
    
    documents = Document.objects.filter(is_active=True)
    
    if category:
        documents = documents.filter(category=category)
    if search:
        documents = documents.filter(
            Q(title__icontains=search) | Q(description__icontains=search)
        )
    
    documents = documents.order_by('-updated_at')
    
    context = {
        'documents': documents,
        'categories': Document.CATEGORIES,
        'current_category': category,
        'search_query': search,
        'can_manage': is_hr_staff(request.user),
    }
    return render(request, 'knowledge_management/documents_list.html', context)

@login_required
@user_passes_test(is_hr_staff)
def upload_document(request):
    """Télécharger un nouveau document"""
    if request.method == 'POST':
        form = DocumentForm(request.POST, request.FILES)
        if form.is_valid():
            document = form.save(commit=False)
            document.created_by = request.user
            document.save()
            
            messages.success(request, "Document téléchargé avec succès")
            return redirect('knowledge_management:documents_list')
    else:
        form = DocumentForm()
    
    context = {'form': form}
    return render(request, 'knowledge_management/upload_document.html', context)

@login_required
def document_detail(request, document_id):
    """Détail d'un document avec historique des versions"""
    document = get_object_or_404(Document, id=document_id, is_active=True)
    versions = document.versions.all()
    
    context = {
        'document': document,
        'versions': versions,
        'can_manage': is_hr_staff(request.user),
    }
    return render(request, 'knowledge_management/document_detail.html', context)

# === RECOMMANDATIONS ===
@login_required
def my_recommendations(request):
    """Mes recommandations de formation"""
    if not hasattr(request.user, 'employee_profile'):
        messages.error(request, "Profil employé non trouvé")
        return redirect('knowledge_management:dashboard')
    
    recommendations = request.user.employee_profile.training_recommendations.select_related('skill', 'position')
    
    context = {'recommendations': recommendations}
    return render(request, 'knowledge_management/my_recommendations.html', context)

@login_required
@user_passes_test(is_hr_staff)
def manage_skills_positions(request):
    """Gérer les compétences et postes"""
    skills = Skill.objects.all().order_by('category', 'name')
    positions = Position.objects.all().order_by('department', 'name')
    
    if request.method == 'POST':
        if 'add_skill' in request.POST:
            skill_form = SkillForm(request.POST)
            if skill_form.is_valid():
                skill_form.save()
                messages.success(request, "Compétence ajoutée")
                return redirect('knowledge_management:manage_skills_positions')
        elif 'add_position' in request.POST:
            position_form = PositionForm(request.POST)
            if position_form.is_valid():
                position_form.save()
                messages.success(request, "Poste ajouté")
                return redirect('knowledge_management:manage_skills_positions')
    
    context = {
        'skills': skills,
        'positions': positions,
        'skill_form': SkillForm(),
        'position_form': PositionForm(),
    }
    return render(request, 'knowledge_management/manage_skills_positions.html', context)