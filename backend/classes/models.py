from django.db import models
from django.utils.crypto import get_random_string
from django.core.exceptions import ValidationError
from django.db.models import Q

# Teacher model assumed in 'teachers' app
TEACHER_MODEL = "teachers.Teacher"

# Level choices
LEVEL_CHOICES = [
    ('Pre-Primary', 'Pre-Primary'),
    ('Primary', 'Primary'),
    ('Secondary', 'Secondary'),
]

# Shift choices
SHIFT_CHOICES = [
    ('morning', 'Morning'),
    ('afternoon', 'Afternoon'),
    ('both', 'Morning + Afternoon'),
    ('all', 'All Shifts'),
]

# ----------------------
class Level(models.Model):
    """
    School levels: Pre-Primary, Primary, Secondary, etc.
    Now includes shift information for better organization.
    """
    name = models.CharField(
        max_length=50, 
        choices=LEVEL_CHOICES,
        help_text="Select educational level"
    )
    shift = models.CharField(
        max_length=20,
        choices=SHIFT_CHOICES,
        default='morning',
        help_text="Shift for this level"
    )
    code = models.CharField(max_length=25, unique=True, blank=True, null=True, editable=False)
    
    # Campus connection
    campus = models.ForeignKey(
        'campus.Campus',
        on_delete=models.CASCADE,
        related_name='levels',
        help_text="Campus this level belongs to"
    )
    
    # Coordinator relationship is handled via Coordinator.level field
    # This avoids circular dependencies
    coordinator_assigned_at = models.DateTimeField(null=True, blank=True)

    def save(self, *args, **kwargs):
        if not self.code:
            campus_code = self.campus.campus_code
            level_mapping = {
                'Pre-Primary': 'L1',
                'Primary': 'L2', 
                'Secondary': 'L3'
            }
            level_num = level_mapping.get(self.name, 'L1')
            shift_code = self.shift[0].upper()  # M for morning, A for afternoon, etc.
            self.code = f"{campus_code}-{level_num}-{shift_code}"
        super().save(*args, **kwargs)

    class Meta:
        unique_together = ("campus", "name", "shift")
    
    def __str__(self):
        return f"{self.name}-{self.shift.title()} ({self.campus.campus_name})"
    
    @property
    def coordinator(self):
        """Get the coordinator assigned to this level"""
        return self.coordinator_set.first()
    
    @property
    def coordinator_name(self):
        """Get coordinator name for display"""
        coord = self.coordinator
        return f"{coord.full_name} ({coord.employee_code})" if coord else None

# ----------------------
class Grade(models.Model):
    """
    Top-level grade (e.g., Grade 1, Grade 2)
    """
    name = models.CharField(max_length=50)
    code = models.CharField(max_length=25, unique=True, blank=True, null=True, editable=False)
    
    # Level connection
    level = models.ForeignKey(
        Level,
        on_delete=models.CASCADE,
        related_name='grade_set',
        help_text="Level this grade belongs to"
    )

    def save(self, *args, **kwargs):
        if not self.code and self.level:
            level_code = self.level.code
            grade_mapping = {
                'Nursery': 'N',
                'KG-I': 'KG1',
                'KG-II': 'KG2',
                'Grade-1': 'G01',
                'Grade-2': 'G02',
                'Grade-3': 'G03',
                'Grade-4': 'G04',
                'Grade-5': 'G05',
                'Grade-6': 'G06',
                'Grade-7': 'G07',
                'Grade-8': 'G08',
                'Grade-9': 'G09',
                'Grade-10': 'G10',
                'Special Class': 'SC',
            }
            grade_code = grade_mapping.get(self.name, self.name[:3].upper())
            self.code = f"{level_code}-{grade_code}"
        super().save(*args, **kwargs)

    class Meta:
        unique_together = ("level", "name")
    
    def __str__(self):
        return f"{self.name} ({self.level.campus.campus_name})"

# ----------------------
class ClassRoom(models.Model):
    """
    Represents a specific class (Grade + Section)
    Example: "Grade 1 - A"
    """
    SECTION_CHOICES = [(c, c) for c in ("A", "B", "C", "D", "E")]

    grade = models.ForeignKey(Grade, related_name="classrooms", on_delete=models.CASCADE)
    section = models.CharField(max_length=3, choices=SECTION_CHOICES)
    
    # Shift information
    shift = models.CharField(
        max_length=20,
        choices=[
            ('morning', 'Morning'),
            ('afternoon', 'Afternoon'),
            ('both', 'Morning + Afternoon'),
            ('all', 'All Shifts')
        ],
        default='morning',
        help_text="Shift for this classroom"
    )
    
    # FIXED: Changed to OneToOneField to ensure one teacher per classroom
    class_teacher = models.OneToOneField(
        TEACHER_MODEL, 
        null=True, 
        blank=True, 
        on_delete=models.SET_NULL,
        related_name='assigned_classroom_teacher',
        help_text="Class teacher for this classroom (one teacher per classroom only)"
    )
    capacity = models.PositiveIntegerField(default=30)
    code = models.CharField(max_length=30, unique=True, editable=False)
    
    # Assignment tracking
    assigned_by = models.ForeignKey(
        'users.User',
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
        related_name='classroom_assignments_made',
        help_text="User who assigned the class teacher"
    )
    assigned_at = models.DateTimeField(null=True, blank=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ("grade", "section", "shift")
        ordering = ("grade__name", "section", "shift")

    def __str__(self):
        return f"{self.grade.name} - {self.section}"

    def get_display_code_components(self):
        # Use grade code if available, otherwise generate from name
        if self.grade and self.grade.code:
            grade_code = self.grade.code
        else:
            grade_code = "".join(self.grade.name.split()).upper()
        return grade_code, self.section

    def get_expected_coordinator(self):
        """Get the coordinator that should be assigned for this classroom"""
        if self.grade and self.grade.level and self.campus:
            from coordinator.models import Coordinator
            return Coordinator.objects.filter(
                level=self.grade.level,
                campus=self.campus,
                is_currently_active=True
            ).first()
        return None

    def save(self, *args, **kwargs):
        if not self.code and self.grade:
            grade_code = self.grade.code
            section = self.section
            self.code = f"{grade_code}-{section}"
        super().save(*args, **kwargs)
    
    # Properties for easy access
    @property
    def level(self):
        return self.grade.level if self.grade else None
    
    @property
    def campus(self):
        return self.grade.level.campus if self.grade and self.grade.level else None
    
    def get_students_for_teacher(self, teacher):
        """
        Get students assigned to this classroom for a specific teacher
        Only returns students from the same campus as the teacher
        """
        if not teacher or not teacher.current_campus:
            return self.students.none()
        
        return self.students.filter(
            campus=teacher.current_campus,
            is_draft=False
        )
    
    def get_available_students_for_assignment(self):
        """
        Get students from same campus and grade who can be assigned to this classroom
        """
        if not self.campus or not self.grade:
            return Student.objects.none()
        
        from students.models import Student
        
        # Normalize grade names for matching
        grade_name_variations = [
            self.grade.name,
            self.grade.name.replace('-', ' '),  # Grade-4 -> Grade 4
            self.grade.name.replace(' ', '-'),  # Grade 4 -> Grade-4
        ]
        
        grade_query = Q()
        for grade_var in grade_name_variations:
            grade_query |= Q(current_grade__icontains=grade_var)
        
        return Student.objects.filter(
            campus=self.campus,
            is_draft=False
        ).filter(grade_query).filter(
            Q(classroom__isnull=True) | Q(classroom=self)
        )