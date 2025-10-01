"use client"

import Link from "next/link"
import React, { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Search, Users, Eye, Edit, GraduationCap, Mail, Phone, MapPin, BookOpen } from "lucide-react"
import { getAllTeachers, getAllCampuses } from "@/lib/api"

export default function TeacherListPage() {
  useEffect(() => {
    document.title = "Teacher List | IAK SMS";
  }, []);

  const [search, setSearch] = useState("")
  const [teachers, setTeachers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchTeachers() {
      setLoading(true)
      setError(null)
      try {
        const [teachersData, campusesData] = await Promise.all([
          getAllTeachers(),
          getAllCampuses()
        ])
        
        // Create campus mapping
        const campusMap = new Map()
        if (Array.isArray(campusesData)) {
          campusesData.forEach((campus: any) => {
            campusMap.set(campus.id, campus.name)
          })
        }
        
        // Map teacher data to the expected format
        const mappedTeachers = Array.isArray(teachersData) ? teachersData.map((teacher: any) => ({
          id: teacher.id,
          name: `${teacher.first_name || ''} ${teacher.last_name || ''}`.trim() || teacher.username || 'Unknown',
          subject: teacher.subject || 'Not Assigned',
          campus: campusMap.get(teacher.campus) || 'Unknown Campus',
          email: teacher.email || 'Not provided',
          phone: teacher.phone || 'Not provided',
          experience: teacher.experience || 'Not provided',
          is_active: teacher.is_active,
          classes: teacher.classes || 'Not Assigned',
          joining_date: teacher.joining_date || 'Not provided',
          qualification: teacher.qualification || 'Not provided'
        })) : []
        
        setTeachers(mappedTeachers)
      } catch (err: any) {
        console.error("Error fetching teachers:", err)
        setError(err.message || "Failed to load teachers")
      } finally {
        setLoading(false)
      }
    }
    fetchTeachers()
  }, [])

  const filteredTeachers = teachers.filter(teacher =>
    teacher.name.toLowerCase().includes(search.toLowerCase()) ||
    teacher.subject.toLowerCase().includes(search.toLowerCase()) ||
    teacher.campus.toLowerCase().includes(search.toLowerCase()) ||
    teacher.email.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: '#274c77' }}>Teacher List</h1>
          <p className="text-gray-600">Browse and manage all teachers in the system</p>
          {!loading && !error && (
            <p className="text-sm text-gray-500 mt-1">
              Total Teachers: {teachers.length} | Showing: {filteredTeachers.length}
            </p>
          )}
        </div>
        <Badge style={{ backgroundColor: '#6096ba', color: 'white' }} className="px-4 py-2">
          {filteredTeachers.length} of {teachers.length} Teachers
        </Badge>
      </div>

      {/* Search */}
      <Card style={{ backgroundColor: 'white', borderColor: '#a3cef1' }}>
        <CardContent className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search teachers by name, subject, campus, or email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Teachers List */}
      <Card style={{ backgroundColor: 'white', borderColor: '#a3cef1' }}>
        <CardHeader>
          <CardTitle style={{ color: '#274c77' }} className="flex items-center">
            <Users className="h-5 w-5 mr-2" />
            Teachers Overview
          </CardTitle>
          <CardDescription>Click on any teacher to view their detailed profile</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-2 text-gray-600">Loading teachers...</p>
            </div>
          ) : error ? (
            <div className="text-center py-8">
              <div className="text-red-600 mb-2">Error: {error}</div>
              <Button onClick={() => window.location.reload()} variant="outline">
                Try Again
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredTeachers.map((teacher, index) => (
                <div 
                  key={teacher.id} 
                  className={`flex items-center justify-between p-4 rounded-lg border hover:shadow-md transition-shadow ${
                    index % 2 === 0 ? 'bg-gray-50' : 'bg-white'
                  }`}
                  style={{ 
                    backgroundColor: index % 2 === 0 ? '#e7ecef' : 'white',
                    borderColor: '#a3cef1'
                  }}
                >
                  <div className="flex items-center space-x-4">
                    <div className="bg-gradient-to-r from-blue-500 to-indigo-600 p-3 rounded-full">
                      <GraduationCap className="h-6 w-6 text-white" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        <h3 className="font-semibold text-lg text-gray-900">{teacher.name}</h3>
                        <Badge 
                          style={{ 
                            backgroundColor: teacher.is_active ? '#6096ba' : '#8b8c89', 
                            color: 'white' 
                          }}
                        >
                          {teacher.is_active ? 'Active' : 'Inactive'}
                        </Badge>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm text-gray-600">
                        <div className="flex items-center">
                          <BookOpen className="h-4 w-4 mr-2" />
                          <span><strong>Subject:</strong> {teacher.subject}</span>
                        </div>
                        <div className="flex items-center">
                          <MapPin className="h-4 w-4 mr-2" />
                          <span><strong>Campus:</strong> {teacher.campus}</span>
                        </div>
                        <div className="flex items-center">
                          <Mail className="h-4 w-4 mr-2" />
                          <span><strong>Email:</strong> {teacher.email}</span>
                        </div>
                        <div className="flex items-center">
                          <Phone className="h-4 w-4 mr-2" />
                          <span><strong>Phone:</strong> {teacher.phone}</span>
                        </div>
                      </div>
                      <div className="mt-2 text-sm text-gray-500">
                        <span><strong>Experience:</strong> {teacher.experience} years</span>
                        <span className="mx-2">•</span>
                        <span><strong>Classes:</strong> {teacher.classes}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <Link href={`/admin/teachers/profile?teacherId=${teacher.id}`}>
                      <Button size="sm" variant="outline" style={{ borderColor: '#6096ba', color: '#274c77' }}>
                        <Eye className="h-4 w-4 mr-1" />
                        View Profile
                      </Button>
                    </Link>
                    <Button size="sm" variant="outline" style={{ borderColor: '#6096ba', color: '#274c77' }}>
                      <Edit className="h-4 w-4 mr-1" />
                      Edit
                    </Button>
                  </div>
                </div>
              ))}
              {filteredTeachers.length === 0 && !loading && (
                <div className="text-center py-8 text-gray-500">
                  No teachers found matching your search criteria.
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
