from django.contrib import admin
from django.urls import path, include
from django.shortcuts import redirect
from django.conf import settings
from django.conf.urls.static import static

urlpatterns = [
    path('admin/', admin.site.urls),
    path('', lambda request: redirect('login')),
    path('', include('core.urls')),
    path('employees/', include('employees.urls')),
    path('requests/', include('requests_app.urls')),
    path('recruitment/', include('recruitment.urls', namespace='recruitment')),
    path('onboarding/', include('onboarding.urls')),
    path('culture/', include('company_culture.urls')),
    path('knowledge/', include('knowledge_management.urls')),
    
    # API URLs
    path('api/v1/', include('api_urls')),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)