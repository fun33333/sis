from rest_framework import serializers
from django.contrib.auth import get_user_model
from .models import TransferRequest, IDHistory
from students.models import Student
from teachers.models import Teacher
from campus.models import Campus

User = get_user_model()


class TransferRequestSerializer(serializers.ModelSerializer):
    """Serializer for TransferRequest model"""
    from_campus_name = serializers.CharField(source='from_campus.name', read_only=True)
    to_campus_name = serializers.CharField(source='to_campus.name', read_only=True)
    requesting_principal_name = serializers.CharField(source='requesting_principal.get_full_name', read_only=True)
    receiving_principal_name = serializers.CharField(source='receiving_principal.get_full_name', read_only=True)
    entity_name = serializers.CharField(read_only=True)
    current_id = serializers.CharField(read_only=True)
    
    class Meta:
        model = TransferRequest
        fields = [
            'id', 'request_type', 'status', 'from_campus', 'from_campus_name',
            'from_shift', 'requesting_principal', 'requesting_principal_name',
            'to_campus', 'to_campus_name', 'to_shift', 'receiving_principal',
            'receiving_principal_name', 'student', 'teacher', 'reason',
            'requested_date', 'notes', 'reviewed_at', 'decline_reason',
            'created_at', 'updated_at', 'entity_name', 'current_id'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at', 'reviewed_at']


class TransferRequestCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating TransferRequest"""
    
    class Meta:
        model = TransferRequest
        fields = [
            'request_type', 'from_campus', 'from_shift', 'to_campus', 'to_shift',
            'student', 'teacher', 'reason', 'requested_date', 'notes', 'receiving_principal'
        ]
        read_only_fields = ['receiving_principal']
    
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        # Add transfer_type as a non-model field for validation
        self.fields['transfer_type'] = serializers.CharField(required=False, write_only=True)
    
    def validate(self, data):
        """Validate transfer request data"""
        request_type = data.get('request_type')
        student = data.get('student')
        teacher = data.get('teacher')
        
        # Ensure either student or teacher is provided based on request type
        if request_type == 'student' and not student:
            raise serializers.ValidationError("Student is required for student transfer requests")
        elif request_type == 'teacher' and not teacher:
            raise serializers.ValidationError("Teacher is required for teacher transfer requests")
        elif request_type == 'student' and teacher:
            raise serializers.ValidationError("Teacher should not be provided for student transfer requests")
        elif request_type == 'teacher' and student:
            raise serializers.ValidationError("Student should not be provided for teacher transfer requests")
        
        # Validate that from and to campuses are different (except for shift transfers)
        transfer_type = data.get('transfer_type', 'campus')
        if transfer_type == 'campus' and data.get('from_campus') == data.get('to_campus'):
            raise serializers.ValidationError("Source and destination campuses must be different for campus transfers")
        
        # For shift transfers, campuses should be the same
        if transfer_type == 'shift' and data.get('from_campus') != data.get('to_campus'):
            raise serializers.ValidationError("Source and destination campuses must be the same for shift transfers")
        
        return data


class TransferApprovalSerializer(serializers.Serializer):
    """Serializer for transfer approval/decline"""
    reason = serializers.CharField(required=False, allow_blank=True)
    
    def validate_reason(self, value):
        """Validate reason field"""
        if not value or not value.strip():
            return "No reason provided"
        return value.strip()


class IDHistorySerializer(serializers.ModelSerializer):
    """Serializer for IDHistory model"""
    entity_name = serializers.CharField(read_only=True)
    changed_by_name = serializers.CharField(source='changed_by.get_full_name', read_only=True)
    
    class Meta:
        model = IDHistory
        fields = [
            'id', 'entity_type', 'student', 'teacher', 'old_id', 'old_campus_code',
            'old_shift', 'old_year', 'new_id', 'new_campus_code', 'new_shift',
            'new_year', 'immutable_suffix', 'transfer_request', 'changed_by',
            'changed_by_name', 'change_reason', 'changed_at', 'entity_name'
        ]
        read_only_fields = ['id', 'changed_at']


class IDPreviewSerializer(serializers.Serializer):
    """Serializer for ID change preview"""
    old_id = serializers.CharField()
    new_id = serializers.CharField()
    changes = serializers.DictField()