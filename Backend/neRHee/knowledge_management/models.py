from django.db import models
from django.conf import settings
from django.core.validators import MinValueValidator, MaxValueValidator

class Skill(models.Model):
    name = models.CharField(max_length=100)
    description = models.TextField(blank=True)
    category = models.CharField(max_length=50, blank=True)
    departments = models.ManyToManyField('employees.Department', blank=True, related_name='skills')
    is_core_skill = models.BooleanField(default=False, help_text="Compétence transversale à tous les départements")
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        unique_together = ['name', 'category']
    
    def __str__(self):
        return f"{self.name} ({self.category})" if self.category else self.name

class Position(models.Model):
    name = models.CharField(max_length=100)
    description = models.TextField(blank=True)
    department = models.ForeignKey('employees.Department', on_delete=models.CASCADE, related_name='positions')
    required_skills = models.ManyToManyField(Skill, through='PositionSkillRequirement', related_name='required_for_positions')
    
    class Meta:
        unique_together = ['name', 'department']
    
    def __str__(self):
        return f"{self.name} - {self.department.name}"

class PositionSkillRequirement(models.Model):
    """Définit les compétences requises pour un poste avec le niveau minimum"""
    position = models.ForeignKey(Position, on_delete=models.CASCADE)
    skill = models.ForeignKey(Skill, on_delete=models.CASCADE)
    minimum_level = models.IntegerField(choices=[
        (1, 'Débutant'),
        (2, 'Intermédiaire'),
        (3, 'Confirmé'),
        (4, 'Expert'),
    ], default=2)
    is_mandatory = models.BooleanField(default=True)
    
    class Meta:
        unique_together = ['position', 'skill']
    
    def __str__(self):
        return f"{self.position.name} - {self.skill.name} (min: {self.get_minimum_level_display()})"

class EmployeeSkill(models.Model):
    MASTERY_LEVELS = [
        (0, 'Non évalué'),
        (1, 'Débutant'),
        (2, 'Intermédiaire'),
        (3, 'Confirmé'),
        (4, 'Expert'),
    ]
    
    employee = models.ForeignKey('employees.Employee', on_delete=models.CASCADE, related_name='skills')
    skill = models.ForeignKey(Skill, on_delete=models.CASCADE)
    level = models.IntegerField(choices=MASTERY_LEVELS, default=0)
    certified = models.BooleanField(default=False, help_text="Compétence certifiée")
    certification_date = models.DateField(null=True, blank=True)
    last_updated = models.DateTimeField(auto_now=True)
    updated_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    
    class Meta:
        unique_together = ['employee', 'skill']
    
    def __str__(self):
        return f"{self.employee.user.get_full_name()} - {self.skill.name} ({self.get_level_display()})"

class EmployeePosition(models.Model):
    AUTONOMY_LEVELS = [
        (1, 'Accompagné'),
        (2, 'Supervisé'),
        (3, 'Autonome'),
        (4, 'Expert/Formateur'),
    ]
    
    employee = models.ForeignKey('employees.Employee', on_delete=models.CASCADE, related_name='positions')
    position = models.ForeignKey(Position, on_delete=models.CASCADE)
    autonomy_level = models.IntegerField(choices=AUTONOMY_LEVELS, default=1)
    is_current = models.BooleanField(default=True, help_text="Poste actuel")
    start_date = models.DateField(null=True, blank=True)
    end_date = models.DateField(null=True, blank=True)
    last_updated = models.DateTimeField(auto_now=True)
    updated_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    
    class Meta:
        unique_together = ['employee', 'position']
    
    def __str__(self):
        return f"{self.employee.user.get_full_name()} - {self.position.name} ({self.get_autonomy_level_display()})"

class Document(models.Model):
    CATEGORIES = [
        ('quality', 'Qualité'),
        ('production', 'Production'),
        ('security', 'Sécurité'),
        ('hr', 'RH'),
        ('other', 'Autre'),
    ]
    
    title = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    category = models.CharField(max_length=20, choices=CATEGORIES)
    file = models.FileField(upload_to='knowledge_docs/')
    version = models.CharField(max_length=20, default='1.0')
    created_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='created_documents')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    is_active = models.BooleanField(default=True)
    
    class Meta:
        ordering = ['-updated_at']
    
    def __str__(self):
        return f"{self.title} (v{self.version})"

class DocumentVersion(models.Model):
    document = models.ForeignKey(Document, on_delete=models.CASCADE, related_name='versions')
    version = models.CharField(max_length=20)
    file = models.FileField(upload_to='knowledge_docs/versions/')
    changes = models.TextField(blank=True)
    created_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.document.title} - v{self.version}"

class DepartmentSkillMatrix(models.Model):
    """Matrice des compétences par département"""
    department = models.ForeignKey('employees.Department', on_delete=models.CASCADE, related_name='skill_matrices')
    skill = models.ForeignKey(Skill, on_delete=models.CASCADE)
    target_coverage = models.IntegerField(default=50, help_text="Pourcentage d'employés devant maîtriser cette compétence")
    priority = models.CharField(max_length=20, choices=[
        ('low', 'Faible'),
        ('medium', 'Moyenne'),
        ('high', 'Élevée'),
        ('critical', 'Critique'),
    ], default='medium')
    
    class Meta:
        unique_together = ['department', 'skill']
    
    def __str__(self):
        return f"{self.department.name} - {self.skill.name}"

class TrainingRecommendation(models.Model):
    employee = models.ForeignKey('employees.Employee', on_delete=models.CASCADE, related_name='training_recommendations')
    skill = models.ForeignKey(Skill, on_delete=models.CASCADE, null=True, blank=True)
    position = models.ForeignKey(Position, on_delete=models.CASCADE, null=True, blank=True)
    current_level = models.IntegerField()
    target_level = models.IntegerField()
    reason = models.TextField()
    priority = models.CharField(max_length=20, choices=[
        ('low', 'Faible'),
        ('medium', 'Moyenne'),
        ('high', 'Élevée'),
        ('urgent', 'Urgente'),
    ], default='medium')
    status = models.CharField(max_length=20, choices=[
        ('pending', 'En attente'),
        ('accepted', 'Acceptée'),
        ('rejected', 'Rejetée'),
        ('completed', 'Terminée'),
    ], default='pending')
    created_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    created_at = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        target = self.skill.name if self.skill else self.position.name
        return f"{self.employee.user.get_full_name()} - {target}"