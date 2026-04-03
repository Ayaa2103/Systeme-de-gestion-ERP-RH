from django import forms
from .models import NewEmployee
from employees.models import Employee

class NewEmployeeForm(forms.ModelForm):
    """Form for creating and editing new employees"""
    
    class Meta:
        model = NewEmployee
        fields = ['first_name', 'last_name', 'position', 'department', 'email', 'start_date', 'assigned_manager']
        widgets = {
            'first_name': forms.TextInput(attrs={'class': 'form-control'}),
            'last_name': forms.TextInput(attrs={'class': 'form-control'}),
            'position': forms.TextInput(attrs={'class': 'form-control'}),
            'department': forms.TextInput(attrs={'class': 'form-control'}),
            'email': forms.EmailInput(attrs={'class': 'form-control'}),
            'start_date': forms.DateInput(attrs={'class': 'form-control', 'type': 'date'}),
            'assigned_manager': forms.Select(attrs={'class': 'form-control'}),
        }
    
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        # Only show active employees as potential managers
        self.fields['assigned_manager'].queryset = Employee.objects.filter(statut='actif')
        self.fields['assigned_manager'].empty_label = "-- Sélectionner un manager --"