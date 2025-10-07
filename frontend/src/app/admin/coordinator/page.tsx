"use client"

import { useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Award, Users, Calendar, FileText, BookOpen, Clock, TrendingUp, CheckCircle } from "lucide-react"

export default function CoordinatorPage() {
  useEffect(() => {
    document.title = "Co-Ordinator Dashboard | IAK SMS";
  }, []);

  const stats = [
    { title: "Total Teachers", value: "45", icon: Users, color: "#274c77" },
    { title: "Pending Requests", value: "12", icon: FileText, color: "#6096ba" },
    { title: "Classes Assigned", value: "38", icon: BookOpen, color: "#a3cef1" },
    { title: "Approved Results", value: "156", icon: CheckCircle, color: "#8b8c89" },
  ]

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold mb-2" style={{ color: '#274c77' }}>Co-Ordinator Dashboard</h1>
        <p className="text-gray-600">Manage academic coordination and administrative tasks</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => {
          const IconComponent = stat.icon;
          return (
            <Card key={index} className="border-2 hover:shadow-lg transition-all duration-300" style={{ borderColor: '#a3cef1' }}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                    <p className="text-3xl font-bold" style={{ color: stat.color }}>{stat.value}</p>
                  </div>
                  <div className="p-3 rounded-full" style={{ backgroundColor: stat.color }}>
                    <IconComponent className="h-6 w-6 text-white" />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Quick Actions */}
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
