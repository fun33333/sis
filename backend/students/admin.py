# admin.py

from django.contrib import admin
from django.utils import timezone
from .models import Student


@admin.register(Student)
class StudentAdmin(admin.ModelAdmin):
    list_display = (
        "name", 
        "campus", 
        "classroom", 
        "current_state", 
        "terminated_on", 
        "created_at"
    )
    list_filter = ("current_state", "campus", "classroom")
    search_fields = ("name", "student_code", "gr_no")
    readonly_fields = ("student_code", "student_id", "created_at", "updated_at")

    actions = ["mark_as_terminated"]

    # --- Custom Action ---
    def mark_as_terminated(self, request, queryset):
        count = queryset.update(current_state="terminated", terminated_on=timezone.now())
        self.message_user(request, f"{count} student(s) marked as Terminated.")
    
    mark_as_terminated.short_description = "🛑 Terminate Selected Students"

    # --- Permissions (Optional) ---
    def has_delete_permission(self, request, obj=None):
        # Optional: prevent deletion of student records
        return False

