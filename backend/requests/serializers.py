from rest_framework import serializers
from .models import RequestComplaint, RequestComment, RequestStatusHistory

class RequestCommentSerializer(serializers.ModelSerializer):
    """Serializer for request comments"""
    
    class Meta:
        model = RequestComment
        fields = ['id', 'user_type', 'comment', 'created_at']
        read_only_fields = ['id', 'created_at']

class RequestStatusHistorySerializer(serializers.ModelSerializer):
    """Serializer for status history"""
    
    class Meta:
        model = RequestStatusHistory
        fields = ['id', 'old_status', 'new_status', 'changed_by', 'notes', 'changed_at']
        read_only_fields = ['id', 'changed_at']

class RequestComplaintListSerializer(serializers.ModelSerializer):
    """Serializer for request list view"""
    
    teacher_name = serializers.SerializerMethodField(read_only=True)
    coordinator_name = serializers.CharField(source='coordinator.full_name', read_only=True)
    category_display = serializers.CharField(source='get_category_display', read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    priority_display = serializers.CharField(source='get_priority_display', read_only=True)
    
    def get_teacher_name(self, obj):
        """Return teacher name with employee code"""
        teacher = obj.teacher
        if teacher.employee_code:
            return f"{teacher.full_name} ({teacher.employee_code})"
        return teacher.full_name
    
    class Meta:
        model = RequestComplaint
        fields = [
            'id', 'category', 'category_display', 'subject', 'status', 'status_display',
            'priority', 'priority_display', 'teacher_name', 'coordinator_name',
            'created_at', 'updated_at', 'reviewed_at', 'resolved_at'
        ]

class RequestComplaintDetailSerializer(serializers.ModelSerializer):
    """Serializer for detailed request view"""
    
    teacher_name = serializers.SerializerMethodField(read_only=True)
    teacher_email = serializers.CharField(source='teacher.email', read_only=True)
    coordinator_name = serializers.CharField(source='coordinator.full_name', read_only=True)
    coordinator_email = serializers.CharField(source='coordinator.email', read_only=True)
    category_display = serializers.CharField(source='get_category_display', read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    priority_display = serializers.CharField(source='get_priority_display', read_only=True)
    
    comments = RequestCommentSerializer(many=True, read_only=True)
    status_history = RequestStatusHistorySerializer(many=True, read_only=True)
    
    def get_teacher_name(self, obj):
        """Return teacher name with employee code"""
        teacher = obj.teacher
        if teacher.employee_code:
            return f"{teacher.full_name} ({teacher.employee_code})"
        return teacher.full_name
    
    class Meta:
        model = RequestComplaint
        fields = [
            'id', 'category', 'category_display', 'subject', 'description',
            'status', 'status_display', 'priority', 'priority_display',
            'coordinator_notes', 'resolution_notes',
            'teacher_name', 'teacher_email', 'coordinator_name', 'coordinator_email',
            'created_at', 'updated_at', 'reviewed_at', 'resolved_at',
            'comments', 'status_history'
        ]

class RequestComplaintCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating new requests"""
    
    class Meta:
        model = RequestComplaint
        fields = ['category', 'subject', 'description']
    
    def create(self, validated_data):
        # Set default priority to 'medium' for teacher requests
        validated_data['priority'] = 'medium'
        
        # Get teacher from request user
        user = self.context['request'].user
        try:
            from teachers.models import Teacher
            teacher = Teacher.objects.get(email=user.email)
        except Teacher.DoesNotExist:
            raise serializers.ValidationError("Teacher profile not found")
        
        # Get teacher's assigned coordinator
        if not teacher.assigned_coordinators.exists():
            raise serializers.ValidationError("No coordinator assigned to this teacher")
        
        # Get the first assigned coordinator (assuming one coordinator per teacher)
        coordinator = teacher.assigned_coordinators.first()
        
        validated_data['teacher'] = teacher
        validated_data['coordinator'] = coordinator
        
        return super().create(validated_data)

class RequestComplaintUpdateSerializer(serializers.ModelSerializer):
    """Serializer for updating request status/priority (coordinator only)"""
    
    class Meta:
        model = RequestComplaint
        fields = ['status', 'priority', 'coordinator_notes', 'resolution_notes']
    
    def update(self, instance, validated_data):
        # Create status history entry
        old_status = instance.status
        new_status = validated_data.get('status', old_status)
        
        if old_status != new_status:
            RequestStatusHistory.objects.create(
                request=instance,
                old_status=old_status,
                new_status=new_status,
                changed_by='coordinator',
                notes=validated_data.get('coordinator_notes', '')
            )
        
        return super().update(instance, validated_data)

class RequestCommentCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating comments"""
    
    class Meta:
        model = RequestComment
        fields = ['comment']
    
    def create(self, validated_data):
        # Get user type from request user
        user = self.context['request'].user
        if user.is_teacher():
            user_type = 'teacher'
        elif user.is_coordinator():
            user_type = 'coordinator'
        else:
            raise serializers.ValidationError("Invalid user type")
        
        validated_data['user_type'] = user_type
        validated_data['request'] = self.context['request_obj']
        
        return super().create(validated_data)
