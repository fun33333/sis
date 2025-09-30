from django.db import models
from django.utils import timezone
from django.core.exceptions import ValidationError


class Attendance(models.Model):
    """
    Main attendance model for tracking student attendance
    """
    
    # Attendance Status Choices
    STATUS_CHOICES = [
        ('present', 'Present'),
        ('absent', 'Absent'),
        ('late', 'Late'),
        ('excused', 'Excused'),
    ]
    
    # Core Relationships
    student = models.ForeignKey(
        'students.Student',
        on_delete=models.CASCADE,
        related_name='attendances',
        help_text="Student whose attendance is being recorded"
    )
    
    classroom = models.ForeignKey(
        'classes.ClassRoom',
        on_delete=models.CASCADE,
        related_name='attendances',
        help_text="Class (Grade + Section) for which attendance is recorded"
    )
    
    class_teacher = models.ForeignKey(
        'teachers.Teacher',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='class_attendances',
        help_text="Class teacher who marked the attendance"
    )
    
    campus = models.ForeignKey(
        'campus.Campus',
        on_delete=models.CASCADE,
        related_name='attendances',
        help_text="Campus where attendance is recorded"
    )
    
    # Attendance Details
    date = models.DateField(
        help_text="Date for which attendance is recorded"
    )
    
    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default='present',
        help_text="Attendance status of the student"
    )
    
    # Additional Information
    remarks = models.TextField(
        blank=True,
        null=True,
        help_text="Additional notes or remarks about attendance"
    )
    
    # Excuse/Leave Information
    excuse_reason = models.CharField(
        max_length=200,
        blank=True,
        null=True,
        help_text="Reason for absence or late arrival"
    )
    
    excuse_document = models.FileField(
        upload_to='attendance/excuses/',
        blank=True,
        null=True,
        help_text="Upload excuse letter or medical certificate"
    )
    
    # Academic Information
    academic_year = models.CharField(
        max_length=9,
        help_text="Academic year (e.g., 2024-2025)"
    )
    
    semester = models.CharField(
        max_length=20,
        blank=True,
        null=True,
        help_text="Semester or term (e.g., First Term, Second Term)"
    )
    
    # System Fields
    created_by = models.ForeignKey(
        'user.User',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='created_attendances',
        help_text="User who created this attendance record"
    )
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        # Ensure one attendance record per student per day per class
        unique_together = ('student', 'classroom', 'date')
        ordering = ['-date', 'student__name']
        indexes = [
            models.Index(fields=['date', 'classroom']),
            models.Index(fields=['student', 'date']),
            models.Index(fields=['campus', 'date']),
        ]
    
    def clean(self):
        """Validate attendance data"""
        super().clean()
        
        # Validate that student belongs to the classroom
        if self.student and self.classroom:
            if self.student.classroom != self.classroom:
                raise ValidationError({
                    'classroom': f"Student {self.student.name} belongs to {self.student.classroom}, not {self.classroom}."
                })
        
        # Validate that class teacher is assigned to this classroom
        if self.class_teacher and self.classroom:
            if self.classroom.class_teacher != self.class_teacher:
                raise ValidationError({
                    'class_teacher': f"Teacher {self.class_teacher.full_name} is not assigned to {self.classroom}."
                })
    
    def save(self, *args, **kwargs):
        # Auto-populate academic year if not provided
        if not self.academic_year:
            current_year = timezone.now().year
            self.academic_year = f"{current_year}-{current_year + 1}"
        
        # Auto-populate campus from student
        if not self.campus and self.student:
            self.campus = self.student.campus
        
        # Auto-populate classroom from student
        if not self.classroom and self.student:
            self.classroom = self.student.classroom
        
        # Auto-populate class teacher from classroom (only if student belongs to this classroom)
        if not self.class_teacher and self.classroom and self.student:
            # Verify student belongs to this classroom
            if self.student.classroom == self.classroom:
                self.class_teacher = self.classroom.class_teacher
            else:
                # If student doesn't belong to selected classroom, use student's actual classroom
                self.classroom = self.student.classroom
                self.class_teacher = self.student.classroom.class_teacher
        
        self.full_clean()
        super().save(*args, **kwargs)
    
    def __str__(self):
        return f"{self.student.name} - {self.classroom} - {self.date} ({self.get_status_display()})"
    
    @property
    def is_present(self):
        """Check if student was present (not absent)"""
        return self.status in ['present', 'late']
    
    @property
    def is_absent(self):
        """Check if student was absent"""
        return self.status == 'absent'
    
    @property
    def is_late(self):
        """Check if student was late"""
        return self.status == 'late'


class AttendanceSummary(models.Model):
    """
    Monthly/Weekly attendance summary for students
    """
    
    student = models.ForeignKey(
        'students.Student',
        on_delete=models.CASCADE,
        related_name='attendance_summaries'
    )
    
    classroom = models.ForeignKey(
        'classes.ClassRoom',
        on_delete=models.CASCADE,
        related_name='attendance_summaries'
    )
    
    campus = models.ForeignKey(
        'campus.Campus',
        on_delete=models.CASCADE,
        related_name='attendance_summaries'
    )
    
    # Summary Period
    month = models.PositiveIntegerField(help_text="Month (1-12)")
    year = models.PositiveIntegerField(help_text="Year")
    academic_year = models.CharField(max_length=9, help_text="Academic year")
    
    # Attendance Counts
    total_days = models.PositiveIntegerField(default=0, help_text="Total working days in period")
    present_days = models.PositiveIntegerField(default=0, help_text="Days present")
    absent_days = models.PositiveIntegerField(default=0, help_text="Days absent")
    late_days = models.PositiveIntegerField(default=0, help_text="Days late")
    excused_days = models.PositiveIntegerField(default=0, help_text="Days excused")
    
    # Calculated Fields
    attendance_percentage = models.DecimalField(
        max_digits=5,
        decimal_places=2,
        default=0.00,
        help_text="Attendance percentage"
    )
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        unique_together = ('student', 'classroom', 'month', 'year')
        ordering = ['-year', '-month', 'student__name']
    
    def save(self, *args, **kwargs):
        # Calculate attendance percentage
        if self.total_days > 0:
            present_count = self.present_days + self.late_days
            self.attendance_percentage = (present_count / self.total_days) * 100
        else:
            self.attendance_percentage = 0.00
        
        super().save(*args, **kwargs)
    
    def __str__(self):
        return f"{self.student.name} - {self.month}/{self.year} ({self.attendance_percentage}%)"


