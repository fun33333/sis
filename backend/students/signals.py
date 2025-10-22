from django.db.models.signals import post_save, pre_save
from django.dispatch import receiver
from .models import Student
from classes.models import ClassRoom
from teachers.models import Teacher
from coordinator.models import Coordinator
import logging

logger = logging.getLogger(__name__)


@receiver(post_save, sender=Student)
def update_student_assignments(sender, instance, created, **kwargs):
    """
    Automatically update student's teacher and coordinator assignments
    when academic details change
    """
    if created:
        # New student - assign teacher and coordinator
        assign_student_to_teacher_and_coordinator(instance)
    else:
        # Existing student - check if classroom changed
        if hasattr(instance, '_previous_classroom') and instance._previous_classroom != instance.classroom:
            logger.info(f"Student {instance.name} classroom changed from {instance._previous_classroom} to {instance.classroom}")
            assign_student_to_teacher_and_coordinator(instance)


@receiver(pre_save, sender=Student)
def store_previous_classroom(sender, instance, **kwargs):
    """
    Store previous classroom before save to detect changes
    """
    if instance.pk:
        try:
            old_instance = Student.objects.get(pk=instance.pk)
            instance._previous_classroom = old_instance.classroom
        except Student.DoesNotExist:
            instance._previous_classroom = None
    else:
        instance._previous_classroom = None


def assign_student_to_teacher_and_coordinator(student):
    """
    Assign student to appropriate teacher and coordinator based on academic details
    """
    try:
        # Get student's classroom
        classroom = student.classroom
        if not classroom:
            logger.warning(f"No classroom found for student {student.name}")
            return
        
        # Get classroom teacher
        class_teacher = classroom.class_teacher
        if class_teacher:
            logger.info(f"Student {student.name} is in classroom {classroom} with teacher {class_teacher.full_name}")
            
            # Auto-assign teacher to coordinators if not already assigned
            auto_assign_teacher_to_coordinators(class_teacher)
        else:
            logger.warning(f"No class teacher found for classroom {classroom}")
        
        # Note: Student model doesn't have coordinator fields, 
        # but teacher-coordinator assignment is handled above
        
    except Exception as e:
        logger.error(f"Error assigning student {student.name}: {str(e)}")


def auto_assign_teacher_to_coordinators(teacher):
    """
    Auto-assign teacher to coordinators based on teaching levels
    """
    try:
        # Get coordinators who manage the teacher's levels
        if teacher.assigned_classroom:
            classroom = teacher.assigned_classroom
            level = classroom.grade.level
            
            # Find coordinators for this level
            coordinators = Coordinator.objects.filter(
                level=level,
                is_currently_active=True
            )
            
            # Also check coordinators with assigned_levels
            coordinators_with_levels = Coordinator.objects.filter(
                assigned_levels=level,
                is_currently_active=True
            )
            
            all_coordinators = coordinators.union(coordinators_with_levels)
            
            # Assign teacher to coordinators
            for coordinator in all_coordinators:
                if not teacher.assigned_coordinators.filter(id=coordinator.id).exists():
                    teacher.assigned_coordinators.add(coordinator)
                    logger.info(f"Auto-assigned teacher {teacher.full_name} to coordinator {coordinator.full_name}")
        
        # Also handle assigned_classrooms (for multi-classroom teachers)
        for classroom in teacher.assigned_classrooms.all():
            level = classroom.grade.level
            
            coordinators = Coordinator.objects.filter(
                level=level,
                is_currently_active=True
            )
            
            coordinators_with_levels = Coordinator.objects.filter(
                assigned_levels=level,
                is_currently_active=True
            )
            
            all_coordinators = coordinators.union(coordinators_with_levels)
            
            for coordinator in all_coordinators:
                if not teacher.assigned_coordinators.filter(id=coordinator.id).exists():
                    teacher.assigned_coordinators.add(coordinator)
                    logger.info(f"Auto-assigned teacher {teacher.full_name} to coordinator {coordinator.full_name} (via classroom {classroom})")
                    
    except Exception as e:
        logger.error(f"Error auto-assigning teacher {teacher.full_name} to coordinators: {str(e)}")




@receiver(post_save, sender=ClassRoom)
def update_classroom_assignments(sender, instance, created, **kwargs):
    """
    When classroom changes, update all students in that classroom
    """
    if not created:  # Only for updates, not new classrooms
        try:
            # Get all students in this classroom
            students = Student.objects.filter(classroom=instance)
            
            for student in students:
                # Re-assign student to teacher and coordinators
                assign_student_to_teacher_and_coordinator(student)
                
            logger.info(f"Updated assignments for {students.count()} students in classroom {instance}")
            
        except Exception as e:
            logger.error(f"Error updating classroom assignments for {instance}: {str(e)}")


@receiver(post_save, sender=Teacher)
def update_teacher_assignments(sender, instance, created, **kwargs):
    """
    When teacher's classroom assignments change, update coordinator assignments
    """
    if not created:  # Only for updates
        try:
            # Auto-assign teacher to coordinators
            auto_assign_teacher_to_coordinators(instance)
            
            # Update all students in classrooms assigned to this teacher
            students = Student.objects.filter(classroom__class_teacher=instance)
            for student in students:
                assign_student_to_teacher_and_coordinator(student)
                
            logger.info(f"Updated assignments for teacher {instance.full_name}")
            
        except Exception as e:
            logger.error(f"Error updating teacher assignments for {instance.full_name}: {str(e)}")
