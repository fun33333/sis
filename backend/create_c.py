#!/usr/bin/env python
"""
Create campus-specific classes with proper shifts based on actual requirements
"""
import os
import sys
import django
import re

# Setup Django environment
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from classes.models import Level, Grade, ClassRoom
from campus.models import Campus
from teachers.models import Teacher

def clear_existing_data():
    """Clear all existing levels, grades, and classrooms"""
    print("Clearing existing data...")
    
    # Delete in reverse order to avoid foreign key constraints
    ClassRoom.objects.all().delete()
    Grade.objects.all().delete()
    Level.objects.all().delete()
    
    print("Existing data cleared!")

def extract_campus_number(campus_name):
    """Extract campus number from campus name (e.g., 'Campus 1' -> 1, 'Campus 8' -> 8)"""
    match = re.search(r'Campus\s*(\d+)', campus_name)
    if match:
        return int(match.group(1))
    return None

def create_campus_classes():
    """Create classes for each campus based on their specific requirements"""
    
    # Get actual campuses
    actual_campuses = Campus.objects.all()
    print(f"Found {actual_campuses.count()} campuses:")
    for campus in actual_campuses:
        campus_num = extract_campus_number(campus.campus_name)
        print(f"  ID: {campus.id}, Name: {campus.campus_name}, Number: {campus_num}")
    
    # Campus-specific class configurations - using campus name numbers
    campus_configs = {
        1: {  # Campus 1
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
        },
        2: {  # Campus 2
            'morning': {
                'levels': ['Pre-Primary', 'Primary', 'Secondary'],
                'grades': {
                    'Pre-Primary': ['Nursery', 'KG-I', 'KG-II'],
                    'Primary': ['Grade 1', 'Grade 2', 'Grade 3', 'Grade 4', 'Grade 5'],
                    'Secondary': ['Grade 6', 'Grade 7', 'Grade 8', 'Grade 9', 'Grade 10']
                }
            }
        },
        3: {  # Campus 3
            'morning': {
                'levels': ['Pre-Primary', 'Primary', 'Secondary'],
                'grades': {
                    'Pre-Primary': ['Nursery', 'KG-I', 'KG-II'],
                    'Primary': ['Grade 1', 'Grade 2', 'Grade 3', 'Grade 4', 'Grade 5'],
                    'Secondary': ['Grade 6', 'Grade 7', 'Grade 8', 'Grade 9', 'Grade 10']
                }
            }
        },
        4: {  # Campus 4
            'morning': {
                'levels': ['Pre-Primary', 'Primary', 'Secondary'],
                'grades': {
                    'Pre-Primary': ['Nursery', 'KG-I', 'KG-II'],
                    'Primary': ['Grade 1', 'Grade 2', 'Grade 3', 'Grade 4', 'Grade 5'],
                    'Secondary': ['Grade 6', 'Grade 7', 'Grade 8', 'Grade 9', 'Grade 10']
                }
            }
        },
        5: {  # Campus 5
            'morning': {
                'levels': ['Pre-Primary', 'Primary', 'Secondary'],
                'grades': {
                    'Pre-Primary': ['Nursery', 'KG-I', 'KG-II'],
                    'Primary': ['Grade 1', 'Grade 2', 'Grade 3', 'Grade 4', 'Grade 5'],
                    'Secondary': ['Grade 6', 'Grade 7', 'Grade 8', 'Grade 9', 'Grade 10']
                }
            }
        },
        6: {  # Campus 6
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
        },
        8: {  # Campus 8
            'morning': {
                'levels': ['Primary', 'Secondary'],
                'grades': {
                    'Primary': ['Grade 1', 'Grade 2', 'Grade 3', 'Grade 4', 'Grade 5'],
                    'Secondary': ['Grade 6', 'Grade 7', 'Grade 8', 'Grade 9', 'Grade 10']
                }
            }
        }
    }
    
    print(f"\nCampus configurations defined for {len(campus_configs)} campus numbers")
    
    total_classes_created = 0
    
    # Process each campus
    for campus in actual_campuses:
        try:
            campus_num = extract_campus_number(campus.campus_name)
            if not campus_num or campus_num not in campus_configs:
                print(f"Campus '{campus.campus_name}' not configured (Number: {campus_num})")
                continue
                
            shifts_config = campus_configs[campus_num]
            print(f"\nProcessing Campus: {campus.campus_name} (Number: {campus_num}, ID: {campus.id})")
            
            for shift_name, shift_config in shifts_config.items():
                print(f"  Creating {shift_name.title()} shift classes...")
                
                # Create levels for this shift with duplicate checking
                levels = {}
                for level_name in shift_config['levels']:
                    # Check if level already exists
                    existing_level = Level.objects.filter(
                        name=level_name,
                        campus=campus
                    ).first()
                    
                    if existing_level:
                        level = existing_level
                        created = False
                        print(f"    Level: {level.name} (Found) - {level.code}")
                    else:
                        # Create new level (code will be auto-generated)
                        level = Level(name=level_name, campus=campus)
                        level.save()
                        created = True
                        print(f"    Level: {level.name} (Created) - {level.code}")
                    
                    levels[level_name] = level
                
                # Create grades for this shift with duplicate checking
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
                            print(f"    Grade: {grade.name} (Found) - {grade.code}")
                        else:
                            # Create new grade (code will be auto-generated)
                            grade = Grade(name=grade_name, level=level)
                            grade.save()
                            created = True
                            print(f"    Grade: {grade.name} (Created) - {grade.code}")
                        
                        grades[grade_name] = grade
                
                # Create classrooms for this shift with duplicate checking
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
                            print(f"      Class: {grade_name} - {section} ({shift_name}) - {classroom.code} (Found)")
                        else:
                            # Create new classroom (code will be auto-generated)
                            classroom = ClassRoom(
                                grade=grade,
                                section=section,
                                shift=shift_name,
                                capacity=30
                            )
                            classroom.save()
                            created = True
                            shift_classes_created += 1
                            print(f"      Class: {grade_name} - {section} ({shift_name}) - {classroom.code} (Created)")
                
                print(f"    Created {shift_classes_created} classes for {shift_name.title()} shift")
                total_classes_created += shift_classes_created
        
        except Exception as e:
            print(f"Error processing Campus '{campus.campus_name}': {str(e)}")
            continue
    
    print(f"\nTotal classes created: {total_classes_created}")
    return total_classes_created

def assign_teachers_shift_wise():
    """Assign teachers to classes based on their shift and campus"""
    print("\nAssigning teachers shift-wise...")
    
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
                print(f"  No campus assigned to teacher")
                error_count += 1
                continue
            
            # Extract grade from class string
            grade_name = extract_grade_from_class_string(class_string)
            
            if not grade_name:
                print(f"  Could not extract grade from: {class_string}")
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
                    
                    print(f"  Assigned to {classroom} ({teacher_shift}) - {classroom.code}")
                    assigned_count += 1
                else:
                    print(f"  No available classroom found for {grade_name} in {teacher_shift} shift")
                    error_count += 1
                    
            except Grade.DoesNotExist:
                print(f"  Grade '{grade_name}' not found in campus {teacher_campus.campus_name}")
                error_count += 1
                
        except Exception as e:
            print(f"  Error processing {teacher.full_name}: {str(e)}")
            error_count += 1
    
    print(f"\nTeacher Assignment Summary:")
    print(f"  Successfully assigned: {assigned_count} teachers")
    print(f"  Errors: {error_count} teachers")
    
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

def assign_students_to_classrooms():
    """Assign students to classrooms based on their campus, grade, and section"""
    print("\nAssigning students to classrooms...")
    
    from students.models import Student
    from django.db.models import Q
    
    # Get all students with campus and grade information
    students_with_data = Student.objects.filter(
        campus__isnull=False,
        current_grade__isnull=False,
        current_grade__gt='',
        is_draft=False
    ).exclude(
        current_grade__in=['', ' ', 'N/A', 'None']
    )
    
    print(f"Found {students_with_data.count()} students with grade information")
    
    assigned_count = 0
    error_count = 0
    not_found_count = 0
    
    for student in students_with_data:
        try:
            campus = student.campus
            current_grade = student.current_grade.strip()
            section = student.section.strip() if student.section else 'A'  # Default to 'A' if no section
            
            print(f"\nProcessing: {student.name} | Campus: {campus.campus_name} | Grade: {current_grade} | Section: {section}")
            
            # Normalize grade names for matching
            grade_name_variations = [
                current_grade,
                current_grade.replace('-', ' '),  # Grade-4 -> Grade 4
                current_grade.replace(' ', '-'),  # Grade 4 -> Grade-4
                current_grade.replace('Grade', '').strip(),  # Grade 4 -> 4
                f"Grade {current_grade.replace('Grade', '').strip()}",  # 4 -> Grade 4
                # Handle KG variations
                current_grade.replace('KG-', 'KG '),  # KG-1 -> KG 1
                current_grade.replace('KG ', 'KG-'),  # KG 1 -> KG-1
                current_grade.replace('KG-I', 'KG 1'),  # KG-I -> KG 1
                current_grade.replace('KG-II', 'KG 2'),  # KG-II -> KG 2
                current_grade.replace('KG 1', 'KG-I'),  # KG 1 -> KG-I
                current_grade.replace('KG 2', 'KG-II'),  # KG 2 -> KG-II
            ]
            
            # Find matching grade in the same campus
            grade_query = Q()
            for grade_var in grade_name_variations:
                grade_query |= Q(name__icontains=grade_var)
            
            try:
                grade = Grade.objects.filter(
                    level__campus=campus
                ).filter(grade_query).first()
                
                if not grade:
                    print(f"  Grade '{current_grade}' not found in campus {campus.campus_name}")
                    not_found_count += 1
                    continue
                
                # Find matching classroom
                classroom = ClassRoom.objects.filter(
                    grade=grade,
                    section=section
                ).first()
                
                if not classroom:
                    # Try to find any classroom for this grade if exact section not found
                    classroom = ClassRoom.objects.filter(
                        grade=grade
                    ).first()
                    
                    if classroom:
                        print(f"  Section '{section}' not found, assigning to section '{classroom.section}'")
                    else:
                        print(f"  No classroom found for grade '{grade.name}' in campus {campus.campus_name}")
                        not_found_count += 1
                        continue
                
                # Assign student to classroom
                student.classroom = classroom
                student.save(update_fields=['classroom'])
                
                print(f"  Assigned to {classroom} ({classroom.shift}) - {classroom.code}")
                assigned_count += 1
                
            except Exception as e:
                print(f"  Error finding classroom for {student.name}: {str(e)}")
                error_count += 1
                
        except Exception as e:
            print(f"  Error processing {student.name}: {str(e)}")
            error_count += 1
    
    print(f"\nStudent Assignment Summary:")
    print(f"  Successfully assigned: {assigned_count} students")
    print(f"  Errors: {error_count} students")
    print(f"  Not found: {not_found_count} students")
    
    return assigned_count, error_count, not_found_count

def main():
    print("Starting campus-specific class creation...")
    
    # Step 1: Clear existing data
    clear_existing_data()
    
    # Step 2: Create campus-specific classes
    total_classes = create_campus_classes()
    
    # Step 3: Assign teachers shift-wise
    assigned_teachers, error_teachers = assign_teachers_shift_wise()
    
    # Step 4: Assign students to classrooms
    assigned_students, error_students, not_found_students = assign_students_to_classrooms()
    
    print(f"\nProcess completed!")
    print(f"Total classes created: {total_classes}")
    print(f"Teachers assigned: {assigned_teachers}")
    print(f"Students assigned: {assigned_students}")
    print(f"Teacher errors: {error_teachers}")
    print(f"Student errors: {error_students}")
    print(f"Students not found: {not_found_students}")
    
    # Show some examples
    print(f"\nSample classes created:")
    sample_classes = ClassRoom.objects.all()[:10]
    for classroom in sample_classes:
        campus_name = classroom.grade.level.campus.campus_name
        teacher_name = classroom.class_teacher.full_name if classroom.class_teacher else "No teacher"
        student_count = classroom.students.count()
        print(f"  {classroom.code} - {campus_name} ({classroom.shift}) - {teacher_name} - {student_count} students")

if __name__ == "__main__":
    main()