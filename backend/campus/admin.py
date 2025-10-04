from django.contrib import admin
from .models import Campus

@admin.register(Campus)
class CampusAdmin(admin.ModelAdmin):
    list_display = ("campus_name", "campus_code", "city", "student_capacity", "status", "is_draft")
    search_fields = ("campus_name", "campus_code", "city")
    list_filter = ("status", "campus_type", "city")