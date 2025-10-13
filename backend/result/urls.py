from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    ResultViewSet,
    TeacherResultListView,
    CoordinatorResultListView,
    CheckMidTermView,
    ResultSubmitView,
    ResultApprovalView
)

router = DefaultRouter()
router.register(r'', ResultViewSet)

urlpatterns = [
    path('create/', TeacherResultListView.as_view(), name='teacher-result-create'),
    path('my-results/', TeacherResultListView.as_view(), name='teacher-my-results'),
    path('coordinator/pending/', CoordinatorResultListView.as_view(), name='coordinator-pending-results'),
    path('check-midterm/<int:student_id>/', CheckMidTermView.as_view(), name='check-midterm'),
    path('<int:pk>/submit/', ResultSubmitView.as_view(), name='result-submit'),
    path('<int:pk>/approve/', ResultApprovalView.as_view(), name='result-approve'),
    path('', include(router.urls)),
]

