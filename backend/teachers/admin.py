from django.contrib import admin
from django.core.exceptions import ValidationError
from .models import Teacher

@admin.register(Teacher)
class TeacherAdmin(admin.ModelAdmin):
    list_display = (
        "full_name",
        "email",
        "contact_number",
        "is_class_teacher",
        "assigned_classroom",
        "current_campus",
        "get_coordinator_info",
        "shift",
        "employee_code",
    )
    list_filter = ("is_class_teacher", "shift", "current_campus", "assigned_classroom", "assigned_coordinator")
    search_fields = ("full_name", "email", "contact_number", "employee_code", "assigned_coordinator__full_name")
    ordering = ("-date_created",)
    
    # FIX: Exclude non-editable fields
    readonly_fields = ("employee_code", "teacher_id", "assigned_coordinator", "date_created", "date_updated")
        
    # teachers/admin.py me ye fieldsets use karo
    fieldsets = (
        ('Personal Information', {
            'fields': (
                'full_name', 'dob', 'gender', 'contact_number', 'email', 
                'permanent_address', 'current_address', 'marital_status', 'cnic'
            )
        }),
        ('Education Information', {
            'fields': (
                'education_level', 'institution_name', 'year_of_passing', 
                'education_subjects', 'education_grade',
                'additional_education_level', 'additional_institution_name', 
                'additional_year_of_passing', 'additional_education_subjects', 
                'additional_education_grade'
            ),
            'classes': ('collapse',)
        }),
        ('Experience Information', {
            'fields': (
                'previous_institution_name', 'previous_position', 
                'experience_from_date', 'experience_to_date', 
                'experience_subjects_classes_taught', 'previous_responsibilities', 
                'total_experience_years',
                'additional_institution_name_exp', 'additional_position', 
                'additional_experience_from_date', 'additional_experience_to_date', 
                'additional_experience_subjects_classes', 'additional_responsibilities'
            ),
            'classes': ('collapse',)
        }),
        ('Current Role Information', {
            'fields': (
                'joining_date', 'current_role_title', 'current_campus', 'shift',
                'current_subjects', 'current_classes_taught', 'current_extra_responsibilities',
                'assigned_coordinator', 'role_start_date', 'role_end_date', 'is_currently_active'
            )
        }),
        ('Class Teacher Information', {
            'fields': ('is_class_teacher', 'assigned_classroom'),
            'classes': ('collapse',)
        }),
        ('System Fields', {
            'fields': ('employee_code', 'teacher_id', 'save_status', 'date_created', 'date_updated'),
            'classes': ('collapse',)
        }),
    )

    def get_coordinator_info(self, obj):
        """Display coordinator information with level"""
        if obj.assigned_coordinator:
            return f"{obj.assigned_coordinator.full_name} ({obj.assigned_coordinator.level.name})"
        return "Not Assigned"
    get_coordinator_info.short_description = "Coordinator"
    get_coordinator_info.admin_order_field = "assigned_coordinator__full_name"

    def clean(self):
        cleaned_data = super().clean()
        
        # Check if teacher is being assigned to a classroom that already has a class teacher
        if self.assigned_classroom and self.is_class_teacher:
            existing_teacher = Teacher.objects.filter(
                assigned_classroom=self.assigned_classroom,
                is_class_teacher=True
            ).exclude(pk=self.pk)
            
            if existing_teacher.exists():
                raise ValidationError(
                    f"Classroom {self.assigned_classroom} already has a class teacher: {existing_teacher.first().full_name}"
                )
        
        return cleaned_data
