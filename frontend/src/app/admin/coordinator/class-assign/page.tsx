"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Users, BookOpen, School, UserPlus, Eye } from "lucide-react"

export default function ClassAssignPage() {
  useEffect(() => {
    document.title = "Class Assignment - Coordinator | IAK SMS";
  }, []);

  const [selectedCampus, setSelectedCampus] = useState("all")
  const [selectedGrade, setSelectedGrade] = useState("all")

  const classAssignments = [
    { id: 1, teacher: "Ahmed Ali", subject: "Mathematics", class: "Grade 5A", students: 30, status: "Assigned", campus: "Campus 1" },
    { id: 2, teacher: "Fatima Sheikh", subject: "English", class: "Grade 6B", students: 28, status: "Assigned", campus: "Campus 1" },
    { id: 3, teacher: "Unassigned", subject: "Science", class: "Grade 7A", students: 25, status: "Vacant", campus: "Campus 2" },
    { id: 4, teacher: "Muhammad Hassan", subject: "Urdu", class: "Grade 4B", students: 32, status: "Assigned", campus: "Campus 1" },
    { id: 5, teacher: "Unassigned", subject: "Computer", class: "Grade 8A", students: 27, status: "Vacant", campus: "Campus 2" },
  ]

  const availableTeachers = [
    { id: 1, name: "Ali Raza", subject: "Science", experience: "5 years", status: "Available" },
    { id: 2, name: "Sara Ahmed", subject: "Computer", experience: "3 years", status: "Available" },
    { id: 3, name: "Hassan Sheikh", subject: "Mathematics", experience: "7 years", status: "Partial" },
  ]

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Assigned': return '#6096ba'
      case 'Vacant': return '#ef4444'
      case 'Available': return '#10b981'
      case 'Partial': return '#8b8c89'
      default: return '#8b8c89'
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold" style={{ color: '#274c77' }}>Class Assignment</h1>
        <p className="text-gray-600">Assign teachers to classes and manage class allocations</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card style={{ backgroundColor: '#e7ecef', borderColor: '#a3cef1' }}>
          <CardContent className="p-4 text-center">
            <Users className="h-8 w-8 mx-auto mb-2" style={{ color: '#274c77' }} />
            <div className="text-2xl font-bold" style={{ color: '#274c77' }}>
              {classAssignments.filter(c => c.status === 'Assigned').length}
            </div>
            <div className="text-sm text-gray-600">Assigned Classes</div>
          </CardContent>
        </Card>
        <Card style={{ backgroundColor: '#a3cef1', borderColor: '#6096ba' }}>
          <CardContent className="p-4 text-center">
            <School className="h-8 w-8 mx-auto mb-2" style={{ color: '#274c77' }} />
            <div className="text-2xl font-bold" style={{ color: '#274c77' }}>
              {classAssignments.filter(c => c.status === 'Vacant').length}
            </div>
            <div className="text-sm" style={{ color: '#274c77' }}>Vacant Classes</div>
          </CardContent>
        </Card>
        <Card style={{ backgroundColor: '#6096ba' }}>
          <CardContent className="p-4 text-center">
            <UserPlus className="h-8 w-8 mx-auto mb-2 text-white" />
            <div className="text-2xl font-bold text-white">{availableTeachers.length}</div>
            <div className="text-sm text-white">Available Teachers</div>
          </CardContent>
        </Card>
        <Card style={{ backgroundColor: '#274c77' }}>
          <CardContent className="p-4 text-center">
            <BookOpen className="h-8 w-8 mx-auto mb-2 text-white" />
            <div className="text-2xl font-bold text-white">{classAssignments.length}</div>
            <div className="text-sm text-white">Total Classes</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card style={{ backgroundColor: 'white', borderColor: '#a3cef1' }}>
        <CardContent className="p-4">
          <div className="flex items-center space-x-4">
            <div>
              <label className="text-sm font-medium text-gray-600">Campus</label>
              <Select value={selectedCampus} onValueChange={setSelectedCampus}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Campuses</SelectItem>
                  <SelectItem value="campus1">Campus 1</SelectItem>
                  <SelectItem value="campus2">Campus 2</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-600">Grade</label>
              <Select value={selectedGrade} onValueChange={setSelectedGrade}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Grades</SelectItem>
                  <SelectItem value="grade4">Grade 4</SelectItem>
                  <SelectItem value="grade5">Grade 5</SelectItem>
                  <SelectItem value="grade6">Grade 6</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Class Assignments Table */}
      <Card style={{ backgroundColor: 'white', borderColor: '#a3cef1' }}>
        <CardHeader>
          <CardTitle style={{ color: '#274c77' }} className="flex items-center">
            <School className="h-5 w-5 mr-2" />
            Class Assignments
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr style={{ backgroundColor: '#274c77' }}>
                  <th className="text-left py-3 px-4 text-white">Class</th>
                  <th className="text-left py-3 px-4 text-white">Subject</th>
                  <th className="text-left py-3 px-4 text-white">Teacher</th>
                  <th className="text-left py-3 px-4 text-white">Students</th>
                  <th className="text-left py-3 px-4 text-white">Campus</th>
                  <th className="text-left py-3 px-4 text-white">Status</th>
                  <th className="text-left py-3 px-4 text-white">Actions</th>
                </tr>
              </thead>
              <tbody>
                {classAssignments.map((assignment, index) => (
                  <tr key={assignment.id} style={{ backgroundColor: index % 2 === 0 ? '#e7ecef' : 'white' }}>
                    <td className="py-3 px-4 font-medium">{assignment.class}</td>
                    <td className="py-3 px-4">{assignment.subject}</td>
                    <td className="py-3 px-4">
                      {assignment.teacher === 'Unassigned' ? (
                        <span className="text-red-500 font-medium">Unassigned</span>
                      ) : (
                        assignment.teacher
                      )}
                    </td>
                    <td className="py-3 px-4">{assignment.students}</td>
                    <td className="py-3 px-4">{assignment.campus}</td>
                    <td className="py-3 px-4">
                      <Badge 
                        style={{ 
                          backgroundColor: getStatusColor(assignment.status),
                          color: 'white'
                        }}
                      >
                        {assignment.status}
                      </Badge>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex space-x-2">
                        {assignment.status === 'Vacant' ? (
                          <Button size="sm" style={{ backgroundColor: '#6096ba', color: 'white' }}>
                            <UserPlus className="h-4 w-4 mr-1" />
                            Assign
                          </Button>
                        ) : (
                          <Button size="sm" variant="outline" style={{ borderColor: '#6096ba', color: '#274c77' }}>
                            <Eye className="h-4 w-4 mr-1" />
                            View
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Available Teachers */}
      <Card style={{ backgroundColor: 'white', borderColor: '#a3cef1' }}>
        <CardHeader>
          <CardTitle style={{ color: '#274c77' }} className="flex items-center">
            <Users className="h-5 w-5 mr-2" />
            Available Teachers
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {availableTeachers.map((teacher) => (
              <div key={teacher.id} className="p-4 rounded-lg border hover:shadow-md transition-all" style={{ backgroundColor: '#e7ecef', borderColor: '#a3cef1' }}>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold" style={{ color: '#274c77' }}>{teacher.name}</h3>
                  <Badge 
                    style={{ 
                      backgroundColor: getStatusColor(teacher.status),
                      color: 'white'
                    }}
                  >
                    {teacher.status}
                  </Badge>
                </div>
                <p className="text-sm text-gray-600">Subject: {teacher.subject}</p>
                <p className="text-sm text-gray-600">Experience: {teacher.experience}</p>
                <Button size="sm" className="mt-3 w-full" style={{ backgroundColor: '#274c77', color: 'white' }}>
                  <UserPlus className="h-4 w-4 mr-1" />
                  Assign to Class
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
