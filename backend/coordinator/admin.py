# backend/coordinator/admin.py
from django.contrib import admin
from django.core.exceptions import ValidationError
from django.utils.html import format_html
from .models import Coordinator

@admin.register(Coordinator)
class CoordinatorAdmin(admin.ModelAdmin):
    list_display = (
        "full_name",
        "email",
        "contact_number",  # Changed from "phone"
        "gender",
        "level",
        "campus",
        "assigned_teachers_count",
        "is_currently_active",  # Changed from "is_active"
        "created_at",
    )
    list_filter = ("level", "campus", "is_currently_active", "gender")  # Changed from "is_active"
    search_fields = ("full_name", "email", "contact_number", "cnic")  # Changed from "phone"
    ordering = ("-created_at",)
    autocomplete_fields = ("campus",)  # Level ko simple dropdown me rakha
    
    def assigned_teachers_count(self, obj):
        """Display count of assigned teachers"""
        count = obj.get_assigned_teachers_count()
        return f"{count} teachers"
    assigned_teachers_count.short_description = "Assigned Teachers"
    assigned_teachers_count.admin_order_field = "level"
    
    def get_queryset(self, request):
        """Optimize queryset with select_related"""
        return super().get_queryset(request).select_related('level', 'campus')
    
    def change_view(self, request, object_id, form_url='', extra_context=None):
        """Add assigned teachers to context"""
        extra_context = extra_context or {}
        if object_id:
            coordinator = self.get_object(request, object_id)
            if coordinator:
                extra_context['assigned_teachers'] = coordinator.get_assigned_teachers()
                extra_context['assigned_classrooms'] = coordinator.get_assigned_classrooms()
        return super().change_view(request, object_id, form_url, extra_context)

    def clean_email(self):
        email = self.cleaned_data.get('email')
        if email and Coordinator.objects.filter(email=email).exclude(pk=self.pk).exists():
            raise ValidationError("A coordinator with this email already exists.")
        return email