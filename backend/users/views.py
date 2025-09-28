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
        
        email = serializer.validated_data['email']
        password = serializer.validated_data['password']
        
        user = authenticate(request, username=email, password=password)
        
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
        
        if user.is_superadmin():
            return User.objects.all()
        elif user.is_principal():
            return User.objects.filter(campus=user.campus)
        elif user.is_coordinator():
            return User.objects.filter(campus=user.campus, role__in=['teacher', 'coordinator'])
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
