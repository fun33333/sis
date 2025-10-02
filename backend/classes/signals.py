# optional file - currently not required for code generation because
# ClassRoom.save handles code creation. Keep for future hooks.
from django.db.models.signals import post_save
from django.dispatch import receiver
from .models import ClassRoom

@receiver(post_save, sender=ClassRoom)
def post_save_classroom(sender, instance, created, **kwargs):
    # placeholder: if you later want to auto-create default subjects for a class
    # you can call Subjects app logic here (import lazily to avoid circular imports).
    if created:
        # example (commented):
        # from subjects.models import Subject
        # Subject.create_defaults_for_grade(instance.grade)
        pass
