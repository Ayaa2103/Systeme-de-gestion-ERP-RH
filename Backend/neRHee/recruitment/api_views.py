from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from django.shortcuts import get_object_or_404
from .models import JobOffer, Application, Interview, ProfileRecommendation
from .serializers import JobOfferSerializer, ApplicationSerializer, InterviewSerializer, ProfileRecommendationSerializer
from core.notifications import create_notification, create_notifications_for_roles

def check_hr_permission(user):
    """Vérifier les permissions HR"""
    return hasattr(user, 'role') and user.role in ['hr_manager', 'hr_director', 'administrator']

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def job_offers_list(request):
    """Liste des offres d'emploi"""
    if not check_hr_permission(request.user):
        return Response({'error': 'Permission denied'}, status=status.HTTP_403_FORBIDDEN)
    
    job_offers = JobOffer.objects.all().order_by('-created_at')
    
    # Filtres
    status_filter = request.GET.get('status')
    if status_filter:
        job_offers = job_offers.filter(status=status_filter)
    
    serializer = JobOfferSerializer(job_offers, many=True)
    return Response(serializer.data)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def create_job_offer(request):
    """Créer une offre d'emploi"""
    if not check_hr_permission(request.user):
        return Response({'error': 'Permission denied'}, status=status.HTTP_403_FORBIDDEN)
    
    data = request.data.copy()
    data['created_by'] = request.user.id
    
    serializer = JobOfferSerializer(data=data)
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['PUT'])
@permission_classes([IsAuthenticated])
def update_job_offer(request, job_offer_id):
    """Modifier une offre d'emploi"""
    if not check_hr_permission(request.user):
        return Response({'error': 'Permission denied'}, status=status.HTTP_403_FORBIDDEN)
    
    job_offer = get_object_or_404(JobOffer, id=job_offer_id)
    
    serializer = JobOfferSerializer(job_offer, data=request.data, partial=True)
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def publish_job_offer(request, job_offer_id):
    """Publier une offre d'emploi"""
    if not check_hr_permission(request.user):
        return Response({'error': 'Permission denied'}, status=status.HTTP_403_FORBIDDEN)
    
    job_offer = get_object_or_404(JobOffer, id=job_offer_id)
    job_offer.publish()
    
    serializer = JobOfferSerializer(job_offer)
    return Response(serializer.data)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def close_job_offer(request, job_offer_id):
    """Fermer une offre d'emploi"""
    if not check_hr_permission(request.user):
        return Response({'error': 'Permission denied'}, status=status.HTTP_403_FORBIDDEN)
    
    job_offer = get_object_or_404(JobOffer, id=job_offer_id)
    job_offer.close()
    
    serializer = JobOfferSerializer(job_offer)
    return Response(serializer.data)

@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def delete_job_offer(request, job_offer_id):
    """Supprimer une offre d'emploi — administrateur et responsable RH"""
    if request.user.role not in ['administrator', 'hr_manager']:
        return Response({'error': 'Permission insuffisante pour supprimer une offre.'}, status=status.HTTP_403_FORBIDDEN)
    job_offer = get_object_or_404(JobOffer, id=job_offer_id)
    job_offer.delete()
    return Response({'message': 'Offre supprimée avec succès.'}, status=status.HTTP_204_NO_CONTENT)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def applications_list(request):
    """Liste des candidatures"""
    if not check_hr_permission(request.user):
        return Response({'error': 'Permission denied'}, status=status.HTTP_403_FORBIDDEN)
    
    applications = Application.objects.select_related('job_offer').all().order_by('-applied_at')
    
    # Filtres
    job_offer_filter = request.GET.get('job_offer')
    status_filter = request.GET.get('status')
    
    if job_offer_filter:
        applications = applications.filter(job_offer_id=job_offer_filter)
    if status_filter:
        applications = applications.filter(status=status_filter)
    
    serializer = ApplicationSerializer(applications, many=True)
    return Response(serializer.data)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def application_detail(request, application_id):
    """Détail d'une candidature"""
    if not check_hr_permission(request.user):
        return Response({'error': 'Permission denied'}, status=status.HTTP_403_FORBIDDEN)
    
    application = get_object_or_404(Application, id=application_id)
    serializer = ApplicationSerializer(application)
    return Response(serializer.data)

@api_view(['PUT'])
@permission_classes([IsAuthenticated])
def update_application_status(request, application_id):
    """Mettre à jour le statut d'une candidature"""
    if not check_hr_permission(request.user):
        return Response({'error': 'Permission denied'}, status=status.HTTP_403_FORBIDDEN)
    
    application = get_object_or_404(Application, id=application_id)
    
    new_status = request.data.get('status')
    notes = request.data.get('notes', '')
    
    if new_status:
        application.status = new_status
        application.notes = notes
        application.reviewed_by = request.user
        from django.utils import timezone
        application.reviewed_at = timezone.now()
        application.save()
    
    serializer = ApplicationSerializer(application)
    return Response(serializer.data)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def job_offer_detail(request, job_offer_id):
    """Détail d'une offre d'emploi"""
    if not check_hr_permission(request.user):
        return Response({'error': 'Permission denied'}, status=status.HTTP_403_FORBIDDEN)
    
    job_offer = get_object_or_404(JobOffer, id=job_offer_id)
    applications = job_offer.applications.all()
    
    job_offer_data = JobOfferSerializer(job_offer).data
    job_offer_data['applications'] = ApplicationSerializer(applications, many=True).data
    
    return Response(job_offer_data)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def create_interview(request, application_id):
    """Créer un entretien"""
    if not check_hr_permission(request.user):
        return Response({'error': 'Permission denied'}, status=status.HTTP_403_FORBIDDEN)
    
    application = get_object_or_404(Application, id=application_id)
    
    data = request.data.copy()
    data['application'] = application.id
    data['interviewer'] = request.user.id
    
    serializer = InterviewSerializer(data=data)
    if serializer.is_valid():
        interview = serializer.save()
        # Mettre à jour le statut de la candidature
        application.status = 'interview'
        application.save()
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def submit_interview_feedback(request, interview_id):
    """Soumettre le feedback d'un entretien"""
    if not check_hr_permission(request.user):
        return Response({'error': 'Permission denied'}, status=status.HTTP_403_FORBIDDEN)
    
    interview = get_object_or_404(Interview, id=interview_id)
    
    feedback = request.data.get('feedback', '')
    score = request.data.get('score')
    
    interview.feedback = feedback
    if score:
        interview.score = int(score)
    interview.status = 'completed'
    interview.save()
    
    serializer = InterviewSerializer(interview)
    return Response(serializer.data)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def profile_recommendations_list(request):
    """Liste des recommandations de profils"""
    if not check_hr_permission(request.user):
        return Response({'error': 'Permission denied'}, status=status.HTTP_403_FORBIDDEN)
    
    recommendations = ProfileRecommendation.objects.select_related('job_offer', 'recommended_by').all().order_by('-created_at')
    
    serializer = ProfileRecommendationSerializer(recommendations, many=True)
    return Response(serializer.data)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def update_recommendation_status(request, recommendation_id):
    """Mettre à jour le statut d'une recommandation"""
    if not check_hr_permission(request.user):
        return Response({'error': 'Permission denied'}, status=status.HTTP_403_FORBIDDEN)
    
    recommendation = get_object_or_404(ProfileRecommendation, id=recommendation_id)

    new_status = request.data.get('status')
    if new_status in ['pending', 'contacted', 'rejected']:
        recommendation.status = new_status
        recommendation.save()
        status_labels = {'pending': 'en attente', 'contacted': 'contactée', 'rejected': 'rejetée'}
        create_notification(
            recommendation.recommended_by,
            title='Mise à jour de votre recommandation',
            message=f"Votre recommandation de {recommendation.candidate_name} est désormais « {status_labels.get(new_status, new_status)} ».",
            notification_type='recommendation_status',
            actor=request.user,
            link='/employee/recommend',
        )

    serializer = ProfileRecommendationSerializer(recommendation)
    return Response(serializer.data)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def recruitment_dashboard_stats(request):
    """Statistiques du tableau de bord recrutement"""
    if not check_hr_permission(request.user):
        return Response({'error': 'Permission denied'}, status=status.HTTP_403_FORBIDDEN)
    
    stats = {
        'total_job_offers': JobOffer.objects.count(),
        'published_offers': JobOffer.objects.filter(status='published').count(),
        'draft_offers': JobOffer.objects.filter(status='draft').count(),
        'closed_offers': JobOffer.objects.filter(status='closed').count(),
        'total_applications': Application.objects.count(),
        'pending_applications': Application.objects.filter(status='pending').count(),
        'reviewed_applications': Application.objects.filter(status='reviewed').count(),
        'interview_applications': Application.objects.filter(status='interview').count(),
        'accepted_applications': Application.objects.filter(status='accepted').count(),
        'rejected_applications': Application.objects.filter(status='rejected').count(),
        'scheduled_interviews': Interview.objects.filter(status='scheduled').count(),
    }
    
    return Response(stats)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def public_job_offers(request):
    """Offres d'emploi publiques pour les employés"""
    job_offers = JobOffer.objects.filter(status='published').order_by('-created_at')
    serializer = JobOfferSerializer(job_offers, many=True)
    return Response(serializer.data)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def public_job_detail(request, job_offer_id):
    """Détail d'une offre publique"""
    job_offer = get_object_or_404(JobOffer, id=job_offer_id, status='published')
    serializer = JobOfferSerializer(job_offer)
    return Response(serializer.data)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def apply_to_job(request, job_offer_id):
    """Postuler à une offre (pour soi-même)"""
    job_offer = get_object_or_404(JobOffer, id=job_offer_id, status='published')
    
    data = request.data.copy()
    data['job_offer'] = job_offer.id
    
    serializer = ApplicationSerializer(data=data)
    if serializer.is_valid():
        application = serializer.save()
        create_notifications_for_roles(
            ['hr_manager', 'hr_director', 'administrator'],
            title='Nouvelle candidature reçue',
            message=f"{application.first_name} {application.last_name} a postulé à « {job_offer.title} ».",
            notification_type='application_received',
            actor=request.user,
            link='/recruitment/applications',
        )
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def recommend_profile(request, job_offer_id):
    """Recommander un profil pour une offre"""
    try:
        job_offer = get_object_or_404(JobOffer, id=job_offer_id)
        
        # Créer directement la recommandation
        recommendation = ProfileRecommendation.objects.create(
            job_offer=job_offer,
            recommended_by=request.user,
            candidate_name=request.data.get('candidate_name'),
            candidate_email=request.data.get('candidate_email'),
            candidate_phone=request.data.get('candidate_phone', ''),
            relationship=request.data.get('relationship'),
            recommendation_reason=request.data.get('recommendation_reason'),
            status='pending'
        )
        
        serializer = ProfileRecommendationSerializer(recommendation)
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    except Exception as e:
        print(f"Error creating recommendation: {str(e)}")
        return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)