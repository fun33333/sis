from django.core.management.base import BaseCommand
from campus.models import Campus


class Command(BaseCommand):
    help = 'Set campus_id for existing campuses to prevent ID changes'

    def add_arguments(self, parser):
        parser.add_argument(
            '--campus-id',
            type=str,
            help='Set specific campus ID (e.g., C01)',
        )

    def handle(self, *args, **options):
        if options['campus_id']:
            # Set specific campus ID
            campus_id = options['campus_id']
            campuses = Campus.objects.filter(campus_id__isnull=True)
            
            if campuses.exists():
                for campus in campuses:
                    campus.campus_id = campus_id
                    campus.save()
                    self.stdout.write(
                        self.style.SUCCESS(f'Set campus_id "{campus_id}" for {campus.campus_name}')
                    )
            else:
                self.stdout.write(
                    self.style.WARNING('No campuses found without campus_id')
                )
        else:
            # Show current campus IDs
            campuses = Campus.objects.all()
            
            if not campuses.exists():
                self.stdout.write(
                    self.style.WARNING('No campuses found.')
                )
                return

            self.stdout.write(
                self.style.SUCCESS(f'Current Campus IDs:')
            )
            
            for campus in campuses:
                self.stdout.write(f'  - {campus.campus_name}: {campus.campus_id or "Not Set"}')
            
            self.stdout.write(
                self.style.WARNING('\nTo set a campus ID, use: --campus-id C01')
            )
