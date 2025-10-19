#!/usr/bin/env python3
import os
import sys
import django

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from classes.models import Level, Grade, ClassRoom
from coordinator.models import Coordinator
from campus.models import Campus

def check_coordinator_structure():
    try:
        campus = Campus.objects.get(id=6)
        print(f"🏫 Checking structure for: {campus.campus_name}")
        print("=" * 60)
        
        # Get all coordinators for Campus 6
        coordinators = Coordinator.objects.filter(campus=campus, is_currently_active=True)
        
        if not coordinators.exists():
            print("❌ No coordinators found for Campus 6")
            return
        
        print(f"📊 Found {coordinators.count()} coordinators:")
        print()
        
        for coordinator in coordinators:
            print(f"👤 {coordinator.full_name} ({coordinator.employee_code})")
            print(f"   📧 Email: {coordinator.email}")
            print(f"   🕐 Shift: {coordinator.shift.title()}")
            print(f"   📚 Level: {coordinator.level.name if coordinator.level else 'No Level'}")
            print(f"   🏫 Campus: {coordinator.campus.campus_name}")
            
            if coordinator.level:
                # Get grades for this coordinator's level
                grades = Grade.objects.filter(level=coordinator.level)
                print(f"   📖 Grades ({grades.count()}):")
                
                for grade in grades:
                    # Get classrooms for this grade
                    classrooms = ClassRoom.objects.filter(grade=grade)
                    print(f"      - {grade.name}: {classrooms.count()} sections")
                    
                    # Show sections
                    if classrooms.exists():
                        sections = [f"{c.section}" for c in classrooms]
                        print(f"        Sections: {', '.join(sections)}")
                
                # Get total classrooms for this coordinator
                total_classrooms = coordinator.get_assigned_classrooms()
                print(f"   🏫 Total Classrooms: {total_classrooms.count()}")
                
                # Get assigned teachers
                assigned_teachers = coordinator.get_assigned_teachers()
                print(f"   👨‍🏫 Assigned Teachers: {len(assigned_teachers)}")
                
                if assigned_teachers:
                    print("      Teachers:")
                    for teacher in assigned_teachers[:5]:  # Show first 5
                        print(f"        - {teacher.full_name} ({teacher.employee_code})")
                    if len(assigned_teachers) > 5:
                        print(f"        ... and {len(assigned_teachers) - 5} more")
            else:
                print("   ❌ No level assigned")
            
            print("-" * 60)
        
        # Summary
        print("\n📊 SUMMARY:")
        print(f"Total Coordinators: {coordinators.count()}")
        
        # Count by shift
        morning_coords = coordinators.filter(shift='morning')
        afternoon_coords = coordinators.filter(shift='afternoon')
        both_coords = coordinators.filter(shift='both')
        
        print(f"Morning Only: {morning_coords.count()}")
        print(f"Afternoon Only: {afternoon_coords.count()}")
        print(f"Both Shifts: {both_coords.count()}")
        
        # Count total levels, grades, classrooms
        total_levels = Level.objects.filter(campus=campus).count()
        total_grades = Grade.objects.filter(level__campus=campus).count()
        total_classrooms = ClassRoom.objects.filter(grade__level__campus=campus).count()
        
        print(f"\nTotal Levels: {total_levels}")
        print(f"Total Grades: {total_grades}")
        print(f"Total Classrooms: {total_classrooms}")
        
    except Exception as e:
        print(f"❌ Error: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    check_coordinator_structure()
