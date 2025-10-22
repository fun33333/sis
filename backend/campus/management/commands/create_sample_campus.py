from django.core.management.base import BaseCommand
from campus.models import Campus
from datetime import date

class Command(BaseCommand):
    help = 'Create sample campus data for testing'

    def handle(self, *args, **options):
        # Check if campuses already exist
        if Campus.objects.count() > 0:
            self.stdout.write(
                self.style.WARNING(f'Found {Campus.objects.count()} existing campuses')
            )
            return

        # Create sample campuses
        campuses_data = [
            {
                'campus_name': 'Main Campus Karachi',
                'campus_code': 'MC001',
                'campus_type': 'main',
                'city': 'Karachi',
                'postal_code': '75080',
                'address_full': '123 Main Street, Karachi',
                'primary_phone': '+92-21-1234567',
                'official_email': 'main@school.edu.pk',
                'campus_head_name': 'Dr. Ahmed Khan',
                'campus_head_phone': '+92-21-1234568',
                'campus_head_email': 'principal@school.edu.pk',
                'instruction_language': 'English',
                'academic_year_start': date(2024, 4, 1),
                'academic_year_end': date(2025, 3, 31),
                'established_year': 2020,
                'student_capacity': 1000,
                'total_classrooms': 20,
                'grades_available': 'Nursery, KG-I, KG-II, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10',
                'shift_available': 'both',
                'status': 'active'
            },
            {
                'campus_name': 'Branch Campus Lahore',
                'campus_code': 'BC002',
                'campus_type': 'branch',
                'city': 'Lahore',
                'postal_code': '54000',
                'address_full': '456 Branch Road, Lahore',
                'primary_phone': '+92-42-9876543',
                'official_email': 'branch@school.edu.pk',
                'campus_head_name': 'Ms. Fatima Ali',
                'campus_head_phone': '+92-42-9876544',
                'campus_head_email': 'principal.lahore@school.edu.pk',
                'instruction_language': 'English',
                'academic_year_start': date(2024, 4, 1),
                'academic_year_end': date(2025, 3, 31),
                'established_year': 2022,
                'student_capacity': 500,
                'total_classrooms': 15,
                'grades_available': 'Nursery, KG-I, KG-II, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10',
                'shift_available': 'morning',
                'status': 'active'
            }
        ]

        for campus_data in campuses_data:
            campus = Campus.objects.create(**campus_data)
            self.stdout.write(
                self.style.SUCCESS(f'Created campus: {campus.campus_name} (ID: {campus.id})')
            )

        self.stdout.write(
            self.style.SUCCESS(f'Successfully created {len(campuses_data)} sample campuses')
        )
