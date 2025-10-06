from django.db.models.signals import post_save, pre_save
from django.dispatch import receiver
from .models import Teacher
from services.user_creation_service import UserCreationService

@receiver(post_save, sender=Teacher)
def create_class_teacher_user(sender, instance, created, **kwargs):
    """Auto-create user ONLY when teacher becomes class teacher"""
    # Check if teacher is class teacher and has classroom
    if instance.is_class_teacher and instance.assigned_classroom:
        try:
            # Check if user already exists
            from users.models import User
            if User.objects.filter(email=instance.email).exists():
                print(f"User already exists for {instance.full_name}")
                return
            
            user, message = UserCreationService.create_user_from_entity(instance, 'teacher')
            if not user:
                print(f"Failed to create user for class teacher {instance.id}: {message}")
            else:
                print(f"✅ Created user for class teacher: {instance.full_name}")
        except Exception as e:
            print(f"Error creating user for class teacher {instance.id}: {str(e)}")

@receiver(pre_save, sender=Teacher)
def update_class_teacher_status(sender, instance, **kwargs):
    """Update class teacher status when classroom is assigned"""
    if instance.assigned_classroom and not instance.is_class_teacher:
        instance.is_class_teacher = True
    elif not instance.assigned_classroom and instance.is_class_teacher:
        instance.is_class_teacher = False