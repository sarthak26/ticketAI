from rest_framework import serializers

from .models import GmailIntegration


class GmailIntegrationSerializer(serializers.ModelSerializer):
    class Meta:
        model = GmailIntegration
        fields = [
            'email',
            'imap_host',
            'imap_port',
            'smtp_host',
            'smtp_port',
            'is_active',
            'last_synced',
            'last_error',
        ]
        read_only_fields = ['last_synced', 'last_error']


class GmailConnectSerializer(serializers.Serializer):
    email = serializers.EmailField()
    app_password = serializers.CharField()
    imap_host = serializers.CharField(required=False, default='imap.gmail.com')
    imap_port = serializers.IntegerField(required=False, default=993)
    smtp_host = serializers.CharField(required=False, default='smtp.gmail.com')
    smtp_port = serializers.IntegerField(required=False, default=465)


class GmailReplySerializer(serializers.Serializer):
    ticket_id = serializers.IntegerField()
    reply_text = serializers.CharField()
