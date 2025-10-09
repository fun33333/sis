
"use client"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Users, Building2, GraduationCap, TrendingUp, LogOut, Award, Calendar } from "lucide-react"
import { useState, useEffect } from "react"




interface AdminSidebarProps {
  sidebarOpen: boolean
  setSidebarOpen: (open: boolean) => void
}

export function AdminSidebar({ sidebarOpen, setSidebarOpen }: AdminSidebarProps) {
  // For smooth text appearance after sidebar opens
  const [showText, setShowText] = useState(sidebarOpen);
  useEffect(() => {
    let timeout: NodeJS.Timeout;
    if (sidebarOpen) {
      timeout = setTimeout(() => setShowText(true), 400); // match transition duration
    } else {
      setShowText(false);
    }
    return () => clearTimeout(timeout);
  }, [sidebarOpen]);

  const pathname = usePathname()
  const [userRole, setUserRole] = useState<string | null>(null);
  useEffect(() => {
    // Sync role if localStorage changes (e.g., login/logout in another tab)
    const handleStorage = (e: StorageEvent) => {
      if (e.key === "sis_user") {
        try {
          const user = e.newValue ? JSON.parse(e.newValue) : null;
          if (!user) {
            setUserRole(null);
            return;
          }
          const roleNorm = String(user.role || "").toLowerCase().trim();
          const normalized = roleNorm.includes("coord")
            ? "coordinator"
            : roleNorm.includes("teach")
            ? "teacher"
            : roleNorm.includes("admin")
            ? "superadmin"
            : roleNorm.includes("princ")
            ? "principal"
            : roleNorm;
          setUserRole(normalized);
        } catch {
          setUserRole(null);
        }
      }
    };
    window.addEventListener("storage", handleStorage);
    // Initialize once on mount to avoid SSR/CSR mismatch
    try {
      const userStr = window.localStorage.getItem("sis_user");
      if (userStr) {
        const user = JSON.parse(userStr);
        const roleNorm = String(user.role || "").toLowerCase().trim();
        const normalized = roleNorm.includes("coord")
          ? "coordinator"
          : roleNorm.includes("teach")
          ? "teacher"
          : roleNorm.includes("admin")
          ? "superadmin"
          : roleNorm.includes("princ")
          ? "principal"
          : roleNorm;
        setUserRole(normalized);
      } else {
        setUserRole(null);
      }
    } catch {
      setUserRole(null);
    }
    return () => window.removeEventListener("storage", handleStorage);
  }, []);

  // Restrict menu based on user role
  const menuItems = userRole === "teacher"
    ? [
      {
        key: "students",
        title: "Students",
        icon: Users,
        href: "/admin/students",
        subItems: [
          { title: "Student List", href: "/admin/students/student-list" },
        ],
      },
      {
        key: "attendance",
        title: "Mark Attendance",
        icon: Calendar,
        href: "/admin/teachers/attendance",
        subItems: [],
      },
      {
        key: "class-stats",
        title: "Class Statistics",
        icon: TrendingUp,
        href: "/admin/teachers/stats",
        subItems: [],
      },
      {
        key: "teachers",
        title: "Teachers",
        icon: GraduationCap,
        href: "/admin/teachers",
        subItems: [
          { title: "Request / Complain", href: "/admin/teachers/request" },
          { title: "Time Table", href: "/admin/teachers/timetable" },
          { title: "Attendance", href: "/admin/teachers/attendance" },
          { title: "Class Reasult", href: "/admin/teachers/reasult" },
        ],
      },
    ]
    : userRole === "coordinator"
    ? [
      {
        key: "coordinator",
        title: "Co-Ordinator",
        icon: Award,
        href: "/admin/coordinator",
        subItems: [
          { title: "Teacher List", href: "/admin/coordinator/teacher-list" },
          { title: "Attendance Review", href: "/admin/coordinator/attendance-review" },
          { title: "Request & Complain", href: "/admin/coordinator/request-complain" },
          { title: "Result Approval", href: "/admin/coordinator/result-approval" },
          { title: "Class Assign", href: "/admin/coordinator/class-assign" },
          { title: "Subject Assign", href: "/admin/coordinator/subject-assign" },
          { title: "Time Table", href: "/admin/coordinator/time-table" },
          { title: "Sections Analytics", href: "/admin/coordinator/sections-progress" },
        ],
      },
    ]
    : userRole === "principal"
    ? [
      // Principal: Campus-specific access
      {
        key: "dashboard",
        title: "Dashboard",
        icon: TrendingUp,
        href: "/admin",
        subItems: [],
      },
      {
        key: "students",
        title: "Students",
        icon: Users,
        href: "/admin/students",
        subItems: [
          { title: "Add Student", href: "/admin/students/add" },
          { title: "Student List", href: "/admin/students/student-list" },
          { title: "Transfer Module", href: "/admin/students/transfer-modal" },
          { title: "Leaving Certificate", href: "/admin/students/leaving-certificate" },
          { title: "Termination Certificate", href: "/admin/students/termination-certificate" },
        ],
      },
      {
        key: "teachers",
        title: "Teachers",
        icon: GraduationCap,
        href: "/admin/teachers",
        subItems: [
          { title: "Teacher List", href: "/admin/teachers/list" },
          { title: "Add Teacher", href: "/admin/teachers/add" },
          { title: "Request / Complain", href: "/admin/teachers/request" },
          { title: "Time Table", href: "/admin/teachers/timetable" },
          { title: "Attendance", href: "/admin/teachers/attendance" },
          { title: "Class Statistics", href: "/admin/teachers/stats" },
        ],
      },
      {
        key: "campus",
        title: "Campus",
        icon: Building2,
        href: "/admin/campus",
        subItems: [
          { title: "Campus List", href: "/admin/campus/list" },
          { title: "Add Class", href: "/admin/campus/add-class" },
          { title: "Add Grade", href: "/admin/campus/add-grade" },
          { title: "Add Level", href: "/admin/campus/add-level" },
        ],
      },
      {
        key: "coordinator",
        title: "Co-Ordinator",
        icon: Award,
        href: "/admin/coordinator",
        subItems: [
          { title: "Teacher List", href: "/admin/coordinator/teacher-list" },
          { title: "Add Coordinator", href: "/admin/coordinator/add" },
          { title: "Attendance Review", href: "/admin/coordinator/attendance-review" },
          { title: "Request & Complain", href: "/admin/coordinator/request-complain" },
          { title: "Result Approval", href: "/admin/coordinator/result-approval" },
          { title: "Class Assign", href: "/admin/coordinator/class-assign" },
          { title: "Subject Assign", href: "/admin/coordinator/subject-assign" },
          { title: "Time Table", href: "/admin/coordinator/time-table" },
        ],
      },
    ]
    : userRole === "superadmin"
    ? [
      // Superadmin: View-only access, can only add campus
      {
        key: "dashboard",
        title: "Dashboard",
        icon: TrendingUp,
        href: "/admin",
        subItems: [],
      },
      {
        key: "students",
        title: "Students",
        icon: Users,
        href: "/admin/students",
        subItems: [
          { title: "Student List", href: "/admin/students/student-list" },
        //   { title: "Transfer Module", href: "/admin/students/transfer-modal" },
        //   { title: "Leaving Certificate", href: "/admin/students/leaving-certificate" },
        //   { title: "Termination Certificate", href: "/admin/students/termination-certificate" },
        ],
      },
      {
        key: "teachers",
        title: "Teachers",
        icon: GraduationCap,
        href: "/admin/teachers",
        subItems: [
          { title: "Teacher List", href: "/admin/teachers/list" },
          // { title: "Request / Complain", href: "/admin/teachers/request" },
          // { title: "Time Table", href: "/admin/teachers/timetable" },
          // { title: "Attendance", href: "/admin/teachers/attendance" },
          // { title: "Class Statistics", href: "/admin/teachers/stats" },
        ],
      },
      {
        key: "campus",
        title: "Campus",
        icon: Building2,
        href: "/admin/campus",
        subItems: [
          { title: "Add Campus", href: "/admin/campus/add" },
          { title: "Campus List", href: "/admin/campus/list" },
        ],
      },
      // // {
      // //   key: "coordinator",
      // //   title: "Co-Ordinator",
      // //   icon: Award,
      // //   href: "/admin/coordinator",
      // //   subItems: [
      // //     { title: "Teacher List", href: "/admin/coordinator/teacher-list" },
      // //     { title: "Attendance Review", href: "/admin/coordinator/attendance-review" },
      // //     { title: "Request & Complain", href: "/admin/coordinator/request-complain" },
      // //     { title: "Result Approval", href: "/admin/coordinator/result-approval" },
      // //     { title: "Class Assign", href: "/admin/coordinator/class-assign" },
      // //     { title: "Subject Assign", href: "/admin/coordinator/subject-assign" },
      // //     { title: "Time Table", href: "/admin/coordinator/time-table" },
      // //     { title: "Sections Progress", href: "/admin/coordinator/sections-progress" },
      // //   ],
      // },
    ]
    : [
      // Default/Principal: Full access
      {
        key: "dashboard",
        title: "Dashboard",
        icon: TrendingUp,
        href: "/admin",
        subItems: [],
      },
      {
        key: "students",
        title: "Students",
        icon: Users,
        href: "/admin/students",
        subItems: [
          // Principal: Only show add student and student list
          ...(userRole === "principal" ? [
            { title: "Add Student", href: "/admin/students/add" },
            { title: "Student List", href: "/admin/students/student-list" },
          ] : [
            { title: "Add Student", href: "/admin/students/add" },
            { title: "Student List", href: "/admin/students/student-list" },
            { title: "Transfer Module", href: "/admin/students/transfer-modal" },
            { title: "Leaving Certificate", href: "/admin/students/leaving-certificate" },
            { title: "Termination Certificate", href: "/admin/students/termination-certificate" },
          ]),
        ],
      },
      {
        key: "teachers",
        title: "Teachers",
        icon: GraduationCap,
        href: "/admin/teachers",
        subItems: [
          // Principal: Only show teacher list and add teacher
          ...(userRole === "principal" ? [
            { title: "Teacher List", href: "/admin/teachers/list" },
            { title: "Add Teacher", href: "/admin/teachers/add" },
          ] : [
            { title: "Teacher List", href: "/admin/teachers/list" },
            { title: "Add Teacher", href: "/admin/teachers/add" },
            { title: "Request / Complain", href: "/admin/teachers/request" },
            { title: "Time Table", href: "/admin/teachers/timetable" },
            { title: "Attendance", href: "/admin/teachers/attendance" },
            { title: "Class Statistics", href: "/admin/teachers/stats" },
          ]),
        ],
      },
      {
        key: "campus",
        title: "Campus",
        icon: Building2,
        href: "/admin/campus",
        subItems: [
          { title: "Add Campus", href: "/admin/campus/add" },
          { title: "Campus List", href: "/admin/campus/list" },
        ],
      },
      {
        key: "coordinator",
        title: "Co-Ordinator",
        icon: Award,
        href: "/admin/coordinator",
        subItems: [
          ...(userRole === "principal" ? [
            { title: "Coordinator List", href: "/admin/coordinator/list" },
          ] : [
            { title: "Teacher List", href: "/admin/coordinator/teacher-list" },
          ]),
          { title: "Add Coordinator", href: "/admin/coordinator/add" },
          { title: "Attendance Review", href: "/admin/coordinator/attendance-review" },
          { title: "Request & Complain", href: "/admin/coordinator/request-complain" },
          { title: "Result Approval", href: "/admin/coordinator/result-approval" },
<<<<<<< HEAD
          // Hide these items for principal
          ...(userRole !== "principal" ? [
            { title: "Class Assign", href: "/admin/coordinator/class-assign" },
            { title: "Subject Assign", href: "/admin/coordinator/subject-assign" },
            { title: "Time Table", href: "/admin/coordinator/time-table" },
          ] : []),
=======
          { title: "Class Assign", href: "/admin/coordinator/class-assign" },
          { title: "Subject Assign", href: "/admin/coordinator/subject-assign" },
          { title: "Time Table", href: "/admin/coordinator/time-table" },
          { title: "Sections Progress", href: "/admin/coordinator/sections-progress" },
>>>>>>> ef2ff2eeb8466ac7af124936336a3080ea2dfed3
        ],
      },
    ];

  return (
    <aside
      className={`h-screen fixed left-0 top-0 flex flex-col justify-between rounded-r-3xl shadow-2xl backdrop-blur-lg border-r border-[#8b8c89]/30 z-20 transition-all duration-500 ${sidebarOpen ? "w-72 px-4 py-8" : "w-18 px-2 py-4"}`}
      style={{
        background: sidebarOpen ? "#e7ecef" : "#a3cef1",
        boxShadow: sidebarOpen ? "0 8px 32px 0 #add0e7bc" : "0 2px 8px 0 #a3cef1e8",
        borderRight: "3px solid #1c3f67ff",
        transition: 'background 0.5s, box-shadow 0.5s, width 0.5s, padding 0.5s',
      }}
    >
      <div className="flex h-full flex-col">
        <div className="flex items-center gap-3 mb-10">
          <div
            className="p-2 rounded-xl cursor-pointer hover:scale-105 transition-transform duration-300"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            aria-label={sidebarOpen ? "Collapse sidebar" : "Expand sidebar"}
            style={{ boxShadow: sidebarOpen ? "0 2px 8px 0 #6096ba33" : "0 2px 8px 0 #a3cef133" }}
          >
            <img src="/logo 1 pen.png" alt="Logo" className="w-10 h-10" />
          </div>
          {sidebarOpen && (
            <span
              className="text-2xl font-bold text-[#274c77] tracking-tight drop-shadow-lg"
              style={{ letterSpacing: "0.02em" }}
            ></span>
          )}
        </div>

        <nav className="space-y-2 flex-1 overflow-y-auto hide-scrollbar pr-1">
          {menuItems.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + "/")
            const hasSubItems = item.subItems.length > 0

            return (
              <div key={item.key}>
                <Link href={item.href}>
                  <button
                    className={`w-full flex ${sidebarOpen ? "items-center gap-3 px-4 py-3" : "justify-center items-center p-0"} rounded-xl font-semibold shadow-lg transition-all duration-500 ${isActive ? "bg-[#6096ba] text-[#e7ecef] shadow-xl" : "text-[#274c77] hover:bg-[#a3cef1]"}`}
                    style={{
                      backdropFilter: "blur(4px)",
                      border: isActive ? "2px solid #6096ba" : "1.5px solid #8b8c89",
                    }}
                  >
                    <span className={`${sidebarOpen ? "flex items-center justify-center" : "flex items-center justify-center w-12 h-12"} transition-all duration-500`}>
                      <item.icon
                        className={`h-6 w-6 transition-transform duration-500 group-hover:scale-110 ${isActive ? "text-[#e7ecef]" : "text-[#6096ba]"}`}
                      />
                    </span>
                    <span
                      className={`sidebar-label inline-block whitespace-nowrap overflow-hidden transition-all duration-500 ${sidebarOpen && showText ? 'opacity-100 max-w-xs ml-2' : 'opacity-0 max-w-0 ml-0'}`}
                      style={{
                        transition: 'opacity 0.5s, max-width 0.5s, margin-left 0.5s',
                      }}
                    >
                      {showText ? item.title : ''}
                    </span>
                    <span
                      className={`sidebar-label ml-auto transition-all duration-500 ${sidebarOpen && showText && hasSubItems ? 'opacity-100 max-w-xs' : 'opacity-0 max-w-0'}`}
                      style={{
                        transition: 'opacity 0.5s, max-width 0.5s',
                        display: hasSubItems ? 'inline-block' : 'none',
                      }}
                    >
                      {showText && hasSubItems ? (
                        <svg
                          className={`h-4 w-4 transition-transform duration-500 ${isActive ? "rotate-90 text-[#e7ecef]" : "text-[#6096ba]"}`}
                          fill="none"
                          stroke="currentColor"
                          strokeWidth={2}
                          viewBox="0 0 24 24"
                        >
                          <path d="M9 5l7 7-7 7" />
                        </svg>
                      ) : null}
                    </span>
                  </button>
                </Link>

                {sidebarOpen && hasSubItems && (
                  <div
                    className={`ml-7 mt-2 mb-2 space-y-1 overflow-hidden transition-all duration-300 ${isActive ? "max-h-96 opacity-100" : "max-h-0 opacity-0 pointer-events-none"
                      }`}
                    aria-hidden={!isActive}
                  >
                    {item.subItems.map((subItem, index) => (
                      <Link key={index} href={subItem.href}>
                        <button className="block w-full text-left px-3 py-2 rounded-lg hover:bg-[#6096ba]/20 text-[#274c77] font-medium transition-all duration-300">
                          {subItem.title}
                        </button>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            )
          })}
          {(userRole === "teacher" || userRole === "coordinator" || userRole === "superadmin" || userRole === "principal") && (
            <button
              onClick={() => {
                window.localStorage.removeItem("sis_user");
                window.location.href = "/Universal_Login";
              }}
              className={`w-full flex ${sidebarOpen ? "items-center gap-3 px-4 py-3" : "justify-center items-center p-0"} rounded-xl font-semibold shadow-lg transition-all duration-500 text-red-700 hover:bg-red-50 mt-2`}
              style={{
                border: "1.5px solid #ef4444",
              }}
            >
              <span className={`${sidebarOpen ? "flex items-center justify-center" : "flex items-center justify-center w-12 h-12"} transition-all duration-500`}>
                <LogOut className="h-6 w-6" />
              </span>
              <span
                className={`sidebar-label inline-block whitespace-nowrap overflow-hidden transition-all duration-500 ${sidebarOpen && showText ? 'opacity-100 max-w-xs ml-2' : 'opacity-0 max-w-0 ml-0'}`}
                style={{
                  transition: 'opacity 0.5s, max-width 0.5s, margin-left 0.5s',
                }}
              >
                {showText ? "Logout" : ''}
              </span>
            </button>
          )}
        </nav>
      </div>
    </aside>
  )
}