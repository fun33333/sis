"use client"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Users, Building2, GraduationCap, TrendingUp } from "lucide-react"

interface AdminSidebarProps {
  sidebarOpen: boolean
  setSidebarOpen: (open: boolean) => void
}

export function AdminSidebar({ sidebarOpen, setSidebarOpen }: AdminSidebarProps) {
  const pathname = usePathname()

  const menuItems = [
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
        { title: "Teacher List", href: "/admin/teachers" },
        { title: "Add Teacher", href: "/admin/teachers/add" },
        { title: "Teacher Profile", href: "/admin/teachers/profile" },
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
  ]

  return (
    <aside
      className={`h-screen fixed left-0 top-0 flex flex-col justify-between py-8 px-2 rounded-r-3xl shadow-2xl transition-all duration-300 backdrop-blur-lg border-r border-[#8b8c89]/30 z-20 ${sidebarOpen ? "w-72 px-4" : "w-18 px-2"
        }`}
      style={{
        background: sidebarOpen ? "#e7ecef" : "#a3cef1",
        boxShadow: sidebarOpen ? "0 8px 32px 0 #add0e7bc" : "0 2px 8px 0 #a3cef1e8",
        borderRight: "3px solid #1c3f67ff",
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
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-semibold transition-all duration-300 shadow-lg ${isActive ? "bg-[#6096ba] text-[#e7ecef] shadow-xl" : "text-[#274c77] hover:bg-[#a3cef1]"
                      } ${sidebarOpen ? "" : "justify-center"}`}
                    style={{
                      backdropFilter: "blur(4px)",
                      border: isActive ? "2px solid #6096ba" : "1.5px solid #8b8c89",
                    }}
                  >
                    <item.icon
                      className={`h-5 w-5 transition-transform duration-300 group-hover:scale-110 ${isActive ? "text-[#e7ecef]" : "text-[#6096ba]"
                        }`}
                    />
                    {sidebarOpen && <span className="transition-all duration-300">{item.title}</span>}
                    {sidebarOpen && hasSubItems && (
                      <span className="ml-auto">
                        <svg
                          className={`h-4 w-4 transition-transform duration-300 ${isActive ? "rotate-90 text-[#e7ecef]" : "text-[#6096ba]"
                            }`}
                          fill="none"
                          stroke="currentColor"
                          strokeWidth={2}
                          viewBox="0 0 24 24"
                        >
                          <path d="M9 5l7 7-7 7" />
                        </svg>
                      </span>
                    )}
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
      </div>
    </aside>
  )
}
