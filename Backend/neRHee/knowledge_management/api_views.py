from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from django.shortcuts import get_object_or_404
from django.db.models import Count, Avg, Q
from django.db import models
from .models import Skill, Position, EmployeeSkill, EmployeePosition, Document, DepartmentSkillMatrix
from employees.models import Employee, Department
from .serializers import (
    SkillSerializer, PositionSerializer, EmployeeSkillSerializer, 
    EmployeePositionSerializer, DocumentSerializer, DepartmentSkillMatrixSerializer
)

def check_hr_permission(user):
    """Vérifier les permissions HR"""
    return hasattr(user, 'role') and user.role in ['hr_manager', 'hr_director', 'administrator']

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def knowledge_dashboard_stats(request):
    """Statistiques du tableau de bord connaissances"""
    stats = {
        'total_skills': Skill.objects.count(),
        'total_positions': Position.objects.count(),
        'total_documents': Document.objects.filter(is_active=True).count(),
        'total_employees_with_skills': Employee.objects.filter(skills__isnull=False).distinct().count(),
        'avg_skills_per_employee': EmployeeSkill.objects.values('employee').annotate(
            skill_count=Count('skill')
        ).aggregate(avg=Avg('skill_count'))['avg'] or 0,
    }
    return Response(stats)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def skills_list(request):
    """Liste des compétences"""
    skills = Skill.objects.all().order_by('category', 'name')
    
    # Filtres
    category = request.GET.get('category')
    department_id = request.GET.get('department')
    
    if category:
        skills = skills.filter(category=category)
    if department_id:
        skills = skills.filter(departments__id=department_id)
    
    serializer = SkillSerializer(skills, many=True)
    return Response(serializer.data)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def create_skill(request):
    """Créer une compétence"""
    if not check_hr_permission(request.user):
        return Response({'error': 'Permission denied'}, status=status.HTTP_403_FORBIDDEN)
    
    serializer = SkillSerializer(data=request.data)
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def positions_list(request):
    """Liste des postes"""
    positions = Position.objects.select_related('department').all().order_by('department__name', 'name')
    
    # Filtres
    department_id = request.GET.get('department')
    if department_id:
        positions = positions.filter(department_id=department_id)
    
    serializer = PositionSerializer(positions, many=True)
    return Response(serializer.data)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def create_position(request):
    """Créer un poste"""
    if not check_hr_permission(request.user):
        return Response({'error': 'Permission denied'}, status=status.HTTP_403_FORBIDDEN)
    
    serializer = PositionSerializer(data=request.data)
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def skills_matrix(request):
    """Matrice des compétences par département"""
    department_id = request.GET.get('department')
    if not department_id:
        return Response({'error': 'Department ID required'}, status=status.HTTP_400_BAD_REQUEST)
    
    try:
        department = Department.objects.get(id=department_id)
        employees = Employee.objects.filter(department=department).select_related('user')
        skills = Skill.objects.filter(
            Q(departments=department) | Q(is_core_skill=True)
        ).distinct()
        
        # Créer automatiquement les EmployeeSkill manquants
        for employee in employees:
            for skill in skills:
                EmployeeSkill.objects.get_or_create(
                    employee=employee,
                    skill=skill,
                    defaults={'level': 0, 'updated_by': request.user}
                )
        
        # Récupérer la matrice
        matrix_data = []
        for employee in employees:
            employee_skills = EmployeeSkill.objects.filter(
                employee=employee, skill__in=skills
            ).select_related('skill')
            
            skills_dict = {es.skill.id: es for es in employee_skills}
            employee_data = {
                'employee': {
                    'id': employee.id,
                    'name': employee.user.get_full_name(),
                    'matricule': employee.matricule,
                    'poste': employee.poste
                },
                'skills': [
                    {
                        'skill_id': skill.id,
                        'skill_name': skill.name,
                        'level': skills_dict.get(skill.id).level if skill.id in skills_dict else 0,
                        'certified': skills_dict.get(skill.id).certified if skill.id in skills_dict else False
                    }
                    for skill in skills
                ]
            }
            matrix_data.append(employee_data)
        
        return Response({
            'department': {'id': department.id, 'name': department.name},
            'skills': SkillSerializer(skills, many=True).data,
            'matrix': matrix_data
        })
        
    except Department.DoesNotExist:
        return Response({'error': 'Department not found'}, status=status.HTTP_404_NOT_FOUND)

@api_view(['PUT'])
@permission_classes([IsAuthenticated])
def update_employee_skill(request, employee_id, skill_id):
    """Mettre à jour une compétence d'employé"""
    if not check_hr_permission(request.user):
        return Response({'error': 'Permission denied'}, status=status.HTTP_403_FORBIDDEN)
    
    try:
        employee = Employee.objects.get(id=employee_id)
        skill = Skill.objects.get(id=skill_id)
        
        employee_skill, created = EmployeeSkill.objects.get_or_create(
            employee=employee,
            skill=skill,
            defaults={'updated_by': request.user}
        )
        
        level = request.data.get('level', 0)
        certified = request.data.get('certified', False)
        
        employee_skill.level = level
        employee_skill.certified = certified
        employee_skill.updated_by = request.user
        employee_skill.save()
        
        serializer = EmployeeSkillSerializer(employee_skill)
        return Response(serializer.data)
        
    except (Employee.DoesNotExist, Skill.DoesNotExist):
        return Response({'error': 'Employee or Skill not found'}, status=status.HTTP_404_NOT_FOUND)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def versatility_matrix(request):
    """Matrice de polyvalence par département"""
    department_id = request.GET.get('department')
    if not department_id:
        return Response({'error': 'Department ID required'}, status=status.HTTP_400_BAD_REQUEST)
    
    try:
        department = Department.objects.get(id=department_id)
        employees = Employee.objects.filter(department=department).select_related('user')
        positions = Position.objects.filter(department=department)
        
        matrix_data = []
        for employee in employees:
            employee_positions = EmployeePosition.objects.filter(
                employee=employee, position__in=positions
            ).select_related('position')
            
            positions_dict = {ep.position.id: ep for ep in employee_positions}
            employee_data = {
                'employee': {
                    'id': employee.id,
                    'name': employee.user.get_full_name(),
                    'matricule': employee.matricule,
                    'poste': employee.poste
                },
                'positions': [
                    {
                        'position_id': position.id,
                        'level': positions_dict.get(position.id).autonomy_level if position.id in positions_dict else 0,
                        'certified': positions_dict.get(position.id).is_current if position.id in positions_dict else False
                    }
                    for position in positions
                ]
            }
            matrix_data.append(employee_data)
        
        return Response({
            'department': {'id': department.id, 'name': department.name},
            'positions': [{'id': p.id, 'name': p.name, 'title': p.name, 'department': p.department.name} for p in positions],
            'matrix': matrix_data
        })
        
    except Department.DoesNotExist:
        return Response({'error': 'Department not found'}, status=status.HTTP_404_NOT_FOUND)

@api_view(['PUT'])
@permission_classes([IsAuthenticated])
def update_employee_position(request, employee_id, position_id):
    """Mettre à jour la polyvalence d'un employé"""
    if not check_hr_permission(request.user):
        return Response({'error': 'Permission denied'}, status=status.HTTP_403_FORBIDDEN)
    
    try:
        employee = Employee.objects.get(id=employee_id)
        position = Position.objects.get(id=position_id)
        
        employee_position, created = EmployeePosition.objects.get_or_create(
            employee=employee,
            position=position,
            defaults={'updated_by': request.user}
        )
        
        level = request.data.get('level', 1)
        certified = request.data.get('certified', False)
        
        employee_position.autonomy_level = level
        employee_position.is_current = certified
        employee_position.updated_by = request.user
        employee_position.save()
        
        serializer = EmployeePositionSerializer(employee_position)
        return Response(serializer.data)
        
    except (Employee.DoesNotExist, Position.DoesNotExist):
        return Response({'error': 'Employee or Position not found'}, status=status.HTTP_404_NOT_FOUND)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def documents_list(request):
    """Liste des documents"""
    documents = Document.objects.filter(is_active=True).order_by('-updated_at')
    
    # Filtres
    category = request.GET.get('category')
    search = request.GET.get('search')
    
    if category:
        documents = documents.filter(category=category)
    if search:
        documents = documents.filter(
            Q(title__icontains=search) | Q(description__icontains=search)
        )
    
    serializer = DocumentSerializer(documents, many=True)
    return Response(serializer.data)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def upload_document(request):
    """Télécharger un document"""
    if not check_hr_permission(request.user):
        return Response({'error': 'Permission denied'}, status=status.HTTP_403_FORBIDDEN)
    
    print(f"Upload document request data: {request.data}")
    print(f"Files: {request.FILES}")
    
    data = request.data.copy()
    data['created_by'] = request.user.id
    
    print(f"Data with created_by: {data}")
    
    serializer = DocumentSerializer(data=data)
    if serializer.is_valid():
        # Ensure document is active by default
        document = serializer.save(is_active=True)
        print(f"Document created: {document}")
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    
    print(f"Serializer errors: {serializer.errors}")
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

# === API ENDPOINTS POUR EMPLOYÉS ===

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def employee_skills(request):
    """Compétences de l'employé connecté"""
    try:
        employee = Employee.objects.get(user=request.user)
    except Employee.DoesNotExist:
        return Response({'error': 'Employee profile not found'}, status=status.HTTP_404_NOT_FOUND)
    
    # Créer automatiquement les compétences manquantes si l'employé a un département
    if employee.department:
        dept_skills = Skill.objects.filter(
            Q(departments=employee.department) | Q(is_core_skill=True)
        ).distinct()
        
        for skill in dept_skills:
            EmployeeSkill.objects.get_or_create(
                employee=employee,
                skill=skill,
                defaults={'level': 0, 'updated_by': request.user}
            )
    
    skills = employee.skills.select_related('skill').order_by('skill__category', 'skill__name')
    
    skills_data = []
    for emp_skill in skills:
        skills_data.append({
            'id': emp_skill.skill.id,
            'name': emp_skill.skill.name,
            'category': emp_skill.skill.category,
            'description': emp_skill.skill.description,
            'level': emp_skill.level,
            'level_display': emp_skill.get_level_display(),
            'certified': emp_skill.certified,
            'certification_date': emp_skill.certification_date,
            'last_updated': emp_skill.last_updated
        })
    
    # Récupérer les positions/polyvalences
    positions = EmployeePosition.objects.filter(employee=employee).select_related('position')
    positions_data = []
    for position in positions:
        positions_data.append({
            'id': position.id,
            'name': position.position.name,
            'department': position.position.department.name if position.position.department else 'Non défini',
            'level': position.autonomy_level,
            'level_display': position.get_autonomy_level_display(),
            'is_current': position.is_current
        })
    
    return Response({
        'employee': {
            'id': employee.id,
            'name': employee.user.get_full_name(),
            'matricule': employee.matricule,
            'department': employee.department.name if employee.department else None
        },
        'skills': skills_data,
        'positions': positions_data
    })

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def employee_documents(request):
    """Documents accessibles à l'employé"""
    documents = Document.objects.filter(is_active=True).order_by('-updated_at')
    
    # Filtres
    category = request.GET.get('category')
    search = request.GET.get('search')
    
    if category:
        documents = documents.filter(category=category)
    if search:
        documents = documents.filter(
            Q(title__icontains=search) | Q(description__icontains=search)
        )
    
    documents_data = []
    for doc in documents:
        documents_data.append({
            'id': doc.id,
            'title': doc.title,
            'description': doc.description,
            'category': doc.category,
            'category_display': doc.get_category_display(),
            'version': doc.version,
            'file_url': doc.file.url if doc.file else None,
            'created_at': doc.created_at,
            'updated_at': doc.updated_at
        })
    
    return Response({
        'documents': documents_data,
        'categories': Document.CATEGORIES
    })