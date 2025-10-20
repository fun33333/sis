from django.db.models.signals import post_save, pre_save
from django.dispatch import receiver
from .models import Teacher
from services.user_creation_service import UserCreationService

@receiver(post_save, sender=Teacher)
def create_teacher_user(sender, instance, created, **kwargs):
    """Auto-create user when ANY teacher is created"""
    if created:  # Only on creation, not updates
        try:
            # Check if user already exists
            from users.models import User
            if User.objects.filter(email=instance.email).exists():
                print(f"User already exists for {instance.full_name}")
                return
            
            user, message = UserCreationService.create_user_from_entity(instance, 'teacher')
            if not user:
                print(f"Failed to create user for teacher {instance.id}: {message}")
            else:
                print(f"✅ Created user for teacher: {instance.full_name} ({instance.employee_code})")
        except Exception as e:
            print(f"Error creating user for teacher {instance.id}: {str(e)}")

@receiver(pre_save, sender=Teacher)
def update_class_teacher_status(sender, instance, **kwargs):
    """Update class teacher status when classroom is assigned"""
    if instance.assigned_classroom and not instance.is_class_teacher:
        instance.is_class_teacher = True
    elif not instance.assigned_classroom and instance.is_class_teacher:
        instance.is_class_teacher = False

# NEW: Signal to sync classroom assignment when teacher is updated
@receiver(post_save, sender=Teacher)
def sync_teacher_classroom_assignment(sender, instance, created, **kwargs):
    """
    Jab teacher ko classroom assign karte hain, to classroom ki class_teacher field bhi update karo
    """
    if instance.assigned_classroom:
        # Classroom mein teacher assign karo
        classroom = instance.assigned_classroom
        if classroom.class_teacher != instance:
            classroom.class_teacher = instance
            classroom.save(update_fields=['class_teacher'])
            print(f"✅ Synced: Classroom {classroom} assigned teacher {instance.full_name}")
    else:
        # Agar teacher se classroom remove kiya gaya hai
        # Pehle check karo ke koi classroom is teacher se assigned hai ya nahi
        try:
            from classes.models import ClassRoom
            classroom = ClassRoom.objects.get(class_teacher=instance)
            classroom.class_teacher = None
            classroom.save(update_fields=['class_teacher'])
            print(f"✅ Synced: Classroom {classroom} removed teacher {instance.full_name}")
        except ClassRoom.DoesNotExist:
            pass  # Koi classroom assigned nahi tha