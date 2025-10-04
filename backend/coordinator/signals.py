from django.db.models.signals import post_save
from django.dispatch import receiver
from .models import Coordinator
from services.user_creation_service import UserCreationService

@receiver(post_save, sender=Coordinator)
def create_coordinator_user(sender, instance, created, **kwargs):
    """Auto-create user when coordinator is created"""
    if created and not instance.employee_code:
        try:
            user, message = UserCreationService.create_user_from_entity(instance, 'coordinator')
            if not user:
                print(f"Failed to create user for coordinator {instance.id}: {message}")
        except Exception as e:
            print(f"Error creating user for coordinator {instance.id}: {str(e)}")