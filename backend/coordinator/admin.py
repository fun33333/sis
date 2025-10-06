# backend/coordinator/admin.py
from django.contrib import admin
from django.core.exceptions import ValidationError
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
        "is_currently_active",  # Changed from "is_active"
        "created_at",
    )
    list_filter = ("level", "campus", "is_currently_active", "gender")  # Changed from "is_active"
    search_fields = ("full_name", "email", "contact_number", "cnic")  # Changed from "phone"
    ordering = ("-created_at",)
    autocomplete_fields = ("campus",)  # Level ko simple dropdown me rakha

    def clean_email(self):
        email = self.cleaned_data.get('email')
        if email and Coordinator.objects.filter(email=email).exclude(pk=self.pk).exists():
            raise ValidationError("A coordinator with this email already exists.")
        return email