from django.urls import path

from .views import (
    GmailApproveAndReplyAPIView,
    GmailConnectAPIView,
    GmailDisconnectAPIView,
    GmailStatusAPIView,
    GmailSyncTicketsAPIView,
)

urlpatterns = [
    path('gmail/status/', GmailStatusAPIView.as_view(), name='gmail-status'),
    path('gmail/connect/', GmailConnectAPIView.as_view(), name='gmail-connect'),
    path('gmail/disconnect/', GmailDisconnectAPIView.as_view(), name='gmail-disconnect'),
    path('gmail/sync/', GmailSyncTicketsAPIView.as_view(), name='gmail-sync'),
    path(
        'gmail/approve-and-reply/',
        GmailApproveAndReplyAPIView.as_view(),
        name='gmail-approve-and-reply',
    ),
]
