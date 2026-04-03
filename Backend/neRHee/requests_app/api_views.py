from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from django.shortcuts import get_object_or_404
from .models import LeaveRequest, AttestationRequest, MissionOrderRequest, PayslipRequest
from .serializers import LeaveRequestSerializer, AttestationRequestSerializer, MissionOrderRequestSerializer, PayslipRequestSerializer
from employees.models import Employee

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
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

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
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

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
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

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
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

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