# from django.contrib import admin
# from .models import Coordinator

# @admin.register(Coordinator)
# class CoordinatorAdmin(admin.ModelAdmin):
#     list_display = (
#         "full_name",
#         "email",
#         "phone",
#         "gender",
#         "level",        # section → level
#         "campus",
#         "is_active",
#         "created_at",
#     )
#     list_filter = ("level", "campus", "is_active", "gender")  # section → level
#     search_fields = ("full_name", "email", "phone", "cnic")
#     ordering = ("-created_at",)

#     # Ab sirf simple ForeignKey fields ko autocomplete me daalenge
#     autocomplete_fields = ("campus", "level")  # grades/classes/teachers/students hata diye


from django.contrib import admin
from .models import Coordinator

@admin.register(Coordinator)
class CoordinatorAdmin(admin.ModelAdmin):
    list_display = (
        "full_name",
        "email",
        "phone",
        "gender",
        "level",
        "campus",
        "is_active",
        "created_at",
    )
    list_filter = ("level", "campus", "is_active", "gender")
    search_fields = ("full_name", "email", "phone", "cnic")
    ordering = ("-created_at",)
    autocomplete_fields = ("campus",)  # Level ko simple dropdown me rakha
