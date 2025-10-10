from django.db import models
from campus.models import Campus
from classes.models import Level

# Choices
GENDER_CHOICES = [
    ("male", "Male"),
    ("female", "Female"),
    ("other", "Other"),
]

class Coordinator(models.Model):
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
    level = models.ForeignKey(
        'classes.Level', 
        on_delete=models.CASCADE,
        related_name='coordinator_set'
    )
    joining_date = models.DateField()
    is_currently_active = models.BooleanField(default=True)
    
    # Add permission to assign class teachers
    can_assign_class_teachers = models.BooleanField(default=True, help_text="Can this coordinator assign class teachers?")
    
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
                    self.campus, 'morning', year, 'coordinator'
                )
            except Exception as e:
                print(f"Error generating employee code: {str(e)}")
        
        super().save(*args, **kwargs)
    
    def get_assigned_teachers(self):
        """
        Get all teachers assigned to this coordinator through level -> grades -> classrooms
        """
        from teachers.models import Teacher
        from classes.models import ClassRoom
        
        # Get all classrooms under this coordinator's level
        classrooms = ClassRoom.objects.filter(
            grade__level=self.level
        ).select_related('class_teacher')
        
        # Get teachers from those classrooms
        teachers = []
        for classroom in classrooms:
            if classroom.class_teacher:
                teachers.append(classroom.class_teacher)
        
        return teachers
    
    def get_assigned_teachers_count(self):
        """Get count of assigned teachers"""
        return len(self.get_assigned_teachers())
    
    def get_assigned_classrooms(self):
        """Get all classrooms under this coordinator's level"""
        from classes.models import ClassRoom
        return ClassRoom.objects.filter(
            grade__level=self.level
        ).select_related('grade', 'class_teacher')

    def __str__(self):
        return f"{self.full_name} ({self.employee_code})"