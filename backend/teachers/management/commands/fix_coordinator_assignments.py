from django.core.management.base import BaseCommand
from django.db import transaction
from teachers.models import Teacher
from coordinator.models import Coordinator
from classes.models import Grade, Level

class Command(BaseCommand):
    help = 'Fix coordinator assignments for teachers based on their grades and campus'

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
            self.style.SUCCESS('Starting coordinator assignment fix...')
        )
        
        if dry_run:
            self.stdout.write(
                self.style.WARNING('DRY RUN MODE - No changes will be made')
            )
        
        # Get teachers without coordinators
        teachers_query = Teacher.objects.filter(
            assigned_coordinator__isnull=True,
            current_campus__isnull=False,
            current_classes_taught__isnull=False
        )
        
        if campus_id:
            teachers_query = teachers_query.filter(current_campus_id=campus_id)
        
        teachers = teachers_query.select_related('current_campus')
        
        total_assigned = 0
        total_errors = 0
        
        for teacher in teachers:
            self.stdout.write(f"\nProcessing teacher: {teacher.full_name}")
            self.stdout.write(f"   Campus: {teacher.current_campus.campus_name}")
            self.stdout.write(f"   Classes: {teacher.current_classes_taught}")
            
            try:
                # Extract grade from current_classes_taught
                classes_text = teacher.current_classes_taught.lower()
                grade_name = None
                
                # Try to extract grade from classes taught
                import re
                grade_match = re.search(r'grade\s*[-]?\s*(\d+)', classes_text)
                if grade_match:
                    grade_number = grade_match.group(1)
                    grade_name = f"Grade {grade_number}"  # Use space format to match database
                else:
                    # Check for Pre-Primary classes
                    if any(term in classes_text for term in ['nursery', 'kg-1', 'kg-2', 'kg1', 'kg2', 'kg-ii', 'kg-i']):
                        if 'nursery' in classes_text:
                            grade_name = 'Nursery'  # Fix typo
                        elif 'kg-1' in classes_text or 'kg1' in classes_text or 'kg-i' in classes_text:
                            grade_name = 'KG-I'  # Use database format
                        elif 'kg-2' in classes_text or 'kg2' in classes_text or 'kg-ii' in classes_text:
                            grade_name = 'KG-II'  # Use database format
                
                if grade_name:
                    self.stdout.write(f"   Extracted grade: {grade_name}")
                    
                    # Find the grade
                    grade = Grade.objects.filter(
                        name__icontains=grade_name,
                        level__campus=teacher.current_campus
                    ).first()
                    
                    if grade and grade.level:
                        self.stdout.write(f"   Found grade: {grade.name} - Level: {grade.level.name}")
                        
                        # Find coordinator for this level
                        coordinator = Coordinator.objects.filter(
                            level=grade.level,
                            campus=teacher.current_campus,
                            is_currently_active=True
                        ).first()
                        
                        if coordinator:
                            if not dry_run:
                                teacher.assigned_coordinator = coordinator
                                teacher.save(update_fields=['assigned_coordinator'])
                            total_assigned += 1
                            self.stdout.write(f"   {'Would assign' if dry_run else 'Assigned'} coordinator: {coordinator.full_name}")
                        else:
                            self.stdout.write(
                                self.style.ERROR(f"   No active coordinator found for level {grade.level.name}")
                            )
                    else:
                        self.stdout.write(
                            self.style.ERROR(f"   Grade {grade_name} or level not found")
                        )
                else:
                    self.stdout.write(
                        self.style.ERROR(f"   Could not extract grade from classes: {teacher.current_classes_taught}")
                    )
                    
            except Exception as e:
                total_errors += 1
                self.stdout.write(
                    self.style.ERROR(f"   Error processing teacher: {str(e)}")
                )
        
        # Summary
        self.stdout.write(f"\nSUMMARY:")
        if dry_run:
            self.stdout.write(f"   Would assign: {total_assigned} teachers")
        else:
            self.stdout.write(f"   Assigned: {total_assigned} teachers")
        self.stdout.write(f"   Errors: {total_errors}")
        
        self.stdout.write(
            self.style.SUCCESS('Coordinator assignment fix completed!')
        )
