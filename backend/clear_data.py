#!/usr/bin/env python
import os
import django

# Django setup
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "backend.settings")
django.setup()

from students.models import Student
from classes.models import ClassRoom
from teachers.models import Teacher

def clear_student_data():
    """Clear all student data and teacher assignments"""
    print("Clearing student data...")
    
    # Clear all students
    student_count = Student.objects.count()
    Student.objects.all().delete()
    print(f"Deleted {student_count} students")
    
    # Clear teacher assignments from classrooms
    classrooms = ClassRoom.objects.all()
    for classroom in classrooms:
        classroom.class_teacher = None
        classroom.save()
    
    print(f"Cleared teacher assignments from {classrooms.count()} classrooms")
    
    print("Student data cleared successfully!")

if __name__ == "__main__":
    clear_student_data()
