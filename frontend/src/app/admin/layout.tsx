"use client"

import type React from "react"

import { useState } from "react"
import { AdminSidebar } from "@/components/admin/admin-sidebar"
import ProtectedRoute from "@/components/ProtectedRoute"

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [sidebarOpen, setSidebarOpen] = useState(true)

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
          
        </div>
        <ProtectedRoute>
          <div className="bg-white rounded-3xl shadow-xl p-8">{children}</div>
        </ProtectedRoute>
      </main>
    </div>
  )


}
