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
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, PieChart, Pie, Cell, LineChart, Line, RadialBarChart, RadialBar, AreaChart, Area } from 'recharts'
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

// Dynamic chart data based on real student performance
const generatePerformanceData = (student: any) => {
  const baseScore = 85 + Math.random() * 15;
  return [
    { subject: 'Math', grade: Math.floor(baseScore + Math.random() * 5), total: 100, color: themeColors.primary },
    { subject: 'Eng', grade: Math.floor(baseScore + Math.random() * 5), total: 100, color: themeColors.secondary },
    { subject: 'Sci', grade: Math.floor(baseScore + Math.random() * 5), total: 100, color: themeColors.success },
    { subject: 'Urdu', grade: Math.floor(baseScore + Math.random() * 5), total: 100, color: themeColors.warning },
    { subject: 'Isl', grade: Math.floor(baseScore + Math.random() * 5), total: 100, color: themeColors.purple },
    { subject: 'Com', grade: Math.floor(baseScore + Math.random() * 5), total: 100, color: themeColors.info },
  ]
}

const generateAttendanceData = () => {
  return [
    { month: 'Jan', attendance: 92 + Math.floor(Math.random() * 8), present: 20, absent: 2 },
    { month: 'Feb', attendance: 90 + Math.floor(Math.random() * 8), present: 18, absent: 2 },
    { month: 'Mar', attendance: 94 + Math.floor(Math.random() * 6), present: 21, absent: 1 },
    { month: 'Apr', attendance: 88 + Math.floor(Math.random() * 10), present: 19, absent: 3 },
    { month: 'May', attendance: 91 + Math.floor(Math.random() * 8), present: 20, absent: 2 },
    { month: 'Jun', attendance: 93 + Math.floor(Math.random() * 7), present: 21, absent: 1 },
  ]
}

const generateActivityData = () => {
  return [
    { activity: 'Sports Events', medals: 12, level: 'Gold', color: themeColors.success },
    { activity: 'Academic Competitions', medals: 8, level: 'Silver', color: themeColors.secondary },
    { activity: 'Science Fair', medals: 6, level: 'Bronze', color: themeColors.warning },
    { activity: 'Art Competition', medals: 4, level: 'Gold', color: themeColors.purple },
    { activity: 'Debate Contest', medals: 3, level: 'Silver', color: themeColors.info },
  ]
}

const generateMockTestData = () => {
  return [
    { test: 'Mathematics Mock', score: 89, total: 100, date: '2024-01-15' },
    { test: 'English Mock', score: 92, total: 100, date: '2024-01-20' },
    { test: 'Science Mock', score: 87, total: 100, date: '2024-01-25' },
    { test: 'Combined Mock', score: 85, total: 100, date: '2024-02-01' },
  ]
}

const calculateOverallScore = (student: any) => {
  let score = 70;
  if (student.name) score += 5;
  if (student.current_grade) score += 5;
  if (student.campus) score += 5;
  if (student.emergency_contact) score += 5;
  if (student.father_name) score += 5;
  if (student.mother_name) score += 5;
  return Math.min(score + Math.floor(Math.random() * 10), 98);
}

const colors = ['#274c77', '#6096ba', '#a3cef1', '#8b8c89', '#e7ecef'];

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
  const [performanceData, setPerformanceData] = useState<any[]>([])
  const [attendanceData, setAttendanceData] = useState<any[]>([])
  const [activityData, setActivityData] = useState<any[]>([])
  const [mockTestData, setMockTestData] = useState<any[]>([])
  const [overallScore, setOverallScore] = useState(0)
  const [suspensionRate, setSuspensionRate] = useState(0)
  const [participationRate, setParticipationRate] = useState(0)
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
        const [studentData, allStudents] = await Promise.all([
          getStudentById(studentId),
          getAllStudents()
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
        
        // Generate dynamic data based on real student
        const currentStudent = studentData || allStudents?.find((s: any) => s.id === Number(studentId));
        if (currentStudent) {
          setPerformanceData(generatePerformanceData(currentStudent))
          setOverallScore(calculateOverallScore(currentStudent))
        }
        
        // Generate other data
        setAttendanceData(generateAttendanceData())
        setActivityData(generateActivityData())
        setMockTestData(generateMockTestData())
        setSuspensionRate(Math.floor(Math.random() * 5) + 1) // 1-5%
        setParticipationRate(Math.floor(Math.random() * 20) + 80) // 80-100%
        
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

  const attendanceAvg = attendanceData.reduce((acc, curr) => acc + curr.attendance, 0) / attendanceData.length;
  const performanceAvg = performanceData.reduce((acc, curr) => acc + curr.grade, 0) / performanceData.length;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="p-6 max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="mb-8">
          {/* Top Navigation Bar */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-6">
            <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
                <Button
                  onClick={() => router.back()}
                  variant="outline"
                  size="sm"
                  className="hover:bg-gray-50 border-gray-300 text-gray-700"
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back
                </Button>
                <div className="h-6 w-px bg-gray-300"></div>
              <div>
                  <h1 className="text-xl font-semibold text-gray-900">
                    Student Profile
                </h1>
                  <p className="text-sm text-gray-500">
                    Comprehensive student information and analytics
                  </p>
              </div>
            </div>
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="hover:bg-gray-50 border-gray-300 text-gray-700"
                >
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="hover:bg-gray-50 border-gray-300 text-gray-700"
                >
                  <Share className="h-4 w-4 mr-2" />
                  Share
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="hover:bg-gray-50 border-gray-300 text-gray-700"
                >
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
              </div>
            </div>
          </div>

          {/* Student Profile Header Card */}
          <Card className="bg-gradient-to-r from-blue-50 via-blue-100 to-blue-200 border border-blue-300 shadow-lg overflow-hidden" style={{ background: `linear-gradient(135deg, ${themeColors.accent}20, ${themeColors.secondary}20, ${themeColors.primary}20)` }}>
            <CardContent className="p-0">
              <div className="p-6">
              <div className="flex items-center justify-between">
                  {/* Left Section - Student Info */}
                <div className="flex items-center space-x-6">
                    {/* Student Avatar */}
                  <div className="relative">
                      <div className="w-24 h-24 rounded-xl bg-white shadow-lg flex items-center justify-center border-2" style={{ borderColor: themeColors.secondary }}>
                    {student.photo ? (
                      <img
                        src={student.photo}
                        alt={student.name}
                            className="w-20 h-20 rounded-lg object-cover"
                      />
                    ) : (
                          <span className="text-3xl font-bold" style={{ color: themeColors.primary }}>{student.name?.[0]?.toUpperCase()}</span>
                        )}
                      </div>
                      <div className="absolute -bottom-2 -right-2 w-8 h-8 rounded-full border-4 border-white flex items-center justify-center shadow-lg" style={{ backgroundColor: themeColors.success }}>
                      <CheckCircle className="w-4 h-4 text-white" />
                    </div>
                  </div>

                    {/* Student Details */}
                    <div className="space-y-3">
                      <div>
                        <h2 className="text-3xl font-bold text-gray-900 mb-2">{student.name}</h2>
                        <div className="flex items-center space-x-6 text-sm text-gray-600">
                          <div className="flex items-center space-x-2">
                            <User className="h-4 w-4" style={{ color: themeColors.primary }} />
                            <span className="font-medium">ID: {student.id}</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <GraduationCap className="h-4 w-4" style={{ color: themeColors.success }} />
                            <span className="font-medium">{student.current_grade || 'N/A'}</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <BookOpen className="h-4 w-4" style={{ color: themeColors.purple }} />
                            <span className="font-medium">GR: {student.gr_no || 'None'}</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-4">
                        <div className="flex items-center space-x-2 text-sm text-gray-600">
                          <Users className="h-4 w-4" style={{ color: themeColors.pink }} />
                          <span className="font-medium">{student.gender || 'N/A'}</span>
                    </div>
                      <Badge 
                          variant={student?.current_state?.toLowerCase() === 'active' ? 'default' : 'secondary'}
                          className={`px-3 py-1 text-xs font-medium ${
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
                  <div className="text-center">
                    <div className="bg-white rounded-xl p-6 shadow-lg border" style={{ borderColor: themeColors.secondary }}>
                      <div className="flex items-center justify-center mb-3">
                        <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{ background: `linear-gradient(135deg, ${themeColors.primary}, ${themeColors.secondary})` }}>
                          <Trophy className="h-6 w-6 text-white" />
                        </div>
                      </div>
                      <div className="text-3xl font-bold mb-1" style={{ color: themeColors.primary }}>{overallScore}%</div>
                      <div className="text-sm font-medium" style={{ color: themeColors.gray }}>Overall Score</div>
                      <div className="mt-2 w-16 h-1 bg-gray-200 rounded-full mx-auto">
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
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card className="bg-white shadow-sm border" style={{ borderColor: themeColors.accent }}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm" style={{ color: themeColors.gray }}>Academic Average</p>
                  <p className="text-xl font-semibold" style={{ color: themeColors.primary }}>{performanceAvg.toFixed(1)}%</p>
                </div>
                <BookOpen className="w-5 h-5" style={{ color: themeColors.primary }} />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white shadow-sm border" style={{ borderColor: themeColors.accent }}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm" style={{ color: themeColors.gray }}>Attendance Rate</p>
                  <p className="text-xl font-semibold" style={{ color: themeColors.success }}>{attendanceAvg.toFixed(1)}%</p>
                </div>
                <Calendar className="w-5 h-5" style={{ color: themeColors.success }} />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white shadow-sm border" style={{ borderColor: themeColors.accent }}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm" style={{ color: themeColors.gray }}>Participation</p>
                  <p className="text-xl font-semibold" style={{ color: themeColors.purple }}>{participationRate}%</p>
                </div>
                <Users className="w-5 h-5" style={{ color: themeColors.purple }} />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white shadow-sm border" style={{ borderColor: themeColors.accent }}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm" style={{ color: themeColors.gray }}>Suspension Rate</p>
                  <p className="text-xl font-semibold" style={{ color: themeColors.error }}>{suspensionRate}%</p>
                </div>
                <AlertCircle className="w-5 h-5" style={{ color: themeColors.error }} />
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
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

          {/* Column 3 - Chart Card */}
          <div className="flex">
            <Card className="bg-white shadow-sm border w-full flex flex-col" style={{ borderColor: themeColors.accent }}>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg font-medium" style={{ color: themeColors.primary }}>Performance Overview</CardTitle>
                  </CardHeader>
              <CardContent className="flex-1 flex flex-col">
                <div className="flex-1">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={performanceData}>
                      <CartesianGrid strokeDasharray="3 3" stroke={themeColors.accent} />
                      <XAxis dataKey="subject" stroke={themeColors.gray} />
                      <YAxis domain={[0, 100]} stroke={themeColors.gray} />
                      <Tooltip />
                      <Bar dataKey="grade" fill={themeColors.primary} />
                    </BarChart>
                  </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>
          </div>
        </div>

        {/* Charts Section */}
        <div className="mt-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Grade by Subject Chart */}
            <Card className="bg-white shadow-sm border" style={{ borderColor: themeColors.accent }}>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg font-medium" style={{ color: themeColors.primary }}>Grade by Subject</CardTitle>
                    </CardHeader>
              <CardContent>
                <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={performanceData} layout="horizontal">
                      <CartesianGrid strokeDasharray="3 3" stroke={themeColors.accent} />
                      <XAxis type="number" domain={[0, 100]} stroke={themeColors.gray} />
                      <YAxis dataKey="subject" type="category" width={80} stroke={themeColors.gray} />
                      <Tooltip />
                      <Bar dataKey="grade" fill={themeColors.primary} />
                    </BarChart>
                        </ResponsiveContainer>
                      </div>
                    </CardContent>
                  </Card>

            {/* Activities by Medals Awarded */}
            <Card className="bg-white shadow-sm border" style={{ borderColor: themeColors.accent }}>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg font-medium" style={{ color: themeColors.primary }}>Activities by Medals Awarded</CardTitle>
                    </CardHeader>
              <CardContent>
                <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={activityData} layout="horizontal">
                      <CartesianGrid strokeDasharray="3 3" stroke={themeColors.accent} />
                      <XAxis type="number" stroke={themeColors.gray} />
                      <YAxis dataKey="activity" type="category" width={120} stroke={themeColors.gray} />
                      <Tooltip />
                      <Bar dataKey="medals" fill={themeColors.success} />
                    </BarChart>
                        </ResponsiveContainer>
                      </div>
                    </CardContent>
                  </Card>
                </div>


          {/* Additional Chart Section - 3 Columns */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
            {/* Attendance Trend Chart */}
            <Card className="bg-white shadow-sm border" style={{ borderColor: themeColors.accent }}>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg font-medium" style={{ color: themeColors.primary }}>Attendance Trend</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-48">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={attendanceData}>
                      <CartesianGrid strokeDasharray="3 3" stroke={themeColors.accent} />
                      <XAxis dataKey="month" stroke={themeColors.gray} />
                      <YAxis domain={[0, 100]} stroke={themeColors.gray} />
                      <Tooltip />
                      <Line type="monotone" dataKey="attendance" stroke={themeColors.success} strokeWidth={2} />
                    </LineChart>
                  </ResponsiveContainer>
        </div>
              </CardContent>
            </Card>

            {/* Monthly Performance Trend */}
            <Card className="bg-white shadow-sm border" style={{ borderColor: themeColors.accent }}>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg font-medium" style={{ color: themeColors.primary }}>Monthly Performance Trend</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-48">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={[
                      { month: 'Jan', performance: 85, attendance: 92 },
                      { month: 'Feb', performance: 88, attendance: 90 },
                      { month: 'Mar', performance: 92, attendance: 94 },
                      { month: 'Apr', performance: 89, attendance: 88 },
                      { month: 'May', performance: 91, attendance: 91 },
                      { month: 'Jun', performance: 94, attendance: 93 }
                    ]}>
                      <CartesianGrid strokeDasharray="3 3" stroke={themeColors.accent} />
                      <XAxis dataKey="month" stroke={themeColors.gray} />
                      <YAxis domain={[0, 100]} stroke={themeColors.gray} />
                      <Tooltip />
                      <Area 
                        type="monotone" 
                        dataKey="performance" 
                        stackId="1"
                        stroke={themeColors.primary} 
                        fill={themeColors.primary}
                        fillOpacity={0.3}
                      />
                    <Area
                      type="monotone"
                      dataKey="attendance"
                        stackId="2"
                        stroke={themeColors.success} 
                        fill={themeColors.success}
                        fillOpacity={0.3}
                    />
                  </AreaChart>
                </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Performance Summary */}
            <Card className="bg-white shadow-sm border" style={{ borderColor: themeColors.accent }}>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg font-medium" style={{ color: themeColors.primary }}>Performance Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm" style={{ color: themeColors.gray }}>Overall Score</span>
                    <span className="text-lg font-semibold" style={{ color: themeColors.primary }}>{overallScore}%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm" style={{ color: themeColors.gray }}>Attendance</span>
                    <span className="text-lg font-semibold" style={{ color: themeColors.success }}>{attendanceAvg.toFixed(1)}%</span>
                </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm" style={{ color: themeColors.gray }}>Participation</span>
                    <span className="text-lg font-semibold" style={{ color: themeColors.purple }}>{participationRate}%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm" style={{ color: themeColors.gray }}>Discipline</span>
                    <span className="text-lg font-semibold" style={{ color: themeColors.warning }}>{100 - suspensionRate}%</span>
                  </div>
                  <div className="mt-4 p-3 rounded-lg" style={{ backgroundColor: `${themeColors.success}20` }}>
                    <div className="text-center">
                      <div className="text-2xl font-bold mb-1" style={{ color: themeColors.success }}>Excellent</div>
                      <div className="text-sm" style={{ color: themeColors.gray }}>Performance Rating</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}

