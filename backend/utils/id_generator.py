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
            'evening': 'E'
        }
        return shift_map.get(shift.lower(), 'M')
    
    @staticmethod
    def get_role_code(role):
        """Convert role to code"""
        role_map = {
            'teacher': 'T',
            'coordinator': 'C',
            'principal': 'P'
        }
        return role_map.get(role.lower(), 'T')
    
    @staticmethod
    def get_campus_code_from_id(campus_id):
        """Convert campus ID to C01, C02 format"""
        return f"C{campus_id:02d}"
    
    @staticmethod
    def generate_employee_code(campus_id, shift, year, role, entity_id):
        """Generate employee code: C01-M-25-C-0001"""
        campus_code = IDGenerator.get_campus_code_from_id(campus_id)
        shift_code = IDGenerator.get_shift_code(shift)
        role_code = IDGenerator.get_role_code(role)
        year_short = str(year)[-2:]  # Last 2 digits of year
        
        return f"{campus_code}-{shift_code}-{year_short}-{role_code}-{entity_id:04d}"
    
    @staticmethod
    def get_next_employee_number(campus_id, shift, year, role):
        """Get next available employee number for given criteria"""
        campus_code = IDGenerator.get_campus_code_from_id(campus_id)
        shift_code = IDGenerator.get_shift_code(shift)
        role_code = IDGenerator.get_role_code(role)
        year_short = str(year)[-2:]
        
        # Check all models for existing codes
        pattern = f"{campus_code}-{shift_code}-{year_short}-{role_code}-"
        
        # Check teachers
        teacher_codes = Teacher.objects.filter(employee_code__startswith=pattern).values_list('employee_code', flat=True)
        # Check coordinators  
        coordinator_codes = Coordinator.objects.filter(employee_code__startswith=pattern).values_list('employee_code', flat=True)
        # Check principals
        principal_codes = Principal.objects.filter(employee_code__startswith=pattern).values_list('employee_code', flat=True)
        
        # Combine all codes
        all_codes = list(teacher_codes) + list(coordinator_codes) + list(principal_codes)
        
        # Extract numbers and find next available
        numbers = []
        for code in all_codes:
            try:
                num = int(code.split('-')[-1])
                numbers.append(num)
            except (ValueError, IndexError):
                continue
        
        return max(numbers) + 1 if numbers else 1
    
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
    try:
        campus = classroom.campus
        grade = classroom.grade
        
        # Get campus code
        campus_code = IDGenerator.get_campus_code_from_id(campus.id)
        
        # Get grade code
        grade_code = grade.short_code or f"G{grade.id:02d}"
        
        # Get year
        year_short = str(year)[-2:]
        
        # Get next student number for this classroom
        next_number = IDGenerator.get_next_student_number(classroom, year)
        
        # Format: C01-G1-25-0001
        return f"{campus_code}-{grade_code}-{year_short}-{next_number:04d}"
        
    except Exception as e:
        raise ValueError(f"Failed to generate student code: {str(e)}")

@staticmethod
def get_next_student_number(classroom, year):
    """Get next student number for classroom"""
    try:
        # Count existing students in this classroom
        existing_count = classroom.students.count()
        return existing_count + 1
    except Exception as e:
        return 1