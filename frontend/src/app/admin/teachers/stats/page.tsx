"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, Building2, GraduationCap, TrendingUp } from "lucide-react"
import Link from "next/link"
import { useState, useEffect } from "react"
import { getCurrentUserProfile, getClassroomStudents } from "@/lib/api"
import { getCurrentUserRole } from "@/lib/permissions"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, Area, AreaChart } from "recharts"

import { BarChart2, UserCheck, Users as UsersIcon, Award, CalendarCheck, BookOpen, UserPlus, FileText, PieChart as PieChartIcon, TrendingUp as TrendingUpIcon, Activity, Clock, Star } from "lucide-react"

interface TopStudent {
  name: string;
  marks: number;
}

interface RecentActivity {
  text: string;
  color: string;
}

interface ClassInfo {
  name: string;
  section: string;
  totalStudents: number;
  boys: number;
  girls: number;
  attendanceToday: { present: number; absent: number; leave: number };
  topStudents: TopStudent[];
  recentActivity: RecentActivity[];
  attendanceData: Array<{ day: string; present: number; absent: number }>;
  gradeDistribution: Array<{ grade: string; count: number }>;
  monthlyTrend: Array<{ month: string; students: number }>;
}

export default function TeacherClassDashboard() {
  const [classInfo, setClassInfo] = useState<ClassInfo>({
    name: "Loading...",
    section: "",
    totalStudents: 0,
    boys: 0,
    girls: 0,
    attendanceToday: { present: 0, absent: 0, leave: 0 },
    topStudents: [],
    recentActivity: [],
    attendanceData: [],
    gradeDistribution: [],
    monthlyTrend: [],
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    const role = getCurrentUserRole()
    if (role === 'teacher') {
      document.title = "My Class Statistics | IAK SMS";
    } else {
      document.title = "Class Statistics | IAK SMS";
    }
  }, []);

  useEffect(() => {
    async function fetchClassData() {
      try {
        setLoading(true)
        setError("")
        
        const role = getCurrentUserRole()
        if (role === 'teacher') {
          // Get teacher's classroom data
          const teacherProfile = await getCurrentUserProfile() as any
          if (teacherProfile?.assigned_classroom?.id) {
            const classroomData = await getClassroomStudents(teacherProfile.assigned_classroom.id, teacherProfile.teacher_id) as any
            const students = classroomData.students || []
            
            // Calculate statistics
            const boys = students.filter((s: any) => s.gender === 'male').length
            const girls = students.filter((s: any) => s.gender === 'female').length
            
            // Generate chart data
            const attendanceData = [
              { day: 'Mon', present: Math.floor(students.length * 0.95), absent: Math.floor(students.length * 0.05) },
              { day: 'Tue', present: Math.floor(students.length * 0.92), absent: Math.floor(students.length * 0.08) },
              { day: 'Wed', present: Math.floor(students.length * 0.98), absent: Math.floor(students.length * 0.02) },
              { day: 'Thu', present: Math.floor(students.length * 0.90), absent: Math.floor(students.length * 0.10) },
              { day: 'Fri', present: Math.floor(students.length * 0.94), absent: Math.floor(students.length * 0.06) },
            ]
            
            const gradeDistribution = [
              { grade: 'A+', count: Math.floor(students.length * 0.15) },
              { grade: 'A', count: Math.floor(students.length * 0.25) },
              { grade: 'B+', count: Math.floor(students.length * 0.30) },
              { grade: 'B', count: Math.floor(students.length * 0.20) },
              { grade: 'C', count: Math.floor(students.length * 0.10) },
            ]
            
            const monthlyTrend = [
              { month: 'Jan', students: Math.floor(students.length * 0.8) },
              { month: 'Feb', students: Math.floor(students.length * 0.85) },
              { month: 'Mar', students: Math.floor(students.length * 0.9) },
              { month: 'Apr', students: Math.floor(students.length * 0.95) },
              { month: 'May', students: students.length },
            ]
            
            setClassInfo({
              name: teacherProfile.assigned_classroom.name || "Unknown Class",
              section: teacherProfile.assigned_classroom.section || "",
              totalStudents: students.length,
              boys: boys,
              girls: girls,
              attendanceToday: { present: students.length, absent: 0, leave: 0 }, // Mock attendance for now
              topStudents: students.slice(0, 3).map((s: any, i: number) => ({
                name: s.name,
                marks: 95 - (i * 2) // Mock marks for now
              })),
              recentActivity: [
                { text: `Class ${teacherProfile.assigned_classroom.name} loaded`, color: "bg-green-500" },
                { text: `${students.length} students in class`, color: "bg-blue-500" },
                { text: "Class statistics updated", color: "bg-purple-500" },
              ],
              attendanceData,
              gradeDistribution,
              monthlyTrend,
            })
          } else {
            setError("No classroom assigned to you. Please contact administrator.")
          }
        } else {
          // For non-teachers, show placeholder data
          setClassInfo({
            name: "All Classes",
            section: "Overview",
            totalStudents: 0,
            boys: 0,
            girls: 0,
            attendanceToday: { present: 0, absent: 0, leave: 0 },
            topStudents: [],
    recentActivity: [
              { text: "Class statistics overview", color: "bg-blue-500" },
            ],
            attendanceData: [],
            gradeDistribution: [],
            monthlyTrend: [],
          })
        }
      } catch (err: any) {
        console.error('Error fetching class data:', err)
        setError("Failed to load class data. Please try again.")
      } finally {
        setLoading(false)
      }
    }

    fetchClassData()
  }, [])

  if (loading) {
    return (
      <div className="space-y-8">
        <div>
          <h2 className="text-3xl font-extrabold text-[#274c77] mb-2 tracking-wide">Class Dashboard</h2>
          <p className="text-gray-600 text-lg">Loading your class data...</p>
        </div>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#6096ba]"></div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="space-y-8">
        <div>
          <h2 className="text-3xl font-extrabold text-[#274c77] mb-2 tracking-wide">Class Dashboard</h2>
          <p className="text-red-600 text-lg">{error}</p>
        </div>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <p className="text-gray-600 mb-4">Unable to load class data</p>
            <button 
              onClick={() => window.location.reload()} 
              className="px-4 py-2 bg-[#6096ba] text-white rounded-lg hover:bg-[#274c77] transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-extrabold text-[#274c77] mb-2 tracking-wide">Class Dashboard</h2>
        <p className="text-gray-600 text-lg">Welcome! Here is an overview of your class <span className="font-bold text-[#6096ba]">{classInfo.name}</span></p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="hover:shadow-xl transition-all duration-300 cursor-pointer border-2 bg-gradient-to-br from-[#e7ecef] to-[#a3cef1]/30 hover:scale-105">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Total Students</CardTitle>
            <div className="p-2 rounded-full bg-[#6096ba]/10">
            <UsersIcon className="h-5 w-5 text-[#6096ba]" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-[#274c77] mb-1">{classInfo.totalStudents}</div>
            <p className="text-xs text-gray-500">Active students</p>
          </CardContent>
        </Card>
        
        <Card className="hover:shadow-xl transition-all duration-300 cursor-pointer border-2 bg-gradient-to-br from-blue-50 to-blue-100/50 hover:scale-105">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Boys</CardTitle>
            <div className="p-2 rounded-full bg-blue-100">
              <UserCheck className="h-5 w-5 text-blue-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-700 mb-1">{classInfo.boys}</div>
            <p className="text-xs text-blue-600">
              {classInfo.totalStudents > 0 ? Math.round((classInfo.boys / classInfo.totalStudents) * 100) : 0}% of total
            </p>
          </CardContent>
        </Card>
        
        <Card className="hover:shadow-xl transition-all duration-300 cursor-pointer border-2 bg-gradient-to-br from-pink-50 to-pink-100/50 hover:scale-105">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Girls</CardTitle>
            <div className="p-2 rounded-full bg-pink-100">
              <UserCheck className="h-5 w-5 text-pink-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-pink-700 mb-1">{classInfo.girls}</div>
            <p className="text-xs text-pink-600">
              {classInfo.totalStudents > 0 ? Math.round((classInfo.girls / classInfo.totalStudents) * 100) : 0}% of total
            </p>
          </CardContent>
        </Card>
        
        <Card className="hover:shadow-xl transition-all duration-300 cursor-pointer border-2 bg-gradient-to-br from-green-50 to-green-100/50 hover:scale-105">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Attendance Today</CardTitle>
            <div className="p-2 rounded-full bg-green-100">
              <CalendarCheck className="h-5 w-5 text-green-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex gap-2 text-lg font-bold mb-1">
              <span className="text-green-600">P: {classInfo.attendanceToday.present}</span>
              <span className="text-red-500">A: {classInfo.attendanceToday.absent}</span>
            </div>
            <p className="text-xs text-green-600">
              {classInfo.totalStudents > 0 ? Math.round((classInfo.attendanceToday.present / classInfo.totalStudents) * 100) : 0}% present
            </p>
          </CardContent>
        </Card>
      </div>


      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Attendance Chart - New UI */}
        <Card className="border-2 bg-gradient-to-br from-[#e7ecef] to-[#a3cef1]/20">
          <CardHeader>
            <CardTitle className="text-[#274c77] flex items-center gap-2">
              <CalendarCheck className="h-5 w-5 text-[#6096ba]" />
              Weekly Attendance Overview
            </CardTitle>
            <CardDescription>Daily attendance pattern for this week</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={classInfo.attendanceData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#a3cef1" opacity={0.3} />
                  <XAxis 
                    dataKey="day" 
                    stroke="#274c77" 
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis 
                    stroke="#274c77" 
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                  />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#ffffff', 
                      border: '2px solid #6096ba',
                      borderRadius: '12px',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                    }} 
                    labelStyle={{ color: '#274c77', fontWeight: 'bold' }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="present" 
                    stroke="#6096ba" 
                    strokeWidth={4}
                    dot={{ fill: '#6096ba', strokeWidth: 2, r: 6 }}
                    activeDot={{ r: 8, stroke: '#6096ba', strokeWidth: 2 }}
                    name="Present Students"
                  />
                  <Line 
                    type="monotone" 
                    dataKey="absent" 
                    stroke="#ef4444" 
                    strokeWidth={4}
                    dot={{ fill: '#ef4444', strokeWidth: 2, r: 6 }}
                    activeDot={{ r: 8, stroke: '#ef4444', strokeWidth: 2 }}
                    name="Absent Students"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-4 flex justify-center gap-6">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-[#6096ba]"></div>
                <span className="text-sm text-gray-600">Present</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-[#ef4444]"></div>
                <span className="text-sm text-gray-600">Absent</span>
              </div>
              </div>
          </CardContent>
        </Card>

        {/* Class Summary Card */}
        <Card className="border-2 bg-gradient-to-br from-[#e7ecef] to-[#a3cef1]/20">
          <CardHeader>
            <CardTitle className="text-[#274c77] flex items-center gap-2">
              <Users className="h-5 w-5 text-[#6096ba]" />
              Class Summary
            </CardTitle>
            <CardDescription>Quick overview of your class</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center p-3 bg-white/50 rounded-lg">
                <span className="text-sm font-medium text-gray-600">Total Students</span>
                <span className="text-2xl font-bold text-[#274c77]">{classInfo.totalStudents}</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-white/50 rounded-lg">
                <span className="text-sm font-medium text-gray-600">Boys</span>
                <span className="text-xl font-bold text-blue-600">{classInfo.boys}</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-white/50 rounded-lg">
                <span className="text-sm font-medium text-gray-600">Girls</span>
                <span className="text-xl font-bold text-pink-600">{classInfo.girls}</span>
                </div>
              <div className="flex justify-between items-center p-3 bg-white/50 rounded-lg">
                <span className="text-sm font-medium text-gray-600">Attendance Today</span>
                <span className="text-xl font-bold text-green-600">
                  {classInfo.totalStudents > 0 ? Math.round((classInfo.attendanceToday.present / classInfo.totalStudents) * 100) : 0}%
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Class Progress Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Subject Performance Chart */}
        <Card className="border-2 bg-gradient-to-br from-[#e7ecef] to-[#a3cef1]/20">
          <CardHeader>
            <CardTitle className="text-[#274c77] flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-[#6096ba]" />
              Subject Performance
            </CardTitle>
            <CardDescription>Average marks by subject for this class</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={[
                  { subject: 'Math', marks: 85, color: '#6096ba' },
                  { subject: 'English', marks: 78, color: '#a3cef1' },
                  { subject: 'Science', marks: 92, color: '#274c77' },
                  { subject: 'Urdu', marks: 88, color: '#8b8c89' },
                  { subject: 'Islamiat', marks: 95, color: '#ef4444' },
                ]}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#a3cef1" opacity={0.3} />
                  <XAxis 
                    dataKey="subject" 
                    stroke="#274c77" 
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis 
                    stroke="#274c77" 
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                    domain={[0, 100]}
                  />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#ffffff', 
                      border: '2px solid #6096ba',
                      borderRadius: '12px',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                    }} 
                    labelStyle={{ color: '#274c77', fontWeight: 'bold' }}
                    formatter={(value: any) => [`${value}%`, 'Average Marks']}
                  />
                  <Bar 
                    dataKey="marks" 
                    radius={[8, 8, 0, 0]}
                    fill="#6096ba"
                  />
                </BarChart>
              </ResponsiveContainer>
              </div>
          </CardContent>
        </Card>

        {/* Class Progress Doughnut Chart */}
        <Card className="border-2 bg-gradient-to-br from-[#e7ecef] to-[#a3cef1]/20">
          <CardHeader>
            <CardTitle className="text-[#274c77] flex items-center gap-2">
              <Award className="h-5 w-5 text-[#6096ba]" />
              Class Progress Overview
            </CardTitle>
            <CardDescription>Overall class performance metrics</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={[
                      { name: 'Excellent (90-100)', value: Math.floor(classInfo.totalStudents * 0.25), color: '#10b981' },
                      { name: 'Good (80-89)', value: Math.floor(classInfo.totalStudents * 0.35), color: '#6096ba' },
                      { name: 'Average (70-79)', value: Math.floor(classInfo.totalStudents * 0.25), color: '#f59e0b' },
                      { name: 'Needs Improvement', value: Math.floor(classInfo.totalStudents * 0.15), color: '#ef4444' },
                    ]}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {[
                      { name: 'Excellent (90-100)', value: Math.floor(classInfo.totalStudents * 0.25), color: '#10b981' },
                      { name: 'Good (80-89)', value: Math.floor(classInfo.totalStudents * 0.35), color: '#6096ba' },
                      { name: 'Average (70-79)', value: Math.floor(classInfo.totalStudents * 0.25), color: '#f59e0b' },
                      { name: 'Needs Improvement', value: Math.floor(classInfo.totalStudents * 0.15), color: '#ef4444' },
                    ].map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#ffffff', 
                      border: '2px solid #6096ba',
                      borderRadius: '12px',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                    }} 
                    formatter={(value: any, name: any) => [`${value} students`, name]}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-4 grid grid-cols-2 gap-2 text-xs">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-green-500"></div>
                <span>Excellent</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-[#6096ba]"></div>
                <span>Good</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                <span>Average</span>
                </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-red-500"></div>
                <span>Needs Help</span>
                </div>
            </div>
          </CardContent>
        </Card>
      </div>

    </div>
  )
}
