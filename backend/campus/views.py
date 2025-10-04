from rest_framework import viewsets, decorators, response, permissions
from .models import Campus
from .serializers import CampusSerializer

class CampusViewSet(viewsets.ModelViewSet):
    queryset = Campus.objects.all()
    serializer_class = CampusSerializer
    permission_classes = [permissions.AllowAny]  # Allow access without authentication

    # ✅ Custom endpoint: campus summary
    @decorators.action(detail=True, methods=["get"])
    def summary(self, request, pk=None):
        campus = self.get_object()
        data = {
            "campus_name": campus.campus_name,
            "campus_code": campus.campus_code,
            "campus_type": campus.campus_type,
            "city": campus.city,
            "student_capacity": campus.student_capacity,
            "status": campus.status,
        }
        return response.Response(data)

    # ✅ Custom endpoint: facilities list
    @decorators.action(detail=True, methods=["get"])
    def facilities(self, request, pk=None):
        campus = self.get_object()
        data = {
            "internet_wifi": campus.internet_wifi,
            "power_backup": campus.power_backup,
            "science_labs": campus.science_labs,
            "computer_labs": campus.computer_labs,
            "library": campus.library,
            "toilets": {
                "male": campus.toilets_male,
                "female": campus.toilets_female,
                "accessible": campus.toilets_accessible,
            }
        }
        return response.Response(data)

    # ✅ Custom endpoint: only active campuses
    @decorators.action(detail=False, methods=["get"])
    def active(self, request):
        campuses = Campus.objects.filter(status="active")
        serializer = self.get_serializer(campuses, many=True)
        return response.Response(serializer.data)