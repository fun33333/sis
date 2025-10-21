from rest_framework import serializers
from .models import Level, Grade, ClassRoom

class LevelSerializer(serializers.ModelSerializer):
    campus_name = serializers.CharField(source='campus.campus_name', read_only=True)
    coordinator_name = serializers.SerializerMethodField()
    coordinator_code = serializers.SerializerMethodField()
    shift_display = serializers.CharField(source='get_shift_display', read_only=True)
    
    class Meta:
        model = Level
        fields = [
            'id', 'name', 'shift', 'shift_display', 'code', 'campus', 'campus_name', 
            'coordinator_name', 'coordinator_code'
        ]
        read_only_fields = ['id', 'code']
    
    def get_coordinator_name(self, obj):
        """Get coordinator name using the property"""
        return obj.coordinator_name
    
    def get_coordinator_code(self, obj):
        """Get coordinator code"""
        coord = obj.coordinator
        return coord.employee_code if coord else None

class GradeSerializer(serializers.ModelSerializer):
    level_name = serializers.CharField(source='level.name', read_only=True)
    level_code = serializers.CharField(source='level.code', read_only=True)
    campus_name = serializers.CharField(source='level.campus.campus_name', read_only=True)
    
    class Meta:
        model = Grade
        fields = [
            'id', 'name', 'code', 'level', 'level_name', 
            'level_code', 'campus_name'
        ]
        read_only_fields = ['id', 'code']

class ClassRoomSerializer(serializers.ModelSerializer):
    grade_name = serializers.CharField(source='grade.name', read_only=True)
    grade_code = serializers.CharField(source='grade.code', read_only=True)
    level_name = serializers.CharField(source='grade.level.name', read_only=True)
    level_code = serializers.CharField(source='grade.level.code', read_only=True)
    campus_name = serializers.CharField(source='grade.level.campus.campus_name', read_only=True)
    class_teacher_name = serializers.CharField(source='class_teacher.full_name', read_only=True)
    class_teacher_code = serializers.CharField(source='class_teacher.employee_code', read_only=True)
    assigned_by_name = serializers.CharField(source='assigned_by.username', read_only=True)
    
    class Meta:
        model = ClassRoom
        fields = [
            'id', 'grade', 'grade_name', 'grade_code', 'section', 'shift', 'class_teacher', 
            'class_teacher_name', 'class_teacher_code', 'capacity', 'code', 
            'level_name', 'level_code', 'campus_name', 'assigned_by', 'assigned_by_name', 
            'assigned_at', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'code', 'assigned_by', 'assigned_at', 'created_at', 'updated_at']
