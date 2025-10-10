import django_filters
from django.db.models import Q
from .models import Coordinator
from campus.models import Campus


class CoordinatorFilter(django_filters.FilterSet):
    """Filter for Coordinator model with comprehensive filtering options"""
    
    # Basic filters
    campus = django_filters.ModelChoiceFilter(
        queryset=Campus.objects.all(),
        field_name='campus',
        help_text="Filter by campus"
    )
    
    is_currently_active = django_filters.BooleanFilter(
        field_name='is_currently_active',
        help_text="Filter by active status"
    )
    
    # Date range filters
    joining_date_after = django_filters.DateFilter(
        field_name='joining_date',
        lookup_expr='gte',
        help_text="Coordinators who joined after this date"
    )
    
    joining_date_before = django_filters.DateFilter(
        field_name='joining_date',
        lookup_expr='lte',
        help_text="Coordinators who joined before this date"
    )
    
    # Search functionality
    search = django_filters.CharFilter(
        method='filter_search',
        help_text="Search in name, employee_code, email"
    )
    
    def filter_search(self, queryset, name, value):
        """Custom search method for multiple fields"""
        if not value:
            return queryset
            
        return queryset.filter(
            Q(full_name__icontains=value) |
            Q(employee_code__icontains=value) |
            Q(email__icontains=value)
        )
    
    class Meta:
        model = Coordinator
        fields = [
            'campus', 'is_currently_active', 
            'joining_date_after', 'joining_date_before'
        ]
