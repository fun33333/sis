from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated
from users.permissions import IsSuperAdminOrPrincipal
from .models import Teacher
from .serializers import TeacherSerializer

class TeacherViewSet(viewsets.ModelViewSet):
    queryset = Teacher.objects.all()
    serializer_class = TeacherSerializer
    permission_classes = [IsAuthenticated, IsSuperAdminOrPrincipal]
