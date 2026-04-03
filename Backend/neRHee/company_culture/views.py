from django.shortcuts import render, redirect, get_object_or_404
from django.contrib.auth.decorators import login_required, user_passes_test
from django.contrib import messages
from django.utils import timezone
from .models import CompanyPage, EmployeeSuggestion
from .forms import CompanyPageForm, SuggestionForm, SuggestionResponseForm

def is_hr_manager_or_director(user):
    return user.role in ['hr_manager', 'hr_director']

# Company Pages Views
@login_required
def company_page_view(request, page_type):
    """View company page content"""
    page, created = CompanyPage.objects.get_or_create(
        page_type=page_type,
        defaults={'title': page_type.replace('_', ' ').title(), 'content': 'Content coming soon...'}
    )
    return render(request, 'company_culture/page_view.html', {'page': page})

@user_passes_test(is_hr_manager_or_director)
def company_page_edit(request, page_type):
    """Edit company page content"""
    page, created = CompanyPage.objects.get_or_create(
        page_type=page_type,
        defaults={'title': page_type.replace('_', ' ').title(), 'content': ''}
    )
    
    if request.method == 'POST':
        form = CompanyPageForm(request.POST, instance=page)
        if form.is_valid():
            page = form.save(commit=False)
            page.updated_by = request.user
            page.save()
            messages.success(request, 'Page updated successfully')
            return redirect('company_page_view', page_type=page_type)
    else:
        form = CompanyPageForm(instance=page)
    
    return render(request, 'company_culture/page_edit.html', {'form': form, 'page': page})

# Suggestions Views
@login_required
def submit_suggestion(request):
    """Submit a new suggestion"""
    if request.method == 'POST':
        form = SuggestionForm(request.POST)
        if form.is_valid():
            suggestion = form.save(commit=False)
            suggestion.employee = request.user
            suggestion.save()
            messages.success(request, 'Suggestion submitted successfully')
            return redirect('my_suggestions')
    else:
        form = SuggestionForm()
    
    return render(request, 'company_culture/submit_suggestion.html', {'form': form})

@login_required
def my_suggestions(request):
    """View user's own suggestions"""
    suggestions = EmployeeSuggestion.objects.filter(employee=request.user)
    return render(request, 'company_culture/my_suggestions.html', {'suggestions': suggestions})

@user_passes_test(is_hr_manager_or_director)
def manage_suggestions(request):
    """Manage all suggestions (HR only)"""
    suggestions = EmployeeSuggestion.objects.all()
    return render(request, 'company_culture/manage_suggestions.html', {'suggestions': suggestions})

@user_passes_test(is_hr_manager_or_director)
def respond_suggestion(request, pk):
    """Respond to a suggestion"""
    suggestion = get_object_or_404(EmployeeSuggestion, pk=pk)
    
    if request.method == 'POST':
        form = SuggestionResponseForm(request.POST, instance=suggestion)
        if form.is_valid():
            suggestion = form.save(commit=False)
            suggestion.responded_by = request.user
            suggestion.response_date = timezone.now()
            suggestion.save()
            messages.success(request, 'Response saved successfully')
            return redirect('manage_suggestions')
    else:
        form = SuggestionResponseForm(instance=suggestion)
    
    return render(request, 'company_culture/respond_suggestion.html', {'form': form, 'suggestion': suggestion})

@login_required
def culture_dashboard(request):
    """Company culture dashboard"""
    pages = CompanyPage.objects.all()
    recent_suggestions = EmployeeSuggestion.objects.filter(employee=request.user)[:3] if not is_hr_manager_or_director(request.user) else EmployeeSuggestion.objects.all()[:5]
    
    return render(request, 'company_culture/dashboard.html', {
        'pages': pages,
        'recent_suggestions': recent_suggestions,
        'is_hr': is_hr_manager_or_director(request.user)
    })