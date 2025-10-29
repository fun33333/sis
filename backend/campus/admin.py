from django.contrib import admin
from .models import Campus

@admin.register(Campus)
class CampusAdmin(admin.ModelAdmin):
    list_display = ('campus_name', 'campus_code', 'city', 'status', 'shift_available')
    list_filter = ('status', 'city', 'shift_available')
    search_fields = ('campus_name', 'campus_code', 'city')
    
    fieldsets = (
        ('Basic Information', {
            'fields': ('campus_photo', 'campus_id', 'campus_name', 'campus_code', 'status', 'governing_body', 'registration_number', 'established_year')
        }),
        ('Location', {
            'fields': ('city', 'postal_code', 'district', 'address_full')
        }),
        ('Academic', {
            'fields': ('shift_available', 'grades_offered', 'instruction_language', 'academic_year_start_month', 'academic_year_end_month', 'avg_class_size')
        }),
        ('Students - Both Shifts (if applicable)', {
            'fields': ('morning_male_students', 'morning_female_students', 'morning_total_students', 'afternoon_male_students', 'afternoon_female_students', 'afternoon_total_students'),
            'classes': ('collapse',)
        }),
        ('Students - Single Shift (if applicable)', {
            'fields': ('male_students', 'female_students', 'total_students', 'student_capacity', 'morning_students', 'afternoon_students'),
            'classes': ('collapse',)
        }),
        ('Teachers - Both Shifts (if applicable)', {
            'fields': ('morning_male_teachers', 'morning_female_teachers', 'morning_total_teachers', 'afternoon_male_teachers', 'afternoon_female_teachers', 'afternoon_total_teachers'),
            'classes': ('collapse',)
        }),
        ('Teachers - Single Shift & Staff', {
            'fields': ('male_teachers', 'female_teachers', 'total_teachers', 'total_non_teaching_staff', 'total_staff_members')
        }),
        ('Infrastructure - Rooms', {
            'fields': ('total_classrooms', 'total_offices', 'num_computer_labs', 'num_science_labs', 'num_biology_labs', 'num_chemistry_labs', 'num_physics_labs', 'total_rooms', 'library_available')
        }),
        ('Infrastructure - Washrooms', {
            'fields': ('male_teachers_washrooms', 'female_teachers_washrooms', 'staff_washrooms', 'male_student_washrooms', 'female_student_washrooms', 'student_washrooms', 'total_washrooms')
        }),
        ('Facilities', {
            'fields': ('power_backup', 'internet_available', 'teacher_transport', 'canteen_facility', 'meal_program')
        }),
        ('Sports', {
            'fields': ('sports_available',)
        }),
        ('Contact', {
            'fields': ('primary_phone', 'secondary_phone', 'official_email')
        }),
        ('Campus Head', {
            'fields': ('campus_head_name', 'campus_head_phone', 'campus_head_email')
        }),
        ('System', {
            'fields': ('created_at', 'updated_at', 'is_draft'),
            'classes': ('collapse',)
        })
    )

    readonly_fields = ('campus_id', 'morning_total_students', 'afternoon_total_students', 'morning_total_teachers', 'afternoon_total_teachers', 'total_rooms', 'staff_washrooms', 'student_washrooms', 'total_washrooms', 'total_staff_members', 'created_at', 'updated_at')
    list_editable = ('status',)
