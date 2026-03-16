from django.contrib import admin
from .models import GmailIntegration, GmailTicketThread


admin.site.register(GmailIntegration)
admin.site.register(GmailTicketThread)
