"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, Building2, GraduationCap, TrendingUp } from "lucide-react"
import Link from "next/link"

import { BarChart2, UserCheck, Users as UsersIcon, Award, CalendarCheck, BookOpen, UserPlus, FileText, PieChart } from "lucide-react"

export default function TeacherClassDashboard() {
  // Mock data for teacher's class
  const classInfo = {
    name: "8th A",
    section: "A",
    totalStudents: 38,
    boys: 21,
    girls: 17,
    attendanceToday: { present: 34, absent: 3, leave: 1 },
    topStudents: [
      { name: "Ali Raza", marks: 97 },
      { name: "Sara Khan", marks: 95 },
      { name: "Bilal Ahmed", marks: 93 },
    ],
    recentActivity: [
      { text: "Result updated for Sara Khan", color: "bg-green-500" },
      { text: "Ali Raza marked absent today", color: "bg-red-500" },
      { text: "New student joined: Zainab Fatima", color: "bg-blue-500" },
    ],
  }

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-extrabold text-[#274c77] mb-2 tracking-wide">Class Dashboard</h2>
        <p className="text-gray-600 text-lg">Welcome! Here is an overview of your class <span className="font-bold text-[#6096ba]">{classInfo.name}</span></p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="hover:shadow-lg transition-shadow cursor-pointer border-2 bg-[#e7ecef]">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Total Students</CardTitle>
            <UsersIcon className="h-5 w-5 text-[#6096ba]" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-[#274c77]">{classInfo.totalStudents}</div>
          </CardContent>
        </Card>
        <Card className="hover:shadow-lg transition-shadow cursor-pointer border-2 bg-[#e7ecef]">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Boys</CardTitle>
            <UserCheck className="h-5 w-5 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-[#274c77]">{classInfo.boys}</div>
          </CardContent>
        </Card>
        <Card className="hover:shadow-lg transition-shadow cursor-pointer border-2 bg-[#e7ecef]">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Girls</CardTitle>
            <UserCheck className="h-5 w-5 text-pink-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-[#274c77]">{classInfo.girls}</div>
          </CardContent>
        </Card>
        <Card className="hover:shadow-lg transition-shadow cursor-pointer border-2 bg-[#e7ecef]">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Attendance Today</CardTitle>
            <CalendarCheck className="h-5 w-5 text-[#a3cef1]" />
          </CardHeader>
          <CardContent>
            <div className="flex gap-3 text-base font-semibold">
              <span className="text-green-600">P: {classInfo.attendanceToday.present}</span>
              <span className="text-red-500">A: {classInfo.attendanceToday.absent}</span>
              <span className="text-yellow-500">L: {classInfo.attendanceToday.leave}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Top Students & Gender Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="border-2 bg-[#e7ecef]">
          <CardHeader>
            <CardTitle className="text-[#274c77] flex items-center gap-2"><Award className="h-5 w-5 text-[#6096ba]" />Top Students</CardTitle>
            <CardDescription>Highest marks in recent exam</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            {classInfo.topStudents.map((s, i) => (
              <div key={i} className="flex items-center gap-3 text-base font-medium">
                <span className="w-7 h-7 flex items-center justify-center rounded-full bg-[#a3cef1] text-[#274c77] font-bold">{i+1}</span>
                <span>{s.name}</span>
                <span className="ml-auto text-[#6096ba] font-bold">{s.marks} <span className="text-xs">marks</span></span>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="border-2 bg-[#e7ecef]">
          <CardHeader>
            <CardTitle className="text-[#274c77] flex items-center gap-2"><PieChart className="h-5 w-5 text-[#6096ba]" />Gender Distribution</CardTitle>
            <CardDescription>Boys vs Girls</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-6 mt-2">
              <div className="flex flex-col items-center">
                <span className="w-8 h-8 rounded-full bg-blue-200 flex items-center justify-center text-blue-700 font-bold">{classInfo.boys}</span>
                <span className="text-xs mt-1 text-blue-700">Boys</span>
              </div>
              <div className="flex flex-col items-center">
                <span className="w-8 h-8 rounded-full bg-pink-200 flex items-center justify-center text-pink-700 font-bold">{classInfo.girls}</span>
                <span className="text-xs mt-1 text-pink-700">Girls</span>
              </div>
              <div className="flex-1">
                <div className="w-full h-3 bg-[#a3cef1] rounded-full relative">
                  <div className="h-3 bg-blue-500 rounded-l-full absolute left-0 top-0" style={{ width: `${(classInfo.boys / classInfo.totalStudents) * 100}%` }}></div>
                  <div className="h-3 bg-pink-500 rounded-r-full absolute right-0 top-0" style={{ width: `${(classInfo.girls / classInfo.totalStudents) * 100}%` }}></div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions & Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="border-2 bg-[#e7ecef]">
          <CardHeader>
            <CardTitle className="text-[#274c77]">Quick Actions</CardTitle>
            <CardDescription>Manage your class</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Link href="/admin/teachers/attendance" className="block p-3 rounded-lg hover:bg-[#a3cef1]/40 transition-colors">
              <div className="flex items-center gap-3">
                <BookOpen className="h-5 w-5 text-[#6096ba]" />
                <span className="font-medium">Mark Attendance</span>
              </div>
            </Link>
            <Link href="/admin/teachers/timetable" className="block p-3 rounded-lg hover:bg-[#a3cef1]/40 transition-colors">
              <div className="flex items-center gap-3">
                <BarChart2 className="h-5 w-5 text-[#6096ba]" />
                <span className="font-medium">View Timetable</span>
              </div>
            </Link>
            <Link href="#" className="block p-3 rounded-lg hover:bg-[#a3cef1]/40 transition-colors">
              <div className="flex items-center gap-3">
                <FileText className="h-5 w-5 text-[#6096ba]" />
                <span className="font-medium">Add Result</span>
              </div>
            </Link>
            <Link href="#" className="block p-3 rounded-lg hover:bg-[#a3cef1]/40 transition-colors">
              <div className="flex items-center gap-3">
                <UserPlus className="h-5 w-5 text-[#6096ba]" />
                <span className="font-medium">Add Student</span>
              </div>
            </Link>
          </CardContent>
        </Card>

        <Card className="border-2 bg-[#e7ecef]">
          <CardHeader>
            <CardTitle className="text-[#274c77]">Recent Activity</CardTitle>
            <CardDescription>Latest updates in your class</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {classInfo.recentActivity.map((a, i) => (
                <div key={i} className="flex items-center gap-3 text-sm">
                  <div className={`w-2 h-2 ${a.color} rounded-full`}></div>
                  <span>{a.text}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
