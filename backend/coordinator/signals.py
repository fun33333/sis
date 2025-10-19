from django.db.models.signals import post_save
from django.dispatch import receiver
from coordinator.models import Coordinator
from teachers.models import Teacher
from classes.models import Grade
from services.user_creation_service import UserCreationService

@receiver(post_save, sender=Coordinator)
def create_coordinator_user(sender, instance, created, **kwargs):
    """Auto-create user when coordinator is created"""
    if created:
        try:
            # Check if user already exists
            from users.models import User
            if User.objects.filter(email=instance.email).exists():
                print(f"User already exists for coordinator {instance.full_name}")
                return
            
            user, message = UserCreationService.create_user_from_entity(instance, 'coordinator')
            if not user:
                print(f"Failed to create user for coordinator {instance.id}: {message}")
            else:
                print(f"✅ Created user for coordinator: {instance.full_name} ({instance.employee_code})")
        except Exception as e:
            print(f"Error creating user for coordinator {instance.id}: {str(e)}")

@receiver(post_save, sender=Coordinator)
def auto_assign_teachers_to_new_coordinator(sender, instance, created, **kwargs):
    """
    Automatically assign teachers to newly created coordinators
    """
    if created and instance.is_currently_active:
        level_name = instance.level.name if instance.level else "No Level"
        campus_name = instance.campus.campus_name if instance.campus else "No Campus"
        print(f"New coordinator created: {instance.full_name} for {level_name} in {campus_name}")
        
        try:
            # Check if level is assigned
            if not instance.level:
                print(f"No level assigned to coordinator {instance.full_name}")
                return
                
            # Get grades for this coordinator's level
            grades = Grade.objects.filter(level=instance.level)
            grade_names = [g.name for g in grades]
            
            if not grade_names:
                print(f"No grades found for level {instance.level.name}")
                return
            
            # Find teachers for this campus who teach grades in this level
            teachers = Teacher.objects.filter(
                current_campus=instance.campus,
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
                        grade_name = f"Grade {grade_number}"  # Use space format to match database
                    else:
                        # Check for Pre-Primary classes
                        if any(term in classes_text for term in ['nursery', 'kg-1', 'kg-2', 'kg1', 'kg2', 'kg-ii', 'kg-i']):
                            if 'nursery' in classes_text:
                                grade_name = 'Nursery'  # Fix typo
                            elif 'kg-1' in classes_text or 'kg1' in classes_text or 'kg-i' in classes_text:
                                grade_name = 'KG-I'  # Use database format
                            elif 'kg-2' in classes_text or 'kg2' in classes_text or 'kg-ii' in classes_text:
                                grade_name = 'KG-II'  # Use database format
                    
                    if grade_name and grade_name in grade_names:
                        # Add coordinator (not replace) - use ManyToMany
                        if instance not in teacher.assigned_coordinators.all():
                            teacher.assigned_coordinators.add(instance)
                            assigned_count += 1
                            print(f"Added coordinator {instance.full_name} to {teacher.full_name}")
                        
                except Exception as e:
                    print(f"Error assigning teacher {teacher.full_name}: {str(e)}")
            
            print(f"Auto-assigned {assigned_count} teachers to coordinator {instance.full_name}")
            
        except Exception as e:
            print(f"Error auto-assigning teachers to coordinator {instance.full_name}: {str(e)}")