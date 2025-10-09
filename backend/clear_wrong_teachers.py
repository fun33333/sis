#!/usr/bin/env python
import os
import django

# Django setup
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "backend.settings")
django.setup()

from classes.models import ClassRoom
from teachers.models import Teacher

def clear_wrong_teacher_assignments():
    """Clear teachers assigned to wrong campuses"""
    
    print("Clearing wrong teacher assignments...")
    
    cleared_count = 0
    
    # Get all classrooms with teachers
    classrooms_with_teachers = ClassRoom.objects.filter(class_teacher__isnull=False)
    
    for classroom in classrooms_with_teachers:
        teacher = classroom.class_teacher
        classroom_campus = classroom.grade.level.campus
        teacher_campus = teacher.current_campus
        
        # Check if teacher is from different campus
        if teacher_campus != classroom_campus:
            print(f"Clearing: {teacher.full_name} ({teacher.employee_code}) from {classroom}")
            print(f"  Teacher Campus: {teacher_campus}")
            print(f"  Classroom Campus: {classroom_campus}")
            
            classroom.class_teacher = None
            classroom.save()
            cleared_count += 1
    
    print(f"Cleared {cleared_count} wrong teacher assignments")

if __name__ == "__main__":
    clear_wrong_teacher_assignments()
