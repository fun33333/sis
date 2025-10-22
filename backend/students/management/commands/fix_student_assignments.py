from django.core.management.base import BaseCommand
from django.db import transaction
from students.models import Student
from classes.models import ClassRoom
from teachers.models import Teacher

class Command(BaseCommand):
    help = 'Fix student assignments to classrooms based on campus and grade'

    def add_arguments(self, parser):
        parser.add_argument(
            '--dry-run',
            action='store_true',
            help='Show what would be done without making changes',
        )
        parser.add_argument(
            '--campus-id',
            type=int,
            help='Only fix assignments for specific campus',
        )

    def handle(self, *args, **options):
        dry_run = options['dry_run']
        campus_id = options.get('campus_id')
        
        self.stdout.write(
            self.style.SUCCESS('Starting student assignment fix...')
        )
        
        if dry_run:
            self.stdout.write(
                self.style.WARNING('DRY RUN MODE - No changes will be made')
            )
        
        # Get classrooms with teachers assigned
        classrooms_query = ClassRoom.objects.filter(class_teacher__isnull=False)
        if campus_id:
            classrooms_query = classrooms_query.filter(grade__level__campus_id=campus_id)
        
        classrooms = classrooms_query.select_related('grade', 'grade__level', 'grade__level__campus', 'class_teacher')
        
        total_assigned = 0
        total_reassigned = 0
        
        for classroom in classrooms:
            self.stdout.write(f"\nProcessing classroom: {classroom}")
            self.stdout.write(f"   Teacher: {classroom.class_teacher.full_name}")
            self.stdout.write(f"   Campus: {classroom.campus.campus_name}")
            self.stdout.write(f"   Grade: {classroom.grade.name}")
            self.stdout.write(f"   Section: {classroom.section}")
            
            campus = classroom.campus
            grade = classroom.grade
            
            if not campus or not grade:
                self.stdout.write(
                    self.style.ERROR(f"   Skipping: Missing campus or grade")
                )
                continue
            
            # Normalize grade names for matching
            grade_name_variations = [
                grade.name,
                grade.name.replace('-', ' '),  # Grade-4 -> Grade 4
                grade.name.replace(' ', '-'),  # Grade 4 -> Grade-4
            ]
            
            # Find students from same campus and grade
            from django.db.models import Q
            grade_query = Q()
            for grade_var in grade_name_variations:
                grade_query |= Q(current_grade__icontains=grade_var)
            
            students_query = Student.objects.filter(
                campus=campus,
                is_draft=False
            ).filter(grade_query)
            
            # Count unassigned students
            unassigned_students = students_query.filter(classroom__isnull=True)
            unassigned_count = unassigned_students.count()
            
            # Count students in wrong classroom
            wrong_classroom_students = students_query.filter(
                classroom__isnull=False
            ).exclude(classroom=classroom)
            wrong_count = wrong_classroom_students.count()
            
            self.stdout.write(f"   Found {unassigned_count} unassigned students")
            self.stdout.write(f"   Found {wrong_count} students in wrong classroom")
            
            if not dry_run:
                with transaction.atomic():
                    # Assign unassigned students
                    for student in unassigned_students:
                        student.classroom = classroom
                        student.save(update_fields=['classroom'])
                        total_assigned += 1
                        self.stdout.write(f"   Assigned: {student.name}")
                    
                    # Reassign students from wrong classroom
                    for student in wrong_classroom_students:
                        student.classroom = classroom
                        student.save(update_fields=['classroom'])
                        total_reassigned += 1
                        self.stdout.write(f"   Reassigned: {student.name}")
            else:
                # Dry run - just show what would happen
                for student in unassigned_students[:5]:  # Show first 5
                    self.stdout.write(f"   [DRY] Would assign: {student.name}")
                if unassigned_count > 5:
                    self.stdout.write(f"   [DRY] ... and {unassigned_count - 5} more")
                
                for student in wrong_classroom_students[:5]:  # Show first 5
                    self.stdout.write(f"   [DRY] Would reassign: {student.name}")
                if wrong_count > 5:
                    self.stdout.write(f"   [DRY] ... and {wrong_count - 5} more")
        
        # Summary
        self.stdout.write(f"\nSUMMARY:")
        if dry_run:
            self.stdout.write(f"   Would assign: {total_assigned} students")
            self.stdout.write(f"   Would reassign: {total_reassigned} students")
        else:
            self.stdout.write(f"   Assigned: {total_assigned} students")
            self.stdout.write(f"   Reassigned: {total_reassigned} students")
        
        self.stdout.write(
            self.style.SUCCESS('Student assignment fix completed!')
        )
