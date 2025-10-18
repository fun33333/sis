#!/usr/bin/env python3
"""
Check actual data in database
"""

import os
import sys
import django

# Add the backend directory to Python path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from students.models import Student
from teachers.models import Teacher
from campus.models import Campus

def check_data():
    print("🔍 Checking actual data in database...")
    
    # Check all campuses first
    all_campuses = Campus.objects.all()
    print(f"📊 Total Campuses: {all_campuses.count()}")
    for campus in all_campuses:
        print(f"  - {campus.campus_name}")
    
    # Check Campus 6
    try:
        campus6 = Campus.objects.get(campus_name='Campus 6')
        print(f"✅ Campus 6 found: {campus6.campus_name}")
    except Campus.DoesNotExist:
        print("❌ Campus 6 not found!")
        return
    
    # Check students
    students_count = Student.objects.filter(campus=campus6).count()
    print(f"📊 Campus 6 Students: {students_count}")
    
    # Check teachers
    teachers_count = Teacher.objects.filter(current_campus=campus6).count()
    print(f"👨‍🏫 Campus 6 Teachers: {teachers_count}")
    
    # Check total students
    total_students = Student.objects.count()
    print(f"📊 Total Students in DB: {total_students}")
    
    # Check total teachers
    total_teachers = Teacher.objects.count()
    print(f"👨‍🏫 Total Teachers in DB: {total_teachers}")
    
    # Check recent students
    recent_students = Student.objects.filter(campus=campus6).order_by('-created_at')[:5]
    print(f"\n📋 Recent Campus 6 Students:")
    for student in recent_students:
        print(f"  - {student.name} ({student.student_code})")
    
    # Check recent teachers
    recent_teachers = Teacher.objects.filter(current_campus=campus6).order_by('-date_created')[:5]
    print(f"\n👨‍🏫 Recent Campus 6 Teachers:")
    for teacher in recent_teachers:
        print(f"  - {teacher.full_name} ({teacher.employee_code})")

if __name__ == '__main__':
    check_data()
