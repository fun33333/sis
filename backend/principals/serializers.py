from rest_framework import serializers
from .models import Principal
from campus.serializers import CampusSerializer


class PrincipalSerializer(serializers.ModelSerializer):
    # Nested serializers for related objects
    campus_data = CampusSerializer(source='campus', read_only=True)
    
    # Computed fields
    campus_name = serializers.CharField(source='campus.campus_name', read_only=True)
    shift_display = serializers.CharField(source='get_shift_display', read_only=True)
    
    class Meta:
        model = Principal
        fields = [
            'id', 'user', 'full_name', 'dob', 'gender', 'contact_number', 'email', 
            'cnic', 'permanent_address', 'education_level', 'institution_name', 
            'year_of_passing', 'total_experience_years', 'campus', 'campus_data', 
            'campus_name', 'shift', 'shift_display', 'joining_date', 
            'is_currently_active', 'employee_code', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'employee_code', 'created_at', 'updated_at']
