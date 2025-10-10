from django.db.models.signals import post_save
from django.dispatch import receiver
from classes.models import ClassRoom
from coordinator.models import Coordinator

@receiver(post_save, sender=ClassRoom)
def update_teacher_coordinator_on_classroom_change(sender, instance, **kwargs):
    """
    When classroom's class_teacher changes, add coordinator to teacher's ManyToMany field
    """
    if instance.class_teacher:
        teacher = instance.class_teacher
        
        # Get coordinator for this classroom's level
        if instance.grade and instance.grade.level:
            coordinator = Coordinator.objects.filter(
                level=instance.grade.level,
                campus=instance.campus,
                is_currently_active=True
            ).first()
            
            if coordinator:
                # Add coordinator (not replace) - use ManyToMany
                if coordinator not in teacher.assigned_coordinators.all():
                    teacher.assigned_coordinators.add(coordinator)
                    print(f"Added coordinator {coordinator.full_name} for level {instance.grade.level.name}")
            else:
                print(f"No coordinator found for {instance.grade.level.name}")