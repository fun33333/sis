from django.db import models
from django.utils.crypto import get_random_string
from django.core.exceptions import ValidationError

# Teacher model assumed in 'teachers' app
TEACHER_MODEL = "teachers.Teacher"

# ----------------------
class Level(models.Model):
    """
    School levels: Pre-Primary, Primary, Secondary, etc.
    """
    name = models.CharField(max_length=50)
    code = models.CharField(max_length=25, unique=True, blank=True, null=True, editable=False)
    
    # Campus connection
    campus = models.ForeignKey(
        'campus.Campus',
        on_delete=models.CASCADE,
        related_name='levels',
        help_text="Campus this level belongs to"
    )
    
    # Coordinator (1 per campus per level) - FIXED
    coordinator = models.OneToOneField(
        'coordinator.Coordinator',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='assigned_level_coordinator',
        help_text="Coordinator for this level"
    )

    def save(self, *args, **kwargs):
        if not self.code:
            # Generate code using campus_id field instead of database ID
            if self.campus and self.campus.campus_id:
                # Use campus_id field (e.g., C01, C02, etc.)
                campus_code = self.campus.campus_id
            else:
                # Fallback to database ID if campus_id not set
                campus_id = self.campus.id if self.campus else 1
                campus_code = f"C{campus_id:02d}"
            
            # Map level names to codes: L1, L2, L3
            level_name = self.name.lower()
            if "pre" in level_name:
                level_code = "L1"
            elif "primary" in level_name:
                level_code = "L2"
            elif "secondary" in level_name:
                level_code = "L3"
            else:
                level_code = "L1"  # Default
            
            self.code = f"{campus_code}-{level_code}"
            
            # Ensure uniqueness
            original_code = self.code
            suffix = 1
            while Level.objects.filter(code=self.code).exists():
                self.code = f"{original_code}-{suffix}"
                suffix += 1
        super().save(*args, **kwargs)

    class Meta:
        unique_together = ("campus", "name")
    
    def __str__(self):
        return f"{self.name} ({self.campus.campus_name})"

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
        if not self.code:
            # Generate code using campus_id field instead of database ID
            if self.level and self.level.campus and self.level.campus.campus_id:
                campus_code = self.level.campus.campus_id
            else:
                # Fallback to database ID if campus_id not set
                campus_id = self.level.campus.id if self.level and self.level.campus else 1
                campus_code = f"C{campus_id:02d}"
            
            # Level code mapping: Pre-Primary=L1, Primary=L2, Secondary=L3
            level_name = self.level.name.lower() if self.level else "unknown"
            if "pre" in level_name:
                level_code = "L1"
            elif "primary" in level_name:
                level_code = "L2"
            elif "secondary" in level_name:
                level_code = "L3"
            else:
                level_code = "L1"  # Default
            
            grade_name = self.name.replace("Grade", "").strip()
            
            # Try to extract number from grade name
            import re
            numbers = re.findall(r'\d+', grade_name)
            if numbers:
                grade_num = numbers[0].zfill(2)  # Pad with zero if needed
            else:
                # If no number found, try to extract from name patterns
                if "nursery" in grade_name.lower():
                    grade_num = "00"
                elif "kg" in grade_name.lower():
                    # Extract KG number
                    kg_match = re.search(r'kg[-\s]*(\d+)', grade_name.lower())
                    if kg_match:
                        grade_num = f"0{kg_match.group(1)}"
                    else:
                        grade_num = "01"
                else:
                    grade_num = "01"
            
            self.code = f"{campus_code}-{level_code}-G{grade_num}"
            
            # Ensure uniqueness - check if this exact code already exists
            original_code = self.code
            suffix = 1
            while Grade.objects.filter(code=self.code).exists():
                self.code = f"{original_code}-{suffix:02d}"
                suffix += 1
        
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
            ('evening', 'Evening'),
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
            grade_code = self.grade.short_code or "".join(self.grade.name.split()).upper()
        return grade_code, self.section

    def clean(self):
        """
        Validate that teacher is not already assigned to another classroom
        """
        if self.class_teacher:
            # Check if this teacher is already assigned to another classroom
            existing_classroom = ClassRoom.objects.filter(
                class_teacher=self.class_teacher
            ).exclude(pk=self.pk).first()
            
            if existing_classroom:
                raise ValidationError(
                    f"Teacher {self.class_teacher.full_name} is already assigned to {existing_classroom}. "
                    "One teacher can only be assigned to one classroom."
                )

    def save(self, *args, **kwargs):
        # Run validation
        self.clean()
        
        if not self.code:
            # Generate code using campus_id field instead of database ID
            if self.grade and self.grade.level and self.grade.level.campus and self.grade.level.campus.campus_id:
                campus_code = self.grade.level.campus.campus_id
            else:
                # Fallback to database ID if campus_id not set
                campus_id = self.grade.level.campus.id if self.grade and self.grade.level and self.grade.level.campus else 1
                campus_code = f"C{campus_id:02d}"
            
            # Get shift code from classroom shift field
            shift_map = {
                'morning': 'M',
                'afternoon': 'A', 
                'evening': 'E',
                'both': 'B',
                'all': 'ALL'
            }
            shift_code = shift_map.get(self.shift.lower(), 'M')
            
            # Level code mapping: Pre-Primary=L1, Primary=L2, Secondary=L3
            level_name = self.grade.level.name.lower() if self.grade and self.grade.level else "unknown"
            if "pre" in level_name:
                level_code = "L1"
            elif "primary" in level_name:
                level_code = "L2"
            elif "secondary" in level_name:
                level_code = "L3"
            else:
                level_code = "L1"  # Default
            
            grade_name = self.grade.name.replace("Grade", "").strip()
            
            # Extract grade number
            import re
            numbers = re.findall(r'\d+', grade_name)
            if numbers:
                grade_num = numbers[0].zfill(2)
            else:
                # If no number found, try to extract from name patterns
                if "nursery" in grade_name.lower():
                    grade_num = "00"
                elif "kg" in grade_name.lower():
                    # Extract KG number
                    kg_match = re.search(r'kg[-\s]*(\d+)', grade_name.lower())
                    if kg_match:
                        grade_num = f"0{kg_match.group(1)}"
                    else:
                        grade_num = "01"
                else:
                    grade_num = "01"
            
            self.code = f"{campus_code}-{shift_code}-{level_code}-G{grade_num}-{self.section}"
            
            # Ensure uniqueness
            original_code = self.code
            suffix = 1
            while ClassRoom.objects.filter(code=self.code).exists():
                self.code = f"{original_code}-{suffix:02d}"
                suffix += 1
        super().save(*args, **kwargs)
    
    # Properties for easy access
    @property
    def level(self):
        return self.grade.level if self.grade else None
    
    @property
    def campus(self):
        return self.grade.level.campus if self.grade and self.grade.level else None
