# admin.py

from django.contrib import admin
from django.utils import timezone
from .models import Student


@admin.register(Student)
class StudentAdmin(admin.ModelAdmin):
    list_display = (
        "name", 
        "get_campus_name", 
        "classroom", 
        "current_state", 
        "is_deleted",
        "terminated_on", 
        "created_at"
    )
    list_filter = ("current_state", "campus", "classroom", "is_deleted")
    search_fields = ("name", "student_code", "gr_no")
    readonly_fields = ("student_code", "student_id", "created_at", "updated_at", "deleted_at")

    actions = ["mark_as_terminated", "soft_delete_students", "hard_delete_students", "restore_students"]

    # --- Custom Display Methods ---
    def get_campus_name(self, obj):
        if obj.campus:
            return f"{obj.campus.campus_name} ({obj.campus.campus_code})"
        elif obj.classroom and obj.classroom.campus:
            return f"{obj.classroom.campus.campus_name} ({obj.classroom.campus.campus_code})"
        return "No Campus"
    
    get_campus_name.short_description = "Campus"
    get_campus_name.admin_order_field = "campus__campus_name"

    # --- Custom Actions ---
    def mark_as_terminated(self, request, queryset):
        count = queryset.update(current_state="terminated", terminated_on=timezone.now())
        self.message_user(request, f"{count} student(s) marked as Terminated.")
    
    mark_as_terminated.short_description = "🛑 Terminate Selected Students"
    
    def soft_delete_students(self, request, queryset):
        count = 0
        already_deleted = 0
        for student in queryset:
            if not student.is_deleted:
                student.soft_delete()
                count += 1
            else:
                already_deleted += 1
        
        message = f"✅ {count} student(s) soft deleted successfully."
        if already_deleted > 0:
            message += f" ({already_deleted} were already deleted)"
        self.message_user(request, message, level='SUCCESS')
    
    soft_delete_students.short_description = "🗑️ Soft Delete Selected Students"
    
    def hard_delete_students(self, request, queryset):
        count = 0
        errors = []
        for student in queryset:
            try:
                # Create exit record before deletion
                from student_status.models import ExitRecord
                ExitRecord.objects.create(
                    student=student,
                    exit_type='termination',
                    reason='other',
                    other_reason='Deleted via admin panel',
                    date_of_effect=timezone.now().date(),
                    notes='Deleted via admin panel'
                )
                student.hard_delete()
                count += 1
            except Exception as e:
                errors.append(f"{student.name}: {str(e)}")
        
        message = f"💀 {count} student(s) permanently deleted."
        if errors:
            message += f" Errors: {', '.join(errors[:3])}"
            if len(errors) > 3:
                message += f" and {len(errors)-3} more..."
        self.message_user(request, message, level='SUCCESS' if not errors else 'WARNING')
    
    hard_delete_students.short_description = "💀 Hard Delete Selected Students (Permanent)"
    
    def restore_students(self, request, queryset):
        count = 0
        not_deleted = 0
        for student in queryset:
            if student.is_deleted:
                student.restore()
                count += 1
            else:
                not_deleted += 1
        
        message = f"♻️ {count} student(s) restored successfully."
        if not_deleted > 0:
            message += f" ({not_deleted} were not deleted)"
        self.message_user(request, message, level='SUCCESS')
    
    restore_students.short_description = "♻️ Restore Selected Students"

    # --- Permissions ---
    def has_delete_permission(self, request, obj=None):
        # Allow deletion for superusers
        return request.user.is_superuser



