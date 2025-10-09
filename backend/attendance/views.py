from rest_framework import generics, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from django.db import transaction
from django.utils import timezone
from datetime import date, timedelta

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
            teacher = request.user.teacher
        except:
            teacher = None
        
        with transaction.atomic():
            # Create or get attendance record
            attendance, created = Attendance.objects.get_or_create(
                classroom=classroom,
                date=date,
                defaults={'marked_by': teacher}
            )
            
            # Clear existing student attendance records
            attendance.student_attendance.all().delete()
            
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
        date = request.data.get('date')
        present_student_ids = request.data.get('present_students', [])
        
        if not classroom_id or not date:
            return Response({
                'error': 'classroom_id and date are required'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        classroom = get_object_or_404(ClassRoom, id=classroom_id)
        
        # Get all students in this class
        all_students = Student.objects.filter(classroom=classroom)
        all_student_ids = list(all_students.values_list('id', flat=True))
        
        # Get teacher from request user
        try:
            teacher = request.user.teacher
        except:
            teacher = None
        
        with transaction.atomic():
            # Create or get attendance record
            attendance, created = Attendance.objects.get_or_create(
                classroom=classroom,
                date=date,
                defaults={'marked_by': teacher}
            )
            
            # Clear existing student attendance records
            attendance.student_attendance.all().delete()
            
            # Create student attendance records
            for student_id in all_student_ids:
                status = 'present' if student_id in present_student_ids else 'absent'
                StudentAttendance.objects.create(
                    attendance=attendance,
                    student_id=student_id,
                    status=status
                )
            
            # Update attendance summary
            attendance.update_counts()
            
        return Response({
            'message': 'Bulk attendance marked successfully',
            'attendance_id': attendance.id,
            'total_students': attendance.total_students,
            'present_count': attendance.present_count,
            'absent_count': attendance.absent_count,
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
    students = Student.objects.filter(classroom=classroom).order_by('name')
    
    student_data = []
    for student in students:
        student_data.append({
            'id': student.id,
            'name': student.name,
            'student_code': student.student_code,
            'photo': student.photo.url if student.photo else None,
            'gr_no': student.gr_no
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
        teacher = request.user.teacher
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
