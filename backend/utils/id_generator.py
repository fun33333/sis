from django.db import models
from campus.models import Campus
from teachers.models import Teacher
from coordinator.models import Coordinator
from principals.models import Principal


class IDGenerator:
    @staticmethod
    def get_shift_code(shift):
        """Convert shift to code"""
        shift_map = {
            'morning': 'M',
            'afternoon': 'A', 
            'both': 'B',        # Morning + Afternoon
            'all': 'ALL'        # All shifts
        }
        return shift_map.get(shift.lower(), 'M')

    @staticmethod
    def get_role_code(role):
        """Convert role to code"""
        role_map = {
            'teacher': 'T',
            'coordinator': 'C',
            'principal': 'P',
            'superadmin': 'S'
        }
        return role_map.get(role.lower(), 'T')
    
    @staticmethod
    def get_campus_code_from_id(campus_id):
        """Convert campus ID to C01, C02 format"""
        return f"C{campus_id:02d}"
    
    @staticmethod
    def generate_employee_code(campus_id, shift, year, role, entity_id):
        """Generate employee code: C01-M-25-P-0001"""
        campus_code = IDGenerator.get_campus_code_from_id(campus_id)
        shift_code = IDGenerator.get_shift_code(shift)
        role_code = IDGenerator.get_role_code(role)
        year_short = str(year)[-2:]  # Last 2 digits of year
        
        return f"{campus_code}-{shift_code}-{year_short}-{role_code}-{entity_id:04d}"
    
    @staticmethod
    def get_next_employee_number(campus_id, shift, year, role):
        """Get next available employee number for given campus, shift, year, role"""
        try:
            # Get all existing employee codes for this combination
            existing_codes = []
            
            # Check teachers
            teachers = Teacher.objects.filter(
                current_campus_id=campus_id,
                shift=shift,
                employee_code__isnull=False
            ).values_list('employee_code', flat=True)
            existing_codes.extend(teachers)
            
            # Check coordinators (no shift field, use default 'morning')
            coordinators = Coordinator.objects.filter(
                campus_id=campus_id,
                employee_code__isnull=False
            ).values_list('employee_code', flat=True)
            existing_codes.extend(coordinators)
            
            # Check principals
            principals = Principal.objects.filter(
                campus_id=campus_id,
                shift=shift,
                employee_code__isnull=False
            ).values_list('employee_code', flat=True)
            existing_codes.extend(principals)
            
            # Extract numbers from existing codes
            numbers = []
            for code in existing_codes:
                if code and '-' in code:
                    try:
                        # Extract last part (number) from code like C01-M-25-P-0001
                        number_part = code.split('-')[-1]
                        if number_part.isdigit():
                            numbers.append(int(number_part))
                    except (ValueError, IndexError):
                        continue
            
            # Return next available number
            if not numbers:
                return 1
            
            return max(numbers) + 1
            
        except Exception as e:
            print(f"Error getting next employee number: {str(e)}")
            return 1

    @staticmethod
    def generate_unique_employee_code(campus, shift, year, role):
        """Generate unique employee code with validation"""
        try:
            # Use campus ID instead of campus_code
            campus_id = campus.id
            if not campus_id:
                raise ValueError("Campus ID is required")
            
            # Get next available number
            next_number = IDGenerator.get_next_employee_number(campus_id, shift, year, role)
            
            # Generate code
            employee_code = IDGenerator.generate_employee_code(campus_id, shift, year, role, next_number)
            
            # Double check uniqueness
            if (Teacher.objects.filter(employee_code=employee_code).exists() or
                Coordinator.objects.filter(employee_code=employee_code).exists() or
                Principal.objects.filter(employee_code=employee_code).exists()):
                # If somehow still exists, try next number
                next_number += 1
                employee_code = IDGenerator.generate_employee_code(campus_id, shift, year, role, next_number)
            
            return employee_code
            
        except Exception as e:
            raise ValueError(f"Failed to generate employee code: {str(e)}")

# utils/id_generator.py me ye methods add karo
@staticmethod
def generate_unique_student_code(classroom, year):
    """Generate unique student code for classroom"""
    pass