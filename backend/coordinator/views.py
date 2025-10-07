from rest_framework import viewsets, decorators, response, permissions
from .models import Coordinator
from .serializers import CoordinatorSerializer
from teachers.models import Teacher
from students.models import Student
from classes.models import ClassRoom
from django.db.models import Count, Q


class CoordinatorViewSet(viewsets.ModelViewSet):
    queryset = Coordinator.objects.all()
    serializer_class = CoordinatorSerializer
    permission_classes = [permissions.IsAuthenticated]

    @decorators.action(detail=True, methods=["get"])
    def teachers(self, request, pk=None):
        """Get all teachers assigned to this coordinator"""
        coordinator = self.get_object()
        
        # Get teachers assigned to this coordinator
        teachers = Teacher.objects.filter(
            assigned_coordinator=coordinator,
            is_currently_active=True
        ).select_related('current_campus', 'assigned_coordinator')
        
        # Serialize teacher data
        teachers_data = []
        for teacher in teachers:
            teachers_data.append({
                'id': teacher.id,
                'full_name': teacher.full_name,
                'employee_code': teacher.employee_code,
                'email': teacher.email,
                'contact_number': teacher.contact_number,
                'current_subjects': teacher.current_subjects,
                'current_classes_taught': teacher.current_classes_taught,
                'shift': teacher.shift,
                'is_class_teacher': teacher.is_class_teacher,
                'assigned_classroom': f"{teacher.assigned_classroom.grade.name} - {teacher.assigned_classroom.section}" if teacher.assigned_classroom else None,
                'joining_date': teacher.joining_date,
                'total_experience_years': teacher.total_experience_years,
                'is_currently_active': teacher.is_currently_active,
            })
        
        return response.Response({
            'coordinator': {
                'id': coordinator.id,
                'full_name': coordinator.full_name,
                'employee_code': coordinator.employee_code,
                'campus_name': coordinator.campus.campus_name,
            },
            'teachers': teachers_data,
            'total_teachers': len(teachers_data)
        })

    @decorators.action(detail=True, methods=["get"])
    def dashboard_stats(self, request, pk=None):
        """Get dashboard statistics for coordinator"""
        coordinator = self.get_object()
        
        # Get teachers count assigned to this coordinator
        teachers_count = Teacher.objects.filter(
            assigned_coordinator=coordinator,
            is_currently_active=True
        ).count()
        
        # Get students count from coordinator's campus
        students_count = Student.objects.filter(
            campus=coordinator.campus,
            current_state='active'
        ).count()
        
        # Get classes count from coordinator's campus
        classes_count = ClassRoom.objects.filter(
            campus=coordinator.campus
        ).count()
        
        # Get pending requests (if any)
        pending_requests = 0  # This would need to be implemented based on your request system
        
        return response.Response({
            'coordinator': {
                'id': coordinator.id,
                'full_name': coordinator.full_name,
                'employee_code': coordinator.employee_code,
                'campus_name': coordinator.campus.campus_name,
            },
            'stats': {
                'total_teachers': teachers_count,
                'total_students': students_count,
                'total_classes': classes_count,
                'pending_requests': pending_requests,
            }
        })
