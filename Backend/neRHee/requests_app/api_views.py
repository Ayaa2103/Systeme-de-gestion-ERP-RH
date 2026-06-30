from datetime import datetime, date, timedelta

from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from django.http import HttpResponse
from django.shortcuts import get_object_or_404
from .models import LeaveRequest, AttestationRequest, MissionOrderRequest, PayslipRequest
from .serializers import LeaveRequestSerializer, AttestationRequestSerializer, MissionOrderRequestSerializer, PayslipRequestSerializer
from .docx_templates import (
    build_leave_request_docx, build_attestation_request_docx,
    build_mission_request_docx, build_payslip_request_docx,
)
from employees.models import Employee
from core.notifications import create_notification, create_notifications_for_roles

REQUEST_LABELS = {
    'leave': 'congé',
    'attestation': 'attestation',
    'mission': 'ordre de mission',
    'payslip': 'bulletin de paie',
}

ATTESTATION_TYPES = [
    ('employment', 'Attestation de travail'),
    ('salary', 'Attestation de salaire'),
    ('experience', "Attestation d'expérience"),
    ('internship', 'Attestation de stage'),
]

FR_MONTHS = [
    'janvier', 'février', 'mars', 'avril', 'mai', 'juin',
    'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre',
]


def _format_periode_mois(periode_mois):
    try:
        month, year = periode_mois.split('/')
        return f'{FR_MONTHS[int(month) - 1].capitalize()} {year}'
    except (ValueError, IndexError):
        return periode_mois


def notify_hr_about_request(request_user, request_type):
    label = REQUEST_LABELS.get(request_type, 'demande')
    create_notifications_for_roles(
        ['hr_manager', 'hr_director'],
        title='Nouvelle demande à traiter',
        message=f"{request_user.get_full_name() or request_user.username} a créé une demande de {label}.",
        notification_type='request_created',
        actor=request_user,
        link='/manage-requests',
        exclude_user=request_user,
    )


def notify_employee_about_request(req, request_type, approved_by):
    label = REQUEST_LABELS.get(request_type, 'demande')
    status_label = 'approuvée' if req.status == 'approved' else 'rejetée'
    message = f"Votre demande de {label} a été {status_label}."
    comment = getattr(req, 'comment', '') or ''
    if comment:
        message += f" Motif : {comment}"
    create_notification(
        req.requester.user,
        title=f"Demande de {label} {status_label}",
        message=message,
        notification_type='request_status',
        actor=approved_by,
        link='/employee/requests',
    )

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def pending_requests(request):
    """Toutes les demandes en attente pour RH"""
    if request.user.role not in ['hr_manager', 'hr_director']:
        return Response({'error': 'Permission denied'}, status=status.HTTP_403_FORBIDDEN)
    
    leave_requests = LeaveRequest.objects.filter(status='pending').select_related('requester__user')
    attestation_requests = AttestationRequest.objects.filter(status='pending').select_related('requester__user')
    mission_requests = MissionOrderRequest.objects.filter(status='pending').select_related('requester__user')
    payslip_requests = PayslipRequest.objects.filter(status='pending').select_related('requester__user')
    
    data = {
        'leave_requests': LeaveRequestSerializer(leave_requests, many=True).data,
        'attestation_requests': AttestationRequestSerializer(attestation_requests, many=True).data,
        'mission_requests': MissionOrderRequestSerializer(mission_requests, many=True).data,
        'payslip_requests': PayslipRequestSerializer(payslip_requests, many=True).data,
    }
    
    return Response(data)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def my_requests(request):
    """Mes demandes pour un employé"""
    try:
        employee = request.user.employee_profile
    except Employee.DoesNotExist:
        return Response({'error': 'Employee profile not found'}, status=status.HTTP_404_NOT_FOUND)
    
    leave_requests = employee.leave_requests.all().order_by('-created_at')
    attestation_requests = employee.attestation_requests.all().order_by('-created_at')
    mission_requests = employee.mission_requests.all().order_by('-created_at')
    payslip_requests = employee.payslip_requests.all().order_by('-created_at')
    
    data = {
        'leave_requests': LeaveRequestSerializer(leave_requests, many=True).data,
        'attestation_requests': AttestationRequestSerializer(attestation_requests, many=True).data,
        'mission_requests': MissionOrderRequestSerializer(mission_requests, many=True).data,
        'payslip_requests': PayslipRequestSerializer(payslip_requests, many=True).data,
    }
    
    return Response(data)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def create_leave_request(request):
    """Créer une demande de congé"""
    try:
        employee = request.user.employee_profile
    except Employee.DoesNotExist:
        return Response({'error': 'Employee profile not found'}, status=status.HTTP_404_NOT_FOUND)
    
    data = request.data.copy()
    data['requester'] = employee.id
    
    serializer = LeaveRequestSerializer(data=data)
    if serializer.is_valid():
        serializer.save()
        notify_hr_about_request(request.user, 'leave')
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def generate_leave_request_template(request):
    """Génère un document Word pré-rempli à imprimer et signer."""
    try:
        employee = request.user.employee_profile
    except Employee.DoesNotExist:
        return Response({'error': 'Employee profile not found'}, status=status.HTTP_404_NOT_FOUND)

    start_date_str = request.data.get('start_date')
    end_date_str = request.data.get('end_date')
    leave_type = request.data.get('leave_type', 'annual')
    comment = request.data.get('comment', '')

    if not start_date_str or not end_date_str:
        return Response({'error': 'Les dates de début et de fin sont obligatoires.'}, status=status.HTTP_400_BAD_REQUEST)

    try:
        start_date = datetime.strptime(start_date_str, '%Y-%m-%d').date()
        end_date = datetime.strptime(end_date_str, '%Y-%m-%d').date()
    except ValueError:
        return Response({'error': 'Format de date invalide.'}, status=status.HTTP_400_BAD_REQUEST)

    if end_date < start_date:
        return Response({'error': 'La date de fin doit être postérieure à la date de début.'}, status=status.HTTP_400_BAD_REQUEST)

    duration_days = (end_date - start_date).days + 1
    business_days = sum(
        1 for n in range(duration_days)
        if (start_date + timedelta(days=n)).weekday() < 5
    )

    buffer = build_leave_request_docx(
        employee=employee,
        leave_type=leave_type,
        leave_types_choices=LeaveRequest.LEAVE_TYPES,
        start_date=start_date,
        end_date=end_date,
        duration_days=duration_days,
        business_days=business_days,
        comment=comment,
        request_date=date.today(),
    )

    response = HttpResponse(
        buffer.getvalue(),
        content_type='application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    )
    response['Content-Disposition'] = f'attachment; filename="Demande_Conge_{employee.matricule}.docx"'
    return response

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def create_attestation_request(request):
    """Créer une demande d'attestation"""
    try:
        employee = request.user.employee_profile
    except Employee.DoesNotExist:
        return Response({'error': 'Employee profile not found'}, status=status.HTTP_404_NOT_FOUND)
    
    data = request.data.copy()
    data['requester'] = employee.id
    
    serializer = AttestationRequestSerializer(data=data)
    if serializer.is_valid():
        serializer.save()
        notify_hr_about_request(request.user, 'attestation')
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def generate_attestation_request_template(request):
    """Génère un document Word pré-rempli à imprimer et signer."""
    try:
        employee = request.user.employee_profile
    except Employee.DoesNotExist:
        return Response({'error': 'Employee profile not found'}, status=status.HTTP_404_NOT_FOUND)

    attestation_type = request.data.get('attestation_type', 'employment')
    purpose = request.data.get('purpose', '')
    comment = request.data.get('comment', '')

    if not purpose:
        return Response({'error': "L'objectif est obligatoire."}, status=status.HTTP_400_BAD_REQUEST)

    buffer = build_attestation_request_docx(
        employee=employee,
        attestation_type=attestation_type,
        attestation_types_choices=ATTESTATION_TYPES,
        purpose=purpose,
        comment=comment,
        request_date=date.today(),
    )

    response = HttpResponse(
        buffer.getvalue(),
        content_type='application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    )
    response['Content-Disposition'] = f'attachment; filename="Demande_Attestation_{employee.matricule}.docx"'
    return response

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def create_mission_request(request):
    """Créer une demande de mission"""
    try:
        employee = request.user.employee_profile
    except Employee.DoesNotExist:
        return Response({'error': 'Employee profile not found'}, status=status.HTTP_404_NOT_FOUND)
    
    data = request.data.copy()
    data['requester'] = employee.id
    
    serializer = MissionOrderRequestSerializer(data=data)
    if serializer.is_valid():
        serializer.save()
        notify_hr_about_request(request.user, 'mission')
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def generate_mission_request_template(request):
    """Génère un document Word pré-rempli à imprimer et signer."""
    try:
        employee = request.user.employee_profile
    except Employee.DoesNotExist:
        return Response({'error': 'Employee profile not found'}, status=status.HTTP_404_NOT_FOUND)

    destination = request.data.get('destination', '')
    start_date_str = request.data.get('start_date')
    end_date_str = request.data.get('end_date')
    reason = request.data.get('reason', '')
    comment = request.data.get('comment', '')

    if not destination or not start_date_str or not end_date_str:
        return Response({'error': 'La destination et les dates sont obligatoires.'}, status=status.HTTP_400_BAD_REQUEST)

    try:
        start_date = datetime.strptime(start_date_str, '%Y-%m-%d').date()
        end_date = datetime.strptime(end_date_str, '%Y-%m-%d').date()
    except ValueError:
        return Response({'error': 'Format de date invalide.'}, status=status.HTTP_400_BAD_REQUEST)

    if end_date < start_date:
        return Response({'error': 'La date de fin doit être postérieure à la date de début.'}, status=status.HTTP_400_BAD_REQUEST)

    duration_days = (end_date - start_date).days + 1

    buffer = build_mission_request_docx(
        employee=employee,
        destination=destination,
        start_date=start_date,
        end_date=end_date,
        duration_days=duration_days,
        reason=reason,
        comment=comment,
        request_date=date.today(),
    )

    response = HttpResponse(
        buffer.getvalue(),
        content_type='application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    )
    response['Content-Disposition'] = f'attachment; filename="Demande_Mission_{employee.matricule}.docx"'
    return response

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def create_payslip_request(request):
    """Créer une demande de bulletin"""
    try:
        employee = request.user.employee_profile
    except Employee.DoesNotExist:
        return Response({'error': 'Employee profile not found'}, status=status.HTTP_404_NOT_FOUND)
    
    data = request.data.copy()
    data['requester'] = employee.id
    
    serializer = PayslipRequestSerializer(data=data)
    if serializer.is_valid():
        serializer.save()
        notify_hr_about_request(request.user, 'payslip')
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def generate_payslip_request_template(request):
    """Génère un document Word pré-rempli à imprimer et signer."""
    try:
        employee = request.user.employee_profile
    except Employee.DoesNotExist:
        return Response({'error': 'Employee profile not found'}, status=status.HTTP_404_NOT_FOUND)

    periode_mois = request.data.get('periode_mois', '')
    comment = request.data.get('comment', '')

    if not periode_mois:
        return Response({'error': 'La période est obligatoire.'}, status=status.HTTP_400_BAD_REQUEST)

    buffer = build_payslip_request_docx(
        employee=employee,
        periode_label=_format_periode_mois(periode_mois),
        comment=comment,
        request_date=date.today(),
    )

    response = HttpResponse(
        buffer.getvalue(),
        content_type='application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    )
    response['Content-Disposition'] = f'attachment; filename="Demande_Bulletin_{employee.matricule}.docx"'
    return response

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def approve_request(request, request_type, request_id):
    """Approuver une demande"""
    print(f"=== APPROVE REQUEST DEBUG ===")
    print(f"User: {request.user}")
    print(f"User role: {request.user.role}")
    print(f"Request type: {request_type}")
    print(f"Request ID: {request_id}")
    print(f"Request data: {request.data}")
    
    if request.user.role not in ['hr_manager', 'hr_director']:
        return Response({'error': 'Permission denied'}, status=status.HTTP_403_FORBIDDEN)
    
    model_map = {
        'leave': LeaveRequest,
        'attestation': AttestationRequest,
        'mission': MissionOrderRequest,
        'payslip': PayslipRequest,
    }
    
    serializer_map = {
        'leave': LeaveRequestSerializer,
        'attestation': AttestationRequestSerializer,
        'mission': MissionOrderRequestSerializer,
        'payslip': PayslipRequestSerializer,
    }
    
    model = model_map.get(request_type)
    serializer_class = serializer_map.get(request_type)
    
    if not model or not serializer_class:
        print(f"Invalid request type: {request_type}")
        return Response({'error': 'Invalid request type'}, status=status.HTTP_400_BAD_REQUEST)
    
    try:
        req = model.objects.get(id=request_id)
        print(f"Found request: {req}")
        print(f"Current status: {req.status}")
        
        req.status = 'approved'
        req.approver = request.user
        
        # Ajouter le commentaire s'il existe
        comment = request.data.get('comment', '')
        print(f"Comment: '{comment}'")
        if comment:
            req.comment = comment
        
        print(f"Saving request with skip_validation=True")
        req.save()
        notify_employee_about_request(req, request_type, request.user)
        print(f"Request saved successfully")
        
        serializer = serializer_class(req)
        print(f"Serialized data: {serializer.data}")
        return Response(serializer.data)
    except model.DoesNotExist:
        print(f"Request not found: {request_type} with id {request_id}")
        return Response({'error': 'Request not found'}, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        print(f"Unexpected error: {str(e)}")
        print(f"Error type: {type(e)}")
        import traceback
        traceback.print_exc()
        return Response({'error': f'Internal server error: {str(e)}'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def reject_request(request, request_type, request_id):
    """Rejeter une demande"""
    print(f"=== REJECT REQUEST DEBUG ===")
    print(f"User: {request.user}")
    print(f"User role: {request.user.role}")
    print(f"Request type: {request_type}")
    print(f"Request ID: {request_id}")
    print(f"Request data: {request.data}")
    
    if request.user.role not in ['hr_manager', 'hr_director']:
        return Response({'error': 'Permission denied'}, status=status.HTTP_403_FORBIDDEN)
    
    model_map = {
        'leave': LeaveRequest,
        'attestation': AttestationRequest,
        'mission': MissionOrderRequest,
        'payslip': PayslipRequest,
    }
    
    serializer_map = {
        'leave': LeaveRequestSerializer,
        'attestation': AttestationRequestSerializer,
        'mission': MissionOrderRequestSerializer,
        'payslip': PayslipRequestSerializer,
    }
    
    model = model_map.get(request_type)
    serializer_class = serializer_map.get(request_type)
    
    if not model or not serializer_class:
        print(f"Invalid request type: {request_type}")
        return Response({'error': 'Invalid request type'}, status=status.HTTP_400_BAD_REQUEST)
    
    try:
        req = model.objects.get(id=request_id)
        print(f"Found request: {req}")
        print(f"Current status: {req.status}")
        
        req.status = 'rejected'
        req.approver = request.user
        
        # Ajouter le commentaire s'il existe
        comment = request.data.get('comment', '')
        print(f"Comment: '{comment}'")
        if comment:
            req.comment = comment
        
        print(f"Saving request")
        req.save()
        notify_employee_about_request(req, request_type, request.user)
        print(f"Request saved successfully")
        
        serializer = serializer_class(req)
        print(f"Serialized data: {serializer.data}")
        return Response(serializer.data)
    except model.DoesNotExist:
        print(f"Request not found: {request_type} with id {request_id}")
        return Response({'error': 'Request not found'}, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        print(f"Unexpected error: {str(e)}")
        print(f"Error type: {type(e)}")
        import traceback
        traceback.print_exc()
        return Response({'error': f'Internal server error: {str(e)}'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
