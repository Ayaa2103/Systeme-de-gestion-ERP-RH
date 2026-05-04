from django import forms
from .models import Department, Employee


class DepartmentForm(forms.ModelForm):
    manager = forms.ModelChoiceField(
        queryset=Employee.objects.select_related('user').all().order_by('matricule'),
        required=False,
        empty_label="Aucun responsable",
        widget=forms.Select(attrs={'class': 'form-control'})
    )

    class Meta:
        model = Department
        fields = ['name', 'code', 'description', 'manager']
        widgets = {
            'name': forms.TextInput(attrs={'class': 'form-control', 'placeholder': 'Ex: Ressources Humaines'}),
            'code': forms.TextInput(attrs={'class': 'form-control', 'placeholder': 'Ex: RH'}),
            'description': forms.Textarea(attrs={'class': 'form-control', 'rows': 3, 'placeholder': 'Description du département'}),
        }
