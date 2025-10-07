from rest_framework import serializers
from .models import Coordinator
from classes.models import Grade, ClassRoom
from teachers.models import Teacher
from students.models import Student


class CoordinatorSerializer(serializers.ModelSerializer):
    campus_name = serializers.CharField(source="campus.campus_name", read_only=True)
    level_name = serializers.CharField(source="level.name", read_only=True)

    class Meta:
        model = Coordinator
        fields = [
            "id",
            "full_name",
            "email",
            "contact_number",
            "gender",
            "cnic",
            "campus",
            "campus_name",
            "level",
            "level_name",
            "joining_date",
            "is_currently_active",
            "can_assign_class_teachers",
            "employee_code",
            "created_at",
            "updated_at",
        ]
