from rest_framework import serializers
from .models import Teacher
from campus.serializers import CampusSerializer
from coordinator.serializers import CoordinatorSerializer
from classes.serializers import ClassRoomSerializer


class TeacherSerializer(serializers.ModelSerializer):
    # Nested serializers for related objects
    campus_data = CampusSerializer(source='current_campus', read_only=True)
    coordinators_data = CoordinatorSerializer(source='assigned_coordinators', many=True, read_only=True)
    classroom_data = ClassRoomSerializer(source='assigned_classroom', read_only=True)
    
    # Computed fields
    campus_name = serializers.SerializerMethodField()
    coordinator_names = serializers.SerializerMethodField()
    classroom_name = serializers.SerializerMethodField()
    experience_display = serializers.SerializerMethodField()
    
    class Meta:
        model = Teacher
        fields = "__all__"
        extra_fields = ['campus_data', 'coordinators_data', 'classroom_data', 
                       'campus_name', 'coordinator_names', 'classroom_name', 'experience_display']
    
    def get_campus_name(self, obj):
        """Get campus name for display"""
        return obj.current_campus.campus_name if obj.current_campus else None
    
    def get_coordinator_names(self, obj):
        """Get coordinator names for display"""
        return [coord.full_name for coord in obj.assigned_coordinators.all()]
    
    def get_classroom_name(self, obj):
        """Get classroom name for display"""
        if obj.assigned_classroom:
            return f"{obj.assigned_classroom.grade.name} - {obj.assigned_classroom.section}"
        return None
    
    def get_experience_display(self, obj):
        """Get formatted experience display"""
        if obj.total_experience_years:
            return f"{obj.total_experience_years} years"
        return "Not specified"
