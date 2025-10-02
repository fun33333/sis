from django.db import models
from django.utils.crypto import get_random_string

# Teacher model assumed in 'teachers' app
TEACHER_MODEL = "teachers.Teacher"


class Grade(models.Model):
    """
    Top-level grade (e.g., Grade 1, Grade 2).
    """
    name = models.CharField(max_length=50, unique=True)  # Example: "Grade 1"
    short_code = models.CharField(
        max_length=10,
        blank=True,
        null=True,
        help_text="Short code used in generated codes (optional)"
    )

    def __str__(self):
        return self.name


class ClassRoom(models.Model):
    """
    Represents a specific class (Grade + Section).
    Example: "Grade 1 - A"
    - grade: dropdown (foreign key)
    - section: choices (A, B, C, ...)
    - class_teacher: optional FK to Teacher
    - capacity: maximum number of students allowed
    - code: auto-generated unique class code
    """
    SECTION_CHOICES = [(c, c) for c in ("A", "B", "C", "D", "E")]

    grade = models.ForeignKey(Grade, related_name="classrooms", on_delete=models.CASCADE)
    section = models.CharField(max_length=3, choices=SECTION_CHOICES)
    class_teacher = models.ForeignKey(
        TEACHER_MODEL, null=True, blank=True, on_delete=models.SET_NULL
    )
    capacity = models.PositiveIntegerField(
        default=30,
        help_text="Maximum number of students allowed in this classroom"
    )
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
