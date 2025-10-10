"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Clock, Calendar, Edit, Plus, Download, Users, Save, X, Check } from "lucide-react"
import { getCoordinatorTeachers, findCoordinatorByEmployeeCode } from "@/lib/api"

interface Teacher {
  id: number
  full_name: string
  current_subjects: string
  current_classes_taught: string
  email: string
  employee_code: string
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
  const [isTimeTableSaved, setIsTimeTableSaved] = useState(false)
  const [savedTimeTable, setSavedTimeTable] = useState<TimeTableData | null>(null)
  const [showSuccessMessage, setShowSuccessMessage] = useState(false)
  const [selectedTeacher, setSelectedTeacher] = useState<Teacher | null>(null)
  const [savedTimeTableList, setSavedTimeTableList] = useState<any[]>([])
  const [showAllTimeTables, setShowAllTimeTables] = useState(false)

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

  const weekDays = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]

  // Fetch teachers assigned to coordinator
  const fetchTeachers = async () => {
    try {
      setLoading(true)
      const userData = localStorage.getItem('sis_user')
      if (!userData) {
        console.error('No user data found in localStorage')
        return
      }

      const user = JSON.parse(userData)
      const coordinator = await findCoordinatorByEmployeeCode(user.username)
      
      if (coordinator) {
        const teachersData = await getCoordinatorTeachers(coordinator.id)
        
        // Handle different response formats
        let teachers = []
        if (Array.isArray(teachersData)) {
          teachers = teachersData
        } else if (teachersData && (teachersData as any).teachers) {
          teachers = (teachersData as any).teachers
        } else if (teachersData && Array.isArray((teachersData as any).results)) {
          teachers = (teachersData as any).results
        }
        
        setTeachers(teachers as Teacher[])
      } else {
        console.error('No coordinator found for employee code:', user.username)
        setTeachers([])
      }
    } catch (error) {
      console.error('Error fetching teachers:', error)
      setTeachers([])
      // Show user-friendly error message
      alert('Failed to load teachers. Please check if backend server is running.')
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
        // Set break periods - 11:00-11:30 is ALWAYS break for ALL days including Saturday
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

  // Clear all periods and reset form
  const clearAllPeriods = () => {
    // Clear localStorage first
    localStorage.removeItem('coordinator_timetable')
    
    // Initialize fresh empty time table
    initializeTimeTable()
    
    // Reset all states
    setSelectedTeacher(null)
    setNewPeriod({ subject: '', teacher: '', teacherId: 0, section: '', grade: '' })
    setIsEditDialogOpen(false)
    setEditingPeriod(null)
    setIsTimeTableSaved(false)
    setSavedTimeTable(null)
  }

  // Save time table to localStorage
  const saveTimeTable = () => {
    try {
      localStorage.setItem('coordinator_timetable', JSON.stringify(timeTableData))
      setSavedTimeTable({...timeTableData})
      setIsTimeTableSaved(true)
      
      // Add to saved time table list
      const newSavedItem = {
        id: Date.now(), // Simple ID generation
        timestamp: new Date().toLocaleString(),
        data: {...timeTableData},
        periodsCount: Object.keys(timeTableData).reduce((total, day) => {
          return total + Object.keys(timeTableData[day]).filter(timeSlot => {
            const period = timeTableData[day][timeSlot]
            return !period.isBreak && !period.isFree && period.subject && period.subject.trim() !== ''
          }).length
        }, 0)
      }
      
      setSavedTimeTableList(prev => [newSavedItem, ...prev])
      
      alert('Time table saved successfully! This will be your default schedule.')
    } catch (error) {
      console.error('Error saving time table:', error)
      alert('Failed to save time table')
    }
  }

  // Load saved time table from localStorage
  const loadSavedTimeTable = () => {
    try {
      const saved = localStorage.getItem('coordinator_timetable')
      if (saved) {
        const parsedData = JSON.parse(saved)
        setTimeTableData(parsedData)
        setSavedTimeTable(parsedData)
        setIsTimeTableSaved(true)
        alert('Saved time table loaded successfully!')
      } else {
        alert('No saved time table found. Please create and save one first.')
      }
    } catch (error) {
      console.error('Error loading time table:', error)
      alert('Failed to load saved time table')
    }
  }

  useEffect(() => {
    fetchTeachers()
    
    // Force reset to ensure Saturday is included
    initializeTimeTable()
    
    // Try to load saved time table after a short delay
    setTimeout(() => {
      const saved = localStorage.getItem('coordinator_timetable')
      if (saved) {
        try {
          const parsedData = JSON.parse(saved)
          // Ensure Saturday is included in saved data
          if (!parsedData.Saturday) {
            parsedData.Saturday = {}
            timeSlots.forEach(timeSlot => {
              if (timeSlot.includes("11:00 - 11:30")) {
                parsedData.Saturday[timeSlot] = {
                  subject: "Break",
                  teacher: "",
                  teacherId: 0,
                  section: "",
                  grade: "",
                  isBreak: true
                }
              } else {
                parsedData.Saturday[timeSlot] = {
                  subject: "",
                  teacher: "",
                  teacherId: 0,
                  section: "",
                  grade: "",
                  isFree: true
                }
              }
            })
          }
          setTimeTableData(parsedData)
          setSavedTimeTable(parsedData)
          setIsTimeTableSaved(true)
        } catch (error) {
          console.error('Error loading saved time table:', error)
          initializeTimeTable()
        }
      }
    }, 100)
  }, [])


  // Handle teacher selection and pre-fill form
  const handleTeacherSelect = (teacher: Teacher) => {
    console.log('Teacher selected:', teacher)
    setSelectedTeacher(teacher)
    // Pre-fill form with selected teacher data
    setNewPeriod({
      subject: teacher.current_subjects || 'Subject',
      teacher: `${teacher.full_name} - ${teacher.employee_code}`,
      teacherId: teacher.id,
      section: 'A', // Default section
      grade: 'Grade 1' // Default grade
    })
    console.log('New period set with teacher:', teacher.full_name)
  }

  // Handle period assignment
  const handleAssignPeriod = (day: string, timeSlot: string) => {
    // Don't allow editing break period
    if (timeSlot.includes("11:00 - 11:30")) {
      alert("Break period cannot be edited!")
      return
    }
    
    console.log('Opening dialog for:', day, timeSlot)
    console.log('Selected teacher:', selectedTeacher)
    
    setEditingPeriod({ day, timeSlot })
    const currentPeriod = timeTableData[day]?.[timeSlot]
    if (currentPeriod && !currentPeriod.isBreak) {
      console.log('Editing existing period:', currentPeriod)
      setNewPeriod({
        subject: currentPeriod.subject,
        teacher: currentPeriod.teacher,
        teacherId: currentPeriod.teacherId,
        section: currentPeriod.section,
        grade: currentPeriod.grade
      })
    } else {
      // If a teacher is already selected externally, pre-fill the form
      if (selectedTeacher) {
        console.log('Pre-filling with selected teacher:', selectedTeacher.full_name)
        setNewPeriod({
          subject: selectedTeacher.current_subjects || 'Subject',
          teacher: `${selectedTeacher.full_name} - ${selectedTeacher.employee_code}`,
          teacherId: selectedTeacher.id,
          section: 'A',
          grade: 'Grade 1'
        })
      } else {
        console.log('No teacher selected, creating empty period')
      setNewPeriod({
        subject: '',
        teacher: '',
        teacherId: 0,
        section: '',
        grade: ''
      })
      }
    }
    setIsEditDialogOpen(true)
  }

  // Save period assignment
  const handleSavePeriod = () => {
    if (!editingPeriod) {
      console.log('No editing period found!')
      return
    }

    const { day, timeSlot } = editingPeriod
    console.log('Saving period for:', day, timeSlot)
    console.log('New period data:', newPeriod)
    console.log('Selected teacher:', selectedTeacher)
    
    // Use selected teacher data if teacher field is empty
    const finalPeriodData = {
      ...newPeriod,
      teacher: newPeriod.teacher || (selectedTeacher ? `${selectedTeacher.full_name} - ${selectedTeacher.employee_code}` : ''),
      teacherId: newPeriod.teacherId || (selectedTeacher ? selectedTeacher.id : 0)
    }
    
    console.log('Final period data:', finalPeriodData)
    
    const updatedData = { ...timeTableData }
    
    updatedData[day][timeSlot] = {
      ...finalPeriodData,
      isFree: false,
      isBreak: false
    }
    
    console.log('Updated data for', day, timeSlot, ':', updatedData[day][timeSlot])
    
    setTimeTableData(updatedData)
    setIsEditDialogOpen(false)
    setEditingPeriod(null)
    setNewPeriod({ subject: '', teacher: '', teacherId: 0, section: '', grade: '' })
    
    console.log('Period saved successfully!')
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


  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 mx-auto mb-4" style={{ borderColor: '#274c77' }}></div>
          <p className="text-gray-600">Loading time table...</p>
          <p className="text-sm text-gray-500 mt-2">Fetching teachers and coordinator data</p>
        </div>
      </div>
    )
  }

  if (teachers.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Users className="h-16 w-16 mx-auto mb-4 text-gray-400" />
          <h2 className="text-xl font-semibold text-gray-700 mb-2">No Teachers Found</h2>
          <p className="text-gray-500 mb-4">No teachers are assigned to this coordinator yet.</p>
          <p className="text-sm text-gray-400">Please contact administrator to assign teachers to this coordinator.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Success Message */}
      {showSuccessMessage && (
        <div className="fixed top-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50 flex items-center space-x-2">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
          <span>✅ Time table saved successfully! Form reset for new assignments.</span>
        </div>
      )}
      
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: '#274c77' }}>Time Table Management</h1>
          <p className="text-gray-600">
            {isTimeTableSaved 
              ? '✅ Default schedule saved! Make changes and save to update.' 
              : 'Create your default schedule once, then reuse it every week. Make changes as needed.'
            }
          </p>
        </div>
        <div className="flex space-x-2">
          <Button 
            variant="outline" 
            onClick={() => setShowAllTimeTables(!showAllTimeTables)}
            className="flex items-center space-x-2"
          >
            <Calendar className="h-4 w-4" />
            <span>{showAllTimeTables ? 'Hide All Time Tables' : 'View All Time Tables'}</span>
          </Button>
        </div>
      </div>


      {/* Quick Teacher Selection */}
      <Card style={{ backgroundColor: '#f8f9fa', borderColor: '#a3cef1' }}>
        <CardContent className="p-4">
          <div className="flex items-center space-x-4">
            <div className="flex-1">
              <Label htmlFor="main-teacher-select" className="text-sm font-medium" style={{ color: '#274c77' }}>
                Quick Teacher Selection
              </Label>
              <Select 
                value={selectedTeacher ? selectedTeacher.id.toString() : ""}
                onValueChange={(value) => {
                  const teacher = teachers.find(t => t.id === parseInt(value))
                  if (teacher) {
                    handleTeacherSelect(teacher)
                  }
                }}
              >
                <SelectTrigger className="w-full mt-1">
                  <SelectValue placeholder="Select teacher for quick assignment" />
                </SelectTrigger>
                <SelectContent>
                  {teachers.map(teacher => (
                    <SelectItem key={teacher.id} value={teacher.id.toString()}>
                      {teacher.full_name} - {teacher.employee_code}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center space-x-3">
              <div className="text-sm text-gray-600">
                {selectedTeacher ? (
                  <span>Selected: <strong style={{ color: '#274c77' }}>{selectedTeacher.full_name} - {selectedTeacher.employee_code}</strong></span>
                ) : (
                  <span>No teacher selected</span>
                )}
              </div>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => {
                  setSelectedTeacher(null)
                  setNewPeriod({ subject: '', teacher: '', teacherId: 0, section: '', grade: '' })
                }}
                disabled={!selectedTeacher}
                className="ml-2"
              >
                <X className="h-4 w-4 mr-1" />
                Clear
              </Button>
              <Button 
                style={{ backgroundColor: '#10b981', color: 'white' }}
                onClick={() => {
                  // Debug: Log current time table data
                  console.log('Current timeTableData:', timeTableData)
                  
                  // Check if any periods are filled
                  const hasPeriods = Object.keys(timeTableData).some(day => 
                    Object.keys(timeTableData[day]).some(timeSlot => {
                      const period = timeTableData[day][timeSlot]
                      console.log(`Checking ${day} ${timeSlot}:`, period)
                      return !period.isBreak && !period.isFree && period.subject && period.subject.trim() !== '' && period.teacher && period.teacher.trim() !== ''
                    })
                  )
                  
                  console.log('Has periods:', hasPeriods)
                  
                  if (hasPeriods) {
                    saveTimeTable()
                    
                    // Clear all periods and reset form after saving
                    clearAllPeriods()
                    
                    // Show success message
                    setShowSuccessMessage(true)
                    setTimeout(() => setShowSuccessMessage(false), 3000)
                    
                    alert('✅ Time table saved successfully! Form has been reset for new assignments.')
                  } else {
                    alert('Please fill at least one period before saving!')
                  }
                }}
              >
                <Save className="h-4 w-4 mr-2" />
                Save Time Table
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

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
                              className="p-2 rounded border-dashed border-2 hover:bg-gray-50 cursor-pointer transition-all"
                              style={{ borderColor: '#a3cef1' }}
                              onClick={() => handleAssignPeriod(day, timeSlot)}
                            >
                              <Plus className="h-4 w-4 mx-auto text-gray-400" />
                              <span className="text-xs mt-1 block text-gray-500">
                                Add Period
                              </span>
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
            {selectedTeacher && (
              <p className="text-sm text-gray-600">
                Pre-filled with selected teacher: <strong>{selectedTeacher.full_name}</strong>
              </p>
            )}
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
              <Input
                id="teacher"
                value={newPeriod.teacher || ''}
                placeholder="Teacher name will auto-fill from external selection"
                readOnly
                className="bg-gray-50"
              />
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
                disabled={false}
              >
                <Save className="h-4 w-4 mr-2" />
                {editingPeriod ? 'Update Period' : 'Assign Period'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Saved Time Tables List */}
      {savedTimeTableList.length > 0 && (
        <Card style={{ backgroundColor: '#f8f9fa', borderColor: '#a3cef1' }}>
          <CardHeader>
            <CardTitle style={{ color: '#274c77' }} className="flex items-center">
              <Calendar className="h-5 w-5 mr-2" />
              Saved Time Tables
            </CardTitle>
            <p className="text-sm text-gray-600">
              Your previously saved time tables are listed below
            </p>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {savedTimeTableList.map((item) => (
                <div key={item.id} className="flex items-center justify-between p-3 bg-white rounded-lg border border-gray-200">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3">
                      <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                      <div>
                        <h4 className="font-medium text-gray-900">
                          Time Table #{item.id}
                        </h4>
                        <p className="text-sm text-gray-600">
                          Saved on: {item.timestamp}
                        </p>
                        <p className="text-xs text-gray-500">
                          {item.periodsCount} periods assigned
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => {
                        setTimeTableData(item.data)
                        alert('Time table loaded successfully!')
                      }}
                    >
                      <Calendar className="h-4 w-4 mr-1" />
                      Load
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => {
                        setSavedTimeTableList(prev => prev.filter(savedItem => savedItem.id !== item.id))
                        alert('Time table removed from list!')
                      }}
                    >
                      <X className="h-4 w-4 mr-1" />
                      Remove
            </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* View All Time Tables Section */}
      {showAllTimeTables && (
        <Card style={{ backgroundColor: '#f8f9fa', borderColor: '#a3cef1' }}>
          <CardHeader>
            <CardTitle style={{ color: '#274c77' }} className="flex items-center">
              <Calendar className="h-5 w-5 mr-2" />
              All Saved Time Tables Overview
            </CardTitle>
            <p className="text-sm text-gray-600">
              Complete overview of all your saved time tables
            </p>
          </CardHeader>
          <CardContent>
            {savedTimeTableList.length === 0 ? (
              <div className="text-center py-8">
                <Calendar className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                <p className="text-gray-600">No time tables saved yet</p>
                <p className="text-sm text-gray-500 mt-2">Create and save your first time table to see it here</p>
              </div>
            ) : (
              <div className="space-y-6">
                {savedTimeTableList.map((item, index) => (
                  <div key={item.id} className="bg-white rounded-lg border border-gray-200 p-4">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h3 className="text-lg font-semibold" style={{ color: '#274c77' }}>
                          Time Table #{index + 1}
                        </h3>
                        <p className="text-sm text-gray-600">
                          Saved on: {item.timestamp}
                        </p>
                        <p className="text-xs text-gray-500">
                          {item.periodsCount} periods assigned
                        </p>
                      </div>
                      <div className="flex space-x-2">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => {
                            setTimeTableData(item.data)
                            setShowAllTimeTables(false)
                            alert('Time table loaded successfully!')
                          }}
                        >
                          <Calendar className="h-4 w-4 mr-1" />
                          Load
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => {
                            setSavedTimeTableList(prev => prev.filter(savedItem => savedItem.id !== item.id))
                            alert('Time table removed from list!')
                          }}
                        >
                          <X className="h-4 w-4 mr-1" />
                          Remove
            </Button>
                      </div>
                    </div>
                    
                    {/* Time Table Preview */}
                    <div className="overflow-x-auto">
                      <table className="w-full border-collapse text-xs">
                        <thead>
                          <tr style={{ backgroundColor: '#274c77' }}>
                            <th className="border border-gray-300 py-2 px-2 text-white text-left">Time</th>
                            {weekDays.map(day => (
                              <th key={day} className="border border-gray-300 py-2 px-2 text-white text-center">{day}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {timeSlots.map((timeSlot, timeIndex) => (
                            <tr key={timeIndex}>
                              <td className="border border-gray-300 py-1 px-2 font-medium text-xs" style={{ backgroundColor: '#e7ecef' }}>
                                {timeSlot}
                              </td>
                              {weekDays.map((day, dayIndex) => {
                                const period = item.data[day]?.[timeSlot]
                                const isBreak = period?.isBreak
                                const isFree = period?.isFree
                                
                                return (
                                  <td key={dayIndex} className="border border-gray-300 py-1 px-1 text-center" style={{ backgroundColor: dayIndex % 2 === 0 ? '#f8f9fa' : 'white' }}>
                                    {isBreak ? (
                                      <div className="p-1 rounded text-xs" style={{ backgroundColor: '#8b8c89' }}>
                                        <span className="text-white">Break</span>
                                      </div>
                                    ) : period && !isFree ? (
                                      <div className="p-1 rounded text-xs" style={{ backgroundColor: '#a3cef1' }}>
                                        <div className="font-medium" style={{ color: '#274c77' }}>
                                          {period.subject}
                                        </div>
                                        <div className="text-xs" style={{ color: '#274c77' }}>
                                          {period.teacher}
                                        </div>
                                      </div>
                                    ) : (
                                      <div className="p-1 text-gray-400 text-xs">
                                        Free
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
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

    </div>
  )
}
