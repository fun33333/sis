from django.contrib import admin
from .models import Attendance, StudentAttendance


@admin.register(Attendance)
class AttendanceAdmin(admin.ModelAdmin):
    list_display = [
        'classroom', 'date', 'marked_by', 'total_students', 
        'present_count', 'absent_count', 'late_count', 'created_at'
    ]
    list_filter = ['date', 'classroom__grade__level__campus', 'classroom__grade', 'marked_by']
    search_fields = ['classroom__code', 'marked_by__full_name']
    readonly_fields = ['total_students', 'present_count', 'absent_count', 'late_count', 'created_at', 'updated_at']
    date_hierarchy = 'date'
    ordering = ['-date', 'classroom']
    
    fieldsets = (
        ('Basic Information', {
            'fields': ('classroom', 'date', 'marked_by')
        }),
        ('Attendance Summary', {
            'fields': ('total_students', 'present_count', 'absent_count', 'late_count'),
            'classes': ('collapse',)
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        })
    )


@admin.register(StudentAttendance)
class StudentAttendanceAdmin(admin.ModelAdmin):
    list_display = [
        'student', 'attendance', 'status', 'remarks', 'created_at'
    ]
    list_filter = ['status', 'attendance__date', 'attendance__classroom']
    search_fields = ['student__name', 'student__student_code', 'remarks']
    readonly_fields = ['created_at', 'updated_at']
    ordering = ['attendance__date', 'student__name']
    
    fieldsets = (
        ('Student Information', {
            'fields': ('student', 'attendance')
        }),
        ('Attendance Details', {
            'fields': ('status', 'remarks')
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        })
    )
    
    def get_queryset(self, request):
        return super().get_queryset(request).select_related('student', 'attendance', 'attendance__classroom')
