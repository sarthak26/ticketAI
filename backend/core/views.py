from datetime import timedelta
from decimal import Decimal

from django.contrib.auth import authenticate, get_user_model
from django.db.models import Count, Q
from django.shortcuts import get_object_or_404
from django.utils import timezone
from rest_framework import status
from rest_framework.authtoken.models import Token
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import AISuggestion, AppSetting, Customer, KnowledgeDocument, Ticket
from .serializers import (
    AISuggestionSerializer,
    AppSettingSerializer,
    KnowledgeDocumentSerializer,
    TicketSerializer,
)


def paginated_response(queryset, serializer_class, request, *, default_page_size=10):
    try:
        page = max(int(request.query_params.get('page', 1)), 1)
    except (TypeError, ValueError):
        page = 1
    try:
        page_size = max(int(request.query_params.get('page_size', default_page_size)), 1)
    except (TypeError, ValueError):
        page_size = default_page_size
    start = (page - 1) * page_size
    end = start + page_size

    total = queryset.count()
    serializer = serializer_class(queryset[start:end], many=True)
    pagination = {
        'page': page,
        'page_size': page_size,
        'total': total,
        'total_pages': (total + page_size - 1) // page_size,
    }
    return Response({'data': serializer.data, 'pagination': pagination})


class LoginAPIView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        username = request.data.get('username')
        password = request.data.get('password')
        if not username or not password:
            return Response(
                {'data': {'error': 'Username and password required'}, 'pagination': {}},
                status=status.HTTP_400_BAD_REQUEST,
            )

        user = authenticate(username=username, password=password)
        if not user:
            user_model = get_user_model()
            if not user_model.objects.filter(username=username).exists():
                user = user_model.objects.create_user(username=username, password=password)
            else:
                user = None

        if not user:
            return Response(
                {'data': {'error': 'Invalid credentials'}, 'pagination': {}},
                status=status.HTTP_401_UNAUTHORIZED,
            )

        token, _ = Token.objects.get_or_create(user=user)
        return Response(
            {'data': {'token': token.key, 'username': user.username}, 'pagination': {}}
        )


class DashboardAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        today = timezone.now().date()
        tickets_today = Ticket.objects.filter(created__date=today)
        suggestions_today = AISuggestion.objects.filter(created__date=today)
        resolved_today = tickets_today.filter(status=Ticket.Status.RESOLVED).count()

        day_labels = []
        day_counts = []
        for i in range(6, -1, -1):
            day = today - timedelta(days=i)
            count = Ticket.objects.filter(created__date=day).count()
            day_labels.append(day.strftime('%b %d'))
            day_counts.append(count)

        type_counts_qs = (
            Ticket.objects.values('category').annotate(total=Count('id')).order_by('-total')
        )

        recent_tickets = Ticket.objects.select_related('customer').prefetch_related(
            'ai_suggestions'
        ).order_by('-created')[:8]

        avg_response_time = 18
        if suggestions_today.exists():
            avg_response_time = 12

        data = {
            'stats': {
                'total_tickets_today': tickets_today.count(),
                'auto_reply_suggestions_generated': suggestions_today.count(),
                'avg_response_time_minutes': avg_response_time,
                'tickets_resolved': resolved_today,
            },
            'tickets_by_day': [
                {'day': label, 'tickets': count}
                for label, count in zip(day_labels, day_counts, strict=True)
            ],
            'ticket_types': [
                {'category': item['category'], 'count': item['total']} for item in type_counts_qs
            ],
            'recent_tickets': TicketSerializer(recent_tickets, many=True).data,
        }
        return Response({'data': data, 'pagination': {}})


class TicketsListAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        queryset = Ticket.objects.select_related('customer').prefetch_related(
            'ai_suggestions'
        ).order_by('-created')

        status_filter = request.query_params.get('status')
        category_filter = request.query_params.get('category')
        date_filter = request.query_params.get('date')
        search = request.query_params.get('search')

        if status_filter:
            queryset = queryset.filter(status=status_filter)
        if category_filter:
            queryset = queryset.filter(category=category_filter)
        if date_filter:
            queryset = queryset.filter(created__date=date_filter)
        if search:
            queryset = queryset.filter(
                Q(subject__icontains=search) | Q(customer__name__icontains=search)
            )

        return paginated_response(queryset, TicketSerializer, request)


class TicketDetailAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, ticket_id: int):
        ticket = get_object_or_404(
            Ticket.objects.select_related('customer').prefetch_related('ai_suggestions'),
            id=ticket_id,
        )
        return Response({'data': TicketSerializer(ticket).data, 'pagination': {}})


class TicketApproveAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, ticket_id: int):
        ticket = get_object_or_404(Ticket, id=ticket_id)
        ticket.status = Ticket.Status.RESOLVED
        ticket.save(update_fields=['status', 'updated'])
        return Response({'data': {'ticket_id': ticket_id, 'status': ticket.status}, 'pagination': {}})


class AISuggestionsListAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        queryset = AISuggestion.objects.select_related('ticket', 'ticket__customer').order_by(
            '-created'
        )
        return paginated_response(queryset, AISuggestionSerializer, request)


class AISuggestionUpdateAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def patch(self, request, suggestion_id: int):
        suggestion = get_object_or_404(AISuggestion, id=suggestion_id)
        serializer = AISuggestionSerializer(suggestion, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response({'data': serializer.data, 'pagination': {}})


class AISuggestionApproveAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, suggestion_id: int):
        suggestion = get_object_or_404(
            AISuggestion.objects.select_related('ticket'),
            id=suggestion_id,
        )
        suggestion.ticket.status = Ticket.Status.RESOLVED
        suggestion.ticket.save(update_fields=['status', 'updated'])
        return Response({'data': {'id': suggestion_id, 'action': 'approved'}, 'pagination': {}})


class AISuggestionRejectAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, suggestion_id: int):
        suggestion = get_object_or_404(AISuggestion.objects.select_related('ticket'), id=suggestion_id)
        suggestion.ticket.status = Ticket.Status.IN_PROGRESS
        suggestion.ticket.save(update_fields=['status', 'updated'])
        return Response({'data': {'id': suggestion_id, 'action': 'rejected'}, 'pagination': {}})


class KnowledgeDocumentListCreateAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        queryset = KnowledgeDocument.objects.order_by('-created')
        return paginated_response(queryset, KnowledgeDocumentSerializer, request)

    def post(self, request):
        upload = request.FILES.get('file')
        if upload:
            content = upload.read().decode('utf-8')
            payload = {
                'name': upload.name,
                'content': content,
                'source': 'upload',
            }
            serializer = KnowledgeDocumentSerializer(data=payload)
        else:
            serializer = KnowledgeDocumentSerializer(data=request.data)

        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response({'data': serializer.data, 'pagination': {}}, status=201)


class SettingsAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        settings_obj, _ = AppSetting.objects.get_or_create(
            id=1,
            defaults={
                'company_name': 'Acme Inc.',
                'support_email': 'support@acme.com',
                'model_temperature': Decimal('0.30'),
                'auto_suggest_enabled': True,
            },
        )
        serializer = AppSettingSerializer(settings_obj)
        return Response({'data': serializer.data, 'pagination': {}})

    def put(self, request):
        settings_obj, _ = AppSetting.objects.get_or_create(id=1)
        serializer = AppSettingSerializer(settings_obj, data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response({'data': serializer.data, 'pagination': {}})


class SeedDataAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        if Ticket.objects.exists():
            return Response({'data': {'message': 'Seed already exists'}, 'pagination': {}})

        customers = [
            Customer.objects.create(
                name='Ariana Patel',
                email='ariana@novacore.com',
                company='NovaCore',
            ),
            Customer.objects.create(
                name='Daniel Kim',
                email='daniel@velocify.io',
                company='Velocify',
            ),
            Customer.objects.create(
                name='Mia Rogers',
                email='mia@quantahealth.com',
                company='QuantaHealth',
            ),
        ]
        tickets = [
            Ticket.objects.create(
                customer=customers[0],
                subject='Invoice mismatch for March billing',
                message='Our invoice total does not match usage logs.',
                status=Ticket.Status.OPEN,
                category=Ticket.Category.BILLING,
            ),
            Ticket.objects.create(
                customer=customers[1],
                subject='Unable to reset admin password',
                message='The reset link returns a 403 error.',
                status=Ticket.Status.IN_PROGRESS,
                category=Ticket.Category.ACCOUNT,
            ),
            Ticket.objects.create(
                customer=customers[2],
                subject='API timeout in webhook endpoint',
                message='Webhook requests time out after 10 seconds.',
                status=Ticket.Status.OPEN,
                category=Ticket.Category.TECHNICAL,
            ),
        ]
        for ticket in tickets:
            AISuggestion.objects.create(
                ticket=ticket,
                suggested_reply=(
                    'Thanks for reaching out. We reviewed your issue and are '
                    'currently validating the underlying cause. We will update '
                    'you shortly with a resolution.'
                ),
                confidence=Decimal('0.86'),
            )
        KnowledgeDocument.objects.create(
            name='Billing FAQs.md',
            content='Billing runs daily at 00:00 UTC.\nInvoices are generated monthly.',
            source='manual',
        )
        return Response({'data': {'message': 'Seed data created'}, 'pagination': {}}, status=201)
