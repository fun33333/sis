from rest_framework import serializers
from django.utils import timezone
from .models import Attendance, AttendanceSummary


class AttendanceSerializer(serializers.ModelSerializer):
    """
    Serializer for Attendance model
    """
    student_name = serializers.CharField(source='student.name', read_only=True)
    student_gr_no = serializers.CharField(source='student.gr_no', read_only=True)
    student_code = serializers.CharField(source='student.student_code', read_only=True)
    classroom_display = serializers.SerializerMethodField()
    class_teacher_name = serializers.CharField(source='class_teacher.full_name', read_only=True)
    campus_name = serializers.CharField(source='campus.campus_name', read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    is_present = serializers.BooleanField(read_only=True)
    is_absent = serializers.BooleanField(read_only=True)
    is_late = serializers.BooleanField(read_only=True)
    
    class Meta:
        model = Attendance
        fields = [
            'id', 'student', 'student_name', 'student_gr_no', 'student_code',
            'classroom', 'classroom_display', 'class_teacher', 'class_teacher_name',
            'campus', 'campus_name', 'date', 'status', 'status_display',
            'remarks', 'excuse_reason', 'excuse_document', 'academic_year', 
            'semester', 'created_by', 'created_at', 'updated_at', 'is_present', 
            'is_absent', 'is_late'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']
    
    def get_classroom_display(self, obj):
        return f"{obj.classroom.grade.name} - {obj.classroom.section}"
    
    def validate(self, data):
        """Custom validation for attendance data"""
        # Validate that student belongs to the classroom
        if 'student' in data and 'classroom' in data:
            if data['student'].classroom != data['classroom']:
                raise serializers.ValidationError(
                    "Student does not belong to this classroom"
                )
        
        # Validate that class teacher is assigned to this classroom
        if 'class_teacher' in data and 'classroom' in data:
            if data['classroom'].class_teacher != data['class_teacher']:
                raise serializers.ValidationError(
                    "Teacher is not the class teacher for this classroom"
                )
        
        
        return data
    
    def create(self, validated_data):
        """Auto-populate fields during creation"""
        # Auto-populate academic year if not provided
        if not validated_data.get('academic_year'):
            current_year = timezone.now().year
            validated_data['academic_year'] = f"{current_year}-{current_year + 1}"
        
        # Auto-populate campus from student
        if not validated_data.get('campus') and validated_data.get('student'):
            validated_data['campus'] = validated_data['student'].campus
        
        # Auto-populate classroom from student
        if not validated_data.get('classroom') and validated_data.get('student'):
            validated_data['classroom'] = validated_data['student'].classroom
        
        # Auto-populate class teacher from classroom
        if not validated_data.get('class_teacher') and validated_data.get('classroom'):
            validated_data['class_teacher'] = validated_data['classroom'].class_teacher
        
        return super().create(validated_data)


class AttendanceSummarySerializer(serializers.ModelSerializer):
    """
    Serializer for AttendanceSummary model
    """
    student_name = serializers.CharField(source='student.name', read_only=True)
    student_gr_no = serializers.CharField(source='student.gr_no', read_only=True)
    classroom_display = serializers.SerializerMethodField()
    campus_name = serializers.CharField(source='campus.campus_name', read_only=True)
    month_year = serializers.SerializerMethodField()
    
    class Meta:
        model = AttendanceSummary
        fields = [
            'id', 'student', 'student_name', 'student_gr_no', 'classroom',
            'classroom_display', 'campus', 'campus_name', 'month', 'year',
            'academic_year', 'total_days', 'present_days', 'absent_days',
            'late_days', 'excused_days', 'half_days', 'attendance_percentage',
            'created_at', 'updated_at', 'month_year'
        ]
        read_only_fields = ['id', 'attendance_percentage', 'created_at', 'updated_at']
    
    def get_classroom_display(self, obj):
        return f"{obj.classroom.grade.name} - {obj.classroom.section}"
    
    def get_month_year(self, obj):
        return f"{obj.month}/{obj.year}"




class AttendanceBulkCreateSerializer(serializers.Serializer):
    """
    Serializer for bulk attendance creation
    """
    classroom = serializers.IntegerField()
    date = serializers.DateField()
    attendances = serializers.ListField(
        child=serializers.DictField(
            child=serializers.CharField()
        )
    )
    
    def validate_attendances(self, value):
        """Validate attendance data format"""
        required_fields = ['student_id', 'status']
        for attendance in value:
            for field in required_fields:
                if field not in attendance:
                    raise serializers.ValidationError(
                        f"Missing required field: {field}"
                    )
        return value


class AttendanceReportSerializer(serializers.Serializer):
    """
    Serializer for attendance reports
    """
    student_id = serializers.IntegerField()
    student_name = serializers.CharField()
    student_gr_no = serializers.CharField()
    classroom = serializers.CharField()
    total_days = serializers.IntegerField()
    present_days = serializers.IntegerField()
    absent_days = serializers.IntegerField()
    late_days = serializers.IntegerField()
    attendance_percentage = serializers.DecimalField(max_digits=5, decimal_places=2)
    period = serializers.CharField()


class AttendanceStatsSerializer(serializers.Serializer):
    """
    Serializer for attendance statistics
    """
    total_students = serializers.IntegerField()
    present_students = serializers.IntegerField()
    absent_students = serializers.IntegerField()
    late_students = serializers.IntegerField()
    overall_attendance_percentage = serializers.DecimalField(max_digits=5, decimal_places=2)
    date = serializers.DateField()
    classroom = serializers.CharField()
