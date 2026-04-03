from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from employees.models import Employee
from requests_app.models import LeaveRequest, AttestationRequest, MissionOrderRequest, PayslipRequest

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def kpi_dashboard_api(request):
    if not hasattr(request.user, 'role') or request.user.role != 'hr_director':
        return Response({'error': 'Permission denied'}, status=status.HTTP_403_FORBIDDEN)
    
    try:
        try:
            from employees.utils import (
                get_employees_absent_today, get_total_absences_this_month,
                get_absence_rate, get_average_absence_days_per_employee,
                get_employees_exceeding_threshold, get_absence_data_for_chart,
                get_training_stats
            )
        except ImportError as e:
            print(f"Import error: {e}")
            return Response({
                'error': 'Module import failed',
                'total_employees': 0,
                'pending_requests': 0,
                'absent_today': 0,
                'total_absences': 0,
                'absence_rate': 0,
                'avg_absence_days': 0,
                'employees_over_threshold': [],
                'chart_data': [],
                'training_stats': {'employees_training_data': [], 'total_trainings': 0, 'participation_rate': 0},
            })
        
        total_employees = Employee.objects.count()
        pending_requests = (
            LeaveRequest.objects.filter(status='pending').count() + 
            AttestationRequest.objects.filter(status='pending').count() +
            MissionOrderRequest.objects.filter(status='pending').count() +
            PayslipRequest.objects.filter(status='pending').count()
        )
        
        # Absence KPIs
        try:
            absent_today = get_employees_absent_today().count()
            total_absences = get_total_absences_this_month()
            absence_rate = get_absence_rate()
            avg_absence_days = get_average_absence_days_per_employee()
            employees_over_threshold = get_employees_exceeding_threshold()
            chart_data = get_absence_data_for_chart()
        except Exception as e:
            print(f"Absence KPI error: {e}")
            absent_today = 0
            total_absences = 0
            absence_rate = 0
            avg_absence_days = 0
            employees_over_threshold = []
            chart_data = []
        
        # Training KPIs
        try:
            training_stats = get_training_stats()
        except Exception as e:
            print(f"Training stats error: {e}")
            training_stats = {'employees_training_data': [], 'total_trainings': 0, 'participation_rate': 0}
        
        kpi_data = {
            'total_employees': total_employees,
            'pending_requests': pending_requests,
            'absent_today': absent_today,
            'total_absences': total_absences,
            'absence_rate': absence_rate,
            'avg_absence_days': avg_absence_days,
            'employees_over_threshold': [
                {
                    'id': emp.id,
                    'name': emp.user.get_full_name(),
                    'matricule': emp.matricule,
                    'absence_days': emp.absence_days if hasattr(emp, 'absence_days') else 0
                }
                for emp in employees_over_threshold
            ],
            'chart_data': chart_data,
            'training_stats': training_stats,
        }
        
        return Response(kpi_data)
        
    except Exception as e:
        return Response({
            'error': f'Erreur lors du calcul des KPI: {str(e)}',
            'total_employees': 0,
            'pending_requests': 0,
            'absent_today': 0,
            'total_absences': 0,
            'absence_rate': 0,
            'avg_absence_days': 0,
            'employees_over_threshold': [],
            'chart_data': [],
            'training_stats': {'employees_training_data': [], 'total_trainings': 0, 'participation_rate': 0},
        }, status=status.HTTP_200_OK)