"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Clock, Calendar, Edit, Plus, Download, Users } from "lucide-react"

export default function TimeTablePage() {
  useEffect(() => {
    document.title = "Time Table - Coordinator | IAK SMS";
  }, []);

  const [selectedClass, setSelectedClass] = useState("5a")
  const [selectedDay, setSelectedDay] = useState("monday")

  const timeSlots = [
    "08:00 - 08:45",
    "08:45 - 09:30", 
    "09:30 - 10:15",
    "10:15 - 10:30", // Break
    "10:30 - 11:15",
    "11:15 - 12:00",
    "12:00 - 12:45",
    "12:45 - 01:30", // Lunch
    "01:30 - 02:15",
    "02:15 - 03:00"
  ]

  const weekDays = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"]

  const timeTable = {
    "Monday": [
      { time: "08:00 - 08:45", subject: "Mathematics", teacher: "Ahmed Ali", room: "101" },
      { time: "08:45 - 09:30", subject: "English", teacher: "Fatima Sheikh", room: "102" },
      { time: "09:30 - 10:15", subject: "Science", teacher: "Hassan Khan", room: "Lab-1" },
      { time: "10:15 - 10:30", subject: "Break", teacher: "", room: "" },
      { time: "10:30 - 11:15", subject: "Urdu", teacher: "Aisha Khan", room: "103" },
      { time: "11:15 - 12:00", subject: "Islamic Studies", teacher: "Muhammad Ali", room: "104" },
      { time: "12:00 - 12:45", subject: "Computer", teacher: "Sara Ahmed", room: "Lab-2" },
      { time: "12:45 - 01:30", subject: "Lunch Break", teacher: "", room: "" },
      { time: "01:30 - 02:15", subject: "Physical Education", teacher: "Omar Sheikh", room: "Ground" },
      { time: "02:15 - 03:00", subject: "Art", teacher: "Zara Khan", room: "Art Room" },
    ]
  }

  const currentDaySchedule = timeTable["Monday"] || []

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: '#274c77' }}>Time Table Management</h1>
          <p className="text-gray-600">Create and manage class schedules and time tables</p>
        </div>
        <div className="flex space-x-2">
          <Button style={{ backgroundColor: '#6096ba', color: 'white' }}>
            <Plus className="h-4 w-4 mr-2" />
            Add Period
          </Button>
          <Button variant="outline" style={{ borderColor: '#6096ba', color: '#274c77' }}>
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Controls */}
      <Card style={{ backgroundColor: 'white', borderColor: '#a3cef1' }}>
        <CardContent className="p-4">
          <div className="flex items-center space-x-4">
            <div>
              <label className="text-sm font-medium text-gray-600">Select Class</label>
              <Select value={selectedClass} onValueChange={setSelectedClass}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="5a">Grade 5A</SelectItem>
                  <SelectItem value="5b">Grade 5B</SelectItem>
                  <SelectItem value="6a">Grade 6A</SelectItem>
                  <SelectItem value="6b">Grade 6B</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-600">Day</label>
              <Select value={selectedDay} onValueChange={setSelectedDay}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {weekDays.map(day => (
                    <SelectItem key={day.toLowerCase()} value={day.toLowerCase()}>
                      {day}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Time Table Grid */}
      <Card style={{ backgroundColor: 'white', borderColor: '#a3cef1' }}>
        <CardHeader>
          <CardTitle style={{ color: '#274c77' }} className="flex items-center">
            <Calendar className="h-5 w-5 mr-2" />
            Weekly Time Table - Grade 5A
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr style={{ backgroundColor: '#274c77' }}>
                  <th className="border border-gray-300 py-3 px-4 text-white text-left">Time</th>
                  {weekDays.map(day => (
                    <th key={day} className="border border-gray-300 py-3 px-4 text-white text-center">{day}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {timeSlots.map((timeSlot, timeIndex) => (
                  <tr key={timeIndex}>
                    <td className="border border-gray-300 py-3 px-4 font-medium" style={{ backgroundColor: '#e7ecef' }}>
                      {timeSlot}
                    </td>
                    {weekDays.map((day, dayIndex) => {
                      const period = currentDaySchedule.find(p => p.time === timeSlot)
                      const isBreak = timeSlot.includes("10:15 - 10:30") || timeSlot.includes("12:45 - 01:30")
                      
                      return (
                        <td key={dayIndex} className="border border-gray-300 py-2 px-2 text-center" style={{ backgroundColor: dayIndex % 2 === 0 ? '#f8f9fa' : 'white' }}>
                          {isBreak ? (
                            <div className="p-2 rounded" style={{ backgroundColor: '#8b8c89' }}>
                              <span className="text-white text-sm font-medium">
                                {timeSlot.includes("10:15") ? "Break" : "Lunch"}
                              </span>
                            </div>
                          ) : period ? (
                            <div className="p-2 rounded hover:shadow-md transition-all cursor-pointer" style={{ backgroundColor: '#a3cef1' }}>
                              <div className="text-sm font-medium" style={{ color: '#274c77' }}>{period.subject}</div>
                              <div className="text-xs" style={{ color: '#274c77' }}>{period.teacher}</div>
                              <div className="text-xs text-gray-500">{period.room}</div>
                            </div>
                          ) : (
                            <div className="p-2 rounded border-dashed border-2 hover:bg-gray-50 cursor-pointer" style={{ borderColor: '#a3cef1' }}>
                              <Plus className="h-4 w-4 mx-auto text-gray-400" />
                            </div>
                          )}
                        </td>
                      )
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card style={{ backgroundColor: '#e7ecef', borderColor: '#a3cef1' }}>
          <CardContent className="p-4 text-center">
            <Clock className="h-8 w-8 mx-auto mb-3" style={{ color: '#274c77' }} />
            <h3 className="font-semibold mb-2" style={{ color: '#274c77' }}>Schedule Templates</h3>
            <p className="text-sm text-gray-600 mb-4">Create reusable time table templates</p>
            <Button variant="outline" style={{ borderColor: '#6096ba', color: '#274c77' }}>
              Manage Templates
            </Button>
          </CardContent>
        </Card>

        <Card style={{ backgroundColor: '#a3cef1', borderColor: '#6096ba' }}>
          <CardContent className="p-4 text-center">
            <Users className="h-8 w-8 mx-auto mb-3" style={{ color: '#274c77' }} />
            <h3 className="font-semibold mb-2" style={{ color: '#274c77' }}>Teacher Availability</h3>
            <p className="text-sm mb-4" style={{ color: '#274c77' }}>Check teacher schedule conflicts</p>
            <Button style={{ backgroundColor: '#274c77', color: 'white' }}>
              Check Availability
            </Button>
          </CardContent>
        </Card>

        <Card style={{ backgroundColor: '#274c77' }}>
          <CardContent className="p-4 text-center">
            <Calendar className="h-8 w-8 mx-auto mb-3 text-white" />
            <h3 className="font-semibold mb-2 text-white">Bulk Operations</h3>
            <p className="text-sm text-white/80 mb-4">Copy schedules across classes</p>
            <Button variant="outline" className="border-white text-white hover:bg-white hover:text-gray-900">
              Bulk Copy
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
