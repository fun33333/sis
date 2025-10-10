# views.py
from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated
from rest_framework.filters import SearchFilter, OrderingFilter
from django_filters.rest_framework import DjangoFilterBackend
from users.permissions import IsSuperAdminOrPrincipal, IsTeacherOrAbove
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import Student
from .serializers import StudentSerializer
from .filters import StudentFilter

class StudentViewSet(viewsets.ModelViewSet):
    queryset = Student.objects.all()
    serializer_class = StudentSerializer
    permission_classes = [IsAuthenticated, IsTeacherOrAbove]
    
    # Filtering, search, and ordering
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_class = StudentFilter
    search_fields = ['name', 'student_code', 'gr_no', 'father_name', 'student_id']
    ordering_fields = ['name', 'created_at', 'enrollment_year', 'student_code']
    ordering = ['-created_at']  # Default ordering
    
    def get_queryset(self):
        """Override to handle role-based filtering"""
        queryset = Student.objects.select_related('campus', 'classroom').all()
        
        # Role-based filtering
        user = self.request.user
        if hasattr(user, 'campus') and user.campus and user.is_principal():
            # Principal: Only show students from their campus
            queryset = queryset.filter(campus=user.campus)
        elif user.is_teacher():
            # Teacher: Only show students from their assigned classroom
            # Find teacher by email
            from teachers.models import Teacher
            try:
                teacher_obj = Teacher.objects.get(email=user.email)
                if teacher_obj.assigned_classroom:
                    queryset = queryset.filter(classroom=teacher_obj.assigned_classroom)
                else:
                    # If no classroom assigned, show no students
                    queryset = queryset.none()
            except Teacher.DoesNotExist:
                # If teacher object doesn't exist, show no students
                queryset = queryset.none()
        elif user.is_coordinator():
            # Coordinator: Show students from classrooms under their assigned level
            from coordinator.models import Coordinator
            try:
                coordinator_obj = Coordinator.objects.get(email=user.email)
                
                # Get all classrooms under this coordinator's level
                from classes.models import ClassRoom
                coordinator_classrooms = ClassRoom.objects.filter(
                    grade__level=coordinator_obj.level,
                    grade__level__campus=coordinator_obj.campus
                ).values_list('id', flat=True)
                
                # Filter students from these classrooms
                queryset = queryset.filter(classroom__in=coordinator_classrooms)
            except Coordinator.DoesNotExist:
                # If coordinator object doesn't exist, return empty queryset
                queryset = queryset.none()
        
        return queryset

    @action(detail=False, methods=["get"])
    def total(self, request):
        # Get user's campus for filtering
        user_campus = request.user.campus
        
        if request.user.is_principal() and user_campus:
            # Principal: Only count students from their campus
            count = Student.objects.filter(campus=user_campus).count()
        else:
            # Super admin: Count all students
            count = Student.objects.count()
            
        return Response({"totalStudents": count})

    @action(detail=False, methods=["get"])
    def gender_stats(self, request):
        # Get user's campus for filtering
        user_campus = request.user.campus
        
        if request.user.is_principal() and user_campus:
            # Principal: Only count students from their campus
            male = Student.objects.filter(campus=user_campus, gender="male").count()
            female = Student.objects.filter(campus=user_campus, gender="female").count()
            other = Student.objects.filter(campus=user_campus, gender="other").count()
        else:
            # Super admin: Count all students
            male = Student.objects.filter(gender="male").count()
            female = Student.objects.filter(gender="female").count()
            other = Student.objects.filter(gender="other").count()
            
        return Response({
            "male": male,
            "female": female,
            "other": other
        })

    @action(detail=False, methods=["get"])
    def campus_stats(self, request):
        from campus.models import Campus
        
        # Get user's campus for filtering
        user_campus = request.user.campus
        
        if request.user.is_principal() and user_campus:
            # Principal: Only show their campus stats
            campuses = Campus.objects.filter(id=user_campus.id)
        else:
            # Super admin: Show all campuses
            campuses = Campus.objects.all()
            
        data = [
            {"campus": c.campus_name, "count": Student.objects.filter(campus=c).count()}
            for c in campuses
        ]
        return Response(data)
    
    @action(detail=False, methods=["get"])
    def grade_distribution(self, request):
        """Get grade-wise student distribution"""
        from django.db.models import Count
        from classes.models import Grade
        
        user_campus = request.user.campus
        
        # Base queryset
        if request.user.is_principal() and user_campus:
            students_qs = Student.objects.filter(campus=user_campus)
        else:
            students_qs = Student.objects.all()
        
        # Group by classroom grade and count
        grade_data = students_qs.values('classroom__grade__name').annotate(
            count=Count('id')
        ).order_by('classroom__grade__name')
        
        # Format response for Recharts (name, value format)
        data = [
            {"name": item['classroom__grade__name'] or 'No Grade', "value": item['count']}
            for item in grade_data if item['classroom__grade__name']  # Skip null grades
        ]
        
        return Response(data)
    
    @action(detail=False, methods=["get"])
    def enrollment_trend(self, request):
        """Get enrollment trend by year"""
        from django.db.models import Count
        
        user_campus = request.user.campus
        
        # Base queryset
        if request.user.is_principal() and user_campus:
            students_qs = Student.objects.filter(campus=user_campus)
        else:
            students_qs = Student.objects.all()
        
        # Group by enrollment year
        trend_data = students_qs.values('enrollment_year').annotate(
            count=Count('id')
        ).order_by('enrollment_year')
        
        # Format response for Recharts (year as string for X-axis)
        data = [
            {"year": str(item['enrollment_year'] or 2025), "students": item['count']}
            for item in trend_data
        ]
        
        return Response(data)
    
    @action(detail=False, methods=["get"])
    def mother_tongue_distribution(self, request):
        """Get mother tongue distribution"""
        from django.db.models import Count
        
        user_campus = request.user.campus
        
        # Base queryset
        if request.user.is_principal() and user_campus:
            students_qs = Student.objects.filter(campus=user_campus)
        else:
            students_qs = Student.objects.all()
        
        # Group by mother tongue
        mt_data = students_qs.values('mother_tongue').annotate(
            count=Count('id')
        ).order_by('-count')
        
        # Format response - properly capitalize and handle empty values
        data = []
        for item in mt_data:
            tongue = item['mother_tongue']
            if not tongue or tongue.strip() == '':
                tongue = 'Other'
            else:
                # Capitalize first letter of each word
                tongue = tongue.strip().title()
            
            data.append({"name": tongue, "value": item['count']})
        
        return Response(data)
    
    @action(detail=False, methods=["get"])
    def religion_distribution(self, request):
        """Get religion distribution"""
        from django.db.models import Count
        
        user_campus = request.user.campus
        
        # Base queryset
        if request.user.is_principal() and user_campus:
            students_qs = Student.objects.filter(campus=user_campus)
        else:
            students_qs = Student.objects.all()
        
        # Group by religion
        religion_data = students_qs.values('religion').annotate(
            count=Count('id')
        ).order_by('-count')
        
        # Format response - properly capitalize and handle empty values
        data = []
        for item in religion_data:
            religion = item['religion']
            if not religion or religion.strip() == '':
                religion = 'Other'
            else:
                # Capitalize first letter of each word
                religion = religion.strip().title()
            
            data.append({"name": religion, "value": item['count']})
        
        return Response(data)
