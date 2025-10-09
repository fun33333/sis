from django.core.management.base import BaseCommand
from classes.models import Level, Grade, ClassRoom


class Command(BaseCommand):
    help = 'Regenerate codes for levels, grades, and classrooms using campus_id'

    def add_arguments(self, parser):
        parser.add_argument(
            '--dry-run',
            action='store_true',
            help='Show what would be changed without actually changing',
        )

    def handle(self, *args, **options):
        # Regenerate Level codes
        self.stdout.write(self.style.SUCCESS('Regenerating Level codes...'))
        levels = Level.objects.all()
        
        for level in levels:
            old_code = level.code
            level.code = None  # Reset to trigger regeneration
            level.save()
            
            if options['dry_run']:
                self.stdout.write(f'  Would update: {level.name} - {old_code} -> {level.code}')
            else:
                self.stdout.write(f'  Updated: {level.name} - {old_code} -> {level.code}')

        # Regenerate Grade codes
        self.stdout.write(self.style.SUCCESS('Regenerating Grade codes...'))
        grades = Grade.objects.all()
        
        for grade in grades:
            old_code = grade.code
            grade.code = None  # Reset to trigger regeneration
            grade.save()
            
            if options['dry_run']:
                self.stdout.write(f'  Would update: {grade.name} - {old_code} -> {grade.code}')
            else:
                self.stdout.write(f'  Updated: {grade.name} - {old_code} -> {grade.code}')

        # Regenerate ClassRoom codes
        self.stdout.write(self.style.SUCCESS('Regenerating ClassRoom codes...'))
        classrooms = ClassRoom.objects.all()
        
        for classroom in classrooms:
            old_code = classroom.code
            classroom.code = None  # Reset to trigger regeneration
            classroom.save()
            
            if options['dry_run']:
                self.stdout.write(f'  Would update: {classroom.name} - {old_code} -> {classroom.code}')
            else:
                self.stdout.write(f'  Updated: {classroom.name} - {old_code} -> {classroom.code}')

        if options['dry_run']:
            self.stdout.write(
                self.style.WARNING('\nDRY RUN: No changes were made.')
            )
        else:
            self.stdout.write(
                self.style.SUCCESS('\n✅ All codes regenerated successfully!')
            )
