from django.urls import path

from .views import (
    AISuggestionApproveAPIView,
    AISuggestionRejectAPIView,
    AISuggestionsListAPIView,
    AISuggestionUpdateAPIView,
    DashboardAPIView,
    KnowledgeDocumentListCreateAPIView,
    LoginAPIView,
    SeedDataAPIView,
    SettingsAPIView,
    TicketApproveAPIView,
    TicketDetailAPIView,
    TicketsListAPIView,
)

urlpatterns = [
    path('auth/login/', LoginAPIView.as_view(), name='auth-login'),
    path('dashboard/', DashboardAPIView.as_view(), name='dashboard'),
    path('tickets/', TicketsListAPIView.as_view(), name='tickets-list'),
    path('tickets/<int:ticket_id>/', TicketDetailAPIView.as_view(), name='ticket-detail'),
    path('tickets/<int:ticket_id>/approve/', TicketApproveAPIView.as_view(), name='ticket-approve'),
    path('ai-suggestions/', AISuggestionsListAPIView.as_view(), name='ai-suggestions-list'),
    path(
        'ai-suggestions/<int:suggestion_id>/',
        AISuggestionUpdateAPIView.as_view(),
        name='ai-suggestion-update',
    ),
    path(
        'ai-suggestions/<int:suggestion_id>/approve/',
        AISuggestionApproveAPIView.as_view(),
        name='ai-suggestion-approve',
    ),
    path(
        'ai-suggestions/<int:suggestion_id>/reject/',
        AISuggestionRejectAPIView.as_view(),
        name='ai-suggestion-reject',
    ),
    path(
        'knowledge-documents/',
        KnowledgeDocumentListCreateAPIView.as_view(),
        name='knowledge-documents',
    ),
    path('settings/', SettingsAPIView.as_view(), name='settings'),
    path('seed/', SeedDataAPIView.as_view(), name='seed-data'),
]
