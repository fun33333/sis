# views.py
from rest_framework import viewsets
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import Student
from .serializers import StudentSerializer

class StudentViewSet(viewsets.ModelViewSet):
    queryset = Student.objects.all()
    serializer_class = StudentSerializer

    @action(detail=False, methods=["get"])
    def total(self, request):
        count = Student.objects.count()
        return Response({"totalStudents": count})

    @action(detail=False, methods=["get"])
    def gender_stats(self, request):
        male = Student.objects.filter(gender="Male").count()
        female = Student.objects.filter(gender="Female").count()
        other = Student.objects.filter(gender="Other").count()
        return Response({
            "male": male,
            "female": female,
            "other": other
        })

    @action(detail=False, methods=["get"])
    def campus_stats(self, request):
        from campus.models import Campus
        campuses = Campus.objects.all()
        data = [
            {"campus": c.name, "count": Student.objects.filter(campus=c).count()}
            for c in campuses
        ]
        return Response(data)
