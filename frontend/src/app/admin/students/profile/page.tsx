"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { apiGet, getAllStudents, getStudentById } from "@/lib/api"
import { ArrowLeft, User, Phone, MapPin, GraduationCap, Users, Calendar, Award, BookOpen, TrendingUp, Star, Crown, Sparkles, Trophy, Medal, Target, Activity, Clock, Mail, Home, School, CheckCircle, AlertCircle, BarChart3, PieChart as PieChartIcon, LineChart as LineChartIcon, RefreshCw, Download, Share } from "lucide-react"
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

// Real data generation based on actual student information
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

const generateWeeklyPerformanceData = (results: any[]) => {
  if (!results || results.length === 0) {
    return [
      { week: 'Week 1', subject: 'Urdu', score: 0 },
      { week: 'Week 1', subject: 'English', score: 0 },
      { week: 'Week 1', subject: 'Mathematics', score: 0 },
      { week: 'Week 1', subject: 'Science', score: 0 },
      { week: 'Week 2', subject: 'Urdu', score: 0 },
      { week: 'Week 2', subject: 'English', score: 0 },
      { week: 'Week 2', subject: 'Mathematics', score: 0 },
      { week: 'Week 2', subject: 'Science', score: 0 },
    ]
  }

  // Group results by week and subject
  const weeklyData: { [key: string]: { [subject: string]: number } } = {}
  
  results.forEach(result => {
    const date = new Date(result.created_at)
    const weekNumber = Math.ceil(date.getDate() / 7)
    const weekKey = `Week ${weekNumber}`
    
    if (!weeklyData[weekKey]) {
      weeklyData[weekKey] = {}
    }
    
    result.subject_marks.forEach((mark: any) => {
      const subjectName = mark.subject_name.charAt(0).toUpperCase() + mark.subject_name.slice(1).replace('_', ' ')
      weeklyData[weekKey][subjectName] = Math.round(mark.obtained_marks || 0)
    })
  })

  // Convert to array format for chart
  const chartData: any[] = []
  Object.entries(weeklyData).forEach(([week, subjects]) => {
    Object.entries(subjects).forEach(([subject, score]) => {
      chartData.push({ week, subject, score })
    })
  })

  return chartData
}

const generateGradeDistributionData = (results: any[]) => {
  if (!results || results.length === 0) {
    return [
      { grade: 'A+', count: 0, percentage: 0 },
      { grade: 'A', count: 0, percentage: 0 },
      { grade: 'B', count: 0, percentage: 0 },
      { grade: 'C', count: 0, percentage: 0 },
      { grade: 'D', count: 0, percentage: 0 },
      { grade: 'F', count: 0, percentage: 0 },
    ]
  }

  // Count grades from all results
  const gradeCount: { [key: string]: number } = {}
  results.forEach(result => {
    const grade = result.grade || 'F'
    gradeCount[grade] = (gradeCount[grade] || 0) + 1
  })

  const totalResults = results.length
  const colors = ['#274c77', '#6096ba', '#a3cef1', '#8b8c89', '#e7ecef', '#dc2626']

  return Object.entries(gradeCount).map(([grade, count], index) => ({
    grade,
    count,
    percentage: Math.round((count / totalResults) * 100),
    color: colors[index % colors.length]
  }))
}

const generateBehaviorData = (student: any, results: any[], attendanceRecords: any[]) => {
  // Calculate behavior metrics based on real data
  const attendanceRate = attendanceRecords.length > 0 
    ? (attendanceRecords.filter(r => r.status === 'present').length / attendanceRecords.length) * 100 
    : 0

  const academicPerformance = results.length > 0 
    ? results.reduce((acc, result) => acc + (result.percentage || 0), 0) / results.length 
    : 0

  const profileCompleteness = (() => {
    const profileFields = ['name', 'gender', 'dob', 'father_name', 'father_contact', 'emergency_contact', 'current_grade', 'section', 'campus']
    const completedFields = profileFields.filter(field => student[field]).length
    return (completedFields / profileFields.length) * 100
  })()

  // Calculate discipline score (based on attendance and profile completeness)
  const discipline = Math.round((attendanceRate * 0.7) + (profileCompleteness * 0.3))

  // Calculate homework score (based on academic performance)
  const homework = Math.round(academicPerformance)

  // Calculate class participation (based on attendance and academic performance)
  const participation = Math.round((attendanceRate * 0.6) + (academicPerformance * 0.4))

  // Calculate teamwork (based on overall performance)
  const teamwork = Math.round((academicPerformance * 0.5) + (profileCompleteness * 0.5))

  return [
    { subject: 'Discipline', A: discipline, fullMark: 100 },
    { subject: 'Homework', A: homework, fullMark: 100 },
    { subject: 'Participation', A: participation, fullMark: 100 },
    { subject: 'Teamwork', A: teamwork, fullMark: 100 },
  ]
}


const calculateRealOverallScore = (student: any, results: any[], attendanceRecords: any[]) => {
  let score = 0
  let factors = 0

  // Academic performance (40% weight)
  if (results && results.length > 0) {
    const latestResult = results[0]
    score += (latestResult.percentage || 0) * 0.4
    factors += 0.4
  }

  // Attendance (30% weight)
  if (attendanceRecords && attendanceRecords.length > 0) {
    const presentCount = attendanceRecords.filter(r => r.status === 'present').length
    const totalCount = attendanceRecords.length
    const attendanceRate = totalCount > 0 ? (presentCount / totalCount) * 100 : 0
    score += attendanceRate * 0.3
    factors += 0.3
  }

  // Profile completeness (30% weight)
  const profileFields = [
    'name', 'gender', 'dob', 'father_name', 'father_contact', 
    'emergency_contact', 'current_grade', 'section', 'campus'
  ]
  const completedFields = profileFields.filter(field => student[field]).length
  const completenessRate = (completedFields / profileFields.length) * 100
  score += completenessRate * 0.3
  factors += 0.3

  return factors > 0 ? Math.round(score / factors) : 0
}


export default function StudentProfilePage() {
  useEffect(() => {
    document.title = "Student Profile | IAK SMS";
  }, []);
  
  const router = useRouter()
  const params = useSearchParams()
  const studentId = params?.get("id") || ""
  const [student, setStudent] = useState<any>(null)
  const [students, setStudents] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [attendanceData, setAttendanceData] = useState<any[]>([])
  const [weeklyPerformanceData, setWeeklyPerformanceData] = useState<any[]>([])
  const [gradeDistributionData, setGradeDistributionData] = useState<any[]>([])
  const [behaviorData, setBehaviorData] = useState<any[]>([])
  const [results, setResults] = useState<any[]>([])
  const [attendanceRecords, setAttendanceRecords] = useState<any[]>([])
  const [overallScore, setOverallScore] = useState(0)
  const [attendanceRate, setAttendanceRate] = useState(0)
  const [academicAverage, setAcademicAverage] = useState(0)
  const [profileCompleteness, setProfileCompleteness] = useState(0)
  const [canEdit, setCanEdit] = useState(false)

  useEffect(() => {
    async function fetchData() {
      if (!studentId) {
        setError('No student ID provided');
        setLoading(false);
        return;
      }
      
      setLoading(true);
      setError(null);
      
      // Add timeout to prevent infinite loading
      const timeoutId = setTimeout(() => {
        setError('Request timeout - please try again');
        setLoading(false);
      }, 10000);
      
      try {
        const [studentData, allStudents, resultsData, attendanceData] = await Promise.all([
          getStudentById(studentId),
          getAllStudents(),
          fetch(`http://127.0.0.1:8000/api/students/${studentId}/results/`, {
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('sis_token')}`,
              'Content-Type': 'application/json'
            }
          }).then(res => res.ok ? res.json() : []).catch(() => []),
          fetch(`http://127.0.0.1:8000/api/students/${studentId}/attendance/`, {
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('sis_token')}`,
              'Content-Type': 'application/json'
            }
          }).then(res => res.ok ? res.json() : []).catch(() => [])
        ])
        
        clearTimeout(timeoutId); // Clear timeout if request succeeds
        
        if (!studentData) {
          // Fallback: try to find student in allStudents list
          const fallbackStudent = allStudents?.find((s: any) => s.id === Number(studentId));
          if (fallbackStudent) {
            setStudent(fallbackStudent);
          } else {
            setError('Student not found');
            return;
          }
        } else {
          setStudent(studentData)
        }
        setStudents(Array.isArray(allStudents) ? allStudents : [])
        setResults(Array.isArray(resultsData) ? resultsData : [])
        setAttendanceRecords(Array.isArray(attendanceData) ? attendanceData : [])
        
        // Generate real data based on actual student information
        const currentStudent = studentData || allStudents?.find((s: any) => s.id === Number(studentId));
        if (currentStudent) {
          // Generate monthly attendance data from real records
          setAttendanceData(generateMonthlyAttendanceData(attendanceData))
          
          // Generate weekly performance data from real results
          setWeeklyPerformanceData(generateWeeklyPerformanceData(resultsData))
          
          // Generate grade distribution data
          setGradeDistributionData(generateGradeDistributionData(resultsData))
          
          // Generate behavior data
          setBehaviorData(generateBehaviorData(currentStudent, resultsData, attendanceData))
          
          // Calculate real overall score
          setOverallScore(calculateRealOverallScore(currentStudent, resultsData, attendanceData))
          
          // Calculate attendance rate
          if (attendanceData && attendanceData.length > 0) {
            const presentCount = attendanceData.filter((r: any) => r.status === 'present').length
            const totalCount = attendanceData.length
            setAttendanceRate(totalCount > 0 ? Math.round((presentCount / totalCount) * 100) : 0)
          }
          
          // Calculate academic average
          if (resultsData && resultsData.length > 0) {
            const latestResult = resultsData[0]
            setAcademicAverage(Math.round(latestResult.percentage || 0))
          }
          
          // Calculate profile completeness
          const profileFields = [
            'name', 'gender', 'dob', 'father_name', 'father_contact', 
            'emergency_contact', 'current_grade', 'section', 'campus'
          ]
          const completedFields = profileFields.filter(field => currentStudent[field]).length
          setProfileCompleteness(Math.round((completedFields / profileFields.length) * 100))
        }
        
      } catch (err: any) {
        clearTimeout(timeoutId); // Clear timeout on error
        console.error("Error fetching student:", err)
        setError(err.message || "Failed to load student")
      } finally {
      setLoading(false)
    }
    }
    fetchData()
  }, [studentId])

  useEffect(() => {
    // role-gated: teacher or coordinator can edit
    if (typeof window !== 'undefined') {
      try {
        const uStr = window.localStorage.getItem('sis_user')
        if (uStr) {
          const u = JSON.parse(uStr)
          const role = String(u?.role || '').toLowerCase()
          setCanEdit(role.includes('teach') || role.includes('coord'))
        }
      } catch { }
    }
  }, [])


  if (loading) {
    return <LoadingSpinner message="Loading Student Profile..." fullScreen />
  }

  if (error || !student) {
    return (
      <div className="min-h-screen" style={{ backgroundColor: '#e7ecef' }}>
        <div className="max-w-md mx-auto pt-20">
          <Card style={{ backgroundColor: '#a3cef1', borderColor: '#6096ba' }}>
            <CardHeader>
              <CardTitle style={{ color: '#274c77' }}>Error</CardTitle>
            </CardHeader>
            <CardContent>
              <div style={{ color: '#274c77' }}>{error || "Student not found"}</div>
              <Button 
                onClick={() => router.back()} 
                className="mt-4"
                style={{ backgroundColor: '#274c77', color: 'white' }}
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Go back
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  const renderValue = (value: any) => {
    if (value === null || value === undefined || value === "") return "Not provided"
    if (typeof value === 'boolean') return value ? 'Yes' : 'No'
    return String(value)
  }

  // Calculate averages for display
  const attendanceAvg = attendanceData.length > 0 ? attendanceData.reduce((acc, curr) => acc + curr.attendance, 0) / attendanceData.length : 0;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="p-2 sm:p-4 md:p-6 max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="mb-8">
          {/* Top Navigation Bar */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-3 sm:p-4 mb-4 sm:mb-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-2 sm:space-y-0 sm:space-x-4">
                <Button
                  onClick={() => router.back()}
                  variant="outline"
                  size="sm"
                  className="hover:bg-gray-50 border-gray-300 text-gray-700"
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back
                </Button>
                <div className="hidden sm:block h-6 w-px bg-gray-300"></div>
                <div>
                  <h1 className="text-lg sm:text-xl font-semibold text-gray-900">
                    Student Profile
                  </h1>
                  <p className="text-xs sm:text-sm text-gray-500">
                    Comprehensive student information and analytics
                  </p>
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="hover:bg-gray-50 border-gray-300 text-gray-700 text-xs sm:text-sm"
                >
                  <RefreshCw className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                  <span className="hidden sm:inline">Refresh</span>
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="hover:bg-gray-50 border-gray-300 text-gray-700 text-xs sm:text-sm"
                >
                  <Share className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                  <span className="hidden sm:inline">Share</span>
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="hover:bg-gray-50 border-gray-300 text-gray-700 text-xs sm:text-sm"
                >
                  <Download className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                  <span className="hidden sm:inline">Export</span>
                </Button>
              </div>
            </div>
          </div>

          {/* Student Profile Header Card */}
          <Card className="bg-gradient-to-r from-blue-50 via-blue-100 to-blue-200 border border-blue-300 shadow-lg overflow-hidden" style={{ background: `linear-gradient(135deg, ${themeColors.accent}20, ${themeColors.secondary}20, ${themeColors.primary}20)` }}>
            <CardContent className="p-0">
              <div className="p-3 sm:p-4 md:p-6">
                <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 lg:gap-6">
                  {/* Left Section - Student Info */}
                  <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-4 sm:space-y-0 sm:space-x-6">
                    {/* Student Avatar */}
                    <div className="relative">
                      <div className="w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 rounded-xl bg-white shadow-lg flex items-center justify-center border-2" style={{ borderColor: themeColors.secondary }}>
                        {student.photo ? (
                          <img
                            src={student.photo}
                            alt={student.name}
                            className="w-14 h-14 sm:w-16 sm:h-16 md:w-20 md:h-20 rounded-lg object-cover"
                          />
                        ) : (
                          <span className="text-xl sm:text-2xl md:text-3xl font-bold" style={{ color: themeColors.primary }}>{student.name?.[0]?.toUpperCase()}</span>
                        )}
                      </div>
                      <div className="absolute -bottom-1 -right-1 sm:-bottom-2 sm:-right-2 w-6 h-6 sm:w-8 sm:h-8 rounded-full border-2 sm:border-4 border-white flex items-center justify-center shadow-lg" style={{ backgroundColor: themeColors.success }}>
                        <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4 text-white" />
                      </div>
                    </div>

                    {/* Student Details */}
                    <div className="space-y-2 sm:space-y-3">
                      <div>
                        <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 mb-1 sm:mb-2">{student.name}</h2>
                        <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-4 md:space-x-6 text-xs sm:text-sm text-gray-600">
                          <div className="flex items-center space-x-2">
                            <User className="h-3 w-3 sm:h-4 sm:w-4" style={{ color: themeColors.primary }} />
                            <span className="font-medium">ID: {student.id}</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <GraduationCap className="h-3 w-3 sm:h-4 sm:w-4" style={{ color: themeColors.success }} />
                            <span className="font-medium">{student.current_grade || 'N/A'}</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <BookOpen className="h-3 w-3 sm:h-4 sm:w-4" style={{ color: themeColors.purple }} />
                            <span className="font-medium">GR: {student.gr_no || 'None'}</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-4">
                        <div className="flex items-center space-x-2 text-xs sm:text-sm text-gray-600">
                          <Users className="h-3 w-3 sm:h-4 sm:w-4" style={{ color: themeColors.pink }} />
                          <span className="font-medium">{student.gender || 'N/A'}</span>
                        </div>
                        <Badge 
                          variant={student?.current_state?.toLowerCase() === 'active' ? 'default' : 'secondary'}
                          className={`px-2 py-1 sm:px-3 sm:py-1 text-xs font-medium ${
                            student?.current_state?.toLowerCase() === 'active'
                              ? 'text-white border-0'
                              : 'bg-gray-100 text-gray-800 border-gray-200'
                          }`}
                          style={student?.current_state?.toLowerCase() === 'active' ? { backgroundColor: themeColors.success } : {}}
                        >
                          {student?.current_state || 'Unknown'}
                        </Badge>
                      </div>
                    </div>
                  </div>

                  {/* Right Section - Overall Score */}
                  <div className="text-center w-full sm:w-auto">
                    <div className="bg-white rounded-xl p-4 sm:p-6 shadow-lg border" style={{ borderColor: themeColors.secondary }}>
                      <div className="flex items-center justify-center mb-2 sm:mb-3">
                        <div className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center" style={{ background: `linear-gradient(135deg, ${themeColors.primary}, ${themeColors.secondary})` }}>
                          <Trophy className="h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6 text-white" />
                        </div>
                      </div>
                      <div className="text-2xl sm:text-3xl font-bold mb-1" style={{ color: themeColors.primary }}>{overallScore}%</div>
                      <div className="text-xs sm:text-sm font-medium" style={{ color: themeColors.gray }}>Overall Score</div>
                      <div className="mt-2 w-12 sm:w-16 h-1 bg-gray-200 rounded-full mx-auto">
                        <div 
                          className="h-1 rounded-full transition-all duration-300"
                          style={{ 
                            width: `${overallScore}%`,
                            background: `linear-gradient(90deg, ${themeColors.primary}, ${themeColors.secondary})`
                          }}
                        ></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-2 sm:gap-4 mb-6 sm:mb-8">
          <Card className="bg-white shadow-sm border" style={{ borderColor: themeColors.accent }}>
            <CardContent className="p-3 sm:p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs sm:text-sm" style={{ color: themeColors.gray }}>Academic Average</p>
                  <p className="text-lg sm:text-xl font-semibold" style={{ color: themeColors.primary }}>{academicAverage}%</p>
                </div>
                <BookOpen className="w-4 h-4 sm:w-5 sm:h-5" style={{ color: themeColors.primary }} />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white shadow-sm border" style={{ borderColor: themeColors.accent }}>
            <CardContent className="p-3 sm:p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs sm:text-sm" style={{ color: themeColors.gray }}>Attendance Rate</p>
                  <p className="text-lg sm:text-xl font-semibold" style={{ color: themeColors.success }}>{attendanceRate}%</p>
                </div>
                <Calendar className="w-4 h-4 sm:w-5 sm:h-5" style={{ color: themeColors.success }} />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white shadow-sm border" style={{ borderColor: themeColors.accent }}>
            <CardContent className="p-3 sm:p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs sm:text-sm" style={{ color: themeColors.gray }}>Profile Completeness</p>
                  <p className="text-lg sm:text-xl font-semibold" style={{ color: themeColors.purple }}>{profileCompleteness}%</p>
                </div>
                <Users className="w-4 h-4 sm:w-5 sm:h-5" style={{ color: themeColors.purple }} />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white shadow-sm border" style={{ borderColor: themeColors.accent }}>
            <CardContent className="p-3 sm:p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs sm:text-sm" style={{ color: themeColors.gray }}>Total Results</p>
                  <p className="text-lg sm:text-xl font-semibold" style={{ color: themeColors.info }}>{results.length}</p>
                </div>
                <Trophy className="w-4 h-4 sm:w-5 sm:h-5" style={{ color: themeColors.info }} />
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
          {/* Column 1 - Student Photo */}
          <div className="flex">
            <Card className="bg-white shadow-sm border border-gray-200 w-full flex flex-col overflow-hidden">
              <CardContent className="p-0 flex-1 flex flex-col relative">
                {/* Background Image/Color Cover */}
                <div className="flex-1 relative">
                  {student.photo ? (
                    <img
                      src={student.photo}
                      alt={student.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center">
                      <span className="text-8xl font-bold text-blue-600">{student.name?.[0]?.toUpperCase()}</span>
                    </div>
                  )}

                  <div className="absolute inset-0 bg-black bg-opacity-20"></div>

                  {/* Student Info Overlay */}
                  <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/60 to-transparent">
                    <div className="text-center">
                      <h3 className="text-2xl font-bold text-white mb-2">{student.name}</h3>
                      <Badge
                        variant={student?.current_state?.toLowerCase() === 'active' ? 'default' : 'secondary'}
                        className={`${student?.current_state?.toLowerCase() === 'active'
                            ? 'bg-green-500 text-white border-green-500'
                            : 'bg-gray-500 text-white border-gray-500'
                          }`}
                      >
                        {student?.current_state || 'Unknown'}
                      </Badge>
                    </div>
                  </div>

                  {/* Status Indicator */}
                  <div className="absolute top-4 right-4 w-8 h-8 bg-green-500 rounded-full border-4 border-white flex items-center justify-center shadow-lg">
                    <CheckCircle className="w-5 h-5 text-white" />
                  </div>
                </div>
              </CardContent>
            </Card>
        </div>

          {/* Column 2 - Tabs and Information */}
          <div className="flex">
            <Tabs defaultValue="personal" className="w-full flex flex-col">
              <TabsList className="grid w-full grid-cols-3 bg-white shadow-sm border" style={{ borderColor: themeColors.accent }}>
                <TabsTrigger 
                  value="personal" 
                  className="data-[state=active]:text-white data-[state=active]:border-b-2"
                  style={{ 
                    '--active-bg': themeColors.primary,
                    '--active-border': themeColors.primary
                  } as any}
                >
                  Personal
                </TabsTrigger>
                <TabsTrigger 
                  value="contact" 
                  className="data-[state=active]:text-white data-[state=active]:border-b-2"
                  style={{ 
                    '--active-bg': themeColors.secondary,
                    '--active-border': themeColors.secondary
                  } as any}
                >
                  Contact
                </TabsTrigger>
                <TabsTrigger 
                  value="academic" 
                  className="data-[state=active]:text-white data-[state=active]:border-b-2"
                  style={{ 
                    '--active-bg': themeColors.success,
                    '--active-border': themeColors.success
                  } as any}
                >
                  Academic
                </TabsTrigger>
              </TabsList>

              {/* Personal Information Tab */}
              <TabsContent value="personal" className="mt-6 flex-1">
                <Card className="bg-white shadow-sm border h-full flex flex-col" style={{ borderColor: themeColors.accent }}>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg font-medium" style={{ color: themeColors.primary }}>Personal Information</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4 flex-1">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm text-gray-600">Student ID</label>
                        <p className="font-medium text-gray-900">{student.id}</p>
                      </div>
                      <div>
                        <label className="text-sm text-gray-600">Full Name</label>
                        <p className="font-medium text-gray-900">{student.name}</p>
                          </div>
                        </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm text-gray-600">Grade</label>
                        <p className="font-medium text-gray-900">{student.current_grade || 'N/A'}</p>
                    </div>
                            <div>
                        <label className="text-sm text-gray-600">Age</label>
                        <p className="font-medium text-gray-900">
                          {student.dob ? new Date().getFullYear() - new Date(student.dob).getFullYear() : 'N/A'}
                        </p>
                            </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm text-gray-600">Gender</label>
                        <p className="font-medium text-gray-900">{student.gender || 'N/A'}</p>
                      </div>
                      <div>
                        <label className="text-sm text-gray-600">Nationality</label>
                        <p className="font-medium text-gray-900">{student.nationality || 'N/A'}</p>
                          </div>
                        </div>
                    <div>
                      <label className="text-sm text-gray-600">Email Address</label>
                      <Input
                        value={student.email || 'Not provided'}
                        className="mt-1"
                        readOnly
                      />
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Contact Information Tab */}
              <TabsContent value="contact" className="mt-6 flex-1">
                <Card className="bg-white shadow-sm border h-full flex flex-col" style={{ borderColor: themeColors.accent }}>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg font-medium" style={{ color: themeColors.primary }}>Contact Information</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4 flex-1">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm text-gray-600">Father's Contact</label>
                        <p className="font-medium text-gray-900">{student.father_contact || 'N/A'}</p>
                      </div>
                            <div>
                        <label className="text-sm text-gray-600">Mother's Contact</label>
                        <p className="font-medium text-gray-900">{student.mother_contact || 'N/A'}</p>
                            </div>
                          </div>
                    <div>
                      <label className="text-sm text-gray-600">Emergency Contact</label>
                      <p className="font-medium text-gray-900">{student.emergency_contact || 'N/A'}</p>
                        </div>
                    <div>
                      <label className="text-sm text-gray-600">Address</label>
                      <p className="font-medium text-gray-900">{student.address || 'N/A'}</p>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Academic Information Tab */}
              <TabsContent value="academic" className="mt-6 flex-1">
                <Card className="bg-white shadow-sm border h-full flex flex-col" style={{ borderColor: themeColors.accent }}>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg font-medium" style={{ color: themeColors.primary }}>Academic Information</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4 flex-1">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm text-gray-600">Student ID</label>
                        <p className="font-medium text-gray-900">{student.id}</p>
                        </div>
                      <div>
                        <label className="text-sm text-gray-600">GR Number</label>
                        <p className="font-medium text-gray-900">{student.gr_no || 'N/A'}</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                            <div>
                        <label className="text-sm text-gray-600">Current Grade</label>
                        <p className="font-medium text-gray-900">{student.current_grade || 'N/A'}</p>
                            </div>
                      <div>
                        <label className="text-sm text-gray-600">Campus</label>
                        <p className="font-medium text-gray-900">{student.campus?.campus_name || 'N/A'}</p>
                          </div>
                        </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm text-gray-600">Enrollment Date</label>
                        <p className="font-medium text-gray-900">{student.enrollment_date || 'N/A'}</p>
                    </div>
                            <div>
                        <label className="text-sm text-gray-600">Academic Year</label>
                        <p className="font-medium text-gray-900">2024-2025</p>
                          </div>
                        </div>
                        <div>
                      <label className="text-sm text-gray-600">Academic Status</label>
                      <p className="font-medium text-gray-900">{student.current_state || 'N/A'}</p>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>

          {/* Column 3 - Grade Distribution Chart */}
          <div className="flex">
            <Card className="bg-white shadow-sm border w-full flex flex-col" style={{ borderColor: themeColors.accent }}>
              <CardHeader className="pb-2 sm:pb-3">
                <CardTitle className="text-base sm:text-lg font-medium" style={{ color: themeColors.primary }}>Grade Distribution</CardTitle>
              </CardHeader>
              <CardContent className="flex-1 flex flex-col">
                <div className="flex-1">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={gradeDistributionData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ grade, percentage }) => `${grade}: ${percentage}%`}
                        outerRadius={60}
                        fill="#8884d8"
                        dataKey="count"
                      >
                        {gradeDistributionData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
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

