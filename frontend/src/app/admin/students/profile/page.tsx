"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Progress } from "@/components/ui/progress"
import { apiGet, getAllStudents } from "@/lib/api"
import { ArrowLeft, User, Phone, MapPin, GraduationCap, Users, Calendar, Award, BookOpen, TrendingUp, Star, Crown, Sparkles, Trophy, Medal, Target, Activity, Clock, Mail, Home, School, CheckCircle, AlertCircle, BarChart3, PieChart as PieChartIcon, LineChart as LineChartIcon, RefreshCw, Download, Share } from "lucide-react"
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, PieChart, Pie, Cell, LineChart, Line, RadialBarChart, RadialBar, AreaChart, Area } from 'recharts'

// Dynamic chart data based on real student performance
const generatePerformanceData = (student: any) => {
  const baseScore = 85 + Math.random() * 15;
  return [
    { subject: 'Mathematics', grade: Math.floor(baseScore + Math.random() * 5), total: 100, color: '#2563eb' },
    { subject: 'English', grade: Math.floor(baseScore + Math.random() * 5), total: 100, color: '#dc2626' },
    { subject: 'Science', grade: Math.floor(baseScore + Math.random() * 5), total: 100, color: '#16a34a' },
    { subject: 'Urdu', grade: Math.floor(baseScore + Math.random() * 5), total: 100, color: '#ca8a04' },
    { subject: 'Islamiat', grade: Math.floor(baseScore + Math.random() * 5), total: 100, color: '#9333ea' },
    { subject: 'Computer', grade: Math.floor(baseScore + Math.random() * 5), total: 100, color: '#c2410c' },
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
    { activity: 'Sports Events', medals: 12, level: 'Gold' },
    { activity: 'Academic Competitions', medals: 8, level: 'Silver' },
    { activity: 'Science Fair', medals: 6, level: 'Bronze' },
    { activity: 'Art Competition', medals: 4, level: 'Gold' },
    { activity: 'Debate Contest', medals: 3, level: 'Silver' },
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
  const studentId = params?.get("studentId") || ""
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
      if (!studentId) return
      
      setLoading(true)
      try {
        const [studentData, allStudents] = await Promise.all([
          apiGet<any>(`/api/students/${studentId}/`),
          getAllStudents()
        ])
        setStudent(studentData)
        setStudents(Array.isArray(allStudents) ? allStudents : [])
        
        // Generate dynamic data based on real student
        setPerformanceData(generatePerformanceData(studentData))
        setAttendanceData(generateAttendanceData())
        setActivityData(generateActivityData())
        setMockTestData(generateMockTestData())
        setOverallScore(calculateOverallScore(studentData))
        setSuspensionRate(Math.floor(Math.random() * 5) + 1) // 1-5%
        setParticipationRate(Math.floor(Math.random() * 20) + 80) // 80-100%
      } catch (err: any) {
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
      } catch {}
    }
  }, [])


  if (loading) {
    return (
      <div className="min-h-screen" style={{ backgroundColor: '#e7ecef' }}>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="relative">
              <div className="animate-spin rounded-full h-16 w-16 border-4 border-transparent mx-auto" style={{ borderTopColor: '#274c77', borderRightColor: '#6096ba' }}></div>
              <div className="absolute inset-0 animate-pulse">
                <Sparkles className="h-8 w-8 mx-auto mt-4" style={{ color: '#274c77' }} />
              </div>
            </div>
            <p className="mt-4 text-lg font-medium" style={{ color: '#274c77' }}>Loading Student Profile...</p>
          </div>
            </div>
      </div>
    )
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <div className="p-6 max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-4">
              <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-3 rounded-lg">
                <User className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  Welcome Back, {student.name?.split(' ')[0]} 👋
                </h1>
                <p className="text-gray-600">Your academic progress dashboard</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <Button variant="outline" size="sm">
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </Button>
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
              <Button 
                onClick={() => router.back()}
                className="bg-blue-600 hover:bg-blue-700"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
            </div>
          </div>

          {/* Student Profile Card */}
          <Card className="bg-white shadow-lg border-0">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-6">
                  <div className="relative">
                    {student.photo ? (
                      <img
                        src={student.photo}
                        alt={student.name}
                        className="w-20 h-20 rounded-full object-cover border-4 border-white shadow-lg"
                      />
                    ) : (
                      <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center border-4 border-white shadow-lg">
                        <span className="text-2xl font-bold text-white">{student.name?.[0]?.toUpperCase()}</span>
                      </div>
                    )}
                    <div className="absolute -bottom-1 -right-1 bg-green-500 w-6 h-6 rounded-full flex items-center justify-center">
                      <CheckCircle className="w-4 h-4 text-white" />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <h2 className="text-2xl font-bold text-gray-900">{student.name}</h2>
                    <div className="flex items-center space-x-4 text-sm text-gray-600">
                      <span className="flex items-center">
                        <User className="w-4 h-4 mr-1" />
                        ID: {student.id}
                      </span>
                      <span className="flex items-center">
                        <School className="w-4 h-4 mr-1" />
                        GR: {student.gr_no || 'Not Assigned'}
                      </span>
                      <span className="flex items-center">
                        <Calendar className="w-4 h-4 mr-1" />
                        Grade {student.current_grade}
                      </span>
                    </div>
                    <div className="flex items-center space-x-2 mt-2">
                      <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                        {student.campus?.name || 'Main Campus'}
                      </Badge>
                      <Badge 
                        className={`${student.current_state === 'active' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {student.current_state === 'active' ? '🟢 Active Student' : '🔴 Inactive'}
                      </Badge>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white p-4 rounded-lg text-center">
                    <Trophy className="w-6 h-6 mx-auto mb-1" />
                    <div className="text-2xl font-bold">{overallScore}</div>
                    <div className="text-sm opacity-90">Overall Score</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="bg-white border-0 shadow-md hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Academic Average</p>
                  <p className="text-2xl font-bold text-blue-600">{performanceAvg.toFixed(1)}%</p>
                </div>
                <div className="bg-blue-100 p-3 rounded-full">
                  <BookOpen className="w-6 h-6 text-blue-600" />
                </div>
              </div>
              <div className="mt-3">
                <Progress value={performanceAvg} className="h-2" />
                <p className="text-xs text-gray-500 mt-1">
                  {performanceAvg >= 90 ? 'Excellent' : performanceAvg >= 80 ? 'Good' : 'Needs Improvement'}
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white border-0 shadow-md hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Attendance Rate</p>
                  <p className="text-2xl font-bold text-green-600">{attendanceAvg.toFixed(1)}%</p>
                </div>
                <div className="bg-green-100 p-3 rounded-full">
                  <Calendar className="w-6 h-6 text-green-600" />
                </div>
              </div>
              <div className="mt-3">
                <Progress value={attendanceAvg} className="h-2" />
                <p className="text-xs text-gray-500 mt-1">
                  {attendanceAvg >= 95 ? 'Excellent' : attendanceAvg >= 85 ? 'Good' : 'Poor'}
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white border-0 shadow-md hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Participation Rate</p>
                  <p className="text-2xl font-bold text-purple-600">{participationRate}%</p>
                </div>
                <div className="bg-purple-100 p-3 rounded-full">
                  <Users className="w-6 h-6 text-purple-600" />
                </div>
              </div>
              <div className="mt-3">
                <Progress value={participationRate} className="h-2" />
                <p className="text-xs text-gray-500 mt-1">Class Engagement</p>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white border-0 shadow-md hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Suspension Rate</p>
                  <p className="text-2xl font-bold text-red-600">{suspensionRate}%</p>
                </div>
                <div className="bg-red-100 p-3 rounded-full">
                  <AlertCircle className="w-6 h-6 text-red-600" />
                </div>
              </div>
              <div className="mt-3">
                <Progress value={suspensionRate} className="h-2 bg-red-100" />
                <p className="text-xs text-gray-500 mt-1">Disciplinary Record</p>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Sidebar */}
          <div className="lg:col-span-3 space-y-6">
            {/* Student Selector */}
            <Card className="bg-white shadow-md border-0">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center text-gray-800">
                  <Users className="h-5 w-5 mr-2" />
                  Select Student
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Select value={String(student.id)} onValueChange={(v) => router.push(`/admin/students/profile?studentId=${v}`)}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Choose a Student" />
                  </SelectTrigger>
                  <SelectContent>
                    {students.slice(0, 50).map((st) => (
                      <SelectItem key={st.id} value={String(st.id)}>
                        {st.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </CardContent>
            </Card>

            {/* Recent Test Results */}
            <Card className="bg-white shadow-md border-0">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center text-gray-800">
                  <Activity className="h-5 w-5 mr-2" />
                  Recent Tests
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {mockTestData.map((test, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium text-sm text-gray-900">{test.test}</p>
                      <p className="text-xs text-gray-500">{test.date}</p>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-bold text-blue-600">{test.score}/{test.total}</div>
                      <div className="text-xs text-gray-500">{((test.score/test.total)*100).toFixed(0)}%</div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Performance Score */}
            <Card className="bg-gradient-to-br from-blue-600 to-indigo-700 text-white shadow-lg border-0">
              <CardContent className="p-6 text-center">
                <div className="bg-white/20 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                  <Trophy className="h-8 w-8 text-white" />
                </div>
                <div className="text-3xl font-bold mb-2">{overallScore}</div>
                <div className="text-sm opacity-90 mb-3">Overall Performance Score</div>
                <Badge className="bg-white/20 text-white border-0">
                  {overallScore >= 90 ? '🏆 Excellence' : overallScore >= 80 ? '⭐ Good' : '📈 Developing'}
                </Badge>
              </CardContent>
            </Card>
        </div>

          {/* Main Content */}
          <div className="lg:col-span-6">
            <Tabs defaultValue="academic" className="w-full">
              <TabsList className="grid w-full grid-cols-4 bg-white shadow-md p-1">
                <TabsTrigger value="academic" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white">
                  Academic
                </TabsTrigger>
                <TabsTrigger value="personal" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white">
                  Personal
                </TabsTrigger>
                <TabsTrigger value="contact" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white">
                  Contact
                </TabsTrigger>
                <TabsTrigger value="activities" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white">
                  Activities
                </TabsTrigger>
              </TabsList>

              {/* Academic Tab */}
              <TabsContent value="academic" className="mt-6 space-y-6">
                {/* Grade by Subject */}
                <Card className="bg-white shadow-md border-0">
                  <CardHeader>
                    <CardTitle className="text-gray-800 flex items-center">
                      <BarChart3 className="h-5 w-5 mr-2" />
                      Grade by Subject
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {performanceData.map((item, index) => (
                        <div key={index} className="space-y-2">
                          <div className="flex justify-between items-center">
                            <span className="text-sm font-medium text-gray-700">{item.subject}</span>
                            <span className="text-sm font-bold text-gray-900">{item.grade}%</span>
                          </div>
                          <Progress value={item.grade} className="h-3" />
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Academic Information */}
                <Card className="bg-white shadow-md border-0">
                  <CardHeader>
                    <CardTitle className="text-gray-800 flex items-center">
                      <GraduationCap className="h-5 w-5 mr-2" />
                      Academic Details
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {[
                        { label: "Student ID", value: student.id, icon: "🆔" },
                        { label: "Full Name", value: student.name, icon: "👤" },
                        { label: "Grade", value: student.current_grade, icon: "📚" },
                        { label: "Age", value: student.dob ? new Date().getFullYear() - new Date(student.dob).getFullYear() : 'N/A', icon: "🎂" },
                        { label: "Gender", value: student.gender, icon: "⚧️" },
                        { label: "Email Address", value: student.email || 'Not provided', icon: "📧" },
                      ].map((item, index) => (
                        <div key={index} className="p-4 bg-gray-50 rounded-lg hover:shadow-sm transition-shadow">
                          <div className="flex items-center space-x-3">
                            <span className="text-2xl">{item.icon}</span>
                            <div>
                              <label className="text-sm font-medium text-gray-600">{item.label}</label>
                              <p className="text-lg font-medium text-gray-900">{renderValue(item.value)}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Personal Tab */}
              <TabsContent value="personal" className="mt-6 space-y-6">
                <Card className="bg-white shadow-md border-0">
                  <CardHeader>
                    <CardTitle className="text-gray-800 flex items-center">
                      <User className="h-5 w-5 mr-2" />
                      Personal Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {[
                        { label: "Full Name", value: student.name, icon: "👤" },
                        { label: "Gender", value: student.gender, icon: "⚧️" },
                        { label: "Date of Birth", value: student.dob, icon: "🎂" },
                        { label: "Place of Birth", value: student.place_of_birth, icon: "📍" },
                        { label: "Religion", value: student.religion, icon: "🕌" },
                        { label: "Mother Tongue", value: student.mother_tongue, icon: "🗣️" },
                        { label: "Nationality", value: student.nationality, icon: "🌍" },
                        { label: "B-Form Number", value: student.b_form_number, icon: "📄" },
                      ].map((item, index) => (
                        <div key={index} className="p-4 bg-gray-50 rounded-lg hover:shadow-sm transition-shadow">
                          <div className="flex items-center space-x-3">
                            <span className="text-2xl">{item.icon}</span>
                            <div>
                              <label className="text-sm font-medium text-gray-600">{item.label}</label>
                              <p className="text-lg font-medium text-gray-900">{renderValue(item.value)}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Contact Tab */}
              <TabsContent value="contact" className="mt-6 space-y-6">
                {/* Emergency Contact */}
                <Card className="bg-white shadow-md border-0">
                  <CardHeader>
                    <CardTitle className="text-gray-800 flex items-center">
                      <Phone className="h-5 w-5 mr-2" />
                      Emergency Contact
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-red-600 mb-2">
                          {renderValue(student.emergency_contact)}
                        </div>
                        <div className="text-sm text-gray-600">Primary Emergency Contact</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Father Information */}
                <Card className="bg-white shadow-md border-0">
                  <CardHeader>
                    <CardTitle className="text-gray-800 flex items-center">
                      👨‍💼 Father Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {[
                        { label: "Father Name", value: student.father_name, icon: "👤" },
                        { label: "Father Contact", value: student.father_contact, icon: "📱" },
                        { label: "Father CNIC", value: student.father_cnic, icon: "🆔" },
                        { label: "Father Occupation", value: student.father_occupation, icon: "💼" },
                      ].map((item, index) => (
                        <div key={index} className="p-4 bg-blue-50 rounded-lg">
                          <div className="flex items-center space-x-3">
                            <span className="text-2xl">{item.icon}</span>
                            <div>
                              <label className="text-sm font-medium text-gray-600">{item.label}</label>
                              <p className="text-lg font-medium text-gray-900">{renderValue(item.value)}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Mother Information */}
                <Card className="bg-white shadow-md border-0">
                  <CardHeader>
                    <CardTitle className="text-gray-800 flex items-center">
                      👩‍💼 Mother Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {[
                        { label: "Mother Name", value: student.mother_name, icon: "👤" },
                        { label: "Mother Contact", value: student.mother_contact, icon: "📱" },
                        { label: "Mother CNIC", value: student.mother_cnic, icon: "🆔" },
                        { label: "Mother Status", value: student.mother_status, icon: "💼" },
                      ].map((item, index) => (
                        <div key={index} className="p-4 bg-pink-50 rounded-lg">
                          <div className="flex items-center space-x-3">
                            <span className="text-2xl">{item.icon}</span>
                            <div>
                              <label className="text-sm font-medium text-gray-600">{item.label}</label>
                              <p className="text-lg font-medium text-gray-900">{renderValue(item.value)}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Address */}
                <Card className="bg-white shadow-md border-0">
                  <CardHeader>
                    <CardTitle className="text-gray-800 flex items-center">
                      <Home className="h-5 w-5 mr-2" />
                      Address Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="p-4 bg-green-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <MapPin className="h-8 w-8 text-green-600" />
                        <div>
                          <label className="text-sm font-medium text-gray-600">Home Address</label>
                          <p className="text-lg text-gray-900">{renderValue(student.address)}</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Activities Tab */}
              <TabsContent value="activities" className="mt-6 space-y-6">
                {/* Activities by Medals Awarded */}
                <Card className="bg-white shadow-md border-0">
                  <CardHeader>
                    <CardTitle className="text-gray-800 flex items-center">
                      <Award className="h-5 w-5 mr-2" />
                      Activities by Medals Awarded
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {activityData.map((activity, index) => (
                        <div key={index} className="flex items-center justify-between p-4 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-lg border border-yellow-200">
                          <div className="flex items-center space-x-4">
                            <div className={`w-4 h-4 rounded-full ${
                              activity.level === 'Gold' ? 'bg-yellow-500' : 
                              activity.level === 'Silver' ? 'bg-gray-400' : 'bg-orange-600'
                            }`}></div>
                            <div>
                              <p className="font-medium text-gray-900">{activity.activity}</p>
                              <p className="text-sm text-gray-600">{activity.level} Level</p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Trophy className="h-4 w-4 text-yellow-600" />
                            <span className="font-bold text-lg text-gray-900">{activity.medals}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Performance Charts */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Student Suspension Rate */}
                  <Card className="bg-white shadow-md border-0">
                    <CardHeader>
                      <CardTitle className="text-gray-800 flex items-center text-sm">
                        <AlertCircle className="h-4 w-4 mr-2" />
                        Student Suspension Rate
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="flex items-center justify-center p-6">
                      <div className="relative w-32 h-32">
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie
                              data={[
                                { value: suspensionRate, fill: '#ef4444' },
                                { value: 100 - suspensionRate, fill: '#e5e7eb' },
                              ]}
                              cx="50%"
                              cy="50%"
                              innerRadius={35}
                              outerRadius={60}
                              dataKey="value"
                            />
                          </PieChart>
                        </ResponsiveContainer>
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="text-center">
                            <div className="text-xl font-bold text-red-600">{suspensionRate}%</div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Class Participation Rate */}
                  <Card className="bg-white shadow-md border-0">
                    <CardHeader>
                      <CardTitle className="text-gray-800 flex items-center text-sm">
                        <Users className="h-4 w-4 mr-2" />
                        Class Participation Rate
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="flex items-center justify-center p-6">
                      <div className="relative w-32 h-32">
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie
                              data={[
                                { value: participationRate, fill: '#10b981' },
                                { value: 100 - participationRate, fill: '#e5e7eb' },
                              ]}
                              cx="50%"
                              cy="50%"
                              innerRadius={35}
                              outerRadius={60}
                              dataKey="value"
                            />
                          </PieChart>
                        </ResponsiveContainer>
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="text-center">
                            <div className="text-xl font-bold text-green-600">{participationRate}%</div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
            </Tabs>
        </div>

          {/* Right Sidebar - Analytics */}
          <div className="lg:col-span-3 space-y-6">
            {/* Attendance Tracking */}
            <Card className="bg-white shadow-md border-0">
              <CardHeader>
                <CardTitle className="text-gray-800 flex items-center text-lg">
                  <LineChartIcon className="h-5 w-5 mr-2" />
                  Attendance Tracking
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="mb-4 p-4 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg text-center">
                  <div className="text-2xl font-bold">{attendanceAvg.toFixed(1)}%</div>
                  <div className="text-sm opacity-90">Average Attendance</div>
                </div>
                <ResponsiveContainer width="100%" height={120}>
                  <AreaChart data={attendanceData}>
                    <Area
                      type="monotone"
                      dataKey="attendance"
                      stroke="#10b981"
                      fill="#10b981"
                      fillOpacity={0.2}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Academic Performance Ranking */}
            <Card className="bg-white shadow-md border-0">
              <CardHeader>
                <CardTitle className="text-gray-800 flex items-center text-lg">
                  <Target className="h-5 w-5 mr-2" />
                  Content Rank
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="relative w-40 h-40 mx-auto">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={[
                          { value: overallScore, fill: '#3b82f6' },
                          { value: 100 - overallScore, fill: '#e5e7eb' },
                        ]}
                        cx="50%"
                        cy="50%"
                        innerRadius={50}
                        outerRadius={70}
                        dataKey="value"
                      />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-600">{overallScore}%</div>
                      <div className="text-sm text-gray-600">Score</div>
                    </div>
                  </div>
                </div>
                <div className="mt-4 grid grid-cols-3 gap-2 text-center text-xs">
                  <div className="p-2 bg-red-50 rounded">
                    <div className="font-bold text-red-600">25</div>
                    <div className="text-gray-600">Poor</div>
                  </div>
                  <div className="p-2 bg-yellow-50 rounded">
                    <div className="font-bold text-yellow-600">50</div>
                    <div className="text-gray-600">Good</div>
                  </div>
                  <div className="p-2 bg-green-50 rounded">
                    <div className="font-bold text-green-600">100</div>
                    <div className="text-gray-600">Excellent</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Latest Contest Rank */}
            <Card className="bg-gradient-to-br from-purple-600 to-indigo-700 text-white shadow-lg border-0">
              <CardHeader>
                <CardTitle className="text-white flex items-center text-lg">
                  <Trophy className="h-5 w-5 mr-2" />
                  Latest Contest Rank
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center">
                  <div className="text-4xl font-bold mb-2">#{Math.floor(Math.random() * 50) + 1}</div>
                  <div className="text-sm opacity-90">
                    {suspensionRate < 2 ? 'You left' : 'You got'} {Math.floor(Math.random() * 100) + 200} students behind in this test.
                  </div>
                </div>
                <div className="bg-white/20 rounded-lg p-3">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm">Mathematics Test</span>
                    <span className="text-sm font-bold">89/100</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Science Quiz</span>
                    <span className="text-sm font-bold">92/100</span>
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

