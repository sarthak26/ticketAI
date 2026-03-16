from django.db import models
from django.utils import timezone


class Customer(models.Model):
    name = models.CharField(max_length=120)
    email = models.EmailField(unique=True)
    company = models.CharField(max_length=120, blank=True)
    created = models.DateTimeField(default=timezone.now)

    def __str__(self) -> str:
        return f'{self.name} ({self.email})'


class Ticket(models.Model):
    class Status(models.TextChoices):
        OPEN = 'open', 'Open'
        IN_PROGRESS = 'in_progress', 'In Progress'
        RESOLVED = 'resolved', 'Resolved'

    class Category(models.TextChoices):
        BILLING = 'billing', 'Billing'
        TECHNICAL = 'technical', 'Technical'
        ACCOUNT = 'account', 'Account'
        GENERAL = 'general', 'General'

    customer = models.ForeignKey(Customer, on_delete=models.CASCADE, related_name='tickets')
    subject = models.CharField(max_length=255)
    message = models.TextField()
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.OPEN)
    category = models.CharField(max_length=20, choices=Category.choices, default=Category.GENERAL)
    created = models.DateTimeField(default=timezone.now)
    updated = models.DateTimeField(auto_now=True)

    def __str__(self) -> str:
        return f'#{self.id} {self.subject}'


class AISuggestion(models.Model):
    ticket = models.ForeignKey(Ticket, on_delete=models.CASCADE, related_name='ai_suggestions')
    suggested_reply = models.TextField()
    confidence = models.DecimalField(max_digits=5, decimal_places=2, default=0)
    created = models.DateTimeField(default=timezone.now)

    def __str__(self) -> str:
        return f'Suggestion #{self.id} for ticket {self.ticket_id}'


class KnowledgeDocument(models.Model):
    name = models.CharField(max_length=255)
    content = models.TextField()
    source = models.CharField(max_length=100, default='manual')
    created = models.DateTimeField(default=timezone.now)

    def __str__(self) -> str:
        return self.name


class AppSetting(models.Model):
    company_name = models.CharField(max_length=150, default='Acme Inc.')
    support_email = models.EmailField(default='support@acme.com')
    model_temperature = models.DecimalField(max_digits=3, decimal_places=2, default=0.30)
    auto_suggest_enabled = models.BooleanField(default=True)
    updated = models.DateTimeField(auto_now=True)

    def __str__(self) -> str:
        return 'App settings'
