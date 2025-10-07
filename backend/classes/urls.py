<<<<<<< HEAD
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
=======
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import LevelViewSet, GradeViewSet, ClassRoomViewSet

router = DefaultRouter()
router.register(r'levels', LevelViewSet)
router.register(r'grades', GradeViewSet)
router.register(r'classrooms', ClassRoomViewSet)

urlpatterns = [
    path('', include(router.urls)),
>>>>>>> f6d7b1692105971a2e74d072cde03fa573152e5d
]
