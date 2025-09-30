# subjects/serializers.py
from rest_framework import serializers
from .models import Subject


class SubjectSerializer(serializers.ModelSerializer):
    grade_name = serializers.CharField(source="grade.name", read_only=True)
    teacher_name = serializers.CharField(source="teacher.name", read_only=True)

    class Meta:
        model = Subject
        fields = [
            "id",
            "grade",         # foreign key (grade id)
            "grade_name",    # readable grade name
            "name",
            "code",
            "teacher",       # foreign key (teacher id)
            "teacher_name",  # readable teacher name
            "created_at",
        ]
        read_only_fields = ("code", "created_at")
