from django.core.management.base import BaseCommand
from django.db import transaction
from teachers.models import Teacher
from coordinator.models import Coordinator
from classes.models import Grade, Level

class Command(BaseCommand):
    help = 'Assign all teachers to coordinators using existing coordinators'

    def add_arguments(self, parser):
        parser.add_argument(
            '--dry-run',
            action='store_true',
            help='Show what would be done without making changes',
        )

    def handle(self, *args, **options):
        dry_run = options['dry_run']
        
        self.stdout.write(
            self.style.SUCCESS('Starting teacher-coordinator assignment...')
        )
        
        if dry_run:
            self.stdout.write(
                self.style.WARNING('DRY RUN MODE - No changes will be made')
            )
        
        # Get all existing coordinators
        coordinators = Coordinator.objects.filter(is_currently_active=True)
        self.stdout.write(f"Found {coordinators.count()} active coordinators")
        
        # Get all teachers without coordinators
        teachers_without_coordinator = Teacher.objects.filter(
            assigned_coordinator__isnull=True,
            current_classes_taught__isnull=False
        )
        
        self.stdout.write(f"Found {teachers_without_coordinator.count()} teachers without coordinators")
        
        total_assigned = 0
        
        for teacher in teachers_without_coordinator:
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
                
                if not grade_name:
                    self.stdout.write(f"  Skipped {teacher.full_name} - could not extract grade from '{teacher.current_classes_taught}'")
                    continue
                
                # Find appropriate coordinator based on grade
                coordinator = None
                
                # Map grade to level
                if grade_name in ['Nursary', 'KG-1', 'KG-2']:
                    # Pre-Primary level
                    coordinator = coordinators.filter(level__name='Pre-Primary').first()
                elif grade_name in ['Grade-1', 'Grade-2', 'Grade-3', 'Grade-4', 'Grade-5']:
                    # Primary level
                    coordinator = coordinators.filter(level__name='Primary').first()
                elif grade_name in ['Grade-6', 'Grade-7', 'Grade-8', 'Grade-9', 'Grade-10']:
                    # Secondary level
                    coordinator = coordinators.filter(level__name='Secondary').first()
                
                if coordinator:
                    if not dry_run:
                        teacher.assigned_coordinator = coordinator
                        teacher.save(update_fields=['assigned_coordinator'])
                    total_assigned += 1
                    self.stdout.write(f"  {'Would assign' if dry_run else 'Assigned'} {teacher.full_name} ({grade_name}) to {coordinator.full_name}")
                else:
                    self.stdout.write(f"  No coordinator found for {teacher.full_name} (grade: {grade_name})")
                    
            except Exception as e:
                self.stdout.write(
                    self.style.ERROR(f"  Error processing {teacher.full_name}: {str(e)}")
                )
        
        # Summary
        self.stdout.write(f"\nSUMMARY:")
        if dry_run:
            self.stdout.write(f"   Would assign: {total_assigned} teachers")
        else:
            self.stdout.write(f"   Assigned: {total_assigned} teachers")
        
        self.stdout.write(
            self.style.SUCCESS('Teacher-coordinator assignment completed!')
        )
