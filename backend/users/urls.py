from django.urls import path
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from .views import (
    UserRegistrationView,
    UserLoginView,
    UserProfileView,
    UserListView,
    refresh_token_view,
    logout_view
)

urlpatterns = [
    # Authentication endpoints
    path('auth/login/', UserLoginView.as_view(), name='user_login'),
    path('auth/register/', UserRegistrationView.as_view(), name='user_register'),
    path('auth/refresh/', refresh_token_view, name='token_refresh'),
    path('auth/logout/', logout_view, name='user_logout'),
    
    # User management endpoints
    path('profile/', UserProfileView.as_view(), name='user_profile'),
    path('users/', UserListView.as_view(), name='user_list'),
]
