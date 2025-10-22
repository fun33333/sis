"use client"

import React, { useState, useEffect, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { 
  ArrowLeft, 
  GraduationCap, 
  Users, 
  User, 
  XCircle,
  BarChart3,
  Info,
  Award,
  Briefcase,
  Home,
  Clock
} from "lucide-react"
import { getTeacherById, getAllTeachers } from "@/lib/api"

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

// Generate mock data
const generateAttendanceData = () => {
  return [
    { day: 'Mon', present: 95, absent: 5 },
    { day: 'Tue', present: 92, absent: 8 },
    { day: 'Wed', present: 98, absent: 2 },
    { day: 'Thu', present: 90, absent: 10 },
    { day: 'Fri', present: 96, absent: 4 },
    { day: 'Sat', present: 94, absent: 6 },
  ]
}

const generatePerformanceData = () => {
  return [
    { class: 'Class IV, C', performance: 92, color: colors.primary },
    { class: 'Class III, B', performance: 88, color: colors.secondary },
    { class: 'Class V, A', performance: 85, color: colors.dark },
    { class: 'Class V, B', performance: 90, color: colors.warning },
  ]
}

const generateStudentProgress = () => {
  return [
    { name: 'Ali Ahmed', class: 'IV, B', score: 95, avatar: 'A' },
    { name: 'Fatima Khan', class: 'V, A', score: 92, avatar: 'F' },
    { name: 'Hassan Ali', class: 'III, B', score: 88, avatar: 'H' },
    { name: 'Ayesha Siddiqui', class: 'IV, C', score: 90, avatar: 'A' },
  ]
}

function TeacherProfileContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const teacherId = searchParams.get('id')
  
  const [teacher, setTeacher] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [attendanceData] = useState(generateAttendanceData())
  const [performanceData] = useState(generatePerformanceData())
  const [studentProgress] = useState(generateStudentProgress())

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

  const renderValue = (value: any) => {
    if (value === null || value === undefined || value === '') return 'Not provided'
    if (typeof value === 'boolean') return value ? 'Yes' : 'No'
    if (Array.isArray(value)) return value.length > 0 ? value.join(', ') : 'Not provided'
    return String(value)
  }

  const getInitials = (name: string) => {
    return name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || 'T'
  }

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

  const completionPercentage = 95; // Mock completion percentage

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto p-6">
        {/* Top Header Section */}
        <div className="mb-6">
          <Card className="shadow-2xl border-0" style={{ background: 'linear-gradient(135deg, #1e40af 0%, #3b82f6 100%)' }}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between text-white">
              <div>
                  <h1 className="text-3xl font-bold">Good Morning {teacher.full_name?.split(' ')[0] || 'Teacher'}</h1>
                  <p className="text-blue-100 mt-1">Have a Good day at work</p>
                  <p className="text-sm text-blue-200 mt-2 flex items-center">
                    <span className="bg-blue-500/30 px-3 py-1 rounded-full">
                      Notice: There is a staff meeting at 9AM today. Don't forget to Attend!!!
                    </span>
                  </p>
                </div>
                <div className="flex space-x-4">
                  <div className="text-center bg-white/10 backdrop-blur-lg rounded-xl p-4 min-w-[120px]">
                    <Clock className="w-8 h-8 mx-auto mb-2" />
                    <div className="text-sm">Time Table</div>
                  </div>
                  <div className="text-center bg-white/10 backdrop-blur-lg rounded-xl p-4 min-w-[120px]">
                    <Users className="w-8 h-8 mx-auto mb-2" />
                    <div className="text-sm">Attendance</div>
              </div>
                  <div className="text-center bg-white/10 backdrop-blur-lg rounded-xl p-4 min-w-[120px]">
                    <Award className="w-8 h-8 mx-auto mb-2" />
                    <div className="text-sm">Exam Result</div>
            </div>
                  <div className="text-center bg-white/10 backdrop-blur-lg rounded-xl p-4 min-w-[120px]">
                    <BarChart3 className="w-8 h-8 mx-auto mb-2" />
                    <div className="text-sm">Reports</div>
            </div>
          </div>
        </div>
            </CardContent>
          </Card>
      </div>

      {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Profile & Schedule */}
          <div className="space-y-6">
            {/* Profile Card */}
            <Card className="shadow-2xl border-0 overflow-hidden" style={{ background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)' }}>
              <CardContent className="p-6">
                <div className="flex flex-col">
                  {/* Profile Image and Info */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-4">
                      {/* Profile Image */}
                      <div className="relative">
                        {teacher.profile_image ? (
                          <img 
                            src={teacher.profile_image} 
                            alt={teacher.full_name}
                            className="w-20 h-20 rounded-lg object-cover border-2 border-blue-500"
                          />
                        ) : (
                          <div 
                            className="w-20 h-20 rounded-lg flex items-center justify-center text-3xl font-bold text-white border-2 border-blue-500"
                            style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}
                          >
                            {getInitials(teacher.full_name || 'T')}
                  </div>
                        )}
                  </div>
                      
                      {/* Teacher Info */}
                      <div className="text-white">
                        <h3 className="font-bold text-xl mb-1">{teacher.full_name || 'Unknown'}</h3>
                        <p className="text-sm text-gray-300 mb-2">
                          Classes Taken: {teacher.current_classes_taught || 'N/A'}
                        </p>
                        <Badge className="bg-blue-600 text-white text-xs px-3 py-1">
                          {teacher.employee_code || 'N/A'}
                        </Badge>
                  </div>
                  </div>
                    
                    {/* Back Button */}
                    <Button 
                      size="sm" 
                      className="bg-blue-600 hover:bg-blue-700 text-white"
                      onClick={() => router.back()}
                    >
                      <ArrowLeft className="w-4 h-4 mr-2" />
                      Back
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Completion Circle */}
            <Card className="shadow-2xl border-0">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex-1">
                    <div className="relative w-32 h-32 mx-auto">
                      <svg className="w-32 h-32 transform -rotate-90">
                        <circle
                          cx="64"
                          cy="64"
                          r="56"
                          stroke="#e5e7eb"
                          strokeWidth="8"
                          fill="none"
                        />
                        <circle
                          cx="64"
                          cy="64"
                          r="56"
                          stroke={colors.primary}
                          strokeWidth="8"
                          fill="none"
                          strokeDasharray={`${(completionPercentage / 100) * 352} 352`}
                          strokeLinecap="round"
                        />
                      </svg>
                      <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <span className="text-3xl font-bold" style={{ color: colors.primary }}>
                          {completionPercentage}%
                        </span>
                </div>
                </div>
                  </div>
                  <div className="flex-1 text-center">
                    <h4 className="text-sm font-semibold text-gray-700 mb-2">
                      You Have Completed
                    </h4>
                    <p className="text-2xl font-bold" style={{ color: colors.primary }}>
                      {completionPercentage}%
                    </p>
                    <p className="text-sm text-gray-500">of Today's Plan</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Today's Classes */}
            <Card className="shadow-2xl border-0">
              <CardHeader>
                <CardTitle className="text-lg">Today's Class</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {teacher.current_classes_taught?.split(',').slice(0, 4).map((cls: string, idx: number) => (
                  <div 
                    key={idx}
                    className="p-3 rounded-lg text-white text-sm font-medium"
                    style={{ 
                      background: idx === 0 ? '#ef4444' : idx === 1 ? '#ef4444' : idx === 2 ? '#3b82f6' : '#3b82f6' 
                    }}
                  >
                    <div className="flex items-center justify-between">
                      <span>
                        {idx === 0 ? '09:00 - 09:45' : idx === 1 ? '09:45 - 10:30' : idx === 2 ? '11:30 - 12:50' : '01:30 - 02:15'}
                      </span>
                      <Clock className="w-4 h-4" />
                    </div>
                    <div className="mt-1 font-bold">{cls.trim()}</div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Middle Column - Charts & Performance */}
          <div className="lg:col-span-2 space-y-6">
            {/* Tabs */}
            <Tabs defaultValue="overview" className="space-y-4">
              <TabsList className="grid w-full grid-cols-2 bg-white rounded-xl shadow-lg p-1">
                <TabsTrigger 
                  value="overview"
                  className="rounded-lg data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600 data-[state=active]:to-purple-600 data-[state=active]:text-white"
                >
                  <BarChart3 className="w-4 h-4 mr-2" />
                  Overview
                </TabsTrigger>
                <TabsTrigger 
                  value="info"
                  className="rounded-lg data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600 data-[state=active]:to-purple-600 data-[state=active]:text-white"
                >
                  <Info className="w-4 h-4 mr-2" />
                  Information
                </TabsTrigger>
              </TabsList>

              {/* Overview Tab */}
              <TabsContent value="overview" className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Attendance */}
                  <Card className="shadow-2xl border-0">
                    <CardHeader>
                      <CardTitle className="text-lg flex items-center justify-between">
                        <span>Attendance</span>
                        <Badge variant="outline">This Month</Badge>
                </CardTitle>
              </CardHeader>
                    <CardContent>
                      <div className="mb-4">
                        <div className="flex items-center justify-center space-x-4 mb-4">
                          <div className="flex items-center">
                            <div className="w-3 h-3 rounded-full bg-green-500 mr-2"></div>
                            <span className="text-sm">Present</span>
                          </div>
                          <div className="flex items-center">
                            <div className="w-3 h-3 rounded-full bg-red-500 mr-2"></div>
                            <span className="text-sm">Absent</span>
                  </div>
                  </div>
                        <div className="flex justify-center space-x-2 mb-4">
                          {['M', 'T', 'W', 'T', 'F', 'S'].map((day, idx) => (
                            <div 
                              key={idx}
                              className="w-10 h-10 rounded flex items-center justify-center text-white text-sm font-bold"
                              style={{ backgroundColor: idx === 5 ? '#6b7280' : '#10b981' }}
                            >
                              {day}
                  </div>
                          ))}
                  </div>
                        <p className="text-xs text-gray-500 text-center mb-4">Last 7 Days | 14 May 2024 - 21 May 2024</p>
                  </div>
                      <div className="relative w-40 h-40 mx-auto">
                        <svg className="w-40 h-40 transform -rotate-90">
                          <circle
                            cx="80"
                            cy="80"
                            r="70"
                            stroke="#ef4444"
                            strokeWidth="12"
                            fill="none"
                            strokeDasharray="110 440"
                          />
                          <circle
                            cx="80"
                            cy="80"
                            r="70"
                            stroke="#10b981"
                            strokeWidth="12"
                            fill="none"
                            strokeDasharray="330 440"
                            strokeDashoffset="-110"
                          />
                        </svg>
                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                          <span className="text-sm text-gray-500">Attendance</span>
                          <span className="text-3xl font-bold" style={{ color: colors.primary }}>95%</span>
                  </div>
                </div>
              </CardContent>
            </Card>

                  {/* Best Performers */}
                  <Card className="shadow-2xl border-0">
                    <CardHeader>
                      <CardTitle className="text-lg flex items-center justify-between">
                        <span>Best Performers</span>
                        <Badge variant="outline">This Month</Badge>
                </CardTitle>
              </CardHeader>
                    <CardContent className="space-y-3">
                      {performanceData.map((item, idx) => (
                        <div key={idx} className="space-y-2">
                          <div className="flex items-center justify-between text-sm">
                            <span className="font-medium">{item.class}</span>
                            <span className="text-gray-500">{item.performance}%</span>
                  </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div 
                              className="h-2 rounded-full"
                              style={{ 
                                width: `${item.performance}%`,
                                backgroundColor: item.color 
                              }}
                            />
                  </div>
                </div>
                      ))}
              </CardContent>
            </Card>
          </div>

                {/* Student Progress */}
                <Card className="shadow-2xl border-0">
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center justify-between">
                      <span>Student Progress</span>
                      <Badge variant="outline">Top Performers</Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {studentProgress.map((student, idx) => (
                        <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div className="flex items-center space-x-3">
                            <div 
                              className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold"
                              style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}
                            >
                              {student.avatar}
                            </div>
                            <div>
                              <p className="font-semibold">{student.name}</p>
                              <p className="text-sm text-gray-500">Class {student.class}</p>
                            </div>
                  </div>
                          <div className="text-right">
                            <Badge className="bg-green-500 text-white">{student.score}%</Badge>
                  </div>
                </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Information Tab */}
              <TabsContent value="info" className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Personal Information */}
                  <Card className="shadow-2xl border-0">
                    <CardHeader style={{ background: `linear-gradient(135deg, ${colors.primary}, ${colors.secondary})` }}>
                      <CardTitle className="flex items-center text-white">
                        <User className="w-5 h-5 mr-2" />
                        Personal Information
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3 pt-4">
                      <InfoRow label="Full Name" value={renderValue(teacher.full_name)} />
                      <InfoRow label="Email" value={renderValue(teacher.email)} />
                      <InfoRow label="Phone" value={renderValue(teacher.phone_number)} />
                      <InfoRow label="Gender" value={renderValue(teacher.gender)} />
                      <InfoRow label="Date of Birth" value={renderValue(teacher.date_of_birth)} />
                      <InfoRow label="CNIC" value={renderValue(teacher.cnic)} />
                      <InfoRow label="Religion" value={renderValue(teacher.religion)} />
                      <InfoRow label="Nationality" value={renderValue(teacher.nationality)} />
                    </CardContent>
                  </Card>

                  {/* Professional Information */}
                  <Card className="shadow-2xl border-0">
                    <CardHeader style={{ background: `linear-gradient(135deg, ${colors.secondary}, ${colors.accent})` }}>
                      <CardTitle className="flex items-center text-white">
                        <Briefcase className="w-5 h-5 mr-2" />
                        Professional Information
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3 pt-4">
                      <InfoRow label="Employee Code" value={renderValue(teacher.employee_code)} />
                      <InfoRow label="Joining Date" value={renderValue(teacher.joining_date)} />
                      <InfoRow label="Experience" value={`${renderValue(teacher.experience_years)} years`} />
                      <InfoRow label="Qualification" value={renderValue(teacher.qualification)} />
                      <InfoRow label="Campus" value={renderValue(teacher.campus_name)} />
                      <InfoRow label="Current Classes" value={renderValue(teacher.current_classes_taught)} />
                      <InfoRow label="Coordinators" value={renderValue(teacher.coordinator_names)} />
                      <InfoRow label="Status" value={teacher.is_active ? 'Active' : 'Inactive'} />
              </CardContent>
            </Card>

                  {/* Address Information */}
                  <Card className="shadow-2xl border-0">
                    <CardHeader style={{ background: `linear-gradient(135deg, #10b981, #059669)` }}>
                      <CardTitle className="flex items-center text-white">
                        <Home className="w-5 h-5 mr-2" />
                        Address Information
                </CardTitle>
              </CardHeader>
                    <CardContent className="space-y-3 pt-4">
                      <InfoRow label="Current Address" value={renderValue(teacher.address)} />
                      <InfoRow label="Permanent Address" value={renderValue(teacher.permanent_address)} />
                      <InfoRow label="Emergency Contact" value={renderValue(teacher.emergency_contact)} />
              </CardContent>
            </Card>

                  {/* Academic Information */}
                  <Card className="shadow-2xl border-0">
                    <CardHeader style={{ background: `linear-gradient(135deg, #f59e0b, #d97706)` }}>
                      <CardTitle className="flex items-center text-white">
                        <GraduationCap className="w-5 h-5 mr-2" />
                        Academic Information
                </CardTitle>
              </CardHeader>
                    <CardContent className="space-y-3 pt-4">
                      <InfoRow label="Education Level" value={renderValue(teacher.education_level)} />
                      <InfoRow label="Institution" value={renderValue(teacher.institution_name)} />
                      <InfoRow label="Subjects" value={renderValue(teacher.education_subjects)} />
                      <InfoRow label="Degree/Diploma" value={renderValue(teacher.degree_diploma)} />
                      <InfoRow label="Assigned Classroom" value={renderValue(teacher.assigned_classroom?.grade_name)} />
              </CardContent>
            </Card>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  )
}

// Helper Component
function InfoRow({ label, value }: { label: string, value: string }) {
  return (
    <div className="flex items-start justify-between py-2 border-b border-gray-100 last:border-0">
      <span className="text-sm font-medium text-gray-500">{label}</span>
      <span className="text-sm font-medium text-gray-900 text-right">{value}</span>
    </div>
  )
}

export default function TeacherProfilePage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-screen">Loading...</div>}>
      <TeacherProfileContent />
    </Suspense>
  )
}
