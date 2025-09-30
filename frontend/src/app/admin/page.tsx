"use client"
import { useState, useMemo, useEffect, useRef } from "react"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { MultiSelectFilter } from "@/components/dashboard/multi-select-filter"
import { KpiCard } from "@/components/dashboard/kpi-card"
import { GradeDistributionChart } from "@/components/dashboard/grade-distribution-chart"
import { CampusPerformanceChart } from "@/components/dashboard/campus-performance-chart"
import { GenderDistributionChart } from "@/components/dashboard/gender-distribution-chart"
import { MotherTongueChart } from "@/components/dashboard/mother-tongue-chart"
import { ReligionChart } from "@/components/dashboard/religion-chart"
import { ArrowLeft, Calendar, GraduationCap, TrendingUp, Users, Download, ChevronDown } from "lucide-react"
import { getGradeDistribution, getGenderDistribution, getCampusPerformance, getEnrollmentTrend, getMotherTongueDistribution, getReligionDistribution } from "@/lib/chart-utils"
import type { FilterState, DashboardMetrics, LegacyStudent as DashboardStudent } from "@/types/dashboard"
import { StudentTable } from "@/components/dashboard/student-table"
import { useRouter } from "next/navigation"
import { getDashboardStats, getAllStudents, getAllCampuses, apiGet } from "@/lib/api"

if (typeof window !== 'undefined') {
  import('html2pdf.js').then(mod => { (window as any).html2pdf = mod.default; });
}

export default function MainDashboardPage() {
  // Utility to convert students to CSV
  function studentsToCSV(students: DashboardStudent[]) {
    if (!students.length) return '';
    const header = Object.keys(students[0] as any);
    const rows = students.map((s) => header.map((h) => JSON.stringify((s as any)[h] ?? "")).join(","));
    return [header.join(","), ...rows].join("\r\n");
  }

  function studentsToExcel(students: DashboardStudent[]) {
    return studentsToCSV(students); 
  }

  function downloadFile(data: string, filename: string, type: string) {
    const blob = new Blob([data], { type });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    setTimeout(() => {
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }, 100);
  }

  // Export dropdown state
  const [exportOpen, setExportOpen] = useState(false);
  const exportRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (exportRef.current && !exportRef.current.contains(e.target as Node)) {
        setExportOpen(false);
      }
    }
    if (exportOpen) document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [exportOpen]);

  // Export handlers
  async function handleExport(type: string) {
    if (type === 'csv') {
      const csv = studentsToCSV(filteredStudents);
      downloadFile(csv, 'students.csv', 'text/csv');
    } else if (type === 'excel') {
      const excel = studentsToExcel(filteredStudents);
      downloadFile(excel, 'students.xls', 'application/vnd.ms-excel');
    } else if (type === 'pdf') {
      const main = document.querySelector('main');
      if (main && typeof window !== 'undefined' && (window as any).html2pdf) {
        (window as any).html2pdf().from(main).set({
          margin: 0.5,
          filename: 'dashboard.pdf',
          html2canvas: { scale: 1 },
          jsPDF: { unit: 'in', format: 'a4', orientation: 'portrait' }
        }).save();
      } else {
        alert('PDF export requires html2pdf.js.');
      }
    }
    setExportOpen(false);
  }
  const router = useRouter();
  useEffect(() => {
    if (typeof window !== "undefined") {
      const userStr = window.localStorage.getItem("sis_user");
      if (userStr) {
        try {
          const user = JSON.parse(userStr);
          if (user.role === "teacher") {
            router.replace("/admin/students/student-list");
          }
        } catch {}
      }
    }
  }, []);
  const [filters, setFilters] = useState<FilterState>({
    academicYears: [],
    campuses: [],
    grades: [],
    genders: [],
    motherTongues: [],
    religions: [],
  })
  const [students, setStudents] = useState<DashboardStudent[]>([])
  const [loading, setLoading] = useState(true)
  const [showLoader, setShowLoader] = useState(true)

  useEffect(() => {
    document.title = "Dashboard | IAK SMS"
    let loaderTimeout: NodeJS.Timeout;
    
    async function fetchData() {
      setLoading(true)
      try {
        // Try to fetch from API first
        const [apiStudents, apiStats, caps] = await Promise.all([
          getAllStudents(),
          getDashboardStats(),
          getAllCampuses()
        ])

        // Urdu roman: Yahan pe hum ensure kar rahe hain ke apiStudents array hai aur us par length aur map dono kaam karen.
        // English: Here we ensure that apiStudents is an array so that length and map work correctly.
        const studentsArray = Array.isArray(apiStudents) ? apiStudents : [];
        // Always use API data (real database)
        const campusArray = Array.isArray(caps) ? caps : (Array.isArray((caps as any)?.results) ? (caps as any).results : [])
        const idToCampusName = new Map<string, string>(
          campusArray.map((c: any) => [String(c.id), String(c.name || '')])
        )
        const idToCampusCode = new Map<string, string>(
          campusArray.map((c: any) => [String(c.id), String(c.code || '')])
        )

        const mapped: DashboardStudent[] = studentsArray.map((item: any, idx: number) => {
            const createdAt = typeof item?.created_at === "string" ? item.created_at : ""
            const year = createdAt ? Number(createdAt.split("-")[0]) : new Date().getFullYear()
            const genderRaw = (item?.gender ?? "").toString().trim()
          const campusCode = (() => {
            const raw = item?.campus
            if (raw && typeof raw === 'object') return String(raw?.code || 'Unknown').trim()
            if (typeof raw === 'number' || typeof raw === 'string') {
              const hit = idToCampusCode.get(String(raw))
              if (hit) return hit
            }
            return 'Unknown'
          })()
            const gradeName = (item?.current_grade ?? "Unknown").toString().trim()
            const motherTongue = (item?.mother_tongue ?? "Other").toString().trim()
            const religion = (item?.religion ?? "Other").toString().trim()
            return {
              rawData: item,
              studentId: String(item?.gr_no || item?.id || idx + 1),
              name: item?.name || "Unknown",
              academicYear: isNaN(year) ? new Date().getFullYear() : year,
              campus: campusCode,
              grade: gradeName,
              current_grade: gradeName,
              gender: genderRaw || "Unknown",
              motherTongue: motherTongue,
              religion: religion,
              attendancePercentage: Math.floor(Math.random() * 31) + 70, // Mock data for now
              averageScore: Math.floor(Math.random() * 41) + 60, // Mock data for now
              retentionFlag: (item?.current_state || "").toLowerCase() === "active",
              enrollmentDate: createdAt ? new Date(createdAt) : new Date(),
            }
          })
        setStudents(mapped)
      } catch (error) {
        console.error('Error fetching data:', error)
        // Fallback to empty array
        setStudents([])
      } finally {
        setLoading(false)
      }
    }
    
    fetchData()
    loaderTimeout = setTimeout(() => {
      setShowLoader(false)
    }, 3000)
    return () => clearTimeout(loaderTimeout)
  }, [])

  const filteredStudents = useMemo(() => {
    return students.filter((student) => {
      if (filters.academicYears.length > 0 && !filters.academicYears.includes(student.academicYear)) return false
      if (filters.campuses.length > 0 && !filters.campuses.includes(student.campus)) return false
      if (filters.grades.length > 0 && !filters.grades.includes(student.grade)) return false
      if (filters.genders.length > 0 && !filters.genders.includes(student.gender)) return false
      if (filters.motherTongues.length > 0 && !filters.motherTongues.includes(student.motherTongue)) return false
      if (filters.religions.length > 0 && !filters.religions.includes(student.religion)) return false
      return true
    })
  }, [filters, students])

  const metrics = useMemo((): DashboardMetrics => {
    const totalStudents = filteredStudents.length
    const averageAttendance = totalStudents > 0 ? Math.round(filteredStudents.reduce((sum, s) => sum + (s.attendancePercentage || 0), 0) / totalStudents) : 0
    const averageScore = totalStudents > 0 ? Math.round(filteredStudents.reduce((sum, s) => sum + (s.averageScore || 0), 0) / totalStudents) : 0
    const retentionRate = totalStudents > 0 ? Math.round((filteredStudents.filter((s) => s.retentionFlag).length / totalStudents) * 100) : 0
    return { totalStudents, averageAttendance, averageScore, retentionRate }
  }, [filteredStudents])

  // Fallback: if scores are missing (all zeros), show campus counts instead of average score
  const campusPerformanceData = useMemo(() => {
    const hasScores = filteredStudents.some(s => (s.averageScore || 0) > 0)
    if (hasScores) {
      const filteredAnyStudents = filteredStudents as unknown as any[]
      return getCampusPerformance(filteredAnyStudents)
    }
    const counts = filteredStudents.reduce((acc: Record<string, number>, s) => {
      acc[s.campus] = (acc[s.campus] || 0) + 1
      return acc
    }, {})
    return Object.entries(counts).map(([name, value]) => ({ name, value }))
  }, [filteredStudents])

  const chartData = useMemo(() => {
    return {
      gradeDistribution: getGradeDistribution(filteredStudents as unknown as any[]),
      genderDistribution: getGenderDistribution(filteredStudents as unknown as any[]),
      campusPerformance: campusPerformanceData,
      enrollmentTrend: getEnrollmentTrend(filteredStudents as unknown as any[]),
      motherTongueDistribution: getMotherTongueDistribution(filteredStudents as unknown as any[]),
      religionDistribution: getReligionDistribution(filteredStudents as unknown as any[]),
    }
  }, [filteredStudents, campusPerformanceData])

  // Dynamic filter options based on real data
  const dynamicAcademicYears = useMemo(() => Array.from(new Set(students.map(s => s.academicYear))).sort((a, b) => a - b), [students])
  const dynamicCampuses = useMemo(() => Array.from(new Set(students.map(s => s.campus))).sort(), [students])
  const dynamicGrades = useMemo(() => Array.from(new Set(students.map(s => s.grade))).sort(), [students])
  const dynamicMotherTongues = useMemo(() => Array.from(new Set(students.map(s => (s.motherTongue || "").toString().trim()))).filter(Boolean).sort(), [students])
  const dynamicReligions = useMemo(() => Array.from(new Set(students.map(s => (s.religion || "").toString().trim()))).filter(Boolean).sort(), [students])
  const dynamicGenders = useMemo(() => Array.from(new Set(students.map(s => (s.gender || "").toString().trim()))).filter(Boolean).sort(), [students])

  const resetFilters = () => {
    setFilters({ academicYears: [], campuses: [], grades: [], genders: [], motherTongues: [], religions: [] })
  }

  if (loading || showLoader) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-100 via-white to-blue-300 rounded-3xl shadow-xl">
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
    <main className="">

      <div className="bg-white rounded-3xl shadow-xl p-8">

        <Card className="!bg-[#E7ECEF]">
          <CardHeader className="!bg-[#E7ECEF]">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <Button variant="ghost" className="flex items-center gap-2 rounded-xl shadow hover:bg-gray-100 transition" onClick={() => window.history.back()}>
                <ArrowLeft className="h-4 w-4" />
                Back
              </Button>
              <div className="flex gap-2 items-center">
                <Button onClick={resetFilters} variant="outline">
                  Reset Filters
                </Button>
                {/* Export Button Dropdown (moved here) */}
                <div className="relative" ref={exportRef}>
                  <Button
                    variant="outline"
                    className="flex items-center gap-2 px-4 py-2 rounded-lg shadow hover:bg-gray-100"
                    onClick={() => setExportOpen((v) => !v)}
                    aria-haspopup="true"
                    aria-expanded={exportOpen}
                  >
                    <Download className="w-4 h-4" /> Export <ChevronDown className="w-4 h-4" />
                  </Button>
                  {exportOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-white border rounded-lg shadow-lg z-50 animate-fade-in">
                      <button className="w-full text-left px-4 py-2 hover:bg-gray-100" onClick={() => handleExport('excel')}>Excel</button>
                      <button className="w-full text-left px-4 py-2 hover:bg-gray-100" onClick={() => handleExport('csv')}>CSV</button>
                      <button className="w-full text-left px-4 py-2 hover:bg-gray-100" onClick={() => handleExport('pdf')}>PDF</button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent className="!bg-[#E7ECEF]">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
              <MultiSelectFilter title="Academic Year" options={dynamicAcademicYears} selectedValues={filters.academicYears} onSelectionChange={(val) => setFilters((prev) => ({ ...prev, academicYears: val as number[] }))} placeholder="All years" />
              <MultiSelectFilter title="Campus" options={dynamicCampuses} selectedValues={filters.campuses} onSelectionChange={(val) => setFilters((prev) => ({ ...prev, campuses: val as string[] }))} placeholder="All campuses" />
              <MultiSelectFilter title="Grade" options={dynamicGrades} selectedValues={filters.grades} onSelectionChange={(val) => setFilters((prev) => ({ ...prev, grades: val as string[] }))} placeholder="All grades" />
              <MultiSelectFilter title="Gender" options={dynamicGenders} selectedValues={filters.genders} onSelectionChange={(val) => setFilters((prev) => ({ ...prev, genders: val as ("Male" | "Female" | "Other")[] }))} placeholder="All genders" />
              <MultiSelectFilter title="Mother Tongue" options={dynamicMotherTongues} selectedValues={filters.motherTongues} onSelectionChange={(val) => setFilters((prev) => ({ ...prev, motherTongues: val as string[] }))} placeholder="All mother tongues" />
              <MultiSelectFilter title="Religion" options={dynamicReligions} selectedValues={filters.religions} onSelectionChange={(val) => setFilters((prev) => ({ ...prev, religions: val as string[] }))} placeholder="All religions" />
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-8">
          <KpiCard title="Total Students" value={metrics.totalStudents} description="Active enrollments" icon={Users} bgColor="#E7ECEF" textColor="text-[#274c77]" />
          <KpiCard title="Avg Attendance" value={`${metrics.averageAttendance}%`} description="Overall attendance rate" icon={Calendar} bgColor="#8B8C89" textColor="text-white" />
          <KpiCard title="Avg Score" value={metrics.averageScore} description="Academic performance" icon={GraduationCap} bgColor="#6096BA" textColor="text-white" />
          <KpiCard title="Retention Rate" value={`${metrics.retentionRate}%`} description="Student retention" icon={TrendingUp} bgColor="#A3CEF1" textColor="text-[#274c77]" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-8">
          <CampusPerformanceChart data={chartData.campusPerformance} valueKind={filteredStudents.some(s => (s.averageScore || 0) > 0) ? "average" : "count"} />
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
  )
}
