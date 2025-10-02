from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.db.models import Q, Count, Avg
from django.utils import timezone
from datetime import datetime, timedelta
from .models import Attendance, AttendanceSummary
from .serializers import (
    AttendanceSerializer, AttendanceSummarySerializer,
    AttendanceBulkCreateSerializer, AttendanceReportSerializer, AttendanceStatsSerializer
)


class AttendanceViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing attendance records
    """
    serializer_class = AttendanceSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        queryset = Attendance.objects.select_related(
            'student', 'classroom__grade', 'class_teacher', 'campus'
        ).all()
        
        # Filter by campus if user has campus restriction
        if hasattr(self.request.user, 'campus') and self.request.user.campus:
            queryset = queryset.filter(campus=self.request.user.campus)
        
        # Filter by classroom
        classroom_id = self.request.query_params.get('classroom_id')
        if classroom_id:
            queryset = queryset.filter(classroom_id=classroom_id)
        
        # Filter by student
        student_id = self.request.query_params.get('student_id')
        if student_id:
            queryset = queryset.filter(student_id=student_id)
        
        # Filter by date range
        start_date = self.request.query_params.get('start_date')
        end_date = self.request.query_params.get('end_date')
        if start_date:
            queryset = queryset.filter(date__gte=start_date)
        if end_date:
            queryset = queryset.filter(date__lte=end_date)
        
        # Filter by status
        status_filter = self.request.query_params.get('status')
        if status_filter:
            queryset = queryset.filter(status=status_filter)
        
        return queryset.order_by('-date', 'student__name')
    
    @action(detail=False, methods=['post'])
    def bulk_create(self, request):
        """
        Create multiple attendance records at once
        """
        serializer = AttendanceBulkCreateSerializer(data=request.data)
        if serializer.is_valid():
            classroom_id = serializer.validated_data['classroom']
            date = serializer.validated_data['date']
            attendances_data = serializer.validated_data['attendances']
            
            created_attendances = []
            errors = []
            
            for attendance_data in attendances_data:
                try:
                    # Get student and classroom
                    from students.models import Student
                    from classes.models import ClassRoom
                    
                    student = Student.objects.get(id=attendance_data['student_id'])
                    classroom = ClassRoom.objects.get(id=classroom_id)
                    
                    # Create attendance record
                    attendance = Attendance.objects.create(
                        student=student,
                        classroom=classroom,
                        date=date,
                        status=attendance_data['status'],
                        remarks=attendance_data.get('remarks', ''),
                        excuse_reason=attendance_data.get('excuse_reason', ''),
                        created_by=request.user
                    )
                    created_attendances.append(attendance)
                    
                except Exception as e:
                    errors.append({
                        'student_id': attendance_data['student_id'],
                        'error': str(e)
                    })
            
            return Response({
                'created_count': len(created_attendances),
                'errors': errors,
                'attendances': AttendanceSerializer(created_attendances, many=True).data
            }, status=status.HTTP_201_CREATED)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    @action(detail=False, methods=['get'])
    def daily_stats(self, request):
        """
        Get daily attendance statistics for a specific date and classroom
        """
        date = request.query_params.get('date')
        classroom_id = request.query_params.get('classroom_id')
        
        if not date or not classroom_id:
            return Response(
                {'error': 'date and classroom_id are required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        attendances = self.get_queryset().filter(date=date, classroom_id=classroom_id)
        
        total_students = attendances.count()
        present_students = attendances.filter(status__in=['present', 'late', 'half_day']).count()
        absent_students = attendances.filter(status='absent').count()
        late_students = attendances.filter(status='late').count()
        
        overall_percentage = (present_students / total_students * 100) if total_students > 0 else 0
        
        stats = {
            'total_students': total_students,
            'present_students': present_students,
            'absent_students': absent_students,
            'late_students': late_students,
            'overall_attendance_percentage': round(overall_percentage, 2),
            'date': date,
            'classroom': str(attendances.first().classroom) if attendances.exists() else None
        }
        
        return Response(stats)
    
    @action(detail=False, methods=['get'])
    def monthly_report(self, request):
        """
        Get monthly attendance report for a student or classroom
        """
        month = request.query_params.get('month')
        year = request.query_params.get('year')
        student_id = request.query_params.get('student_id')
        classroom_id = request.query_params.get('classroom_id')
        
        if not month or not year:
            return Response(
                {'error': 'month and year are required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        queryset = self.get_queryset().filter(
            date__year=year,
            date__month=month
        )
        
        if student_id:
            queryset = queryset.filter(student_id=student_id)
        if classroom_id:
            queryset = queryset.filter(classroom_id=classroom_id)
        
        # Group by student and calculate statistics
        students = queryset.values('student').distinct()
        reports = []
        
        for student_data in students:
            student_attendances = queryset.filter(student_id=student_data['student'])
            student = student_attendances.first().student
            
            total_days = student_attendances.count()
            present_days = student_attendances.filter(status__in=['present', 'late', 'half_day']).count()
            absent_days = student_attendances.filter(status='absent').count()
            late_days = student_attendances.filter(status='late').count()
            
            attendance_percentage = (present_days / total_days * 100) if total_days > 0 else 0
            
            reports.append({
                'student_id': student.id,
                'student_name': student.name,
                'student_gr_no': student.gr_no,
                'classroom': str(student.classroom),
                'total_days': total_days,
                'present_days': present_days,
                'absent_days': absent_days,
                'late_days': late_days,
                'attendance_percentage': round(attendance_percentage, 2),
                'period': f"{month}/{year}"
            })
        
        return Response(reports)
    
    @action(detail=False, methods=['post'])
    def mark_attendance(self, request):
        """
        Mark attendance for multiple students in a classroom
        """
        classroom_id = request.data.get('classroom_id')
        date = request.data.get('date')
        attendances_data = request.data.get('attendances', [])
        
        if not classroom_id or not date:
            return Response(
                {'error': 'classroom_id and date are required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        created_attendances = []
        updated_attendances = []
        errors = []
        
        for attendance_data in attendances_data:
            try:
                from students.models import Student
                from classes.models import ClassRoom
                
                student = Student.objects.get(id=attendance_data['student_id'])
                classroom = ClassRoom.objects.get(id=classroom_id)
                
                # Check if attendance already exists
                attendance, created = Attendance.objects.get_or_create(
                    student=student,
                    classroom=classroom,
                    date=date,
                    defaults={
                        'status': attendance_data['status'],
                        'check_in_time': attendance_data.get('check_in_time'),
                        'check_out_time': attendance_data.get('check_out_time'),
                        'remarks': attendance_data.get('remarks', ''),
                        'excuse_reason': attendance_data.get('excuse_reason', ''),
                        'created_by': request.user
                    }
                )
                
                if not created:
                    # Update existing attendance
                    attendance.status = attendance_data['status']
                    attendance.remarks = attendance_data.get('remarks', '')
                    attendance.excuse_reason = attendance_data.get('excuse_reason', '')
                    attendance.save()
                    updated_attendances.append(attendance)
                else:
                    created_attendances.append(attendance)
                    
            except Exception as e:
                errors.append({
                    'student_id': attendance_data['student_id'],
                    'error': str(e)
                })
        
        return Response({
            'created_count': len(created_attendances),
            'updated_count': len(updated_attendances),
            'errors': errors,
            'message': f'Successfully processed {len(created_attendances) + len(updated_attendances)} attendances'
        })


class AttendanceSummaryViewSet(viewsets.ReadOnlyModelViewSet):
    """
    ViewSet for viewing attendance summaries
    """
    serializer_class = AttendanceSummarySerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        queryset = AttendanceSummary.objects.select_related(
            'student', 'classroom__grade', 'campus'
        ).all()
        
        # Filter by campus if user has campus restriction
        if hasattr(self.request.user, 'campus') and self.request.user.campus:
            queryset = queryset.filter(campus=self.request.user.campus)
        
        # Filter by student
        student_id = self.request.query_params.get('student_id')
        if student_id:
            queryset = queryset.filter(student_id=student_id)
        
        # Filter by classroom
        classroom_id = self.request.query_params.get('classroom_id')
        if classroom_id:
            queryset = queryset.filter(classroom_id=classroom_id)
        
        # Filter by month/year
        month = self.request.query_params.get('month')
        year = self.request.query_params.get('year')
        if month:
            queryset = queryset.filter(month=month)
        if year:
            queryset = queryset.filter(year=year)
        
        return queryset.order_by('-year', '-month', 'student__name')
    
    @action(detail=False, methods=['post'])
    def generate_summary(self, request):
        """
        Generate attendance summary for a specific month
        """
        month = request.data.get('month')
        year = request.data.get('year')
        classroom_id = request.data.get('classroom_id')
        
        if not month or not year:
            return Response(
                {'error': 'month and year are required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Get attendance records for the month
        attendances = Attendance.objects.filter(
            date__year=year,
            date__month=month
        )
        
        if classroom_id:
            attendances = attendances.filter(classroom_id=classroom_id)
        
        # Group by student and calculate summaries
        students = attendances.values('student').distinct()
        summaries = []
        
        for student_data in students:
            student_attendances = attendances.filter(student_id=student_data['student'])
            student = student_attendances.first().student
            
            total_days = student_attendances.count()
            present_days = student_attendances.filter(status__in=['present', 'late', 'half_day']).count()
            absent_days = student_attendances.filter(status='absent').count()
            late_days = student_attendances.filter(status='late').count()
            excused_days = student_attendances.filter(status='excused').count()
            half_days = student_attendances.filter(status='half_day').count()
            
            # Create or update summary
            summary, created = AttendanceSummary.objects.get_or_create(
                student=student,
                classroom=student.classroom,
                campus=student.campus,
                month=month,
                year=year,
                defaults={
                    'academic_year': f"{year}-{year + 1}",
                    'total_days': total_days,
                    'present_days': present_days,
                    'absent_days': absent_days,
                    'late_days': late_days,
                    'excused_days': excused_days,
                    'half_days': half_days
                }
            )
            
            if not created:
                # Update existing summary
                summary.total_days = total_days
                summary.present_days = present_days
                summary.absent_days = absent_days
                summary.late_days = late_days
                summary.excused_days = excused_days
                summary.half_days = half_days
                summary.save()
            
            summaries.append(summary)
        
        return Response({
            'message': f'Generated {len(summaries)} attendance summaries',
            'summaries': AttendanceSummarySerializer(summaries, many=True).data
        })


class StudentDetailViewSet(viewsets.ReadOnlyModelViewSet):
    """
    ViewSet for getting student details for auto-selection
    """
    serializer_class = AttendanceSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        from students.models import Student
        return Student.objects.select_related('classroom', 'campus', 'classroom__class_teacher').all()
    
    def retrieve(self, request, pk=None):
        """Get student details for auto-population"""
        try:
            from students.models import Student
            student = Student.objects.select_related(
                'classroom', 'campus', 'classroom__class_teacher'
            ).get(pk=pk)
            
            return Response({
                'id': student.id,
                'name': student.name,
                'classroom': {
                    'id': student.classroom.id,
                    'name': str(student.classroom),
                    'class_teacher': {
                        'id': student.classroom.class_teacher.id,
                        'name': student.classroom.class_teacher.full_name
                    } if student.classroom.class_teacher else None
                },
                'campus': {
                    'id': student.campus.id,
                    'name': student.campus.campus_name
                }
            })
        except Student.DoesNotExist:
            return Response({'error': 'Student not found'}, status=404)


class ClassroomDetailViewSet(viewsets.ReadOnlyModelViewSet):
    """
    ViewSet for getting classroom details for auto-selection
    """
    serializer_class = AttendanceSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        from classes.models import ClassRoom
        return ClassRoom.objects.select_related('class_teacher', 'grade').all()
    
    def retrieve(self, request, pk=None):
        """Get classroom details for auto-population"""
        try:
            from classes.models import ClassRoom
            classroom = ClassRoom.objects.select_related('class_teacher', 'grade').get(pk=pk)
            
            return Response({
                'id': classroom.id,
                'name': str(classroom),
                'class_teacher': {
                    'id': classroom.class_teacher.id,
                    'name': classroom.class_teacher.full_name
                } if classroom.class_teacher else None
            })
        except ClassRoom.DoesNotExist:
            return Response({'error': 'Classroom not found'}, status=404)

