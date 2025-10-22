from django.core.management.base import BaseCommand
from django.db import transaction
from django.contrib.auth import get_user_model


class Command(BaseCommand):
    help = "Seed initial users: superadmin, principal (admin), coordinator, teacher. Creates a default campus if missing."

    @transaction.atomic
    def handle(self, *args, **options):
        User = get_user_model()

        # Ensure at least one campus exists
        from campus.models import Campus
        campus = Campus.objects.first()
        if campus is None:
            campus = Campus.objects.create(
                name="Campus 1",
                code="C01",
                status="active",
                governing_body="idara-Alkhair",
                address="Karachi",
                grades_offered="Grade 1 - Grade 10",
                languages_of_instruction="English, Urdu",
                capacity=1000,
            )
            self.stdout.write(self.style.SUCCESS(f"Created default campus: {campus.name}"))

        # Users to create
        users_data = [
            {
                "email": "superadmin@example.com",
                "username": "superadmin",
                "first_name": "Super",
                "last_name": "Admin",
                "role": "superadmin",
                "password": "Admin@12345",
                "campus": None,
                "is_staff": True,
                "is_superuser": True,
            },
            {
                "email": "principal@example.com",
                "username": "principal",
                "first_name": "School",
                "last_name": "Principal",
                "role": "principal",
                "password": "Principal@12345",
                "campus": campus,
                "is_staff": True,
                "is_superuser": False,
            },
            {
                "email": "coordinator@example.com",
                "username": "coordinator",
                "first_name": "Class",
                "last_name": "Coordinator",
                "role": "coordinator",
                "password": "Coordinator@12345",
                "campus": campus,
                "is_staff": True,
                "is_superuser": False,
            },
            {
                "email": "teacher@example.com",
                "username": "teacher",
                "first_name": "Test",
                "last_name": "Teacher",
                "role": "teacher",
                "password": "Teacher@12345",
                "campus": campus,
                "is_staff": False,
                "is_superuser": False,
            },
        ]

        for data in users_data:
            user, created = User.objects.get_or_create(
                email=data["email"],
                defaults={
                    "username": data["username"],
                    "first_name": data["first_name"],
                    "last_name": data["last_name"],
                    "role": data["role"],
                    "campus": data["campus"],
                    "is_active": True,
                    "is_verified": True,
                    "is_staff": data.get("is_staff", False),
                    "is_superuser": data.get("is_superuser", False),
                },
            )
            if created:
                user.set_password(data["password"])
                user.save()
                self.stdout.write(self.style.SUCCESS(f"Created {data['role']}: {data['email']}"))
            else:
                # Ensure fields updated and password reset to known default
                changed = False
                for field in ["username", "first_name", "last_name", "role"]:
                    if getattr(user, field) != data[field]:
                        setattr(user, field, data[field])
                        changed = True
                if user.campus != data["campus"]:
                    user.campus = data["campus"]
                    changed = True
                user.is_active = True
                user.is_verified = True
                user.is_staff = data.get("is_staff", user.is_staff)
                user.is_superuser = data.get("is_superuser", user.is_superuser)
                user.set_password(data["password"])
                user.save()
                if changed:
                    self.stdout.write(self.style.WARNING(f"Updated {data['role']}: {data['email']}"))
                else:
                    self.stdout.write(self.style.NOTICE(f"Exists {data['role']}: {data['email']} (password reset)"))

        self.stdout.write(self.style.SUCCESS("Seeding completed."))


