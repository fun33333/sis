"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {BarChart,Bar,PieChart,Pie,Cell,XAxis,YAxis,CartesianGrid,Tooltip,ResponsiveContainer,Area,AreaChart,} from "recharts"
import { TrendingUp, Users, Building2, Award } from "lucide-react"

// Mock data for charts
const enrollmentData = [
  { year: "2019", students: 980, teachers: 65 },
  { year: "2020", students: 1050, teachers: 68 },
  { year: "2021", students: 1120, teachers: 72 },
  { year: "2022", students: 1180, teachers: 75 },
  { year: "2023", students: 1250, teachers: 78 },
  { year: "2024", students: 1320, teachers: 82 },
]

const staffStudentData = [
  { category: "Students", count: 256, color: "hsl(var(--chart-1))" },
  { category: "Teachers", count: 24, color: "hsl(var(--chart-2))" },
  { category: "Non-Teaching Staff", count: 7, color: "hsl(var(--chart-3))" },
]

const facilitiesData = [
  { name: "Classrooms", value: 45, color: "hsl(var(--chart-1))" },
  { name: "Science Labs", value: 1, color: "hsl(var(--chart-2))" },
  { name: "Computer Labs", value: 1, color: "hsl(var(--chart-3))" },
  { name: "Library", value: 1, color: "hsl(var(--chart-4))" },
  { name: "Other Facilities", value: 12, color: "hsl(var(--chart-5))" },
]

interface CampusChartsProps {
  className?: string
}

export function CampusCharts({ className }: CampusChartsProps) {
  const [yearRange, setYearRange] = useState("all")
  const [statusFilter, setStatusFilter] = useState("all")

  return (
    <div className={`space-y-8 ${className}`}>
      <Card className="border-0 shadow-xl bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 text-white overflow-hidden">
        <div className="relative">
          <div className="absolute inset-0 bg-black/10 backdrop-blur-sm"></div>
          <div className="relative z-10 p-6">
            <h2 className="text-2xl font-bold flex items-center gap-3 mb-2 text-white">
              <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                <TrendingUp className="h-6 w-6" />
              </div>
              Analytics & Metrics Dashboard
            </h2>
            <p className="text-blue-100 mb-6">Real-time insights and performance indicators</p>

            <div className="flex flex-wrap gap-4">
              <div className="flex items-center gap-2">
                <label className="text-sm font-medium text-white">Year Range:</label>
                <Select value={yearRange} onValueChange={setYearRange}>
                  <SelectTrigger className="w-32 bg-white/90 border-white/50 text-gray-800 backdrop-blur-sm hover:bg-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Last 5 Years</SelectItem>
                    <SelectItem value="3">Last 3 Years</SelectItem>
                    <SelectItem value="1">This Year</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center gap-2">
                <label className="text-sm font-medium text-white">Status:</label>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-32 bg-white/90 border-white/50 text-gray-800 backdrop-blur-sm hover:bg-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Active Only</SelectItem>
                    <SelectItem value="trends">Show Trends</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        {/* Enrollment Trend - Modern Area Chart */}
        <Card className="border-0 shadow-2xl overflow-hidden group hover:shadow-3xl transition-all duration-300">
          <div className="bg-emerald-600 text-white p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                <h3 className="text-sm font-bold">Enrollment Growth</h3>
              </div>
              <div className="bg-white text-emerald-700 px-2 py-1 rounded text-xs font-medium">+12% YoY</div>
            </div>
          </div>
          <CardContent className="p-3 bg-gradient-to-br from-emerald-50 to-teal-50">
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={enrollmentData}>
                <defs>
                  <linearGradient id="studentGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0.1} />
                  </linearGradient>
                  <linearGradient id="teacherGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.1} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="year" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "#6b7280" }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "#6b7280" }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "rgba(255, 255, 255, 0.95)",
                    border: "none",
                    borderRadius: "12px",
                    boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1)",
                    backdropFilter: "blur(10px)",
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="students"
                  stroke="#10b981"
                  strokeWidth={3}
                  fill="url(#studentGradient)"
                  name="Students"
                />
                <Area
                  type="monotone"
                  dataKey="teachers"
                  stroke="#3b82f6"
                  strokeWidth={3}
                  fill="url(#teacherGradient)"
                  name="Teachers"
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Staff Distribution - Modern Donut Chart */}
        <Card className="border-0 shadow-2xl overflow-hidden group hover:shadow-3xl transition-all duration-300">
          <div className="bg-purple-600 text-white p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Building2 className="h-4 w-4" />
                <h3 className="text-sm font-bold">Staff Distribution</h3>
              </div>
              <div className="bg-white text-purple-700 px-2 py-1 rounded text-xs font-medium">1,447 Total</div>
            </div>
          </div>
          <CardContent className="p-3 bg-gradient-to-br from-purple-50 to-pink-50">
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <defs>
                  <filter id="shadow" x="-50%" y="-50%" width="200%" height="200%">
                    <feDropShadow dx="0" dy="4" stdDeviation="8" floodColor="#000" floodOpacity="0.1" />
                  </filter>
                </defs>
                <Pie
                  data={staffStudentData}
                  cx="50%"
                  cy="50%"
                  innerRadius={40}
                  outerRadius={70}
                  paddingAngle={5}
                  dataKey="count"
                  filter="url(#shadow)"
                >
                  {staffStudentData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={index === 0 ? "#8b5cf6" : index === 1 ? "#ec4899" : "#06b6d4"} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: "rgba(255, 255, 255, 0.95)",
                    border: "none",
                    borderRadius: "12px",
                    boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1)",
                    backdropFilter: "blur(10px)",
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="mt-2 space-y-1">
              {staffStudentData.map((item, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div
                      className="w-2 h-2 rounded-full"
                      style={{
                        backgroundColor: index === 0 ? "#8b5cf6" : index === 1 ? "#ec4899" : "#06b6d4",
                      }}
                    />
                    <span className="text-xs font-medium">{item.category}</span>
                  </div>
                  <span className="text-xs font-bold text-gray-700">{item.count.toLocaleString()}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Facilities Overview - Modern Bar Chart */}
        <Card className="border-0 shadow-2xl overflow-hidden group hover:shadow-3xl transition-all duration-300">
          <div className="bg-orange-600 text-white p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Award className="h-4 w-4" />
                <h3 className="text-sm font-bold">Facilities Overview</h3>
              </div>
              <div className="bg-white text-orange-700 px-2 py-1 rounded text-xs font-medium">69 Total</div>
            </div>
          </div>
          <CardContent className="p-3 bg-gradient-to-br from-orange-50 to-red-50">
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={facilitiesData} margin={{ top: 10, right: 10, left: 10, bottom: 40 }}>
                <defs>
                  <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f97316" stopOpacity={0.9} />
                    <stop offset="95%" stopColor="#dc2626" stopOpacity={0.7} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis
                  dataKey="name"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 8, fill: "#6b7280" }}
                  angle={-45}
                  textAnchor="end"
                  height={60}
                />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "#6b7280" }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "rgba(255, 255, 255, 0.95)",
                    border: "none",
                    borderRadius: "12px",
                    boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1)",
                    backdropFilter: "blur(10px)",
                  }}
                />
                <Bar dataKey="value" fill="url(#barGradient)" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
