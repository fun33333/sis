#!/usr/bin/env python3
import os
import sys
import django

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from classes.models import Level, Grade, ClassRoom
from coordinator.models import Coordinator
from teachers.models import Teacher
from campus.models import Campus

def debug_teacher_assignment():
    try:
        campus = Campus.objects.get(id=6)
        print(f"🏫 Debugging teacher assignment for: {campus.campus_name}")
        print("=" * 60)
        
        # Get all teachers
        teachers = Teacher.objects.filter(current_campus=campus, is_currently_active=True)
        print(f"📚 Total Teachers: {teachers.count()}")
        
        # Check teacher shifts
        morning_teachers = teachers.filter(shift='morning')
        afternoon_teachers = teachers.filter(shift='afternoon')
        print(f"🌅 Morning Teachers: {morning_teachers.count()}")
        print(f"🌆 Afternoon Teachers: {afternoon_teachers.count()}")
        
        # Get coordinators
        coordinators = Coordinator.objects.filter(campus=campus, is_currently_active=True)
        print(f"👤 Total Coordinators: {coordinators.count()}")
        
        print("\n" + "=" * 60)
        
        for coordinator in coordinators:
            print(f"\n👤 Coordinator: {coordinator.full_name} ({coordinator.shift})")
            print(f"   Level: {coordinator.level.name if coordinator.level else 'No Level'}")
            
            if not coordinator.level:
                print("   ❌ No level assigned")
                continue
            
            # Get teachers for this coordinator
            suitable_teachers = []
            
            for teacher in teachers:
                # Check shift match
                shift_match = False
                if coordinator.shift == 'both':
                    shift_match = True
                elif teacher.shift == coordinator.shift:
                    shift_match = True
                
                # Check level match
                level_match = False
                if teacher.current_classes_taught:
                    classes_text = teacher.current_classes_taught.lower()
                    
                    level_patterns = {
                        'Pre-Primary': ['nursery', 'kg-1', 'kg-2', 'kg1', 'kg2', 'kg-i', 'kg-ii'],
                        'Primary': ['grade 1', 'grade 2', 'grade 3', 'grade 4', 'grade 5', 'grade-1', 'grade-2', 'grade-3', 'grade-4', 'grade-5'],
                        'Secondary': ['grade 6', 'grade 7', 'grade 8', 'grade 9', 'grade 10', 'grade-6', 'grade-7', 'grade-8', 'grade-9', 'grade-10']
                    }
                    
                    patterns = level_patterns.get(coordinator.level.name, [])
                    level_match = any(pattern in classes_text for pattern in patterns)
                
                if shift_match and level_match:
                    suitable_teachers.append(teacher)
                    print(f"   ✅ {teacher.full_name} - Shift: {teacher.shift}, Classes: {teacher.current_classes_taught}")
                else:
                    print(f"   ❌ {teacher.full_name} - Shift: {teacher.shift}, Classes: {teacher.current_classes_taught}")
            
            print(f"   📊 Suitable Teachers: {len(suitable_teachers)}")
            
            # Check classrooms
            if coordinator.shift == 'both':
                classrooms = ClassRoom.objects.filter(
                    grade__level=coordinator.level,
                    class_teacher__isnull=True
                )
            else:
                classrooms = ClassRoom.objects.filter(
                    grade__level=coordinator.level,
                    shift=coordinator.shift,
                    class_teacher__isnull=True
                )
            
            print(f"   🏫 Available Classrooms: {classrooms.count()}")
            
            # Show sample classrooms
            for classroom in classrooms[:3]:
                print(f"      - {classroom.grade.name}-{classroom.section} ({classroom.shift})")
            if classrooms.count() > 3:
                print(f"      ... and {classrooms.count() - 3} more")
        
    except Exception as e:
        print(f"❌ Error: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    debug_teacher_assignment()
