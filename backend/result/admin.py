from django.contrib import admin
from .models import Result, SubjectMark

@admin.register(Result)
class ResultAdmin(admin.ModelAdmin):
    list_display = ('id', 'student', 'teacher', 'exam_type', 'status', 'grade', 'result_status', 'created_at')
    list_filter = ('exam_type', 'status', 'result_status', 'grade', 'created_at', 'teacher', 'coordinator')
    search_fields = ('student__name', 'student__student_code', 'teacher__full_name')
    raw_id_fields = ('student', 'teacher', 'coordinator')
    date_hierarchy = 'created_at'
    readonly_fields = ('total_marks', 'obtained_marks', 'percentage', 'grade', 'result_status', 'created_at', 'updated_at')

@admin.register(SubjectMark)
class SubjectMarkAdmin(admin.ModelAdmin):
    list_display = ('id', 'result', 'subject_name', 'obtained_marks', 'total_marks', 'is_pass')
    list_filter = ('subject_name', 'is_pass', 'has_practical')
    search_fields = ('result__student__name', 'result__student__student_code')
    raw_id_fields = ('result',)

