from django.core.management.base import BaseCommand
from campus.models import Campus


class Command(BaseCommand):
    help = 'Update campus_id for existing campuses'

    def add_arguments(self, parser):
        parser.add_argument(
            '--campus-name',
            type=str,
            help='Campus name to update',
        )
        parser.add_argument(
            '--new-id',
            type=str,
            help='New campus ID to set',
        )

    def handle(self, *args, **options):
        if not options['campus_name'] or not options['new_id']:
            self.stdout.write(
                self.style.ERROR('Please provide --campus-name and --new-id')
            )
            return

        try:
            campus = Campus.objects.get(campus_name=options['campus_name'])
            old_id = campus.campus_id
            campus.campus_id = options['new_id']
            campus.save()
            
            self.stdout.write(
                self.style.SUCCESS(
                    f'Updated {campus.campus_name}: {old_id} -> {options["new_id"]}'
                )
            )
        except Campus.DoesNotExist:
            self.stdout.write(
                self.style.ERROR(f'Campus "{options["campus_name"]}" not found')
            )
        except Exception as e:
            self.stdout.write(
                self.style.ERROR(f'Error: {str(e)}')
            )
