from django.urls import path
from . import views

urlpatterns = [
    # Level endpoints
    path('levels/', views.LevelListCreateView.as_view(), name='level-list-create'),
    path('levels/<int:pk>/', views.LevelDetailView.as_view(), name='level-detail'),
    path('levels/choices/', views.level_choices, name='level-choices'),
    
    # Grade endpoints
    path('grades/', views.GradeListCreateView.as_view(), name='grade-list-create'),
    path('grades/<int:pk>/', views.GradeDetailView.as_view(), name='grade-detail'),
    path('grades/choices/', views.grade_choices, name='grade-choices'),
    
    # Classroom endpoints
    path('classrooms/', views.ClassRoomListCreateView.as_view(), name='classroom-list-create'),
    path('classrooms/<int:pk>/', views.ClassRoomDetailView.as_view(), name='classroom-detail'),
    path('classrooms/choices/', views.classroom_choices, name='classroom-choices'),
    path('classrooms/sections/', views.classroom_sections, name='classroom-sections'),
    path('classrooms/<int:classroom_id>/students/', views.classroom_students, name='classroom-students'),
    path('classrooms/<int:classroom_id>/available-students/', views.available_students_for_classroom, name='available-students-for-classroom'),
]
