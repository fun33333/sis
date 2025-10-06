from django.contrib import admin
from .models import Student

@admin.register(Student)
class StudentAdmin(admin.ModelAdmin):
    list_display = (
        'name', 'classroom', 'class_teacher_display', 
        'level_display', 'campus_display', 'current_grade'
    )
    list_filter = (
        'classroom__grade__name',
        'classroom__grade__level__name',  # FIXED: Use actual field path
        'classroom__grade__level__campus__campus_name'  # FIXED: Use actual field path
    )
    search_fields = ('name', 'classroom__grade__name')
    
    def class_teacher_display(self, obj):
        return obj.class_teacher.full_name if obj.class_teacher else '-'
    class_teacher_display.short_description = 'Class Teacher'
    
    def level_display(self, obj):
        return obj.level.name if obj.level else '-'
    level_display.short_description = 'Level'
    
    def campus_display(self, obj):
        return obj.campus.campus_name if obj.campus else '-'
    campus_display.short_description = 'Campus'