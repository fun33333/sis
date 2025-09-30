from django.db.models.signals import post_save, post_delete
from django.dispatch import receiver
from django.utils import timezone
from .models import Attendance, AttendanceSummary


@receiver(post_save, sender=Attendance)
def update_attendance_summary(sender, instance, created, **kwargs):
    """
    Update attendance summary when attendance is created or updated
    """
    if instance.date:
        month = instance.date.month
        year = instance.date.year
        
        # Get or create summary for this student, classroom, and month
        summary, created = AttendanceSummary.objects.get_or_create(
            student=instance.student,
            classroom=instance.classroom,
            campus=instance.campus,
            month=month,
            year=year,
            defaults={
                'academic_year': f"{year}-{year + 1}",
                'total_days': 0,
                'present_days': 0,
                'absent_days': 0,
                'late_days': 0,
                'excused_days': 0,
                'half_days': 0
            }
        )
        
        # Recalculate summary for this month
        attendances = Attendance.objects.filter(
            student=instance.student,
            classroom=instance.classroom,
            campus=instance.campus,
            date__month=month,
            date__year=year
        )
        
        summary.total_days = attendances.count()
        summary.present_days = attendances.filter(status__in=['present', 'late']).count()
        summary.absent_days = attendances.filter(status='absent').count()
        summary.late_days = attendances.filter(status='late').count()
        summary.excused_days = attendances.filter(status='excused').count()
        
        summary.save()


@receiver(post_delete, sender=Attendance)
def update_attendance_summary_on_delete(sender, instance, **kwargs):
    """
    Update attendance summary when attendance is deleted
    """
    if instance.date:
        month = instance.date.month
        year = instance.date.year
        
        try:
            summary = AttendanceSummary.objects.get(
                student=instance.student,
                classroom=instance.classroom,
                campus=instance.campus,
                month=month,
                year=year
            )
            
            # Recalculate summary for this month
            attendances = Attendance.objects.filter(
                student=instance.student,
                classroom=instance.classroom,
                campus=instance.campus,
                date__month=month,
                date__year=year
            )
            
            if attendances.exists():
                summary.total_days = attendances.count()
                summary.present_days = attendances.filter(status__in=['present', 'late']).count()
                summary.absent_days = attendances.filter(status='absent').count()
                summary.late_days = attendances.filter(status='late').count()
                summary.excused_days = attendances.filter(status='excused').count()
                summary.save()
            else:
                # No more attendances for this month, delete the summary
                summary.delete()
                
        except AttendanceSummary.DoesNotExist:
            pass
