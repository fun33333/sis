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

class SuperAdminOnlyForCampusCreation(permissions.BasePermission):
    """
    Permission class that allows:
    - SuperAdmin: Full CRUD access to campus
    - Principal: Read, Update, Delete access (no creation)
    - Others: No access
    """
    def has_permission(self, request, view):
        if not (request.user and request.user.is_authenticated):
            return False
        
        # For campus creation (POST), only superadmin allowed
        if request.method == 'POST':
            return request.user.is_superadmin()
        
        # For other operations (GET, PUT, PATCH, DELETE), allow superadmin or principal
        return request.user.is_superadmin() or request.user.is_principal()
    
    def has_object_permission(self, request, view, obj):
        if not (request.user and request.user.is_authenticated):
            return False
        
        # For object-level operations, allow superadmin or principal
        return request.user.is_superadmin() or request.user.is_principal()