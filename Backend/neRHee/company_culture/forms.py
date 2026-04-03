from django import forms
from .models import CompanyPage, EmployeeSuggestion

class CompanyPageForm(forms.ModelForm):
    class Meta:
        model = CompanyPage
        fields = ['title', 'content']
        widgets = {
            'title': forms.TextInput(attrs={'class': 'form-control'}),
            'content': forms.Textarea(attrs={'class': 'form-control', 'rows': 10}),
        }

class SuggestionForm(forms.ModelForm):
    class Meta:
        model = EmployeeSuggestion
        fields = ['title', 'suggestion_text']
        widgets = {
            'title': forms.TextInput(attrs={'class': 'form-control'}),
            'suggestion_text': forms.Textarea(attrs={'class': 'form-control', 'rows': 5}),
        }

class SuggestionResponseForm(forms.ModelForm):
    class Meta:
        model = EmployeeSuggestion
        fields = ['status', 'response']
        widgets = {
            'status': forms.Select(attrs={'class': 'form-control'}),
            'response': forms.Textarea(attrs={'class': 'form-control', 'rows': 4}),
        }