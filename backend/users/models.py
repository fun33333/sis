from django.db import models
from django.contrib.auth.models import AbstractUser
from django.utils import timezone

class User(AbstractUser):
    """
    Custom User model with role-based access control
    """
    ROLE_CHOICES = [
        ('superadmin', 'Super Admin'),
        ('principal', 'Principal'),
        ('coordinator', 'Teacher Coordinator'),
        ('teacher', 'Teacher'),
    ]
    
    # Override default fields
    email = models.EmailField(unique=True)
    username = models.CharField(max_length=150, unique=True)
    
    # Custom fields
    role = models.CharField(max_length=20, choices=ROLE_CHOICES)
    campus = models.ForeignKey('campus.Campus', on_delete=models.SET_NULL, null=True, blank=True)
    phone_number = models.CharField(max_length=20, blank=True, null=True)
    is_verified = models.BooleanField(default=False)
    last_login_ip = models.GenericIPAddressField(null=True, blank=True)
    
    # System fields
    created_at = models.DateTimeField(default=timezone.now)
    updated_at = models.DateTimeField(auto_now=True)
    
    USERNAME_FIELD = 'username'
    REQUIRED_FIELDS = ['email', 'role']
    
    def __str__(self):
        return f"{self.get_full_name()} ({self.get_role_display()})"
    
    def get_role_display(self):
        return dict(self.ROLE_CHOICES).get(self.role, self.role)
    
    def is_superadmin(self):
        return self.role == 'superadmin'
    
    def is_principal(self):
        return self.role == 'principal'
    
    def is_coordinator(self):
        return self.role == 'coordinator'
    
    def is_teacher(self):
        return self.role == 'teacher'
    
    def can_manage_campus(self):
        return self.role in ['superadmin', 'principal']
    
    def can_approve_requests(self):
        return self.role in ['superadmin', 'principal', 'coordinator']
    
    def can_view_all_data(self):
        return self.role in ['superadmin', 'principal']
    
    class Meta:
        db_table = 'users_user'
        verbose_name = 'User'
        verbose_name_plural = 'Users'
