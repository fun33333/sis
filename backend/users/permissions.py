from rest_framework import permissions

class IsSuperAdmin(permissions.BasePermission):
    """
    Permission class for SuperAdmin only
    """
    def has_permission(self, request, view):
        return (
            request.user and 
            request.user.is_authenticated and 
            request.user.is_superadmin()
        )

class IsPrincipal(permissions.BasePermission):
    """
    Permission class for Principal only
    """
    def has_permission(self, request, view):
        return (
            request.user and 
            request.user.is_authenticated and 
            request.user.is_principal()
        )

class IsCoordinator(permissions.BasePermission):
    """
    Permission class for Coordinator only
    """
    def has_permission(self, request, view):
        return (
            request.user and 
            request.user.is_authenticated and 
            request.user.is_coordinator()
        )

class IsTeacher(permissions.BasePermission):
    """
    Permission class for Teacher only
    """
    def has_permission(self, request, view):
        return (
            request.user and 
            request.user.is_authenticated and 
            request.user.is_teacher()
        )

class IsSuperAdminOrPrincipal(permissions.BasePermission):
    """
    Permission class for SuperAdmin or Principal
    """
    def has_permission(self, request, view):
        return (
            request.user and 
            request.user.is_authenticated and 
            (request.user.is_superadmin() or request.user.is_principal())
        )

class IsCoordinatorOrAbove(permissions.BasePermission):
    """
    Permission class for Coordinator and above
    """
    def has_permission(self, request, view):
        return (
            request.user and 
            request.user.is_authenticated and 
            request.user.can_approve_requests()
        )

class IsTeacherOrAbove(permissions.BasePermission):
    """
    Permission class for Teacher and above
    """
    def has_permission(self, request, view):
        return (
            request.user and 
            request.user.is_authenticated and 
            request.user.role in ['superadmin', 'principal', 'coordinator', 'teacher']
        )

class CanManageCampus(permissions.BasePermission):
    """
    Permission class for users who can manage campus
    """
    def has_permission(self, request, view):
        return (
            request.user and 
            request.user.is_authenticated and 
            request.user.can_manage_campus()
        )

class CanViewAllData(permissions.BasePermission):
    """
    Permission class for users who can view all data
    """
    def has_permission(self, request, view):
        return (
            request.user and 
            request.user.is_authenticated and 
            request.user.can_view_all_data()
        )
