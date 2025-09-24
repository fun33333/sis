from django.contrib import admin
from .models import Teacher, TeacherEducation, TeacherExperience, TeacherRole

# Teacher
@admin.register(Teacher)
class TeacherAdmin(admin.ModelAdmin):
    list_display = ("full_name", "gender", "contact_number", "email", "save_status")
    search_fields = ("full_name", "email", "contact_number")
    list_filter = ("gender", "marital_status", "save_status")

# Teacher Education
@admin.register(TeacherEducation)
class TeacherEducationAdmin(admin.ModelAdmin):
    list_display = ("teacher", "level", "institution_name", "year_of_passing")
    search_fields = ("teacher__full_name", "institution_name")
    list_filter = ("level",)

# Teacher Experience
@admin.register(TeacherExperience)
class TeacherExperienceAdmin(admin.ModelAdmin):
    list_display = ("teacher", "institution_name", "position", "from_date", "to_date")
    search_fields = ("teacher__full_name", "institution_name", "position")
    list_filter = ("from_date", "to_date")

# Teacher Role
@admin.register(TeacherRole)
class TeacherRoleAdmin(admin.ModelAdmin):
    list_display = ("teacher", "role_title", "campus", "is_active")
    search_fields = ("teacher__full_name", "role_title")
    list_filter = ("campus", "is_active")
