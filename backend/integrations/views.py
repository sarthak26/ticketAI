from django.shortcuts import get_object_or_404
from django.utils import timezone
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from core.models import Ticket

from .models import GmailIntegration
from .serializers import (
    GmailConnectSerializer,
    GmailIntegrationSerializer,
    GmailReplySerializer,
)
from .services import send_gmail_reply, sync_gmail_tickets, validate_gmail_credentials


class GmailStatusAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        integration = GmailIntegration.objects.filter(user=request.user).first()
        if not integration:
            return Response(
                {'data': {'connected': False}, 'pagination': {}},
            )
        serialized = GmailIntegrationSerializer(integration)
        return Response(
            {'data': {'connected': True, 'integration': serialized.data}, 'pagination': {}},
        )


class GmailConnectAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        serializer = GmailConnectSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        payload = serializer.validated_data

        integration, _ = GmailIntegration.objects.get_or_create(user=request.user)
        integration.email = payload['email']
        integration.app_password = payload['app_password']
        integration.imap_host = payload['imap_host']
        integration.imap_port = payload['imap_port']
        integration.smtp_host = payload['smtp_host']
        integration.smtp_port = payload['smtp_port']
        integration.is_active = True
        integration.last_error = ''

        try:
            validate_gmail_credentials(integration)
            integration.save()
        except Exception as exc:
            integration.last_error = str(exc)
            integration.save()
            return Response(
                {'data': {'error': f'Gmail authentication failed: {exc}'}, 'pagination': {}},
                status=status.HTTP_400_BAD_REQUEST,
            )

        return Response({'data': {'message': 'Gmail connected'}, 'pagination': {}})


class GmailDisconnectAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        integration = GmailIntegration.objects.filter(user=request.user).first()
        if not integration:
            return Response({'data': {'message': 'No integration found'}, 'pagination': {}})
        integration.is_active = False
        integration.save(update_fields=['is_active', 'updated'])
        return Response({'data': {'message': 'Gmail disconnected'}, 'pagination': {}})


class GmailSyncTicketsAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        integration = get_object_or_404(GmailIntegration, user=request.user, is_active=True)
        try:
            result = sync_gmail_tickets(integration=integration, limit=25)
            integration.last_synced = timezone.now()
            integration.last_error = ''
            integration.save(update_fields=['last_synced', 'last_error', 'updated'])
            return Response({'data': result, 'pagination': {}})
        except Exception as exc:
            integration.last_error = str(exc)
            integration.save(update_fields=['last_error', 'updated'])
            return Response(
                {'data': {'error': f'Sync failed: {exc}'}, 'pagination': {}},
                status=status.HTTP_400_BAD_REQUEST,
            )


class GmailApproveAndReplyAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        serializer = GmailReplySerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        ticket_id = serializer.validated_data['ticket_id']
        reply_text = serializer.validated_data['reply_text']

        ticket = get_object_or_404(Ticket.objects.select_related('customer'), id=ticket_id)
        integration = get_object_or_404(GmailIntegration, user=request.user, is_active=True)

        if not hasattr(ticket, 'gmail_thread'):
            ticket.status = Ticket.Status.RESOLVED
            ticket.save(update_fields=['status', 'updated'])
            return Response(
                {
                    'data': {
                        'ticket_id': ticket.id,
                        'status': ticket.status,
                        'action': 'approved_without_gmail_send',
                    },
                    'pagination': {},
                }
            )

        try:
            send_gmail_reply(
                integration=integration,
                to_email=ticket.gmail_thread.from_email,
                subject=ticket.gmail_thread.subject or ticket.subject,
                reply_text=reply_text,
            )
            ticket.status = Ticket.Status.RESOLVED
            ticket.save(update_fields=['status', 'updated'])
            return Response(
                {
                    'data': {
                        'ticket_id': ticket.id,
                        'status': ticket.status,
                        'action': 'approved_and_sent',
                    },
                    'pagination': {},
                }
            )
        except Exception as exc:
            return Response(
                {'data': {'error': f'Failed to send Gmail reply: {exc}'}, 'pagination': {}},
                status=status.HTTP_400_BAD_REQUEST,
            )
