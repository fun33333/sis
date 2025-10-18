from django.db import models
from django.contrib.auth import get_user_model
from django.utils import timezone

User = get_user_model()


class TransferRequest(models.Model):
    REQUEST_TYPES = [
        ('student', 'Student Transfer'),
        ('teacher', 'Teacher Transfer'),
    ]
    
    STATUS_CHOICES = [
        ('draft', 'Draft'),
        ('pending', 'Pending'),
        ('approved', 'Approved'),
        ('declined', 'Declined'),
        ('cancelled', 'Cancelled'),
    ]
    
    # Basic Info
    request_type = models.CharField(max_length=20, choices=REQUEST_TYPES)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    
    # Source Information
    from_campus = models.ForeignKey('campus.Campus', on_delete=models.CASCADE, related_name='transfers_from')
    from_shift = models.CharField(max_length=1, choices=[('M', 'Morning'), ('A', 'Afternoon')])
    requesting_principal = models.ForeignKey(User, on_delete=models.CASCADE, related_name='transfer_requests_sent')
    
    # Destination Information
    to_campus = models.ForeignKey('campus.Campus', on_delete=models.CASCADE, related_name='transfers_to')
    to_shift = models.CharField(max_length=1, choices=[('M', 'Morning'), ('A', 'Afternoon')])
    receiving_principal = models.ForeignKey(User, on_delete=models.CASCADE, related_name='transfer_requests_received')
    
    # Student/Teacher Reference
    student = models.ForeignKey('students.Student', on_delete=models.CASCADE, null=True, blank=True)
    teacher = models.ForeignKey('teachers.Teacher', on_delete=models.CASCADE, null=True, blank=True)
    
    # Request Details
    reason = models.TextField()
    requested_date = models.DateField()
    notes = models.TextField(blank=True)
    
    # Approval Details
    reviewed_at = models.DateTimeField(null=True, blank=True)
    decline_reason = models.TextField(blank=True)
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['status']),
            models.Index(fields=['request_type']),
            models.Index(fields=['from_campus', 'to_campus']),
            models.Index(fields=['requesting_principal', 'receiving_principal']),
        ]
    
    def __str__(self):
        entity_name = self.student.name if self.student else self.teacher.full_name if self.teacher else 'Unknown'
        return f"{self.get_request_type_display()} - {entity_name} ({self.get_status_display()})"
    
    @property
    def entity_name(self):
        """Get the name of the student or teacher being transferred"""
        if self.student:
            return self.student.name
        elif self.teacher:
            return self.teacher.full_name
        return 'Unknown'
    
    @property
    def current_id(self):
        """Get the current ID of the student or teacher"""
        if self.student:
            return self.student.student_id
        elif self.teacher:
            return self.teacher.employee_code
        return 'Unknown'


class IDHistory(models.Model):
    ENTITY_TYPES = [
        ('student', 'Student'),
        ('teacher', 'Teacher'),
    ]
    
    entity_type = models.CharField(max_length=20, choices=ENTITY_TYPES)
    student = models.ForeignKey('students.Student', on_delete=models.CASCADE, null=True, blank=True, related_name='id_history')
    teacher = models.ForeignKey('teachers.Teacher', on_delete=models.CASCADE, null=True, blank=True, related_name='id_history')
    
    # Old ID segments
    old_id = models.CharField(max_length=50)
    old_campus_code = models.CharField(max_length=10)
    old_shift = models.CharField(max_length=1)
    old_year = models.CharField(max_length=2)
    
    # New ID segments
    new_id = models.CharField(max_length=50)
    new_campus_code = models.CharField(max_length=10)
    new_shift = models.CharField(max_length=1)
    new_year = models.CharField(max_length=2)
    
    # Immutable suffix (preserved)
    immutable_suffix = models.CharField(max_length=20)
    
    # Transfer reference
    transfer_request = models.ForeignKey(TransferRequest, on_delete=models.CASCADE, related_name='id_changes')
    
    # Metadata
    changed_by = models.ForeignKey(User, on_delete=models.CASCADE)
    change_reason = models.TextField()
    changed_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['-changed_at']
        indexes = [
            models.Index(fields=['entity_type']),
            models.Index(fields=['old_id']),
            models.Index(fields=['new_id']),
            models.Index(fields=['student', 'teacher']),
        ]
    
    def __str__(self):
        entity_name = self.student.name if self.student else self.teacher.full_name if self.teacher else 'Unknown'
        return f"{entity_name}: {self.old_id} → {self.new_id}"
    
    @property
    def entity_name(self):
        """Get the name of the student or teacher"""
        if self.student:
            return self.student.name
        elif self.teacher:
            return self.teacher.full_name
        return 'Unknown'
