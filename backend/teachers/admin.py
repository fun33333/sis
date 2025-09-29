from django.contrib import admin
from .models import Teacher

@admin.register(Teacher)
class TeacherAdmin(admin.ModelAdmin):
    list_display = ("full_name", "email", "gender", "save_status", "date_created")
    search_fields = ("full_name", "email")
    list_filter = ("gender", "marital_status", "save_status")
