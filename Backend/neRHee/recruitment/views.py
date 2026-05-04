from django.shortcuts import render, redirect, get_object_or_404
from django.contrib.auth.decorators import login_required, user_passes_test
from django.contrib import messages
from django.utils import timezone
from django.http import JsonResponse
from .models import JobOffer, Application, Interview, ProfileRecommendation
from .forms import JobOfferForm, ApplicationForm, InterviewForm, ProfileRecommendationForm

def is_hr_manager_or_director(user):
    return user.role in ['hr_manager', 'hr_director']

def can_view_recruitment(user):
    return user.role in ['hr_manager', 'hr_director', 'administrator']

def is_hr_director(user):
    return user.role == 'hr_director'

# Job Offers Views
@user_passes_test(can_view_recruitment)
def job_offer_list(request):
    job_offers = JobOffer.objects.all().order_by('-created_at')
    return render(request, 'recruitment/job_offer_list.html', {'job_offers': job_offers})

@user_passes_test(is_hr_manager_or_director)
def job_offer_create(request):
    if request.method == 'POST':
        form = JobOfferForm(request.POST)
        if form.is_valid():
            job_offer = form.save(commit=False)
            job_offer.created_by = request.user
            job_offer.save()
            messages.success(request, 'Offre d\'emploi créée avec succès')
            return redirect('recruitment:job_offer_list')
    else:
        form = JobOfferForm()
    return render(request, 'recruitment/job_offer_form.html', {'form': form, 'title': 'Créer une offre d\'emploi'})

@user_passes_test(is_hr_manager_or_director)
def job_offer_edit(request, pk):
    job_offer = get_object_or_404(JobOffer, pk=pk)
    if request.method == 'POST':
        form = JobOfferForm(request.POST, instance=job_offer)
        if form.is_valid():
            form.save()
            messages.success(request, 'Offre d\'emploi modifiée avec succès')
            return redirect('recruitment:job_offer_list')
    else:
        form = JobOfferForm(instance=job_offer)
    return render(request, 'recruitment/job_offer_form.html', {'form': form, 'title': 'Modifier l\'offre d\'emploi'})

@user_passes_test(can_view_recruitment)
def job_offer_detail(request, pk):
    job_offer = get_object_or_404(JobOffer, pk=pk)
    applications = job_offer.applications.all()
    return render(request, 'recruitment/job_offer_detail.html', {'job_offer': job_offer, 'applications': applications})

@user_passes_test(is_hr_manager_or_director)
def job_offer_publish(request, pk):
    job_offer = get_object_or_404(JobOffer, pk=pk)
    job_offer.publish()
    messages.success(request, f'Offre "{job_offer.title}" publiée avec succès')
    return redirect('recruitment:job_offer_list')

@user_passes_test(is_hr_manager_or_director)
def job_offer_close(request, pk):
    job_offer = get_object_or_404(JobOffer, pk=pk)
    job_offer.close()
    messages.success(request, f'Offre "{job_offer.title}" fermée avec succès')
    return redirect('recruitment:job_offer_list')

# Applications Views
@user_passes_test(is_hr_manager_or_director)
def application_list(request):
    applications = Application.objects.all()
    return render(request, 'recruitment/application_list.html', {'applications': applications})

@user_passes_test(is_hr_manager_or_director)
def application_detail(request, pk):
    application = get_object_or_404(Application, pk=pk)
    interviews = application.interviews.all()
    return render(request, 'recruitment/application_detail.html', {'application': application, 'interviews': interviews})

@user_passes_test(is_hr_manager_or_director)
def application_update_status(request, pk):
    application = get_object_or_404(Application, pk=pk)
    if request.method == 'POST':
        new_status = request.POST.get('status')
        notes = request.POST.get('notes', '')
        
        application.status = new_status
        application.notes = notes
        application.reviewed_by = request.user
        application.reviewed_at = timezone.now()
        application.save()
        
        messages.success(request, f'Statut de la candidature mis à jour: {application.get_status_display()}')
        return redirect('recruitment:application_detail', pk=pk)
    
    return render(request, 'recruitment/application_update_status.html', {'application': application})

# Interviews Views
@user_passes_test(is_hr_manager_or_director)
def interview_create(request, application_pk):
    application = get_object_or_404(Application, pk=application_pk)
    if request.method == 'POST':
        form = InterviewForm(request.POST)
        if form.is_valid():
            interview = form.save(commit=False)
            interview.application = application
            interview.interviewer = request.user
            interview.save()
            
            # Update application status to interview
            application.status = 'interview'
            application.save()
            
            messages.success(request, 'Entretien programmé avec succès')
            return redirect('recruitment:application_detail', pk=application_pk)
    else:
        form = InterviewForm()
    
    return render(request, 'recruitment/interview_form.html', {
        'form': form, 
        'application': application,
        'title': 'Programmer un entretien'
    })

@user_passes_test(is_hr_manager_or_director)
def interview_detail(request, pk):
    interview = get_object_or_404(Interview, pk=pk)
    return render(request, 'recruitment/interview_detail.html', {'interview': interview})

@user_passes_test(is_hr_manager_or_director)
def interview_feedback(request, pk):
    interview = get_object_or_404(Interview, pk=pk)
    if request.method == 'POST':
        feedback = request.POST.get('feedback', '')
        score = request.POST.get('score')
        
        interview.feedback = feedback
        if score:
            interview.score = int(score)
        interview.status = 'completed'
        interview.save()
        
        messages.success(request, 'Feedback d\'entretien enregistré avec succès')
        return redirect('recruitment:interview_detail', pk=pk)
    
    return render(request, 'recruitment/interview_feedback.html', {'interview': interview})

# Public Views (for candidates)
def public_job_offers(request):
    job_offers = JobOffer.objects.filter(status='published')
    return render(request, 'recruitment/public_job_offers.html', {'job_offers': job_offers})

def public_job_detail(request, pk):
    job_offer = get_object_or_404(JobOffer, pk=pk, status='published')
    return render(request, 'recruitment/public_job_detail.html', {'job_offer': job_offer})

def apply_job(request, pk):
    job_offer = get_object_or_404(JobOffer, pk=pk, status='published')
    if request.method == 'POST':
        form = ApplicationForm(request.POST, request.FILES)
        if form.is_valid():
            application = form.save(commit=False)
            application.job_offer = job_offer
            application.save()
            messages.success(request, 'Votre candidature a été envoyée avec succès!')
            return redirect('recruitment:public_job_offers')
    else:
        form = ApplicationForm()
    
    return render(request, 'recruitment/apply_job.html', {'form': form, 'job_offer': job_offer})

# Dashboard Views
@user_passes_test(is_hr_manager_or_director)
def recruitment_dashboard(request):
    stats = {
        'total_job_offers': JobOffer.objects.count(),
        'published_offers': JobOffer.objects.filter(status='published').count(),
        'total_applications': Application.objects.count(),
        'pending_applications': Application.objects.filter(status='pending').count(),
        'scheduled_interviews': Interview.objects.filter(status='scheduled').count(),
    }
    
    recent_applications = Application.objects.all()[:5]
    upcoming_interviews = Interview.objects.filter(status='scheduled').order_by('-scheduled_date')[:5]
    
    return render(request, 'recruitment/dashboard.html', {
        'stats': stats,
        'recent_applications': recent_applications,
        'upcoming_interviews': upcoming_interviews,
    })

@login_required
def recommend_profile(request, job_offer_id):
    job_offer = get_object_or_404(JobOffer, id=job_offer_id, status='published')
    
    if request.method == 'POST':
        form = ProfileRecommendationForm(request.POST)
        if form.is_valid():
            recommendation = form.save(commit=False)
            recommendation.job_offer = job_offer
            recommendation.recommended_by = request.user
            recommendation.save()
            
            messages.success(request, f'Profil recommandé avec succès pour le poste "{job_offer.title}"')
            return redirect('dashboard')
    else:
        form = ProfileRecommendationForm()
    
    return render(request, 'recruitment/recommend_profile.html', {
        'form': form,
        'job_offer': job_offer
    })

@user_passes_test(is_hr_manager_or_director)
def profile_recommendations(request):
    """Voir toutes les recommandations de profils par les employés"""
    recommendations = ProfileRecommendation.objects.select_related(
        'job_offer', 'recommended_by'
    ).order_by('-created_at')
    
    return render(request, 'recruitment/profile_recommendations.html', {
        'recommendations': recommendations
    })

@user_passes_test(is_hr_manager_or_director)
def update_recommendation_status(request, recommendation_id):
    """Mettre à jour le statut d'une recommandation"""
    recommendation = get_object_or_404(ProfileRecommendation, id=recommendation_id)
    
    if request.method == 'POST':
        new_status = request.POST.get('status')
        if new_status in ['pending', 'contacted', 'rejected']:
            recommendation.status = new_status
            recommendation.save()
            
            messages.success(request, f'Statut de la recommandation mis à jour: {recommendation.get_status_display()}')
        
        return redirect('recruitment:profile_recommendations')
    
    return render(request, 'recruitment/update_recommendation_status.html', {
        'recommendation': recommendation
    })