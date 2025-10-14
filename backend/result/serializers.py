from rest_framework import serializers
from .models import Result, SubjectMark
from students.serializers import StudentSerializer
from teachers.serializers import TeacherSerializer
from coordinator.serializers import CoordinatorSerializer
from students.models import Student
from teachers.models import Teacher
from coordinator.models import Coordinator

class SubjectMarkSerializer(serializers.ModelSerializer):
    class Meta:
        model = SubjectMark
        fields = '__all__'
        read_only_fields = ['is_pass', 'result']

class SubjectMarkCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = SubjectMark
        fields = ['subject_name', 'total_marks', 'obtained_marks', 'has_practical', 'practical_total', 'practical_obtained']
        read_only_fields = ['is_pass']

class ResultSerializer(serializers.ModelSerializer):
    student = StudentSerializer(read_only=True)
    teacher = TeacherSerializer(read_only=True)
    coordinator = CoordinatorSerializer(read_only=True)
    subject_marks = SubjectMarkSerializer(many=True, read_only=True)
    
    student_id = serializers.PrimaryKeyRelatedField(
        queryset=Student.objects.all(), source='student', write_only=True
    )
    coordinator_id = serializers.PrimaryKeyRelatedField(
        queryset=Coordinator.objects.all(), source='coordinator', write_only=True, required=False, allow_null=True
    )
    
    class Meta:
        model = Result
        fields = '__all__'
        read_only_fields = ['teacher', 'total_marks', 'obtained_marks', 'percentage', 'grade', 'result_status', 'created_at', 'updated_at']

class ResultCreateSerializer(serializers.ModelSerializer):
    subject_marks = SubjectMarkCreateSerializer(many=True)
    
    class Meta:
        model = Result
        fields = ['student', 'exam_type', 'academic_year', 'semester', 'subject_marks']
    
    def create(self, validated_data):
        subject_marks_data = validated_data.pop('subject_marks')
        
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
        
        coordinator = teacher.assigned_coordinators.first()
        
        validated_data['teacher'] = teacher
        validated_data['coordinator'] = coordinator
        
        result = Result.objects.create(**validated_data)
        
        # Create subject marks
        for subject_data in subject_marks_data:
            SubjectMark.objects.create(result=result, **subject_data)
        
        # Calculate totals
        result.calculate_totals()
        
        # Auto-submit to coordinator (change status from draft to submitted)
        result.status = 'submitted'
        result.save()
        
        return result

class ResultUpdateSerializer(serializers.ModelSerializer):
    subject_marks = SubjectMarkSerializer(many=True)
    
    class Meta:
        model = Result
        fields = ['subject_marks']
    
    def update(self, instance, validated_data):
        if instance.status != 'draft' and instance.edit_count >= 3:
            raise serializers.ValidationError("Maximum edit limit reached (3 edits)")
        
        subject_marks_data = validated_data.get('subject_marks', [])
        
        # Update subject marks
        for subject_data in subject_marks_data:
            subject_mark, created = SubjectMark.objects.get_or_create(
                result=instance,
                subject_name=subject_data['subject_name'],
                defaults=subject_data
            )
            if not created:
                for attr, value in subject_data.items():
                    setattr(subject_mark, attr, value)
                subject_mark.save()
        
        # Increment edit count if not draft
        if instance.status != 'draft':
            instance.edit_count += 1
        
        instance.save()
        
        # Recalculate totals
        instance.calculate_totals()
        
        return instance

class ResultSubmitSerializer(serializers.ModelSerializer):
    class Meta:
        model = Result
        fields = ['status']
    
    def update(self, instance, validated_data):
        # With new workflow, results are auto-submitted on creation
        # This endpoint is now used for forwarding to coordinator
        if instance.status not in ['draft', 'submitted']:
            raise serializers.ValidationError("Only draft or submitted results can be forwarded")
        
        # Allow both pass and fail results to be forwarded
        # Just log the failed subjects for record keeping
        failed_subjects = instance.subject_marks.filter(is_pass=False)
        if failed_subjects.exists():
            failed_names = [sm.get_subject_name_display() for sm in failed_subjects]
            print(f"⚠️ Student failed in: {', '.join(failed_names)} - but allowing forwarding for record keeping")
        
        # Set status based on what's being requested
        new_status = validated_data.get('status', 'submitted')
        if new_status == 'pending':
            instance.status = 'pending'
        elif new_status == 'submitted':
            instance.status = 'submitted'
        else:
            instance.status = new_status
        instance.save()
        
        return instance

class ResultApprovalSerializer(serializers.ModelSerializer):
    class Meta:
        model = Result
        fields = ['status', 'coordinator_comments']
    
    def update(self, instance, validated_data):
        if instance.status not in ['submitted', 'under_review', 'pending']:
            raise serializers.ValidationError("Only submitted, under_review, or pending results can be approved/rejected")
        
        instance.status = validated_data.get('status')
        instance.coordinator_comments = validated_data.get('coordinator_comments', '')
        instance.save()
        
        return instance
