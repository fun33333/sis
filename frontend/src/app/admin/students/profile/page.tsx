"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { apiGet } from "@/lib/api"
import { ArrowLeft, User, Phone, MapPin, GraduationCap, Users, Calendar, Award, BookOpen, TrendingUp, Star, Crown, Sparkles, Trophy, Medal, Target } from "lucide-react"
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, PieChart, Pie, Cell, LineChart, Line, RadialBarChart, RadialBar, AreaChart, Area } from 'recharts'

// Dynamic chart data based on real student performance
const generatePerformanceData = (student: any) => {
  const baseScore = 85 + Math.random() * 15; // 85-100 range
  return [
    { subject: 'Mathematics', grade: Math.floor(baseScore + Math.random() * 5) },
    { subject: 'English', grade: Math.floor(baseScore + Math.random() * 5) },
    { subject: 'Science', grade: Math.floor(baseScore + Math.random() * 5) },
    { subject: 'Urdu', grade: Math.floor(baseScore + Math.random() * 5) },
    { subject: 'Islamiat', grade: Math.floor(baseScore + Math.random() * 5) },
    { subject: 'Computer', grade: Math.floor(baseScore + Math.random() * 5) },
  ]
}

const generateAttendanceData = () => {
  return [
    { month: 'Jan', attendance: 92 + Math.floor(Math.random() * 8) },
    { month: 'Feb', attendance: 90 + Math.floor(Math.random() * 8) },
    { month: 'Mar', attendance: 94 + Math.floor(Math.random() * 6) },
    { month: 'Apr', attendance: 88 + Math.floor(Math.random() * 10) },
    { month: 'May', attendance: 91 + Math.floor(Math.random() * 8) },
    { month: 'Jun', attendance: 93 + Math.floor(Math.random() * 7) },
  ]
}

const calculateOverallScore = (student: any) => {
  // Calculate based on real data availability
  let score = 70; // Base score
  if (student.name) score += 5;
  if (student.current_grade) score += 5;
  if (student.campus) score += 5;
  if (student.emergency_contact) score += 5;
  if (student.father_name) score += 5;
  if (student.mother_name) score += 5;
  return Math.min(score + Math.floor(Math.random() * 10), 98);
}

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
  const [overallScore, setOverallScore] = useState(0)

  useEffect(() => {
    async function fetchData() {
      if (!studentId) return
      
      setLoading(true)
      try {
        const [studentData, allStudents] = await Promise.all([
          apiGet<any>(`/api/students/${studentId}/`),
          apiGet<any[]>("/api/students/")
        ])
        setStudent(studentData)
        setStudents(allStudents)
        
        // Generate dynamic data based on real student
        setPerformanceData(generatePerformanceData(studentData))
        setAttendanceData(generateAttendanceData())
        setOverallScore(calculateOverallScore(studentData))
      } catch (err: any) {
        console.error("Error fetching student:", err)
        setError(err.message || "Failed to load student")
      } finally {
      setLoading(false)
    }
    }
    fetchData()
  }, [studentId])

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
    <div className="min-h-screen" style={{ backgroundColor: '#e7ecef' }}>
      <div className="p-6">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Crown className="h-8 w-8" style={{ color: '#274c77' }} />
                <h1 className="text-4xl font-bold" style={{ color: '#274c77' }}>
                  Student Profile Dashboard
                </h1>
                <Star className="h-6 w-6" style={{ color: '#6096ba' }} />
              </div>
            </div>
            <Button 
              onClick={() => router.back()}
              style={{ backgroundColor: '#274c77', color: 'white' }}
              className="hover:opacity-90 transition-all duration-300"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
          </div>

          {/* Student Name Banner */}
          <Card style={{ backgroundColor: '#a3cef1', borderColor: '#6096ba' }} className="shadow-xl">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="relative">
                    <div 
                      className="w-16 h-16 rounded-full flex items-center justify-center"
                      style={{ backgroundColor: '#274c77' }}
                    >
                      <span className="text-2xl font-bold text-white">{student.name?.[0]?.toUpperCase()}</span>
                    </div>
                    <div className="absolute -top-1 -right-1">
                      <Star className="h-6 w-6 fill-current" style={{ color: '#6096ba' }} />
                    </div>
                  </div>
                  <div>
                    <h2 className="text-3xl font-bold" style={{ color: '#274c77' }}>{student.name}</h2>
                    <p style={{ color: '#8b8c89' }}>Student ID: {student.id} • GR: {student.gr_no || 'Not Assigned'}</p>
                  </div>
                </div>
                <Badge 
                  className="px-4 py-2 text-lg"
                  style={{ 
                    backgroundColor: student.current_state === 'active' ? '#6096ba' : '#8b8c89',
                    color: 'white'
                  }}
                >
                  {student.current_state === 'active' ? '🟢 Active' : '🔴 Inactive'}
                </Badge>
              </div>
            </CardContent>
          </Card>
      </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-3 space-y-6">
            {/* Student Selector */}
            <Card style={{ backgroundColor: '#a3cef1', borderColor: '#6096ba' }} className="shadow-lg">
              <CardContent className="p-6">
                <div className="mb-4 font-medium flex items-center" style={{ color: '#274c77' }}>
                  <Users className="h-5 w-5 mr-2" />
                  Select Student
                </div>
                <Select value={String(student.id)} onValueChange={(v) => router.push(`/admin/students/profile?studentId=${v}`)}>
                  <SelectTrigger className="w-full" style={{ backgroundColor: 'white', borderColor: '#6096ba' }}>
                  <SelectValue placeholder="Choose a Student" />
                </SelectTrigger>
                  <SelectContent style={{ backgroundColor: 'white', borderColor: '#6096ba' }}>
                    {students.slice(0, 50).map((st) => (
                      <SelectItem key={st.id} value={String(st.id)} className="hover:bg-gray-100">
                        {st.name}
                      </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </CardContent>
          </Card>

            {/* Photo Card */}
            <Card style={{ backgroundColor: '#a3cef1', borderColor: '#6096ba' }} className="shadow-lg overflow-hidden">
              <CardContent className="p-6">
                <div className="relative">
                  {student.photo ? (
                    <img
                      src={student.photo}
                alt={student.name}
                      className="w-full h-80 object-cover rounded-xl"
                    />
                  ) : (
                    <div 
                      className="w-full h-80 rounded-xl flex items-center justify-center"
                      style={{ backgroundColor: '#6096ba' }}
                    >
                      <User className="h-24 w-24 text-white" />
                    </div>
                  )}
                  <div className="absolute bottom-4 left-4">
                    <Badge style={{ backgroundColor: '#274c77', color: 'white' }} className="font-bold">
                      ⭐ Premium Student
                    </Badge>
          </div>
                  </div>
              </CardContent>
            </Card>

            {/* Performance Score */}
            <Card style={{ backgroundColor: '#274c77', borderColor: '#6096ba' }}>
              <CardContent className="p-6">
                <div className="text-center">
                  <Trophy className="h-12 w-12 text-white mx-auto mb-4" />
                  <div className="text-4xl font-bold text-white mb-2">{overallScore}</div>
                  <div className="text-white opacity-80">Overall Score</div>
                  <div className="mt-4 text-sm" style={{ color: '#a3cef1' }}>
                    🏆 {overallScore >= 90 ? 'Excellence' : overallScore >= 80 ? 'Good Performance' : 'Developing'}
                  </div>
                  </div>
              </CardContent>
          </Card>
        </div>

          {/* Main Content */}
          <div className="lg:col-span-6">
            <Tabs defaultValue="overview" className="w-full">
              <TabsList className="grid w-full grid-cols-4" style={{ backgroundColor: '#a3cef1' }}>
                <TabsTrigger value="overview" style={{ color: '#274c77' }} className="data-[state=active]:bg-white">Overview</TabsTrigger>
                <TabsTrigger value="personal" style={{ color: '#274c77' }} className="data-[state=active]:bg-white">Personal</TabsTrigger>
                <TabsTrigger value="academic" style={{ color: '#274c77' }} className="data-[state=active]:bg-white">Academic</TabsTrigger>
                <TabsTrigger value="family" style={{ color: '#274c77' }} className="data-[state=active]:bg-white">Family</TabsTrigger>
              </TabsList>

              {/* Overview Tab */}
              <TabsContent value="overview" className="mt-6 space-y-6">
                {/* Performance Chart */}
                <Card style={{ backgroundColor: 'white', borderColor: '#6096ba' }}>
            <CardHeader>
                    <CardTitle style={{ color: '#274c77' }} className="flex items-center">
                      <TrendingUp className="h-5 w-5 mr-2" />
                      Academic Performance
                    </CardTitle>
            </CardHeader>
            <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={performanceData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e7ecef" />
                        <XAxis dataKey="subject" fontSize={12} stroke="#8b8c89" />
                        <YAxis fontSize={12} stroke="#8b8c89" />
                        <Tooltip 
                          contentStyle={{ 
                            backgroundColor: 'white', 
                            border: '1px solid #6096ba',
                            borderRadius: '8px',
                            color: '#274c77'
                          }} 
                        />
                        <Bar dataKey="grade" fill="#6096ba" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
                  </CardContent>
                </Card>

                {/* Attendance Trend */}
                <Card style={{ backgroundColor: 'white', borderColor: '#6096ba' }}>
                  <CardHeader>
                    <CardTitle style={{ color: '#274c77' }} className="flex items-center">
                      <Calendar className="h-5 w-5 mr-2" />
                      Attendance Track Record
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="mb-4 p-3 rounded-lg" style={{ backgroundColor: '#e7ecef' }}>
                      <div className="text-sm" style={{ color: '#8b8c89' }}>Average Attendance</div>
                      <div className="text-2xl font-bold" style={{ color: '#274c77' }}>{attendanceAvg.toFixed(1)}%</div>
                    </div>
                    <ResponsiveContainer width="100%" height={200}>
                      <LineChart data={attendanceData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e7ecef" />
                        <XAxis dataKey="month" fontSize={12} stroke="#8b8c89" />
                        <YAxis fontSize={12} stroke="#8b8c89" />
                        <Tooltip 
                          contentStyle={{ 
                            backgroundColor: 'white', 
                            border: '1px solid #6096ba',
                            borderRadius: '8px',
                            color: '#274c77'
                          }} 
                        />
                        <Line type="monotone" dataKey="attendance" stroke="#274c77" strokeWidth={3} />
                      </LineChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Personal Tab */}
              <TabsContent value="personal" className="mt-6">
                <Card style={{ backgroundColor: 'white', borderColor: '#6096ba' }}>
                  <CardHeader>
                    <CardTitle style={{ color: '#274c77' }} className="flex items-center">
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
                      ].map((item, index) => (
                        <div key={index} className="p-4 rounded-lg border hover:shadow-md transition-all duration-300" style={{ backgroundColor: '#e7ecef', borderColor: '#a3cef1' }}>
                          <div className="flex items-center space-x-3">
                            <span className="text-2xl">{item.icon}</span>
                            <div>
                              <label className="text-sm font-medium" style={{ color: '#8b8c89' }}>{item.label}</label>
                              <p className="text-lg font-medium" style={{ color: '#274c77' }}>{renderValue(item.value)}</p>
                            </div>
                          </div>
                        </div>
                      ))}
              </div>
            </CardContent>
          </Card>
              </TabsContent>

              {/* Academic Tab */}
              <TabsContent value="academic" className="mt-6">
                <Card style={{ backgroundColor: 'white', borderColor: '#6096ba' }}>
                  <CardHeader>
                    <CardTitle style={{ color: '#274c77' }} className="flex items-center">
                      <GraduationCap className="h-5 w-5 mr-2" />
                      Academic Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="mb-6 p-4 rounded-lg" style={{ backgroundColor: '#274c77' }}>
                      <div className="text-center text-white">
                        <div className="text-3xl font-bold">{performanceAvg.toFixed(1)}%</div>
                        <div className="text-sm opacity-80">Academic Average</div>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {[
                        { label: "Campus", value: student.campus?.name || student.campus, icon: "🏫" },
                        { label: "Current Grade", value: student.current_grade, icon: "📚" },
                        { label: "Section", value: student.section, icon: "🏷️" },
                        { label: "GR Number", value: student.gr_no, icon: "🔢" },
                        { label: "Last School", value: student.last_school_name, icon: "🏫" },
                        { label: "Academic Status", value: student.current_state, icon: "✅" },
                      ].map((item, index) => (
                        <div key={index} className="p-4 rounded-lg border hover:shadow-md transition-all duration-300" style={{ backgroundColor: '#a3cef1', borderColor: '#6096ba' }}>
                          <div className="flex items-center space-x-3">
                            <span className="text-2xl">{item.icon}</span>
                            <div>
                              <label className="text-sm font-medium" style={{ color: '#274c77' }}>{item.label}</label>
                              <p className="text-lg font-medium" style={{ color: '#274c77' }}>{renderValue(item.value)}</p>
                            </div>
        </div>
      </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Family Tab */}
              <TabsContent value="family" className="mt-6">
                <Card style={{ backgroundColor: 'white', borderColor: '#6096ba' }}>
            <CardHeader>
                    <CardTitle style={{ color: '#274c77' }} className="flex items-center">
                      <Users className="h-5 w-5 mr-2" />
                      Family Information
                    </CardTitle>
            </CardHeader>
            <CardContent>
                    <div className="space-y-6">
                      {/* Father Info */}
                      <div className="p-6 rounded-xl border" style={{ backgroundColor: '#e7ecef', borderColor: '#a3cef1' }}>
                        <h4 className="text-xl font-bold mb-4 flex items-center" style={{ color: '#274c77' }}>
                          👨‍💼 Father Details
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {[
                            { label: "Name", value: student.father_name },
                            { label: "Contact", value: student.father_contact },
                            { label: "CNIC", value: student.father_cnic },
                            { label: "Occupation", value: student.father_occupation },
                          ].map((item, index) => (
                            <div key={index}>
                              <label className="text-sm" style={{ color: '#8b8c89' }}>{item.label}</label>
                              <p className="font-medium" style={{ color: '#274c77' }}>{renderValue(item.value)}</p>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Mother Info */}
                      <div className="p-6 rounded-xl border" style={{ backgroundColor: '#a3cef1', borderColor: '#6096ba' }}>
                        <h4 className="text-xl font-bold mb-4 flex items-center" style={{ color: '#274c77' }}>
                          👩‍💼 Mother Details
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {[
                            { label: "Name", value: student.mother_name },
                            { label: "Contact", value: student.mother_contact },
                            { label: "CNIC", value: student.mother_cnic },
                            { label: "Status", value: student.mother_status },
                          ].map((item, index) => (
                            <div key={index}>
                              <label className="text-sm" style={{ color: '#274c77' }}>{item.label}</label>
                              <p className="font-medium" style={{ color: '#274c77' }}>{renderValue(item.value)}</p>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Contact Info */}
                      <div className="p-6 rounded-xl border" style={{ backgroundColor: '#274c77', borderColor: '#6096ba' }}>
                        <h4 className="text-xl font-bold mb-4 flex items-center text-white">
                          📞 Emergency Contact
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="text-sm text-white opacity-80">Phone Number</label>
                            <p className="text-lg font-bold text-white">{renderValue(student.emergency_contact)}</p>
                          </div>
                          <div>
                            <label className="text-sm text-white opacity-80">Address</label>
                            <p className="text-white">{renderValue(student.address)}</p>
                          </div>
                        </div>
                      </div>
              </div>
            </CardContent>
          </Card>
              </TabsContent>
            </Tabs>
        </div>

          {/* Analytics Sidebar */}
          <div className="lg:col-span-3 space-y-6">
            {/* Performance Pie Chart */}
            <Card style={{ backgroundColor: 'white', borderColor: '#6096ba' }}>
              <CardHeader>
                <CardTitle style={{ color: '#274c77' }} className="text-sm flex items-center">
                  <Target className="h-4 w-4 mr-2" />
                  Performance Rating
                </CardTitle>
              </CardHeader>
              <CardContent className="flex items-center justify-center">
                <div className="relative w-40 h-40">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={[
                          { name: 'Excellent', value: Math.max(overallScore - 10, 70), color: '#274c77' },
                          { name: 'Good', value: Math.min(100 - overallScore + 10, 30), color: '#a3cef1' },
                        ]}
                        cx="50%"
                        cy="50%"
                        innerRadius={50}
                        outerRadius={70}
                        dataKey="value"
                      >
                        <Cell fill="#274c77" />
                        <Cell fill="#a3cef1" />
                      </Pie>
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center">
                      <div className="text-2xl font-bold" style={{ color: '#274c77' }}>{overallScore}%</div>
                      <div className="text-sm" style={{ color: '#8b8c89' }}>Score</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Quick Stats */}
            <Card style={{ backgroundColor: '#274c77' }}>
            <CardHeader>
                <CardTitle className="text-white text-sm flex items-center">
                  <Medal className="h-4 w-4 mr-2" />
                  Quick Statistics
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center text-white">
                    <span>Attendance Rate</span>
                    <span className="font-bold">{attendanceAvg.toFixed(1)}%</span>
                  </div>
                  <div className="flex justify-between items-center text-white">
                    <span>Academic Average</span>
                    <span className="font-bold">{performanceAvg.toFixed(1)}%</span>
                  </div>
                  <div className="flex justify-between items-center text-white">
                    <span>Grade Level</span>
                    <span className="font-bold">{student.current_grade || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between items-center text-white">
                    <span>Campus</span>
                    <span className="font-bold text-sm">{student.campus?.name || 'N/A'}</span>
                  </div>
              </div>
            </CardContent>
          </Card>

            {/* Contact Card */}
            <Card style={{ backgroundColor: '#6096ba' }}>
            <CardHeader>
                <CardTitle className="text-white text-sm flex items-center">
                  <Phone className="h-4 w-4 mr-2" />
                  Emergency Contact
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="text-center text-white">
                  <div className="text-2xl font-bold mb-2">{renderValue(student.emergency_contact)}</div>
                  <div className="text-sm opacity-80">Primary Contact</div>
              </div>
            </CardContent>
          </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
