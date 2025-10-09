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
        if campus_id:
            queryset = queryset.filter(campus_id=campus_id)
        return queryset


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


@api_view(['GET'])
def classroom_students(request, classroom_id):
    """Get students assigned to a specific classroom"""
    try:
        classroom = ClassRoom.objects.get(id=classroom_id)
        
        # Get students for this classroom
        students = classroom.students.filter(is_draft=False).select_related('campus')
        
        # If teacher is specified, filter by teacher's campus
        teacher_id = request.query_params.get('teacher_id')
        if teacher_id:
            try:
                teacher = Teacher.objects.get(id=teacher_id)
                if teacher.current_campus:
                    students = students.filter(campus=teacher.current_campus)
            except Teacher.DoesNotExist:
                pass
        
        # Serialize students
        from students.serializers import StudentSerializer
        serializer = StudentSerializer(students, many=True)
        
        return Response({
            'classroom': {
                'id': classroom.id,
                'name': str(classroom),
                'grade': classroom.grade.name,
                'section': classroom.section,
                'campus': classroom.campus.campus_name if classroom.campus else None,
                'teacher': classroom.class_teacher.full_name if classroom.class_teacher else None
            },
            'students': serializer.data,
            'total_students': students.count()
        })
        
    except ClassRoom.DoesNotExist:
        return Response({'error': 'Classroom not found'}, status=404)
    except Exception as e:
        return Response({'error': str(e)}, status=500)


@api_view(['GET'])
def available_students_for_classroom(request, classroom_id):
    """Get students available for assignment to a classroom"""
    try:
        classroom = ClassRoom.objects.get(id=classroom_id)
        
        # Get available students
        students = classroom.get_available_students_for_assignment()
        
        # Serialize students
        from students.serializers import StudentSerializer
        serializer = StudentSerializer(students, many=True)
        
        return Response({
            'classroom': {
                'id': classroom.id,
                'name': str(classroom),
                'grade': classroom.grade.name,
                'section': classroom.section,
                'campus': classroom.campus.campus_name if classroom.campus else None
            },
            'available_students': serializer.data,
            'total_available': students.count()
        })
        
    except ClassRoom.DoesNotExist:
        return Response({'error': 'Classroom not found'}, status=404)
    except Exception as e:
        return Response({'error': str(e)}, status=500)