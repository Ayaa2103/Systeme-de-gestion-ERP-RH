from datetime import date, timedelta
from django.db.models import Q, Count
from .models import Employee
from requests_app.models import LeaveRequest

def get_employees_absent_today():
    """Get employees absent today"""
    today = date.today()
    return Employee.objects.filter(
        leave_requests__status='approved',
        leave_requests__start_date__lte=today,
        leave_requests__end_date__gte=today
    ).distinct()

def get_total_absences_this_month():
    """Count approved leave requests this month"""
    today = date.today()
    month_start = today.replace(day=1)
    month_end = (month_start + timedelta(days=32)).replace(day=1) - timedelta(days=1)
    
    return LeaveRequest.objects.filter(
        status='approved',
        start_date__lte=month_end,
        end_date__gte=month_start
    ).count()

def get_total_absence_days_this_month():
    """Calculate total absence days this month"""
    today = date.today()
    month_start = today.replace(day=1)
    month_end = (month_start + timedelta(days=32)).replace(day=1) - timedelta(days=1)
    
    approved_leaves = LeaveRequest.objects.filter(
        status='approved',
        start_date__lte=month_end,
        end_date__gte=month_start
    )
    
    total_days = 0
    for leave in approved_leaves:
        # Calculate overlap with current month
        start = max(leave.start_date, month_start)
        end = min(leave.end_date, month_end)
        total_days += (end - start).days + 1
    
    return total_days

def get_average_absence_days_per_employee():
    """Calculate average absence days per employee this month"""
    total_days = get_total_absence_days_this_month()
    total_employees = Employee.objects.count()
    return round(total_days / total_employees, 2) if total_employees > 0 else 0

def get_absence_rate():
    """Calculate absence rate percentage"""
    total_days = get_total_absence_days_this_month()
    total_employees = Employee.objects.count()
    working_days = 22  # Simplified
    
    if total_employees == 0:
        return 0
    
    rate = (total_days / (total_employees * working_days)) * 100
    return round(rate, 2)

def get_employees_exceeding_threshold(threshold=5):
    """Get employees exceeding absence threshold this month"""
    today = date.today()
    month_start = today.replace(day=1)
    month_end = (month_start + timedelta(days=32)).replace(day=1) - timedelta(days=1)
    
    employees_over_threshold = []
    
    for employee in Employee.objects.all():
        approved_leaves = employee.leave_requests.filter(
            status='approved',
            start_date__lte=month_end,
            end_date__gte=month_start
        )
        
        total_days = 0
        for leave in approved_leaves:
            start = max(leave.start_date, month_start)
            end = min(leave.end_date, month_end)
            total_days += (end - start).days + 1
        
        if total_days > threshold:
            employees_over_threshold.append({
                'employee': employee,
                'days': total_days
            })
    
    return employees_over_threshold

def is_employee_absent_today(employee):
    """Check if specific employee is absent today"""
    today = date.today()
    return employee.leave_requests.filter(
        status='approved',
        start_date__lte=today,
        end_date__gte=today
    ).exists()

def get_absence_data_for_chart():
    """Get absence data for Chart.js"""
    today = date.today()
    month_start = today.replace(day=1)
    month_end = (month_start + timedelta(days=32)).replace(day=1) - timedelta(days=1)
    
    data = []
    for employee in Employee.objects.all():
        approved_leaves = employee.leave_requests.filter(
            status='approved',
            start_date__lte=month_end,
            end_date__gte=month_start
        )
        
        total_days = 0
        for leave in approved_leaves:
            start = max(leave.start_date, month_start)
            end = min(leave.end_date, month_end)
            total_days += (end - start).days + 1
        
        data.append({
            'name': employee.user.get_full_name(),
            'days': total_days
        })
    
    return data

def get_training_stats():
    """Get training statistics for employees"""
    from .models import Training
    
    employees_training_data = []
    total_trainings = 0
    
    for employee in Employee.objects.all():
        training_count = employee.trainings.filter(status='approved').count()
        total_trainings += training_count
        
        employees_training_data.append({
            'employee': {
                'id': employee.id,
                'user': {
                    'get_full_name': employee.user.get_full_name()
                },
                'matricule': employee.matricule,
                'service': getattr(employee, 'service', 'Non défini')
            },
            'training_count': training_count
        })
    
    total_employees = Employee.objects.count()
    participation_rate = round((len([e for e in employees_training_data if e['training_count'] > 0]) / total_employees * 100), 2) if total_employees > 0 else 0
    
    return {
        'employees_training_data': employees_training_data,
        'total_trainings': total_trainings,
        'participation_rate': participation_rate
    }

def get_new_employees_today():
    """Get employees hired today"""
    today = date.today()
    return Employee.objects.filter(date_embauche=today)