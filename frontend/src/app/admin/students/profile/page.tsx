"use client"

import { useState, useEffect, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { getAllStudents, getStudentById } from "@/lib/api"
import { ArrowLeft, User, GraduationCap, Users, Calendar, BookOpen, RefreshCw, Download, Share, Phone, MapPin } from "lucide-react"
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, LineChart, Line, PieChart, Pie, Cell, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts'
import { LoadingSpinner } from "@/components/ui/loading-spinner"

// Theme colors - IAK SMS Brand Colors
const themeColors = {
  primary: '#274c77',      // Dark Blue
  secondary: '#6096ba',    // Medium Blue  
  accent: '#a3cef1',       // Light Blue
  success: '#16a34a',      // Green
  warning: '#f59e0b',      // Orange
  error: '#dc2626',        // Red
  info: '#3b82f6',         // Blue
  purple: '#9333ea',       // Purple
  pink: '#ec4899',         // Pink
  gray: '#6b7280'          // Gray
}

// Helper functions moved outside component
const generateRealPerformanceData = (student: any, results: any[]) => {
  if (!results || results.length === 0) {
    // Fallback to basic data if no results available
    return [
      { subject: 'Urdu', grade: 0, total: 100, color: themeColors.primary },
      { subject: 'English', grade: 0, total: 100, color: themeColors.secondary },
      { subject: 'Mathematics', grade: 0, total: 100, color: themeColors.success },
      { subject: 'Science', grade: 0, total: 100, color: themeColors.warning },
      { subject: 'Islamiat', grade: 0, total: 100, color: themeColors.purple },
      { subject: 'Computer Science', grade: 0, total: 100, color: themeColors.info },
    ]
  }

  // Get latest result
  const latestResult = results[0]
  const subjectMarks = latestResult.subject_marks || []
  
  return subjectMarks.map((mark: any) => ({
    subject: mark.subject_name.charAt(0).toUpperCase() + mark.subject_name.slice(1).replace('_', ' '),
    grade: Math.round(mark.obtained_marks || 0),
    total: Math.round(mark.total_marks || 100),
    color: themeColors.primary
  }))
}

const generateMonthlyAttendanceData = (attendanceRecords: any[]) => {
  if (!attendanceRecords || attendanceRecords.length === 0) {
    return [
      { month: 'Jan', attendance: 0, present: 0, absent: 0 },
      { month: 'Feb', attendance: 0, present: 0, absent: 0 },
      { month: 'Mar', attendance: 0, present: 0, absent: 0 },
      { month: 'Apr', attendance: 0, present: 0, absent: 0 },
      { month: 'May', attendance: 0, present: 0, absent: 0 },
      { month: 'Jun', attendance: 0, present: 0, absent: 0 },
    ]
  }

  // Group attendance by month
  const monthlyData: { [key: string]: { present: number, absent: number, total: number } } = {}
  
  attendanceRecords.forEach(record => {
    const month = new Date(record.attendance?.date || record.date).toLocaleDateString('en-US', { month: 'short' })
    if (!monthlyData[month]) {
      monthlyData[month] = { present: 0, absent: 0, total: 0 }
    }
    
    if (record.status === 'present') {
      monthlyData[month].present++
    } else if (record.status === 'absent') {
      monthlyData[month].absent++
    }
    monthlyData[month].total++
  })

  return Object.entries(monthlyData).map(([month, data]) => ({
    month,
    attendance: data.total > 0 ? Math.round((data.present / data.total) * 100) : 0,
    present: data.present,
    absent: data.absent
  }))
}

const generateBehaviorData = (behaviorRecords: any[]) => {
  return [
    { subject: 'Discipline', A: 85, fullMark: 100 },
    { subject: 'Participation', A: 90, fullMark: 100 },
    { subject: 'Cooperation', A: 88, fullMark: 100 },
    { subject: 'Respect', A: 92, fullMark: 100 },
    { subject: 'Responsibility', A: 87, fullMark: 100 },
    { subject: 'Leadership', A: 83, fullMark: 100 },
  ]
}

function StudentProfileContent() {
  // All hooks must be called at the top level, before any conditional returns
  const [mounted, setMounted] = useState(false)
  const [student, setStudent] = useState<any | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  const router = useRouter()
  const params = useSearchParams()
  const studentId = params?.get("id") || ""
  
  // Early return for missing studentId
  if (!studentId) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Student Not Found</h2>
          <p className="text-gray-600 mb-4">No student ID provided</p>
          <Button onClick={() => router.back()}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Go Back
          </Button>
        </div>
      </div>
    )
  }

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!mounted || !studentId) return

    const fetchStudentData = async () => {
      try {
        setLoading(true)
        setError(null)
        
        const studentData = await getStudentById(studentId)
        if (studentData) {
          setStudent(studentData)
        } else {
          setError('Student not found')
        }
      } catch (err) {
        console.error('Error fetching student:', err)
        setError('Failed to load student data')
      } finally {
      setLoading(false)
    }
    }

    fetchStudentData()
  }, [mounted, studentId])

  if (!mounted) {
    return <LoadingSpinner />
  }

  if (loading) {
    return <LoadingSpinner />
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-red-600 mb-4">Error</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <Button onClick={() => router.back()}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Go Back
              </Button>
        </div>
      </div>
    )
  }

  if (!student) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Student Not Found</h2>
          <p className="text-gray-600 mb-4">The requested student could not be found</p>
          <Button onClick={() => router.back()}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Go Back
          </Button>
        </div>
      </div>
    )
  }

  // Generate data for charts
  const performanceData = generateRealPerformanceData(student, [])
  const attendanceData = generateMonthlyAttendanceData([])
  const behaviorData = generateBehaviorData([])

  // Calculate metrics
  const overallScore = Math.round(performanceData.reduce((sum: number, item: any) => sum + item.grade, 0) / performanceData.length) || 0
  const attendanceRate = Math.round(attendanceData.reduce((sum: number, item: any) => sum + item.attendance, 0) / attendanceData.length) || 0
  const academicAverage = overallScore
  const profileCompleteness = student ? (() => {
    // Calculate profile completeness based on key fields
    const keyFields = ['name', 'father_name', 'father_contact', 'emergency_contact', 'gender', 'dob', 'current_grade', 'section', 'campus']
    const filledFields = keyFields.filter(field => student[field] !== null && student[field] !== '' && student[field] !== undefined)
    return Math.round((filledFields.length / keyFields.length) * 100)
  })() : 0

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-4">
                <Button
              variant="ghost" 
              size="sm" 
                  onClick={() => router.back()}
              className="text-gray-600 hover:text-gray-900"
                >
              <ArrowLeft className="w-4 h-4 mr-2" />
                  Back
                </Button>
                <div>
              <h1 className="text-2xl font-bold text-gray-900">{student?.name || 'Student Profile'}</h1>
              <p className="text-gray-600">Student ID: {student?.gr_no || studentId}</p>
            </div>
          </div>
          <div className="flex space-x-2">
            <Button variant="outline" size="sm">
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
            <Button variant="outline" size="sm">
              <Share className="w-4 h-4 mr-2" />
              Share
            </Button>
                      </div>
                    </div>

        {/* Student Info Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="bg-white shadow-sm border" style={{ borderColor: themeColors.accent }}>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg font-medium" style={{ color: themeColors.primary }}>Basic Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <User className="w-5 h-5 text-gray-500" />
                      <div>
                    <div className="font-medium">{student?.name || 'N/A'}</div>
                    <div className="text-sm text-gray-500">Full Name</div>
                          </div>
                        </div>
                <div className="flex items-center space-x-3">
                  <GraduationCap className="w-5 h-5 text-gray-500" />
                  <div>
                    <div className="font-medium">{student?.current_grade || 'N/A'}</div>
                    <div className="text-sm text-gray-500">Current Grade</div>
                  </div>
                        </div>
                <div className="flex items-center space-x-3">
                  <Users className="w-5 h-5 text-gray-500" />
                  <div>
                    <div className="font-medium">{student?.section || 'N/A'}</div>
                    <div className="text-sm text-gray-500">Section</div>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <MapPin className="w-5 h-5 text-gray-500" />
                  <div>
                    <div className="font-medium">{student?.campus_name || student?.campus?.campus_name || 'N/A'}</div>
                    <div className="text-sm text-gray-500">Campus</div>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <Phone className="w-5 h-5 text-gray-500" />
                  <div>
                    <div className="font-medium">{student?.father_contact || student?.emergency_contact || 'N/A'}</div>
                    <div className="text-sm text-gray-500">Contact</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white shadow-sm border" style={{ borderColor: themeColors.accent }}>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg font-medium" style={{ color: themeColors.primary }}>Academic Performance</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="text-center">
                  <div className="text-3xl font-bold mb-1" style={{ color: themeColors.primary }}>{overallScore}%</div>
                  <div className="text-sm" style={{ color: themeColors.gray }}>Overall Score</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold mb-1" style={{ color: themeColors.success }}>{attendanceRate}%</div>
                  <div className="text-sm" style={{ color: themeColors.gray }}>Attendance Rate</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white shadow-sm border" style={{ borderColor: themeColors.accent }}>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg font-medium" style={{ color: themeColors.primary }}>Profile Status</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center">
                <div className="text-3xl font-bold mb-2" style={{ color: themeColors.warning }}>{profileCompleteness}%</div>
                <div className="text-sm" style={{ color: themeColors.gray }}>Profile Completeness</div>
                <div className="mt-3 p-2 rounded-lg text-center" style={{ backgroundColor: `${themeColors.success}20` }}>
                  <div className="text-sm font-medium" style={{ color: themeColors.success }}>
                    {profileCompleteness >= 80 ? 'Complete' : profileCompleteness >= 60 ? 'Good' : 'Needs Update'}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Charts Section */}
        <div className="mt-6 sm:mt-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 lg:gap-8">
            {/* Monthly Attendance Trend */}
            <Card className="bg-white shadow-sm border" style={{ borderColor: themeColors.accent }}>
              <CardHeader className="pb-2 sm:pb-3">
                <CardTitle className="text-base sm:text-lg font-medium" style={{ color: themeColors.primary }}>Monthly Attendance Trend</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-48 sm:h-56 md:h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={attendanceData}>
                      <CartesianGrid strokeDasharray="3 3" stroke={themeColors.accent} />
                      <XAxis dataKey="month" stroke={themeColors.gray} fontSize={12} />
                      <YAxis domain={[0, 100]} stroke={themeColors.gray} fontSize={12} />
                      <Tooltip />
                      <Line type="monotone" dataKey="attendance" stroke={themeColors.success} strokeWidth={2} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Behavior & Participation Radar Chart */}
            <Card className="bg-white shadow-sm border" style={{ borderColor: themeColors.accent }}>
              <CardHeader className="pb-2 sm:pb-3">
                <CardTitle className="text-base sm:text-lg font-medium" style={{ color: themeColors.primary }}>Behavior & Participation</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-48 sm:h-56 md:h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <RadarChart data={behaviorData}>
                      <PolarGrid />
                      <PolarAngleAxis dataKey="subject" fontSize={10} />
                      <PolarRadiusAxis domain={[0, 100]} fontSize={10} />
                      <Radar
                        name="Performance"
                        dataKey="A"
                        stroke={themeColors.primary}
                        fill={themeColors.primary}
                        fillOpacity={0.3}
                      />
                    </RadarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Performance Summary */}
          <div className="mt-8">
            <Card className="bg-white shadow-sm border" style={{ borderColor: themeColors.accent }}>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg font-medium" style={{ color: themeColors.primary }}>Performance Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                  <div className="text-center">
                    <div className="text-3xl font-bold mb-2" style={{ color: themeColors.primary }}>{overallScore}%</div>
                    <div className="text-sm" style={{ color: themeColors.gray }}>Overall Score</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold mb-2" style={{ color: themeColors.success }}>{attendanceRate}%</div>
                    <div className="text-sm" style={{ color: themeColors.gray }}>Attendance Rate</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold mb-2" style={{ color: themeColors.purple }}>{academicAverage}%</div>
                    <div className="text-sm" style={{ color: themeColors.gray }}>Academic Average</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold mb-2" style={{ color: themeColors.warning }}>{profileCompleteness}%</div>
                    <div className="text-sm" style={{ color: themeColors.gray }}>Profile Completeness</div>
                  </div>
                </div>
                <div className="mt-6 p-4 rounded-lg text-center" style={{ backgroundColor: `${themeColors.success}20` }}>
                  <div className="text-2xl font-bold mb-1" style={{ color: themeColors.success }}>
                    {overallScore >= 80 ? 'Excellent' : overallScore >= 60 ? 'Good' : 'Needs Improvement'}
                  </div>
                  <div className="text-sm" style={{ color: themeColors.gray }}>Performance Rating</div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function StudentProfilePage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-screen">Loading...</div>}>
      <StudentProfileContent />
    </Suspense>
  )
}

