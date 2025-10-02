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
    grades = models.ManyToManyField("Grade", blank=True, related_name="levels")
    code = models.CharField(max_length=10, unique=True, blank=True, null=True, editable=False)  # Auto code

    def save(self, *args, **kwargs):
        if not self.code:
            # Generate code from short_code or name
            base = self.short_code or "".join(self.name.split()).upper()[:5]  # Max 5 chars
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
        TEACHER_MODEL, null=True, blank=True, on_delete=models.SET_NULL
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
