from django.db import models
from django.utils import timezone

# Choices
CATEGORY_CHOICES = [
    ('leave', 'Leave Request'),
    ('salary', 'Salary Issue'),
    ('facility', 'Facility Complaint'),
    ('resource', 'Resource Request'),
    ('student', 'Student Related'),
    ('admin', 'Administrative Issue'),
    ('other', 'Other'),
]

PRIORITY_CHOICES = [
    ('low', 'Low'),
    ('medium', 'Medium'),
    ('high', 'High'),
    ('urgent', 'Urgent'),
]

STATUS_CHOICES = [
    ('submitted', 'Submitted'),
    ('under_review', 'Under Review'),
    ('in_progress', 'In Progress'),
    ('waiting', 'Waiting'),
    ('resolved', 'Resolved'),
    ('rejected', 'Rejected'),
]

class RequestComplaint(models.Model):
    """Model for teacher requests and complaints"""
    
    # Foreign Keys
    teacher = models.ForeignKey('teachers.Teacher', on_delete=models.CASCADE, related_name='requests')
    coordinator = models.ForeignKey('coordinator.Coordinator', on_delete=models.CASCADE, related_name='assigned_requests')
    
    # Request Details
    category = models.CharField(max_length=20, choices=CATEGORY_CHOICES)
    subject = models.CharField(max_length=200)
    description = models.TextField()
    
    # Status & Priority
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='submitted')
    priority = models.CharField(max_length=10, choices=PRIORITY_CHOICES, default='low')
    
    # Coordinator Response
    coordinator_notes = models.TextField(blank=True, null=True)
    resolution_notes = models.TextField(blank=True, null=True)
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    reviewed_at = models.DateTimeField(null=True, blank=True)
    resolved_at = models.DateTimeField(null=True, blank=True)
    
    class Meta:
        ordering = ['-created_at']
        verbose_name = "Request/Complaint"
        verbose_name_plural = "Requests/Complaints"
    
    def __str__(self):
        return f"{self.get_category_display()} - {self.subject} ({self.get_status_display()})"
    
    def save(self, *args, **kwargs):
        # Auto-set reviewed_at when status changes to under_review
        if self.status == 'under_review' and not self.reviewed_at:
            self.reviewed_at = timezone.now()
        
        # Auto-set resolved_at when status changes to resolved/rejected
        if self.status in ['resolved', 'rejected'] and not self.resolved_at:
            self.resolved_at = timezone.now()
        
        super().save(*args, **kwargs)

class RequestComment(models.Model):
    """Model for comments on requests"""
    
    USER_TYPE_CHOICES = [
        ('teacher', 'Teacher'),
        ('coordinator', 'Coordinator'),
    ]
    
    request = models.ForeignKey(RequestComplaint, on_delete=models.CASCADE, related_name='comments')
    user_type = models.CharField(max_length=20, choices=USER_TYPE_CHOICES)
    comment = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['created_at']
        verbose_name = "Request Comment"
        verbose_name_plural = "Request Comments"
    
    def __str__(self):
        return f"Comment on {self.request.subject} by {self.get_user_type_display()}"

class RequestStatusHistory(models.Model):
    """Model to track status changes"""
    
    request = models.ForeignKey(RequestComplaint, on_delete=models.CASCADE, related_name='status_history')
    old_status = models.CharField(max_length=20, choices=STATUS_CHOICES, null=True, blank=True)
    new_status = models.CharField(max_length=20, choices=STATUS_CHOICES)
    changed_by = models.CharField(max_length=20)  # 'teacher' or 'coordinator'
    notes = models.TextField(blank=True, null=True)
    changed_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['-changed_at']
        verbose_name = "Status History"
        verbose_name_plural = "Status Histories"
    
    def __str__(self):
        return f"{self.request.subject}: {self.old_status} → {self.new_status}"
