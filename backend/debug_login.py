import os
import django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from users.models import User
from coordinator.models import Coordinator

print("=== USER LOGIN DEBUG ===")

# Check all users
users = User.objects.all()
print(f"Total users: {users.count()}")
for user in users:
    print(f"  - {user.email} (Role: {user.role})")

print("\n=== COORDINATOR EMAIL MATCH ===")

# Check coordinator emails
coordinators = Coordinator.objects.all()
for coord in coordinators:
    print(f"Coordinator: {coord.full_name} - Email: {coord.email}")
    
    # Check if there's a user with this email
    try:
        user = User.objects.get(email=coord.email)
        print(f"  -> Found user: {user.email} (Role: {user.role})")
    except User.DoesNotExist:
        print(f"  -> No user found with email: {coord.email}")

print("\n=== TESTING EMAIL LOOKUP ===")
test_emails = ["yasmeen@gmail.com", "shahida@gmail.com", "rahatalisheikh45@gmail.com"]

for email in test_emails:
    try:
        user = User.objects.get(email=email)
        print(f"Email {email} -> User found: {user.email} (Role: {user.role})")
    except User.DoesNotExist:
        print(f"Email {email} -> No user found")
    
    try:
        coord = Coordinator.objects.get(email=email)
        print(f"Email {email} -> Coordinator found: {coord.full_name}")
    except Coordinator.DoesNotExist:
        print(f"Email {email} -> No coordinator found")
