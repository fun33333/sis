from rest_framework import viewsets, generics, status, serializers
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.filters import SearchFilter, OrderingFilter
from django_filters.rest_framework import DjangoFilterBackend
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

class CoordinatorResultListView(generics.ListAPIView):
    """Get all results assigned to coordinator for review"""
    serializer_class = ResultSerializer
    permission_classes = [IsAuthenticated, IsCoordinator]
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    search_fields = ['student__name', 'student__student_code', 'teacher__full_name']
    ordering_fields = ['created_at', 'status', 'student__name']
    ordering = ['-created_at']
    pagination_class = None  # Disable pagination to return direct array

    def get_queryset(self):
        print(f"🔍 Request user: {self.request.user}")
        print(f"🔍 User email: {self.request.user.email}")
        print(f"🔍 User is coordinator: {self.request.user.is_coordinator()}")
        print(f"🔍 User is authenticated: {self.request.user.is_authenticated}")
        
        try:
            coordinator = get_object_or_404(Coordinator, email=self.request.user.email)
            print(f"🔍 Coordinator found: {coordinator.email}")
            print(f"🔍 Coordinator name: {coordinator.full_name}")
        except Exception as e:
            print(f"❌ Error finding coordinator: {e}")
            print(f"❌ Available coordinators:")
            for c in Coordinator.objects.all():
                print(f"    - {c.email} ({c.full_name})")
            return Result.objects.none()
        
        # Check total results in database
        total_results = Result.objects.count()
        print(f"🔍 Total results in database: {total_results}")
        
        # Check results with coordinators
        results_with_coordinators = Result.objects.filter(coordinator__isnull=False).count()
        print(f"🔍 Results with coordinators: {results_with_coordinators}")
        
        # First check all results assigned to this coordinator
        all_results = Result.objects.filter(coordinator=coordinator).select_related('student', 'teacher', 'coordinator').prefetch_related('subject_marks')
        print(f"🔍 All results for coordinator: {all_results.count()}")
        
        # Check results by status
        for status in ['draft', 'submitted', 'pending', 'under_review', 'approved', 'rejected']:
            count = all_results.filter(status=status).count()
            print(f"🔍 Results with status '{status}': {count}")
        
        # Return ALL results for this coordinator (no status filter)
        print(f"🔍 Returning all results for coordinator: {all_results.count()}")
        
        return all_results

    @action(detail=False, methods=['get'])
    def pending(self, request):
        """Get only pending results for review"""
        coordinator = get_object_or_404(Coordinator, email=request.user.email)
        pending_results = Result.objects.filter(
            coordinator=coordinator,
            status__in=['pending', 'submitted', 'under_review']
        ).select_related('student', 'teacher', 'coordinator').prefetch_related('subject_marks')
        
        serializer = self.get_serializer(pending_results, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def by_grade(self, request):
        """Get results grouped by grade/section"""
        coordinator = get_object_or_404(Coordinator, email=request.user.email)
        grade = request.query_params.get('grade')
        section = request.query_params.get('section')
        
        queryset = Result.objects.filter(coordinator=coordinator)
        
        if grade:
            queryset = queryset.filter(student__classroom__grade__name=grade)
        if section:
            queryset = queryset.filter(student__classroom__section=section)
            
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['post'])
    def bulk_approve(self, request):
        """Bulk approve multiple results"""
        coordinator = get_object_or_404(Coordinator, email=request.user.email)
        result_ids = request.data.get('result_ids', [])
        comments = request.data.get('comments', '')
        
        if not result_ids:
            return Response({'error': 'No result IDs provided'}, status=status.HTTP_400_BAD_REQUEST)
        
        # Update results
        updated_count = Result.objects.filter(
            id__in=result_ids,
            coordinator=coordinator,
            status__in=['pending', 'submitted', 'under_review']
        ).update(
            status='approved',
            coordinator_comments=comments
        )
        
        return Response({
            'message': f'Successfully approved {updated_count} results',
            'updated_count': updated_count
        })

    @action(detail=False, methods=['post'])
    def bulk_reject(self, request):
        """Bulk reject multiple results"""
        coordinator = get_object_or_404(Coordinator, email=request.user.email)
        result_ids = request.data.get('result_ids', [])
        comments = request.data.get('comments', '')
        
        if not result_ids:
            return Response({'error': 'No result IDs provided'}, status=status.HTTP_400_BAD_REQUEST)
        
        # Update results
        updated_count = Result.objects.filter(
            id__in=result_ids,
            coordinator=coordinator,
            status__in=['pending', 'submitted', 'under_review']
        ).update(
            status='rejected',
            coordinator_comments=comments
        )
        
        return Response({
            'message': f'Successfully rejected {updated_count} results',
            'updated_count': updated_count
        })

