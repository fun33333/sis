from rest_framework import serializers
from .models import Coordinator
from classes.models import Grade, ClassRoom, Level
from teachers.models import Teacher
from students.models import Student


class CoordinatorSerializer(serializers.ModelSerializer):
    campus_name = serializers.CharField(source="campus.campus_name", read_only=True)
    level_name = serializers.CharField(source="level.name", read_only=True)
    assigned_levels = serializers.PrimaryKeyRelatedField(
        many=True, required=False, allow_empty=True, queryset=Level.objects.all()
    )
    assigned_levels_details = serializers.SerializerMethodField(read_only=True)

    class Meta:
        model = Coordinator
        fields = [
            "id",
            "full_name",
            "dob",
            "gender",
            "contact_number",
            "email",
            "cnic",
            "permanent_address",
            "education_level",
            "institution_name",
            "year_of_passing",
            "total_experience_years",
            "campus",
            "campus_name",
            "level",
            "assigned_levels",
            "assigned_levels_details",
            "level_name",
            "shift",
            "joining_date",
            "is_currently_active",
            "can_assign_class_teachers",
            "employee_code",
            "created_at",
            "updated_at",
        ]

    def get_assigned_levels_details(self, obj):
        levels = getattr(obj, 'assigned_levels', None)
        if not levels:
            return []
        try:
            qs = obj.assigned_levels.all()
            return [
                {
                    'id': lvl.id,
                    'name': lvl.name,
                    'shift': lvl.shift,
                    'shift_display': lvl.get_shift_display(),
                    'code': lvl.code,
                }
                for lvl in qs
            ]
        except Exception:
            return []
