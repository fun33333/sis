import django_filters
from django.db.models import Q
from .models import Teacher
from campus.models import Campus
from coordinator.models import Coordinator


class TeacherFilter(django_filters.FilterSet):
    """Filter for Teacher model with comprehensive filtering options"""
    
    # Basic filters
    current_campus = django_filters.ModelChoiceFilter(
        queryset=Campus.objects.all(),
        field_name='current_campus',
        help_text="Filter by current campus"
    )
    
    shift = django_filters.CharFilter(
        field_name='shift',
        lookup_expr='icontains',
        help_text="Filter by shift"
    )
    
    is_currently_active = django_filters.BooleanFilter(
        field_name='is_currently_active',
        help_text="Filter by active status"
    )
    
    assigned_coordinator = django_filters.ModelChoiceFilter(
        queryset=Coordinator.objects.all(),
        field_name='assigned_coordinator',
        help_text="Filter by assigned coordinator"
    )
    
    is_class_teacher = django_filters.BooleanFilter(
        field_name='is_class_teacher',
        help_text="Filter by class teacher status"
    )
    
    # Subject and class filters
    current_subjects = django_filters.CharFilter(
        field_name='current_subjects',
        lookup_expr='icontains',
        help_text="Filter by subjects taught"
    )
    
    current_classes_taught = django_filters.CharFilter(
        field_name='current_classes_taught',
        lookup_expr='icontains',
        help_text="Filter by classes taught"
    )
    
    # Date range filters
    joining_date_after = django_filters.DateFilter(
        field_name='joining_date',
        lookup_expr='gte',
        help_text="Teachers who joined after this date"
    )
    
    joining_date_before = django_filters.DateFilter(
        field_name='joining_date',
        lookup_expr='lte',
        help_text="Teachers who joined before this date"
    )
    
    # Experience filters
    min_experience = django_filters.NumberFilter(
        field_name='total_experience_years',
        lookup_expr='gte',
        help_text="Minimum years of experience"
    )
    
    max_experience = django_filters.NumberFilter(
        field_name='total_experience_years',
        lookup_expr='lte',
        help_text="Maximum years of experience"
    )
    
    # Search functionality
    search = django_filters.CharFilter(
        method='filter_search',
        help_text="Search in name, employee_code, email, contact_number"
    )
    
    def filter_search(self, queryset, name, value):
        """Custom search method for multiple fields"""
        if not value:
            return queryset
            
        return queryset.filter(
            Q(full_name__icontains=value) |
            Q(employee_code__icontains=value) |
            Q(email__icontains=value) |
            Q(contact_number__icontains=value) |
            Q(current_subjects__icontains=value)
        )
    
    class Meta:
        model = Teacher
        fields = [
            'current_campus', 'shift', 'is_currently_active', 
            'assigned_coordinator', 'is_class_teacher', 'current_subjects',
            'current_classes_taught', 'joining_date_after', 'joining_date_before',
            'min_experience', 'max_experience'
        ]
