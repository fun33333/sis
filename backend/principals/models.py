from django.db import models
from campus.models import Campus

# Choices
GENDER_CHOICES = [
    ("male", "Male"),
    ("female", "Female"),
    ("other", "Other"),
]

class Principal(models.Model):
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
    campus = models.ForeignKey(Campus, on_delete=models.CASCADE)
    joining_date = models.DateField()
    is_currently_active = models.BooleanField(default=True)
    
    # System Fields
    employee_code = models.CharField(max_length=20, unique=True, editable=False, blank=True, null=True, default='')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
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