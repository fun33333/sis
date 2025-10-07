from rest_framework import serializers
from .models import Coordinator
from classes.models import Grade, ClassRoom
from teachers.models import Teacher
from students.models import Student


class CoordinatorSerializer(serializers.ModelSerializer):
    campus_name = serializers.CharField(source="campus.campus_name", read_only=True)
    grades_info = serializers.StringRelatedField(source="grades", many=True, read_only=True)
    classes_info = serializers.StringRelatedField(source="classes", many=True, read_only=True)
    teachers_info = serializers.StringRelatedField(source="teachers", many=True, read_only=True)
    students_info = serializers.StringRelatedField(source="students", many=True, read_only=True)

    class Meta:
        model = Coordinator
        fields = [
            "id",
            "full_name",
            "email",
            "phone",
            "gender",
            "cnic",
            "campus",
            "campus_name",
            "section",
            "grades",
            "grades_info",
            "classes",
            "classes_info",
            "teachers",
            "teachers_info",
            "students",
            "students_info",
            "date_joined",
            "is_active",
            "created_at",
            "updated_at",
        ]
