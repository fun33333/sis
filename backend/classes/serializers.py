# classes/serializers.py
from rest_framework import serializers
from .models import Grade, ClassRoom


class GradeSerializer(serializers.ModelSerializer):
    class Meta:
        model = Grade
        fields = [
            "id",
            "name",
            "short_code",
        ]


class ClassRoomSerializer(serializers.ModelSerializer):
    grade_name = serializers.CharField(source="grade.name", read_only=True)
    class_teacher_name = serializers.CharField(source="class_teacher.name", read_only=True)

    class Meta:
        model = ClassRoom
        fields = [
            "id",
            "grade",              # foreign key (grade id)
            "grade_name",         # readable grade name
            "section",
            "class_teacher",      # foreign key (teacher id)
            "class_teacher_name", # readable teacher name
            "capacity",
            "code",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ("code", "created_at", "updated_at")
