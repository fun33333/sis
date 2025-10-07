from django.db.models.signals import post_save
from django.dispatch import receiver
from .models import ClassRoom

@receiver(post_save, sender=ClassRoom)
def sync_classroom_teacher_assignment(sender, instance, created, **kwargs):
    """
    Jab classroom mein teacher assign karte hain, to teacher ki assigned_classroom field bhi update karo
    """
    if instance.class_teacher:
        # Teacher ko classroom assign karo
        teacher = instance.class_teacher
        if teacher.assigned_classroom != instance:
            teacher.assigned_classroom = instance
            teacher.is_class_teacher = True
            teacher.save(update_fields=['assigned_classroom', 'is_class_teacher'])
            print(f"✅ Synced: Teacher {teacher.full_name} assigned to classroom {instance}")
    else:
        # Agar classroom se teacher remove kiya gaya hai
        try:
            from teachers.models import Teacher
            teacher = Teacher.objects.get(assigned_classroom=instance)
            teacher.assigned_classroom = None
            teacher.is_class_teacher = False
            teacher.save(update_fields=['assigned_classroom', 'is_class_teacher'])
            print(f"✅ Synced: Teacher {teacher.full_name} removed from classroom {instance}")
        except Teacher.DoesNotExist:
            pass