from django.contrib import admin
from .models import Grade, ClassRoom

@admin.register(Grade)
class GradeAdmin(admin.ModelAdmin):
    list_display = ("name", "short_code")
    search_fields = ("name", "short_code")


@admin.register(ClassRoom)
class ClassRoomAdmin(admin.ModelAdmin):
    list_display = ("code", "grade", "section", "class_teacher")
    list_filter = ("grade", "section")
    search_fields = ("code", "grade__name", "section", "class_teacher__user__username")
    readonly_fields = ("code",)
