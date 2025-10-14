#!/usr/bin/env python
import os
import django
import requests

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from result.models import Result
from coordinator.models import Coordinator
from teachers.models import Teacher
from students.models import Student

print("🔍 Testing API and Database:")
print("=" * 50)

# Check if we have any data
print("📊 Database Status:")
print(f"  Results: {Result.objects.count()}")
print(f"  Coordinators: {Coordinator.objects.count()}")
print(f"  Teachers: {Teacher.objects.count()}")
print(f"  Students: {Student.objects.count()}")

# Check if there are any results with coordinators
results_with_coords = Result.objects.filter(coordinator__isnull=False)
print(f"  Results with coordinators: {results_with_coords.count()}")

# Show first few results
print("\n📋 First 5 Results:")
for i, result in enumerate(Result.objects.all()[:5]):
    print(f"  {i+1}. ID: {result.id}, Student: {result.student.name if result.student else 'No student'}, Status: {result.status}, Coordinator: {result.coordinator.email if result.coordinator else 'None'}")

# Check coordinators
print("\n👥 Coordinators:")
for coord in Coordinator.objects.all():
    print(f"  - {coord.email} ({coord.full_name})")

print("\n✅ Test complete!")
