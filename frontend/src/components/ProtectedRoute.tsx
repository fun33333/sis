// Protects admin pages: redirects to login if not authenticated
"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  useEffect(() => {
    if (typeof window !== "undefined") {
      const user = window.localStorage.getItem("sis_user");
      if (!user) {
        router.replace("/Universal_Login");
      }
    }
    
    // Auto-logout after 15 minutes of inactivity (all roles)
    let timeout: NodeJS.Timeout;
    const resetTimer = () => {
      clearTimeout(timeout);
      const userStr = window.localStorage.getItem("sis_user");
      if (userStr) {
        try {
          const user = JSON.parse(userStr);
          
          // Same 15 minutes timeout for all roles
          timeout = setTimeout(() => {
            // Clear all auth data
            window.localStorage.removeItem("sis_user");
            window.localStorage.removeItem("sis_access_token");
            window.localStorage.removeItem("sis_refresh_token");
            router.replace("/Universal_Login");
          }, 15 * 60 * 1000); // 15 minutes for all users
          
        } catch {}
      }
    };
    
    // Listen to user activity
    window.addEventListener("mousemove", resetTimer);
    window.addEventListener("keydown", resetTimer);
    window.addEventListener("click", resetTimer);
    window.addEventListener("scroll", resetTimer);
    window.addEventListener("touchstart", resetTimer); // For mobile
    
    resetTimer();
    
    return () => {
      clearTimeout(timeout);
      window.removeEventListener("mousemove", resetTimer);
      window.removeEventListener("keydown", resetTimer);
      window.removeEventListener("click", resetTimer);
      window.removeEventListener("scroll", resetTimer);
      window.removeEventListener("touchstart", resetTimer);
    };
  }, [router]);
  
  return <>{children}</>;
}
