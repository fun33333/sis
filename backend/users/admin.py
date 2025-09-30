from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from django.utils.translation import gettext_lazy as _
from .models import User


@admin.register(User)
class UserAdmin(BaseUserAdmin):
    ordering = ("email",)
    list_display = (
        "email",
        "username",
        "first_name",
        "last_name",
        "role",
        "campus",
        "is_staff",
        "is_superuser",
        "is_active",
    )
    list_filter = ("role", "is_staff", "is_superuser", "is_active", "campus")
    search_fields = ("email", "username", "first_name", "last_name")

    fieldsets = (
        (None, {"fields": ("email", "password")}),
        (_("Personal info"), {"fields": ("username", "first_name", "last_name", "phone_number")}),
        (
            _("Roles and access"),
            {"fields": ("role", "campus", "is_active", "is_staff", "is_superuser", "is_verified")},
        ),
        (_("Important dates"), {"fields": ("last_login", "date_joined")}),
    )

    add_fieldsets = (
        (
            None,
            {
                "classes": ("wide",),
                "fields": (
                    "email",
                    "username",
                    "role",
                    "campus",
                    "password1",
                    "password2",
                    "is_staff",
                    "is_superuser",
                    "is_active",
                ),
            },
        ),
    )

    readonly_fields = ("last_login",)
