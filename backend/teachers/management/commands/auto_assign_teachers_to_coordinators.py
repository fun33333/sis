from django.core.management.base import BaseCommand
from django.db import transaction
from teachers.models import Teacher
from coordinator.models import Coordinator
from classes.models import Grade, Level
from campus.models import Campus

class Command(BaseCommand):
    help = 'Automatically assign teachers to coordinators based on their grades and campus'

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
            self.style.SUCCESS('Starting automatic teacher-coordinator assignment...')
        )
        
        if dry_run:
            self.stdout.write(
                self.style.WARNING('DRY RUN MODE - No changes will be made')
            )
        
        # Get all campuses that have levels/grades
        campuses_with_levels = Campus.objects.filter(levels__isnull=False).distinct()
        
        if campus_id:
            campuses_with_levels = campuses_with_levels.filter(id=campus_id)
        
        total_assigned = 0
        total_errors = 0
        
        for campus in campuses_with_levels:
            self.stdout.write(f"\nProcessing Campus: {campus.campus_name}")
            
            # Get levels for this campus
            levels = Level.objects.filter(campus=campus)
            self.stdout.write(f"  Levels: {[l.name for l in levels]}")
            
            for level in levels:
                self.stdout.write(f"\n  Processing Level: {level.name}")
                
                # Get coordinator for this level and campus
                coordinator = Coordinator.objects.filter(
                    level=level,
                    campus=campus,
                    is_currently_active=True
                ).first()
                
                if not coordinator:
                    self.stdout.write(
                        self.style.WARNING(f"    No coordinator found for {level.name} in {campus.campus_name}")
                    )
                    continue
                
                self.stdout.write(f"    Coordinator: {coordinator.full_name}")
                
                # Get grades for this level
                grades = Grade.objects.filter(level=level)
                grade_names = [g.name for g in grades]
                self.stdout.write(f"    Grades: {grade_names}")
                
                # Find teachers for this campus and level
                teachers = Teacher.objects.filter(
                    current_campus=campus,
                    assigned_coordinator__isnull=True,
                    current_classes_taught__isnull=False
                )
                
                assigned_count = 0
                for teacher in teachers:
                    try:
                        # Extract grade from current_classes_taught
                        classes_text = teacher.current_classes_taught.lower()
                        grade_name = None
                        
                        # Try to extract grade from classes taught
                        import re
                        grade_match = re.search(r'grade\s*[-]?\s*(\d+)', classes_text)
                        if grade_match:
                            grade_number = grade_match.group(1)
                            grade_name = f"Grade-{grade_number}"
                        else:
                            # Check for Pre-Primary classes
                            if any(term in classes_text for term in ['nursery', 'kg-1', 'kg-2', 'kg1', 'kg2', 'kg-ii', 'kg-i']):
                                if 'nursery' in classes_text:
                                    grade_name = 'Nursary'
                                elif 'kg-1' in classes_text or 'kg1' in classes_text or 'kg-i' in classes_text:
                                    grade_name = 'KG-1'
                                elif 'kg-2' in classes_text or 'kg2' in classes_text or 'kg-ii' in classes_text:
                                    grade_name = 'KG-2'
                        
                        if grade_name and grade_name in grade_names:
                            if not dry_run:
                                teacher.assigned_coordinator = coordinator
                                teacher.save(update_fields=['assigned_coordinator'])
                            assigned_count += 1
                            self.stdout.write(f"      {'Would assign' if dry_run else 'Assigned'} {teacher.full_name} ({grade_name})")
                        else:
                            self.stdout.write(f"      Skipped {teacher.full_name} - grade '{grade_name}' not in {grade_names}")
                            
                    except Exception as e:
                        total_errors += 1
                        self.stdout.write(
                            self.style.ERROR(f"      Error processing {teacher.full_name}: {str(e)}")
                        )
                
                self.stdout.write(f"    {'Would assign' if dry_run else 'Assigned'}: {assigned_count} teachers")
                total_assigned += assigned_count
        
        # Summary
        self.stdout.write(f"\nSUMMARY:")
        if dry_run:
            self.stdout.write(f"   Would assign: {total_assigned} teachers")
        else:
            self.stdout.write(f"   Assigned: {total_assigned} teachers")
        self.stdout.write(f"   Errors: {total_errors}")
        
        self.stdout.write(
            self.style.SUCCESS('Automatic teacher-coordinator assignment completed!')
        )
