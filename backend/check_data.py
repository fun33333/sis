#!/usr/bin/env python
import os
import django

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from result.models import Result
from coordinator.models import Coordinator
from teachers.models import Teacher
from students.models import Student

print("🔍 System Data Check:")
print("=" * 50)

# Check coordinators
coordinators = Coordinator.objects.all()
print(f"Coordinators: {coordinators.count()}")
for c in coordinators:
    print(f"  - {c.email} ({c.full_name})")

# Check teachers
teachers = Teacher.objects.all()
print(f"\nTeachers: {teachers.count()}")
for t in teachers:
    print(f"  - {t.email} ({t.full_name})")
    print(f"    Assigned coordinators: {t.assigned_coordinators.count()}")

# Check students
students = Student.objects.all()
print(f"\nStudents: {students.count()}")
for s in students[:3]:  # Show first 3
    print(f"  - {s.name} ({s.student_code})")

# Check results
results = Result.objects.all()
print(f"\nResults: {results.count()}")
for r in results:
    print(f"  - ID: {r.id}, Student: {r.student.name}, Status: {r.status}, Coordinator: {r.coordinator}")

print("\n✅ Check complete!")
