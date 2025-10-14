#!/usr/bin/env python
import os
import django

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from result.models import Result
from coordinator.models import Coordinator
from teachers.models import Teacher

print("🔍 Database Debug Information:")
print("=" * 50)

# Check total results
total_results = Result.objects.count()
print(f"Total results in database: {total_results}")

# Check results with coordinators
results_with_coordinators = Result.objects.filter(coordinator__isnull=False).count()
print(f"Results with coordinators: {results_with_coordinators}")

# Check all coordinators
coordinators = Coordinator.objects.all()
print(f"Total coordinators: {coordinators.count()}")

for coordinator in coordinators:
    print(f"  - {coordinator.email} ({coordinator.full_name})")

# Check results by status
print("\n📊 Results by Status:")
for status in ['draft', 'submitted', 'under_review', 'approved', 'rejected']:
    count = Result.objects.filter(status=status).count()
    print(f"  {status}: {count}")

# Check results assigned to each coordinator
print("\n👥 Results per Coordinator:")
for coordinator in coordinators:
    count = Result.objects.filter(coordinator=coordinator).count()
    print(f"  {coordinator.email}: {count} results")

# Check teachers with coordinators
print("\n👨‍🏫 Teachers with Coordinators:")
teachers_with_coordinators = Teacher.objects.filter(assigned_coordinators__isnull=False).distinct()
print(f"Teachers with assigned coordinators: {teachers_with_coordinators.count()}")

for teacher in teachers_with_coordinators:
    coordinators = teacher.assigned_coordinators.all()
    print(f"  {teacher.email}: {coordinators.count()} coordinators")
    for coord in coordinators:
        print(f"    - {coord.email}")

print("\n✅ Debug complete!")
