from django.contrib import admin
from .models import Level, Grade, ClassRoom
from coordinator.models import Coordinator

# ----------------------
@admin.register(Level)
class LevelAdmin(admin.ModelAdmin):
    list_display = ("name", "short_code")
    search_fields = ("name", "short_code")
    filter_horizontal = ("grades",)


# ----------------------
# Coordinator filter for Grade
class GradeCoordinatorFilter(admin.SimpleListFilter):
    title = "Coordinator"
    parameter_name = "coordinator"

    def lookups(self, request, model_admin):
        return [(c.id, c.full_name) for c in Coordinator.objects.all()]

    def queryset(self, request, queryset):
        if self.value():
            try:
                coordinator = Coordinator.objects.get(id=self.value())
                return queryset.filter(levels=coordinator.level)
            except Coordinator.DoesNotExist:
                return queryset.none()
        return queryset


@admin.register(Grade)
class GradeAdmin(admin.ModelAdmin):
    list_display = ("name", "short_code")
    search_fields = ("name", "short_code")
    list_filter = (GradeCoordinatorFilter,)  # ✅ Grade ke liye


# ----------------------
# Coordinator filter for ClassRoom
class ClassRoomCoordinatorFilter(admin.SimpleListFilter):
    title = "Coordinator"
    parameter_name = "coordinator"

    def lookups(self, request, model_admin):
        return [(c.id, c.full_name) for c in Coordinator.objects.all()]

    def queryset(self, request, queryset):
        if self.value():
            try:
                coordinator = Coordinator.objects.get(id=self.value())
                # Coordinator ka level nikalo
                level = coordinator.level
                # Us level ke saare grades nikalo
                grades = Grade.objects.filter(levels=level)
                # Classroom ko filter karo unhi grades ke basis par
                return queryset.filter(grade__in=grades)
            except Coordinator.DoesNotExist:
                return queryset.none()
        return queryset


@admin.register(ClassRoom)
class ClassRoomAdmin(admin.ModelAdmin):
    list_display = ("grade", "section", "class_teacher", "capacity", "code")
    search_fields = ("grade__name", "section", "code")
    autocomplete_fields = ("grade", "class_teacher")
    list_filter = ("section", ClassRoomCoordinatorFilter)  # ✅ ClassRoom ke liye
