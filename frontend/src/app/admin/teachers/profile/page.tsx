"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { apiGet, getAllTeachers, getAllCampuses } from "@/lib/api"
import { ArrowLeft, User, Phone, MapPin, GraduationCap, Users, Calendar, Award, BookOpen, Mail, Home, School, CheckCircle, AlertCircle, BarChart3, RefreshCw, Download, Share, Edit, Clock, Briefcase, Star, Trophy, Target, Activity } from "lucide-react"
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, PieChart, Pie, Cell, LineChart, Line, AreaChart, Area } from 'recharts'

// Generate mock performance data based on real teacher
const generatePerformanceData = (teacher: any) => {
  const baseScore = 85 + Math.random() * 15;
  return [
    { subject: 'Teaching Quality', score: Math.floor(baseScore + Math.random() * 5), total: 100, color: '#2563eb' },
    { subject: 'Student Feedback', score: Math.floor(baseScore + Math.random() * 5), total: 100, color: '#dc2626' },
    { subject: 'Class Management', score: Math.floor(baseScore + Math.random() * 5), total: 100, color: '#16a34a' },
    { subject: 'Attendance', score: Math.floor(baseScore + Math.random() * 5), total: 100, color: '#ca8a04' },
    { subject: 'Professionalism', score: Math.floor(baseScore + Math.random() * 5), total: 100, color: '#9333ea' },
    { subject: 'Innovation', score: Math.floor(baseScore + Math.random() * 5), total: 100, color: '#c2410c' },
  ]
}

const generateAttendanceData = () => {
  return [
    { month: 'Jan', attendance: 95 + Math.floor(Math.random() * 5), present: 22, absent: 1 },
    { month: 'Feb', attendance: 93 + Math.floor(Math.random() * 5), present: 20, absent: 1 },
    { month: 'Mar', attendance: 97 + Math.floor(Math.random() * 3), present: 23, absent: 0 },
    { month: 'Apr', attendance: 91 + Math.floor(Math.random() * 7), present: 21, absent: 2 },
    { month: 'May', attendance: 94 + Math.floor(Math.random() * 4), present: 22, absent: 1 },
    { month: 'Jun', attendance: 96 + Math.floor(Math.random() * 3), present: 23, absent: 0 },
  ]
}

const generateActivityData = () => {
  return [
    { activity: 'Extra Classes', count: 12, level: 'Gold' },
    { activity: 'Student Support', count: 8, level: 'Silver' },
    { activity: 'Parent Meetings', count: 6, level: 'Bronze' },
    { activity: 'Training Sessions', count: 4, level: 'Gold' },
    { activity: 'Workshops', count: 3, level: 'Silver' },
  ]
}

const calculateOverallScore = (teacher: any) => {
  let score = 70;
  if (teacher.first_name && teacher.last_name) score += 5;
  if (teacher.subject) score += 5;
  if (teacher.campus) score += 5;
  if (teacher.email) score += 5;
  if (teacher.phone) score += 5;
  if (teacher.experience) score += 5;
  return Math.min(score + Math.floor(Math.random() * 10), 98);
}

export default function TeacherProfilePage() {
  useEffect(() => {
    document.title = "Teacher Profile | IAK SMS";
  }, []);
  
  const router = useRouter()
  const params = useSearchParams()
  const teacherId = params?.get("teacherId") || ""
  const [teacher, setTeacher] = useState<any>(null)
  const [teachers, setTeachers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [performanceData, setPerformanceData] = useState<any[]>([])
  const [attendanceData, setAttendanceData] = useState<any[]>([])
  const [activityData, setActivityData] = useState<any[]>([])
  const [overallScore, setOverallScore] = useState(0)

  useEffect(() => {
    async function fetchData() {
      if (!teacherId) return
      
      setLoading(true)
      try {
        const [teachersData, campusesData] = await Promise.all([
          getAllTeachers(),
          getAllCampuses()
        ])
        
        // Create campus mapping
        const campusMap = new Map()
        if (Array.isArray(campusesData)) {
          campusesData.forEach((campus: any) => {
            campusMap.set(campus.id, campus.name)
          })
        }
        
        // Find the current teacher
        const currentTeacher = Array.isArray(teachersData) ? teachersData.find(t => t.id == teacherId) : null
        if (currentTeacher) {
          // Map teacher data
          const mappedTeacher = {
            ...currentTeacher,
            name: `${currentTeacher.first_name || ''} ${currentTeacher.last_name || ''}`.trim() || currentTeacher.username || 'Unknown',
            campus_name: campusMap.get(currentTeacher.campus) || 'Unknown Campus',
            full_name: `${currentTeacher.first_name || ''} ${currentTeacher.last_name || ''}`.trim() || currentTeacher.username || 'Unknown',
            display_name: `${currentTeacher.first_name || ''} ${currentTeacher.last_name || ''}`.trim() || currentTeacher.username || 'Unknown'
          }
          
          setTeacher(mappedTeacher)
          setTeachers(Array.isArray(teachersData) ? teachersData : [])
          
          // Generate dynamic data based on real teacher
          setPerformanceData(generatePerformanceData(mappedTeacher))
          setAttendanceData(generateAttendanceData())
          setActivityData(generateActivityData())
          setOverallScore(calculateOverallScore(mappedTeacher))
        }
      } catch (err: any) {
        console.error("Error fetching teacher:", err)
        setError(err.message || "Failed to load teacher")
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [teacherId])

  if (loading) {
    return (
      <div className="min-h-screen" style={{ backgroundColor: '#e7ecef' }}>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="relative">
              <div className="animate-spin rounded-full h-16 w-16 border-4 border-transparent mx-auto" style={{ borderTopColor: '#274c77', borderRightColor: '#6096ba' }}></div>
            </div>
            <p className="mt-4 text-lg font-medium" style={{ color: '#274c77' }}>Loading Teacher Profile...</p>
          </div>
        </div>
      </div>
    )
  }

  if (error || !teacher) {
    return (
      <div className="min-h-screen" style={{ backgroundColor: '#e7ecef' }}>
        <div className="max-w-md mx-auto pt-20">
          <Card style={{ backgroundColor: '#a3cef1', borderColor: '#6096ba' }}>
            <CardHeader>
              <CardTitle style={{ color: '#274c77' }}>Error</CardTitle>
            </CardHeader>
            <CardContent>
              <div style={{ color: '#274c77' }}>{error || "Teacher not found"}</div>
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
  const performanceAvg = performanceData.reduce((acc, curr) => acc + curr.score, 0) / performanceData.length;

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
                  Teacher Profile - {teacher.display_name} 👨‍🏫
                </h1>
                <p className="text-gray-600">Complete teacher information and performance dashboard</p>
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

          {/* Teacher Profile Card */}
          <Card className="bg-white shadow-lg border-0">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-6">
                  <div className="relative">
                    {teacher.photo ? (
                      <img
                        src={teacher.photo}
                        alt={teacher.display_name}
                        className="w-20 h-20 rounded-full object-cover border-4 border-white shadow-lg"
                      />
                    ) : (
                      <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center border-4 border-white shadow-lg">
                        <span className="text-2xl font-bold text-white">{teacher.display_name?.[0]?.toUpperCase()}</span>
                      </div>
                    )}
                    <div className="absolute -bottom-1 -right-1 bg-green-500 w-6 h-6 rounded-full flex items-center justify-center">
                      <CheckCircle className="w-4 h-4 text-white" />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <h2 className="text-2xl font-bold text-gray-900">{teacher.display_name}</h2>
                    <div className="flex items-center space-x-4 text-sm text-gray-600">
                      <span className="flex items-center">
                        <User className="w-4 h-4 mr-1" />
                        ID: {teacher.id}
                      </span>
                      <span className="flex items-center">
                        <School className="w-4 h-4 mr-1" />
                        {teacher.campus_name}
                      </span>
                      <span className="flex items-center">
                        <BookOpen className="w-4 h-4 mr-1" />
                        {teacher.subject || 'Not Assigned'}
                      </span>
                    </div>
                    <div className="flex items-center space-x-2 mt-2">
                      <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                        {teacher.campus_name}
                      </Badge>
                      <Badge 
                        className={`${teacher.is_active 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {teacher.is_active ? '🟢 Active Teacher' : '🔴 Inactive'}
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
                  <p className="text-sm font-medium text-gray-600">Performance Average</p>
                  <p className="text-2xl font-bold text-blue-600">{performanceAvg.toFixed(1)}%</p>
                </div>
                <div className="bg-blue-100 p-3 rounded-full">
                  <BarChart3 className="w-6 h-6 text-blue-600" />
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
                  <p className="text-sm font-medium text-gray-600">Experience</p>
                  <p className="text-2xl font-bold text-purple-600">{teacher.experience || 'N/A'}</p>
                </div>
                <div className="bg-purple-100 p-3 rounded-full">
                  <Award className="w-6 h-6 text-purple-600" />
                </div>
              </div>
              <div className="mt-3">
                <p className="text-xs text-gray-500 mt-1">Years of Service</p>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white border-0 shadow-md hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Classes Assigned</p>
                  <p className="text-2xl font-bold text-orange-600">{teacher.classes ? teacher.classes.split(',').length : 0}</p>
                </div>
                <div className="bg-orange-100 p-3 rounded-full">
                  <Users className="w-6 h-6 text-orange-600" />
                </div>
              </div>
              <div className="mt-3">
                <p className="text-xs text-gray-500 mt-1">Active Classes</p>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Sidebar */}
          <div className="lg:col-span-3 space-y-6">
            {/* Teacher Selector */}
            <Card className="bg-white shadow-md border-0">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center text-gray-800">
                  <Users className="h-5 w-5 mr-2" />
                  Select Teacher
                </CardTitle>
              </CardHeader>
              <CardContent>
                <select 
                  value={teacher.id} 
                  onChange={(e) => router.push(`/admin/teachers/profile?teacherId=${e.target.value}`)}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  {teachers.slice(0, 50).map((t) => (
                    <option key={t.id} value={t.id}>
                      {`${t.first_name || ''} ${t.last_name || ''}`.trim() || t.username || 'Unknown'}
                    </option>
                  ))}
                </select>
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
            <Tabs defaultValue="personal" className="w-full">
              <TabsList className="grid w-full grid-cols-4 bg-white shadow-md p-1">
                <TabsTrigger value="personal" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white">
                  Personal
                </TabsTrigger>
                <TabsTrigger value="professional" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white">
                  Professional
                </TabsTrigger>
                <TabsTrigger value="contact" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white">
                  Contact
                </TabsTrigger>
                <TabsTrigger value="performance" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white">
                  Performance
                </TabsTrigger>
              </TabsList>

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
                        { label: "Teacher ID", value: teacher.id, icon: "🆔" },
                        { label: "Full Name", value: teacher.display_name, icon: "👤" },
                        { label: "Username", value: teacher.username, icon: "👨‍💼" },
                        { label: "Email", value: teacher.email, icon: "📧" },
                        { label: "Phone", value: teacher.phone, icon: "📱" },
                        { label: "Date of Birth", value: teacher.date_of_birth, icon: "🎂" },
                        { label: "Gender", value: teacher.gender, icon: "⚧️" },
                        { label: "CNIC", value: teacher.cnic, icon: "🆔" },
                        { label: "Address", value: teacher.address, icon: "📍" },
                        { label: "Emergency Contact", value: teacher.emergency_contact, icon: "🚨" },
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

              {/* Professional Tab */}
              <TabsContent value="professional" className="mt-6 space-y-6">
                <Card className="bg-white shadow-md border-0">
                  <CardHeader>
                    <CardTitle className="text-gray-800 flex items-center">
                      <GraduationCap className="h-5 w-5 mr-2" />
                      Professional Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {[
                        { label: "Subject", value: teacher.subject, icon: "📚" },
                        { label: "Campus", value: teacher.campus_name, icon: "🏫" },
                        { label: "Classes", value: teacher.classes, icon: "👥" },
                        { label: "Experience", value: teacher.experience, icon: "⭐" },
                        { label: "Joining Date", value: teacher.joining_date, icon: "📅" },
                        { label: "Qualification", value: teacher.qualification, icon: "🎓" },
                        { label: "Specialization", value: teacher.specialization, icon: "🔬" },
                        { label: "Status", value: teacher.is_active ? 'Active' : 'Inactive', icon: "✅" },
                        { label: "Salary", value: teacher.salary, icon: "💰" },
                        { label: "Department", value: teacher.department, icon: "🏢" },
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
                <Card className="bg-white shadow-md border-0">
                  <CardHeader>
                    <CardTitle className="text-gray-800 flex items-center">
                      <Phone className="h-5 w-5 mr-2" />
                      Contact Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {[
                        { label: "Primary Email", value: teacher.email, icon: "📧" },
                        { label: "Phone Number", value: teacher.phone, icon: "📱" },
                        { label: "Alternative Email", value: teacher.alternative_email, icon: "📨" },
                        { label: "Emergency Contact", value: teacher.emergency_contact, icon: "🚨" },
                        { label: "Home Address", value: teacher.address, icon: "🏠" },
                        { label: "Office Extension", value: teacher.office_extension, icon: "☎️" },
                        { label: "WhatsApp", value: teacher.whatsapp, icon: "💬" },
                        { label: "LinkedIn", value: teacher.linkedin, icon: "💼" },
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

              {/* Performance Tab */}
              <TabsContent value="performance" className="mt-6 space-y-6">
                {/* Performance by Category */}
                <Card className="bg-white shadow-md border-0">
                  <CardHeader>
                    <CardTitle className="text-gray-800 flex items-center">
                      <BarChart3 className="h-5 w-5 mr-2" />
                      Performance by Category
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {performanceData.map((item, index) => (
                        <div key={index} className="space-y-2">
                          <div className="flex justify-between items-center">
                            <span className="text-sm font-medium text-gray-700">{item.subject}</span>
                            <span className="text-sm font-bold text-gray-900">{item.score}%</span>
                          </div>
                          <Progress value={item.score} className="h-3" />
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Activities */}
                <Card className="bg-white shadow-md border-0">
                  <CardHeader>
                    <CardTitle className="text-gray-800 flex items-center">
                      <Activity className="h-5 w-5 mr-2" />
                      Teacher Activities
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
                            <span className="font-bold text-lg text-gray-900">{activity.count}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>

          {/* Right Sidebar - Analytics */}
          <div className="lg:col-span-3 space-y-6">
            {/* Attendance Tracking */}
            <Card className="bg-white shadow-md border-0">
              <CardHeader>
                <CardTitle className="text-gray-800 flex items-center text-lg">
                  <LineChart className="h-5 w-5 mr-2" />
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

            {/* Performance Overview */}
            <Card className="bg-white shadow-md border-0">
              <CardHeader>
                <CardTitle className="text-gray-800 flex items-center text-lg">
                  <Target className="h-5 w-5 mr-2" />
                  Performance Overview
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
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card className="bg-white shadow-md border-0">
              <CardHeader>
                <CardTitle className="text-gray-800 flex items-center text-lg">
                  <Activity className="h-5 w-5 mr-2" />
                  Quick Actions
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button className="w-full justify-start bg-blue-600 hover:bg-blue-700 text-white">
                  <Mail className="w-4 h-4 mr-2" />
                  Send Message
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Edit className="w-4 h-4 mr-2" />
                  Edit Profile
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Download className="w-4 h-4 mr-2" />
                  Download Report
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Share className="w-4 h-4 mr-2" />
                  Share Profile
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}