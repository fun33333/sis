from rest_framework import serializers
from .models import Attendance, StudentAttendance
from students.models import Student
from classes.models import ClassRoom
from teachers.models import Teacher


class StudentAttendanceSerializer(serializers.ModelSerializer):
    student_name = serializers.CharField(source='student.name', read_only=True)
    student_code = serializers.SerializerMethodField()  # Use method to get the best available ID
    student_gender = serializers.CharField(source='student.gender', read_only=True)
    student_photo = serializers.ImageField(source='student.photo', read_only=True)
    
    def get_student_code(self, obj):
        # Return the best available student identifier
        return obj.student.student_code or obj.student.student_id or obj.student.gr_no or f"ID-{obj.student.id}"
    
    class Meta:
        model = StudentAttendance
        fields = [
            'id', 'student', 'student_name', 'student_code', 'student_gender', 'student_photo',
            'status', 'remarks', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']


class AttendanceSerializer(serializers.ModelSerializer):
    classroom_name = serializers.CharField(source='classroom.__str__', read_only=True)
    classroom_code = serializers.CharField(source='classroom.code', read_only=True)
    marked_by_name = serializers.SerializerMethodField()
    student_attendance = StudentAttendanceSerializer(source='student_attendances', many=True, read_only=True)
    
    class Meta:
        model = Attendance
        fields = [
            'id', 'classroom', 'classroom_name', 'classroom_code',
            'date', 'marked_by', 'marked_by_name',
            'total_students', 'present_count', 'absent_count', 'late_count', 'leave_count',
            'student_attendance', 'created_at', 'updated_at', 'status'
        ]
        read_only_fields = [
            'id', 'total_students', 'present_count', 'absent_count', 'late_count',
            'created_at', 'updated_at'
        ]
    
    def get_marked_by_name(self, obj):
        if obj.marked_by:
            return obj.marked_by.get_full_name()
        return None
    
    def to_representation(self, instance):
        data = super().to_representation(instance)
        print(f"🔍 DEBUG: Serializing attendance {instance.id}")
        print(f"  Student attendances count: {instance.student_attendances.count()}")
        print(f"  Student attendance data: {data.get('student_attendance', 'NOT FOUND')}")
        return data


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

