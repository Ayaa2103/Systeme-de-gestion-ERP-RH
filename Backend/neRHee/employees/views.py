from django.shortcuts import render, get_object_or_404, redirect
from django.contrib.auth.decorators import login_required, user_passes_test
from django.contrib import messages
from django.core.exceptions import ValidationError
from django.utils import timezone
from .models import Employee, Contract, Training
from core.models import User

def is_hr_manager(user):
    return user.role == 'hr_manager'

def is_hr_director(user):
    return user.role == 'hr_director'

def is_hr_manager_or_director(user):
    return user.role in ['hr_manager', 'hr_director']

def is_administrator(user):
    return user.role == 'administrator'

def can_view_employees(user):
    return user.role in ['hr_manager', 'hr_director', 'administrator']

def can_manage_employees(user):
    return user.role in ['hr_manager', 'administrator']

def can_edit_employees(user):
    return user.role in ['hr_manager', 'hr_director']

@user_passes_test(can_view_employees)
def employee_list(request):
    from .utils import is_employee_absent_today
    employees = Employee.objects.all()
    
    # Add absence status to each employee
    employees_with_status = []
    for employee in employees:
        employees_with_status.append({
            'employee': employee,
            'is_absent': is_employee_absent_today(employee)
        })
    
    return render(request, 'employees/employee_list.html', {'employees_with_status': employees_with_status})

@user_passes_test(can_view_employees)
def employee_detail(request, employee_id):
    employee = get_object_or_404(Employee, id=employee_id)
    contracts = employee.contracts.all()
    
    # Check if employee is absent today
    from .utils import is_employee_absent_today
    is_absent = is_employee_absent_today(employee)
    
    # Get employee skills
    from knowledge_management.models import EmployeeSkill
    skills = EmployeeSkill.objects.filter(employee=employee).select_related('skill').order_by('skill__category', 'skill__name')
    
    return render(request, 'employees/employee_detail.html', {
        'employee': employee, 
        'contracts': contracts,
        'is_absent': is_absent,
        'skills': skills
    })

def can_view_contracts(user):
    return user.role in ['hr_manager', 'hr_director', 'administrator']

@user_passes_test(can_view_contracts)
def manage_contracts(request):
    contracts = Contract.objects.all()
    return render(request, 'employees/contracts.html', {'contracts': contracts})

@user_passes_test(is_hr_manager_or_director)
def manage_training(request):
    if request.user.role == 'hr_director':
        trainings = Training.objects.all().order_by('-created_at')
    else:
        trainings = Training.objects.filter(created_by=request.user).order_by('-created_at')
    return render(request, 'employees/training.html', {'trainings': trainings})

@login_required
def my_trainings(request):
    """Vue pour que les employés consultent leurs formations"""
    try:
        employee = request.user.employee_profile
    except Employee.DoesNotExist:
        # Créer automatiquement un profil pour les RH
        if request.user.role in ['hr_manager', 'hr_director']:
            from employees.models import Department
            hr_dept, created = Department.objects.get_or_create(
                name='Ressources Humaines',
                defaults={'code': 'RH', 'description': 'Département des Ressources Humaines'}
            )
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
        else:
            messages.error(request, 'Profil employé non trouvé')
            return redirect('dashboard')
    
    trainings = employee.trainings.filter(status='approved').order_by('-start_date')
    from datetime import date
    return render(request, 'employees/my_trainings.html', {
        'trainings': trainings,
        'today': date.today()
    })

@user_passes_test(is_hr_manager_or_director)
def training_detail(request, training_id):
    training = get_object_or_404(Training, id=training_id)
    
    # Vérifier les permissions
    if request.user.role == 'hr_manager' and training.created_by != request.user:
        messages.error(request, 'Vous ne pouvez voir que vos propres formations')
        return redirect('manage_training')
    
    return render(request, 'employees/training_detail.html', {'training': training})

@login_required
def employee_training_detail(request, training_id):
    """Vue pour que les employés voient le détail de leurs formations"""
    training = get_object_or_404(Training, id=training_id)
    
    # Vérifier que l'employé est assigné à cette formation
    try:
        employee = request.user.employee_profile
        if not training.employees.filter(id=employee.id).exists():
            messages.error(request, 'Vous n\'êtes pas assigné à cette formation')
            return redirect('my_trainings')
    except Employee.DoesNotExist:
        messages.error(request, 'Profil employé non trouvé')
        return redirect('dashboard')
    
    from datetime import date
    return render(request, 'employees/employee_training_detail.html', {
        'training': training,
        'today': date.today()
    })

@user_passes_test(is_hr_manager)
def create_training(request):
    if request.method == 'POST':
        try:
            training = Training.objects.create(
                name=request.POST['name'],
                description=request.POST['description'],
                start_date=request.POST['start_date'],
                end_date=request.POST['end_date'],
                created_by=request.user,
                status='pending'
            )
            
            # Ajouter les employés sélectionnés
            employee_ids = request.POST.getlist('employees')
            if employee_ids:
                employees = Employee.objects.filter(id__in=employee_ids)
                training.employees.set(employees)
            
            messages.success(request, 'Formation créée et en attente de validation')
            return redirect('manage_training')
        except ValidationError as e:
            messages.error(request, f'Erreur de validation: {e}')
        except Exception as e:
            messages.error(request, f'Erreur lors de la création: {str(e)}')
    
    employees = Employee.objects.filter(statut='actif')
    return render(request, 'employees/create_training.html', {'employees': employees})

@user_passes_test(is_hr_director)
def approve_training(request, training_id):
    training = get_object_or_404(Training, id=training_id)
    
    if training.status != 'pending':
        messages.warning(request, 'Cette formation a déjà été traitée')
        return redirect('manage_training')
    
    try:
        training.status = 'approved'
        training.approved_by = request.user
        training.approved_at = timezone.now()
        training.save()
        
        messages.success(request, f'Formation "{training.name}" approuvée')
    except Exception as e:
        messages.error(request, f'Erreur lors de l\'approbation: {str(e)}')
    
    return redirect('manage_training')

@user_passes_test(is_hr_director)
def reject_training(request, training_id):
    training = get_object_or_404(Training, id=training_id)
    
    if training.status != 'pending':
        messages.warning(request, 'Cette formation a déjà été traitée')
        return redirect('manage_training')
    
    try:
        training.status = 'rejected'
        training.approved_by = request.user
        training.approved_at = timezone.now()
        training.save()
        
        messages.success(request, f'Formation "{training.name}" rejetée')
    except Exception as e:
        messages.error(request, f'Erreur lors du rejet: {str(e)}')
    
    return redirect('manage_training')

@user_passes_test(can_view_contracts)
def contract_detail(request, contract_id):
    contract = get_object_or_404(Contract, id=contract_id)
    return render(request, 'employees/contract_detail.html', {'contract': contract})

@user_passes_test(is_hr_manager)
def edit_contract(request, contract_id):
    contract = get_object_or_404(Contract, id=contract_id)
    
    if request.method == 'POST':
        contract.type = request.POST['type']
        contract.date_debut = request.POST['date_debut']
        contract.date_fin = request.POST.get('date_fin') or None
        contract.salaire = request.POST.get('salaire') or None
        contract.active = 'active' in request.POST
        contract.save()
        
        messages.success(request, 'Contrat modifié avec succès')
        return redirect('contract_detail', contract_id=contract.id)
    
    return render(request, 'employees/edit_contract.html', {'contract': contract})

@user_passes_test(is_hr_manager)
def renew_contract(request, contract_id):
    old_contract = get_object_or_404(Contract, id=contract_id)
    
    # Vérifier si le contrat peut être renouvelé
    if not old_contract.can_be_renewed():
        if old_contract.type == 'CDI' and old_contract.date_fin:
            # Proposer la conversion en CDI définitif
            if request.method == 'POST' and 'convert_permanent' in request.POST:
                old_contract.convert_to_permanent()
                messages.success(request, 'Contrat CDI converti en contrat définitif')
                return redirect('contract_detail', contract_id=old_contract.id)
            
            return render(request, 'employees/convert_permanent.html', {'contract': old_contract})
        else:
            messages.error(request, 'Ce contrat ne peut pas être renouvelé.')
            return redirect('contract_detail', contract_id=old_contract.id)
    
    if request.method == 'POST':
        try:
            # Renouvellement manuel
            old_contract.active = False
            old_contract.save()
            
            new_contract = Contract.objects.create(
                employee=old_contract.employee,
                type=request.POST['type'],
                date_debut=request.POST['date_debut'],
                date_fin=request.POST.get('date_fin') or None,
                salaire=request.POST.get('salaire') or old_contract.salaire,
                active=True
            )
            
            messages.success(request, 'Contrat renouvelé avec succès')
            return redirect('contract_detail', contract_id=new_contract.id)
        except Exception as e:
            messages.error(request, f'Erreur lors du renouvellement: {str(e)}')
    
    return render(request, 'employees/renew_contract.html', {'contract': old_contract})

@user_passes_test(can_view_contracts)
def expiring_contracts(request):
    from datetime import date, timedelta
    contracts = Contract.objects.filter(
        active=True,
        date_fin__lte=date.today() + timedelta(days=30),
        date_fin__gte=date.today()
    )
    return render(request, 'employees/expiring_contracts.html', {'contracts': contracts})

@user_passes_test(is_hr_manager)
def create_employee(request):
    if request.method == 'POST':
        username = request.POST['username']
        email = request.POST['email']
        matricule = request.POST['matricule']
        
        # Vérifier l'unicité du username
        if User.objects.filter(username=username).exists():
            messages.error(request, f'Le nom d\'utilisateur "{username}" existe déjà')
            return render(request, 'employees/create_employee.html')
        
        # Vérifier l'unicité du matricule
        if Employee.objects.filter(matricule=matricule).exists():
            messages.error(request, f'Le matricule "{matricule}" existe déjà')
            return render(request, 'employees/create_employee.html')
        
        try:
            # Créer l'utilisateur
            user = User.objects.create_user(
                username=username,
                email=email,
                first_name=request.POST['first_name'],
                last_name=request.POST['last_name'],
                password=request.POST['password'],
                role='employee'
            )
            
            # Créer le profil employé
            Employee.objects.create(
                user=user,
                matricule=matricule,
                poste=request.POST.get('poste', ''),
                service=request.POST.get('service', ''),
                date_embauche=request.POST.get('date_embauche') or None
            )
            
            messages.success(request, 'Employé créé avec succès')
            return redirect('employee_list')
            
        except Exception as e:
            messages.error(request, f'Erreur lors de la création: {str(e)}')
    
    return render(request, 'employees/create_employee.html')

@user_passes_test(can_edit_employees)
def edit_employee(request, employee_id):
    from .models import Department
    from knowledge_management.models import Position
    employee = get_object_or_404(Employee, id=employee_id)
    
    if request.method == 'POST':
        # Modifier les informations utilisateur
        employee.user.first_name = request.POST['first_name']
        employee.user.last_name = request.POST['last_name']
        employee.user.email = request.POST['email']
        employee.user.phone = request.POST.get('phone', '')
        employee.user.save()
        
        # Modifier les informations employé
        # Utiliser le poste personnalisé si fourni, sinon le poste sélectionné
        poste_custom = request.POST.get('poste_custom', '').strip()
        employee.poste = poste_custom if poste_custom else request.POST.get('poste', '')
        employee.service = request.POST.get('service', '')
        employee.date_embauche = request.POST.get('date_embauche') or None
        employee.statut = request.POST.get('statut', 'actif')
        
        # Modifier le département
        department_id = request.POST.get('department')
        if department_id:
            employee.department = Department.objects.get(id=department_id)
        else:
            employee.department = None
        
        employee.save()
        
        messages.success(request, 'Employé modifié avec succès')
        return redirect('employee_detail', employee_id=employee.id)
    
    departments = Department.objects.all().order_by('name')
    positions = Position.objects.all().order_by('name')
    return render(request, 'employees/edit_employee.html', {
        'employee': employee,
        'departments': departments,
        'positions': positions
    })

@user_passes_test(can_manage_employees)
def delete_employee(request, employee_id):
    employee = get_object_or_404(Employee, id=employee_id)
    
    if request.method == 'POST':
        user = employee.user
        employee.delete()
        user.delete()
        
        messages.success(request, f'Employé {user.get_full_name()} supprimé avec succès')
        return redirect('employee_list')
    
    return render(request, 'employees/delete_employee.html', {'employee': employee})

@user_passes_test(is_hr_manager)
def create_contract(request, employee_id):
    employee = get_object_or_404(Employee, id=employee_id)
    
    if request.method == 'POST':
        Contract.objects.create(
            employee=employee,
            type=request.POST['type'],
            date_debut=request.POST['date_debut'],
            date_fin=request.POST.get('date_fin') or None,
            salaire=request.POST.get('salaire') or None,
            active=True
        )
        
        messages.success(request, 'Contrat créé avec succès')
        return redirect('employee_detail', employee_id=employee.id)
    
    return render(request, 'employees/create_contract.html', {'employee': employee})

@user_passes_test(is_hr_manager)
def create_contract_general(request):
    if request.method == 'POST':
        matricule = request.POST['matricule']
        try:
            employee = Employee.objects.get(matricule=matricule)
            Contract.objects.create(
                employee=employee,
                type=request.POST['type'],
                date_debut=request.POST['date_debut'],
                date_fin=request.POST.get('date_fin') or None,
                salaire=request.POST.get('salaire') or None,
                active=True
            )
            messages.success(request, f'Contrat créé avec succès pour {employee.user.get_full_name()}')
            return redirect('manage_contracts')
        except Employee.DoesNotExist:
            messages.error(request, f'Aucun employé trouvé avec le matricule "{matricule}"')
    
    employees = Employee.objects.all()
    return render(request, 'employees/create_contract_general.html', {'employees': employees})
