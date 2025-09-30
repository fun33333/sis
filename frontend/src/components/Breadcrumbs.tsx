"use client";
import React, { useState, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";

export const Breadcrumbs: React.FC = () => {
  const pathname = usePathname();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Track sidebar state from localStorage or parent component
  useEffect(() => {
    const handleStorageChange = () => {
      const sidebarState = localStorage.getItem('sidebarOpen');
      setSidebarOpen(sidebarState === 'true');
    };

    // Initial check
    handleStorageChange();

    // Listen for storage changes
    window.addEventListener('storage', handleStorageChange);
    
    // Also listen for custom events if sidebar state changes
    window.addEventListener('sidebarToggle', handleStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('sidebarToggle', handleStorageChange);
    };
  }, []);

  // Get path segments, filter empty
  const pathSegments = pathname.split("?")[0].split("/").filter(Boolean);

  // Build breadcrumb items
  // Map technical segments to friendly names
  const segmentNameMap: Record<string, string> = {
    dashboard: "Dashboard",
    students: "Students",
    teachers: "Teachers",
    campus: "Campus",
    // Students subpages
    'students-list': "Student List",
    'students-add': "Add Student",
    'students-profile': "Student Profile",
    // Teachers subpages
    'teachers-list': "Teacher List",
    'teachers-add': "Add Teacher",
    'teachers-profile': "Teacher Profile",
    // Campus subpages
    'campus-list': "Campus List",
    'campus-add': "Add Campus",
    'campus-profile': "Campus Profile",
  };

  // Build breadcrumb items with friendly names
  const items = [];
  if (pathSegments.length === 0) {
    items.push({ label: "Dashboard", href: "/" });
  } else {
    // Always show main section first
    const mainSection = pathSegments[0];
    items.push({ label: segmentNameMap[mainSection] || (mainSection.charAt(0).toUpperCase() + mainSection.slice(1)), href: `/${mainSection}` });
    // Add nested pages
    for (let i = 1; i < pathSegments.length; i++) {
      const fullSegment = pathSegments.slice(0, i + 1).join("-");
      const href = "/" + pathSegments.slice(0, i + 1).join("/");
      const label = segmentNameMap[fullSegment] || (pathSegments[i].charAt(0).toUpperCase() + pathSegments[i].slice(1));
      items.push({ label, href });
    }
  }

  return (
    <nav
      aria-label="breadcrumb"
      className={`flex items-center justify-between text-xl font-bold bg-[#e7ecef] rounded-lg shadow-sm py-2 px-6 fixed top-0 right-0 z-50 transition-all duration-500 ${
        sidebarOpen ? 'left-72' : 'left-18'
      }`}
      style={{ 
        minHeight: '64px',
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1), 0 1px 2px rgba(0, 0, 0, 0.06)'
      }}
    >
      {/* Breadcrumbs Section */}
      <div className="flex items-center space-x-5 ms-4">
        {items.map((item, idx) => (
          <React.Fragment key={item.label + idx}>
            {idx > 0 && (
              <span className="mx-2 text-gray-400 text-xl font-normal">{'>'}</span>
            )}
            {idx < items.length - 1 ? (
              <button
                className="text-[#274c77] hover:underline bg-transparent p-0 m-0 text-[1.2rem] font-bold"
                style={{ background: "none", border: "none", cursor: "pointer" }}
                onClick={() => router.push(item.href)}
              >
                {item.label}
              </button>
            ) : (
              <span className="text-[#274c77] text-[1.2rem] font-bold">{item.label}</span>
            )}
          </React.Fragment>
        ))}
      </div>

      {/* Profile Section */}
      <div className="relative group">
        <button className="flex items-center space-x-3 bg-transparent border-none cursor-pointer p-2 rounded-lg hover:bg-gray-100 transition-colors">
          <div className="w-10 h-10 bg-[#6096ba] rounded-full flex items-center justify-center text-white font-bold text-sm">
            UN
          </div>
          <span className="text-[#274c77] font-semibold text-[1.1rem]">User Name</span>
        </button>
        
        {/* Profile Dropdown on Hover */}
        <div className="absolute right-0 top-full mt-2 w-64 bg-white rounded-lg shadow-lg border border-gray-200 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-40">
          <div className="p-4 border-b border-gray-100">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-[#6096ba] rounded-full flex items-center justify-center text-white font-bold text-base">
                UN
              </div>
              <div>
                <p className="font-semibold text-gray-800">User Name</p>
                <p className="text-sm text-gray-600">user@example.com</p>
              </div>
            </div>
          </div>
          
          <div className="p-2">
            <button className="w-full text-left px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-md transition-colors">
              My Profile
            </button>
            <button className="w-full text-left px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-md transition-colors">
              Settings
            </button>
            <button className="w-full text-left px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-md transition-colors">
              Notifications
            </button>
          </div>
          
          <div className="p-2 border-t border-gray-100">
            <button className="w-full text-left px-3 py-2 text-red-600 hover:bg-red-50 rounded-md transition-colors font-semibold">
              Logout
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};