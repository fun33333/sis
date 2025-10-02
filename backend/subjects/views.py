from rest_framework import viewsets
from .models import Subject
from .serializers import SubjectSerializer


class SubjectViewSet(viewsets.ModelViewSet):
    queryset = Subject.objects.all().select_related("grade", "teacher")
    serializer_class = SubjectSerializer
