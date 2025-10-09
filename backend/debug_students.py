#!/usr/bin/env python
import os
import django

# Django setup
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "backend.settings")
django.setup()

from students.models import Student
from classes.models import ClassRoom, Grade, Level
from campus.models import Campus

def debug_student_assignment():
    """Debug why students are not getting classroom assignments"""
    
    print("=== DEBUGGING STUDENT ASSIGNMENT ===\n")
    
    # Check total students
    total_students = Student.objects.count()
    print(f"Total students: {total_students}")
    
    # Check students with classrooms
    students_with_classrooms = Student.objects.filter(classroom__isnull=False).count()
    print(f"Students with classrooms: {students_with_classrooms}")
    
    # Check students without classrooms
    students_without_classrooms = Student.objects.filter(classroom__isnull=True).count()
    print(f"Students without classrooms: {students_without_classrooms}")
    
    print("\n=== SAMPLE STUDENTS WITHOUT CLASSROOMS ===")
    sample_students = Student.objects.filter(classroom__isnull=True)[:5]
    for student in sample_students:
        print(f"Student: {student.name}")
        print(f"  Campus: {student.campus}")
        print(f"  Grade: '{student.current_grade}'")
        print(f"  Section: '{student.section}'")
        
        # Try to find matching grade
        if student.current_grade and student.campus:
            try:
                grade = Grade.objects.get(
                    name__iexact=student.current_grade.strip(),
                    level__campus=student.campus
                )
                print(f"  Found Grade: {grade}")
                
                # Try to find classroom
                classroom = ClassRoom.objects.filter(
                    grade=grade,
                    section=student.section.strip() if student.section else 'A'
                ).first()
                
                if classroom:
                    print(f"  Found Classroom: {classroom}")
                else:
                    print(f"  No Classroom found for Grade: {grade}, Section: {student.section}")
                    
            except Grade.DoesNotExist:
                print(f"  Grade '{student.current_grade}' not found in campus {student.campus}")
        
        print()
    
    print("\n=== AVAILABLE GRADES BY CAMPUS ===")
    campuses = Campus.objects.all()
    for campus in campuses:
        print(f"\nCampus: {campus.campus_name}")
        grades = Grade.objects.filter(level__campus=campus)
        for grade in grades:
            classrooms = ClassRoom.objects.filter(grade=grade)
            print(f"  Grade: {grade.name} - {classrooms.count()} classrooms")
            for classroom in classrooms:
                print(f"    Classroom: {classroom} (Section: {classroom.section})")

if __name__ == "__main__":
    debug_student_assignment()
