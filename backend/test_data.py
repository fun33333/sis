#!/usr/bin/env python
import os
import sys
import django

# Add the project directory to Python path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

# Set up Django environment
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from classes.models import Level, Grade, ClassRoom
from campus.models import Campus

print("=== Database Data Check ===")

# Check Campus data
campus_count = Campus.objects.count()
print(f"Total Campuses: {campus_count}")

if campus_count > 0:
    campuses = Campus.objects.all()[:3]
    for campus in campuses:
        print(f"  - {campus.campus_name} (ID: {campus.id})")

# Check Level data
level_count = Level.objects.count()
print(f"\nTotal Levels: {level_count}")

if level_count > 0:
    levels = Level.objects.all()[:3]
    for level in levels:
        print(f"  - {level.name} (ID: {level.id})")

# Check Grade data
grade_count = Grade.objects.count()
print(f"\nTotal Grades: {grade_count}")

if grade_count > 0:
    grades = Grade.objects.all()[:3]
    for grade in grades:
        print(f"  - {grade.name} (ID: {grade.id})")

# Check ClassRoom data
classroom_count = ClassRoom.objects.count()
print(f"\nTotal ClassRooms: {classroom_count}")

if classroom_count > 0:
    classrooms = ClassRoom.objects.all()[:3]
    for classroom in classrooms:
        print(f"  - {classroom.grade.name} - Section {classroom.section} (ID: {classroom.id})")

print("\n=== End Check ===")
