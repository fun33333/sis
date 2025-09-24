
"use client"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Users, Building2, GraduationCap, TrendingUp, LogOut } from "lucide-react"
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
    if (typeof window !== "undefined") {
      const userStr = window.localStorage.getItem("sis_user");
      if (userStr) {
        try {
          const user = JSON.parse(userStr);
          setUserRole(user.role);
        } catch { }
      } else {
        setUserRole(null);
      }
    }
  }, []);

  // Restrict teacher menu if teacher is logged in, superadmin gets all access
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
        key: "teachers",
        title: "Teachers",
        icon: GraduationCap,
        href: "/admin/teachers",
        subItems: [
          { title: "Request / Complain", href: "/admin/teachers/request" },
          { title: "Time Table", href: "/admin/teachers/timetable" },
          { title: "Attendance", href: "/admin/teachers/attendance" },
          { title: "Class Statistics", href: "/admin/teachers/stats" },
          { title: "Class Reasult", href: "/admin/teachers/reasult" },
        ],
      },
    ]
    : [
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
          { title: "Add Campus", href: "/admin/campus/add" },
          { title: "Campus Profile", href: "/admin/campus/profile" },
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
      <div>
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

        <nav className="space-y-2">
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
        </nav>
        {/* Logout button for teacher and superadmin */}
        {(userRole === "teacher" || userRole === "superadmin") && (
          <button
            className={`w-full mt-2 flex items-center justify-center ${sidebarOpen ? "py-2 px-4" : "py-2 px-0"} border-3 border-red-500 rounded-lg bg-red-100 text-red-600 font-bold hover:bg-red-200 transition-colors`}
            title="Logout"
            onClick={() => {
              window.localStorage.removeItem("sis_user");
              window.location.href = "/Universal_Login";
            }}
          >
            {sidebarOpen ? (
              <>
                <LogOut className="mr-2" /> Logout
              </>
            ) : (
              <LogOut className="text-2xl" />
            )}
          </button>
        )}
      </div>
    </aside>
  )
}