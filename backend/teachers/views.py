from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated
from users.permissions import IsSuperAdminOrPrincipal
from .models import Teacher
from .serializers import TeacherSerializer

class TeacherViewSet(viewsets.ModelViewSet):
    queryset = Teacher.objects.all()
    serializer_class = TeacherSerializer
<<<<<<< HEAD
    permission_classes = [IsAuthenticated, IsSuperAdminOrPrincipal]

=======
>>>>>>> d46a4beaff38b5e84e93c87d36b5eede3b2be832
