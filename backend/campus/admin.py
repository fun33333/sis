from django.contrib import admin
from campus.models import Campus  # Correct app name and model import

@admin.register(Campus)
class CampusAdmin(admin.ModelAdmin):
    list_display = ("name", "code", "status", "capacity", "is_draft")
    list_filter = ("status", "is_draft")
    search_fields = ("name", "code", "registration_no")
