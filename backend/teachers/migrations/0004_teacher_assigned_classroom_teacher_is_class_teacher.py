# backend/teachers/migrations/0004_add_class_teacher_fields.py
from django.db import migrations, models
import django.db.models.deletion

class Migration(migrations.Migration):
    dependencies = [
        ('teachers', '0003_teacher_shift'),
        ('classes', '0001_initial'),
    ]

    operations = [
        migrations.AddField(
            model_name='teacher',
            name='is_class_teacher',
            field=models.BooleanField(default=False, help_text='Is this teacher a class teacher?'),
        ),
        migrations.AddField(
            model_name='teacher',
            name='assigned_classroom',
            field=models.ForeignKey(
                blank=True, 
                null=True, 
                on_delete=django.db.models.deletion.SET_NULL, 
                related_name='class_teacher_teacher', 
                to='classes.classroom',
                help_text='Classroom assigned to this class teacher'
            ),
        ),
    ]