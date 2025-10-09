from django.db.models.signals import post_save
from django.dispatch import receiver
from coordinator.models import Coordinator
from teachers.models import Teacher
from classes.models import Grade

@receiver(post_save, sender=Coordinator)
def auto_assign_teachers_to_new_coordinator(sender, instance, created, **kwargs):
    """
    Automatically assign teachers to newly created coordinators
    """
    if created and instance.is_currently_active:
        print(f"New coordinator created: {instance.full_name} for {instance.level.name} in {instance.campus.campus_name}")
        
        try:
            # Get grades for this coordinator's level
            grades = Grade.objects.filter(level=instance.level)
            grade_names = [g.name for g in grades]
            
            if not grade_names:
                print(f"No grades found for level {instance.level.name}")
                return
            
            # Find teachers for this campus and level who don't have coordinators
            teachers = Teacher.objects.filter(
                current_campus=instance.campus,
                assigned_coordinator__isnull=True,
                current_classes_taught__isnull=False
            )
            
            assigned_count = 0
            for teacher in teachers:
                try:
                    # Extract grade from current_classes_taught
                    classes_text = teacher.current_classes_taught.lower()
                    grade_name = None
                    
                    # Try to extract grade from classes taught
                    import re
                    grade_match = re.search(r'grade\s*[-]?\s*(\d+)', classes_text)
                    if grade_match:
                        grade_number = grade_match.group(1)
                        grade_name = f"Grade-{grade_number}"
                    else:
                        # Check for Pre-Primary classes
                        if any(term in classes_text for term in ['nursery', 'kg-1', 'kg-2', 'kg1', 'kg2', 'kg-ii', 'kg-i']):
                            if 'nursery' in classes_text:
                                grade_name = 'Nursary'
                            elif 'kg-1' in classes_text or 'kg1' in classes_text or 'kg-i' in classes_text:
                                grade_name = 'KG-1'
                            elif 'kg-2' in classes_text or 'kg2' in classes_text or 'kg-ii' in classes_text:
                                grade_name = 'KG-2'
                    
                    if grade_name and grade_name in grade_names:
                        teacher.assigned_coordinator = instance
                        teacher.save(update_fields=['assigned_coordinator'])
                        assigned_count += 1
                        print(f"Auto-assigned teacher {teacher.full_name} to coordinator {instance.full_name}")
                        
                except Exception as e:
                    print(f"Error assigning teacher {teacher.full_name}: {str(e)}")
            
            print(f"Auto-assigned {assigned_count} teachers to coordinator {instance.full_name}")
            
        except Exception as e:
            print(f"Error auto-assigning teachers to coordinator {instance.full_name}: {str(e)}")