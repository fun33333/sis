from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.filters import SearchFilter, OrderingFilter
from django_filters.rest_framework import DjangoFilterBackend
from django.db.models import Q
from .models import Level, Grade, ClassRoom
from .serializers import LevelSerializer, GradeSerializer, ClassRoomSerializer

class LevelViewSet(viewsets.ModelViewSet):
    queryset = Level.objects.all()
    serializer_class = LevelSerializer
    
    # Filtering, search, and ordering
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    search_fields = ['name', 'description']
    ordering_fields = ['name', 'created_at']
    ordering = ['name']  # Default ordering
    
    def get_queryset(self):
        queryset = Level.objects.select_related('campus', 'coordinator')
        campus_id = self.request.query_params.get('campus_id')
        if campus_id:
            queryset = queryset.filter(campus_id=campus_id)
        return queryset

class GradeViewSet(viewsets.ModelViewSet):
    queryset = Grade.objects.all()
    serializer_class = GradeSerializer
    
    # Filtering, search, and ordering
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    search_fields = ['name', 'description']
    ordering_fields = ['name', 'order', 'created_at']
    ordering = ['order', 'name']  # Default ordering
    
    def get_queryset(self):
        queryset = Grade.objects.select_related('level', 'level__campus')
        level_id = self.request.query_params.get('level_id')
        campus_id = self.request.query_params.get('campus_id')
        
        if level_id:
            queryset = queryset.filter(level_id=level_id)
        if campus_id:
            queryset = queryset.filter(level__campus_id=campus_id)
        return queryset

class ClassRoomViewSet(viewsets.ModelViewSet):
    queryset = ClassRoom.objects.all()
    serializer_class = ClassRoomSerializer
    
    # Filtering, search, and ordering
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    search_fields = ['code', 'section']
    ordering_fields = ['code', 'section', 'created_at']
    ordering = ['code', 'section']  # Default ordering
    
    def get_queryset(self):
        queryset = ClassRoom.objects.select_related(
            'grade', 'grade_level', 'gradelevel_campus', 'class_teacher'
        )
        grade_id = self.request.query_params.get('grade_id')
        level_id = self.request.query_params.get('level_id')
        campus_id = self.request.query_params.get('campus_id')
        teacher_id = self.request.query_params.get('teacher_id')
        
        if grade_id:
            queryset = queryset.filter(grade_id=grade_id)
        if level_id:
            queryset = queryset.filter(grade__level_id=level_id)
        if campus_id:
            queryset = queryset.filter(grade_level_campus_id=campus_id)
        if teacher_id:
            queryset = queryset.filter(class_teacher_id=teacher_id)
        return queryset
    
    @action(detail=False, methods=['get'])
    def available_teachers(self, request):
        """Get teachers who are not assigned to any classroom"""
        assigned_teacher_ids = ClassRoom.objects.filter(
            class_teacher__isnull=False
        ).values_list('class_teacher_id', flat=True)
        
        from teachers.models import Teacher
        available_teachers = Teacher.objects.exclude(
            id__in=assigned_teacher_ids
        ).values('id', 'full_name', 'employee_code')
        
        return Response(available_teachers)
    
    @action(detail=False, methods=['get'])
    def unassigned_classrooms(self, request):
        """Get classrooms that don't have a class teacher"""
        unassigned = ClassRoom.objects.filter(
            class_teacher__isnull=True
        )
        serializer = self.get_serializer(unassigned, many=True)
        return Response(serializer.data)