from django.db import transaction
from django.db.models import F
from .models import User
from campus.models import Campus

def generate_student_id(campus_code, shift, enrollment_year, student_number):
    """
    Generate student ID in format: C03-M-25-00456
    """
    return f"{campus_code}-{shift}-{enrollment_year}-{student_number:05d}"

def generate_teacher_id(campus_code, shift, joining_year, role_code, teacher_number):
    """
    Generate teacher ID in format: C01-M-25-T-0045
    """
    return f"{campus_code}-{shift}-{joining_year}-{role_code}-{teacher_number:04d}"

def generate_class_code(campus_code, grade, section):
    """
    Generate class code in format: C01-G7A
    """
    return f"{campus_code}-{grade}{section}"

def get_next_student_number(campus, enrollment_year):
    """
    System-wide strictly increasing student number (never repeats).
    Ignores campus/year to guarantee global uniqueness as requested.
    """
    from services.models import GlobalCounter

    with transaction.atomic():
        counter, _ = GlobalCounter.objects.select_for_update().get_or_create(key='student')
        counter.value = F('value') + 1
        counter.save(update_fields=['value'])
        counter.refresh_from_db()
        return counter.value

def get_next_teacher_number(campus, joining_year):
    """
    System-wide strictly increasing employee number (never repeats).
    """
    from services.models import GlobalCounter

    with transaction.atomic():
        counter, _ = GlobalCounter.objects.select_for_update().get_or_create(key='employee')
        counter.value = F('value') + 1
        counter.save(update_fields=['value'])
        counter.refresh_from_db()
        return counter.value

def get_role_code(role):
    """
    Get role code for teacher ID
    """
    role_codes = {
        'teacher': 'T',
        'coordinator': 'C',
        'principal': 'P',
        'superadmin': 'S'
    }
    return role_codes.get(role, 'T')

def get_shift_code(shift):
    """
    Get shift code for ID generation
    """
    shift_codes = {
        'morning': 'M',
        'evening': 'E',
        'night': 'N'
    }
    return shift_codes.get(shift.lower(), 'M')

def validate_id_format(id_string, id_type):
    """
    Validate ID format
    """
    if id_type == 'student':
        # Format: C03-M-25-00456
        parts = id_string.split('-')
        if len(parts) != 4:
            return False
        campus_code, shift, year, number = parts
        return (
            campus_code.startswith('C') and 
            len(campus_code) >= 2 and
            shift in ['M', 'E', 'N'] and
            year.isdigit() and len(year) == 2 and
            number.isdigit() and len(number) == 5
        )
    
    elif id_type == 'teacher':
        # Format: C01-M-25-T-0045
        parts = id_string.split('-')
        if len(parts) != 5:
            return False
        campus_code, shift, year, role, number = parts
        return (
            campus_code.startswith('C') and 
            len(campus_code) >= 2 and
            shift in ['M', 'E', 'N'] and
            year.isdigit() and len(year) == 2 and
            role in ['T', 'C', 'P', 'S'] and
            number.isdigit() and len(number) == 4
        )
    
    elif id_type == 'class':
        # Format: C01-G7A
        parts = id_string.split('-')
        if len(parts) != 2:
            return False
        campus_code, grade_section = parts
        return (
            campus_code.startswith('C') and 
            len(campus_code) >= 2 and
            len(grade_section) >= 2
        )
    
    return False

def extract_id_info(id_string, id_type):
    """
    Extract information from ID string
    """
    if not validate_id_format(id_string, id_type):
        return None
    
    parts = id_string.split('-')
    
    if id_type == 'student':
        return {
            'campus_code': parts[0],
            'shift': parts[1],
            'enrollment_year': int(parts[2]),
            'student_number': int(parts[3])
        }
    
    elif id_type == 'teacher':
        return {
            'campus_code': parts[0],
            'shift': parts[1],
            'joining_year': int(parts[2]),
            'role_code': parts[3],
            'teacher_number': int(parts[4])
        }
    
    elif id_type == 'class':
        return {
            'campus_code': parts[0],
            'grade_section': parts[1]
        }
    
    return None
