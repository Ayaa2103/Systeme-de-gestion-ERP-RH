from rest_framework import serializers
from .models import LeaveRequest, AttestationRequest, MissionOrderRequest, PayslipRequest

class LeaveRequestSerializer(serializers.ModelSerializer):
    requester_name = serializers.CharField(source='requester.user.get_full_name', read_only=True)
    requester_matricule = serializers.CharField(source='requester.matricule', read_only=True)
    approver_name = serializers.CharField(source='approver.get_full_name', read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    
    class Meta:
        model = LeaveRequest
        fields = ['id', 'requester', 'requester_name', 'requester_matricule', 'start_date', 
                 'end_date', 'leave_type', 'comment', 'status', 'status_display', 'approver', 
                 'approver_name', 'created_at']
        read_only_fields = ['id', 'requester', 'approver', 'created_at']

class AttestationRequestSerializer(serializers.ModelSerializer):
    requester_name = serializers.CharField(source='requester.user.get_full_name', read_only=True)
    requester_matricule = serializers.CharField(source='requester.matricule', read_only=True)
    approver_name = serializers.CharField(source='approver.get_full_name', read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    
    class Meta:
        model = AttestationRequest
        fields = ['id', 'requester', 'requester_name', 'requester_matricule', 'purpose', 
                 'attestation_type', 'comment', 'status', 'status_display', 'approver', 
                 'approver_name', 'created_at']
        read_only_fields = ['id', 'requester', 'approver', 'created_at']

class MissionOrderRequestSerializer(serializers.ModelSerializer):
    requester_name = serializers.CharField(source='requester.user.get_full_name', read_only=True)
    requester_matricule = serializers.CharField(source='requester.matricule', read_only=True)
    approver_name = serializers.CharField(source='approver.get_full_name', read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    
    class Meta:
        model = MissionOrderRequest
        fields = ['id', 'requester', 'requester_name', 'requester_matricule', 'destination', 
                 'start_date', 'end_date', 'reason', 'comment', 'status', 'status_display', 
                 'approver', 'approver_name', 'created_at']
        read_only_fields = ['id', 'requester', 'approver', 'created_at']

class PayslipRequestSerializer(serializers.ModelSerializer):
    requester_name = serializers.CharField(source='requester.user.get_full_name', read_only=True)
    requester_matricule = serializers.CharField(source='requester.matricule', read_only=True)
    approver_name = serializers.CharField(source='approver.get_full_name', read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    
    class Meta:
        model = PayslipRequest
        fields = ['id', 'requester', 'requester_name', 'requester_matricule', 'periode_mois', 
                 'comment', 'status', 'status_display', 'approver', 'approver_name', 'created_at']
        read_only_fields = ['id', 'requester', 'approver', 'created_at']