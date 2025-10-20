from django.core.management.base import BaseCommand
from django.utils import timezone
from students.models import Student
from student_status.models import ExitRecord


class Command(BaseCommand):
    help = 'Bulk delete students based on various criteria'

    def add_arguments(self, parser):
        parser.add_argument(
            '--campus',
            type=str,
            help='Delete students from specific campus (campus code)',
        )
        parser.add_argument(
            '--grade',
            type=str,
            help='Delete students from specific grade',
        )
        parser.add_argument(
            '--status',
            type=str,
            choices=['active', 'inactive', 'terminated'],
            help='Delete students with specific status',
        )
        parser.add_argument(
            '--year',
            type=int,
            help='Delete students from specific enrollment year',
        )
        parser.add_argument(
            '--name-pattern',
            type=str,
            help='Delete students whose names contain this pattern',
        )
        parser.add_argument(
            '--dry-run',
            action='store_true',
            help='Show what would be deleted without actually deleting',
        )
        parser.add_argument(
            '--soft-delete',
            action='store_true',
            help='Soft delete students instead of hard delete',
        )
        parser.add_argument(
            '--confirm',
            action='store_true',
            help='Skip confirmation prompt',
        )

    def handle(self, *args, **options):
        # Build query based on provided criteria
        query = Student.objects.exclude(is_deleted=True)
        
        filters_applied = []
        
        if options['campus']:
            query = query.filter(campus__code=options['campus'])
            filters_applied.append(f"campus={options['campus']}")
        
        if options['grade']:
            query = query.filter(current_grade=options['grade'])
            filters_applied.append(f"grade={options['grade']}")
        
        if options['status']:
            # Since current_state is removed, we'll use is_deleted status instead
            if options['status'] == 'active':
                query = query.filter(is_deleted=False)
            elif options['status'] == 'deleted':
                query = query.filter(is_deleted=True)
            filters_applied.append(f"status={options['status']}")
        
        if options['year']:
            query = query.filter(enrollment_year=options['year'])
            filters_applied.append(f"year={options['year']}")
        
        if options['name_pattern']:
            query = query.filter(name__icontains=options['name_pattern'])
            filters_applied.append(f"name contains '{options['name_pattern']}'")
        
        # If no filters applied, show warning
        if not filters_applied:
            self.stdout.write(
                self.style.ERROR(
                    'No filters specified. Please provide at least one filter to avoid deleting all students.'
                )
            )
            return

        students_to_delete = query
        
        if not students_to_delete.exists():
            self.stdout.write(
                self.style.WARNING('No students found matching the criteria.')
            )
            return

        self.stdout.write(
            self.style.SUCCESS(
                f'Found {students_to_delete.count()} students matching criteria: {", ".join(filters_applied)}'
            )
        )
        
        # Show first 10 students as preview
        preview_students = students_to_delete[:10]
        for student in preview_students:
            self.stdout.write(f'  - {student.name} ({student.student_code or student.student_id})')
        
        if students_to_delete.count() > 10:
            self.stdout.write(f'  ... and {students_to_delete.count() - 10} more students')

        if options['dry_run']:
            self.stdout.write(
                self.style.WARNING('DRY RUN: No students were actually deleted.')
            )
            return

        if not options['confirm']:
            confirm = input(
                f'\nAre you sure you want to delete {students_to_delete.count()} students? '
                'Type "yes" to confirm: '
            )
            if confirm.lower() != 'yes':
                self.stdout.write(
                    self.style.WARNING('Operation cancelled.')
                )
                return

        deleted_count = 0
        
        for student in students_to_delete:
            try:
                if options['soft_delete']:
                    # Soft delete - mark as deleted but keep in database
                    student.soft_delete()
                    self.stdout.write(
                        self.style.SUCCESS(f'Soft deleted: {student.name}')
                    )
                else:
                    # Hard delete - permanently remove from database
                    # Create exit record before deletion
                    ExitRecord.objects.create(
                        student=student,
                        exit_type='termination',
                        reason='other',
                        other_reason=f'Bulk deleted via management command - Criteria: {", ".join(filters_applied)}',
                        date_of_effect=timezone.now().date(),
                        notes='Deleted via bulk delete management command'
                    )
                    
                    student.hard_delete()
                    self.stdout.write(
                        self.style.SUCCESS(f'Hard deleted: {student.name}')
                    )
                
                deleted_count += 1
                
            except Exception as e:
                self.stdout.write(
                    self.style.ERROR(f'Error deleting {student.name}: {str(e)}')
                )

        if options['soft_delete']:
            self.stdout.write(
                self.style.SUCCESS(
                    f'Successfully soft deleted {deleted_count} students.'
                )
            )
        else:
            self.stdout.write(
                self.style.SUCCESS(
                    f'Successfully hard deleted {deleted_count} students.'
                )
            )
