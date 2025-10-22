from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register(r'levels', views.LevelViewSet)
router.register(r'grades', views.GradeViewSet)
router.register(r'classrooms', views.ClassRoomViewSet)

urlpatterns = [
    path('', include(router.urls)),
    # Explicit route for unassigning teacher to avoid router caching issues
    path('classrooms/<int:pk>/unassign_teacher/', views.unassign_classroom_teacher, name='classroom-unassign-teacher'),
]