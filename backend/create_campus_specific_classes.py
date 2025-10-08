#!/usr/bin/env python
"""
Create campus-specific classes with proper shifts based on actual requirements
"""
import os
import sys
import django

# Setup Django environment
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from classes.models import Level, Grade, ClassRoom
from campus.models import Campus
from teachers.models import Teacher

def clear_existing_data():
    """Clear all existing levels, grades, and classrooms"""
    print("🗑️ Clearing existing data...")
    
    # Delete in reverse order to avoid foreign key constraints
    ClassRoom.objects.all().delete()
    Grade.objects.all().delete()
    Level.objects.all().delete()
    
    print("✅ Existing data cleared!")

def create_campus_classes():
    """Create classes for each campus based on their specific requirements"""
    
    # Get actual campus IDs first
    actual_campuses = Campus.objects.all()
    print(f"Found {actual_campuses.count()} campuses:")
    for campus in actual_campuses:
        print(f"  ID: {campus.id}, Name: {campus.campus_name}")
    
    # Campus-specific class configurations - using actual campus IDs
    campus_configs = {}
    
    # Find campus by name and create configs
    for campus in actual_campuses:
        campus_name = campus.campus_name.lower()
        campus_id = campus.id
        
        if campus_id == 1:  # Campus 1
            campus_configs[campus_id] = {
                'morning': {
                    'levels': ['Pre-Primary', 'Primary', 'Secondary'],
                    'grades': {
                        'Pre-Primary': ['Nursery', 'KG-I', 'KG-II'],
                        'Primary': ['Grade 1', 'Grade 2', 'Grade 3', 'Grade 4', 'Grade 5'],
                        'Secondary': ['Grade 6', 'Grade 7', 'Grade 8', 'Grade 9', 'Grade 10']
                    }
                },
                'afternoon': {
                    'levels': ['Pre-Primary', 'Primary'],
                    'grades': {
                        'Pre-Primary': ['Nursery', 'KG-I', 'KG-II'],
                        'Primary': ['Grade 1', 'Grade 2', 'Grade 3', 'Grade 4', 'Grade 5']
                    }
                }
            }
        elif campus_id == 2:  # Campus 2
            campus_configs[campus_id] = {
                'morning': {
                    'levels': ['Pre-Primary', 'Primary', 'Secondary'],
                    'grades': {
                        'Pre-Primary': ['Nursery', 'KG-I', 'KG-II'],
                        'Primary': ['Grade 1', 'Grade 2', 'Grade 3', 'Grade 4', 'Grade 5'],
                        'Secondary': ['Grade 6', 'Grade 7']
                    }
                }
            }
        elif campus_id == 3:  # Campus 3
            campus_configs[campus_id] = {
                'morning': {
                    'levels': ['Primary', 'Secondary'],
                    'grades': {
                        'Primary': ['Grade 1', 'Grade 2', 'Grade 3', 'Grade 4', 'Grade 5'],
                        'Secondary': ['Grade 6', 'Grade 7', 'Grade 8', 'Grade 9', 'Grade 10']
                    }
                }
            }
        elif campus_id == 4:  # Campus 4
            campus_configs[campus_id] = {
                'morning': {
                    'levels': ['Pre-Primary', 'Primary', 'Secondary'],
                    'grades': {
                        'Pre-Primary': ['Nursery', 'KG-I', 'KG-II'],
                        'Primary': ['Grade 1', 'Grade 2', 'Grade 3', 'Grade 4', 'Grade 5'],
                        'Secondary': ['Grade 6', 'Grade 7', 'Grade 8', 'Grade 9', 'Grade 10']
                    }
                }
            }
        elif campus_id == 5:  # Campus 5
            campus_configs[campus_id] = {
                'morning': {
                    'levels': ['Pre-Primary', 'Primary'],
                    'grades': {
                        'Pre-Primary': ['Nursery', 'KG-I', 'KG-II'],
                        'Primary': ['Grade 1', 'Grade 2', 'Grade 3', 'Grade 4', 'Grade 5']
                    }
                }
            }
        elif campus_id == 6:  # Campus 6
            campus_configs[campus_id] = {
                'morning': {
                    'levels': ['Pre-Primary', 'Primary', 'Secondary'],
                    'grades': {
                        'Pre-Primary': ['Nursery', 'KG-I', 'KG-II'],
                        'Primary': ['Grade 1', 'Grade 2', 'Grade 3', 'Grade 4', 'Grade 5'],
                        'Secondary': ['Grade 6', 'Grade 7', 'Grade 8', 'Grade 9', 'Grade 10']
                    }
                },
                'afternoon': {
                    'levels': ['Pre-Primary', 'Primary'],
                    'grades': {
                        'Pre-Primary': ['Nursery', 'KG-I', 'KG-II'],
                        'Primary': ['Grade 1', 'Grade 2', 'Grade 3', 'Grade 4', 'Grade 5']
                    }
                }
            }
        elif campus_id == 7:  # Campus 8 (ID 7 in database)
            campus_configs[campus_id] = {
                'morning': {
                    'levels': ['Primary', 'Secondary'],
                    'grades': {
                        'Primary': ['Grade 1', 'Grade 2', 'Grade 3', 'Grade 4', 'Grade 5'],
                        'Secondary': ['Grade 6', 'Grade 7', 'Grade 8', 'Grade 9', 'Grade 10']
                    }
                }
            }
    
    print(f"\nCampus configurations created for {len(campus_configs)} campuses")
    
    total_classes_created = 0
    
    for campus_id, shifts_config in campus_configs.items():
        try:
            campus = Campus.objects.get(id=campus_id)
            print(f"\n🏫 Processing Campus {campus_id}: {campus.campus_name}")
            
            for shift_name, shift_config in shifts_config.items():
                print(f"  📚 Creating {shift_name.title()} shift classes...")
                
                # Create levels for this shift
                levels = {}
                for level_name in shift_config['levels']:
                    level, created = Level.objects.get_or_create(
                        name=level_name,
                        campus=campus,
                        defaults={'code': f'C{campus_id:02d}-L{["Pre-Primary", "Primary", "Secondary"].index(level_name) + 1}'}
                    )
                    levels[level_name] = level
                    print(f"    Level: {level.name} ({'Created' if created else 'Found'})")
                
                # Create grades for this shift
                grades = {}
                for level_name, grade_names in shift_config['grades'].items():
                    level = levels[level_name]
                    for grade_name in grade_names:
                        # Check if grade already exists for this level
                        existing_grade = Grade.objects.filter(
                            name=grade_name,
                            level=level
                        ).first()
                        
                        if existing_grade:
                            grade = existing_grade
                            created = False
                        else:
                            # Create new grade - code will be auto-generated by model save method
                            grade = Grade(name=grade_name, level=level)
                            grade.save()  # This will trigger code generation
                            created = True
                        grades[grade_name] = grade
                        print(f"    Grade: {grade.name} ({'Created' if created else 'Found'})")
                
                # Create classrooms for this shift
                sections = ['A', 'B', 'C']
                shift_classes_created = 0
                
                for grade_name, grade in grades.items():
                    for section in sections:
                        # Check if classroom already exists
                        existing_classroom = ClassRoom.objects.filter(
                            grade=grade,
                            section=section,
                            shift=shift_name
                        ).first()
                        
                        if existing_classroom:
                            classroom = existing_classroom
                            created = False
                        else:
                            # Create new classroom - code will be auto-generated by model save method
                            classroom = ClassRoom(
                                grade=grade,
                                section=section,
                                shift=shift_name,
                                capacity=30
                            )
                            classroom.save()  # This will trigger code generation
                            created = True
                        if created:
                            shift_classes_created += 1
                            print(f"      Class: {grade_name} - {section} ({shift_name}) - {classroom.code}")
                
                print(f"    ✅ Created {shift_classes_created} classes for {shift_name.title()} shift")
                total_classes_created += shift_classes_created
        
        except Campus.DoesNotExist:
            print(f"❌ Campus {campus_id} not found!")
            continue
        except Exception as e:
            print(f"❌ Error processing Campus {campus_id}: {str(e)}")
            continue
    
    print(f"\n🎉 Total classes created: {total_classes_created}")
    return total_classes_created

def assign_teachers_shift_wise():
    """Assign teachers to classes based on their shift and campus"""
    print("\n👨‍🏫 Assigning teachers shift-wise...")
    
    # Get all teachers with class information
    teachers_with_classes = Teacher.objects.filter(
        current_classes_taught__isnull=False,
        current_classes_taught__gt=''
    ).exclude(
        current_classes_taught__in=['', ' ', 'N/A', 'None']
    )
    
    print(f"Found {teachers_with_classes.count()} teachers with class information")
    
    assigned_count = 0
    error_count = 0
    
    for teacher in teachers_with_classes:
        try:
            class_string = teacher.current_classes_taught
            print(f"\nProcessing: {teacher.full_name} | Classes: {class_string}")
            
            # Get teacher's campus and shift
            teacher_campus = teacher.current_campus
            teacher_shift = teacher.shift or 'morning'  # Default to morning
            
            if not teacher_campus:
                print(f"  ❌ No campus assigned to teacher")
                error_count += 1
                continue
            
            # Extract grade from class string
            grade_name = extract_grade_from_class_string(class_string)
            
            if not grade_name:
                print(f"  ❌ Could not extract grade from: {class_string}")
                error_count += 1
                continue
            
            # Find matching classroom based on campus, shift, and grade
            try:
                grade = Grade.objects.get(
                    name=grade_name,
                    level__campus=teacher_campus
                )
                
                # Find available classroom for this grade and shift
                available_classrooms = ClassRoom.objects.filter(
                    grade=grade,
                    shift=teacher_shift,
                    class_teacher__isnull=True
                )
                
                if available_classrooms.exists():
                    classroom = available_classrooms.first()
                    
                    # Assign teacher to classroom
                    teacher.assigned_classroom = classroom
                    teacher.is_class_teacher = True
                    teacher.save()
                    
                    classroom.class_teacher = teacher
                    classroom.save()
                    
                    print(f"  ✅ Assigned to {classroom} ({teacher_shift}) - {classroom.code}")
                    assigned_count += 1
                else:
                    print(f"  ❌ No available classroom found for {grade_name} in {teacher_shift} shift")
                    error_count += 1
                    
            except Grade.DoesNotExist:
                print(f"  ❌ Grade '{grade_name}' not found in campus {teacher_campus.campus_name}")
                error_count += 1
                
        except Exception as e:
            print(f"  ❌ Error processing {teacher.full_name}: {str(e)}")
            error_count += 1
    
    print(f"\n📊 Teacher Assignment Summary:")
    print(f"  ✅ Successfully assigned: {assigned_count} teachers")
    print(f"  ❌ Errors: {error_count} teachers")
    
    return assigned_count, error_count

def extract_grade_from_class_string(class_string):
    """Extract grade from class string like 'Grade 1', 'Nursery', 'KG-I', etc."""
    if not class_string:
        return None
    
    class_string = class_string.strip()
    
    # Handle different patterns
    patterns = [
        r'Grade\s*(\d+)',  # Grade 1, Grade 2, etc.
        r'Grade-(\d+)',    # Grade-1, Grade-2, etc.
        r'(\d+)',          # Just numbers
        r'Nursery',        # Nursery
        r'KG-I',           # KG-I
        r'KG-II',          # KG-II
        r'KG\s*I',         # KG I
        r'KG\s*II',        # KG II
    ]
    
    import re
    for pattern in patterns:
        match = re.search(pattern, class_string, re.IGNORECASE)
        if match:
            if 'nursery' in class_string.lower():
                return 'Nursery'
            elif 'kg' in class_string.lower() and 'ii' in class_string.lower():
                return 'KG-II'
            elif 'kg' in class_string.lower() and 'i' in class_string.lower():
                return 'KG-I'
            elif 'grade' in class_string.lower():
                return f"Grade {match.group(1)}"
            else:
                # Try to convert number to Grade
                try:
                    num = int(match.group(1))
                    return f"Grade {num}"
                except:
                    return None
    
    return None

def main():
    print("🚀 Starting campus-specific class creation...")
    
    # Step 1: Clear existing data
    clear_existing_data()
    
    # Step 2: Create campus-specific classes
    total_classes = create_campus_classes()
    
    # Step 3: Assign teachers shift-wise
    assigned_teachers, error_teachers = assign_teachers_shift_wise()
    
    print(f"\n🎉 Process completed!")
    print(f"📚 Total classes created: {total_classes}")
    print(f"👨‍🏫 Teachers assigned: {assigned_teachers}")
    print(f"❌ Teacher errors: {error_teachers}")
    
    # Show some examples
    print(f"\n📝 Sample classes created:")
    sample_classes = ClassRoom.objects.all()[:10]
    for classroom in sample_classes:
        campus_name = classroom.grade.level.campus.campus_name
        teacher_name = classroom.class_teacher.full_name if classroom.class_teacher else "No teacher"
        print(f"  {classroom.code} - {campus_name} ({classroom.shift}) - {teacher_name}")

if __name__ == "__main__":
    main()
