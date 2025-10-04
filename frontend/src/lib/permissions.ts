// Role-based permissions utility
// Urdu roman: Ye file har role ke liye permissions define karti hai
// English: This file defines permissions for each role

export type UserRole = 'superadmin' | 'coordinator' | 'teacher' | 'principal' | string;

export interface User {
  role: string;
  email?: string;
  name?: string;
}

// Get normalized role from user object
export function getUserRole(user: User | null): UserRole {
  if (!user) return 'guest';
  
  const roleNorm = String(user.role || '').toLowerCase().trim();
  
  if (roleNorm.includes('coord')) return 'coordinator';
  if (roleNorm.includes('teach')) return 'teacher';
  if (roleNorm.includes('admin')) return 'superadmin';
  if (roleNorm.includes('princ')) return 'principal';
  
  return roleNorm;
}

// Get current user from localStorage
export function getCurrentUser(): User | null {
  if (typeof window === 'undefined') return null;
  
  try {
    const userStr = window.localStorage.getItem('sis_user');
    if (!userStr) return null;
    return JSON.parse(userStr);
  } catch {
    return null;
  }
}

// Get current user's role
export function getCurrentUserRole(): UserRole {
  return getUserRole(getCurrentUser());
}

// Permission checks for different actions
export interface Permissions {
  // Dashboard
  canViewDashboard: boolean;
  
  // Students
  canViewStudents: boolean;
  canAddStudent: boolean;
  canEditStudent: boolean;
  canDeleteStudent: boolean;
  
  // Teachers
  canViewTeachers: boolean;
  canAddTeacher: boolean;
  canEditTeacher: boolean;
  canDeleteTeacher: boolean;
  
  // Campus
  canViewCampus: boolean;
  canAddCampus: boolean;
  canEditCampus: boolean;
  canDeleteCampus: boolean;
  
  // Coordinator
  canViewCoordinators: boolean;
  canAddCoordinator: boolean;
  canEditCoordinator: boolean;
  canDeleteCoordinator: boolean;
}

// Get permissions based on role
export function getPermissions(role: UserRole): Permissions {
  switch (role) {
    case 'superadmin':
      return {
        // Dashboard - View only
        canViewDashboard: true,
        
        // Students - View only
        canViewStudents: true,
        canAddStudent: false,
        canEditStudent: false,
        canDeleteStudent: false,
        
        // Teachers - View only
        canViewTeachers: true,
        canAddTeacher: false,
        canEditTeacher: false,
        canDeleteTeacher: false,
        
        // Campus - Full access to ADD only
        canViewCampus: true,
        canAddCampus: true,
        canEditCampus: false,
        canDeleteCampus: false,
        
        // Coordinator - View only
        canViewCoordinators: true,
        canAddCoordinator: false,
        canEditCoordinator: false,
        canDeleteCoordinator: false,
      };
    
    case 'coordinator':
      return {
        canViewDashboard: true,
        canViewStudents: true,
        canAddStudent: true,
        canEditStudent: true,
        canDeleteStudent: true,
        canViewTeachers: true,
        canAddTeacher: true,
        canEditTeacher: true,
        canDeleteTeacher: true,
        canViewCampus: true,
        canAddCampus: false,
        canEditCampus: false,
        canDeleteCampus: false,
        canViewCoordinators: true,
        canAddCoordinator: true,
        canEditCoordinator: true,
        canDeleteCoordinator: true,
      };
    
    case 'teacher':
      return {
        canViewDashboard: false,
        canViewStudents: true,
        canAddStudent: false,
        canEditStudent: false,
        canDeleteStudent: false,
        canViewTeachers: false,
        canAddTeacher: false,
        canEditTeacher: false,
        canDeleteTeacher: false,
        canViewCampus: false,
        canAddCampus: false,
        canEditCampus: false,
        canDeleteCampus: false,
        canViewCoordinators: false,
        canAddCoordinator: false,
        canEditCoordinator: false,
        canDeleteCoordinator: false,
      };
    
    case 'principal':
      return {
        canViewDashboard: true,
        canViewStudents: true,
        canAddStudent: true,
        canEditStudent: true,
        canDeleteStudent: true,
        canViewTeachers: true,
        canAddTeacher: true,
        canEditTeacher: true,
        canDeleteTeacher: true,
        canViewCampus: true,
        canAddCampus: true,
        canEditCampus: true,
        canDeleteCampus: true,
        canViewCoordinators: true,
        canAddCoordinator: true,
        canEditCoordinator: true,
        canDeleteCoordinator: true,
      };
    
    default:
      // No permissions for unknown roles
      return {
        canViewDashboard: false,
        canViewStudents: false,
        canAddStudent: false,
        canEditStudent: false,
        canDeleteStudent: false,
        canViewTeachers: false,
        canAddTeacher: false,
        canEditTeacher: false,
        canDeleteTeacher: false,
        canViewCampus: false,
        canAddCampus: false,
        canEditCampus: false,
        canDeleteCampus: false,
        canViewCoordinators: false,
        canAddCoordinator: false,
        canEditCoordinator: false,
        canDeleteCoordinator: false,
      };
  }
}

// Hook to get current user permissions
export function usePermissions(): Permissions {
  const role = getCurrentUserRole();
  return getPermissions(role);
}

// Helper to check if user can perform action
export function canPerformAction(action: keyof Permissions): boolean {
  const role = getCurrentUserRole();
  const permissions = getPermissions(role);
  return permissions[action];
}

