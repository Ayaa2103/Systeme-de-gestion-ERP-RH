from django import forms
from .models import JobOffer, Application, Interview, ProfileRecommendation
from employees.models import Department

class JobOfferForm(forms.ModelForm):
    department = forms.ModelChoiceField(
        queryset=Department.objects.all().order_by('name'),
        empty_label="Sélectionner un département",
        widget=forms.Select(attrs={'class': 'form-control'})
    )
    
    class Meta:
        model = JobOffer
        fields = ['title', 'department', 'description', 'required_skills', 'experience_level']
        widgets = {
            'title': forms.TextInput(attrs={'class': 'form-control'}),
            'description': forms.Textarea(attrs={'class': 'form-control', 'rows': 5}),
            'required_skills': forms.Textarea(attrs={'class': 'form-control', 'rows': 3}),
            'experience_level': forms.Select(attrs={'class': 'form-control'}),
        }

    def save(self, commit=True):
        instance = super().save(commit=False)
        instance.department = self.cleaned_data['department'].name
        if commit:
            instance.save()
        return instance

class ApplicationForm(forms.ModelForm):
    class Meta:
        model = Application
        fields = ['first_name', 'last_name', 'email', 'phone', 'cv', 'cover_letter']
        widgets = {
            'first_name': forms.TextInput(attrs={'class': 'form-control'}),
            'last_name': forms.TextInput(attrs={'class': 'form-control'}),
            'email': forms.EmailInput(attrs={'class': 'form-control'}),
            'phone': forms.TextInput(attrs={'class': 'form-control'}),
            'cv': forms.FileInput(attrs={'class': 'form-control'}),
            'cover_letter': forms.Textarea(attrs={'class': 'form-control', 'rows': 4}),
        }

class InterviewForm(forms.ModelForm):
    class Meta:
        model = Interview
        fields = ['scheduled_date', 'interviewer', 'location']
        widgets = {
            'scheduled_date': forms.DateTimeInput(attrs={'class': 'form-control', 'type': 'datetime-local'}),
            'interviewer': forms.Select(attrs={'class': 'form-control'}),
            'location': forms.TextInput(attrs={'class': 'form-control'}),
        }

class InterviewFeedbackForm(forms.ModelForm):
    class Meta:
        model = Interview
        fields = ['feedback', 'score', 'status']
        widgets = {
            'feedback': forms.Textarea(attrs={'class': 'form-control', 'rows': 4}),
            'score': forms.NumberInput(attrs={'class': 'form-control', 'min': 0, 'max': 10}),
            'status': forms.Select(attrs={'class': 'form-control'}),
        }

class ProfileRecommendationForm(forms.ModelForm):
    class Meta:
        model = ProfileRecommendation
        fields = ['candidate_name', 'candidate_email', 'candidate_phone', 'relationship', 'recommendation_reason']
        widgets = {
            'candidate_name': forms.TextInput(attrs={'class': 'form-control', 'placeholder': 'Nom complet du candidat'}),
            'candidate_email': forms.EmailInput(attrs={'class': 'form-control', 'placeholder': 'email@exemple.com'}),
            'candidate_phone': forms.TextInput(attrs={'class': 'form-control', 'placeholder': 'Téléphone (optionnel)'}),
            'relationship': forms.TextInput(attrs={'class': 'form-control', 'placeholder': 'Ex: Ancien collègue, ami, famille...'}),
            'recommendation_reason': forms.Textarea(attrs={'class': 'form-control', 'rows': 4, 'placeholder': 'Expliquez pourquoi vous recommandez ce profil...'}),
        }