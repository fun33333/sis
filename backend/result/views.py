from rest_framework import viewsets, generics, status, serializers
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from django.db.models import Q
from .models import Result, SubjectMark
from .serializers import (
    ResultSerializer, ResultCreateSerializer, ResultUpdateSerializer,
    ResultSubmitSerializer, ResultApprovalSerializer
)
from users.permissions import IsTeacher, IsCoordinator
from teachers.models import Teacher
from coordinator.models import Coordinator
from students.models import Student

class ResultViewSet(viewsets.ModelViewSet):
    queryset = Result.objects.all()
    serializer_class = ResultSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.is_superuser:
            return Result.objects.all()
        elif user.is_teacher():
            teacher = get_object_or_404(Teacher, email=user.email)
            return Result.objects.filter(teacher=teacher)
        elif user.is_coordinator():
            coordinator = get_object_or_404(Coordinator, email=user.email)
            return Result.objects.filter(coordinator=coordinator)
        return Result.objects.none()

    def get_serializer_class(self):
        if self.action == 'create':
            return ResultCreateSerializer
        elif self.action == 'update' or self.action == 'partial_update':
            return ResultUpdateSerializer
        return ResultSerializer

    def perform_create(self, serializer):
        # Check if final term can be created (mid-term must exist and be approved)
        exam_type = serializer.validated_data.get('exam_type')
        student = serializer.validated_data.get('student')
        
        if exam_type == 'final_term':
            mid_term_exists = Result.objects.filter(
                student=student,
                exam_type='mid_term',
                status='approved'
            ).exists()
            
            if not mid_term_exists:
                raise serializers.ValidationError("Mid-term result must be approved before creating final-term result")
        
        serializer.save()

class TeacherResultListView(generics.ListCreateAPIView):
    serializer_class = ResultSerializer
    permission_classes = [IsAuthenticated, IsTeacher]

    def get_queryset(self):
        teacher = get_object_or_404(Teacher, email=self.request.user.email)
        return Result.objects.filter(teacher=teacher).order_by('-created_at')

    def get_serializer_class(self):
        if self.request.method == 'POST':
            return ResultCreateSerializer
        return ResultSerializer

    def perform_create(self, serializer):
        teacher = get_object_or_404(Teacher, email=self.request.user.email)
        
        # Check if final term can be created
        exam_type = serializer.validated_data.get('exam_type')
        student = serializer.validated_data.get('student')
        
        if exam_type == 'final_term':
            mid_term_exists = Result.objects.filter(
                student=student,
                exam_type='mid_term',
                status='approved'
            ).exists()
            
            if not mid_term_exists:
                raise serializers.ValidationError("Mid-term result must be approved before creating final-term result")
        
        # Get teacher's assigned coordinator
        if not teacher.assigned_coordinators.exists():
            raise serializers.ValidationError("No coordinator assigned to this teacher")
        
        coordinator = teacher.assigned_coordinators.first()
        serializer.save(teacher=teacher, coordinator=coordinator)

class CoordinatorResultListView(generics.ListAPIView):
    serializer_class = ResultSerializer
    permission_classes = [IsAuthenticated, IsCoordinator]

    def get_queryset(self):
        coordinator = get_object_or_404(Coordinator, email=self.request.user.email)
        status_filter = self.request.query_params.get('status', 'submitted')
        return Result.objects.filter(
            coordinator=coordinator,
            status=status_filter
        ).order_by('-created_at')

class CheckMidTermView(generics.RetrieveAPIView):
    permission_classes = [IsAuthenticated, IsTeacher]

    def get(self, request, student_id):
        try:
            student = Student.objects.get(id=student_id)
            mid_term_exists = Result.objects.filter(
                student=student,
                exam_type='mid_term',
                status='approved'
            ).exists()
            
            return Response({
                'student_id': student_id,
                'student_name': student.name,
                'mid_term_exists': mid_term_exists,
                'mid_term_approved': mid_term_exists
            })
        except Student.DoesNotExist:
            return Response(
                {'error': 'Student not found'}, 
                status=status.HTTP_404_NOT_FOUND
            )

class ResultSubmitView(generics.UpdateAPIView):
    queryset = Result.objects.all()
    serializer_class = ResultSubmitSerializer
    permission_classes = [IsAuthenticated, IsTeacher]

    def get_object(self):
        teacher = get_object_or_404(Teacher, email=self.request.user.email)
        return get_object_or_404(
            Result, 
            id=self.kwargs['pk'], 
            teacher=teacher
        )

class ResultApprovalView(generics.UpdateAPIView):
    queryset = Result.objects.all()
    serializer_class = ResultApprovalSerializer
    permission_classes = [IsAuthenticated, IsCoordinator]

    def get_object(self):
        coordinator = get_object_or_404(Coordinator, email=self.request.user.email)
        return get_object_or_404(
            Result, 
            id=self.kwargs['pk'], 
            coordinator=coordinator
        )

