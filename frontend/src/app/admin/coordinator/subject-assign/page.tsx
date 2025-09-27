"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { BookOpen, Users, Plus, Eye, Edit } from "lucide-react"

export default function SubjectAssignPage() {
  useEffect(() => {
    document.title = "Subject Assignment - Coordinator | IAK SMS";
  }, []);

  const subjectAssignments = [
    { id: 1, subject: "Mathematics", teacher: "Ahmed Ali", classes: ["5A", "5B", "6A"], workload: "18 hrs/week", status: "Active" },
    { id: 2, subject: "English", teacher: "Fatima Sheikh", classes: ["6B", "7A"], workload: "12 hrs/week", status: "Active" },
    { id: 3, subject: "Science", teacher: "Unassigned", classes: ["7B", "8A"], workload: "14 hrs/week", status: "Vacant" },
    { id: 4, subject: "Urdu", teacher: "Aisha Khan", classes: ["4A", "4B"], workload: "10 hrs/week", status: "Active" },
    { id: 5, subject: "Computer", teacher: "Unassigned", classes: ["8B", "9A"], workload: "8 hrs/week", status: "Vacant" },
  ]

  const subjects = [
    { name: "Mathematics", totalClasses: 6, assignedClasses: 4, vacantClasses: 2 },
    { name: "English", totalClasses: 5, assignedClasses: 3, vacantClasses: 2 },
    { name: "Science", totalClasses: 4, assignedClasses: 2, vacantClasses: 2 },
    { name: "Urdu", totalClasses: 4, assignedClasses: 3, vacantClasses: 1 },
    { name: "Computer", totalClasses: 3, assignedClasses: 1, vacantClasses: 2 },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold" style={{ color: '#274c77' }}>Subject Assignment</h1>
        <p className="text-gray-600">Assign subjects to teachers and manage workload distribution</p>
      </div>

      {/* Subject Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        {subjects.map((subject, index) => (
          <Card key={index} style={{ backgroundColor: '#e7ecef', borderColor: '#a3cef1' }}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-3">
                <BookOpen className="h-6 w-6" style={{ color: '#274c77' }} />
                <Badge style={{ backgroundColor: '#6096ba', color: 'white' }}>
                  {subject.assignedClasses}/{subject.totalClasses}
                </Badge>
              </div>
              <h3 className="font-semibold mb-2" style={{ color: '#274c77' }}>{subject.name}</h3>
              <div className="text-xs text-gray-600">
                <div>Assigned: {subject.assignedClasses}</div>
                <div>Vacant: {subject.vacantClasses}</div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Filters */}
      <Card style={{ backgroundColor: 'white', borderColor: '#a3cef1' }}>
        <CardContent className="p-4">
          <div className="flex items-center space-x-4">
            <div>
              <label className="text-sm font-medium text-gray-600">Filter by Subject</label>
              <Select defaultValue="all">
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Subjects</SelectItem>
                  <SelectItem value="math">Mathematics</SelectItem>
                  <SelectItem value="english">English</SelectItem>
                  <SelectItem value="science">Science</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-600">Status</label>
              <Select defaultValue="all">
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="assigned">Assigned</SelectItem>
                  <SelectItem value="vacant">Vacant</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button style={{ backgroundColor: '#6096ba', color: 'white' }} className="mt-6">
              <Plus className="h-4 w-4 mr-2" />
              New Assignment
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Subject Assignments Table */}
      <Card style={{ backgroundColor: 'white', borderColor: '#a3cef1' }}>
        <CardHeader>
          <CardTitle style={{ color: '#274c77' }} className="flex items-center">
            <BookOpen className="h-5 w-5 mr-2" />
            Subject Assignments
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr style={{ backgroundColor: '#274c77' }}>
                  <th className="text-left py-3 px-4 text-white">Subject</th>
                  <th className="text-left py-3 px-4 text-white">Teacher</th>
                  <th className="text-left py-3 px-4 text-white">Classes</th>
                  <th className="text-left py-3 px-4 text-white">Workload</th>
                  <th className="text-left py-3 px-4 text-white">Status</th>
                  <th className="text-left py-3 px-4 text-white">Actions</th>
                </tr>
              </thead>
              <tbody>
                {subjectAssignments.map((assignment, index) => (
                  <tr key={assignment.id} style={{ backgroundColor: index % 2 === 0 ? '#e7ecef' : 'white' }}>
                    <td className="py-3 px-4 font-medium">{assignment.subject}</td>
                    <td className="py-3 px-4">
                      {assignment.teacher === 'Unassigned' ? (
                        <span className="text-red-500 font-medium">Unassigned</span>
                      ) : (
                        assignment.teacher
                      )}
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex flex-wrap gap-1">
                        {assignment.classes.map((cls, idx) => (
                          <Badge key={idx} variant="outline" style={{ borderColor: '#a3cef1', color: '#274c77' }}>
                            {cls}
                          </Badge>
                        ))}
                      </div>
                    </td>
                    <td className="py-3 px-4">{assignment.workload}</td>
                    <td className="py-3 px-4">
                      <Badge 
                        style={{ 
                          backgroundColor: assignment.status === 'Active' ? '#6096ba' : '#ef4444',
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
                            <Plus className="h-4 w-4 mr-1" />
                            Assign
                          </Button>
                        ) : (
                          <>
                            <Button size="sm" variant="outline" style={{ borderColor: '#6096ba', color: '#274c77' }}>
                              <Eye className="h-4 w-4 mr-1" />
                              View
                            </Button>
                            <Button size="sm" variant="outline" style={{ borderColor: '#6096ba', color: '#274c77' }}>
                              <Edit className="h-4 w-4 mr-1" />
                              Edit
                            </Button>
                          </>
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
    </div>
  )
}
