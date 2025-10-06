from django.contrib import admin
from .models import ClassRoom, Grade, Level

# ----------------------
@admin.register(Level)
class LevelAdmin(admin.ModelAdmin):
    list_display = ("name", "short_code", "code", "campus", "coordinator")
    list_filter = ("campus",)
    search_fields = ("name", "short_code", "code")
    # REMOVED: filter_horizontal = ("grades",)  # This field doesn't exist anymore

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
    list_display = ("name", "short_code", "level", "campus_display")
    list_filter = ("level", "level__campus")
    search_fields = ("name", "short_code")
    
    def campus_display(self, obj):
        return obj.level.campus.campus_name if obj.level and obj.level.campus else '-'
    campus_display.short_description = 'Campus'

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
    list_display = ("grade", "section", "class_teacher", "capacity", "code", "campus_display")
    list_filter = ("grade", "class_teacher", "capacity", "grade__level__campus")
    search_fields = ("grade__name", "section", "class_teacher__full_name", "code")
    autocomplete_fields = ("class_teacher",)
    
    def campus_display(self, obj):
        return obj.campus.campus_name if obj.campus else '-'
    campus_display.short_description = 'Campus'
    
    def get_queryset(self, request):
        return super().get_queryset(request).select_related('grade', 'class_teacher', 'grade__level__campus')
