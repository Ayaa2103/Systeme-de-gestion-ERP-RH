from django.shortcuts import render, get_object_or_404, redirect
from django.contrib.auth.decorators import login_required, user_passes_test
from django.contrib import messages
from .models import LeaveRequest, AttestationRequest, MissionOrderRequest, PayslipRequest
from employees.models import Employee

@login_required
def my_requests(request):
    try:
        employee = request.user.employee_profile
    except Employee.DoesNotExist:
        # Créer automatiquement le profil si manquant
        employee = Employee.objects.create(
            user=request.user,
            matricule=f"EMP{request.user.id:04d}",
            poste="Non défini",
            service="Non défini",
            statut="actif"
        )
        messages.info(request, 'Profil employé créé automatiquement')
    
    leave_requests = employee.leave_requests.all()
    attestation_requests = employee.attestation_requests.all()
    mission_requests = employee.mission_requests.all()
    payslip_requests = employee.payslip_requests.all()
    
    context = {
        'leave_requests': leave_requests,
        'attestation_requests': attestation_requests,
        'mission_requests': mission_requests,
        'payslip_requests': payslip_requests,
    }
    return render(request, 'requests/my_requests.html', context)

@login_required
def create_leave_request(request):
    if request.method == 'POST':
        try:
            employee = request.user.employee_profile
        except Employee.DoesNotExist:
            employee = Employee.objects.create(
                user=request.user,
                matricule=f"EMP{request.user.id:04d}",
                poste="Non défini",
                service="Non défini",
                statut="actif"
            )
        
        try:
            LeaveRequest.objects.create(
                requester=employee,
                start_date=request.POST['start_date'],
                end_date=request.POST['end_date'],
                leave_type=request.POST['leave_type'],
                comment=request.POST.get('comment', '')
            )
            messages.success(request, 'Demande de congé soumise')
            return redirect('my_requests')
        except Exception as e:
            messages.error(request, f'Erreur lors de la création: {str(e)}')
    
    return render(request, 'requests/create_leave.html')

@login_required
def create_attestation_request(request):
    if request.method == 'POST':
        try:
            employee = request.user.employee_profile
        except Employee.DoesNotExist:
            employee = Employee.objects.create(
                user=request.user,
                matricule=f"EMP{request.user.id:04d}",
                poste="Non défini",
                service="Non défini",
                statut="actif"
            )
        
        try:
            AttestationRequest.objects.create(
                requester=employee,
                purpose=request.POST['purpose'],
                attestation_type=request.POST['attestation_type'],
                comment=request.POST.get('comment', '')
            )
            messages.success(request, 'Demande d\'attestation soumise')
            return redirect('my_requests')
        except Exception as e:
            messages.error(request, f'Erreur lors de la création: {str(e)}')
    
    return render(request, 'requests/create_attestation.html')

@login_required
def create_mission_request(request):
    if request.method == 'POST':
        try:
            employee = request.user.employee_profile
        except Employee.DoesNotExist:
            employee = Employee.objects.create(
                user=request.user,
                matricule=f"EMP{request.user.id:04d}",
                poste="Non défini",
                service="Non défini",
                statut="actif"
            )
        
        try:
            MissionOrderRequest.objects.create(
                requester=employee,
                destination=request.POST['destination'],
                start_date=request.POST['start_date'],
                end_date=request.POST['end_date'],
                reason=request.POST.get('reason', ''),
                comment=request.POST.get('comment', '')
            )
            messages.success(request, 'Demande de mission soumise')
            return redirect('my_requests')
        except Exception as e:
            messages.error(request, f'Erreur lors de la création: {str(e)}')
    
    return render(request, 'requests/create_mission.html')

@login_required
def create_payslip_request(request):
    if request.method == 'POST':
        try:
            employee = request.user.employee_profile
        except Employee.DoesNotExist:
            employee = Employee.objects.create(
                user=request.user,
                matricule=f"EMP{request.user.id:04d}",
                poste="Non défini",
                service="Non défini",
                statut="actif"
            )
        
        try:
            PayslipRequest.objects.create(
                requester=employee,
                periode_mois=request.POST['periode_mois'],
                comment=request.POST.get('comment', '')
            )
            messages.success(request, 'Demande de bulletin soumise')
            return redirect('my_requests')
        except Exception as e:
            messages.error(request, f'Erreur lors de la création: {str(e)}')
    
    return render(request, 'requests/create_payslip.html')

def is_hr_manager_or_director(user):
    return user.role in ['hr_manager', 'hr_director']

@user_passes_test(is_hr_manager_or_director)
def manage_requests(request):
    leave_requests = LeaveRequest.objects.filter(status='pending')
    attestation_requests = AttestationRequest.objects.filter(status='pending')
    mission_requests = MissionOrderRequest.objects.filter(status='pending')
    payslip_requests = PayslipRequest.objects.filter(status='pending')
    
    context = {
        'leave_requests': leave_requests,
        'attestation_requests': attestation_requests,
        'mission_requests': mission_requests,
        'payslip_requests': payslip_requests,
    }
    return render(request, 'requests/manage_requests.html', context)

@user_passes_test(is_hr_manager_or_director)
def approve_request(request, request_type, request_id):
    model_map = {
        'leave': LeaveRequest,
        'attestation': AttestationRequest,
        'mission': MissionOrderRequest,
        'payslip': PayslipRequest,
    }
    
    model = model_map.get(request_type)
    if model:
        req = get_object_or_404(model, id=request_id)
        req.status = 'approved'
        req.approver = request.user
        req.save()
        messages.success(request, f'{request_type.title()} request approved')
    
    return redirect('manage_requests')

@user_passes_test(is_hr_manager_or_director)
def reject_request(request, request_type, request_id):
    model_map = {
        'leave': LeaveRequest,
        'attestation': AttestationRequest,
        'mission': MissionOrderRequest,
        'payslip': PayslipRequest,
    }
    
    model = model_map.get(request_type)
    if model:
        req = get_object_or_404(model, id=request_id)
        req.status = 'rejected'
        req.approver = request.user
        req.save()
        messages.success(request, f'{request_type.title()} request rejected')
    
    return redirect('manage_requests')