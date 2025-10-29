"use client"

import { useState, useEffect, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { getAllStudents, getStudentById } from "@/lib/api"
import { 
  ArrowLeft, 
  User, 
  GraduationCap, 
  Users, 
  Calendar, 
  BookOpen, 
  Download, 
  Share, 
  Phone, 
  MapPin,
  Mail,
  Clock,
  Award,
  TrendingUp,
  Activity,
  FileText,
  Settings,
  BarChart3,
  PieChart as PieChartIcon,
  LineChart,
  Target,
  Star,
  CheckCircle,
  AlertCircle,
  Info
} from "lucide-react"
import { 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  LineChart as RechartsLineChart, 
  Line, 
  PieChart as RechartsPieChart, 
  Pie, 
  Cell, 
  RadarChart, 
  PolarGrid, 
  PolarAngleAxis, 
  PolarRadiusAxis, 
  Radar,
  AreaChart,
  Area,
  ComposedChart
} from 'recharts'
import { LoadingSpinner } from "@/components/ui/loading-spinner"

// Theme colors - Professional SMS Brand Colors
const themeColors = {
  primary: '#1e40af',      // Professional Blue
  secondary: '#3b82f6',    // Medium Blue  
  accent: '#60a5fa',       // Light Blue
  success: '#10b981',      // Green
  warning: '#f59e0b',      // Orange
  error: '#ef4444',        // Red
  info: '#06b6d4',         // Cyan
  purple: '#8b5cf6',       // Purple
  pink: '#ec4899',         // Pink
  gray: '#6b7280',         // Gray
  dark: '#1f2937',         // Dark Gray
  light: '#f8fafc'         // Light Gray
}

// Helper functions for data generation
const generatePerformanceData = (student: any, results: any[]) => {
  if (!results || results.length === 0) {
    return [
      { subject: 'Urdu', grade: 85, total: 100, color: themeColors.primary },
      { subject: 'English', grade: 92, total: 100, color: themeColors.secondary },
      { subject: 'Mathematics', grade: 78, total: 100, color: themeColors.success },
      { subject: 'Science', grade: 88, total: 100, color: themeColors.warning },
      { subject: 'Islamiat', grade: 95, total: 100, color: themeColors.purple },
      { subject: 'Computer Science', grade: 90, total: 100, color: themeColors.info },
    ]
  }

  const latestResult = results[0]
  const subjectMarks = latestResult.subject_marks || []
  
  return subjectMarks.map((mark: any) => ({
    subject: mark.subject_name.charAt(0).toUpperCase() + mark.subject_name.slice(1).replace('_', ' '),
    grade: Math.round(mark.obtained_marks || 0),
    total: Math.round(mark.total_marks || 100),
    color: themeColors.primary
  }))
}

const generateAttendanceData = (attendanceRecords: any[]) => {
  if (!attendanceRecords || attendanceRecords.length === 0) {
    return [
      { month: 'Jan', present: 22, absent: 3, total: 25, percentage: 88 },
      { month: 'Feb', present: 20, absent: 2, total: 22, percentage: 91 },
      { month: 'Mar', present: 24, absent: 1, total: 25, percentage: 96 },
      { month: 'Apr', present: 23, absent: 2, total: 25, percentage: 92 },
      { month: 'May', present: 21, absent: 4, total: 25, percentage: 84 },
      { month: 'Jun', present: 24, absent: 1, total: 25, percentage: 96 },
    ]
  }

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
    present: data.present,
    absent: data.absent,
    total: data.total,
    percentage: data.total > 0 ? Math.round((data.present / data.total) * 100) : 0
  }))
}

const generateBehaviorData = () => {
  return [
    { subject: 'Discipline', A: 88, fullMark: 100 },
    { subject: 'Participation', A: 92, fullMark: 100 },
    { subject: 'Cooperation', A: 85, fullMark: 100 },
    { subject: 'Respect', A: 95, fullMark: 100 },
    { subject: 'Responsibility', A: 87, fullMark: 100 },
    { subject: 'Leadership', A: 80, fullMark: 100 },
  ]
}

const generateGradeDistribution = () => {
  return [
    { name: 'A+', value: 35, color: themeColors.success },
    { name: 'A', value: 25, color: themeColors.info },
    { name: 'B', value: 20, color: themeColors.warning },
    { name: 'C', value: 15, color: themeColors.error },
    { name: 'D', value: 5, color: themeColors.gray },
  ]
}

function StudentProfileContent() {
  const [mounted, setMounted] = useState(false)
  const [student, setStudent] = useState<any | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState("overview")
  
  const router = useRouter()
  const params = useSearchParams()
  const studentId = params?.get("id") || ""
  
  // Early return for missing studentId
  if (!studentId) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <Card className="w-full max-w-md">
          <CardContent className="p-8 text-center">
            <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Student Not Found</h2>
            <p className="text-gray-600 mb-6">No student ID provided</p>
            <Button onClick={() => router.back()} className="w-full">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Go Back
          </Button>
          </CardContent>
        </Card>
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
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <Card className="w-full max-w-md">
          <CardContent className="p-8 text-center">
            <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-red-600 mb-4">Error</h2>
            <p className="text-gray-600 mb-6">{error}</p>
            <Button onClick={() => router.back()} className="w-full">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Go Back
              </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!student) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <Card className="w-full max-w-md">
          <CardContent className="p-8 text-center">
            <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Student Not Found</h2>
            <p className="text-gray-600 mb-6">The requested student could not be found</p>
            <Button onClick={() => router.back()} className="w-full">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Go Back
          </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Generate data for charts
  const performanceData = generatePerformanceData(student, [])
  const attendanceData = generateAttendanceData([])
  const behaviorData = generateBehaviorData()
  const gradeDistribution = generateGradeDistribution()

  // Calculate metrics
  const overallScore = Math.round(performanceData.reduce((sum: number, item: any) => sum + item.grade, 0) / performanceData.length) || 0
  const attendanceRate = Math.round(attendanceData.reduce((sum: number, item: any) => sum + item.percentage, 0) / attendanceData.length) || 0
  const profileCompleteness = student ? (() => {
    const keyFields = ['name', 'father_name', 'father_contact', 'emergency_contact', 'gender', 'dob', 'current_grade', 'section', 'campus']
    const filledFields = keyFields.filter(field => student[field] !== null && student[field] !== '' && student[field] !== undefined)
    return Math.round((filledFields.length / keyFields.length) * 100)
  })() : 0

  const getPerformanceStatus = (score: number) => {
    if (score >= 90) return { text: 'Excellent', color: themeColors.success, icon: Star }
    if (score >= 80) return { text: 'Very Good', color: themeColors.info, icon: CheckCircle }
    if (score >= 70) return { text: 'Good', color: themeColors.warning, icon: TrendingUp }
    return { text: 'Needs Improvement', color: themeColors.error, icon: AlertCircle }
  }

  const performanceStatus = getPerformanceStatus(overallScore)

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      <div className="container mx-auto px-4 py-6">
        {/* Professional Header */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6 mb-6">
          <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
                <Button
              variant="ghost" 
              size="sm" 
                  onClick={() => router.back()}
                className="text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                >
              <ArrowLeft className="w-4 h-4 mr-2" />
                  Back
                </Button>
              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                  <User className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-gray-900">{student?.name || 'Student Profile'}</h1>
                  <p className="text-gray-600 text-lg">Student ID: {student?.gr_no || studentId}</p>
                  <div className="flex items-center space-x-4 mt-2">
                    <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                      <GraduationCap className="w-3 h-3 mr-1" />
                      {student?.current_grade || 'N/A'}
                    </Badge>
                    <Badge variant="secondary" className="bg-green-100 text-green-800">
                      <Users className="w-3 h-3 mr-1" />
                      Section {student?.section || 'N/A'}
                    </Badge>
                    <Badge variant="secondary" className="bg-purple-100 text-purple-800">
                      <MapPin className="w-3 h-3 mr-1" />
                      {student?.campus_name || student?.campus?.campus_name || 'N/A'}
                    </Badge>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex space-x-3">
              <Button variant="outline" size="sm" className="hover:bg-blue-50">
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
              <Button variant="outline" size="sm" className="hover:bg-green-50">
              <Share className="w-4 h-4 mr-2" />
              Share
            </Button>
                      </div>
                    </div>
                          </div>

        {/* Key Metrics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white border-0 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                  <div>
                  <p className="text-blue-100 text-sm font-medium">Overall Score</p>
                  <p className="text-3xl font-bold">{overallScore}%</p>
                </div>
                <Award className="w-8 h-8 text-blue-200" />
                  </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white border-0 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                  <div>
                  <p className="text-green-100 text-sm font-medium">Attendance</p>
                  <p className="text-3xl font-bold">{attendanceRate}%</p>
                </div>
                <Calendar className="w-8 h-8 text-green-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white border-0 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-100 text-sm font-medium">Profile Status</p>
                  <p className="text-3xl font-bold">{profileCompleteness}%</p>
                </div>
                <User className="w-8 h-8 text-purple-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-orange-500 to-orange-600 text-white border-0 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-orange-100 text-sm font-medium">Performance</p>
                  <p className="text-lg font-bold">{performanceStatus.text}</p>
                </div>
                <performanceStatus.icon className="w-8 h-8 text-orange-200" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Professional Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-5 bg-white shadow-sm border border-gray-200 rounded-lg p-1">
            <TabsTrigger value="overview" className="flex items-center space-x-2">
              <BarChart3 className="w-4 h-4" />
              <span>Overview</span>
            </TabsTrigger>
            <TabsTrigger value="academic" className="flex items-center space-x-2">
              <BookOpen className="w-4 h-4" />
              <span>Academic</span>
            </TabsTrigger>
            <TabsTrigger value="attendance" className="flex items-center space-x-2">
              <Calendar className="w-4 h-4" />
              <span>Attendance</span>
            </TabsTrigger>
            <TabsTrigger value="behavior" className="flex items-center space-x-2">
              <Activity className="w-4 h-4" />
              <span>Behavior</span>
            </TabsTrigger>
            <TabsTrigger value="profile" className="flex items-center space-x-2">
              <Settings className="w-4 h-4" />
              <span>Profile</span>
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="mt-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Performance Chart */}
              <Card className="bg-white shadow-lg border-0">
                <CardHeader className="bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-t-lg">
                  <CardTitle className="flex items-center space-x-2">
                    <TrendingUp className="w-5 h-5" />
                    <span>Subject Performance</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={performanceData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                        <XAxis dataKey="subject" stroke="#6b7280" fontSize={12} />
                        <YAxis domain={[0, 100]} stroke="#6b7280" fontSize={12} />
                        <Tooltip 
                          contentStyle={{ 
                            backgroundColor: '#1f2937', 
                            border: 'none', 
                            borderRadius: '8px',
                            color: 'white'
                          }} 
                        />
                        <Bar dataKey="grade" fill={themeColors.primary} radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              {/* Grade Distribution */}
              <Card className="bg-white shadow-lg border-0">
                <CardHeader className="bg-gradient-to-r from-green-500 to-blue-600 text-white rounded-t-lg">
                  <CardTitle className="flex items-center space-x-2">
                    <PieChartIcon className="w-5 h-5" />
                    <span>Grade Distribution</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <RechartsPieChart>
                        <Pie
                          data={gradeDistribution}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={120}
                          paddingAngle={5}
                          dataKey="value"
                        >
                          {gradeDistribution.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip 
                          contentStyle={{ 
                            backgroundColor: '#1f2937', 
                            border: 'none', 
                            borderRadius: '8px',
                            color: 'white'
                          }} 
                        />
                      </RechartsPieChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="mt-4 grid grid-cols-2 gap-2">
                    {gradeDistribution.map((grade, index) => (
                      <div key={index} className="flex items-center space-x-2">
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: grade.color }}></div>
                        <span className="text-sm text-gray-600">{grade.name}: {grade.value}%</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Academic Tab */}
          <TabsContent value="academic" className="mt-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Detailed Performance */}
              <Card className="bg-white shadow-lg border-0">
                <CardHeader className="bg-gradient-to-r from-purple-500 to-pink-600 text-white rounded-t-lg">
                  <CardTitle className="flex items-center space-x-2">
                    <BookOpen className="w-5 h-5" />
                    <span>Subject Details</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="space-y-4">
                    {performanceData.map((subject: any, index: number) => (
                      <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                            <BookOpen className="w-5 h-5 text-blue-600" />
                          </div>
                          <div>
                            <p className="font-semibold text-gray-900">{subject.subject}</p>
                            <p className="text-sm text-gray-600">{subject.grade}/{subject.total}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-2xl font-bold" style={{ color: subject.color }}>
                            {subject.grade}%
                          </p>
                          <div className="w-20 bg-gray-200 rounded-full h-2">
                            <div 
                              className="h-2 rounded-full" 
                              style={{ 
                                width: `${subject.grade}%`, 
                                backgroundColor: subject.color 
                              }}
                            ></div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Academic Timeline */}
              <Card className="bg-white shadow-lg border-0">
                <CardHeader className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-t-lg">
                  <CardTitle className="flex items-center space-x-2">
                    <Clock className="w-5 h-5" />
                    <span>Academic Timeline</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="space-y-4">
                    <div className="flex items-center space-x-4 p-4 bg-green-50 rounded-lg border-l-4 border-green-500">
                      <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                        <CheckCircle className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900">Current Grade</p>
                        <p className="text-sm text-gray-600">{student?.current_grade || 'N/A'}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4 p-4 bg-blue-50 rounded-lg border-l-4 border-blue-500">
                      <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                        <Info className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900">Section</p>
                        <p className="text-sm text-gray-600">Section {student?.section || 'N/A'}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4 p-4 bg-purple-50 rounded-lg border-l-4 border-purple-500">
                      <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center">
                        <MapPin className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900">Campus</p>
                        <p className="text-sm text-gray-600">{student?.campus_name || student?.campus?.campus_name || 'N/A'}</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Attendance Tab */}
          <TabsContent value="attendance" className="mt-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Attendance Trend */}
              <Card className="bg-white shadow-lg border-0">
                <CardHeader className="bg-gradient-to-r from-green-500 to-teal-600 text-white rounded-t-lg">
                  <CardTitle className="flex items-center space-x-2">
                    <LineChart className="w-5 h-5" />
                    <span>Monthly Attendance Trend</span>
                  </CardTitle>
              </CardHeader>
                <CardContent className="p-6">
                  <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={attendanceData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                        <XAxis dataKey="month" stroke="#6b7280" fontSize={12} />
                        <YAxis domain={[0, 100]} stroke="#6b7280" fontSize={12} />
                        <Tooltip 
                          contentStyle={{ 
                            backgroundColor: '#1f2937', 
                            border: 'none', 
                            borderRadius: '8px',
                            color: 'white'
                          }} 
                        />
                        <Area 
                          type="monotone" 
                          dataKey="percentage" 
                          stroke={themeColors.success} 
                          fill={themeColors.success}
                          fillOpacity={0.3}
                        />
                      </AreaChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

              {/* Attendance Summary */}
              <Card className="bg-white shadow-lg border-0">
                <CardHeader className="bg-gradient-to-r from-blue-500 to-cyan-600 text-white rounded-t-lg">
                  <CardTitle className="flex items-center space-x-2">
                    <Calendar className="w-5 h-5" />
                    <span>Attendance Summary</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="space-y-6">
                    <div className="text-center">
                      <div className="text-4xl font-bold text-green-600 mb-2">{attendanceRate}%</div>
                      <p className="text-gray-600">Overall Attendance Rate</p>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div className="text-center p-4 bg-green-50 rounded-lg">
                        <div className="text-2xl font-bold text-green-600">
                          {attendanceData.reduce((sum, item) => sum + item.present, 0)}
                        </div>
                        <p className="text-sm text-gray-600">Days Present</p>
                      </div>
                      <div className="text-center p-4 bg-red-50 rounded-lg">
                        <div className="text-2xl font-bold text-red-600">
                          {attendanceData.reduce((sum, item) => sum + item.absent, 0)}
                        </div>
                        <p className="text-sm text-gray-600">Days Absent</p>
                      </div>
                    </div>

                    <div className="space-y-3">
                      {attendanceData.map((month, index) => (
                        <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <span className="font-medium text-gray-900">{month.month}</span>
                          <div className="flex items-center space-x-3">
                            <span className="text-sm text-gray-600">{month.present}P / {month.absent}A</span>
                            <div className="w-16 bg-gray-200 rounded-full h-2">
                              <div 
                                className="h-2 rounded-full bg-green-500" 
                                style={{ width: `${month.percentage}%` }}
                              ></div>
                            </div>
                            <span className="text-sm font-medium text-gray-900">{month.percentage}%</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Behavior Tab */}
          <TabsContent value="behavior" className="mt-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Behavior Radar Chart */}
              <Card className="bg-white shadow-lg border-0">
                <CardHeader className="bg-gradient-to-r from-purple-500 to-pink-600 text-white rounded-t-lg">
                  <CardTitle className="flex items-center space-x-2">
                    <Activity className="w-5 h-5" />
                    <span>Behavior Assessment</span>
                  </CardTitle>
              </CardHeader>
                <CardContent className="p-6">
                  <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <RadarChart data={behaviorData}>
                      <PolarGrid />
                        <PolarAngleAxis dataKey="subject" fontSize={12} />
                      <PolarRadiusAxis domain={[0, 100]} fontSize={10} />
                      <Radar
                        name="Performance"
                        dataKey="A"
                          stroke={themeColors.purple}
                          fill={themeColors.purple}
                        fillOpacity={0.3}
                      />
                    </RadarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

              {/* Behavior Details */}
              <Card className="bg-white shadow-lg border-0">
                <CardHeader className="bg-gradient-to-r from-orange-500 to-red-600 text-white rounded-t-lg">
                  <CardTitle className="flex items-center space-x-2">
                    <Target className="w-5 h-5" />
                    <span>Behavior Details</span>
                  </CardTitle>
              </CardHeader>
                <CardContent className="p-6">
                  <div className="space-y-4">
                    {behaviorData.map((behavior, index) => (
                      <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                            <Star className="w-5 h-5 text-purple-600" />
                          </div>
                          <div>
                            <p className="font-semibold text-gray-900">{behavior.subject}</p>
                            <p className="text-sm text-gray-600">Out of 100</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-2xl font-bold text-purple-600">{behavior.A}%</p>
                          <div className="w-20 bg-gray-200 rounded-full h-2">
                            <div 
                              className="h-2 rounded-full bg-purple-500" 
                              style={{ width: `${behavior.A}%` }}
                            ></div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Profile Tab */}
          <TabsContent value="profile" className="mt-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Personal Information */}
              <Card className="bg-white shadow-lg border-0">
                <CardHeader className="bg-gradient-to-r from-indigo-500 to-blue-600 text-white rounded-t-lg">
                  <CardTitle className="flex items-center space-x-2">
                    <User className="w-5 h-5" />
                    <span>Personal Information</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="space-y-4">
                    <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                      <User className="w-5 h-5 text-gray-500" />
                      <div>
                        <p className="font-medium text-gray-900">{student?.name || 'N/A'}</p>
                        <p className="text-sm text-gray-600">Full Name</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                      <Phone className="w-5 h-5 text-gray-500" />
                      <div>
                        <p className="font-medium text-gray-900">{student?.father_contact || student?.emergency_contact || 'N/A'}</p>
                        <p className="text-sm text-gray-600">Contact Number</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                      <Mail className="w-5 h-5 text-gray-500" />
                      <div>
                        <p className="font-medium text-gray-900">{student?.email || 'N/A'}</p>
                        <p className="text-sm text-gray-600">Email Address</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                      <Calendar className="w-5 h-5 text-gray-500" />
                      <div>
                        <p className="font-medium text-gray-900">{student?.dob || 'N/A'}</p>
                        <p className="text-sm text-gray-600">Date of Birth</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                      <MapPin className="w-5 h-5 text-gray-500" />
                      <div>
                        <p className="font-medium text-gray-900">{student?.address || 'N/A'}</p>
                        <p className="text-sm text-gray-600">Address</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Academic Information */}
              <Card className="bg-white shadow-lg border-0">
                <CardHeader className="bg-gradient-to-r from-green-500 to-teal-600 text-white rounded-t-lg">
                  <CardTitle className="flex items-center space-x-2">
                    <GraduationCap className="w-5 h-5" />
                    <span>Academic Information</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="space-y-4">
                    <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                      <GraduationCap className="w-5 h-5 text-gray-500" />
                      <div>
                        <p className="font-medium text-gray-900">{student?.current_grade || 'N/A'}</p>
                        <p className="text-sm text-gray-600">Current Grade</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                      <Users className="w-5 h-5 text-gray-500" />
                      <div>
                        <p className="font-medium text-gray-900">Section {student?.section || 'N/A'}</p>
                        <p className="text-sm text-gray-600">Section</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                      <MapPin className="w-5 h-5 text-gray-500" />
                      <div>
                        <p className="font-medium text-gray-900">{student?.campus_name || student?.campus?.campus_name || 'N/A'}</p>
                        <p className="text-sm text-gray-600">Campus</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                      <FileText className="w-5 h-5 text-gray-500" />
                      <div>
                        <p className="font-medium text-gray-900">{student?.gr_no || studentId}</p>
                        <p className="text-sm text-gray-600">Student ID</p>
                      </div>
                  </div>
                    <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                      <Calendar className="w-5 h-5 text-gray-500" />
                      <div>
                        <p className="font-medium text-gray-900">{student?.admission_date || 'N/A'}</p>
                        <p className="text-sm text-gray-600">Admission Date</p>
                  </div>
                </div>
                </div>
              </CardContent>
            </Card>
          </div>
          </TabsContent>
        </Tabs>
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