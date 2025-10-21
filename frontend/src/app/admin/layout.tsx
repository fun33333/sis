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
      // Tablet breakpoint: 768px and below
      if (window.innerWidth <= 768) {
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
          className={`flex-1 transition-all duration-300 px-4 md:px-10 py-8 h-screen overflow-y-auto hide-scrollbar ${
            sidebarOpen ? 'ml-[4.5rem] md:ml-[19rem]' : 'ml-[4.5rem] md:ml-[5.5rem]'
          }`}
        >
          <div className="flex items-center justify-between mb-8">
            <div></div>
            <UserProfilePopup />
          </div>
          <ProtectedRoute>
            <div className="bg-white rounded-3xl shadow-xl p-8">{children}</div>
          </ProtectedRoute>
        </main>
      </div>
  )


}
