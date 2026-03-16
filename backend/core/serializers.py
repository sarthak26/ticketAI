from rest_framework import serializers

from .models import AISuggestion, AppSetting, Customer, KnowledgeDocument, Ticket


class CustomerSerializer(serializers.ModelSerializer):
    class Meta:
        model = Customer
        fields = ['id', 'name', 'email', 'company']


class AISuggestionSerializer(serializers.ModelSerializer):
    ticket_subject = serializers.CharField(source='ticket.subject', read_only=True)
    customer_question = serializers.CharField(source='ticket.message', read_only=True)

    class Meta:
        model = AISuggestion
        fields = [
            'id',
            'ticket',
            'ticket_subject',
            'customer_question',
            'suggested_reply',
            'confidence',
            'created',
        ]


class TicketSerializer(serializers.ModelSerializer):
    customer = CustomerSerializer(read_only=True)
    latest_ai_suggestion = serializers.SerializerMethodField()
    has_gmail_thread = serializers.SerializerMethodField()

    class Meta:
        model = Ticket
        fields = [
            'id',
            'customer',
            'subject',
            'message',
            'status',
            'category',
            'created',
            'updated',
            'latest_ai_suggestion',
            'has_gmail_thread',
        ]

    def get_latest_ai_suggestion(self, obj: Ticket):
        suggestion = obj.ai_suggestions.order_by('-created').first()
        if not suggestion:
            return None
        return AISuggestionSerializer(suggestion).data

    def get_has_gmail_thread(self, obj: Ticket):
        return hasattr(obj, 'gmail_thread')


class KnowledgeDocumentSerializer(serializers.ModelSerializer):
    class Meta:
        model = KnowledgeDocument
        fields = ['id', 'name', 'content', 'source', 'created']


class AppSettingSerializer(serializers.ModelSerializer):
    class Meta:
        model = AppSetting
        fields = [
            'company_name',
            'support_email',
            'model_temperature',
            'auto_suggest_enabled',
            'updated',
        ]
