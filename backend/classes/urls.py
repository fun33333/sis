from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import GradeViewSet, ClassRoomViewSet

router = DefaultRouter()
router.register(r'grades', GradeViewSet)
router.register(r'classrooms', ClassRoomViewSet)

urlpatterns = [
    path('', include(router.urls)),
]
