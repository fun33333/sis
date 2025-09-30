from django.contrib import admin
from django.utils.html import format_html
from django.urls import reverse
from django.utils.safestring import mark_safe
from .models import Attendance, AttendanceSummary


@admin.register(Attendance)
class AttendanceAdmin(admin.ModelAdmin):
    list_display = [
        'student_name', 'classroom_display', 'date', 'status_display', 
        'campus_name', 'created_at'
    ]
    list_filter = [
        'status', 'date', 'campus', 'classroom__grade', 'classroom__section',
        'academic_year', 'created_at'
    ]
    search_fields = [
        'student__name', 'student__gr_no', 'student__student_code',
        'classroom__grade__name', 'classroom__section',
        'class_teacher__full_name', 'remarks'
    ]
    list_select_related = ['student', 'classroom', 'class_teacher', 'campus']
    date_hierarchy = 'date'
    ordering = ['-date', 'student__name']
    
    fieldsets = (
        ('Basic Information', {
            'fields': ('student', 'classroom', 'class_teacher', 'campus', 'date')
        }),
        ('Attendance Details', {
            'fields': ('status', 'remarks')
        }),
        ('Excuse Information', {
            'fields': ('excuse_reason', 'excuse_document'),
            'classes': ('collapse',)
        }),
        ('Academic Information', {
            'fields': ('academic_year', 'semester'),
            'classes': ('collapse',)
        }),
        ('System Information', {
            'fields': ('created_by', 'created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
    
    readonly_fields = ['created_at', 'updated_at']
    
    class Media:
        js = ('admin/js/attendance_auto_select.js',)
    
    def student_name(self, obj):
        return obj.student.name
    student_name.short_description = 'Student'
    student_name.admin_order_field = 'student__name'
    
    def classroom_display(self, obj):
        return f"{obj.classroom.grade.name} - {obj.classroom.section}"
    classroom_display.short_description = 'Class'
    classroom_display.admin_order_field = 'classroom__grade__name'
    
    def status_display(self, obj):
        colors = {
            'present': 'green',
            'absent': 'red',
            'late': 'orange',
            'excused': 'blue'
        }
        color = colors.get(obj.status, 'gray')
        return format_html(
            '<span style="color: {}; font-weight: bold;">{}</span>',
            color,
            obj.get_status_display()
        )
    status_display.short_description = 'Status'
    
    def campus_name(self, obj):
        return obj.campus.campus_name
    campus_name.short_description = 'Campus'
    campus_name.admin_order_field = 'campus__campus_name'
    
    def get_queryset(self, request):
        return super().get_queryset(request).select_related(
            'student', 'classroom__grade', 'class_teacher', 'campus'
        )
    


@admin.register(AttendanceSummary)
class AttendanceSummaryAdmin(admin.ModelAdmin):
    list_display = [
        'student_name', 'classroom_display', 'month_year', 'total_days',
        'present_days', 'absent_days', 'attendance_percentage', 'campus_name'
    ]
    list_filter = [
        'month', 'year', 'academic_year', 'campus', 'classroom__grade'
    ]
    search_fields = [
        'student__name', 'student__gr_no', 'student__student_code',
        'classroom__grade__name', 'classroom__section'
    ]
    list_select_related = ['student', 'classroom', 'campus']
    ordering = ['-year', '-month', 'student__name']
    
    fieldsets = (
        ('Basic Information', {
            'fields': ('student', 'classroom', 'campus', 'month', 'year', 'academic_year')
        }),
        ('Attendance Counts', {
            'fields': ('total_days', 'present_days', 'absent_days', 'late_days', 'excused_days')
        }),
        ('Calculated Fields', {
            'fields': ('attendance_percentage',),
            'classes': ('collapse',)
        }),
    )
    
    readonly_fields = ['attendance_percentage', 'created_at', 'updated_at']
    
    def student_name(self, obj):
        return obj.student.name
    student_name.short_description = 'Student'
    student_name.admin_order_field = 'student__name'
    
    def classroom_display(self, obj):
        return f"{obj.classroom.grade.name} - {obj.classroom.section}"
    classroom_display.short_description = 'Class'
    classroom_display.admin_order_field = 'classroom__grade__name'
    
    def month_year(self, obj):
        return f"{obj.month}/{obj.year}"
    month_year.short_description = 'Period'
    month_year.admin_order_field = 'year'
    
    def campus_name(self, obj):
        return obj.campus.campus_name
    campus_name.short_description = 'Campus'
    campus_name.admin_order_field = 'campus__campus_name'




# Custom admin actions
@admin.action(description='Mark selected attendances as present')
def mark_as_present(modeladmin, request, queryset):
    queryset.update(status='present')

@admin.action(description='Mark selected attendances as absent')
def mark_as_absent(modeladmin, request, queryset):
    queryset.update(status='absent')

@admin.action(description='Generate monthly summaries for selected attendances')
def generate_monthly_summaries(modeladmin, request, queryset):
    # This would be implemented to generate monthly summaries
    pass

# Add actions to AttendanceAdmin
AttendanceAdmin.actions = [mark_as_present, mark_as_absent, generate_monthly_summaries]