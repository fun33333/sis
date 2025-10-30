"use client"

import React, { useState, useEffect, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
// Tabs removed for single-page dashboard layout
import {
  ArrowLeft,
  XCircle,
  Clock,
  CheckCircle,
  AlertCircle
} from "lucide-react"
import {
  getTeacherById,
  getAllTeachers,
  getTeacherClasses,
  getTeacherAttendanceSummary,
  getAttendanceForDate,
  getClassStudents,
  getTeacherWeeklyAttendance
} from "@/lib/api"
import { ResponsiveContainer, LineChart, Line, CartesianGrid, XAxis, YAxis, Tooltip } from 'recharts'

// IAK SMS Theme Colors
const colors = {
  primary: '#274c77',
  secondary: '#6096ba',
  accent: '#a3cef1',
  light: '#e7ecef',
  dark: '#8b8c89',
  success: '#10b981',
  warning: '#f59e0b',
  danger: '#ef4444'
}

function TeacherProfileContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const teacherId = searchParams.get('id')

  const [teacher, setTeacher] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [teacherClasses, setTeacherClasses] = useState<any[]>([])
  const [selectedClassroom, setSelectedClassroom] = useState<any>(null)
  const [attendanceData, setAttendanceData] = useState<any>(null)
  const [weeklyAttendance, setWeeklyAttendance] = useState<any[]>([])
  const [todayAttendance, setTodayAttendance] = useState<any>(null)
  const [classStudents, setClassStudents] = useState<any[]>([])
  const [attendanceLoading, setAttendanceLoading] = useState(false)
  const [weekOffset, setWeekOffset] = useState(0) // 0=current week, 1=previous, ...
  const [weekLeaveCount, setWeekLeaveCount] = useState(0)
  const [weekExtraLoading, setWeekExtraLoading] = useState(false)
  const [trendRange, setTrendRange] = useState<'7d' | '15d' | '30d'>('30d')
  const [trendData, setTrendData] = useState<Array<{ label: string, present: number, absent: number, pct: number }>>([])
  const [studentsOfMonth, setStudentsOfMonth] = useState<Array<{ id: number, name: string, present: number, percentage: number }>>([])
  const [studentsOfMonthLoading, setStudentsOfMonthLoading] = useState(false)

  useEffect(() => {
    document.title = "Teacher Profile | IAK SMS";
  }, []);

  useEffect(() => {
    async function fetchTeacherData() {
      if (!teacherId) {
        setError("No teacher ID provided")
        setLoading(false)
        return
      }

      try {
        const teacherData = await getTeacherById(teacherId)

        if (teacherData) {
          setTeacher(teacherData)

          // Prefer assigned classroom from teacher profile
          let preferredClassroom: any = null
          const assigned = (teacherData as any)?.assigned_classroom || (teacherData as any)?.assigned_classrooms?.[0]
          if (assigned) {
            // Case 1: assigned is object with details
            if (typeof assigned === 'object') {
              preferredClassroom = {
                id: assigned.id || assigned.classroom_id,
                name: assigned.name || assigned.title || `${assigned.grade_name || assigned.grade || ''}${assigned.section ? ` - ${assigned.section}` : ''}`.trim()
              }
            } else if (typeof assigned === 'number' || typeof assigned === 'string') {
              // Case 2: assigned is id; try to use classroom_data or classroom_name from profile
              const cdata: any = (teacherData as any)?.classroom_data
              const cname: any = (teacherData as any)?.classroom_name
              if (cdata) {
                preferredClassroom = {
                  id: cdata.id || assigned,
                  name: cdata.name || `${cdata.grade_name || cdata.grade || ''}${cdata.section ? ` - ${cdata.section}` : ''}`.trim()
                }
              } else if (cname) {
                preferredClassroom = { id: assigned, name: String(cname) }
              } else {
                preferredClassroom = { id: assigned, name: 'Assigned Classroom' }
              }
            }
          } else if ((teacherData as any)?.classroom_name) {
            // Fallback: classroom_name present even when assigned_classroom missing
            preferredClassroom = { id: (teacherData as any)?.classroom_data?.id, name: (teacherData as any).classroom_name }
          }

          // Fetch teacher classes and set selection
          try {
            const classes = await getTeacherClasses()
            if (classes && Array.isArray(classes)) {
              setTeacherClasses(classes)
              if (preferredClassroom) {
                // If preferred exists in list, find the canonical object
                const inList = classes.find((c: any) => c.id?.toString() === preferredClassroom.id?.toString())
                setSelectedClassroom(inList || preferredClassroom)
              } else if (classes.length > 0) {
                setSelectedClassroom(classes[0])
              }
            }
          } catch (err) {
            // Even if classes fetch fails, still set preferred if available
            if (preferredClassroom) {
              setTeacherClasses([preferredClassroom])
              setSelectedClassroom(preferredClassroom)
            }
          }
        } else {
          const allTeachers = await getAllTeachers()
          const foundTeacher = allTeachers.find((t: any) => t.id.toString() === teacherId)

          if (foundTeacher) {
            setTeacher(foundTeacher)
          } else {
            setError("Teacher not found")
          }
        }
      } catch (err: any) {
        setError(err.message || "Failed to load teacher data")
      } finally {
        setLoading(false)
      }
    }

    fetchTeacherData()
  }, [teacherId])

  // Fetch attendance data when classroom is selected
  useEffect(() => {
    async function fetchAttendanceData() {
      if (!selectedClassroom?.id) return

      setAttendanceLoading(true)
      try {
        // Default pull for last 60 days to have enough data for trends
        const currentDate = new Date()
        const start = new Date(currentDate)
        start.setDate(currentDate.getDate() - 59)
        const startDate = start.toISOString().split('T')[0]
        const endDate = currentDate.toISOString().split('T')[0]
        const baseData = await getTeacherAttendanceSummary(selectedClassroom.id, startDate, endDate)
        setAttendanceData(Array.isArray(baseData) ? baseData : [])

        // Fetch weekly attendance
        const weeklyData = await getTeacherWeeklyAttendance(selectedClassroom.id)
        setWeeklyAttendance(Array.isArray(weeklyData) ? weeklyData : [])

        // Fetch today's attendance
        const todayDateStr = new Date().toISOString().split('T')[0]
        const todayData = await getAttendanceForDate(selectedClassroom.id, todayDateStr)
        setTodayAttendance(todayData)

        // Fetch class students
        const students = await getClassStudents(selectedClassroom.id)
        setClassStudents(Array.isArray(students) ? students : [])
      } catch (err) {
        // silently handle attendance fetch errors
      } finally {
        setAttendanceLoading(false)
      }
    }

    if (selectedClassroom) {
      fetchAttendanceData()
    }
  }, [selectedClassroom])


  const getInitials = (name: string) => {
    return name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || 'T'
  }

  const buildQualification = (t: any) => {
    const level = t?.education_level || t?.qualification || t?.highest_qualification
    const subjects = t?.education_subjects
    const grade = t?.education_grade
    const inst = t?.institution_name
    const year = t?.year_of_passing
    const parts: string[] = []
    if (level) parts.push(level)
    if (subjects) parts.push(`in ${subjects}`)
    const tail: string[] = []
    if (inst) tail.push(inst)
    if (year) tail.push(String(year))
    if (grade) tail.push(`Grade: ${grade}`)
    if (tail.length) parts.push(`(${tail.join(', ')})`)
    return parts.join(' ')
  }

  // Calculate attendance percentage

  const getWeekAttendanceMonSat = (offset: number = 0) => {
    if (!attendanceData || !Array.isArray(attendanceData)) return []

    const today = new Date()
    // Compute Monday of the current week (Mon=1, Sun=0)
    const day = today.getDay() // 0..6 (Sun..Sat)
    const offsetFromMonday = (day + 6) % 7
    const monday = new Date(today)
    monday.setDate(today.getDate() - offsetFromMonday - (offset * 7))

    const days: Array<{ day: string; present: number; leave: number; absent: number; date: string }> = []
    const names = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

    for (let i = 0; i < 6; i++) {
      const date = new Date(monday)
      date.setDate(monday.getDate() + i)
      const dateStr = date.toISOString().split('T')[0]

      const dayData = attendanceData.find((d: any) => d.date === dateStr)

      if (dayData) {
        const present = dayData.present_count || 0
        const absent = dayData.absent_count || 0
        const leave = dayData.leave_count ?? dayData.on_leave_count ?? 0
        const total = present + absent + leave
        const presentPct = total > 0 ? Math.round((present / total) * 100) : 0
        const leavePct = total > 0 ? Math.round((leave / total) * 100) : 0
        const absentPct = Math.max(0, 100 - presentPct - leavePct)
        days.push({ day: names[i], present: presentPct, leave: leavePct, absent: absentPct, date: dateStr })
      } else {
        days.push({ day: names[i], present: 0, leave: 0, absent: 0, date: dateStr })
      }
    }

    return days
  }

  // Get greeting based on time
  const getGreeting = () => {
    const hour = new Date().getHours()
    if (hour < 12) return "Good Morning"
    if (hour < 17) return "Good Afternoon"
    return "Good Evening"
  }

  // Get today's classes schedule (mock for now, can be enhanced with real timetable API)

  const last7Days = getWeekAttendanceMonSat(weekOffset)

  // Selected week range label (Mon–Sat)
  const getSelectedWeekRangeLabel = () => {
    const today = new Date()
    const day = today.getDay()
    const offsetFromMonday = (day + 6) % 7
    const monday = new Date(today)
    monday.setDate(today.getDate() - offsetFromMonday - (weekOffset * 7))
    const saturday = new Date(monday)
    saturday.setDate(monday.getDate() + 5)
    const fmt = (d: Date) => d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })
    return `${fmt(monday)} – ${fmt(saturday)}`
  }

  // Attendance percentage for selected week
  const weekAttendancePercentage = (() => {
    if (!attendanceData || !Array.isArray(attendanceData) || last7Days.length === 0) return 0
    const dates = new Set(last7Days.map(d => d.date))
    const filtered = attendanceData.filter((d: any) => dates.has(d.date))
    const total = filtered.reduce((sum: number, d: any) => sum + (d.present_count || 0) + (d.absent_count || 0), 0)
    const present = filtered.reduce((sum: number, d: any) => sum + (d.present_count || 0), 0)
    return total > 0 ? Math.round((present / total) * 100) : 0
  })()

  // Weekly breakdown: present%, absent%, leave count
  const weekBreakdown = (() => {
    if (!attendanceData || !Array.isArray(attendanceData) || last7Days.length === 0) {
      return { presentPct: 0, absentPct: 0, leaveCount: 0 }
    }
    const dates = new Set(last7Days.map(d => d.date))
    const filtered = attendanceData.filter((d: any) => dates.has(d.date))
    const present = filtered.reduce((s: number, d: any) => s + (d.present_count || 0), 0)
    const absent = filtered.reduce((s: number, d: any) => s + (d.absent_count || 0), 0)
    const leave = filtered.reduce((s: number, d: any) => {
      // Be tolerant to different backend keys for leave
      const l = (d.leave_count ?? d.on_leave_count ?? d.leaves_count ?? d.leaves ?? d.leave ?? 0)
      return s + (Number.isFinite(l) ? l : 0)
    }, 0)
    const total = present + absent + leave
    const presentPct = total > 0 ? Math.round((present / total) * 100) : 0
    const absentPct = total > 0 ? Math.round((absent / total) * 100) : 0
    return { presentPct, absentPct, leaveCount: leave }
  })()

  // Fallback: If summary doesn't return leave_count, compute from per-day attendance
  useEffect(() => {
    async function computeWeekLeaveFromDaily() {
      try {
        if (!selectedClassroom?.id || last7Days.length === 0) return
        setWeekExtraLoading(true)
        const counts = await Promise.all(
          last7Days.map(async (d) => {
            const res: any = await getAttendanceForDate(selectedClassroom.id, d.date)
            const leaveFromItems = res?.student_attendances?.filter((s: any) => (s.status || '').toLowerCase().includes('leave')).length || 0
            const leaveFromCounts = res?.leave_count ?? res?.on_leave_count ?? 0
            const leave = leaveFromCounts || leaveFromItems
            return leave
          })
        )
        const totalLeave = counts.reduce((a: number, b: number) => a + b, 0)
        setWeekLeaveCount(totalLeave)
      } catch (e) {
        // swallow errors; leave count may remain 0
      } finally {
        setWeekExtraLoading(false)
      }
    }

    computeWeekLeaveFromDaily()
  }, [selectedClassroom?.id, weekOffset, attendanceData])

  // Build attendance trend data based on selected range
  useEffect(() => {
    async function buildTrend() {
      if (!selectedClassroom?.id) return
      // Decide date window
      const now = new Date()
      let start: Date = new Date(now)
      if (trendRange === '7d') {
        start = new Date(now)
        start.setDate(now.getDate() - 6)
      } else if (trendRange === '15d') {
        start = new Date(now)
        start.setDate(now.getDate() - 14)
      } else if (trendRange === '30d') {
        start = new Date(now)
        start.setDate(now.getDate() - 29)
      }

      const startDate = start.toISOString().split('T')[0]
      const endDate = now.toISOString().split('T')[0]
      const raw = await getTeacherAttendanceSummary(selectedClassroom.id, startDate, endDate)
      const list: any[] = Array.isArray(raw) ? raw : []

      // Build a date->summary lookup so that missing days are filled with 0
      const byDate = new Map<string, any>()
      list.forEach((d: any) => byDate.set(d.date, d))

      const days: Array<{ label: string; present: number; absent: number; pct: number }> = []
      const iter = new Date(start)
      while (iter <= now) {
        // Skip Sundays in trend visualization
        if (iter.getDay() === 0) { // 0 = Sunday
          iter.setDate(iter.getDate() + 1)
          continue
        }
        const dstr = iter.toISOString().slice(0, 10)
        const d = byDate.get(dstr)
        const present = d?.present_count || 0
        const absent = d?.absent_count || 0
        const leave = d?.leave_count || d?.on_leave_count || 0
        const inferredAbsent = absent || (d?.total_students ? Math.max((d.total_students - present - leave), 0) : 0)
        const total = present + inferredAbsent + leave
        const pct = total > 0 ? Math.round((present / total) * 100) : 0
        days.push({ label: dstr.slice(5), present, absent: inferredAbsent, pct })
        iter.setDate(iter.getDate() + 1)
      }

      setTrendData(days)
    }

    buildTrend()
  }, [selectedClassroom?.id, trendRange])

  // Compute Students of the Month (previous month based on attendance)
  useEffect(() => {
    async function computeStudentsOfMonth() {
      try {
        if (!selectedClassroom?.id) return
        setStudentsOfMonthLoading(true)

        // Previous month window
        const now = new Date()
        const start = new Date(now.getFullYear(), now.getMonth() - 1, 1)
        const end = new Date(now.getFullYear(), now.getMonth(), 0)

        // Fetch students in class
        const rosterRes: any = await getClassStudents(selectedClassroom.id)
        const roster: any[] = Array.isArray(rosterRes) ? rosterRes : (rosterRes?.students || [])
        const map = new Map<number, { id: number, name: string, present: number }>()
        roster.forEach((s: any) => {
          map.set(s.id, { id: s.id, name: s.full_name || s.name, present: 0 })
        })

        let totalAttendanceDays = 0
        const daysSeenByStudent = new Map<number, number>()
        // Iterate days of prev month
        const iter = new Date(start)
        while (iter <= end) {
          const dateStr = iter.toISOString().split('T')[0]
          const dayRes: any = await getAttendanceForDate(selectedClassroom.id, dateStr)
          if (dayRes && Array.isArray(dayRes.student_attendances)) {
            totalAttendanceDays += 1
            dayRes.student_attendances.forEach((sa: any) => {
              const sid = sa.student_id
              if (map.has(sid)) {
                // Count that this student has a record for this day
                daysSeenByStudent.set(sid, (daysSeenByStudent.get(sid) || 0) + 1)
                if ((sa.status || '').toLowerCase() === 'present') {
                  const rec = map.get(sid) as any
                  rec.present += 1
                }
              }
            })
          }
          iter.setDate(iter.getDate() + 1)
        }

        // Only include students who have a complete record for ALL attendance days in the month
        const list = Array.from(map.values())
          .filter(s => (daysSeenByStudent.get(s.id) || 0) === totalAttendanceDays && totalAttendanceDays > 0)
          .map(s => ({
            id: s.id,
            name: s.name,
            present: s.present,
            percentage: Math.round((s.present / totalAttendanceDays) * 100)
          }))
        list.sort((a, b) => b.present - a.present || b.percentage - a.percentage)
        setStudentsOfMonth(list.slice(0, 3))
      } catch (e) {
        // silently handle computation errors for students of the month
        setStudentsOfMonth([])
      } finally {
        setStudentsOfMonthLoading(false)
      }
    }

    computeStudentsOfMonth()
  }, [selectedClassroom?.id])

  if (loading) {
    return <LoadingSpinner message="Loading Teacher Profile..." fullScreen />
  }

  if (error || !teacher) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardContent className="p-8 text-center">
            <XCircle className="w-16 h-16 mx-auto mb-4" style={{ color: colors.danger }} />
            <h2 className="text-2xl font-bold mb-2" style={{ color: colors.primary }}>Error</h2>
            <p className="text-gray-600 mb-4">{error || "Teacher not found"}</p>
            <Button onClick={() => router.back()} style={{ backgroundColor: colors.primary }}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Go Back
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: colors.light }}>
      <div className="max-w-7xl mx-auto p-4 sm:p-6">
        {/* Top Header Section - Greeting Card */}

        <Card className="mb-6 shadow-lg border-0" style={{ background: `linear-gradient(135deg, ${colors.primary} 0%, ${colors.secondary} 100%)` }}>
          <CardContent className="p-4 sm:p-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between text-white gap-4">
              <div className="flex-1">
                <h1 className="text-2xl sm:text-3xl font-bold">
                  {getGreeting()}, {teacher.full_name?.split(' ')[0] || 'Teacher'}
                </h1>
                <p className="text-sm sm:text-base opacity-90 mt-1">Have a Good day at work</p>
                <div className="mt-3 bg-white/20 backdrop-blur-sm rounded-lg px-3 py-2 inline-block">
                  <p className="text-xs sm:text-sm">
                    <span className="font-bold">Notice:</span>Any New Notice will be Inform to you via Email and SMS </p>
                </div>
                {/* Actions row (replaces heavy info pills) */}
                <div className="mt-3 flex flex-wrap items-center gap-2 sm:gap-3">
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-8 border-white/30 text-white hover:bg-white/20"
                    onClick={() => router.push(`/admin/teachers/stats${teacherId ? `?id=${teacherId}` : ''}`)}
                  >
                    Generate Report For this Teacher
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Top Row: 3 cards in one row (Teacher Details, Students of the Month, Attendance Trend) */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 auto-rows-fr mb-4 sm:mb-6">
          <Card className="shadow-lg border-0 overflow-hidden" style={{ background: `linear-gradient(135deg, ${colors.primary} 0%, #1e3a5f 100%)` }}>
            <CardContent className="p-5 sm:p-6">
              {/* Top row: avatar + name + back */}
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3 sm:gap-4 flex-1 min-w-0">
                  {teacher.profile_image ? (
                    <img src={teacher.profile_image} alt={teacher.full_name} className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl object-cover ring-2 ring-white/30" />
                  ) : (
                    <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl flex items-center justify-center text-xl sm:text-2xl font-bold text-white ring-2 ring-white/30" style={{ background: `linear-gradient(135deg, ${colors.secondary}, ${colors.accent})` }}>
                      {getInitials(teacher.full_name || 'T')}
                    </div>
                  )}
                  <div className="text-white flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-xl truncate">{teacher.full_name || 'Unknown'}</h3>
                    </div>
                    <div className="text-xs sm:text-sm opacity-90 truncate">{teacher.assigned_classroom?.name || teacher.assigned_classrooms?.[0]?.name || teacher.classroom_name || teacher.classroom_data?.name || selectedClassroom?.name || teacher.current_classes_taught || 'No Classes Assigned'}</div>
                  </div>
                </div>
                <Button size="icon" variant="ghost" className="text-white hover:bg-white/20 rounded-full" onClick={() => router.back()}>
                  <ArrowLeft className="w-4 h-4" />
                </Button>
              </div>

              <div className="mt-4 grid grid-cols-1 gap-y-3">
                <div className="px-2.5 py-1.5 rounded-md bg-white/10 text-white text-xs backdrop-blur-sm">
                  <div className="opacity-80">Assigned</div>
                  <div className="font-semibold truncate">{teacher.assigned_classroom?.name || teacher.assigned_classrooms?.[0]?.name || selectedClassroom?.name || teacher.classroom_name || '—'}</div>
                </div>
                <div className="px-2.5 py-1.5 rounded-md bg-white/10 text-white text-xs backdrop-blur-sm">
                  <div className="opacity-80">Campus</div>
                  <div className="font-semibold truncate">{teacher.campus_name || teacher.current_campus?.campus_name || '—'}</div>
                </div>
                <div className="px-2.5 py-1.5 rounded-md bg-white/10 text-white text-xs backdrop-blur-sm">
                  <div className="opacity-80">Shift</div>
                  <div className="font-semibold truncate">{teacher.shift || teacher.working_shift || '—'}</div>
                </div>
                <div className="px-2.5 py-1.5 rounded-md bg-white/10 text-white text-xs backdrop-blur-sm">
                  <div className="opacity-80">Emp Code</div>
                  <div className="font-semibold truncate">{teacher.employee_code || '—'}</div>
                </div>
              </div>

              {/* Class Selector if multiple classes */}
              {teacherClasses.length > 1 && (
                <div className="mt-4">
                  <select
                    value={selectedClassroom?.id || ''}
                    onChange={(e) => {
                      const cls = teacherClasses.find(c => c.id.toString() === e.target.value)
                      setSelectedClassroom(cls)
                    }}
                    className="w-full bg-white/10 border border-white/30 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-white/50"
                  >
                    {teacherClasses.map((cls: any) => (
                      <option key={cls.id} value={cls.id} className="bg-gray-800 text-white">
                        {cls.name || `${cls.grade} - ${cls.section}`}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </CardContent>
          </Card>


          {/* Teacher Details */}
          <Card className="shadow-lg border-0 h-full">
            <CardHeader className="pb-2">
              <CardTitle className="text-base sm:text-lg">Teacher Details</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm">
                {teacher.email && (
                  <div className="flex items-center justify-between py-1 border-b last:border-0">
                    <span className="text-gray-500">Email</span>
                    <span className="font-semibold text-gray-800 truncate max-w-[60%] text-right">{teacher.email}</span>
                  </div>
                )}
                {(() => { const q = buildQualification(teacher); return q && q.trim().length > 0 })() && (
                  <div className="flex items-center justify-between py-1 border-b last:border-0">
                    <span className="text-gray-500">Qualification</span>
                    <span className="font-semibold text-gray-800 truncate max-w-[60%] text-right">{buildQualification(teacher)}</span>
                  </div>
                )}
                {teacher.cnic && (
                  <div className="flex items-center justify-between py-1 border-b last:border-0">
                    <span className="text-gray-500">CNIC</span>
                    <span className="font-semibold text-gray-800">{teacher.cnic}</span>
                  </div>
                )}
                {teacher.gender && (
                  <div className="flex items-center justify-between py-1 border-b last:border-0">
                    <span className="text-gray-500">Gender</span>
                    <span className="font-semibold text-gray-800 capitalize">{teacher.gender}</span>
                  </div>
                )}
                {teacher.religion && (
                  <div className="flex items-center justify-between py-1 border-b last:border-0">
                    <span className="text-gray-500">Religion</span>
                    <span className="font-semibold text-gray-800">{teacher.religion}</span>
                  </div>
                )}
                {teacher.nationality && (
                  <div className="flex items-center justify-between py-1 border-b last:border-0">
                    <span className="text-gray-500">Nationality</span>
                    <span className="font-semibold text-gray-800">{teacher.nationality}</span>
                  </div>
                )}
                {teacher.joining_date && (
                  <div className="flex items-center justify-between py-1 border-b last:border-0">
                    <span className="text-gray-500">Joining Date</span>
                    <span className="font-semibold text-gray-800">{teacher.joining_date}</span>
                  </div>
                )}
                {(teacher.date_of_birth || teacher.dob) && (
                  <div className="flex items-center justify-between py-1 border-b last:border-0">
                    <span className="text-gray-500">Date of Birth</span>
                    <span className="font-semibold text-gray-800">{teacher.date_of_birth || teacher.dob}</span>
                  </div>
                )}
                {teacher.marital_status && (
                  <div className="flex items-center justify-between py-1 border-b last:border-0">
                    <span className="text-gray-500">Marital Status</span>
                    <span className="font-semibold text-gray-800 capitalize">{teacher.marital_status}</span>
                  </div>
                )}
                {(teacher.experience_years || teacher.total_experience_years) && (
                  <div className="flex items-center justify-between py-1 border-b last:border-0">
                    <span className="text-gray-500">Experience</span>
                    <span className="font-semibold text-gray-800">{teacher.experience_years || teacher.total_experience_years} yrs</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Students of the Month */}
          <Card className="shadow-lg border-0 h-full">
            <CardHeader className="pb-2">
              <CardTitle className="text-base sm:text-lg">Students of the Month</CardTitle>
            </CardHeader>
            <CardContent>
              {studentsOfMonthLoading ? (
                <div className="flex flex-col items-center justify-center h-40 text-center text-sm text-gray-500">
                  <div className="w-10 h-10 rounded-full border-2 border-dashed border-gray-300 animate-pulse mb-2"></div>
                  Calculating top attendance...
                </div>
              ) : studentsOfMonth.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-40 text-center">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#e7ecef] to-[#a3cef1] flex items-center justify-center text-[#274c77] font-bold mb-2">🏆</div>
                  <div className="text-sm text-gray-600">We’ll showcase the top 3 students here</div>
                  <div className="text-xs text-gray-400">(Appears automatically when last month’s attendance is complete)</div>
                </div>
              ) : (
                <div className="space-y-3">
                  {studentsOfMonth.map((s, idx) => (
                    <div key={s.id} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#6096ba] to-[#a3cef1] text-white flex items-center justify-center text-xs font-bold">
                          {getInitials(s.name)}
                        </div>
                        <div className="text-sm font-semibold text-gray-800 truncate max-w-[120px]">{idx + 1}. {s.name}</div>
                      </div>
                      <div className="text-xs text-gray-600">
                        {s.present} days · <span className="font-semibold" style={{ color: colors.primary }}>{s.percentage}%</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Main Content Grid */}
        <div className="lg:col-span-2 space-y-4 sm:space-y-6">
          <div className="grid grid-cols-3 gap-3 sm:gap-4">
            <StatCard title="Present (Week)" value={`${weekBreakdown.presentPct}%`} icon={<CheckCircle className="w-4 h-4" />} tone="success" />
            <StatCard title="On Leave (Week)" value={weekLeaveCount || weekBreakdown.leaveCount} icon={<Clock className="w-4 h-4" />} tone="secondary" />
            <StatCard title="Absent (Week)" value={`${weekBreakdown.absentPct}%`} icon={<AlertCircle className="w-4 h-4" />} tone="danger" />
          </div>
          {/* Attendance + Trend in one row (2 columns) */}
          <div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 items-stretch">
              {/* Attendance Card */}
              <Card className="shadow-lg border-0 h-full">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base sm:text-lg">Class Attendence Overview</CardTitle>
                    <div className="flex items-center gap-2">
                      <div className="hidden sm:block text-xs text-gray-500 mr-2">{getSelectedWeekRangeLabel()}</div>
                      <Button size="sm" variant="outline" className="h-7 px-2" onClick={() => setWeekOffset(weekOffset + 1)}>
                        ◀ Prev
                      </Button>
                      <Button size="sm" variant="outline" className="h-7 px-2" disabled={weekOffset === 0} onClick={() => setWeekOffset(Math.max(weekOffset - 1, 0))}>
                        Next ▶
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="min-h-[420px]">
                  {attendanceLoading ? (
                    <div className="text-center py-8">
                      <LoadingSpinner message="Loading attendance..." />
                    </div>
                  ) : (
                    <>
                      <div className="mb-5">
                        {/* Legend */}
                        <div className="flex items-center justify-center gap-3 mb-4">
                          <span className="inline-flex items-center gap-2 rounded-full bg-green-50 text-green-700 px-3 py-1 text-xs border border-green-200">
                            <span className="w-2.5 h-2.5 rounded-full bg-green-500" /> Present
                          </span>
                          <span className="inline-flex items-center gap-2 rounded-full bg-red-50 text-red-700 px-3 py-1 text-xs border border-red-200">
                            <span className="w-2.5 h-2.5 rounded-full bg-red-500" /> Absent
                          </span>
                          <span className="inline-flex items-center gap-2 rounded-full bg-amber-50 text-amber-700 px-3 py-1 text-xs border border-amber-200">
                            <span className="w-2.5 h-2.5 rounded-full bg-amber-500" /> Leave
                          </span>
                        </div>
                        {/* Last 7 days chips with tri-color proportions */}
                        <div className="flex justify-center gap-2 sm:gap-3 mb-2">
                          {last7Days.map((day, idx) => {
                            const present = day.present || 0
                            const leave = (day as any).leave || 0
                            const absent = (day as any).absent || Math.max(0, 100 - present - leave)
                            const bg = `conic-gradient(${colors.success} 0 ${present}%, #f59e0b ${present}% ${present + leave}%, ${colors.danger} ${present + leave}% 100%)`
                            return (
                              <div
                                key={idx}
                                className="relative group w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center text-white text-xs font-bold shadow-sm ring-1 ring-black/5"
                                style={{ background: bg }}
                              >
                                {day.day[0]}
                                {/* Fancy tooltip */}
                                <div className="absolute -top-12 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-150">
                                  <div className="bg-white text-gray-700 text-[10px] sm:text-[11px] font-medium rounded-md shadow-lg px-2.5 py-1.5 border border-gray-200 whitespace-nowrap">
                                    <span className="font-semibold mr-1">{day.day}:</span>
                                    <span className="inline-flex items-center mr-2"><span className="w-2 h-2 rounded-full mr-1" style={{ background: colors.success }}></span>{present}%</span>
                                    <span className="inline-flex items-center mr-2"><span className="w-2 h-2 rounded-full mr-1 bg-amber-500"></span>{leave}%</span>
                                    <span className="inline-flex items-center"><span className="w-2 h-2 rounded-full mr-1" style={{ background: colors.danger }}></span>{absent}%</span>
                                  </div>
                                  <div className="mx-auto w-2 h-2 bg-white border border-gray-200 rotate-45 -mt-1"></div>
                                </div>
                              </div>
                            )
                          })}
                        </div>
                        <p className="text-[11px] text-gray-500 text-center">Week: {getSelectedWeekRangeLabel()}</p>
                      </div>

                      {/* Donut */}
                      <div className="relative mx-auto w-36 h-36 sm:w-44 sm:h-44">
                        <svg className="w-full h-full transform -rotate-90 drop-shadow-sm">
                          <circle cx="88" cy="88" r="70" stroke="#e5e7eb" strokeWidth="10" fill="none" />
                          <circle cx="88" cy="88" r="70" stroke="#ef4444" strokeWidth="10" fill="none" strokeDasharray={`${((100 - weekAttendancePercentage) / 100) * 440} 440`} />
                          <circle cx="88" cy="88" r="70" stroke={colors.success} strokeWidth="10" fill="none" strokeDasharray={`${(weekAttendancePercentage / 100) * 440} 440`} strokeLinecap="round" />
                        </svg>
                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                          <span className="text-xs text-gray-500">Attendance</span>
                          <span className="text-3xl font-bold" style={{ color: colors.primary }}>{weekAttendancePercentage}%</span>
                        </div>
                      </div>

                      {/* Weekly stats summary */}
                      {todayAttendance && (
                        <div className="mt-6 grid grid-cols-3 gap-4">
                          <div className="text-center rounded-lg bg-green-50 py-3 border border-green-100">
                            <div className="text-xl font-bold text-green-600">{weekBreakdown.presentPct}%</div>
                            <div className="text-xs text-green-700">Present (Week)</div>
                          </div>
                          <div className="text-center rounded-lg bg-amber-50 py-3 border border-amber-100">
                            <div className="text-xl font-bold text-amber-600">{weekLeaveCount || weekBreakdown.leaveCount}</div>
                            <div className="text-xs text-amber-700">On Leave (Week)</div>
                          </div>
                          <div className="text-center rounded-lg bg-red-50 py-3 border border-red-100">
                            <div className="text-xl font-bold text-red-600">{weekBreakdown.absentPct}%</div>
                            <div className="text-xs text-red-700">Absent (Week)</div>
                          </div>
                        </div>
                      )}
                    </>
                  )}
                </CardContent>
              </Card>

              <Card className="shadow-lg border-0 h-full">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base sm:text-lg">Attendance Trend Of Class {selectedClassroom?.name}</CardTitle>
                    <div className="flex items-center gap-2">
                      <select
                        value={trendRange}
                        onChange={(e) => setTrendRange(e.target.value as any)}
                        className="border rounded-md text-xs px-2 py-1"
                      >
                        <option value="7d">Last 7 Days</option>
                        <option value="15d">Last 15 Days</option>
                        <option value="30d">Last 30 Days</option>
                      </select>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="min-h-[420px] flex flex-col">
                  {trendData.length === 0 ? (
                    <p className="text-sm text-gray-500 text-center py-6">No trend data available</p>
                  ) : (
                    <div className="w-full flex-1 flex flex-col">
                      <div className="flex-1">
                        <ResponsiveContainer width="100%" height="100%">
                          <LineChart data={trendData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#a3cef1" opacity={0.3} />
                            <XAxis dataKey="label" stroke="#274c77" fontSize={12} tickLine={false} axisLine={false} />
                            <YAxis
                              stroke="#274c77"
                              fontSize={12}
                              tickLine={false}
                              axisLine={false}
                              allowDecimals={false}
                              domain={[0, 150]}
                              ticks={[20, 40, 60, 80, 100, 120, 140]}
                            />
                            <Tooltip contentStyle={{ backgroundColor: '#ffffff', border: '2px solid #6096ba', borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} labelStyle={{ color: '#274c77', fontWeight: 'bold' }} formatter={(v: any) => [`${v}%`, `Attendance`]} />
                            <Line type="monotone" dataKey="pct" stroke={colors.secondary} strokeWidth={4} dot={{ r: 5, fill: colors.secondary }} name="Attendance %" />
                          </LineChart>
                        </ResponsiveContainer>
                      </div>
                      <div className="text-xs text-gray-600 mt-2">Showing daily attendance percentage</div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// Helper Component

export default function TeacherProfilePage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-screen">Loading...</div>}>
      <TeacherProfileContent />
    </Suspense>
  )
}


function StatCard({ title, value, icon, tone }: { title: string, value: string | number, icon: React.ReactNode, tone?: 'primary' | 'secondary' | 'success' | 'danger' }) {
  const toneColor = tone === 'success' ? '#10b981' : tone === 'danger' ? '#ef4444' : tone === 'secondary' ? '#6096ba' : '#274c77'
  return (
    <div className="rounded-xl bg-white shadow-sm border border-gray-100 p-3 sm:p-4 flex items-center gap-3">
      <div className="w-8 h-8 rounded-md flex items-center justify-center text-white" style={{ backgroundColor: toneColor }}>
        {icon}
      </div>
      <div className="min-w-0">
        <div className="text-[11px] uppercase tracking-wide text-gray-500">{title}</div>
        <div className="text-lg sm:text-xl font-bold text-gray-900 truncate">{value}</div>
      </div>
    </div>
  )
}
