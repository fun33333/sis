from django.core.management.base import BaseCommand
from campus.models import Campus


class Command(BaseCommand):
    help = 'Fix campus codes for existing campuses'

    def add_arguments(self, parser):
        parser.add_argument(
            '--dry-run',
            action='store_true',
            help='Show what would be changed without actually changing',
        )

    def handle(self, *args, **options):
        campuses = Campus.objects.all()
        
        if not campuses.exists():
            self.stdout.write(
                self.style.WARNING('No campuses found.')
            )
            return

        self.stdout.write(
            self.style.SUCCESS(f'Found {campuses.count()} campuses:')
        )
        
        for campus in campuses:
            current_code = campus.campus_code
            suggested_code = f"C{campus.id:02d}-L1"  # C32-L1 format
            
            self.stdout.write(f'  - {campus.campus_name}:')
            self.stdout.write(f'    Current Code: {current_code}')
            self.stdout.write(f'    Suggested Code: {suggested_code}')
            
            if not options['dry_run']:
                if current_code != suggested_code:
                    campus.campus_code = suggested_code
                    campus.save()
                    self.stdout.write(
                        self.style.SUCCESS(f'    ✅ Updated to: {suggested_code}')
                    )
                else:
                    self.stdout.write(
                        self.style.WARNING(f'    ⚠️ Already correct')
                    )
            else:
                if current_code != suggested_code:
                    self.stdout.write(
                        self.style.WARNING(f'    🔄 Would update to: {suggested_code}')
                    )
                else:
                    self.stdout.write(
                        self.style.SUCCESS(f'    ✅ Already correct')
                    )

        if options['dry_run']:
            self.stdout.write(
                self.style.WARNING('\nDRY RUN: No changes were made.')
            )
        else:
            self.stdout.write(
                self.style.SUCCESS('\n✅ Campus codes updated successfully!')
            )
