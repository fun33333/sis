from django.contrib.auth.hashers import make_password
from django.db import transaction
from users.models import User
from teachers.models import Teacher
from coordinator.models import Coordinator
from principals.models import Principal
from utils.id_generator import IDGenerator

class UserCreationService:
    
    @staticmethod
    def validate_entity_data(entity, entity_type):
        """Validate required fields for entity"""
        required_fields = {
            'teacher': ['full_name', 'email', 'contact_number', 'campus', 'joining_date'],  # cnic remove kiya
            'coordinator': ['full_name', 'email', 'contact_number', 'campus', 'level', 'joining_date'],  # cnic remove kiya
            'principal': ['full_name', 'email', 'contact_number', 'campus', 'joining_date']  # cnic remove kiya
        }
        
        for field in required_fields.get(entity_type, []):
            value = getattr(entity, field, None)
            if not value or (isinstance(value, str) and not value.strip()):
                return False, f"Missing or empty field: {field}"
        
        return True, "Valid"
    
    @staticmethod
    def generate_employee_code(entity, entity_type):
        """Generate employee code for entity"""
        try:
            # Get shift from campus or default to morning
            shift = getattr(entity.campus, 'shift_available', 'morning')
            if shift == 'both':
                shift = 'morning'  # Default to morning for both
            
            # Get year from joining date or current year
            year = entity.joining_date.year if hasattr(entity, 'joining_date') and entity.joining_date else 2025
            
            return IDGenerator.generate_unique_employee_code(
                entity.campus, shift, year, entity_type
            )
        except Exception as e:
            raise ValueError(f"Failed to generate employee code: {str(e)}")
    
    @staticmethod
    def create_user_from_entity(entity, entity_type):
        """Create user from entity with full validation"""
        try:
            # Validate entity data
            is_valid, error_msg = UserCreationService.validate_entity_data(entity, entity_type)
            if not is_valid:
                return None, f"Validation failed: {error_msg}"
            
            # Check if user already exists
            if User.objects.filter(email=entity.email).exists():
                return None, "User with this email already exists"
            
            # Generate employee code
            employee_code = UserCreationService.generate_employee_code(entity, entity_type)
            
            # Create user with transaction
            with transaction.atomic():
                user = User.objects.create(
                    username=employee_code,
                    email=entity.email,
                    first_name=entity.full_name.split()[0] if entity.full_name else '',
                    last_name=' '.join(entity.full_name.split()[1:]) if len(entity.full_name.split()) > 1 else '',
                    role=entity_type,
                    campus=entity.campus,
                    phone_number=entity.contact_number,
                    password=make_password('12345'),  # Default password
                    is_verified=True  # Auto-verify since created by admin
                )
                
                # Update entity with employee code
                entity.employee_code = employee_code
                entity.save()
                
                return user, "User created successfully"
                
        except Exception as e:
            return None, f"Failed to create user: {str(e)}"
    
    @staticmethod
    def create_users_for_existing_entities():
        """Create users for existing entities without users"""
        results = {
            'teachers': {'created': 0, 'failed': 0, 'errors': []},
            'coordinators': {'created': 0, 'failed': 0, 'errors': []},
            'principals': {'created': 0, 'failed': 0, 'errors': []}
        }
        
        # Process teachers
        for teacher in Teacher.objects.filter(employee_code__isnull=True):
            user, message = UserCreationService.create_user_from_entity(teacher, 'teacher')
            if user:
                results['teachers']['created'] += 1
            else:
                results['teachers']['failed'] += 1
                results['teachers']['errors'].append(f"Teacher {teacher.id}: {message}")
        
        # Process coordinators
        for coordinator in Coordinator.objects.filter(employee_code__isnull=True):
            user, message = UserCreationService.create_user_from_entity(coordinator, 'coordinator')
            if user:
                results['coordinators']['created'] += 1
            else:
                results['coordinators']['failed'] += 1
                results['coordinators']['errors'].append(f"Coordinator {coordinator.id}: {message}")
        
        # Process principals
        for principal in Principal.objects.filter(employee_code__isnull=True):
            user, message = UserCreationService.create_user_from_entity(principal, 'principal')
            if user:
                results['principals']['created'] += 1
            else:
                results['principals']['failed'] += 1
                results['principals']['errors'].append(f"Principal {principal.id}: {message}")
        
        return results