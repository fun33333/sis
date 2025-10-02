from rest_framework import viewsets, decorators, response, status
from rest_framework.permissions import IsAuthenticated
from rest_framework.exceptions import PermissionDenied
from users.permissions import SuperAdminOnlyForCampusCreation
from .models import Campus
from .serializers import CampusSerializer

class CampusViewSet(viewsets.ModelViewSet):
    queryset = Campus.objects.all()
    serializer_class = CampusSerializer
    permission_classes = [IsAuthenticated, SuperAdminOnlyForCampusCreation]

    def create(self, request, *args, **kwargs):
        """
        Override create method to provide custom error message for non-superadmin users
        """
        if not request.user.is_superadmin():
            raise PermissionDenied({
                "error": "Access Denied",
                "message": "Sirf Super Admin campus add kar sakta hai. Aap ka role '{}' hai.".format(
                    request.user.get_role_display()
                ),
                "required_role": "Super Admin",
                "your_role": request.user.get_role_display()
            })
        
        return super().create(request, *args, **kwargs)

    # ✅ Custom endpoint: campus summary
    @decorators.action(detail=True, methods=["get"])
    def summary(self, request, pk=None):
        campus = self.get_object()
        data = {
            "name": campus.name,
            "code": campus.code,
            "num_students": campus.num_students,
            "num_teachers": campus.num_teachers,
            "capacity": campus.capacity,
        }
        return response.Response(data)

    # ✅ Custom endpoint: facilities list
    @decorators.action(detail=True, methods=["get"])
    def facilities(self, request, pk=None):
        campus = self.get_object()
        data = {
            "science_labs": getattr(campus, 'science_labs', 0),
            "computer_labs": campus.computer_labs,
            "library": campus.library,
            "toilets": {
                "male": campus.toilets_male,
                "female": campus.toilets_female,
            },
            "internet_wifi": campus.internet_wifi,
            "power_backup": campus.power_backup,
        }
        return response.Response(data)

    # ✅ Custom endpoint: only active campuses
    @decorators.action(detail=False, methods=["get"])
    def active(self, request):
        campuses = Campus.objects.filter(status="active")
        serializer = self.get_serializer(campuses, many=True)
        return response.Response(serializer.data)
