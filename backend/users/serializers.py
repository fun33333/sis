from rest_framework import serializers
from django.contrib.auth.password_validation import validate_password
from .models import User
from campus.models import Campus

class CampusSerializer(serializers.ModelSerializer):
    """
    Campus serializer for nested serialization
    """
    class Meta:
        model = Campus
        fields = ['id', 'campus_name', 'campus_code']

class UserSerializer(serializers.ModelSerializer):
    """
    User serializer for general use
    """
    role_display = serializers.CharField(source='get_role_display', read_only=True)
    campus_name = serializers.CharField(source='campus.name', read_only=True)
    campus = CampusSerializer(read_only=True)
    
    class Meta:
        model = User
        fields = [
            'id', 'username', 'email', 'first_name', 'last_name',
            'role', 'role_display', 'campus', 'campus_name',
            'phone_number', 'is_verified', 'is_active',
            'last_login', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'last_login', 'created_at', 'updated_at']

class UserRegistrationSerializer(serializers.ModelSerializer):
    """
    User registration serializer
    """
    password = serializers.CharField(write_only=True, validators=[validate_password])
    password_confirm = serializers.CharField(write_only=True)
    
    class Meta:
        model = User
        fields = [
            'username', 'email', 'first_name', 'last_name',
            'role', 'campus', 'phone_number', 'password', 'password_confirm'
        ]
    
    def validate(self, attrs):
        if attrs['password'] != attrs['password_confirm']:
            raise serializers.ValidationError("Passwords don't match")
        return attrs
    
    def validate_email(self, value):
        if User.objects.filter(email=value).exists():
            raise serializers.ValidationError("User with this email already exists")
        return value
    
    def validate_username(self, value):
        if User.objects.filter(username=value).exists():
            raise serializers.ValidationError("User with this username already exists")
        return value
    
    def create(self, validated_data):
        validated_data.pop('password_confirm')
        password = validated_data.pop('password')
        user = User.objects.create_user(password=password, **validated_data)
        return user

class UserLoginSerializer(serializers.Serializer):
    """
    User login serializer
    """
    email = serializers.CharField()  # Changed from EmailField to CharField
    password = serializers.CharField()
    
    def validate_email(self, value):
        # Check if user exists with either email or username (employee code)
        if not User.objects.filter(email=value).exists() and not User.objects.filter(username=value).exists():
            raise serializers.ValidationError("User with this email or employee code does not exist")
        return value

class UserUpdateSerializer(serializers.ModelSerializer):
    """
    User update serializer
    """
    class Meta:
        model = User
        fields = [
            'first_name', 'last_name', 'phone_number',
            'campus', 'is_active', 'is_verified'
        ]
    
    def validate_campus(self, value):
        user = self.context['request'].user
        
        # Allow SuperAdmin and Principal to change campus for any user
        if not (user.is_superadmin() or user.is_principal()) and value != user.campus:
            raise serializers.ValidationError("You don't have permission to change campus")
        
        return value

class ChangePasswordSerializer(serializers.Serializer):
    """
    Change password serializer
    """
    old_password = serializers.CharField()
    new_password = serializers.CharField(validators=[validate_password])
    new_password_confirm = serializers.CharField()
    
    def validate_old_password(self, value):
        user = self.context['request'].user
        if not user.check_password(value):
            raise serializers.ValidationError("Old password is incorrect")
        return value
    
    def validate(self, attrs):
        if attrs['new_password'] != attrs['new_password_confirm']:
            raise serializers.ValidationError("New passwords don't match")
        return attrs
    
    def save(self):
        user = self.context['request'].user
        user.set_password(self.validated_data['new_password'])
        user.save()
        return user
