from django.db import models
from django.utils import timezone


class GmailIntegration(models.Model):
    user = models.OneToOneField('auth.User', on_delete=models.CASCADE, related_name='gmail_integration')
    email = models.EmailField()
    app_password = models.CharField(max_length=255)
    imap_host = models.CharField(max_length=120, default='imap.gmail.com')
    imap_port = models.PositiveIntegerField(default=993)
    smtp_host = models.CharField(max_length=120, default='smtp.gmail.com')
    smtp_port = models.PositiveIntegerField(default=465)
    is_active = models.BooleanField(default=True)
    last_synced = models.DateTimeField(null=True, blank=True)
    last_error = models.TextField(blank=True)
    created = models.DateTimeField(default=timezone.now)
    updated = models.DateTimeField(auto_now=True)

    def __str__(self) -> str:
        return f'Gmail ({self.email})'


class GmailTicketThread(models.Model):
    ticket = models.OneToOneField('core.Ticket', on_delete=models.CASCADE, related_name='gmail_thread')
    gmail_message_id = models.CharField(max_length=255, db_index=True)
    from_email = models.EmailField()
    to_email = models.EmailField(blank=True)
    subject = models.CharField(max_length=255)
    created = models.DateTimeField(default=timezone.now)

    def __str__(self) -> str:
        return f'Ticket #{self.ticket_id} <-> {self.gmail_message_id}'

