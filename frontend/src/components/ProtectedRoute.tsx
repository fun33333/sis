// Protects admin pages: redirects to login if not authenticated
// Also checks for development phase protected routes
"use client";
import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";

const DEVELOPMENT_PHASE_ROUTES: Record<string, string> = {
  '/admin/coordinator/time-table': 'Time Table Management',
  '/admin/teachers/result': 'Teacher Results',
  '/admin/students/leaving-certificate': 'Leaving Certificate',
  '/admin/students/termination-certificate': 'Termination Certificate',
  '/admin/coordinator/result-approval': 'Result Approval',
  '/admin/coordinator/subject-assign': 'Subject Assignment',
};

export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  
  useEffect(() => {
    if (typeof window !== "undefined") {
      // First check authentication
      const token = window.localStorage.getItem("sis_access_token");
      if (!token) {
        router.replace("/Universal_Login");
        return;
      }

      // Then check if current route is in development phase
      if (pathname && DEVELOPMENT_PHASE_ROUTES[pathname]) {
        const featureName = DEVELOPMENT_PHASE_ROUTES[pathname];
        const currentRoute = pathname;
        // Get previous route from referrer or default to /admin
        const previousRoute = document.referrer
          ? new URL(document.referrer).pathname || '/admin'
          : '/admin';
        
        // Redirect to development phase page with route info
        router.replace(
          `/development-phase?feature=${encodeURIComponent(featureName)}&route=${encodeURIComponent(currentRoute)}&previous=${encodeURIComponent(previousRoute)}`
        );
        return;
      }
    }
  }, [router, pathname]);
  
  return <>{children}</>;
}
