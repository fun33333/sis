#!/usr/bin/env python
import os
import sys
import django

# Add the backend directory to Python path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from classes.models import ClassRoom
from teachers.models import Teacher

def check_classroom_status():
    print("🔍 Checking Classroom Status...")
    
    total_classrooms = ClassRoom.objects.count()
    assigned_classrooms = ClassRoom.objects.filter(class_teacher__isnull=False).count()
    available_classrooms = ClassRoom.objects.filter(class_teacher__isnull=True).count()
    
    print(f"📊 Total classrooms: {total_classrooms}")
    print(f"✅ Assigned classrooms: {assigned_classrooms}")
    print(f"🆓 Available classrooms: {available_classrooms}")
    
    print("\n🏫 Available classrooms by campus:")
    from campus.models import Campus
    for campus in Campus.objects.all():
        available = ClassRoom.objects.filter(
            grade__level__campus=campus,
            class_teacher__isnull=True
        )
        print(f"  {campus.campus_name}: {available.count()} available")
        
        # Show sample available classrooms
        for classroom in available[:3]:
            print(f"    - {classroom.grade.name} - {classroom.section} ({classroom.shift})")
    
    print("\n👨‍🏫 Teacher assignment status:")
    total_teachers = Teacher.objects.filter(current_classes_taught__isnull=False).count()
    assigned_teachers = Teacher.objects.filter(assigned_classroom__isnull=False).count()
    
    print(f"📊 Total teachers with classes: {total_teachers}")
    print(f"✅ Assigned teachers: {assigned_teachers}")
    print(f"🆓 Unassigned teachers: {total_teachers - assigned_teachers}")

if __name__ == "__main__":
    check_classroom_status()
