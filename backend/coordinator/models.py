# from django.db import models
# from campus.models import Campus
# from classes.models import Level  # Level model import

# class Coordinator(models.Model):
#     """
#     Coordinator model: Responsible for a school level.
#     Example: Primary Level Coordinator
#     """

#     # Basic Info
#     full_name = models.CharField(max_length=150)
#     email = models.EmailField(unique=True)
#     phone = models.CharField(max_length=20)
#     gender = models.CharField(max_length=10, choices=[("male", "Male"), ("female", "Female")])
#     cnic = models.CharField(max_length=15, unique=True)

#     # Work Assignment
#     campus = models.ForeignKey(Campus, on_delete=models.CASCADE, related_name="coordinators")
    
#     # Level instead of section, dropdown from Levels table
#     level = models.ForeignKey(Level, on_delete=models.CASCADE, related_name="coordinators")

#     # Metadata
#     date_joined = models.DateField(null=True, blank=True)
#     is_active = models.BooleanField(default=True)
#     created_at = models.DateTimeField(auto_now_add=True)
#     updated_at = models.DateTimeField(auto_now=True)

#     def __str__(self):
#         return f"{self.full_name} - {self.level.name} ({self.campus.campus_name})"

from django.db import models
from campus.models import Campus
from classes.models import Level  # Level model import

class Coordinator(models.Model):
    """
    Coordinator model: Responsible for a school level.
    Example: Primary Level Coordinator
    """

    # Basic Info
    full_name = models.CharField(max_length=150)
    email = models.EmailField(unique=True)
    phone = models.CharField(max_length=20)
    gender = models.CharField(max_length=10, choices=[("male", "Male"), ("female", "Female")])
    cnic = models.CharField(max_length=15, unique=True)

    # Work Assignment
    campus = models.ForeignKey(Campus, on_delete=models.CASCADE, related_name="coordinators")
    
    # Level instead of section, dropdown from Levels table
    level = models.ForeignKey(Level, on_delete=models.CASCADE, related_name="coordinators")

    # Metadata
    date_joined = models.DateField(null=True, blank=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.full_name} - {self.level.name} ({self.campus.campus_name})"
