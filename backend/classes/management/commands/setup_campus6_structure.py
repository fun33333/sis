import os
import sys
import django
from django.core.management.base import BaseCommand, CommandError
from django.db import transaction
from campus.models import Campus
from classes.models import Level, Grade, ClassRoom

class Command(BaseCommand):
    help = 'Setup Campus 6 structure with shift-based levels, grades, and classrooms'

    def add_arguments(self, parser):
        parser.add_argument(
            '--campus-id',
            type=int,
            default=6,
            help='Campus ID to setup (default: 6)'
        )
        parser.add_argument(
            '--dry-run',
            action='store_true',
            help='Run without actually creating records (for testing)'
        )

    def handle(self, *args, **options):
        campus_id = options['campus_id']
        dry_run = options['dry_run']

        self.stdout.write(f'Starting Campus {campus_id} structure setup...')

        # Get campus
        try:
            campus = Campus.objects.get(id=campus_id)
            self.stdout.write(f'Setting up structure for: {campus.campus_name}')
        except Campus.DoesNotExist:
            raise CommandError(f'Campus with ID {campus_id} not found')

        if dry_run:
            self.stdout.write(self.style.WARNING('DRY RUN MODE - No records will be created'))

        # Setup structure
        self.setup_campus_structure(campus, dry_run)

    def setup_campus_structure(self, campus, dry_run):
        """Setup complete structure for campus"""
        
        created_levels = 0
        created_grades = 0
        created_classrooms = 0

        with transaction.atomic():
            # 1. Create Levels (Shift-based)
            levels = self.create_levels(campus, dry_run)
            created_levels = len(levels)

            # 2. Create Grades for each level
            for level in levels:
                grades = self.create_grades_for_level(level, dry_run)
                created_grades += len(grades)

                # 3. Create ClassRooms for each grade
                for grade in grades:
                    classrooms = self.create_classrooms_for_grade(grade, dry_run)
                    created_classrooms += len(classrooms)

        # Summary
        self.stdout.write(
            self.style.SUCCESS(
                f'\n📊 Campus 6 Structure Setup Complete!\n'
                f'✅ Levels Created: {created_levels}\n'
                f'✅ Grades Created: {created_grades}\n'
                f'✅ ClassRooms Created: {created_classrooms}\n'
            )
        )

    def create_levels(self, campus, dry_run):
        """Create shift-based levels for campus"""
        
        levels_data = [
            ('Pre-Primary', 'morning'),
            ('Pre-Primary', 'afternoon'),
            ('Primary', 'morning'),
            ('Primary', 'afternoon'),
            ('Secondary', 'morning'),
            ('Secondary', 'afternoon'),
        ]

        created_levels = []
        
        for level_name, shift in levels_data:
            if dry_run:
                self.stdout.write(f'[DRY RUN] Would create level: {level_name}-{shift.title()}')
                # Create a mock level object for dry run
                class MockLevel:
                    def __init__(self, name, shift):
                        self.name = name
                        self.shift = shift
                        self.campus = campus
                created_levels.append(MockLevel(level_name, shift))
                continue

            level, created = Level.objects.get_or_create(
                campus=campus,
                name=level_name,
                shift=shift,
                defaults={
                    'coordinator_assigned_at': None
                }
            )
            
            if created:
                self.stdout.write(
                    self.style.SUCCESS(f'✅ Created level: {level.name}-{level.shift.title()}')
                )
            else:
                self.stdout.write(f'⏭️  Level already exists: {level.name}-{level.shift.title()}')
            
            created_levels.append(level)

        return created_levels

    def create_grades_for_level(self, level, dry_run):
        """Create grades for a specific level"""
        
        # Define grades for each level type
        grade_mapping = {
            'Pre-Primary': ['Nursery', 'KG-I', 'KG-II'],
            'Primary': ['Grade-1', 'Grade-2', 'Grade-3', 'Grade-4', 'Grade-5'],
            'Secondary': ['Grade-6', 'Grade-7', 'Grade-8', 'Grade-9', 'Grade-10'],
        }

        grade_names = grade_mapping.get(level.name, [])
        created_grades = []

        for grade_name in grade_names:
            if dry_run:
                self.stdout.write(f'[DRY RUN] Would create grade: {grade_name} for {level.name}-{level.shift.title()}')
                # Create a mock grade object for dry run
                class MockGrade:
                    def __init__(self, name, level):
                        self.name = name
                        self.level = level
                created_grades.append(MockGrade(grade_name, level))
                continue

            grade, created = Grade.objects.get_or_create(
                level=level,
                name=grade_name
            )
            
            if created:
                self.stdout.write(
                    self.style.SUCCESS(f'  ✅ Created grade: {grade.name}')
                )
            else:
                self.stdout.write(f'  ⏭️  Grade already exists: {grade.name}')
            
            created_grades.append(grade)

        return created_grades

    def create_classrooms_for_grade(self, grade, dry_run):
        """Create classrooms (4 sections A,B,C,D) for a grade"""
        
        sections = ['A', 'B', 'C', 'D']
        created_classrooms = []

        for section in sections:
            if dry_run:
                self.stdout.write(f'[DRY RUN] Would create classroom: {grade.name}-{section} ({grade.level.shift})')
                # Create a mock classroom object for dry run
                class MockClassroom:
                    def __init__(self, grade, section):
                        self.grade = grade
                        self.section = section
                        self.shift = grade.level.shift
                created_classrooms.append(MockClassroom(grade, section))
                continue

            classroom, created = ClassRoom.objects.get_or_create(
                grade=grade,
                section=section,
                shift=grade.level.shift,
                defaults={
                    'capacity': 30,
                    'class_teacher': None,
                    'assigned_by': None,
                    'assigned_at': None
                }
            )
            
            if created:
                self.stdout.write(
                    self.style.SUCCESS(f'    ✅ Created classroom: {classroom.grade.name}-{classroom.section}')
                )
            else:
                self.stdout.write(f'    ⏭️  Classroom already exists: {classroom.grade.name}-{classroom.section}')
            
            created_classrooms.append(classroom)

        return created_classrooms
