"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { AdminSidebar } from "@/components/admin/admin-sidebar"
import { UserProfilePopup } from "@/components/admin/user-profile-popup"
import ProtectedRoute from "@/components/ProtectedRoute"

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [sidebarOpen, setSidebarOpen] = useState(true)

  // Responsive sidebar behavior
  useEffect(() => {
    const handleResize = () => {
      // Mobile breakpoint: 640px and below
      if (window.innerWidth <= 640) {
        setSidebarOpen(false)
      } else if (window.innerWidth <= 1024) {
        // Tablet: keep sidebar closed by default
        setSidebarOpen(false)
      } else {
        // Desktop: keep sidebar open by default
        setSidebarOpen(true)
      }
    }

    // Set initial state
    handleResize()

    // Add event listener
    window.addEventListener('resize', handleResize)

    // Cleanup
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  return (
      <div className="bg-[#e7ecef] flex h-screen overflow-hidden">
        <AdminSidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

        <main
          className={`flex-1 transition-all duration-300 px-2 sm:px-4 md:px-6 lg:px-10 py-4 sm:py-6 md:py-8 h-screen overflow-y-auto hide-scrollbar ${
            sidebarOpen 
              ? 'ml-0 sm:ml-[4.5rem] md:ml-[16rem] lg:ml-[19rem]' 
              : 'ml-0 sm:ml-[4.5rem] md:ml-[5.5rem]'
          }`}
        >
          <div className="flex items-center justify-between mb-4 sm:mb-6 md:mb-8">
            <div></div>
            <UserProfilePopup />
          </div>
          <ProtectedRoute>
            <div className="bg-white rounded-xl sm:rounded-2xl lg:rounded-3xl shadow-xl p-4 sm:p-6 md:p-8">{children}</div>
          </ProtectedRoute>
        </main>
      </div>
  )


}
