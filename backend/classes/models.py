from django.db import models
from django.utils.crypto import get_random_string

# Teacher model assumed in 'teachers' app
TEACHER_MODEL = "teachers.Teacher"

# ----------------------
class Level(models.Model):
    """
    School levels: Pre-Primary, Primary, Secondary, etc.
    """
    name = models.CharField(max_length=50, unique=True)
    short_code = models.CharField(max_length=10, blank=True, null=True)
    code = models.CharField(max_length=10, unique=True, blank=True, null=True, editable=False)
    
    # Campus connection
    campus = models.ForeignKey(
        'campus.Campus',
        on_delete=models.CASCADE,
        related_name='levels',
        help_text="Campus this level belongs to"
    )
    
    # Coordinator (1 per campus per level) - FIXED
    coordinator = models.OneToOneField(
        'coordinator.Coordinator',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='assigned_level_coordinator',
        help_text="Coordinator for this level"
    )

    def save(self, *args, **kwargs):
        if not self.code:
            base = self.short_code or "".join(self.name.split()).upper()[:5]
            suffix = 1
            new_code = f"{base}{suffix}"
            while Level.objects.filter(code=new_code).exists():
                suffix += 1
                new_code = f"{base}{suffix}"
            self.code = new_code
        super().save(*args, **kwargs)

    def __str__(self):
        return self.name

# ----------------------
class Grade(models.Model):
    """
    Top-level grade (e.g., Grade 1, Grade 2)
    """
    name = models.CharField(max_length=50, unique=True)
    short_code = models.CharField(max_length=10, blank=True, null=True)
    
    # Level connection
    level = models.ForeignKey(
        Level,
        on_delete=models.CASCADE,
        related_name='grade_set',
        help_text="Level this grade belongs to"
    )

    def __str__(self):
        return self.name

# ----------------------
class ClassRoom(models.Model):
    """
    Represents a specific class (Grade + Section)
    Example: "Grade 1 - A"
    """
    SECTION_CHOICES = [(c, c) for c in ("A", "B", "C", "D", "E")]

    grade = models.ForeignKey(Grade, related_name="classrooms", on_delete=models.CASCADE)
    section = models.CharField(max_length=3, choices=SECTION_CHOICES)
    class_teacher = models.ForeignKey(
        TEACHER_MODEL, 
        null=True, 
        blank=True, 
        on_delete=models.SET_NULL,
        related_name='assigned_classroom_teacher'
    )
    capacity = models.PositiveIntegerField(default=30)
    code = models.CharField(max_length=30, unique=True, editable=False)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ("grade", "section")
        ordering = ("grade__name", "section")

    def __str__(self):
        return f"{self.grade.name} - {self.section}"

    def get_display_code_components(self):
        grade_code = self.grade.short_code or "".join(self.grade.name.split()).upper()
        return grade_code, self.section

    def save(self, *args, **kwargs):
        if not self.code:
            grade_code, section = self.get_display_code_components()
            suffix = get_random_string(4).upper()
            self.code = f"{grade_code}-{section}-{suffix}"
            while ClassRoom.objects.filter(code=self.code).exists():
                suffix = get_random_string(4).upper()
                self.code = f"{grade_code}-{section}-{suffix}"
        super().save(*args, **kwargs)
    
    # Properties for easy access
    @property
    def level(self):
        return self.grade.level if self.grade else None
    
    @property
    def campus(self):
        return self.grade.level.campus if self.grade and self.grade.level else None
