"use client";
"use client";
import React from "react";
import { usePathname, useRouter } from "next/navigation";

export const Breadcrumbs: React.FC = () => {
  const pathname = usePathname();
  const router = useRouter();
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
      className="flex items-center space-x-5 text-xl font-bold bg-white rounded-lg shadow-sm py-4 px-6 fixed top-0 left-74 right-0 z-30"
      style={{ minHeight: '64px' }}
    >
      {items.map((item, idx) => (
        <React.Fragment key={item.label + idx}>
          {idx > 0 && (
            <span className="mx-2 text-gray-400 text-xl font-normal">{'>'}</span>
          )}
          {idx < items.length - 1 ? (
            <button
              className="text-[#274c77] hover:underline bg-transparent p-0 m-0 text-2xl font-bold"
              style={{ background: "none", border: "none", cursor: "pointer" }}
              onClick={() => router.push(item.href)}
            >
              {item.label}
            </button>
          ) : (
            <span className="text-[#274c77] text-2xl font-bold">{item.label}</span>
          )}
        </React.Fragment>
      ))}
    </nav>
  );
};