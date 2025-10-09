from django.db.models.signals import post_save
from django.dispatch import receiver
from .models import ClassRoom

@receiver(post_save, sender=ClassRoom)
def sync_classroom_teacher_assignment(sender, instance, created, **kwargs):
    """
    Jab classroom mein teacher assign karte hain, to teacher ki assigned_classroom field bhi update karo
    """
    if instance.class_teacher:
        # Teacher ko classroom assign karo
        teacher = instance.class_teacher
        if teacher.assigned_classroom != instance:
            teacher.assigned_classroom = instance
            teacher.is_class_teacher = True
            teacher.save(update_fields=['assigned_classroom', 'is_class_teacher'])
            print(f"Synced: Teacher {teacher.full_name} assigned to classroom {instance}")
            
            # Auto-assign students to this classroom
            auto_assign_students_to_classroom(instance)
    else:
        # Agar classroom se teacher remove kiya gaya hai
        try:
            from teachers.models import Teacher
            teacher = Teacher.objects.get(assigned_classroom=instance)
            teacher.assigned_classroom = None
            teacher.is_class_teacher = False
            teacher.save(update_fields=['assigned_classroom', 'is_class_teacher'])
            print(f"Synced: Teacher {teacher.full_name} removed from classroom {instance}")
        except Teacher.DoesNotExist:
            pass

def auto_assign_students_to_classroom(classroom):
    """
    Automatically assign students to classroom based on campus and grade
    """
    try:
        from students.models import Student
        
        # Get classroom details
        campus = classroom.campus
        grade = classroom.grade
        section = classroom.section
        
        if not campus or not grade:
            print(f"Cannot assign students: Missing campus or grade for classroom {classroom}")
            return
        
        # Normalize grade names for matching
        grade_name_variations = [
            grade.name,
            grade.name.replace('-', ' '),  # Grade-4 -> Grade 4
            grade.name.replace(' ', '-'),  # Grade 4 -> Grade-4
        ]
        
        # Find students from same campus and grade who are not assigned to any classroom
        from django.db.models import Q
        grade_query = Q()
        for grade_var in grade_name_variations:
            grade_query |= Q(current_grade__icontains=grade_var)
        
        unassigned_students = Student.objects.filter(
            campus=campus,
            classroom__isnull=True,  # Not assigned to any classroom
            is_draft=False  # Only final students
        ).filter(grade_query)
        
        # Also check students who might be in wrong classroom
        wrong_classroom_students = Student.objects.filter(
            campus=campus,
            classroom__isnull=False,
            classroom__grade__name__icontains=grade.name,  # Same grade
            classroom__section=section  # Same section
        ).filter(grade_query).exclude(classroom=classroom)
        
        # Assign unassigned students
        assigned_count = 0
        for student in unassigned_students:
            student.classroom = classroom
            student.save(update_fields=['classroom'])
            assigned_count += 1
            print(f"Assigned student {student.name} to classroom {classroom}")
        
        # Reassign students from wrong classroom
        for student in wrong_classroom_students:
            student.classroom = classroom
            student.save(update_fields=['classroom'])
            assigned_count += 1
            print(f"Reassigned student {student.name} to classroom {classroom}")
        
        print(f"Auto-assigned {assigned_count} students to classroom {classroom}")
        
    except Exception as e:
        print(f"Error auto-assigning students to classroom {classroom}: {str(e)}")