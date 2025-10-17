from datetime import datetime
from django.db import transaction
from django.contrib.auth.models import User
from .models import IDHistory, TransferRequest


class IDUpdateService:
    """Service class for handling ID updates during transfers"""
    
    @staticmethod
    def parse_id(id_string):
        """Parse ID string and return components"""
        parts = id_string.split('-')
        if len(parts) >= 3:
            return {
                'campus_code': parts[0],
                'shift': parts[1],
                'year': parts[2],
                'suffix': parts[-1] if len(parts) > 3 else '',
                'role': parts[3] if len(parts) > 4 else None
            }
        return None
    
    @staticmethod
    def generate_new_id(old_id, new_campus_code, new_shift, new_year=None, new_role=None):
        """Generate new ID based on old ID and new parameters"""
        parsed = IDUpdateService.parse_id(old_id)
        if not parsed:
            return None
        
        # Use current year if not provided
        if new_year is None:
            new_year = str(datetime.now().year)[-2:]
        
        # Preserve immutable suffix
        immutable_suffix = parsed['suffix']
        
        # For teachers, include role
        if new_role:
            return f"{new_campus_code}-{new_shift}-{new_year}-{new_role}-{immutable_suffix}"
        else:
            return f"{new_campus_code}-{new_shift}-{new_year}-{immutable_suffix}"
    
    @staticmethod
    @transaction.atomic
    def update_student_id(student, new_campus, new_shift, transfer_request, changed_by, reason):
        """Update student ID and create history record"""
        old_id = student.student_id
        parsed = IDUpdateService.parse_id(old_id)
        
        if not parsed:
            raise ValueError(f"Invalid student ID format: {old_id}")
        
        # Generate new ID
        new_id = IDUpdateService.generate_new_id(
            old_id, 
            new_campus.campus_code, 
            new_shift, 
            str(datetime.now().year)[-2:]
        )
        
        if not new_id:
            raise ValueError("Failed to generate new student ID")
        
        # Create history record
        history = IDHistory.objects.create(
            entity_type='student',
            student=student,
            old_id=old_id,
            old_campus_code=parsed['campus_code'],
            old_shift=parsed['shift'],
            old_year=parsed['year'],
            new_id=new_id,
            new_campus_code=new_campus.campus_code,
            new_shift=new_shift,
            new_year=str(datetime.now().year)[-2:],
            immutable_suffix=parsed['suffix'],
            transfer_request=transfer_request,
            changed_by=changed_by,
            change_reason=reason
        )
        
        # Update student
        student.student_id = new_id
        student.current_campus = new_campus
        student.shift = new_shift
        student.save()
        
        return {
            'new_id': new_id,
            'history': history
        }
    
    @staticmethod
    @transaction.atomic
    def update_teacher_id(teacher, new_campus, new_shift, new_role, transfer_request, changed_by, reason):
        """Update teacher ID and create history record"""
        old_id = teacher.employee_code
        parsed = IDUpdateService.parse_id(old_id)
        
        if not parsed:
            raise ValueError(f"Invalid teacher ID format: {old_id}")
        
        # Generate new ID
        new_id = IDUpdateService.generate_new_id(
            old_id, 
            new_campus.campus_code, 
            new_shift, 
            str(datetime.now().year)[-2:],
            new_role
        )
        
        if not new_id:
            raise ValueError("Failed to generate new teacher ID")
        
        # Create history record
        history = IDHistory.objects.create(
            entity_type='teacher',
            teacher=teacher,
            old_id=old_id,
            old_campus_code=parsed['campus_code'],
            old_shift=parsed['shift'],
            old_year=parsed['year'],
            new_id=new_id,
            new_campus_code=new_campus.campus_code,
            new_shift=new_shift,
            new_year=str(datetime.now().year)[-2:],
            immutable_suffix=parsed['suffix'],
            transfer_request=transfer_request,
            changed_by=changed_by,
            change_reason=reason
        )
        
        # Update teacher
        teacher.employee_code = new_id
        teacher.current_campus = new_campus
        teacher.shift = new_shift
        teacher.role = new_role
        teacher.save()
        
        return {
            'new_id': new_id,
            'history': history
        }
    
    @staticmethod
    def preview_id_change(old_id, new_campus_code, new_shift, new_role=None):
        """Preview what the new ID would look like without making changes"""
        parsed = IDUpdateService.parse_id(old_id)
        if not parsed:
            return None
        
        new_id = IDUpdateService.generate_new_id(
            old_id, 
            new_campus_code, 
            new_shift, 
            str(datetime.now().year)[-2:],
            new_role
        )
        
        return {
            'old_id': old_id,
            'new_id': new_id,
            'changes': {
                'campus_code': f"{parsed['campus_code']} → {new_campus_code}",
                'shift': f"{parsed['shift']} → {new_shift}",
                'year': f"{parsed['year']} → {str(datetime.now().year)[-2:]}",
                'role': f"{parsed.get('role', 'N/A')} → {new_role}" if new_role else None,
                'suffix': f"{parsed['suffix']} (preserved)"
            }
        }

