#!/usr/bin/env python
import os
import django

# Django setup
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "backend.settings")
django.setup()

from classes.models import ClassRoom
from teachers.models import Teacher

def assign_teachers_to_classrooms():
    """Assign teachers to classrooms based on campus and grade"""
    
    # Get all classrooms without teachers
    classrooms_without_teachers = ClassRoom.objects.filter(class_teacher__isnull=True)
    print(f"Found {classrooms_without_teachers.count()} classrooms without teachers")
    
    assigned_count = 0
    
    for classroom in classrooms_without_teachers:
        try:
            # Find teachers for this campus and grade
            campus = classroom.grade.level.campus
            grade_name = classroom.grade.name
            
            # Try to find a teacher for this specific grade
            teacher = Teacher.objects.filter(
                current_campus=campus,
                current_subjects__icontains=grade_name
            ).first()
            
            # If no specific teacher found, find any teacher for this campus
            if not teacher:
                teacher = Teacher.objects.filter(
                    current_campus=campus
                ).first()
            
            if teacher:
                classroom.class_teacher = teacher
                classroom.save()
                print(f"Assigned {teacher.full_name} ({teacher.employee_code}) to {classroom}")
                assigned_count += 1
            else:
                print(f"No teacher found for {classroom}")
                
        except Exception as e:
            print(f"Error assigning teacher to {classroom}: {e}")
    
    print(f"Assigned teachers to {assigned_count} classrooms")

if __name__ == "__main__":
    assign_teachers_to_classrooms()
