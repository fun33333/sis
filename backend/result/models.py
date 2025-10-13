from django.db import models
from django.conf import settings
from students.models import Student
from teachers.models import Teacher
from coordinator.models import Coordinator

class Result(models.Model):
    EXAM_TYPE_CHOICES = [
        ('mid_term', 'Mid Term'),
        ('final_term', 'Final Term'),
    ]
    
    STATUS_CHOICES = [
        ('draft', 'Draft'),
        ('submitted', 'Submitted'),
        ('under_review', 'Under Review'),
        ('approved', 'Approved'),
        ('rejected', 'Rejected'),
    ]
    
    RESULT_STATUS_CHOICES = [
        ('pass', 'Pass'),
        ('fail', 'Fail'),
    ]
    
    student = models.ForeignKey(Student, on_delete=models.CASCADE, related_name='results')
    teacher = models.ForeignKey(Teacher, on_delete=models.CASCADE, related_name='created_results')
    coordinator = models.ForeignKey(Coordinator, on_delete=models.SET_NULL, null=True, blank=True, related_name='reviewed_results')
    
    exam_type = models.CharField(max_length=20, choices=EXAM_TYPE_CHOICES)
    academic_year = models.CharField(max_length=10, default='2024-25')
    semester = models.CharField(max_length=20, default='Spring')
    
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='draft')
    edit_count = models.PositiveIntegerField(default=0)
    
    total_marks = models.FloatField(default=0)
    obtained_marks = models.FloatField(default=0)
    percentage = models.FloatField(default=0)
    grade = models.CharField(max_length=5, default='F')
    result_status = models.CharField(max_length=10, choices=RESULT_STATUS_CHOICES, default='fail')
    
    coordinator_comments = models.TextField(blank=True, null=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def calculate_totals(self):
        """Calculate total marks, obtained marks, percentage, grade, and result status"""
        total_marks = 0
        obtained_marks = 0
        all_subjects_pass = True
        
        for subject_mark in self.subject_marks.all():
            total_marks += subject_mark.get_total_marks()
            obtained_marks += subject_mark.get_obtained_marks()
            if not subject_mark.is_pass:
                all_subjects_pass = False
        
        self.total_marks = total_marks
        self.obtained_marks = obtained_marks
        self.percentage = (obtained_marks / total_marks * 100) if total_marks > 0 else 0
        
        # Calculate grade
        if self.percentage >= 90:
            self.grade = 'A+'
        elif self.percentage >= 80:
            self.grade = 'A'
        elif self.percentage >= 70:
            self.grade = 'B'
        elif self.percentage >= 60:
            self.grade = 'C'
        elif self.percentage >= 50:
            self.grade = 'D'
        else:
            self.grade = 'F'
        
        # Result status: Pass if all subjects pass AND percentage >= 50
        self.result_status = 'pass' if (all_subjects_pass and self.percentage >= 50) else 'fail'
        
        self.save(update_fields=['total_marks', 'obtained_marks', 'percentage', 'grade', 'result_status'])
    
    def __str__(self):
        return f"{self.student.name} - {self.get_exam_type_display()} ({self.status})"
    
    class Meta:
        ordering = ['-created_at']
        unique_together = ['student', 'exam_type', 'academic_year', 'semester']

class SubjectMark(models.Model):
    SUBJECT_CHOICES = [
        ('urdu', 'Urdu'),
        ('english', 'English'),
        ('mathematics', 'Mathematics'),
        ('science', 'Science'),
        ('social_studies', 'Social Studies'),
        ('islamiat', 'Islamiat'),
        ('computer_science', 'Computer Science'),
    ]
    
    result = models.ForeignKey(Result, on_delete=models.CASCADE, related_name='subject_marks')
    subject_name = models.CharField(max_length=50, choices=SUBJECT_CHOICES)
    
    # Theory marks
    total_marks = models.FloatField(default=100)
    obtained_marks = models.FloatField(default=0)
    
    # Practical/Oral marks (for Urdu and English)
    has_practical = models.BooleanField(default=False)
    practical_total = models.FloatField(default=0, null=True, blank=True)
    practical_obtained = models.FloatField(default=0, null=True, blank=True)
    
    is_pass = models.BooleanField(default=False)
    
    def save(self, *args, **kwargs):
        # Auto-determine if subject has practical
        if self.subject_name in ['urdu', 'english']:
            self.has_practical = True
            if not self.practical_total:
                self.practical_total = 20
        
        # Calculate pass/fail based on exam type
        if self.result.exam_type == 'mid_term':
            theory_pass = self.obtained_marks >= 33
            practical_pass = True
            if self.has_practical and self.practical_obtained:
                practical_pass = self.practical_obtained >= 7
            self.is_pass = theory_pass and practical_pass
        else:  # final_term
            theory_pass = self.obtained_marks >= 40
            practical_pass = True
            if self.has_practical and self.practical_obtained:
                practical_pass = self.practical_obtained >= 8
            self.is_pass = theory_pass and practical_pass
        
        super().save(*args, **kwargs)
    
    def get_total_marks(self):
        """Get total marks including practical if applicable"""
        if self.has_practical and self.practical_total:
            return self.total_marks + self.practical_total
        return self.total_marks
    
    def get_obtained_marks(self):
        """Get obtained marks including practical if applicable"""
        if self.has_practical and self.practical_obtained:
            return self.obtained_marks + self.practical_obtained
        return self.obtained_marks
    
    def __str__(self):
        return f"{self.result.student.name} - {self.get_subject_name_display()}"
    
    class Meta:
        ordering = ['subject_name']
        unique_together = ['result', 'subject_name']
