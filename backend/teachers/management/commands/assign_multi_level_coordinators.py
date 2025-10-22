from django.core.management.base import BaseCommand
from django.db import transaction
from teachers.models import Teacher
from coordinator.models import Coordinator
from classes.models import Grade, Level
from campus.models import Campus
import re

class Command(BaseCommand):
    help = 'Assign multiple coordinators to teachers teaching across multiple levels'

    def add_arguments(self, parser):
        parser.add_argument(
            '--dry-run',
            action='store_true',
            help='Show what would be done without making changes',
        )
        parser.add_argument(
            '--campus-id',
            type=int,
            help='Only process specific campus',
        )

    def handle(self, *args, **options):
        dry_run = options['dry_run']
        campus_id = options.get('campus_id')
        
        self.stdout.write(
            self.style.SUCCESS('Starting multi-level coordinator assignment...')
        )
        
        if dry_run:
            self.stdout.write(
                self.style.WARNING('DRY RUN MODE - No changes will be made')
            )
        
        # Get campuses
        campuses = Campus.objects.all()
        if campus_id:
            campuses = campuses.filter(id=campus_id)
        
        total_processed = 0
        total_assigned = 0
        total_errors = 0
        
        for campus in campuses:
            self.stdout.write(f"\nProcessing Campus: {campus.campus_name}")
            
            # Get all teachers for this campus
            teachers = Teacher.objects.filter(
                current_campus=campus,
                current_classes_taught__isnull=False
            )
            
            self.stdout.write(f"  Found {teachers.count()} teachers with classes")
            
            for teacher in teachers:
                try:
                    total_processed += 1
                    
                    # Extract all grades from current_classes_taught
                    classes_text = teacher.current_classes_taught.lower()
                    
                    # Extract ALL grade numbers from text
                    grade_numbers = re.findall(r'grade\s*[-]?\s*(\d+)', classes_text)
                    
                    # Check for pre-primary classes
                    has_nursery = 'nursery' in classes_text
                    has_kg1 = any(term in classes_text for term in ['kg-1', 'kg1', 'kg-i'])
                    has_kg2 = any(term in classes_text for term in ['kg-2', 'kg2', 'kg-ii'])
                    
                    # Build list of grade names
                    grade_names = []
                    if has_nursery:
                        grade_names.append('Nursery')
                    if has_kg1:
                        grade_names.append('KG-I')
                    if has_kg2:
                        grade_names.append('KG-II')
                    for num in grade_numbers:
                        grade_names.append(f"Grade {num}")
                    
                    if not grade_names:
                        self.stdout.write(f"    Skipped {teacher.full_name} - no valid grades found")
                        continue
                    
                    self.stdout.write(f"    Processing {teacher.full_name}: {grade_names}")
                    
                    # Find all unique levels
                    levels = set()
                    for grade_name in grade_names:
                        grade = Grade.objects.filter(
                            name__icontains=grade_name,
                            level__campus=campus
                        ).first()
                        if grade and grade.level:
                            levels.add(grade.level)
                    
                    if not levels:
                        self.stdout.write(f"      No levels found for grades: {grade_names}")
                        continue
                    
                    self.stdout.write(f"      Levels: {[l.name for l in levels]}")
                    
                    # Get coordinators for all levels
                    coordinators_to_assign = []
                    for level in levels:
                        coordinator = Coordinator.objects.filter(
                            level=level,
                            campus=campus,
                            is_currently_active=True
                        ).first()
                        
                        if coordinator:
                            coordinators_to_assign.append(coordinator)
                            self.stdout.write(f"        Found coordinator: {coordinator.full_name} for {level.name}")
                        else:
                            self.stdout.write(f"        No coordinator for {level.name}")
                    
                    if coordinators_to_assign:
                        if not dry_run:
                            # Clear existing coordinators and add new ones
                            teacher.assigned_coordinators.clear()
                            for coordinator in coordinators_to_assign:
                                teacher.assigned_coordinators.add(coordinator)
                        
                        total_assigned += len(coordinators_to_assign)
                        coordinator_names = [c.full_name for c in coordinators_to_assign]
                        self.stdout.write(f"      {'Would assign' if dry_run else 'Assigned'} coordinators: {coordinator_names}")
                    else:
                        self.stdout.write(f"      No coordinators to assign")
                        
                except Exception as e:
                    total_errors += 1
                    self.stdout.write(
                        self.style.ERROR(f"      Error processing {teacher.full_name}: {str(e)}")
                    )
        
        # Summary
        self.stdout.write(f"\nSUMMARY:")
        self.stdout.write(f"   Processed: {total_processed} teachers")
        if dry_run:
            self.stdout.write(f"   Would assign: {total_assigned} coordinator relationships")
        else:
            self.stdout.write(f"   Assigned: {total_assigned} coordinator relationships")
        self.stdout.write(f"   Errors: {total_errors}")
        
        self.stdout.write(
            self.style.SUCCESS('Multi-level coordinator assignment completed!')
        )
