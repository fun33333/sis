from rest_framework import viewsets
from .models import Coordinator
from .serializers import CoordinatorSerializer


class CoordinatorViewSet(viewsets.ModelViewSet):
    queryset = Coordinator.objects.all()
    serializer_class = CoordinatorSerializer
