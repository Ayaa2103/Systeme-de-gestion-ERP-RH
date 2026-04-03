from django import forms
from .models import Skill, Position, EmployeeSkill, EmployeePosition, Document
from employees.models import Department

class SkillForm(forms.ModelForm):
    CATEGORY_CHOICES = [
        ('', 'Sélectionner une catégorie'),
        ('Technique', 'Technique'),
        ('Management', 'Management'),
        ('Communication', 'Communication'),
        ('Informatique', 'Informatique'),
        ('Langues', 'Langues'),
        ('Qualité', 'Qualité'),
        ('Sécurité', 'Sécurité'),
        ('Autre', 'Autre'),
    ]
    
    category = forms.ChoiceField(
        choices=CATEGORY_CHOICES,
        widget=forms.Select(attrs={'class': 'form-control'}),
        required=False
    )
    
    class Meta:
        model = Skill
        fields = ['name', 'description', 'category']
        widgets = {
            'name': forms.TextInput(attrs={'class': 'form-control'}),
            'description': forms.Textarea(attrs={'class': 'form-control', 'rows': 3}),
        }

class PositionForm(forms.ModelForm):
    department = forms.ModelChoiceField(
        queryset=Department.objects.all().order_by('name'),
        empty_label="Sélectionner un département",
        widget=forms.Select(attrs={'class': 'form-control'})
    )
    
    class Meta:
        model = Position
        fields = ['name', 'description', 'department']
        widgets = {
            'name': forms.TextInput(attrs={'class': 'form-control'}),
            'description': forms.Textarea(attrs={'class': 'form-control', 'rows': 3}),
        }

class EmployeeSkillForm(forms.ModelForm):
    class Meta:
        model = EmployeeSkill
        fields = ['skill', 'level']
        widgets = {
            'skill': forms.Select(attrs={'class': 'form-control'}),
            'level': forms.Select(attrs={'class': 'form-control'}),
        }
    
    def __init__(self, *args, **kwargs):
        employee = kwargs.pop('employee', None)
        super().__init__(*args, **kwargs)
        
        if employee and employee.department:
            from django.db.models import Q
            # Filtrer les compétences par département + transversales
            self.fields['skill'].queryset = Skill.objects.filter(
                Q(departments=employee.department) | Q(is_core_skill=True)
            ).distinct().order_by('category', 'name')

class EmployeePositionForm(forms.ModelForm):
    class Meta:
        model = EmployeePosition
        fields = ['position', 'autonomy_level']
        widgets = {
            'position': forms.Select(attrs={'class': 'form-control'}),
            'autonomy_level': forms.Select(attrs={'class': 'form-control'}),
        }

class QuickPositionForm(forms.ModelForm):
    class Meta:
        model = EmployeePosition
        fields = ['autonomy_level']
        widgets = {
            'autonomy_level': forms.Select(attrs={'class': 'form-control'}),
        }

class DocumentForm(forms.ModelForm):
    class Meta:
        model = Document
        fields = ['title', 'description', 'category', 'file', 'version']
        widgets = {
            'title': forms.TextInput(attrs={'class': 'form-control'}),
            'description': forms.Textarea(attrs={'class': 'form-control', 'rows': 3}),
            'category': forms.Select(attrs={'class': 'form-control'}),
            'file': forms.FileInput(attrs={'class': 'form-control'}),
            'version': forms.TextInput(attrs={'class': 'form-control', 'placeholder': '1.0'}),
        }