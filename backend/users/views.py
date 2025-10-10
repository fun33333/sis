from rest_framework import status, generics
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import authenticate
from django.contrib.auth.hashers import make_password
from .models import User
from .serializers import UserSerializer, UserRegistrationSerializer, UserLoginSerializer
from .permissions import IsSuperAdmin, IsPrincipal, IsCoordinator, IsTeacher

class UserRegistrationView(generics.CreateAPIView):
    """
    User registration endpoint
    Only SuperAdmin and Principal can create users
    """
    queryset = User.objects.all()
    serializer_class = UserRegistrationSerializer
    permission_classes = [IsAuthenticated, (IsSuperAdmin | IsPrincipal)]

    def perform_create(self, serializer):
        # Set password securely
        user = serializer.save()
        user.set_password(serializer.validated_data['password'])
        user.save()
        return user

class UserLoginView(generics.GenericAPIView):
    """
    User login endpoint
    """
    serializer_class = UserLoginSerializer
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        email_or_code = serializer.validated_data['email']
        password = serializer.validated_data['password']
        
        # Try to authenticate with email first, then with username (employee code)
        user = None
        
        # First try with email as username
        user = authenticate(request, username=email_or_code, password=password)
        
        # If that fails, try to find user by email and authenticate with their username
        if not user:
            try:
                user_obj = User.objects.get(email=email_or_code)
                user = authenticate(request, username=user_obj.username, password=password)
            except User.DoesNotExist:
                pass
        
        if user and user.is_active:
            # Generate JWT tokens
            refresh = RefreshToken.for_user(user)
            
            # Update last login IP
            user.last_login_ip = self.get_client_ip(request)
            user.save()
            
            return Response({
                'access': str(refresh.access_token),
                'refresh': str(refresh),
                'user': UserSerializer(user).data
            }, status=status.HTTP_200_OK)
        
        return Response({
            'error': 'Invalid credentials'
        }, status=status.HTTP_401_UNAUTHORIZED)
    
    def get_client_ip(self, request):
        x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
        if x_forwarded_for:
            ip = x_forwarded_for.split(',')[0]
        else:
            ip = request.META.get('REMOTE_ADDR')
        return ip

class UserProfileView(generics.RetrieveUpdateAPIView):
    """
    User profile management
    """
    serializer_class = UserSerializer
    permission_classes = [IsAuthenticated]

    def get_object(self):
        return self.request.user

class UserListView(generics.ListAPIView):
    """
    List users based on role permissions
    """
    serializer_class = UserSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        role_param = self.request.query_params.get('role')
        
        if user.is_superadmin() or user.is_principal():
            qs = User.objects.all()
            if role_param:
                return qs.filter(role=role_param)
            return qs
        elif user.is_coordinator():
            qs = User.objects.filter(campus=user.campus, role__in=['teacher', 'coordinator'])
            if role_param in ['teacher', 'coordinator']:
                return qs.filter(role=role_param)
            return qs
        else:
            return User.objects.filter(id=user.id)

@api_view(['POST'])
@permission_classes([AllowAny])
def refresh_token_view(request):
    """
    Refresh JWT token
    """
    refresh_token = request.data.get('refresh')
    
    if not refresh_token:
        return Response({'error': 'Refresh token required'}, status=status.HTTP_400_BAD_REQUEST)
    
    try:
        refresh = RefreshToken(refresh_token)
        access_token = refresh.access_token
        
        return Response({
            'access': str(access_token)
        }, status=status.HTTP_200_OK)
    
    except Exception as e:
        return Response({'error': 'Invalid refresh token'}, status=status.HTTP_401_UNAUTHORIZED)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def current_user_profile(request):
    """
    Get current user's profile with role-specific data
    """
    user = request.user
    
    # Base user data
    user_data = {
        'id': user.id,
        'username': user.username,
        'email': user.email,
        'first_name': user.first_name,
        'last_name': user.last_name,
        'role': user.role,
        'campus': {
            'id': user.campus.id,
            'campus_name': user.campus.campus_name,
            'campus_code': user.campus.campus_code,
        } if user.campus else None,
    }
    
    # Add role-specific data
    if user.role == 'teacher':
        try:
            from teachers.models import Teacher
            teacher = Teacher.objects.get(email=user.email)
            user_data.update({
                'teacher_id': teacher.id,
                'full_name': teacher.full_name,
                'assigned_classroom': {
                    'id': teacher.assigned_classroom.id,
                    'name': str(teacher.assigned_classroom),
                    'grade': teacher.assigned_classroom.grade.name if teacher.assigned_classroom.grade else None,
                    'section': teacher.assigned_classroom.section,
                } if teacher.assigned_classroom else None,
                'current_campus': {
                    'id': teacher.current_campus.id,
                    'campus_name': teacher.current_campus.campus_name,
                } if teacher.current_campus else None,
                'is_class_teacher': teacher.is_class_teacher,
            })
        except Teacher.DoesNotExist:
            pass
    elif user.role == 'principal':
        try:
            from principals.models import Principal
            principal = Principal.objects.get(email=user.email)
            user_data.update({
                'principal_id': principal.id,
                'full_name': principal.full_name,
                'campus': {
                    'id': principal.campus.id,
                    'campus_name': principal.campus.campus_name,
                    'campus_code': principal.campus.campus_code,
                } if principal.campus else None,
                'shift': principal.shift,
                'is_active': principal.is_currently_active,
            })
        except Principal.DoesNotExist:
            pass
    elif user.role == 'coordinator':
        try:
            from coordinator.models import Coordinator
            coordinator = Coordinator.objects.get(email=user.email)
            user_data.update({
                'coordinator_id': coordinator.id,
                'full_name': coordinator.full_name,
            })
        except Coordinator.DoesNotExist:
            pass
    
    return Response(user_data)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def logout_view(request):
    """
    Logout user (blacklist refresh token)
    """
    try:
        refresh_token = request.data.get('refresh')
        if refresh_token:
            token = RefreshToken(refresh_token)
            token.blacklist()
        
        return Response({'message': 'Successfully logged out'}, status=status.HTTP_200_OK)
    
    except Exception as e:
        return Response({'error': 'Invalid token'}, status=status.HTTP_400_BAD_REQUEST)
