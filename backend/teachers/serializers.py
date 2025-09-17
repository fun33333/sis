from rest_framework import serializers
from .models import Teacher, TeacherEducation, TeacherExperience

class TeacherEducationSerializer(serializers.ModelSerializer):
    class Meta:
        model = TeacherEducation
        fields = "__all__"

class TeacherExperienceSerializer(serializers.ModelSerializer):
    class Meta:
        model = TeacherExperience
        fields = "__all__"

class TeacherSerializer(serializers.ModelSerializer):
    educations = TeacherEducationSerializer(many=True, read_only=True)
    experiences = TeacherExperienceSerializer(many=True, read_only=True)

    class Meta:
        model = Teacher
        fields = "__all__"
