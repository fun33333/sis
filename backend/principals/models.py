from django.db import models
from django.contrib.auth import get_user_model
from campus.models import Campus

User = get_user_model()

# Choices
GENDER_CHOICES = [
    ("male", "Male"),
    ("female", "Female"),
    ("other", "Other"),
]

SHIFT_CHOICES = [
    ("morning", "Morning"),
    ("afternoon", "Afternoon"),
    ("both", "Morning + Afternoon"),
    ("all", "All Shifts"),
]

class Principal(models.Model):
    # User relationship
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='principal_profile', null=True, blank=True)
    
    # Personal Information
    full_name = models.CharField(max_length=150)
    dob = models.DateField()
    gender = models.CharField(max_length=10, choices=GENDER_CHOICES)
    contact_number = models.CharField(max_length=20)
    email = models.EmailField(unique=True)
    cnic = models.CharField(max_length=15, unique=True)
    permanent_address = models.TextField()
    
    # Professional Information
    education_level = models.CharField(max_length=100)
    institution_name = models.CharField(max_length=200)
    year_of_passing = models.IntegerField()
    total_experience_years = models.PositiveIntegerField()
    
    # Work Assignment
    campus = models.ForeignKey(Campus, on_delete=models.SET_NULL, null=True, blank=True)
    shift = models.CharField(
        max_length=20, 
        choices=SHIFT_CHOICES,
        default='morning',
        help_text="Principal's working shift"
    )
    joining_date = models.DateField()
    is_currently_active = models.BooleanField(default=True)
    
    # System Fields
    employee_code = models.CharField(max_length=20, unique=True, editable=False, blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def save(self, *args, **kwargs):
        # Auto-generate employee_code if not provided
        if not self.employee_code and self.campus:
            try:
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
                    self.campus, self.shift, year, 'principal'
                )
            except Exception as e:
                print(f"Error generating employee code: {str(e)}")
        
        super().save(*args, **kwargs)
    
    def __str__(self):
        return f"{self.full_name} ({self.employee_code})"

    class Meta:
        verbose_name = "Principal"
        verbose_name_plural = "Principals"
        ordering = ['-created_at']
        constraints = [
            # Ensure only one principal per campus
            models.UniqueConstraint(
                fields=['campus'],
                name='unique_principal_per_campus'
            )
        ]