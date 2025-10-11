# Generated migration for attendance enhancements

from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
        ('attendance', '0003_initial'),
    ]

    operations = [
        # Add new audit fields to Attendance
        migrations.AddField(
            model_name='attendance',
            name='created_by',
            field=models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='created_attendances', to=settings.AUTH_USER_MODEL),
        ),
        migrations.AddField(
            model_name='attendance',
            name='updated_by',
            field=models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='updated_attendances', to=settings.AUTH_USER_MODEL),
        ),
        migrations.AddField(
            model_name='attendance',
            name='marked_at',
            field=models.DateTimeField(auto_now_add=True, null=True),
        ),
        migrations.AddField(
            model_name='attendance',
            name='last_edited_at',
            field=models.DateTimeField(blank=True, null=True),
        ),
        migrations.AddField(
            model_name='attendance',
            name='update_history',
            field=models.JSONField(blank=True, default=list),
        ),
        migrations.AddField(
            model_name='attendance',
            name='is_final',
            field=models.BooleanField(default=False),
        ),
        migrations.AddField(
            model_name='attendance',
            name='is_deleted',
            field=models.BooleanField(default=False),
        ),
        migrations.AddField(
            model_name='attendance',
            name='deleted_at',
            field=models.DateTimeField(blank=True, null=True),
        ),
        migrations.AddField(
            model_name='attendance',
            name='deleted_by',
            field=models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='deleted_attendances', to=settings.AUTH_USER_MODEL),
        ),
        migrations.AddField(
            model_name='attendance',
            name='leave_count',
            field=models.PositiveIntegerField(default=0),
        ),
        
        # Add new audit fields to StudentAttendance
        migrations.AddField(
            model_name='studentattendance',
            name='created_by',
            field=models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='created_student_attendances', to=settings.AUTH_USER_MODEL),
        ),
        migrations.AddField(
            model_name='studentattendance',
            name='updated_by',
            field=models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='updated_student_attendances', to=settings.AUTH_USER_MODEL),
        ),
        migrations.AddField(
            model_name='studentattendance',
            name='is_deleted',
            field=models.BooleanField(default=False),
        ),
        migrations.AddField(
            model_name='studentattendance',
            name='deleted_at',
            field=models.DateTimeField(blank=True, null=True),
        ),
        
        # Update STATUS_CHOICES to include 'leave'
        migrations.AlterField(
            model_name='studentattendance',
            name='status',
            field=models.CharField(
                choices=[
                    ('present', 'Present'),
                    ('absent', 'Absent'),
                    ('late', 'Late'),
                    ('leave', 'Leave'),
                    ('excused', 'Excused')
                ],
                default='present',
                max_length=10
            ),
        ),
    ]

