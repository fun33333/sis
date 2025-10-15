from rest_framework import generics, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from django.db import transaction
from django.utils import timezone
from datetime import date, timedelta, datetime

from .models import Attendance, StudentAttendance
from .serializers import (
    AttendanceSerializer, 
    StudentAttendanceSerializer, 
    AttendanceMarkingSerializer,
    AttendanceSummarySerializer
)
from students.models import Student
from classes.models import ClassRoom
from teachers.models import Teacher


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def mark_attendance(request):
    """
    Mark attendance for a class on a specific date
    """
    try:
        serializer = AttendanceMarkingSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
        data = serializer.validated_data
        classroom_id = data['classroom_id']
        date = data['date']
        student_attendance_data = data['student_attendance']
        
        classroom = get_object_or_404(ClassRoom, id=classroom_id)
        
        # Get teacher from request user
        try:
            # Find teacher by email since there's no direct relationship
            from teachers.models import Teacher
            teacher = Teacher.objects.get(email=request.user.email)
        except Teacher.DoesNotExist:
            teacher = None
        
        with transaction.atomic():
            # Create or get attendance record
            attendance, created = Attendance.objects.get_or_create(
                classroom=classroom,
                date=date,
                defaults={'marked_by': teacher}
            )
            
            # Clear existing student attendance records
            attendance.student_attendances.all().delete()
            
            # Create new student attendance records
            for student_data in student_attendance_data:
                StudentAttendance.objects.create(
                    attendance=attendance,
                    student_id=student_data['student_id'],
                    status=student_data['status'],
                    remarks=student_data.get('remarks', '')
                )
            
            # Update attendance summary
            attendance.update_counts()
            
        return Response({
            'message': 'Attendance marked successfully',
            'attendance_id': attendance.id,
            'total_students': attendance.total_students,
            'present_count': attendance.present_count,
            'absent_count': attendance.absent_count,
            'late_count': attendance.late_count
        }, status=status.HTTP_201_CREATED)
        
    except Exception as e:
        return Response({
            'error': str(e)
        }, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def mark_bulk_attendance(request):
    """
    Mark attendance for entire class with simple present/absent status
    """
    try:
        classroom_id = request.data.get('classroom_id')
        date_str = request.data.get('date')
        student_attendance_data = request.data.get('student_attendance', [])
        
        if not classroom_id or not date_str:
            return Response({
                'error': 'classroom_id and date are required'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Convert date string to date object
        try:
            date_obj = datetime.strptime(date_str, '%Y-%m-%d').date()
        except ValueError:
            return Response({
                'error': 'Invalid date format. Use YYYY-MM-DD.'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        classroom = get_object_or_404(ClassRoom, id=classroom_id)
        
        # Get all students in this class
        all_students = Student.objects.filter(classroom=classroom)
        all_student_ids = list(all_students.values_list('id', flat=True))
        
        with transaction.atomic():
            # Create or get attendance record
            attendance, created = Attendance.objects.get_or_create(
                classroom=classroom,
                date=date_obj,
                defaults={'marked_by': request.user}
            )
            
            # Clear existing student attendance records
            attendance.student_attendances.all().delete()
            
            # Create student attendance records
            for student_data in student_attendance_data:
                student_id = student_data.get('student_id')
                attendance_status = student_data.get('status', 'present')
                remarks = student_data.get('remarks', '')
                
                if not student_id:
                    continue
                
                # Verify student belongs to this classroom
                try:
                    student = Student.objects.get(id=student_id, classroom=classroom)
                    StudentAttendance.objects.create(
                        attendance=attendance,
                        student=student,
                        status=attendance_status,
                        remarks=remarks,
                        created_by=request.user,
                        updated_by=request.user
                    )
                except Student.DoesNotExist:
                    continue
            
            # Update attendance summary
            attendance.update_counts()
            
        return Response({
            'message': 'Bulk attendance marked successfully',
            'attendance_id': attendance.id,
            'total_students': attendance.total_students,
            'present_count': attendance.present_count,
            'absent_count': attendance.absent_count,
            'leave_count': attendance.leave_count,
            'attendance_percentage': round((attendance.present_count / attendance.total_students) * 100, 2) if attendance.total_students > 0 else 0
        }, status=status.HTTP_201_CREATED)
        
    except Exception as e:
        return Response({
            'error': str(e)
        }, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_class_attendance(request, classroom_id):
    """
    Get attendance records for a specific class
    """
    classroom = get_object_or_404(ClassRoom, id=classroom_id)
    date_param = request.GET.get('date')
    start_date = request.GET.get('start_date')
    end_date = request.GET.get('end_date')
    
    if date_param:
        # Get attendance for specific date
        attendance = Attendance.objects.filter(
            classroom=classroom,
            date=date_param
        ).first()
        if attendance:
            serializer = AttendanceSerializer(attendance)
            return Response(serializer.data)
        else:
            return Response({'message': 'No attendance found for this date'})
    elif start_date or end_date:
        # Get attendance for date range
        attendance_records = Attendance.objects.filter(
            classroom=classroom
        )
        
        if start_date:
            attendance_records = attendance_records.filter(date__gte=start_date)
        if end_date:
            attendance_records = attendance_records.filter(date__lte=end_date)
            
        attendance_records = attendance_records.order_by('-date')
        serializer = AttendanceSerializer(attendance_records, many=True)
        return Response(serializer.data)
    else:
        # Get all attendance records for the class
        attendance_records = Attendance.objects.filter(
            classroom=classroom
        ).order_by('-date')
        serializer = AttendanceSerializer(attendance_records, many=True)
        return Response(serializer.data)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_student_attendance(request, student_id):
    """
    Get attendance history for a specific student
    """
    student = get_object_or_404(Student, id=student_id)
    start_date = request.GET.get('start_date')
    end_date = request.GET.get('end_date')
    
    attendance_records = StudentAttendance.objects.filter(
        student=student
    ).select_related('attendance')
    
    if start_date:
        attendance_records = attendance_records.filter(
            attendance__date__gte=start_date
        )
    if end_date:
        attendance_records = attendance_records.filter(
            attendance__date__lte=end_date
        )
    
    serializer = StudentAttendanceSerializer(attendance_records, many=True)
    return Response(serializer.data)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_class_students(request, classroom_id):
    """
    Get all students in a specific classroom
    """
    classroom = get_object_or_404(ClassRoom, id=classroom_id)
    
    # Check permissions - teacher can only see their own class
    user = request.user
    if user.is_teacher():
        try:
            # Find teacher by employee code (username)
            from teachers.models import Teacher
            teacher = Teacher.objects.get(employee_code=user.username)
            if teacher.assigned_classroom != classroom:
                return Response({'error': 'Access denied'}, status=status.HTTP_403_FORBIDDEN)
        except Teacher.DoesNotExist:
            return Response({'error': 'Teacher profile not found'}, status=status.HTTP_404_NOT_FOUND)
    
    students = Student.objects.filter(classroom=classroom, is_deleted=False).order_by('name')
    
    student_data = []
    for student in students:
        student_data.append({
            'id': student.id,
            'name': student.name,
            'student_code': student.student_code,
            'photo': student.photo.url if student.photo else None,
            'gr_no': student.gr_no,
            'gender': student.gender,
            'student_id': student.student_id
        })
    
    return Response(student_data)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_attendance_summary(request, classroom_id):
    """
    Get attendance summary for a classroom
    """
    classroom = get_object_or_404(ClassRoom, id=classroom_id)
    start_date = request.GET.get('start_date')
    end_date = request.GET.get('end_date')
    
    if not start_date:
        start_date = (timezone.now().date() - timedelta(days=30))
    if not end_date:
        end_date = timezone.now().date()
    
    attendance_records = Attendance.objects.filter(
        classroom=classroom,
        date__range=[start_date, end_date]
    ).order_by('-date')
    
    summary_data = []
    for attendance in attendance_records:
        attendance_percentage = 0
        if attendance.total_students > 0:
            attendance_percentage = (attendance.present_count / attendance.total_students) * 100
        
        summary_data.append({
            'classroom_id': classroom.id,
            'classroom_name': str(classroom),
            'date': attendance.date,
            'total_students': attendance.total_students,
            'present_count': attendance.present_count,
            'absent_count': attendance.absent_count,
            'late_count': attendance.late_count,
            'attendance_percentage': round(attendance_percentage, 2)
        })
    
    return Response(summary_data)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_teacher_classes(request):
    """
    Get all classes assigned to the current teacher
    """
    try:
        user = request.user
        
        # Find teacher by email since there's no direct relationship
        from teachers.models import Teacher
        try:
            teacher = Teacher.objects.get(email=user.email)
        except Teacher.DoesNotExist:
            return Response({'error': 'Teacher profile not found'}, status=status.HTTP_404_NOT_FOUND)
        
        if not teacher:
            return Response({'error': 'Teacher profile not found'}, status=status.HTTP_404_NOT_FOUND)
        
        # Get classes where teacher is class teacher
        classrooms = ClassRoom.objects.filter(class_teacher=teacher)
        
        class_data = []
        for classroom in classrooms:
            class_data.append({
                'id': classroom.id,
                'name': str(classroom),
                'code': classroom.code,
                'grade': classroom.grade.name,
                'section': classroom.section,
                'shift': classroom.shift,
                'campus': classroom.campus.campus_name if classroom.campus else None
            })
        
        return Response(class_data)
        
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)


@api_view(['PUT'])
@permission_classes([IsAuthenticated])
def edit_attendance(request, attendance_id):
    """
    Edit existing attendance record
    Teachers can edit within 7 days, Coordinators can edit anytime for their level
    """
    try:
        attendance = get_object_or_404(Attendance, id=attendance_id, is_deleted=False)
        user = request.user
        
        # Check if user can edit this attendance
        can_edit = False
        edit_reason = None
        
        # SuperAdmin can edit anything
        if user.is_superuser:
            can_edit = True
            edit_reason = "SuperAdmin edit"
        
        # Check teacher permissions (7-day limit)
        elif user.is_teacher():
            try:
                # Find teacher by email since there's no direct relationship
                from teachers.models import Teacher
                teacher = Teacher.objects.get(email=user.email)
                if teacher and teacher.assigned_classroom == attendance.classroom:
                    if attendance.is_editable:
                        can_edit = True
                        edit_reason = "Teacher edit within 7 days"
                    else:
                        return Response({
                            'error': 'Cannot edit attendance older than 7 days'
                        }, status=status.HTTP_403_FORBIDDEN)
            except Teacher.DoesNotExist:
                pass
        
        # Check coordinator permissions (unlimited time for their level)
        elif user.is_coordinator():
            try:
                # Find coordinator by email since there's no direct relationship
                from coordinator.models import Coordinator
                coordinator = Coordinator.objects.get(email=user.email)
                if (coordinator and coordinator.is_currently_active and 
                    coordinator.level == attendance.classroom.grade.level):
                    can_edit = True
                    edit_reason = "Coordinator edit"
            except Coordinator.DoesNotExist:
                pass
        
        # Check principal permissions
        elif user.is_principal():
            try:
                # Find principal by email since there's no direct relationship
                from principals.models import Principal
                principal = Principal.objects.get(email=user.email)
                if (principal and principal.is_currently_active and 
                    principal.campus == attendance.classroom.campus):
                    can_edit = True
                    edit_reason = "Principal edit"
            except Principal.DoesNotExist:
                pass
        
        if not can_edit:
            return Response({
                'error': 'You do not have permission to edit this attendance'
            }, status=status.HTTP_403_FORBIDDEN)
        
        # Get new attendance data
        data = request.data
        student_attendance_data = data.get('student_attendance', [])
        
        if not student_attendance_data:
            return Response({
                'error': 'Student attendance data is required'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        with transaction.atomic():
            # Clear existing student attendance records
            attendance.student_attendances.all().delete()
            
            # Create new student attendance records
            for student_data in student_attendance_data:
                student_id = student_data.get('student_id')
                attendance_status = student_data.get('status', 'present')
                remarks = student_data.get('remarks', '')
                
                if not student_id:
                    continue
                
                try:
                    student = Student.objects.get(id=student_id, classroom=attendance.classroom)
                    StudentAttendance.objects.create(
                        student=student,
                        attendance=attendance,
                        status=attendance_status,
                        remarks=remarks,
                        created_by=user,
                        updated_by=user
                    )
                except Student.DoesNotExist:
                    continue
            
            # Update attendance counts
            attendance.update_counts()
            
            # Add edit history
            attendance.add_edit_history(
                user=user,
                action='edited',
                reason=edit_reason,
                changes={
                    'edited_at': timezone.now().isoformat(),
                    'student_count': len(student_attendance_data)
                }
            )
            
            # Update marked_by if it's a teacher
            if user.is_teacher():
                attendance.marked_by = user
                # Save only specific fields to avoid updating created_at
                attendance.save(update_fields=['marked_by', 'updated_at'])
        
        # Return updated attendance data
        serializer = AttendanceSerializer(attendance)
        return Response({
            'message': 'Attendance updated successfully',
            'attendance': serializer.data
        })
        
    except Attendance.DoesNotExist:
        return Response({'error': 'Attendance record not found'}, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_attendance_for_date(request, classroom_id, date):
    """
    Get attendance for a specific date
    """
    try:
        classroom = get_object_or_404(ClassRoom, id=classroom_id)
        user = request.user
        
        # Check permissions
        if user.is_teacher():
            try:
                # Find teacher by email since there's no direct relationship
                from teachers.models import Teacher
                teacher = Teacher.objects.get(email=user.email)
                if teacher.assigned_classroom != classroom:
                    return Response({'error': 'Access denied'}, status=status.HTTP_403_FORBIDDEN)
            except Teacher.DoesNotExist:
                return Response({'error': 'Teacher profile not found'}, status=status.HTTP_404_NOT_FOUND)
        
        # Get attendance for the date
        try:
            attendance = Attendance.objects.get(
                classroom=classroom,
                date=date,
                is_deleted=False
            )
            
            # Get student attendance records
            student_attendances = attendance.student_attendances.all()
            
            attendance_data = {
                'id': attendance.id,
                'date': attendance.date.isoformat(),
                'classroom': {
                    'id': classroom.id,
                    'name': str(classroom),
                    'code': classroom.code
                },
                'total_students': attendance.total_students,
                'present_count': attendance.present_count,
                'absent_count': attendance.absent_count,
                'late_count': attendance.late_count,
                'leave_count': attendance.leave_count,
                'attendance_percentage': attendance.attendance_percentage,
                'is_editable': attendance.is_editable,
                'marked_at': attendance.marked_at.isoformat(),
                'marked_by': attendance.marked_by.get_full_name() if attendance.marked_by else None,
                'student_attendance': [
                    {
                        'student_id': sa.student.id,
                        'student_name': sa.student.name,
                        'student_code': sa.student.student_code,
                        'status': sa.status,
                        'remarks': sa.remarks or ''
                    }
                    for sa in student_attendances
                ],
                'edit_history': attendance.update_history
            }
            
            return Response(attendance_data)
            
        except Attendance.DoesNotExist:
            return Response({
                'message': 'No attendance found for this date',
                'date': date,
                'classroom_id': classroom_id
            })
            
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_coordinator_classes(request):
    """
    Get all classes in coordinator's assigned level
    """
    try:
        user = request.user
        
        if not user.is_coordinator():
            return Response({'error': 'Access denied'}, status=status.HTTP_403_FORBIDDEN)
        
        # Check permissions
        if user.is_coordinator():
            try:
                # Find coordinator by email since there's no direct relationship
                from coordinator.models import Coordinator
                coordinator = Coordinator.objects.get(email=user.email)
                if not coordinator or not coordinator.is_currently_active:
                    return Response({'error': 'Coordinator profile not found or inactive'}, status=status.HTTP_404_NOT_FOUND)
            except Coordinator.DoesNotExist:
                return Response({'error': 'Coordinator profile not found'}, status=status.HTTP_404_NOT_FOUND)
        
        # Get all classes in coordinator's level
        classrooms = ClassRoom.objects.filter(
            grade__level=coordinator.level,
            is_deleted=False
        ).select_related('grade', 'campus', 'class_teacher')
        
        class_data = []
        for classroom in classrooms:
            class_data.append({
                'id': classroom.id,
                'name': str(classroom),
                'code': classroom.code,
                'grade': classroom.grade.name,
                'section': classroom.section,
                'shift': classroom.shift,
                'campus': classroom.campus.campus_name if classroom.campus else None,
                'class_teacher': {
                    'id': classroom.class_teacher.id if classroom.class_teacher else None,
                    'name': classroom.class_teacher.get_full_name() if classroom.class_teacher else None,
                    'username': classroom.class_teacher.username if classroom.class_teacher else None
                } if classroom.class_teacher else None,
                'student_count': classroom.students.filter(is_deleted=False).count()
            })
        
        return Response(class_data)
        
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_level_attendance_summary(request, level_id):
    """
    Get attendance summary for all classes in a level
    """
    try:
        user = request.user
        
        # Check permissions
        if user.is_coordinator():
            try:
                # Find coordinator by email since there's no direct relationship
                from coordinator.models import Coordinator
                coordinator = Coordinator.objects.get(email=user.email)
                if not coordinator or coordinator.level.id != level_id:
                    return Response({'error': 'Access denied'}, status=status.HTTP_403_FORBIDDEN)
            except Coordinator.DoesNotExist:
                return Response({'error': 'Coordinator profile not found'}, status=status.HTTP_404_NOT_FOUND)
        elif user.is_principal():
            try:
                # Find principal by email since there's no direct relationship
                from principals.models import Principal
                principal = Principal.objects.get(email=user.email)
                if not principal or not principal.is_currently_active:
                    return Response({'error': 'Principal profile not found'}, status=status.HTTP_404_NOT_FOUND)
            except Principal.DoesNotExist:
                return Response({'error': 'Principal profile not found'}, status=status.HTTP_404_NOT_FOUND)
        elif not user.is_superuser:
            return Response({'error': 'Access denied'}, status=status.HTTP_403_FORBIDDEN)
        
        # Get date range
        start_date = request.GET.get('start_date')
        end_date = request.GET.get('end_date')
        
        if not start_date:
            start_date = (timezone.now() - timedelta(days=30)).date()
        else:
            start_date = datetime.strptime(start_date, '%Y-%m-%d').date()
            
        if not end_date:
            end_date = timezone.now().date()
        else:
            end_date = datetime.strptime(end_date, '%Y-%m-%d').date()
        
        # Get all classes in the level
        classrooms = ClassRoom.objects.filter(
            grade__level_id=level_id,
            is_deleted=False
        ).select_related('grade', 'campus')
        
        summary_data = []
        total_students = 0
        total_present = 0
        total_absent = 0
        total_late = 0
        total_leave = 0
        
        for classroom in classrooms:
            # Get attendance records for this classroom in date range
            attendances = Attendance.objects.filter(
                classroom=classroom,
                date__range=[start_date, end_date],
                is_deleted=False
            )
            
            classroom_total_students = classroom.students.filter(is_deleted=False).count()
            classroom_present = sum(att.present_count for att in attendances)
            classroom_absent = sum(att.absent_count for att in attendances)
            classroom_late = sum(att.late_count for att in attendances)
            classroom_leave = sum(att.leave_count for att in attendances)
            classroom_records = attendances.count()
            
            avg_percentage = 0
            if classroom_records > 0:
                avg_percentage = sum(att.attendance_percentage for att in attendances) / classroom_records
            
            summary_data.append({
                'classroom': {
                    'id': classroom.id,
                    'name': str(classroom),
                    'code': classroom.code,
                    'grade': classroom.grade.name,
                    'section': classroom.section,
                    'shift': classroom.shift,
                    'campus': classroom.campus.campus_name if classroom.campus else None
                },
                'student_count': classroom_total_students,
                'records_count': classroom_records,
                'total_present': classroom_present,
                'total_absent': classroom_absent,
                'total_late': classroom_late,
                'total_leave': classroom_leave,
                'average_percentage': round(avg_percentage, 2),
                'last_attendance': attendances.order_by('-date').first().date.isoformat() if attendances.exists() else None
            })
            
            total_students += classroom_total_students
            total_present += classroom_present
            total_absent += classroom_absent
            total_late += classroom_late
            total_leave += classroom_leave
        
        # Calculate overall statistics
        overall_percentage = 0
        if total_students > 0:
            overall_percentage = round((total_present / (total_present + total_absent)) * 100, 2)
        
        return Response({
            'level_id': level_id,
            'date_range': {
                'start_date': start_date.isoformat(),
                'end_date': end_date.isoformat()
            },
            'summary': {
                'total_classrooms': len(summary_data),
                'total_students': total_students,
                'total_present': total_present,
                'total_absent': total_absent,
                'total_late': total_late,
                'total_leave': total_leave,
                'overall_percentage': overall_percentage
            },
            'classrooms': summary_data
        })
        
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)
