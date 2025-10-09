from django.db.models.signals import post_save, post_delete
from django.dispatch import receiver
from .models import StudentAttendance, Attendance


@receiver(post_save, sender=StudentAttendance)
def update_attendance_counts_on_save(sender, instance, **kwargs):
    """Update attendance counts when student attendance is saved"""
    if instance.attendance:
        instance.attendance.update_counts()


@receiver(post_delete, sender=StudentAttendance)
def update_attendance_counts_on_delete(sender, instance, **kwargs):
    """Update attendance counts when student attendance is deleted"""
    if instance.attendance:
        instance.attendance.update_counts()

