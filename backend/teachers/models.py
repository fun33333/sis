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
    # Personal Information
    full_name = models.CharField(max_length=150)
    dob = models.DateField(verbose_name="Date of Birth")
    gender = models.CharField(max_length=10, choices=GENDER_CHOICES)
    contact_number = models.CharField(max_length=20)
    email = models.EmailField(unique=True)
    permanent_address = models.TextField()
    current_address = models.TextField(blank=True, null=True)
    marital_status = models.CharField(max_length=20, choices=MARITAL_STATUS_CHOICES, blank=True, null=True)
    
    # Education Information
    education_level = models.CharField(max_length=100, blank=True, null=True)
    institution_name = models.CharField(max_length=200, blank=True, null=True)
    year_of_passing = models.IntegerField(blank=True, null=True)
    education_subjects = models.CharField(max_length=200, blank=True, null=True)
    education_grade = models.CharField(max_length=50, blank=True, null=True)
    
    # Additional Education Fields
    additional_education_level = models.CharField(max_length=100, blank=True, null=True)
    additional_institution_name = models.CharField(max_length=200, blank=True, null=True)
    additional_year_of_passing = models.IntegerField(blank=True, null=True)
    additional_education_subjects = models.CharField(max_length=200, blank=True, null=True)
    additional_education_grade = models.CharField(max_length=50, blank=True, null=True)
    
    # Experience Information
    previous_institution_name = models.CharField(max_length=200, blank=True, null=True)
    previous_position = models.CharField(max_length=150, blank=True, null=True)
    experience_from_date = models.DateField(blank=True, null=True)
    experience_to_date = models.DateField(blank=True, null=True)
    experience_subjects_classes_taught = models.CharField(max_length=200, blank=True, null=True)
    previous_responsibilities = models.TextField(blank=True, null=True)
    total_experience_years = models.DecimalField(max_digits=5, decimal_places=2, blank=True, null=True)
    
    # Additional Experience Fields
    additional_institution_name_exp = models.CharField(max_length=200, blank=True, null=True)
    additional_position = models.CharField(max_length=150, blank=True, null=True)
    additional_experience_from_date = models.DateField(blank=True, null=True)
    additional_experience_to_date = models.DateField(blank=True, null=True)
    additional_experience_subjects_classes = models.CharField(max_length=200, blank=True, null=True)
    additional_responsibilities = models.TextField(blank=True, null=True)
    
    # Current Role Information
    current_role_title = models.CharField(max_length=150, blank=True, null=True)
    current_campus = models.ForeignKey(Campus, on_delete=models.CASCADE, related_name="teachers", blank=True, null=True)
    current_subjects = models.CharField(max_length=200, blank=True, null=True)
    current_classes_taught = models.CharField(max_length=200, blank=True, null=True)
    current_extra_responsibilities = models.TextField(blank=True, null=True)
    role_start_date = models.DateField(blank=True, null=True)
    role_end_date = models.DateField(blank=True, null=True)
    is_currently_active = models.BooleanField(default=True)
    
    # Auto Generated Fields
    teacher_id = models.CharField(max_length=20, unique=True, editable=False, null=True, blank=True)
    employee_code = models.CharField(max_length=20, unique=True, editable=False, null=True, blank=True)
    
    # System Fields
    save_status = models.CharField(max_length=10, choices=SAVE_STATUS_CHOICES, default="draft")
    
    # --- ID Generation Fields ---
    teacher_id = models.CharField(max_length=20, unique=True, null=True, blank=True)  # C01-M-25-T-0045
    joining_year = models.IntegerField(null=True, blank=True)  # Year when teacher joined
    teacher_number = models.IntegerField(null=True, blank=True)  # Sequential number for the year
    shift = models.CharField(max_length=10, null=True, blank=True)  # M=Morning, E=Evening
    campus = models.ForeignKey(Campus, on_delete=models.SET_NULL, null=True, blank=True)
    
    # --- System Fields ---
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
        return f"{self.full_name} ({self.teacher_id or 'No ID'})"

    class Meta:
        verbose_name = "Teacher"
        verbose_name_plural = "Teachers"
        ordering = ['-date_created']
