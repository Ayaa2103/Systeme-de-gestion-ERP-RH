from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from .models import CompanyPage, EmployeeSuggestion
from .api_serializers import CompanyPageSerializer, EmployeeSuggestionSerializer
from core.notifications import create_notification, create_notifications_for_roles

class CompanyPageViewSet(viewsets.ModelViewSet):
    queryset = CompanyPage.objects.all()
    serializer_class = CompanyPageSerializer
    
    def get_permissions(self):
        if self.action in ['list', 'retrieve']:
            return [AllowAny()]
        return [IsAuthenticated()]
    
    def perform_create(self, serializer):
        # Permettre la création pour tous les utilisateurs authentifiés
        serializer.save(updated_by=self.request.user)
    
    def perform_update(self, serializer):
        # Permettre la mise à jour pour tous les utilisateurs authentifiés
        serializer.save(updated_by=self.request.user)

class EmployeeSuggestionViewSet(viewsets.ModelViewSet):
    queryset = EmployeeSuggestion.objects.all()
    serializer_class = EmployeeSuggestionSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        if hasattr(self.request.user, 'role') and self.request.user.role in ['hr_manager', 'hr_director', 'administrator']:
            return EmployeeSuggestion.objects.all()
        return EmployeeSuggestion.objects.filter(employee=self.request.user)
    
    def perform_create(self, serializer):
        suggestion = serializer.save(employee=self.request.user)
        create_notifications_for_roles(
            ['hr_manager', 'hr_director'],
            title='Nouvelle suggestion reçue',
            message=f"{self.request.user.get_full_name() or self.request.user.username} a soumis une nouvelle suggestion.",
            notification_type='culture_suggestion',
            actor=self.request.user,
            link='/culture/suggestions',
        )

    @action(detail=True, methods=['post'])
    def respond(self, request, pk=None):
        if not hasattr(request.user, 'role') or request.user.role not in ['hr_manager', 'hr_director']:
            return Response({'error': 'Permission denied'}, status=status.HTTP_403_FORBIDDEN)

        suggestion = self.get_object()
        response_text = request.data.get('response', '')

        if not response_text:
            return Response({'error': 'Response text is required'}, status=status.HTTP_400_BAD_REQUEST)

        suggestion.response = response_text
        suggestion.status = 'answered'
        suggestion.responded_by = request.user
        from django.utils import timezone
        suggestion.response_date = timezone.now()
        suggestion.save()

        create_notification(
            suggestion.employee,
            title='Réponse à votre suggestion',
            message=f"La RH a répondu à votre suggestion : {response_text[:120]}",
            notification_type='culture_response',
            actor=request.user,
            link='/culture/suggestions',
        )

        return Response({'message': 'Response added successfully'})