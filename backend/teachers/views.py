from rest_framework import viewsets, decorators
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.filters import SearchFilter, OrderingFilter
from django_filters.rest_framework import DjangoFilterBackend
from users.permissions import IsSuperAdminOrPrincipal
from .models import Teacher
from .serializers import TeacherSerializer
from .filters import TeacherFilter

class TeacherViewSet(viewsets.ModelViewSet):
    queryset = Teacher.objects.all()
    serializer_class = TeacherSerializer
    permission_classes = [IsAuthenticated]  # Allow all authenticated users to view teachers
    
    # Filtering, search, and ordering
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_class = TeacherFilter
    search_fields = ['full_name', 'employee_code', 'email', 'contact_number', 'current_subjects']
    ordering_fields = ['full_name', 'joining_date', 'total_experience_years', 'employee_code']
    ordering = ['-joining_date']  # Default ordering
    
    def get_queryset(self):
        """Override to handle role-based filtering and optimize queries"""
        queryset = Teacher.objects.select_related(
            'current_campus', 'assigned_classroom'
        ).prefetch_related('assigned_coordinators').all()
        
        # Role-based filtering
        user = self.request.user
        if hasattr(user, 'campus') and user.campus and user.is_principal():
            # Principal: Only show teachers from their campus
            queryset = queryset.filter(current_campus=user.campus)
        elif user.is_coordinator():
            # Coordinator: Only show teachers assigned to them (using ManyToMany)
            # Find coordinator object by email
            from coordinator.models import Coordinator
            try:
                coordinator_obj = Coordinator.objects.get(email=user.email)
                queryset = queryset.filter(assigned_coordinators=coordinator_obj)
            except Coordinator.DoesNotExist:
                # If coordinator object doesn't exist, return empty queryset
                queryset = queryset.none()
        
        return queryset
    
    @decorators.action(detail=False, methods=['get'])
    def by_coordinator(self, request):
        """Get teachers assigned to a specific coordinator"""
        coordinator_id = request.query_params.get('coordinator_id')
        if not coordinator_id:
            return Response({'error': 'coordinator_id parameter is required'}, status=400)
        
        teachers = Teacher.objects.filter(
            assigned_coordinators=coordinator_id,
            is_currently_active=True
        ).select_related('current_campus').prefetch_related('assigned_coordinators')
        
        serializer = self.get_serializer(teachers, many=True)
        return Response(serializer.data)
