from django.urls import path
from . import views

app_name = 'attendance'

urlpatterns = [
    # Attendance marking
    path('mark/', views.mark_attendance, name='mark_attendance'),
    path('mark-bulk/', views.mark_bulk_attendance, name='mark_bulk_attendance'),
    
    # Class attendance
    path('class/<int:classroom_id>/', views.get_class_attendance, name='class_attendance'),
    path('class/<int:classroom_id>/students/', views.get_class_students, name='class_students'),
    path('class/<int:classroom_id>/summary/', views.get_attendance_summary, name='attendance_summary'),
    path('class/<int:classroom_id>/attendance/<str:date>/', views.get_attendance_for_date, name='attendance_for_date'),
    
    # Student attendance
    path('student/<int:student_id>/', views.get_student_attendance, name='student_attendance'),
    
    # Teacher classes
    path('teacher/classes/', views.get_teacher_classes, name='teacher_classes'),
    
    # Edit attendance
    path('edit/<int:attendance_id>/', views.edit_attendance, name='edit_attendance'),
    
    # Coordinator endpoints
    path('coordinator/classes/', views.get_coordinator_classes, name='coordinator_classes'),
    path('level/<int:level_id>/summary/', views.get_level_attendance_summary, name='level_attendance_summary'),
]
