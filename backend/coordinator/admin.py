# backend/coordinator/admin.py
from django.contrib import admin
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