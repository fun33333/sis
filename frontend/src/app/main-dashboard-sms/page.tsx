"use client"
import { useState, useMemo } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { MultiSelectFilter } from "@/components/dashboard/multi-select-filter"
import { KpiCard } from "@/components/dashboard/kpi-card"
import { GradeDistributionChart } from "@/components/dashboard/grade-distribution-chart"
import { CampusPerformanceChart } from "@/components/dashboard/campus-performance-chart"
import { EnrollmentTrendChart } from "@/components/dashboard/enrollment-trend-chart"
import { GenderDistributionChart } from "@/components/dashboard/gender-distribution-chart"
import { StudentTable } from "@/components/dashboard/student-table"
import {mockStudents,CAMPUSES,GRADES,ACADEMIC_YEARS,getGradeDistribution,getGenderDistribution,getCampusPerformance,getEnrollmentTrend,} from "@/data/mockData"
import type { FilterState, DashboardMetrics } from "@/types/dashboard"
import { Users, Calendar, GraduationCap, TrendingUp, ArrowLeft } from "lucide-react"

export default function DashboardPage() {
  const router = useRouter()
  const [filters, setFilters] = useState<FilterState>({
    academicYears: [],
    campuses: [],
    grades: [],
    genders: [],
  })

  // Filter students based on current filter state
  const filteredStudents = useMemo(() => {
    return mockStudents.filter((student) => {
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
      return true
    })
  }, [filters])

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
    }
  }, [filteredStudents])

  // Calculate trends (mock data for demonstration)
  const trends = useMemo(() => {
    const baseTotal = mockStudents.length
    const currentTotal = filteredStudents.length

    return {
      studentsTrend: {
        value: Math.round(((currentTotal - baseTotal * 0.95) / (baseTotal * 0.95)) * 100),
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
  }, [filteredStudents, mockStudents.length])

  const resetFilters = () => {
    setFilters({
      academicYears: [],
      campuses: [],
      grades: [],
      genders: [],
    })
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
    setFilters((prev) => ({ ...prev, genders: genders as ("Male" | "Female" | "Other")[] }))
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button variant="ghost" onClick={() => router.back()}>
              <ArrowLeft className="mr-2" size={16} />
              Back
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-foreground">School Management Dashboard</h1>
              <p className="text-muted-foreground">Academic performance and analytics overview</p>
            </div>
          </div>
          <Button onClick={resetFilters} variant="outline">
            Reset Filters
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Filters</CardTitle>
            <CardDescription>Select multiple options to filter the dashboard data</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
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
                options={["Male", "Female", "Other"]}
                selectedValues={filters.genders}
                onSelectionChange={updateGenders}
                placeholder="All genders"
              />
            </div>

            {(filters.academicYears.length > 0 ||
              filters.campuses.length > 0 ||
              filters.grades.length > 0 ||
              filters.genders.length > 0) && (
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
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <GradeDistributionChart data={chartData.gradeDistribution} />
          <CampusPerformanceChart data={chartData.campusPerformance} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <GenderDistributionChart data={chartData.genderDistribution} />
          <EnrollmentTrendChart data={chartData.enrollmentTrend} />
        </div>

        <StudentTable students={filteredStudents} />
      </div>
    </div>
  )
}
