"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Award, Users, Calendar, FileText, BookOpen, Clock, TrendingUp, CheckCircle, BarChart3, PieChart, Activity } from "lucide-react"
import { getCoordinatorDashboardStats, findCoordinatorByEmployeeCode, getAllCoordinators } from "@/lib/api"
import { getCurrentUserRole, getCurrentUser } from "@/lib/permissions"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart as RechartsPieChart, Pie, Cell, LineChart, Line, Area, AreaChart } from "recharts"

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
    // Monthly performance data
    const monthlyData = [
      { month: 'Jan', teachers: 15, students: 850, classes: 12 },
      { month: 'Feb', teachers: 17, students: 920, classes: 13 },
      { month: 'Mar', teachers: 18, students: 950, classes: 14 },
      { month: 'Apr', teachers: 19, students: 987, classes: 15 },
      { month: 'May', teachers: 19, students: 1000, classes: 15 },
      { month: 'Jun', teachers: 19, students: 1020, classes: 15 },
    ];
    setChartData(monthlyData);

    // Subject distribution data
    const subjectDistribution = [
      { name: 'Mathematics', value: 25, color: '#274c77' },
      { name: 'English', value: 20, color: '#6096ba' },
      { name: 'Science', value: 18, color: '#a3cef1' },
      { name: 'Islamiat', value: 15, color: '#8b8c89' },
      { name: 'Computer', value: 12, color: '#e7ecef' },
      { name: 'Others', value: 10, color: '#f8f9fa' },
    ];
    setSubjectData(subjectDistribution);

    // Activity data
    const activity = [
      { day: 'Mon', attendance: 95, performance: 88 },
      { day: 'Tue', attendance: 92, performance: 85 },
      { day: 'Wed', attendance: 98, performance: 92 },
      { day: 'Thu', attendance: 94, performance: 89 },
      { day: 'Fri', attendance: 96, performance: 91 },
      { day: 'Sat', attendance: 90, performance: 87 },
    ];
    setActivityData(activity);
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

      {/* Analytics Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Monthly Performance Chart */}
        <Card className="border-2" style={{ borderColor: '#a3cef1' }}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2" style={{ color: '#274c77' }}>
              <BarChart3 className="h-5 w-5" />
              Monthly Performance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="teachers" fill="#274c77" name="Teachers" />
                <Bar dataKey="students" fill="#6096ba" name="Students" />
                <Bar dataKey="classes" fill="#a3cef1" name="Classes" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Subject Distribution Pie Chart */}
        <Card className="border-2" style={{ borderColor: '#a3cef1' }}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2" style={{ color: '#274c77' }}>
              <PieChart className="h-5 w-5" />
              Subject Distribution
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <RechartsPieChart>
                <Pie
                  data={subjectData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }: any) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {subjectData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </RechartsPieChart>
            </ResponsiveContainer>
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
              <AreaChart data={activityData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="day" />
                <YAxis />
                <Tooltip />
                <Area type="monotone" dataKey="attendance" stackId="1" stroke="#274c77" fill="#274c77" fillOpacity={0.6} name="Attendance %" />
                <Area type="monotone" dataKey="performance" stackId="2" stroke="#6096ba" fill="#6096ba" fillOpacity={0.6} name="Performance %" />
              </AreaChart>
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
