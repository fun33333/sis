// Protects admin pages: redirects to login if not authenticated
"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  
  useEffect(() => {
    if (typeof window !== "undefined") {
      const token = window.localStorage.getItem("sis_access_token");
      if (!token) {
        router.replace("/Universal_Login");
      }
    }
  }, [router]);
  
  return <>{children}</>;
}
