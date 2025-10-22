from django.contrib import admin
from .models import Campus

@admin.register(Campus)
class CampusAdmin(admin.ModelAdmin):
    list_display = ("campus_name", "campus_code", "campus_id", "city", "student_capacity", "status", "is_draft")
    search_fields = ("campus_name", "campus_code", "campus_id", "city")
    list_filter = ("status", "campus_type", "city")
    readonly_fields = ("campus_id", "created_at", "updated_at")
    
    fieldsets = (
        ('Basic Information', {
            'fields': ('campus_name', 'campus_code', 'campus_id', 'campus_type', 'status')
        }),
        ('Location', {
            'fields': ('city', 'district', 'address_full', 'postal_code')
        }),
        ('Contact Information', {
            'fields': ('primary_phone', 'secondary_phone', 'official_email')
        }),
        ('Administration', {
            'fields': ('campus_head_name', 'campus_head_phone', 'campus_head_email')
        }),
        ('Academic Information', {
            'fields': ('academic_year_start', 'academic_year_end', 'established_year', 'instruction_language', 'grades_available', 'shift_available')
        }),
        ('System Information', {
            'fields': ('is_draft', 'created_at', 'updated_at'),
            'classes': ('collapse',)
        })
    )