"use client"

import React, { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { 
  ArrowLeft, 
  Mail, 
  Phone, 
  MapPin, 
  Calendar, 
  GraduationCap, 
  BookOpen, 
  Users, 
  User, 
  Clock,
  Award,
  Building,
  Globe,
  FileText,
  CheckCircle,
  XCircle
} from "lucide-react"
import { getAllTeachers } from "@/lib/api"

export default function TeacherProfilePage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const teacherId = searchParams.get('teacherId')
  
  const [teacher, setTeacher] = useState<any>(null)
  const [campus, setCampus] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    document.title = "Teacher Profile | IAK SMS";
  }, []);

  useEffect(() => {
    async function fetchTeacherData() {
      if (!teacherId) {
        setError("No teacher ID provided")
        setLoading(false)
        return
      }
      
      setLoading(true)
      setError(null)
      
      try {
        const teachersData = await getAllTeachers()
        
        // Find the specific teacher
        const foundTeacher = Array.isArray(teachersData) 
          ? teachersData.find((t: any) => t.id.toString() === teacherId.toString())
          : null

        if (!foundTeacher) {
          setError("Teacher not found")
          setLoading(false)
          return
        }

        // Find the campus
        let foundCampus = null
        if (foundTeacher.current_campus) {
          if (typeof foundTeacher.current_campus === 'object') {
            foundCampus = foundTeacher.current_campus
          }
        }

        setTeacher(foundTeacher)
        setCampus(foundCampus)
      } catch (err: any) {
        console.error("Error fetching teacher data:", err)
        setError(err.message || "Failed to load teacher data")
      } finally {
        setLoading(false)
      }
    }

    fetchTeacherData()
  }, [teacherId])

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
  }

  const renderValue = (value: any, fallback: string = 'Not provided') => {
    if (value === null || value === undefined || value === '') return fallback
    if (typeof value === 'boolean') return value ? 'Yes' : 'No'
    if (Array.isArray(value)) return value.length > 0 ? value.join(', ') : fallback
    if (typeof value === 'object') return JSON.stringify(value)
    return value.toString()
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading teacher profile...</p>
        </div>
      </div>
    )
  }

  if (error || !teacher) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="p-8 text-center">
            <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Error</h2>
            <p className="text-gray-600 mb-4">{error || "Teacher not found"}</p>
            <Button onClick={() => router.back()} variant="outline">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Go Back
              </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.back()}
                className="mr-4"
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Teacher Profile</h1>
                <p className="text-sm text-gray-500">Detailed information about {teacher.full_name || 'Unknown Teacher'}</p>
              </div>
            </div>
            <div className="flex gap-3">
              <Button className="bg-blue-600 hover:bg-blue-700">
                <FileText className="w-4 h-4 mr-2" />
                Generate Report
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Main Info */}
          <div className="lg:col-span-2 space-y-6">
            {/* Personal Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="w-5 h-5" />
                  Personal Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-500">Full Name</label>
                    <p className="text-gray-900 font-medium">{renderValue(teacher.full_name)}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Email</label>
                    <p className="text-gray-900">{renderValue(teacher.email)}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Phone Number</label>
                    <p className="text-gray-900">{renderValue(teacher.contact_number)}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Gender</label>
                    <p className="text-gray-900">{renderValue(teacher.gender)}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Date of Birth</label>
                    <p className="text-gray-900">{renderValue(teacher.dob)}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">CNIC</label>
                    <p className="text-gray-900">{renderValue(teacher.cnic)}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Blood Group</label>
                    <p className="text-gray-900">{renderValue(teacher.blood_group)}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Religion</label>
                    <p className="text-gray-900">{renderValue(teacher.religion)}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Nationality</label>
                    <p className="text-gray-900">{renderValue(teacher.nationality)}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Marital Status</label>
                    <p className="text-gray-900">{renderValue(teacher.marital_status)}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Address Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="w-5 h-5" />
                  Address Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">Permanent Address</label>
                  <p className="text-gray-900">{renderValue(teacher.permanent_address)}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Current Address</label>
                  <p className="text-gray-900">{renderValue(teacher.current_address)}</p>
                </div>
              </CardContent>
            </Card>

            {/* Education Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <GraduationCap className="w-5 h-5" />
                  Education Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-500">Education Level</label>
                    <p className="text-gray-900">{renderValue(teacher.education_level)}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Institution Name</label>
                    <p className="text-gray-900">{renderValue(teacher.institution_name)}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Year of Passing</label>
                    <p className="text-gray-900">{renderValue(teacher.year_of_passing)}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Education Subjects</label>
                    <p className="text-gray-900">{renderValue(teacher.education_subjects)}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Education Grade</label>
                    <p className="text-gray-900">{renderValue(teacher.education_grade)}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Degree/Diploma</label>
                    <p className="text-gray-900">{renderValue(teacher.degree_diploma)}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Experience Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="w-5 h-5" />
                  Experience Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-500">Previous Institution</label>
                    <p className="text-gray-900">{renderValue(teacher.previous_institution_name)}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Previous Position</label>
                    <p className="text-gray-900">{renderValue(teacher.previous_position)}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Experience From</label>
                    <p className="text-gray-900">{renderValue(teacher.experience_from_date)}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Experience To</label>
                    <p className="text-gray-900">{renderValue(teacher.experience_to_date)}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Subjects/Classes Taught</label>
                    <p className="text-gray-900">{renderValue(teacher.experience_subjects_classes_taught)}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Total Experience Years</label>
                    <p className="text-gray-900">{renderValue(teacher.total_experience_years)}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Current Role Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building className="w-5 h-5" />
                  Current Role Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-500">Joining Date</label>
                    <p className="text-gray-900">{renderValue(teacher.joining_date)}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Current Role Title</label>
                    <p className="text-gray-900">{renderValue(teacher.current_role_title)}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Current Campus</label>
                    <p className="text-gray-900">{renderValue(campus?.campus_name || campus?.name)}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Current Subjects</label>
                    <p className="text-gray-900">{renderValue(teacher.current_subjects)}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Current Classes</label>
                    <p className="text-gray-900">{renderValue(teacher.current_classes_taught)}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Emergency Contact</label>
                    <p className="text-gray-900">{renderValue(teacher.emergency_contact)}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Currently Active</label>
                    <Badge variant={teacher.is_currently_active ? 'default' : 'secondary'}>
                      {renderValue(teacher.is_currently_active)}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Quick Stats */}
          <div className="space-y-6">
            {/* Teacher Avatar */}
            <Card>
              <CardContent className="p-6 text-center">
                <div className="w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl font-bold text-blue-600">
                    {getInitials(teacher.full_name || 'Unknown')}
                  </span>
                </div>
                <h3 className="text-lg font-semibold text-gray-900">{teacher.full_name}</h3>
                <p className="text-sm text-gray-500">{teacher.current_role_title}</p>
                <p className="text-sm text-gray-500">{campus?.campus_name || campus?.name}</p>
              </CardContent>
            </Card>

            {/* Quick Stats */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="w-5 h-5" />
                  Quick Stats
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">{renderValue(teacher.total_experience_years)}</div>
                  <div className="text-sm text-gray-500">Years Experience</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">{renderValue(teacher.current_subjects)}</div>
                  <div className="text-sm text-gray-500">Current Subjects</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">{renderValue(teacher.current_classes_taught)}</div>
                  <div className="text-sm text-gray-500">Classes Taught</div>
                </div>
              </CardContent>
            </Card>

            {/* Status Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5" />
                  Status
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">Current Status</label>
                  <div className="mt-1">
                    <Badge variant={teacher.is_currently_active ? 'default' : 'secondary'}>
                      {renderValue(teacher.is_currently_active)}
                    </Badge>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Joining Date</label>
                  <p className="text-gray-900">{renderValue(teacher.joining_date)}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Date Created</label>
                  <p className="text-gray-900">{renderValue(teacher.created_at)}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Last Updated</label>
                  <p className="text-gray-900">{renderValue(teacher.updated_at)}</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}