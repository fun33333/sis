"use client"
import { useState, useMemo, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { MultiSelectFilter } from "@/components/dashboard/multi-select-filter"
import { KpiCard } from "@/components/dashboard/kpi-card"
import { GradeDistributionChart } from "@/components/dashboard/grade-distribution-chart"
import { CampusPerformanceChart } from "@/components/dashboard/campus-performance-chart"
// import { EnrollmentTrendChart } from "@/components/dashboard/enrollment-trend-chart"
import { GenderDistributionChart } from "@/components/dashboard/gender-distribution-chart"
import { MotherTongueChart } from "@/components/dashboard/mother-tongue-chart"
import { ReligionChart } from "@/components/dashboard/religion-chart"
import { ArrowLeft, Building2, Calendar, GraduationCap, TrendingUp, Users } from "lucide-react"
import Link from "next/link"
// import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { CAMPUSES, GRADES, ACADEMIC_YEARS, MOTHER_TONGUES, RELIGIONS, getGradeDistribution, getGenderDistribution, getCampusPerformance, getEnrollmentTrend, getMotherTongueDistribution, getReligionDistribution } from "@/data/mockData"
import type { FilterState, DashboardMetrics, Student } from "@/types/dashboard"
import { StudentTable } from "@/components/dashboard/student-table"
export default function MainDashboardPage() {
  // Sidebar navigation structure (copied from AdminPanel)
  const forms = {
    students: {
      title: "Add Students",
      icon: Users,
      subItems: [
        { label: "Student List", href: "/students/student-list" },
        { label: "Student Transfer Module", href: "/students/transfer-module" },
        { label: "Termination Certificate", href: "/students/termination-certificate" },
        { label: "Leaving Certificate", href: "/students/leaving-certificate" },
      ],
    },
    campus: {
      title: "Add Campus",
      icon: Building2,
      subItems: [
        { label: "Campus List", href: "/campus/list" },
        { label: "Campus Profile", href: "/campus/profile" },
      ],
    },
    teachers: {
      title: "Add Teachers",
      icon: GraduationCap,
      subItems: [
        { label: "Teacher List", href: "/teachers/list" },
        { label: "Teacher Profile", href: "/teachers/profile" },
      ],
    },
  };
  const [activeForm, setActiveForm] = useState<string | undefined>(undefined);
  // Sidebar expand/collapse state
  const [sidebarOpen, setSidebarOpen] = useState(true);
  useEffect(() => {
    document.title = "Dashboard | IAK SMS";
  }, []);
  const router = useRouter()
  const [filters, setFilters] = useState<FilterState>({
    academicYears: [],
    campuses: [],
    grades: [],
    genders: [],
    motherTongues: [],
    religions: [],
  })
  const [students, setStudents] = useState<Student[]>([])
  const [loading, setLoading] = useState(true)
  const [showDonor, setShowDonor] = useState(false)
  const [showLoader, setShowLoader] = useState(true)

  useEffect(() => {
    let loaderTimeout: NodeJS.Timeout;
    async function fetchStudents() {
      setLoading(true)
      const res = await fetch("/csvjson.json")
      const data = await res.json()
      // Map the raw data to Student[]
      const mapped: Student[] = data.map((item: any, idx: number) => {
        let academicYear = Number(item["Year of Admission"])
        if (isNaN(academicYear)) academicYear = 2025
        let attendancePercentage = Math.floor(Math.random() * 31) + 70 // 70-100
        let averageScore = Math.floor(Math.random() * 41) + 60 // 60-100
        let retentionFlag = Math.random() > 0.2
        let enrollmentDate = new Date()
        try {
          enrollmentDate = new Date(item["Timestamp"])
        } catch { }
        return {
          studentId: `CSV${idx + 1}`,
          name: item["Student Name"] || "Unknown",
          academicYear,
          campus: item["Campus"] || "Unknown",
          grade: item["Current Grade/Class"] || "Unknown",
          gender: item["Gender"] === "Male" || item["Gender"] === "Female" ? item["Gender"] : "Other",
          motherTongue: item["Mother Tongue"] || "Other",
          religion: item["Religion"] || "Other",
          attendancePercentage,
          averageScore,
          retentionFlag,
          enrollmentDate,
        }
      })
      setStudents(mapped)
      setLoading(false)
    }
    fetchStudents()
    loaderTimeout = setTimeout(() => {
      setShowLoader(false)
    }, 3000)
    return () => {
      clearTimeout(loaderTimeout)
    }
  }, [])

  // Filter students based on current filter state
  const filteredStudents = useMemo(() => {
    return students.filter((student) => {
      if (filters.academicYears.length > 0 && !filters.academicYears.includes(student.academicYear)) {
        return false
      }
      if (filters.campuses.length > 0 && !filters.campuses.includes(student.campus)) {
        return false
      }
      if (filters.grades.length > 0 && !filters.grades.includes(student.grade)) {
        return false
      }
      if (filters.genders.length > 0 && !filters.genders.includes(student.gender)) {
        return false
      }
      if (filters.motherTongues.length > 0 && !filters.motherTongues.includes(student.motherTongue)) {
        return false
      }
      if (filters.religions.length > 0 && !filters.religions.includes(student.religion)) {
        return false
      }
      return true
    })
  }, [filters, students])

  // Calculate metrics from filtered data
  const metrics = useMemo((): DashboardMetrics => {
    const totalStudents = filteredStudents.length
    const averageAttendance =
      totalStudents > 0
        ? Math.round(filteredStudents.reduce((sum, s) => sum + s.attendancePercentage, 0) / totalStudents)
        : 0
    const averageScore =
      totalStudents > 0 ? Math.round(filteredStudents.reduce((sum, s) => sum + s.averageScore, 0) / totalStudents) : 0
    const retentionRate =
      totalStudents > 0 ? Math.round((filteredStudents.filter((s) => s.retentionFlag).length / totalStudents) * 100) : 0

    return {
      totalStudents,
      averageAttendance,
      averageScore,
      retentionRate,
    }
  }, [filteredStudents])

  // Calculate chart data from filtered students
  const chartData = useMemo(() => {
    return {
      gradeDistribution: getGradeDistribution(filteredStudents),
      genderDistribution: getGenderDistribution(filteredStudents),
      campusPerformance: getCampusPerformance(filteredStudents),
      enrollmentTrend: getEnrollmentTrend(filteredStudents),
      motherTongueDistribution: getMotherTongueDistribution(filteredStudents),
      religionDistribution: getReligionDistribution(filteredStudents),
    }
  }, [filteredStudents])

  // Calculate trends (mock data for demonstration)
  const trends = useMemo(() => {
    const baseTotal = students.length
    const currentTotal = filteredStudents.length

    return {
      studentsTrend: {
        value: baseTotal > 0 ? Math.round(((currentTotal - baseTotal * 0.95) / (baseTotal * 0.95)) * 100) : 0,
        isPositive: currentTotal >= baseTotal * 0.95,
      },
      attendanceTrend: {
        value: Math.round(Math.random() * 10 + 2),
        isPositive: Math.random() > 0.3,
      },
      scoreTrend: {
        value: Math.round(Math.random() * 8 + 1),
        isPositive: Math.random() > 0.4,
      },
      retentionTrend: {
        value: Math.round(Math.random() * 5 + 1),
        isPositive: Math.random() > 0.2,
      },
    }
  }, [filteredStudents, students.length])

  const resetFilters = () => {
    setFilters({
      academicYears: [],
      campuses: [],
      grades: [],
      genders: [],
      motherTongues: [],
      religions: [],
    })
  }
  const updateMotherTongues = (motherTongues: (string | number)[]) => {
    setFilters((prev) => ({ ...prev, motherTongues: motherTongues as string[] }))
  }
  const updateReligions = (religions: (string | number)[]) => {
    setFilters((prev) => ({ ...prev, religions: religions as string[] }))
  }
  const updateAcademicYears = (years: (string | number)[]) => {
    setFilters((prev) => ({ ...prev, academicYears: years as number[] }))
  }
  const updateCampuses = (campuses: (string | number)[]) => {
    setFilters((prev) => ({ ...prev, campuses: campuses as string[] }))
  }
  const updateGrades = (grades: (string | number)[]) => {
    setFilters((prev) => ({ ...prev, grades: grades as string[] }))
  }
  const updateGenders = (genders: (string | number)[]) => {
    setFilters((prev) => ({ ...prev, genders: genders as ("Male" | "Female")[] }))
  }

  if (loading || showLoader) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-100 via-white to-blue-300">
        <div className="flex flex-col items-center gap-6">
          <div className="relative">
            <div className="w-24 h-24 rounded-full border-8 border-blue-400 border-t-transparent animate-spin" style={{ borderTopColor: '#FFD700' }}></div>
            <img
              src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcT0rDiT9it7r-r__abYbK7u5UQ1av9CoxaChw&s"
              alt="VIP Donor"
              className="w-16 h-16 rounded-full border-4 border-yellow-400 shadow-lg absolute top-4 left-4"
              style={{ boxShadow: '0 4px 16px 0 rgba(0, 110, 244, 0.4)' }}
            />
          </div>
          <div className="text-center">
            <h2 className="text-2xl font-bold text-blue-900 mb-2 tracking-tight">Welcome to the VIP Dashboard</h2>
            <p className="text-lg text-blue-700 font-medium">Loading student data...</p>
            <span className="block mt-2 text-sm text-yellow-700 font-semibold">Powered by Idara Al-Khair Foundation</span>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#e7ecef] flex">
      <aside
        className={`h-screen sticky top-0 left-0 flex flex-col justify-between py-8 px-2 rounded-r-3xl shadow-2xl transition-all duration-300 backdrop-blur-lg border-r border-[#8b8c89]/30 z-20 ${sidebarOpen ? 'w-72 px-4' : 'w-18 px-2'}`}
        style={{
          height: '100vh',
          background: sidebarOpen ? '#e7ecef' : '#a3cef1',
          boxShadow: sidebarOpen ? '0 8px 32px 0 #add0e7bc' : '0 2px 8px 0 #a3cef1e8',
          borderRight: '3px solid #1c3f67ff',
        }}
      >
        <div>
          <div className="flex items-center gap-3 mb-10">
            <div
              className="p-2 rounded-xl cursor-pointer hover:scale-105 transition-transform duration-300"
              onClick={() => setSidebarOpen((prev) => !prev)}
              aria-label={sidebarOpen ? 'Collapse sidebar' : 'Expand sidebar'}
              style={{ boxShadow: sidebarOpen ? '0 2px 8px 0 #6096ba33' : '0 2px 8px 0 #a3cef133' }}
            >
              <img src="/logo 1 pen.png" alt="Logo" className="w-10 h-10" />
            </div>
            {sidebarOpen && (
              <span className="text-2xl font-bold text-[#274c77] tracking-tight drop-shadow-lg" style={{ letterSpacing: '0.02em' }}></span>
            )}
          </div>
          <nav className="space-y-2">
            <Link href="/main-dashboard-sms">
              <button className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-semibold transition-all duration-300 shadow-lg ${sidebarOpen ? 'text-[#274c77] bg-[#e7ecef] hover:bg-[#a3cef1]' : 'justify-center text-[#274c77] bg-[#a3cef1] hover:bg-[#6096ba]'}`}
                style={{ backdropFilter: 'blur(4px)', border: '1.5px solid #8b8c89' }}>
                <TrendingUp className="h-5 w-5 transition-transform duration-300 group-hover:scale-110" style={{ color: '#3d80a1e8' }} />
                {sidebarOpen && <span className="transition-all duration-300">Dashboard</span>}
              </button>
            </Link>
            {Object.entries(forms).map(([key, form]) => {
              const isActive = activeForm === key;
              return (
                <div key={key}>
                  <button
                    className={`w-full flex items-center gap-3 mt-5 px-3 py-4 rounded-xl font-semibold transition-all duration-300 shadow-lg text-left group ${isActive ? 'bg-[#6096ba] text-[#e7ecef] shadow-xl' : 'text-[#274c77] hover:bg-[#a3cef1]'} ${sidebarOpen ? '' : 'justify-center'}`}
                    style={{ backdropFilter: 'blur(4px)', border: isActive ? '2px solid #6096ba' : '1.5px solid #8b8c89' }}
                    onClick={() => setActiveForm(isActive ? undefined : key)}
                  >
                    {form.icon && <form.icon className={`h-5 w-5 transition-transform duration-300 group-hover:scale-110 ${isActive ? 'text-[#e7ecef]' : 'text-[#6096ba]'}`} />}
                    {sidebarOpen && <span className="transition-all duration-300">{form.title}</span>}
                    {sidebarOpen && (
                      <span className="ml-auto">
                        <svg className={`h-4 w-4 transition-transform duration-300 ${isActive ? 'rotate-90 text-[#e7ecef]' : 'text-[#6096ba]'}`} fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path d="M9 5l7 7-7 7" /></svg>
                      </span>
                    )}
                  </button>
                  {sidebarOpen && isActive && (
                    <div className="ml-7 mt-2 mb-2 space-y-1 overflow-hidden transition-all duration-300 max-h-96 opacity-100">
                      {form.subItems.map((item) => (
                        <button
                          key={item.label}
                          className="block w-full text-left px-3 py-2 rounded-lg hover:bg-[#6096ba]/20 text-[#274c77] font-medium transition-all duration-300"
                          onClick={() => window.location.href = item.href}
                        >
                          {item.label}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </nav>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 px-10 py-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-[#274c77]">School Management Dashboard</h1>
          <Badge variant="secondary" className="text-sm bg-[#A3CEF1] text-[#274c77] px-4 py-2 rounded-xl shadow">Educational Management System</Badge>
        </div>
        <div className="bg-white rounded-3xl shadow-xl p-8">

          <Card className="!bg-[#E7ECEF]">
            <CardHeader className="!bg-[#E7ECEF]">
              <div className="flex items-center justify-between flex-wrap gap-4">
                <Button
                  variant="ghost"
                  className="flex items-center gap-2 rounded-xl shadow hover:bg-gray-100 transition"
                  onClick={() => window.history.back()}
                >
                  <ArrowLeft className="h-4 w-4" />
                  Back
                </Button>
                <Button onClick={resetFilters} variant="outline">
                  Reset Filters
                </Button>
              </div>
            </CardHeader>
            <CardContent className="!bg-[#E7ECEF]">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
                <MultiSelectFilter
                  title="Academic Year"
                  options={ACADEMIC_YEARS}
                  selectedValues={filters.academicYears}
                  onSelectionChange={updateAcademicYears}
                  placeholder="All years"
                />
                <MultiSelectFilter
                  title="Campus"
                  options={CAMPUSES}
                  selectedValues={filters.campuses}
                  onSelectionChange={updateCampuses}
                  placeholder="All campuses"
                />
                <MultiSelectFilter
                  title="Grade"
                  options={GRADES}
                  selectedValues={filters.grades}
                  onSelectionChange={updateGrades}
                  placeholder="All grades"
                />
                <MultiSelectFilter
                  title="Gender"
                  options={["Male", "Female"]}
                  selectedValues={filters.genders}
                  onSelectionChange={updateGenders}
                  placeholder="All genders"
                />
                <MultiSelectFilter
                  title="Mother Tongue"
                  options={MOTHER_TONGUES}
                  selectedValues={filters.motherTongues}
                  onSelectionChange={updateMotherTongues}
                  placeholder="All mother tongues"
                />
                <MultiSelectFilter
                  title="Religion"
                  options={RELIGIONS}
                  selectedValues={filters.religions}
                  onSelectionChange={updateReligions}
                  placeholder="All religions"
                />
              </div>

              {(filters.academicYears.length > 0 ||
                filters.campuses.length > 0 ||
                filters.grades.length > 0 ||
                filters.genders.length > 0 ||
                filters.motherTongues.length > 0 ||
                filters.religions.length > 0) && (
                  <div className="mt-4 pt-4 border-t">
                    <h4 className="text-sm font-medium mb-2">Active Filters:</h4>
                    <div className="flex flex-wrap gap-2">
                      {filters.academicYears.length > 0 && (
                        <Badge variant="default">Years: {filters.academicYears.join(", ")}</Badge>
                      )}
                      {filters.campuses.length > 0 && (
                        <Badge variant="default">Campuses: {filters.campuses.join(", ")}</Badge>
                      )}
                      {filters.grades.length > 0 && (
                        <Badge variant="default">
                          Grades: {filters.grades.slice(0, 3).join(", ")}
                          {filters.grades.length > 3 ? ` +${filters.grades.length - 3}` : ""}
                        </Badge>
                      )}
                      {filters.genders.length > 0 && <Badge variant="default">Genders: {filters.genders.join(", ")}</Badge>}
                      {filters.motherTongues.length > 0 && <Badge variant="default">Mother Tongues: {filters.motherTongues.join(", ")}</Badge>}
                      {filters.religions.length > 0 && <Badge variant="default">Religions: {filters.religions.join(", ")}</Badge>}
                    </div>
                  </div>
                )}
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-8">
            <KpiCard
              title="Total Students"
              value={metrics.totalStudents}
              description="Active enrollments"
              icon={Users}
              trend={trends.studentsTrend}
              bgColor="#E7ECEF"
              textColor="text-[#274c77]"
            />
            <KpiCard
              title="Avg Attendance"
              value={`${metrics.averageAttendance}%`}
              description="Overall attendance rate"
              icon={Calendar}
              trend={trends.attendanceTrend}
              progress={{
                value: metrics.averageAttendance,
                max: 100,
              }}
              bgColor="#8B8C89"
              textColor="text-white"
            />
            <KpiCard
              title="Avg Score"
              value={metrics.averageScore}
              description="Academic performance"
              icon={GraduationCap}
              trend={trends.scoreTrend}
              progress={{
                value: metrics.averageScore,
                max: 100,
              }}
              bgColor="#6096BA"
              textColor="text-white"
            />
            <KpiCard
              title="Retention Rate"
              value={`${metrics.retentionRate}%`}
              description="Student retention"
              icon={TrendingUp}
              trend={trends.retentionTrend}
              progress={{
                value: metrics.retentionRate,
                max: 100,
              }}
              bgColor="#A3CEF1"
              textColor="text-[#274c77]"
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-8">
            <CampusPerformanceChart data={chartData.campusPerformance} />
            <GenderDistributionChart data={chartData.genderDistribution} />
            <ReligionChart data={chartData.religionDistribution} />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
            <GradeDistributionChart data={chartData.gradeDistribution} />
            <MotherTongueChart data={chartData.motherTongueDistribution} />
          </div>

          <StudentTable students={filteredStudents} />
        </div>
      </main>
    </div>
  )

}
