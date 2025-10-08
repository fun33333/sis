from django.db.models.signals import post_save
from django.dispatch import receiver
from .models import ExitRecord

@receiver(post_save, sender=ExitRecord)
def apply_exit_record(sender, instance: ExitRecord, created, **kwargs):
    # Only act when a record has been approved
    if instance.approved:
        student = instance.student
        # Update student's status so they are excluded next academic year etc.
        if instance.exit_type == "termination":
            student.current_state = "terminated"
        elif instance.exit_type == "transfer":
            student.current_state = "transferred"
        elif instance.exit_type == "leaving":
            student.current_state = "left"
        # Make student read-only in admin/UI logic separately (see admin snippet)
        # Save minimal student changes
        student.save(update_fields=["current_state"])
