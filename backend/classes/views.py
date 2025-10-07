<<<<<<< HEAD
from rest_framework import generics, status
from rest_framework.decorators import api_view
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from .models import Level, Grade, ClassRoom
from .serializers import LevelSerializer, GradeSerializer, ClassRoomSerializer, LevelChoicesSerializer, GradeChoicesSerializer, ClassRoomChoicesSerializer
from campus.models import Campus
from coordinator.models import Coordinator
from teachers.models import Teacher


class LevelListCreateView(generics.ListCreateAPIView):
    queryset = Level.objects.all()
    serializer_class = LevelSerializer

    def get_queryset(self):
        queryset = Level.objects.all()
        campus_id = self.request.query_params.get('campus', None)
=======
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.db.models import Q
from .models import Level, Grade, ClassRoom
from .serializers import LevelSerializer, GradeSerializer, ClassRoomSerializer

class LevelViewSet(viewsets.ModelViewSet):
    queryset = Level.objects.all()
    serializer_class = LevelSerializer
    
    def get_queryset(self):
        queryset = Level.objects.select_related('campus', 'coordinator')
        campus_id = self.request.query_params.get('campus_id')
>>>>>>> f6d7b1692105971a2e74d072cde03fa573152e5d
        if campus_id:
            queryset = queryset.filter(campus_id=campus_id)
        return queryset

<<<<<<< HEAD

class LevelDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Level.objects.all()
    serializer_class = LevelSerializer


class GradeListCreateView(generics.ListCreateAPIView):
    queryset = Grade.objects.all()
    serializer_class = GradeSerializer

    def get_queryset(self):
        queryset = Grade.objects.all()
        level_id = self.request.query_params.get('level', None)
        if level_id:
            queryset = queryset.filter(level_id=level_id)
        return queryset


class GradeDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Grade.objects.all()
    serializer_class = GradeSerializer


class ClassRoomListCreateView(generics.ListCreateAPIView):
    queryset = ClassRoom.objects.all()
    serializer_class = ClassRoomSerializer

    def get_queryset(self):
        queryset = ClassRoom.objects.all()
        grade_id = self.request.query_params.get('grade', None)
        if grade_id:
            queryset = queryset.filter(grade_id=grade_id)
        return queryset


class ClassRoomDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = ClassRoom.objects.all()
    serializer_class = ClassRoomSerializer


@api_view(['GET'])
def level_choices(request):
    """Get choices for level creation"""
    campuses = list(Campus.objects.values('id', 'campus_name'))
    coordinators = list(Coordinator.objects.values('id', 'full_name'))
    
    return Response({
        'campuses': campuses,
        'coordinators': coordinators
    })


@api_view(['GET'])
def grade_choices(request):
    """Get choices for grade creation"""
    levels = list(Level.objects.values('id', 'name', 'campus__campus_name'))
    
    return Response({
        'levels': levels
    })


@api_view(['GET'])
def classroom_choices(request):
    """Get choices for classroom creation"""
    grades = list(Grade.objects.values('id', 'name', 'level__name', 'level__campus__campus_name'))
    teachers = list(Teacher.objects.values('id', 'full_name'))
    sections = [{'value': choice[0], 'label': f'Section {choice[0]}'} for choice in ClassRoom.SECTION_CHOICES]
    
    return Response({
        'grades': grades,
        'teachers': teachers,
        'sections': sections
    })


@api_view(['GET'])
def classroom_sections(request):
    """Get available sections for classroom creation"""
    sections = [{'value': choice[0], 'label': f'Section {choice[0]}'} for choice in ClassRoom.SECTION_CHOICES]
    return Response(sections)
=======
class GradeViewSet(viewsets.ModelViewSet):
    queryset = Grade.objects.all()
    serializer_class = GradeSerializer
    
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
    
    def get_queryset(self):
        queryset = ClassRoom.objects.select_related(
            'grade', 'grade__level', 'grade__level__campus', 'class_teacher'
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
            queryset = queryset.filter(grade__level__campus_id=campus_id)
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
>>>>>>> f6d7b1692105971a2e74d072cde03fa573152e5d
