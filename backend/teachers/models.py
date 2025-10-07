from django.db import models
from django.core.exceptions import ValidationError
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

class TeacherRole(models.Model):
    name = models.CharField(max_length=150)
    date_created = models.DateTimeField(auto_now_add=True)  # Added to fix ordering error

    class Meta:
        ordering = ['date_created']
        verbose_name = "Teacher Role"
        verbose_name_plural = "Teacher Roles"

    def __str__(self):
        return self.name


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
    cnic = models.CharField(max_length=15, unique=True, blank=True, null=True)

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
    joining_date = models.DateField(blank=True, null=True)
    current_role_title = models.CharField(max_length=150, blank=True, null=True)
    current_campus = models.ForeignKey(Campus, on_delete=models.CASCADE, related_name="teachers", blank=True, null=True)
    
    # Shift Information - NEW FIELD
    shift = models.CharField(
        max_length=20, 
        choices=[
            ('morning', 'Morning'),
            ('afternoon', 'Afternoon'),
            ('evening', 'Evening'),
        ],
        default='morning',
        help_text="Teacher's working shift"
    )
    
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
    date_created = models.DateTimeField(auto_now_add=True)
    date_updated = models.DateTimeField(auto_now=True)
    
    # Class Teacher Information - FIXED
    is_class_teacher = models.BooleanField(default=False, help_text="Is this teacher a class teacher?")
    assigned_classroom = models.OneToOneField(
        'classes.ClassRoom', 
        on_delete=models.SET_NULL, 
        null=True, 
        blank=True,
        related_name='class_teacher_teacher',  # FIXED: Changed related_name
        help_text="Classroom assigned to this class teacher (one classroom per teacher only)"
    )
    
    def clean(self):
        """
        Validate that teacher is not assigned to multiple classrooms
        """
        if self.assigned_classroom:
            # Check if this classroom already has a different teacher
            existing_teacher = Teacher.objects.filter(
                assigned_classroom=self.assigned_classroom
            ).exclude(pk=self.pk).first()
            
            if existing_teacher:
                raise ValidationError(
                    f"Classroom {self.assigned_classroom} is already assigned to {existing_teacher.full_name}. "
                    "One classroom can only have one teacher."
                )
    
    def save(self, *args, **kwargs):
        # Run validation
        self.clean()
        # Auto-generate employee_code (teacher_code) if not provided
        if not self.employee_code and self.current_campus:
            try:
                # Use teacher's shift field instead of campus shift
                shift = self.shift if self.shift else 'morning'
                
                # Get year from joining date or current year
                if self.joining_date:
                    if isinstance(self.joining_date, str):
                        from datetime import datetime
                        joining_date = datetime.strptime(self.joining_date, '%Y-%m-%d').date()
                        year = joining_date.year
                    else:
                        year = self.joining_date.year
                else:
                    year = 2025
                
                # Generate employee code using IDGenerator
                from utils.id_generator import IDGenerator
                self.employee_code = IDGenerator.generate_unique_employee_code(
                    self.current_campus, shift, year, 'teacher'
                )
            except Exception as e:
                print(f"Error generating employee code: {str(e)}")
        
        # FIX: Auto-set class teacher status when classroom is assigned
        if self.assigned_classroom and not self.is_class_teacher:
            self.is_class_teacher = True
            print(f"Setting {self.full_name} as class teacher")
        elif not self.assigned_classroom and self.is_class_teacher:
            self.is_class_teacher = False
            print(f"Removing class teacher status from {self.full_name}")
        
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.full_name} ({self.employee_code or 'No Code'})"

    class Meta:
        verbose_name = "Teacher"
        verbose_name_plural = "Teachers"
        ordering = ['-date_created'] 