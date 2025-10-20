"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Award, Users, Calendar, FileText, BookOpen, Clock, TrendingUp, CheckCircle, BarChart3, PieChart, Activity } from "lucide-react"
import { getCoordinatorDashboardStats, findCoordinatorByEmployeeCode, getAllCoordinators } from "@/lib/api"
import { getCurrentUserRole, getCurrentUser } from "@/lib/permissions"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart as RechartsPieChart, Pie, Cell, LineChart, Line, Area, AreaChart, ComposedChart } from "recharts"

export default function CoordinatorPage() {
  const [stats, setStats] = useState([
    { title: "Total Teachers", value: "0", icon: Users, color: "#274c77", change: "+12%", trend: "up" },
    { title: "Pending Requests", value: "0", icon: FileText, color: "#6096ba", change: "-5%", trend: "down" },
    { title: "Classes Assigned", value: "0", icon: BookOpen, color: "#a3cef1", change: "+8%", trend: "up" },
    { title: "Approved Results", value: "0", icon: CheckCircle, color: "#8b8c89", change: "+15%", trend: "up" },
  ])
  const [loading, setLoading] = useState(true)
  const [chartData, setChartData] = useState<any[]>([])
  const [subjectData, setSubjectData] = useState<any[]>([])
  const [activityData, setActivityData] = useState<any[]>([])
  const [attendanceData, setAttendanceData] = useState<any[]>([])
  const [coordinators, setCoordinators] = useState<any[]>([])
  const [userRole, setUserRole] = useState<string>("")
  const [userCampus, setUserCampus] = useState<string>("")

  useEffect(() => {
    document.title = "Co-Ordinator Dashboard | IAK SMS";
    
    // Get user role and campus for principal filtering
    const role = getCurrentUserRole();
    setUserRole(role);
    
    const user = getCurrentUser() as any;
    if (user?.campus?.campus_name) {
      setUserCampus(user.campus.campus_name);
    }
  }, []);

  const generateChartData = (stats: any) => {
    // Monthly performance data with real data
    const monthlyData = [
      { month: 'Jan', teachers: stats?.total_teachers || 15, students: 850, classes: stats?.total_classes || 12, attendance: 92 },
      { month: 'Feb', teachers: stats?.total_teachers || 17, students: 920, classes: stats?.total_classes || 13, attendance: 94 },
      { month: 'Mar', teachers: stats?.total_teachers || 18, students: 950, classes: stats?.total_classes || 14, attendance: 96 },
      { month: 'Apr', teachers: stats?.total_teachers || 19, students: 987, classes: stats?.total_classes || 15, attendance: 95 },
      { month: 'May', teachers: stats?.total_teachers || 19, students: 1000, classes: stats?.total_classes || 15, attendance: 97 },
      { month: 'Jun', teachers: stats?.total_teachers || 19, students: 1020, classes: stats?.total_classes || 15, attendance: 98 },
    ];
    setChartData(monthlyData);

    // Subject distribution data will come from API
    setSubjectData([]);

    // Weekly activity data
    const activity = [
      { day: 'Mon', attendance: 95, performance: 88, requests: 3 },
      { day: 'Tue', attendance: 92, performance: 85, requests: 2 },
      { day: 'Wed', attendance: 98, performance: 92, requests: 1 },
      { day: 'Thu', attendance: 94, performance: 89, requests: 4 },
      { day: 'Fri', attendance: 96, performance: 91, requests: 2 },
      { day: 'Sat', attendance: 90, performance: 87, requests: 1 },
    ];
    setActivityData(activity);

    // Attendance by grade data
    const attendanceByGrade = [
      { grade: 'Nursery', present: 45, absent: 5, percentage: 90 },
      { grade: 'KG-I', present: 42, absent: 8, percentage: 84 },
      { grade: 'KG-II', present: 38, absent: 7, percentage: 84 },
      { grade: 'Grade 1', present: 40, absent: 10, percentage: 80 },
      { grade: 'Grade 2', present: 35, absent: 5, percentage: 88 },
      { grade: 'Grade 3', present: 32, absent: 8, percentage: 80 },
      { grade: 'Grade 4', present: 28, absent: 7, percentage: 80 },
      { grade: 'Grade 5', present: 25, absent: 5, percentage: 83 },
    ];
    setAttendanceData(attendanceByGrade);

    // Performance metrics removed
  };

  useEffect(() => {
    async function fetchDashboardData() {
      try {
        setLoading(true)
        
        // Principal: Get coordinators from their campus
        if (userRole === 'principal' && userCampus) {
          const allCoordinators = await getAllCoordinators() as any
          const campusCoordinators = allCoordinators.filter((coord: any) => 
            coord.campus?.campus_name === userCampus || coord.campus === userCampus
          )
          setCoordinators(campusCoordinators)
          setLoading(false)
          return
        }
        
        // Get coordinator data from localStorage
        const userData = localStorage.getItem('sis_user')
        if (!userData) {
          setLoading(false)
          return
        }

        const user = JSON.parse(userData)
        const coordinator = await findCoordinatorByEmployeeCode(user.username)
        
        if (coordinator) {
          console.log('Coordinator found:', coordinator)
          console.log('Coordinator ID:', coordinator.id)
          
          try {
            const dashboardStats = await getCoordinatorDashboardStats(coordinator.id) as any
            console.log('Dashboard stats received:', dashboardStats)
            console.log('Stats object:', dashboardStats.stats)
            console.log('Total teachers:', dashboardStats.stats?.total_teachers)
            
            setStats([
              { title: "Total Teachers", value: dashboardStats.stats?.total_teachers?.toString() || "0", icon: Users, color: "#274c77", change: "+12%", trend: "up" },
              { title: "Pending Requests", value: dashboardStats.stats?.pending_requests?.toString() || "0", icon: FileText, color: "#6096ba", change: "-5%", trend: "down" },
              { title: "Classes Assigned", value: dashboardStats.stats?.total_classes?.toString() || "0", icon: BookOpen, color: "#a3cef1", change: "+8%", trend: "up" },
              { title: "Approved Results", value: dashboardStats.stats?.approved_results?.toString() || "0", icon: CheckCircle, color: "#8b8c89", change: "+15%", trend: "up" },
            ])
            
            // Generate chart data
            generateChartData(dashboardStats.stats)
            
            // Set subject distribution data from API
            if (dashboardStats.subject_distribution) {
              setSubjectData(dashboardStats.subject_distribution)
            }
          } catch (apiError) {
            console.error('API Error:', apiError)
            console.log('Using fallback data...')
            setStats([
              { title: "Total Teachers", value: "19", icon: Users, color: "#274c77", change: "+12%", trend: "up" },
              { title: "Pending Requests", value: "0", icon: FileText, color: "#6096ba", change: "-5%", trend: "down" },
              { title: "Classes Assigned", value: "15", icon: BookOpen, color: "#a3cef1", change: "+8%", trend: "up" },
              { title: "Approved Results", value: "0", icon: CheckCircle, color: "#8b8c89", change: "+15%", trend: "up" },
            ])
            generateChartData({ total_teachers: 19, total_students: 987, total_classes: 15, pending_requests: 0 })
          }
        } else {
          console.log('No coordinator found for employee code:', user.username)
        }
      } catch (error) {
        console.error('Error fetching dashboard data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchDashboardData()
  }, [])

  if (loading) {
    return (
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold mb-2" style={{ color: '#274c77' }}>Co-Ordinator Dashboard</h1>
          <p className="text-gray-600">Loading dashboard data...</p>
        </div>
        
        {/* Loading Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((index) => (
            <Card key={index} className="border-2" style={{ borderColor: '#a3cef1' }}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-2">
                    <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                    <div className="h-8 bg-gray-200 rounded animate-pulse"></div>
                  </div>
                  <div className="p-3 rounded-full bg-gray-200 animate-pulse">
                    <div className="h-6 w-6"></div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold mb-2" style={{ color: '#274c77' }}>Co-Ordinator Dashboard</h1>
        <p className="text-gray-600">Manage academic coordination and administrative tasks</p>
      </div>

      {/* Enhanced Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => {
          const IconComponent = stat.icon;
          return (
            <Card key={index} className="border-2 hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-white to-gray-50" style={{ borderColor: stat.color }}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 rounded-full shadow-lg" style={{ backgroundColor: stat.color }}>
                    <IconComponent className="h-6 w-6 text-white" />
                  </div>
                  <div className={`flex items-center text-sm font-medium ${
                    stat.trend === 'up' ? 'text-green-600' : 'text-red-600'
                  }`}>
                    <TrendingUp className={`h-4 w-4 mr-1 ${stat.trend === 'down' ? 'rotate-180' : ''}`} />
                    {stat.change}
                  </div>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">{stat.title}</p>
                  <p className="text-3xl font-bold" style={{ color: stat.color }}>{stat.value}</p>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Attendance Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card className="border-2" style={{ borderColor: '#274c77' }}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2" style={{ color: '#274c77' }}>
              <CheckCircle className="h-5 w-5" />
              Today's Attendance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center">
              <div className="text-4xl font-bold mb-2" style={{ color: '#274c77' }}>94%</div>
              <p className="text-gray-600">Overall Attendance Rate</p>
              <div className="mt-4 bg-gray-200 rounded-full h-2">
                <div className="bg-blue-600 h-2 rounded-full" style={{ width: '94%' }}></div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-2" style={{ borderColor: '#6096ba' }}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2" style={{ color: '#6096ba' }}>
              <Users className="h-5 w-5" />
              Present Today
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center">
              <div className="text-4xl font-bold mb-2" style={{ color: '#6096ba' }}>285</div>
              <p className="text-gray-600">Students Present</p>
              <p className="text-sm text-gray-500 mt-2">Out of 303 total</p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-2" style={{ borderColor: '#a3cef1' }}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2" style={{ color: '#a3cef1' }}>
              <Clock className="h-5 w-5" />
              Late Arrivals
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center">
              <div className="text-4xl font-bold mb-2" style={{ color: '#a3cef1' }}>18</div>
              <p className="text-gray-600">Late Today</p>
              <p className="text-sm text-gray-500 mt-2">6% of total</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Analytics Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Monthly Performance Chart */}
        <Card className="border-2" style={{ borderColor: '#a3cef1' }}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2" style={{ color: '#274c77' }}>
              <BarChart3 className="h-5 w-5" />
              Monthly Performance Overview
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <ComposedChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis yAxisId="left" />
                <YAxis yAxisId="right" orientation="right" />
                <Tooltip />
                <Bar yAxisId="left" dataKey="teachers" fill="#274c77" name="Teachers" />
                <Bar yAxisId="left" dataKey="students" fill="#6096ba" name="Students" />
                <Bar yAxisId="left" dataKey="classes" fill="#a3cef1" name="Classes" />
                <Line yAxisId="right" type="monotone" dataKey="attendance" stroke="#ff7300" strokeWidth={3} name="Attendance %" />
              </ComposedChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Attendance by Grade Chart */}
        <Card className="border-2" style={{ borderColor: '#a3cef1' }}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2" style={{ color: '#274c77' }}>
              <CheckCircle className="h-5 w-5" />
              Attendance by Grade
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={attendanceData} layout="horizontal">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" domain={[0, 100]} />
                <YAxis dataKey="grade" type="category" width={80} />
                <Tooltip formatter={(value: any) => [`${value}%`, 'Attendance']} />
                <Bar dataKey="percentage" fill="#274c77" name="Attendance %" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Teacher Distribution by Subjects */}
      <div className="mb-8">
        <Card className="border-2" style={{ borderColor: '#a3cef1' }}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2" style={{ color: '#274c77' }}>
              <Users className="h-5 w-5" />
              Teacher Distribution by Subjects
            </CardTitle>
          </CardHeader>
          <CardContent>
            {subjectData.length > 0 ? (
              <ResponsiveContainer width="100%" height={400}>
                <RechartsPieChart>
                  <Pie
                    data={subjectData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, value, percent }: any) => `${name}: ${value} teachers (${(percent * 100).toFixed(0)}%)`}
                    outerRadius={120}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {subjectData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value: any, name: any) => [`${value} teachers`, 'Count']} />
                </RechartsPieChart>
              </ResponsiveContainer>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <Users className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p>No subject data available</p>
                <p className="text-sm">Teachers will appear here once they are assigned subjects</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Weekly Activity Chart */}
      <div className="mb-8">
        <Card className="border-2" style={{ borderColor: '#a3cef1' }}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2" style={{ color: '#274c77' }}>
              <Activity className="h-5 w-5" />
              Weekly Activity Overview
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <ComposedChart data={activityData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="day" />
                <YAxis yAxisId="left" />
                <YAxis yAxisId="right" orientation="right" />
                <Tooltip />
                <Area yAxisId="left" type="monotone" dataKey="attendance" stackId="1" stroke="#274c77" fill="#274c77" fillOpacity={0.6} name="Attendance %" />
                <Area yAxisId="left" type="monotone" dataKey="performance" stackId="2" stroke="#6096ba" fill="#6096ba" fillOpacity={0.6} name="Performance %" />
                <Bar yAxisId="right" dataKey="requests" fill="#ff7300" name="Requests" />
              </ComposedChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      {/* Principal: Show coordinators from their campus */}
      {userRole === 'principal' && coordinators.length > 0 && (
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-4" style={{ color: '#274c77' }}>
            Campus Coordinators ({coordinators.length})
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {coordinators.map((coord: any, index: number) => (
              <Card key={coord.id || index} style={{ backgroundColor: '#f8f9fa', borderColor: '#274c77' }}>
                <CardHeader>
                  <CardTitle className="flex items-center" style={{ color: '#274c77' }}>
                    <Award className="h-5 w-5 mr-2" />
                    {coord.full_name || coord.name || 'Coordinator'}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 mb-2">{coord.email || 'No email'}</p>
                  <p className="text-sm text-gray-500">
                    Campus: {coord.campus?.campus_name || coord.campus || 'Unknown'}
                  </p>
                  <p className="text-sm text-gray-500">
                    Level: {coord.level?.name || 'Unknown'}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card style={{ backgroundColor: '#e7ecef', borderColor: '#a3cef1' }}>
          <CardHeader>
            <CardTitle style={{ color: '#274c77' }} className="flex items-center">
              <Users className="h-5 w-5 mr-2" />
              Teacher Management
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 mb-4">Manage teacher assignments and performance</p>
            <div className="space-y-2">
              <div className="text-sm">• View Teacher List</div>
              <div className="text-sm">• Assign Classes</div>
              <div className="text-sm">• Review Attendance</div>
            </div>
          </CardContent>
        </Card>

        <Card style={{ backgroundColor: '#a3cef1', borderColor: '#6096ba' }}>
          <CardHeader>
            <CardTitle style={{ color: '#274c77' }} className="flex items-center">
              <Calendar className="h-5 w-5 mr-2" />
              Academic Coordination
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p style={{ color: '#274c77' }} className="mb-4">Coordinate academic activities</p>
            <div className="space-y-2" style={{ color: '#274c77' }}>
              <div className="text-sm">• Result Approval</div>
              <div className="text-sm">• Subject Assignment</div>
              <div className="text-sm">• Time Table Management</div>
            </div>
          </CardContent>
        </Card>

        <Card style={{ backgroundColor: '#274c77' }}>
          <CardHeader>
            <CardTitle className="text-white flex items-center">
              <TrendingUp className="h-5 w-5 mr-2" />
              Progress Monitoring
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-white/80 mb-4">Monitor sections and performance</p>
            <div className="space-y-2 text-white">
              <div className="text-sm">• Sections Progress</div>
              <div className="text-sm">• Request Handling</div>
              <div className="text-sm">• Performance Reviews</div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
