from rest_framework import serializers
from .models import Attendance, StudentAttendance
from students.models import Student
from classes.models import ClassRoom
from teachers.models import Teacher


class StudentAttendanceSerializer(serializers.ModelSerializer):
    student_name = serializers.CharField(source='student.name', read_only=True)
    student_code = serializers.CharField(source='student.student_code', read_only=True)
    student_photo = serializers.ImageField(source='student.photo', read_only=True)
    
    class Meta:
        model = StudentAttendance
        fields = [
            'id', 'student', 'student_name', 'student_code', 'student_photo',
            'status', 'remarks', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']


class AttendanceSerializer(serializers.ModelSerializer):
    classroom_name = serializers.CharField(source='classroom.__str__', read_only=True)
    classroom_code = serializers.CharField(source='classroom.code', read_only=True)
    marked_by_name = serializers.CharField(source='marked_by.full_name', read_only=True)
    student_attendance = StudentAttendanceSerializer(many=True, read_only=True)
    
    class Meta:
        model = Attendance
        fields = [
            'id', 'classroom', 'classroom_name', 'classroom_code',
            'date', 'marked_by', 'marked_by_name',
            'total_students', 'present_count', 'absent_count', 'late_count',
            'student_attendance', 'created_at', 'updated_at'
        ]
        read_only_fields = [
            'id', 'total_students', 'present_count', 'absent_count', 'late_count',
            'created_at', 'updated_at'
        ]


class AttendanceMarkingSerializer(serializers.Serializer):
    """
    Serializer for marking attendance
    """
    classroom_id = serializers.IntegerField()
    date = serializers.DateField()
    student_attendance = serializers.ListField(
        child=serializers.DictField(),
        help_text="List of student attendance records"
    )
    
    def validate_classroom_id(self, value):
        try:
            ClassRoom.objects.get(id=value)
        except ClassRoom.DoesNotExist:
            raise serializers.ValidationError("Classroom does not exist")
        return value
    
    def validate_student_attendance(self, value):
        required_fields = ['student_id', 'status']
        for record in value:
            for field in required_fields:
                if field not in record:
                    raise serializers.ValidationError(f"Missing required field: {field}")
            
            if record['status'] not in ['present', 'absent', 'late', 'excused']:
                raise serializers.ValidationError("Invalid status value")
        
        return value


class AttendanceSummarySerializer(serializers.Serializer):
    """
    Serializer for attendance summary statistics
    """
    classroom_id = serializers.IntegerField()
    classroom_name = serializers.CharField()
    date = serializers.DateField()
    total_students = serializers.IntegerField()
    present_count = serializers.IntegerField()
    absent_count = serializers.IntegerField()
    late_count = serializers.IntegerField()
    attendance_percentage = serializers.FloatField()

