"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function HomePage() {
  const router = useRouter();

  useEffect(() => {
    // Check if user is already logged in
    if (typeof window !== "undefined") {
      const user = window.localStorage.getItem("sis_user");
      if (user) {
        // User is logged in, redirect to admin
        router.push('/admin');
      } else {
        // User is not logged in, redirect to login page
        router.push('/Universal_Login');
      }
    }
  }, [router]);

  // Show loading or nothing while checking authentication
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">Loading...</p>
      </div>
    </div>
  );
}

