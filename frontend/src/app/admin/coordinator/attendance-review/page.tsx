"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Calendar, TrendingUp, Users, CheckCircle, AlertCircle, Eye } from "lucide-react"
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, LineChart, Line } from 'recharts'

export default function AttendanceReviewPage() {
  useEffect(() => {
    document.title = "Attendance Review - Coordinator | IAK SMS";
  }, []);

  const [selectedMonth, setSelectedMonth] = useState("current")
  const [selectedClass, setSelectedClass] = useState("all")

  const attendanceData = [
    { class: "Grade 1A", present: 25, absent: 5, total: 30, percentage: 83 },
    { class: "Grade 1B", present: 28, absent: 2, total: 30, percentage: 93 },
    { class: "Grade 2A", present: 22, absent: 8, total: 30, percentage: 73 },
    { class: "Grade 2B", present: 27, absent: 3, total: 30, percentage: 90 },
    { class: "Grade 3A", present: 24, absent: 6, total: 30, percentage: 80 },
  ]

  const monthlyTrend = [
    { month: 'Jan', attendance: 85 },
    { month: 'Feb', attendance: 88 },
    { month: 'Mar', attendance: 82 },
    { month: 'Apr', attendance: 90 },
    { month: 'May', attendance: 87 },
    { month: 'Jun', attendance: 92 },
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: '#274c77' }}>Attendance Review</h1>
          <p className="text-gray-600">Monitor and review student attendance across classes</p>
        </div>
      </div>

      {/* Filters */}
      <Card style={{ backgroundColor: 'white', borderColor: '#a3cef1' }}>
        <CardContent className="p-4">
          <div className="flex items-center space-x-4">
            <div>
              <label className="text-sm font-medium text-gray-600">Month</label>
              <Select value={selectedMonth} onValueChange={setSelectedMonth}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="current">Current Month</SelectItem>
                  <SelectItem value="previous">Previous Month</SelectItem>
                  <SelectItem value="all">All Months</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-600">Class</label>
              <Select value={selectedClass} onValueChange={setSelectedClass}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Classes</SelectItem>
                  <SelectItem value="grade1">Grade 1</SelectItem>
                  <SelectItem value="grade2">Grade 2</SelectItem>
                  <SelectItem value="grade3">Grade 3</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Attendance Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Class-wise Attendance */}
        <Card style={{ backgroundColor: 'white', borderColor: '#a3cef1' }}>
          <CardHeader>
            <CardTitle style={{ color: '#274c77' }} className="flex items-center">
              <Users className="h-5 w-5 mr-2" />
              Class-wise Attendance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={attendanceData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e7ecef" />
                <XAxis dataKey="class" fontSize={12} />
                <YAxis fontSize={12} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'white',
                    border: '1px solid #6096ba',
                    borderRadius: '8px'
                  }}
                />
                <Bar dataKey="percentage" fill="#6096ba" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Monthly Trend */}
        <Card style={{ backgroundColor: 'white', borderColor: '#a3cef1' }}>
          <CardHeader>
            <CardTitle style={{ color: '#274c77' }} className="flex items-center">
              <TrendingUp className="h-5 w-5 mr-2" />
              Monthly Attendance Trend
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={monthlyTrend}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e7ecef" />
                <XAxis dataKey="month" fontSize={12} />
                <YAxis fontSize={12} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'white',
                    border: '1px solid #6096ba',
                    borderRadius: '8px'
                  }}
                />
                <Line type="monotone" dataKey="attendance" stroke="#274c77" strokeWidth={3} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Attendance Details Table */}
      <Card style={{ backgroundColor: 'white', borderColor: '#a3cef1' }}>
        <CardHeader>
          <CardTitle style={{ color: '#274c77' }} className="flex items-center">
            <Calendar className="h-5 w-5 mr-2" />
            Detailed Attendance Report
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr style={{ backgroundColor: '#274c77' }}>
                  <th className="text-left py-3 px-4 text-white">Class</th>
                  <th className="text-left py-3 px-4 text-white">Present</th>
                  <th className="text-left py-3 px-4 text-white">Absent</th>
                  <th className="text-left py-3 px-4 text-white">Total</th>
                  <th className="text-left py-3 px-4 text-white">Percentage</th>
                  <th className="text-left py-3 px-4 text-white">Status</th>
                  <th className="text-left py-3 px-4 text-white">Actions</th>
                </tr>
              </thead>
              <tbody>
                {attendanceData.map((item, index) => (
                  <tr key={index} style={{ backgroundColor: index % 2 === 0 ? '#e7ecef' : 'white' }}>
                    <td className="py-3 px-4 font-medium">{item.class}</td>
                    <td className="py-3 px-4">{item.present}</td>
                    <td className="py-3 px-4">{item.absent}</td>
                    <td className="py-3 px-4">{item.total}</td>
                    <td className="py-3 px-4 font-bold">{item.percentage}%</td>
                    <td className="py-3 px-4">
                      <Badge 
                        style={{ 
                          backgroundColor: item.percentage >= 80 ? '#6096ba' : '#8b8c89',
                          color: 'white'
                        }}
                      >
                        {item.percentage >= 80 ? 'Good' : 'Needs Attention'}
                      </Badge>
                    </td>
                    <td className="py-3 px-4">
                      <Button size="sm" variant="outline" style={{ borderColor: '#6096ba', color: '#274c77' }}>
                        <Eye className="h-4 w-4 mr-1" />
                        Review
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
