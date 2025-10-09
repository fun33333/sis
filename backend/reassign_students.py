#!/usr/bin/env python
import os
import django

# Django setup
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "backend.settings")
django.setup()

from students.models import Student
from classes.models import ClassRoom, Grade

def reassign_students_correctly():
    """Re-assign students to correct grades"""
    
    print("Re-assigning students to correct grades...")
    
    # Clear all student classroom assignments first
    Student.objects.update(classroom=None)
    print("Cleared all student classroom assignments")
    
    reassigned_count = 0
    error_count = 0
    
    # Get students without classrooms
    students = Student.objects.filter(classroom__isnull=True)
    
    for student in students:
        try:
            if not student.current_grade or not student.campus:
                continue
                
            grade_name = student.current_grade.strip()
            section = student.section.strip() if student.section else 'A'
            
            # Enhanced grade matching
            grade_name_variations = [
                grade_name,
                grade_name.replace('-', ' '),
                grade_name.replace(' ', '-'),
                grade_name.replace('KG-1', 'KG-I'),
                grade_name.replace('KG-2', 'KG-II'),
                grade_name.replace('KG1', 'KG-I'),
                grade_name.replace('KG2', 'KG-II'),
                grade_name.replace('KG 1', 'KG-I'),
                grade_name.replace('KG 2', 'KG-II'),
                f"Grade {grade_name.replace('Grade', '').strip()}",
            ]
            
            grade = None
            for grade_var in grade_name_variations:
                try:
                    grade = Grade.objects.get(
                        name__iexact=grade_var,
                        level__campus=student.campus
                    )
                    break
                except Grade.DoesNotExist:
                    continue
            
            if grade:
                # Find classroom for this grade and section
                classroom = ClassRoom.objects.filter(
                    grade=grade,
                    section=section
                ).first()
                
                if classroom:
                    student.classroom = classroom
                    student.save()
                    print(f"Assigned {student.name} to {classroom}")
                    reassigned_count += 1
                else:
                    print(f"No classroom found for {student.name} - Grade: {grade}, Section: {section}")
            else:
                print(f"Grade '{grade_name}' not found for {student.name} in campus {student.campus}")
                
        except Exception as e:
            print(f"Error processing {student.name}: {e}")
            error_count += 1
    
    print(f"Re-assigned {reassigned_count} students")
    print(f"Errors: {error_count} students")

if __name__ == "__main__":
    reassign_students_correctly()
