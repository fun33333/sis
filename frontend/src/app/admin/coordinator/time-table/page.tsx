"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Clock, Calendar, Edit, Plus, Download, Users, Save, X, Check } from "lucide-react"
import { getCoordinatorTeachers, findCoordinatorByEmail } from "@/lib/api"

interface Teacher {
  id: number
  full_name: string
  current_subjects: string
  current_classes_taught: string
  email: string
}

interface Period {
  id?: string
  subject: string
  teacher: string
  teacherId: number
  section: string
  grade: string
  isBreak?: boolean
  isFree?: boolean
}

interface TimeTableData {
  [day: string]: {
    [timeSlot: string]: Period
  }
}

export default function TimeTablePage() {
  useEffect(() => {
    document.title = "Time Table - Coordinator | IAK SMS";
  }, []);

  const [teachers, setTeachers] = useState<Teacher[]>([])
  const [timeTableData, setTimeTableData] = useState<TimeTableData>({})
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [editingPeriod, setEditingPeriod] = useState<{day: string, timeSlot: string} | null>(null)
  const [newPeriod, setNewPeriod] = useState<Period>({
    subject: '',
    teacher: '',
    teacherId: 0,
    section: '',
    grade: ''
  })
  const [loading, setLoading] = useState(true)

  const timeSlots = [
    "08:00 - 08:45",
    "08:45 - 09:30", 
    "09:30 - 10:15",
    "10:15 - 11:00",
    "11:00 - 11:30", // Break
    "11:30 - 12:15",
    "12:15 - 01:00",
    "01:00 - 01:30" // Last period
  ]

  const weekDays = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"]

  // Fetch teachers assigned to coordinator
  const fetchTeachers = async () => {
    try {
      setLoading(true)
      const userData = localStorage.getItem('userData')
      if (!userData) return

      const { email } = JSON.parse(userData)
      const coordinator = await findCoordinatorByEmail(email)
      
      if (coordinator) {
        const teachersData = await getCoordinatorTeachers(coordinator.id)
        setTeachers(teachersData as Teacher[])
      }
    } catch (error) {
      console.error('Error fetching teachers:', error)
    } finally {
      setLoading(false)
    }
  }

  // Initialize time table data structure
  const initializeTimeTable = () => {
    const initialData: TimeTableData = {}
    
    weekDays.forEach(day => {
      initialData[day] = {}
      timeSlots.forEach(timeSlot => {
        // Set break periods - 11:00-11:30 is ALWAYS break
        if (timeSlot.includes("11:00 - 11:30")) {
          initialData[day][timeSlot] = {
            subject: "Break",
            teacher: "",
            teacherId: 0,
            section: "",
            grade: "",
            isBreak: true
          }
        } else {
          // Set as free period
          initialData[day][timeSlot] = {
            subject: "",
            teacher: "",
            teacherId: 0,
            section: "",
            grade: "",
            isFree: true
          }
        }
      })
    })
    
    setTimeTableData(initialData)
  }

  // Reset time table with break period fixed
  const resetTimeTable = () => {
    initializeTimeTable()
  }

  useEffect(() => {
    fetchTeachers()
    initializeTimeTable()
  }, [])


  // Handle period assignment
  const handleAssignPeriod = (day: string, timeSlot: string) => {
    // Don't allow editing break period
    if (timeSlot.includes("11:00 - 11:30")) {
      alert("Break period cannot be edited!")
      return
    }
    
    setEditingPeriod({ day, timeSlot })
    const currentPeriod = timeTableData[day]?.[timeSlot]
    if (currentPeriod && !currentPeriod.isBreak) {
      setNewPeriod({
        subject: currentPeriod.subject,
        teacher: currentPeriod.teacher,
        teacherId: currentPeriod.teacherId,
        section: currentPeriod.section,
        grade: currentPeriod.grade
      })
    } else {
      setNewPeriod({
        subject: '',
        teacher: '',
        teacherId: 0,
        section: '',
        grade: ''
      })
    }
    setIsEditDialogOpen(true)
  }

  // Save period assignment
  const handleSavePeriod = () => {
    if (!editingPeriod) return

    const { day, timeSlot } = editingPeriod
    const updatedData = { ...timeTableData }
    
    updatedData[day][timeSlot] = {
      ...newPeriod,
      isFree: false,
      isBreak: false
    }
    
    setTimeTableData(updatedData)
    setIsEditDialogOpen(false)
    setEditingPeriod(null)
    setNewPeriod({ subject: '', teacher: '', teacherId: 0, section: '', grade: '' })
  }

  // Clear period
  const handleClearPeriod = (day: string, timeSlot: string) => {
    // Don't allow clearing break period
    if (timeSlot.includes("11:00 - 11:30")) {
      alert("Break period cannot be cleared!")
      return
    }
    
    const updatedData = { ...timeTableData }
    updatedData[day][timeSlot] = {
      subject: "",
      teacher: "",
      teacherId: 0,
      section: "",
      grade: "",
      isFree: true
    }
    setTimeTableData(updatedData)
  }

  // Get teachers for selected subject
  const getTeachersForSubject = (subject: string) => {
    return teachers.filter(teacher => 
      teacher.current_subjects?.toLowerCase().includes(subject.toLowerCase())
    )
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 mx-auto mb-4" style={{ borderColor: '#274c77' }}></div>
          <p className="text-gray-600">Loading time table...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: '#274c77' }}>Time Table Management</h1>
          <p className="text-gray-600">Create and manage class schedules and time tables</p>
        </div>
        <div className="flex space-x-2">
          <Button 
            style={{ backgroundColor: '#6096ba', color: 'white' }}
            onClick={() => {
              // Save time table to localStorage or send to backend
              localStorage.setItem('timeTableData', JSON.stringify(timeTableData))
              alert('Time table saved successfully!')
            }}
          >
            <Save className="h-4 w-4 mr-2" />
            Save Time Table
          </Button>
          <Button 
            variant="outline" 
            style={{ borderColor: '#274c77', color: '#274c77' }}
            onClick={resetTimeTable}
          >
            <X className="h-4 w-4 mr-2" />
            Reset
          </Button>
          <Button variant="outline" style={{ borderColor: '#6096ba', color: '#274c77' }}>
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>


      {/* Time Table Grid */}
      <Card style={{ backgroundColor: 'white', borderColor: '#a3cef1' }}>
        <CardHeader>
          <CardTitle style={{ color: '#274c77' }} className="flex items-center">
            <Calendar className="h-5 w-5 mr-2" />
            Weekly Time Table
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
                      const period = timeTableData[day]?.[timeSlot]
                      const isBreak = period?.isBreak
                      const isFree = period?.isFree
                      
                      return (
                        <td key={dayIndex} className="border border-gray-300 py-2 px-2 text-center" style={{ backgroundColor: dayIndex % 2 === 0 ? '#f8f9fa' : 'white' }}>
                          {isBreak ? (
                            <div className="p-2 rounded cursor-not-allowed" style={{ backgroundColor: '#8b8c89' }}>
                              <span className="text-white text-sm font-medium">
                                Break
                              </span>
                              <div className="text-xs text-white/70 mt-1">
                                Fixed Period
                              </div>
                            </div>
                          ) : period && !isFree ? (
                            <div className="relative group">
                              <div 
                                className="p-2 rounded hover:shadow-md transition-all cursor-pointer" 
                                style={{ backgroundColor: '#a3cef1' }}
                                onClick={() => handleAssignPeriod(day, timeSlot)}
                              >
                                <div className="text-sm font-medium" style={{ color: '#274c77' }}>
                                  {period.subject}
                                </div>
                                <div className="text-xs" style={{ color: '#274c77' }}>
                                  {period.teacher}
                                </div>
                                <div className="text-xs text-gray-500">
                                  {period.section} - {period.grade}
                                </div>
                              </div>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation()
                                  handleClearPeriod(day, timeSlot)
                                }}
                                className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                              >
                                <X className="h-3 w-3" />
                              </button>
                            </div>
                          ) : (
                            <div 
                              className="p-2 rounded border-dashed border-2 hover:bg-gray-50 cursor-pointer" 
                              style={{ borderColor: '#a3cef1' }}
                              onClick={() => handleAssignPeriod(day, timeSlot)}
                            >
                              <Plus className="h-4 w-4 mx-auto text-gray-400" />
                              <span className="text-xs text-gray-500 mt-1 block">Add Period</span>
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

      {/* Period Assignment Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle style={{ color: '#274c77' }}>
              {editingPeriod ? 'Edit Period' : 'Assign Period'}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="subject">Subject</Label>
              <Input
                id="subject"
                value={newPeriod.subject}
                onChange={(e) => setNewPeriod({...newPeriod, subject: e.target.value})}
                placeholder="Enter subject name"
              />
            </div>
            
            <div>
              <Label htmlFor="teacher">Teacher</Label>
              <Select 
                value={newPeriod.teacherId.toString()} 
                onValueChange={(value) => {
                  const teacherId = parseInt(value)
                  const teacher = teachers.find(t => t.id === teacherId)
                  setNewPeriod({
                    ...newPeriod,
                    teacherId,
                    teacher: teacher?.full_name || ''
                  })
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select teacher" />
                </SelectTrigger>
                <SelectContent>
                  {teachers.map(teacher => (
                    <SelectItem key={teacher.id} value={teacher.id.toString()}>
                      {teacher.full_name} - {teacher.current_subjects}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="grade">Grade</Label>
              <Select 
                value={newPeriod.grade} 
                onValueChange={(value) => setNewPeriod({...newPeriod, grade: value})}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select grade" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Grade 1">Grade 1</SelectItem>
                  <SelectItem value="Grade 2">Grade 2</SelectItem>
                  <SelectItem value="Grade 3">Grade 3</SelectItem>
                  <SelectItem value="Grade 4">Grade 4</SelectItem>
                  <SelectItem value="Grade 5">Grade 5</SelectItem>
                  <SelectItem value="Grade 6">Grade 6</SelectItem>
                  <SelectItem value="Grade 7">Grade 7</SelectItem>
                  <SelectItem value="Grade 8">Grade 8</SelectItem>
                  <SelectItem value="Grade 9">Grade 9</SelectItem>
                  <SelectItem value="Grade 10">Grade 10</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="section">Section</Label>
              <Input
                id="section"
                value={newPeriod.section}
                onChange={(e) => setNewPeriod({...newPeriod, section: e.target.value})}
                placeholder="Enter section (e.g., A, B, C)"
              />
            </div>
            
            <div className="flex justify-end space-x-2">
              <Button 
                variant="outline" 
                onClick={() => setIsEditDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button 
                style={{ backgroundColor: '#274c77', color: 'white' }}
                onClick={handleSavePeriod}
                disabled={!newPeriod.subject || !newPeriod.teacher || !newPeriod.grade || !newPeriod.section}
              >
                <Save className="h-4 w-4 mr-2" />
                Save Period
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

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
