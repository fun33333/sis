from django.contrib import admin
from .models import Subject

@admin.register(Subject)
class SubjectAdmin(admin.ModelAdmin):
    list_display = ("name", "grade", "teacher", "code", "created_at")
    list_filter = ("grade", "teacher")
    search_fields = ("name", "code")
