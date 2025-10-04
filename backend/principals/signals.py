from django.db.models.signals import post_save
from django.dispatch import receiver
from .models import Principal
from services.user_creation_service import UserCreationService

@receiver(post_save, sender=Principal)
def create_principal_user(sender, instance, created, **kwargs):
    """Auto-create user when principal is created"""
    if created and not instance.employee_code:
        try:
            user, message = UserCreationService.create_user_from_entity(instance, 'principal')
            if not user:
                print(f"Failed to create user for principal {instance.id}: {message}")
        except Exception as e:
            print(f"Error creating user for principal {instance.id}: {str(e)}")