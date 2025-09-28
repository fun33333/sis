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
    // Auto-logout after 2 minutes of inactivity (teacher only)
    let timeout: NodeJS.Timeout;
    const resetTimer = () => {
      clearTimeout(timeout);
      const userStr = window.localStorage.getItem("sis_user");
      if (userStr) {
        try {
          const user = JSON.parse(userStr);
          if (user.role === "teacher") {
            timeout = setTimeout(() => {
              window.localStorage.removeItem("sis_user");
              router.replace("/Universal_Login");
            }, 2 * 60 * 1000); // 2 minutes
          }
        } catch {}
      }
    };
    // Listen to user activity
    window.addEventListener("mousemove", resetTimer);
    window.addEventListener("keydown", resetTimer);
    window.addEventListener("click", resetTimer);
    window.addEventListener("scroll", resetTimer);
    resetTimer();
    return () => {
      clearTimeout(timeout);
      window.removeEventListener("mousemove", resetTimer);
      window.removeEventListener("keydown", resetTimer);
      window.removeEventListener("click", resetTimer);
      window.removeEventListener("scroll", resetTimer);
    };
  }, [router]);
  return <>{children}</>;
}
