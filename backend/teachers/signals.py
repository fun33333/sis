from django.db.models.signals import post_save
from django.dispatch import receiver
from .models import Teacher
from services.user_creation_service import UserCreationService

@receiver(post_save, sender=Teacher)
def create_teacher_user(sender, instance, created, **kwargs):
    """Auto-create user when teacher is created"""
    if created:  # Remove employee_code check
        try:
            user, message = UserCreationService.create_user_from_entity(instance, 'teacher')
            if not user:
                print(f"Failed to create user for teacher {instance.id}: {message}")
        except Exception as e:
            print(f"Error creating user for teacher {instance.id}: {str(e)}")