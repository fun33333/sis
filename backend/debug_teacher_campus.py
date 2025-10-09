#!/usr/bin/env python
import os
import sys
import django

# Add the backend directory to Python path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from teachers.models import Teacher
from campus.models import Campus
from classes.models import Grade, ClassRoom

def debug_teacher_campus():
    print("🔍 Debugging Teacher Campus Assignment...")
    
    # Get all teachers with classes
    teachers = Teacher.objects.filter(current_classes_taught__isnull=False)
    print(f"📊 Total teachers with classes: {teachers.count()}")
    
    # Check campus distribution
    campus_counts = {}
    for teacher in teachers:
        campus_name = teacher.current_campus.campus_name if teacher.current_campus else "None"
        campus_counts[campus_name] = campus_counts.get(campus_name, 0) + 1
    
    print("\n📈 Teacher distribution by campus:")
    for campus, count in campus_counts.items():
        print(f"  {campus}: {count} teachers")
    
    # Check available classrooms by campus
    print("\n🏫 Available classrooms by campus:")
    for campus in Campus.objects.all():
        classrooms = ClassRoom.objects.filter(grade__level__campus=campus)
        print(f"  {campus.campus_name}: {classrooms.count()} classrooms")
        
        # Show sample classrooms
        for classroom in classrooms[:3]:
            print(f"    - {classroom.grade.name} - {classroom.section} ({classroom.shift})")
    
    # Check grade distribution
    print("\n📚 Available grades by campus:")
    for campus in Campus.objects.all():
        grades = Grade.objects.filter(level__campus=campus)
        print(f"  {campus.campus_name}: {grades.count()} grades")
        grade_names = [g.name for g in grades]
        print(f"    Grades: {', '.join(grade_names)}")
    
    # Sample teacher analysis
    print("\n👨‍🏫 Sample teacher analysis:")
    for teacher in teachers[:5]:
        campus_name = teacher.current_campus.campus_name if teacher.current_campus else "None"
        print(f"  {teacher.full_name}")
        print(f"    Campus: {campus_name}")
        print(f"    Classes: {teacher.current_classes_taught}")
        print(f"    Shift: {teacher.shift}")
        print()

if __name__ == "__main__":
    debug_teacher_campus()
