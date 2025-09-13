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
import { StudentTable } from "@/components/dashboard/student-table"
import { CAMPUSES, GRADES, ACADEMIC_YEARS, MOTHER_TONGUES, RELIGIONS, getGradeDistribution, getGenderDistribution, getCampusPerformance, getEnrollmentTrend, getMotherTongueDistribution, getReligionDistribution } from "@/data/mockData"
import { MotherTongueChart } from "@/components/dashboard/mother-tongue-chart"
import { ReligionChart } from "@/components/dashboard/religion-chart"
import type { FilterState, DashboardMetrics, Student } from "@/types/dashboard"
import { Users, Calendar, GraduationCap, TrendingUp, ArrowLeft } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"

export default function DashboardPage() {
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

  useEffect(() => {
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

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center text-xl">Loading student data...</div>
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div>
              <h1 className="text-3xl font-bold text-foreground">School Management Dashboard</h1>
              <p className="text-muted-foreground">Academic performance and analytics overview</p>
            </div>
          </div>
          {/* VIP Donor Profile */}
          <div className="flex items-center gap-3 bg-gradient-to-r from-blue-400 via-blue-200 to-white rounded-xl px-4 py-2 shadow border border-blue-300 cursor-pointer" onClick={() => setShowDonor(true)}>
            <div className="flex flex-col items-end mr-2">
              <span className="text-xs font-semibold text-blue-900 uppercase tracking-wider">Valuable Donor</span>
              <span className="text-base font-bold text-foreground">Miss Uzma Aijaz</span>
            </div>
            <img
              src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcT0rDiT9it7r-r__abYbK7u5UQ1av9CoxaChw&s"
              alt="VIP Donor"
              className="w-12 h-12 rounded-full border-2 border-blue-400 shadow"
            />
          </div>
        </div>
        {/* Donor Profile Popover */}
        <div className="relative">
          {showDonor && (
            <div
              className="absolute right-0 mt-2 z-50 w-80 sm:w-96 bg-white rounded-2xl shadow-2xl border border-blue-200 animate-slideDown"
              style={{ minWidth: '320px', boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.18)' }}
            >
              <button
                onClick={() => setShowDonor(false)}
                className="absolute top-3 right-3 bg-blue-100 hover:bg-blue-300 text-blue-700 rounded-full p-2 shadow transition-all"
                aria-label="Close"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
              <div className="flex flex-col items-center gap-2 pt-6 pb-2">
                <img
                  src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcT0rDiT9it7r-r__abYbK7u5UQ1av9CoxaChw&s"
                  alt="VIP Donor"
                  className="w-20 h-20 rounded-full border-4 border-blue-400 shadow-lg bg-white"
                  style={{ boxShadow: '0 4px 16px 0 rgba(0, 110, 244, 0.4)' }}
                />
                <span className="text-xl font-bold text-yellow-700 mt-2">Miss Uzma Aijaz</span>
                <span className="text-xs font-semibold text-yellow-700 uppercase tracking-wider">Valuable Donor</span>
              </div>
              <div className="space-y-3 px-6 pb-6">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-foreground">Status:</span>
                  <span className="bg-blue-200 text-blue-800 px-2 py-0.5 rounded text-xs font-semibold">Active</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-foreground">Organization:</span>
                  <span className="bg-blue-200 text-blue-800 px-2 py-0.5 rounded text-xs font-semibold">Thaakat Foundation</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-foreground">Role:</span>
                  <span className="text-muted-foreground">Chief Patron</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-foreground">Member Since:</span>
                  <span className="text-muted-foreground">January 2020</span>
                </div>
                <div>
                  <span className="font-semibold text-foreground">Bio:</span>
                  <p className="text-sm text-muted-foreground mt-1">
                    <b>Miss Uzma Ali </b>is a top-tier VIP donor supporting education for
                    underprivileged children. Her generous contributions have enabled
                    scholarships, infrastructure, and digital learning for thousands of
                    students.
                  </p>
                </div>
              </div>
            </div>
          )}
          <style jsx global>{`
            @keyframes slideDown {
              0% { transform: translateY(-16px); opacity: 0; }
              100% { transform: translateY(0); opacity: 1; }
            }
          `}</style>
        </div>

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

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
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

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <GradeDistributionChart data={chartData.gradeDistribution} />
          <GenderDistributionChart data={chartData.genderDistribution} />
          <ReligionChart data={chartData.religionDistribution} />

        </div>


        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <CampusPerformanceChart data={chartData.campusPerformance} />

          <MotherTongueChart data={chartData.motherTongueDistribution} />
        </div>

        <StudentTable students={filteredStudents} />
      </div>
    </div>
  )
}
