# Generated migration to fix marked_at field properly

from django.db import migrations, models
from django.utils import timezone


def populate_marked_at(apps, schema_editor):
    """Populate marked_at field for existing records"""
    Attendance = apps.get_model('attendance', 'Attendance')
    for attendance in Attendance.objects.filter(marked_at__isnull=True):
        attendance.marked_at = timezone.now()
        attendance.save(update_fields=['marked_at'])


def reverse_populate_marked_at(apps, schema_editor):
    """Reverse operation - set marked_at to null"""
    Attendance = apps.get_model('attendance', 'Attendance')
    Attendance.objects.update(marked_at=None)


class Migration(migrations.Migration):

    dependencies = [
        ('attendance', '0004_attendance_enhancements'),
    ]

    operations = [
        # First, make the field nullable
        migrations.AlterField(
            model_name='attendance',
            name='marked_at',
            field=models.DateTimeField(null=True, blank=True),
        ),
        # Populate existing records
        migrations.RunPython(
            populate_marked_at,
            reverse_populate_marked_at,
        ),
        # Make it auto_now_add=True
        migrations.AlterField(
            model_name='attendance',
            name='marked_at',
            field=models.DateTimeField(auto_now_add=True),
        ),
    ]
