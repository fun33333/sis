from rest_framework import serializers
from .models import Level, Grade, ClassRoom
from campus.models import Campus
from coordinator.models import Coordinator
from teachers.models import Teacher


class LevelSerializer(serializers.ModelSerializer):
    campus_name = serializers.CharField(source='campus.campus_name', read_only=True)
    coordinator_name = serializers.CharField(source='coordinator.full_name', read_only=True)
    
    class Meta:
        model = Level
        fields = ['id', 'name', 'short_code', 'code', 'campus', 'campus_name', 'coordinator', 'coordinator_name']
        read_only_fields = ['code']

    def create(self, validated_data):
        return Level.objects.create(**validated_data)


class GradeSerializer(serializers.ModelSerializer):
    level_name = serializers.CharField(source='level.name', read_only=True)
    campus_name = serializers.CharField(source='level.campus.campus_name', read_only=True)
    
    class Meta:
        model = Grade
        fields = ['id', 'name', 'short_code', 'level', 'level_name', 'campus_name']

    def create(self, validated_data):
        return Grade.objects.create(**validated_data)


class ClassRoomSerializer(serializers.ModelSerializer):
    grade_name = serializers.CharField(source='grade.name', read_only=True)
    level_name = serializers.CharField(source='grade.level.name', read_only=True)
    campus_name = serializers.CharField(source='grade.level.campus.campus_name', read_only=True)
    teacher_name = serializers.CharField(source='class_teacher.full_name', read_only=True)
    
    class Meta:
        model = ClassRoom
        fields = ['id', 'grade', 'grade_name', 'level_name', 'campus_name', 'section', 'class_teacher', 'teacher_name', 'capacity', 'code', 'created_at', 'updated_at']
        read_only_fields = ['code', 'created_at', 'updated_at']

    def create(self, validated_data):
        return ClassRoom.objects.create(**validated_data)


class LevelChoicesSerializer(serializers.Serializer):
    campuses = serializers.ListField()
    coordinators = serializers.ListField()


class GradeChoicesSerializer(serializers.Serializer):
    levels = serializers.ListField()


class ClassRoomChoicesSerializer(serializers.Serializer):
    grades = serializers.ListField()
    teachers = serializers.ListField()
    sections = serializers.ListField()
