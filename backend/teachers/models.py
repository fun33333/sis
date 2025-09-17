from django.db import models
from campus.models import Campus

# Choices
GENDER_CHOICES = [
    ("male", "Male"),
    ("female", "Female"),
    ("other", "Other"),
]

MARITAL_STATUS_CHOICES = [
    ("single", "Single"),
    ("married", "Married"),
    ("divorced", "Divorced"),
    ("widowed", "Widowed"),
]

SAVE_STATUS_CHOICES = [
    ("draft", "Draft"),
    ("final", "Final"),
]

class Teacher(models.Model):
    full_name = models.CharField(max_length=150)
    dob = models.DateField(verbose_name="Date of Birth")
    gender = models.CharField(max_length=10, choices=GENDER_CHOICES)
    contact_number = models.CharField(max_length=20)
    email = models.EmailField(unique=True)
    permanent_address = models.TextField()
    current_address = models.TextField(blank=True, null=True)
    marital_status = models.CharField(max_length=20, choices=MARITAL_STATUS_CHOICES, blank=True, null=True)
    save_status = models.CharField(max_length=10, choices=SAVE_STATUS_CHOICES, default="draft")
    date_created = models.DateTimeField(auto_now_add=True)
    date_updated = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.full_name

class TeacherEducation(models.Model):
    teacher = models.ForeignKey(Teacher, on_delete=models.CASCADE, related_name="educations")
    level = models.CharField(max_length=100)
    institution_name = models.CharField(max_length=200)
    year_of_passing = models.IntegerField()
    subjects = models.CharField(max_length=200, blank=True, null=True)
    grade = models.CharField(max_length=50, blank=True, null=True)

    def __str__(self):
        return f"{self.teacher.full_name} - {self.level}"

class TeacherExperience(models.Model):
    teacher = models.ForeignKey(Teacher, on_delete=models.CASCADE, related_name="experiences")
    institution_name = models.CharField(max_length=200)
    position = models.CharField(max_length=150)
    from_date = models.DateField()
    to_date = models.DateField(blank=True, null=True)
    subjects_classes_taught = models.CharField(max_length=200, blank=True, null=True)
    responsibilities = models.TextField(blank=True, null=True)
    total_years = models.DecimalField(max_digits=5, decimal_places=2, blank=True, null=True)

    def __str__(self):
        return f"{self.teacher.full_name} - {self.institution_name}"

class TeacherRole(models.Model):
    teacher = models.ForeignKey(Teacher, on_delete=models.CASCADE, related_name="roles")
    role_title = models.CharField(max_length=150)
    campus = models.ForeignKey(Campus, on_delete=models.CASCADE, related_name="teacher_roles")
    subjects = models.CharField(max_length=200, blank=True, null=True)
    classes_taught = models.CharField(max_length=200, blank=True, null=True)
    extra_responsibilities = models.TextField(blank=True, null=True)
    start_date = models.DateField(blank=True, null=True)
    end_date = models.DateField(blank=True, null=True)
    is_active = models.BooleanField(default=True)

    def __str__(self):
        return f"{self.teacher.full_name} - {self.role_title} ({self.campus.name})"
