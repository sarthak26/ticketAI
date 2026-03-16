from django.contrib import admin
from .models import AISuggestion, AppSetting, Customer, KnowledgeDocument, Ticket


admin.site.register(Customer)
admin.site.register(Ticket)
admin.site.register(AISuggestion)
admin.site.register(KnowledgeDocument)
admin.site.register(AppSetting)
