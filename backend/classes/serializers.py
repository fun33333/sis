from rest_framework import serializers
from .models import Level, Grade, ClassRoom

class LevelSerializer(serializers.ModelSerializer):
    campus_name = serializers.CharField(source='campus.campus_name', read_only=True)
    coordinator_name = serializers.CharField(source='coordinator.full_name', read_only=True)
    
    class Meta:
        model = Level
        fields = [
            'id', 'name', 'code', 'campus', 'campus_name', 
            'coordinator', 'coordinator_name'
        ]
        read_only_fields = ['id', 'code']

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
    
    class Meta:
        model = ClassRoom
        fields = [
            'id', 'grade', 'grade_name', 'grade_code', 'section', 'class_teacher', 
            'class_teacher_name', 'class_teacher_code', 'capacity', 'code', 
            'level_name', 'level_code', 'campus_name', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'code', 'created_at', 'updated_at']
