# subjects/models.py
from django.db import models
from django.utils.crypto import get_random_string

GRADE_MODEL = "classes.Grade"
TEACHER_MODEL = "teachers.Teacher"


class Subject(models.Model):
    """
    Represents a subject for a specific grade.
    Example: "English" for Grade 1 is a separate record from "English" for Grade 2.
    """

    grade = models.ForeignKey(GRADE_MODEL, related_name="subjects", on_delete=models.CASCADE)
    name = models.CharField(max_length=100)
    code = models.CharField(max_length=30, unique=True, editable=False)
    teacher = models.ForeignKey(TEACHER_MODEL, null=True, blank=True, on_delete=models.SET_NULL)

    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ("grade", "name")
        ordering = ("grade__name", "name")

    def __str__(self):
        return f"{self.name} ({self.grade.name})"

    def save(self, *args, **kwargs):
        if not self.code:
            # Example: G1-ENG-AB12
            grade_part = (self.grade.short_code or "".join(self.grade.name.split())).upper()
            name_part = "".join([p[0] for p in self.name.split()])[:4].upper()
            suffix = get_random_string(4).upper()
            self.code = f"{grade_part}-{name_part}-{suffix}"

            # ensure uniqueness
            while Subject.objects.filter(code=self.code).exists():
                suffix = get_random_string(4).upper()
                self.code = f"{grade_part}-{name_part}-{suffix}"
        super().save(*args, **kwargs)
