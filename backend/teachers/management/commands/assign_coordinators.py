from django.core.management.base import BaseCommand
from teachers.models import Teacher
from classes.models import Grade, Level
from coordinator.models import Coordinator
import re

class Command(BaseCommand):
    help = 'Assign coordinators to teachers based on their grade/level'

    def add_arguments(self, parser):
        parser.add_argument(
            '--dry-run',
            action='store_true',
            help='Show what would be assigned without making changes',
        )

    def handle(self, *args, **options):
        dry_run = options['dry_run']
        
        self.stdout.write(self.style.SUCCESS('Starting coordinator assignment...'))
        
        # Get all teachers without assigned coordinators
        teachers = Teacher.objects.filter(
            assigned_coordinator__isnull=True,
            current_campus__isnull=False,
            current_classes_taught__isnull=False
        )
        
        assigned_count = 0
        failed_count = 0
        
        for teacher in teachers:
            try:
                # Extract grade from current_classes_taught
                classes_text = teacher.current_classes_taught.lower()
                grade_name = None
                
                # Try to extract grade from classes taught
                grade_match = re.search(r'grade\s*[-]?\s*(\d+)', classes_text)
                if grade_match:
                    grade_number = grade_match.group(1)
                    # Map grade to correct database format
                    if int(grade_number) <= 6:
                        grade_name = f"Grade {grade_number}"
                    else:
                        grade_name = f"Grade-{grade_number}"
                else:
                    # Check for Pre-Primary classes
                    if any(term in classes_text for term in ['nursery', 'kg-1', 'kg-2', 'kg1', 'kg2']):
                        if 'nursery' in classes_text:
                            grade_name = 'Nursery'
                        elif 'kg-1' in classes_text or 'kg1' in classes_text:
                            grade_name = 'KG-1'
                        elif 'kg-2' in classes_text or 'kg2' in classes_text:
                            grade_name = 'KG-2'
                
                if grade_name:
                    # Find the grade
                    grade = Grade.objects.filter(
                        name__icontains=grade_name,
                        level__campus=teacher.current_campus
                    ).first()
                    
                    if grade and grade.level:
                        # Find coordinator for this level and shift
                        coordinator = Coordinator.objects.filter(
                            level=grade.level,
                            campus=teacher.current_campus,
                            is_currently_active=True
                        ).first()
                        
                        # Note: We don't filter by shift here because coordinators don't have shift field
                        # But we should consider adding shift to coordinator model in future
                        
                        if coordinator:
                            if not dry_run:
                                teacher.assigned_coordinator = coordinator
                                teacher.save()
                            
                            self.stdout.write(
                                f"{'[DRY RUN] ' if dry_run else ''}Assigned {coordinator.full_name} to {teacher.full_name} (Grade: {grade_name})"
                            )
                            assigned_count += 1
                        else:
                            self.stdout.write(
                                self.style.WARNING(f"No active coordinator found for {teacher.full_name} (Grade: {grade_name}, Level: {grade.level.name})")
                            )
                            failed_count += 1
                    else:
                        self.stdout.write(
                            self.style.WARNING(f"Grade {grade_name} or level not found for {teacher.full_name} in campus {teacher.current_campus.campus_name}")
                        )
                        failed_count += 1
                else:
                    self.stdout.write(
                        self.style.WARNING(f"Could not extract grade from classes for {teacher.full_name}: {teacher.current_classes_taught}")
                    )
                    failed_count += 1
                    
            except Exception as e:
                self.stdout.write(
                    self.style.ERROR(f"Error processing {teacher.full_name}: {str(e)}")
                )
                failed_count += 1
        
        if dry_run:
            self.stdout.write(
                self.style.SUCCESS(f'[DRY RUN] Would assign {assigned_count} teachers, {failed_count} failed')
            )
        else:
            self.stdout.write(
                self.style.SUCCESS(f'Successfully assigned {assigned_count} teachers, {failed_count} failed')
            )
