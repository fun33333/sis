from django.core.management.base import BaseCommand
from django.db import transaction
from classes.models import Grade, Level
from campus.models import Campus

class Command(BaseCommand):
    help = 'Setup levels and grades for all campuses'

    def add_arguments(self, parser):
        parser.add_argument(
            '--dry-run',
            action='store_true',
            help='Show what would be done without making changes',
        )

    def handle(self, *args, **options):
        dry_run = options['dry_run']
        
        self.stdout.write(
            self.style.SUCCESS('Starting campus levels and grades setup...')
        )
        
        if dry_run:
            self.stdout.write(
                self.style.WARNING('DRY RUN MODE - No changes will be made')
            )
        
        # Define levels and their grades
        level_grades = {
            'Pre-Primary': ['Nursary', 'KG-1', 'KG-2'],
            'Primary': ['Grade-1', 'Grade-2', 'Grade-3', 'Grade-4', 'Grade-5'],
            'Secondary': ['Grade-6', 'Grade-7', 'Grade-8', 'Grade-9', 'Grade-10']
        }
        
        # Get all campuses
        all_campuses = Campus.objects.all()
        
        total_levels_created = 0
        total_grades_created = 0
        
        for campus in all_campuses:
            self.stdout.write(f"\nProcessing Campus: {campus.campus_name}")
            
            # Check existing levels
            existing_levels = Level.objects.filter(campus=campus)
            existing_level_names = [l.name for l in existing_levels]
            self.stdout.write(f"  Existing levels: {existing_level_names}")
            
            for level_name, grade_names in level_grades.items():
                # Create or get level
                level, level_created = Level.objects.get_or_create(
                    name=level_name,
                    campus=campus
                )
                
                if level_created:
                    total_levels_created += 1
                    self.stdout.write(f"    {'Would create' if dry_run else 'Created'} level: {level_name}")
                else:
                    self.stdout.write(f"    Level already exists: {level_name}")
                
                # Create grades for this level
                for grade_name in grade_names:
                    grade, grade_created = Grade.objects.get_or_create(
                        name=grade_name,
                        level=level
                    )
                    
                    if grade_created:
                        total_grades_created += 1
                        self.stdout.write(f"      {'Would create' if dry_run else 'Created'} grade: {grade_name}")
                    else:
                        self.stdout.write(f"      Grade already exists: {grade_name}")
        
        # Summary
        self.stdout.write(f"\nSUMMARY:")
        if dry_run:
            self.stdout.write(f"   Would create: {total_levels_created} levels")
            self.stdout.write(f"   Would create: {total_grades_created} grades")
        else:
            self.stdout.write(f"   Created: {total_levels_created} levels")
            self.stdout.write(f"   Created: {total_grades_created} grades")
        
        self.stdout.write(
            self.style.SUCCESS('Campus levels and grades setup completed!')
        )
