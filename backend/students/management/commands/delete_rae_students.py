from django.core.management.base import BaseCommand
from django.utils import timezone
from students.models import Student
from student_status.models import ExitRecord


class Command(BaseCommand):
    help = 'Delete RAE (Rae Aamad-e-Education) students from the database'

    def add_arguments(self, parser):
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
        # Find RAE students (students with specific patterns or criteria)
        # You can modify this query based on your specific RAE student identification criteria
        rae_students = Student.objects.filter(
            # Add your specific criteria for RAE students here
            # For example: name__icontains='RAE' or some other identifier
            name__icontains='RAE'
        ).exclude(is_deleted=True)
        
        if not rae_students.exists():
            self.stdout.write(
                self.style.WARNING('No RAE students found to delete.')
            )
            return

        self.stdout.write(
            self.style.SUCCESS(f'Found {rae_students.count()} RAE students:')
        )
        
        for student in rae_students:
            self.stdout.write(f'  - {student.name} ({student.student_code or student.student_id})')

        if options['dry_run']:
            self.stdout.write(
                self.style.WARNING('DRY RUN: No students were actually deleted.')
            )
            return

        if not options['confirm']:
            confirm = input(
                f'\nAre you sure you want to delete {rae_students.count()} RAE students? '
                'Type "yes" to confirm: '
            )
            if confirm.lower() != 'yes':
                self.stdout.write(
                    self.style.WARNING('Operation cancelled.')
                )
                return

        deleted_count = 0
        
        for student in rae_students:
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
                        other_reason='RAE student deleted from system',
                        date_of_effect=timezone.now().date(),
                        notes='Deleted via management command'
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
                    f'Successfully soft deleted {deleted_count} RAE students.'
                )
            )
        else:
            self.stdout.write(
                self.style.SUCCESS(
                    f'Successfully hard deleted {deleted_count} RAE students.'
                )
            )
