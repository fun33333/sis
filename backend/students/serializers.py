# students/serializers.py
from rest_framework import serializers
from .models import Student
from campus.serializers import CampusSerializer
from classes.serializers import ClassRoomSerializer


class StudentSerializer(serializers.ModelSerializer):
    # Nested serializers for related objects
    campus_data = CampusSerializer(source='campus', read_only=True)
    classroom_data = ClassRoomSerializer(source='classroom', read_only=True)
    
    # Computed fields
    campus_name = serializers.SerializerMethodField()
    classroom_name = serializers.SerializerMethodField()
    class_name = serializers.SerializerMethodField()
    age = serializers.SerializerMethodField()
    
    class Meta:
        model = Student
        fields = '__all__'
        extra_fields = ['campus_data', 'classroom_data', 'campus_name', 'classroom_name', 'class_name', 'age']
    
    def get_campus_name(self, obj):
        """Get campus name for display"""
        return obj.campus.campus_name if obj.campus else None
    
    def get_classroom_name(self, obj):
        """Get classroom name for display"""
        if obj.classroom:
            return f"{obj.classroom.grade.name} - {obj.classroom.section}"
        return None
    
    def get_class_name(self, obj):
        """Get class name for display"""
        if obj.classroom and obj.classroom.grade:
            return f"{obj.classroom.grade.name} {obj.classroom.section}"
        return None
    
    def get_age(self, obj):
        """Calculate age from date of birth"""
        if obj.dob:
            from datetime import date
            today = date.today()
            return today.year - obj.dob.year - ((today.month, today.day) < (obj.dob.month, obj.dob.day))
        return None
