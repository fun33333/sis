from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import AttendanceViewSet, AttendanceSummaryViewSet, StudentDetailViewSet, ClassroomDetailViewSet

router = DefaultRouter()
router.register(r'attendance', AttendanceViewSet, basename='attendance')
router.register(r'attendance-summary', AttendanceSummaryViewSet, basename='attendance-summary')
router.register(r'students', StudentDetailViewSet, basename='student-detail')
router.register(r'classrooms', ClassroomDetailViewSet, basename='classroom-detail')

urlpatterns = [
    path('', include(router.urls)),
]