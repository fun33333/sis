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
import { getTeacherById } from "@/lib/api"

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
        const foundTeacher = await getTeacherById(teacherId)

        if (!foundTeacher) {
          setError("Teacher not found")
          setLoading(false)
          return
        }

        // Find the campus
        let foundCampus = null
        if ((foundTeacher as any).current_campus) {
          if (typeof (foundTeacher as any).current_campus === 'object') {
            foundCampus = (foundTeacher as any).current_campus
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
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
        <div className="text-center">
          <div className="relative">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-white/30 border-t-white mx-auto"></div>
            <div className="absolute inset-0 rounded-full h-16 w-16 border-4 border-transparent border-t-white/60 animate-spin" style={{ animationDirection: 'reverse', animationDuration: '1.5s' }}></div>
          </div>
          <p className="mt-6 text-white text-lg font-medium">Loading teacher profile...</p>
          <p className="mt-2 text-white/70">Please wait while we fetch the details</p>
        </div>
      </div>
    )
  }

  if (error || !teacher) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
        <Card className="w-full max-w-md bg-white/95 backdrop-blur-lg shadow-2xl border-0">
          <CardContent className="p-8 text-center">
            <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <XCircle className="w-12 h-12 text-red-500" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">Oops! Something went wrong</h2>
            <p className="text-gray-600 mb-6 text-lg">{error || "Teacher not found"}</p>
            <Button 
              onClick={() => router.back()} 
              className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white px-6 py-3 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300"
            >
              <ArrowLeft className="w-5 h-5 mr-2" />
              Go Back
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen" style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
      {/* Header */}
      <div className="bg-white/10 backdrop-blur-lg border-b border-white/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-4">
            <div className="flex items-center">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.back()}
                className="mr-4 text-white hover:bg-white/20"
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <div>
                <h1 className="text-2xl font-bold text-white">Teacher Profile</h1>
                <p className="text-sm text-white/80">Detailed information about {teacher.full_name || 'Unknown Teacher'}</p>
              </div>
            </div>
            <div className="flex gap-3">
              <Button className="bg-white text-purple-600 hover:bg-white/90 shadow-lg">
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
            <Card className="bg-white/95 backdrop-blur-lg shadow-2xl border-0 hover:shadow-3xl transition-all duration-300">
              <CardHeader className="bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-t-lg">
                <CardTitle className="flex items-center gap-2 text-xl">
                  <User className="w-6 h-6" />
                  Personal Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 p-6">
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
            <Card className="bg-white/95 backdrop-blur-lg shadow-2xl border-0 hover:shadow-3xl transition-all duration-300">
              <CardHeader className="bg-gradient-to-r from-green-500 to-teal-600 text-white rounded-t-lg">
                <CardTitle className="flex items-center gap-2 text-xl">
                  <MapPin className="w-6 h-6" />
                  Address Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 p-6">
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
            <Card className="bg-white/95 backdrop-blur-lg shadow-2xl border-0 hover:shadow-3xl transition-all duration-300">
              <CardHeader className="bg-gradient-to-r from-orange-500 to-pink-600 text-white rounded-t-lg">
                <CardTitle className="flex items-center gap-2 text-xl">
                  <GraduationCap className="w-6 h-6" />
                  Education Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 p-6">
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
            <Card className="bg-white/95 backdrop-blur-lg shadow-2xl border-0 hover:shadow-3xl transition-all duration-300">
              <CardHeader className="bg-gradient-to-r from-indigo-500 to-blue-600 text-white rounded-t-lg">
                <CardTitle className="flex items-center gap-2 text-xl">
                  <BookOpen className="w-6 h-6" />
                  Experience Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 p-6">
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
            <Card className="bg-white/95 backdrop-blur-lg shadow-2xl border-0 hover:shadow-3xl transition-all duration-300">
              <CardHeader className="bg-gradient-to-r from-purple-500 to-pink-600 text-white rounded-t-lg">
                <CardTitle className="flex items-center gap-2 text-xl">
                  <Building className="w-6 h-6" />
                  Current Role Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 p-6">
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
            <Card className="bg-white/95 backdrop-blur-lg shadow-2xl border-0 hover:shadow-3xl transition-all duration-300">
              <CardContent className="p-8 text-center">
                <div className="relative w-32 h-32 mx-auto mb-6">
                  <div className="w-full h-full bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center shadow-2xl transform hover:scale-110 transition-transform duration-300">
                    <span className="text-4xl font-bold text-white">
                      {getInitials(teacher.full_name || 'Unknown')}
                    </span>
                  </div>
                  <div className="absolute bottom-0 right-0 w-10 h-10 bg-green-500 rounded-full border-4 border-white flex items-center justify-center">
                    <CheckCircle className="w-5 h-5 text-white" />
                  </div>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">{teacher.full_name}</h3>
                <p className="text-sm font-medium text-purple-600 mb-1">{teacher.current_role_title}</p>
                <p className="text-sm text-gray-500 flex items-center justify-center gap-1">
                  <MapPin className="w-4 h-4" />
                  {campus?.campus_name || campus?.name}
                </p>
              </CardContent>
            </Card>

            {/* Quick Stats */}
            <Card className="bg-white/95 backdrop-blur-lg shadow-2xl border-0 hover:shadow-3xl transition-all duration-300">
              <CardHeader className="bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-t-lg">
                <CardTitle className="flex items-center gap-2 text-xl">
                  <Clock className="w-6 h-6" />
                  Quick Stats
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6 p-6">
                <div className="text-center p-4 bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl">
                  <div className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">{renderValue(teacher.total_experience_years)}</div>
                  <div className="text-sm font-medium text-gray-600 mt-2">Years Experience</div>
                </div>
                <div className="text-center p-4 bg-gradient-to-br from-green-50 to-teal-50 rounded-xl">
                  <div className="text-lg font-bold text-green-600">{renderValue(teacher.current_subjects)}</div>
                  <div className="text-sm font-medium text-gray-600 mt-2">Current Subjects</div>
                </div>
                <div className="text-center p-4 bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl">
                  <div className="text-lg font-bold text-purple-600">{renderValue(teacher.current_classes_taught)}</div>
                  <div className="text-sm font-medium text-gray-600 mt-2">Classes Taught</div>
                </div>
              </CardContent>
            </Card>

            {/* Status Information */}
            <Card className="bg-white/95 backdrop-blur-lg shadow-2xl border-0 hover:shadow-3xl transition-all duration-300">
              <CardHeader className="bg-gradient-to-r from-emerald-500 to-green-600 text-white rounded-t-lg">
                <CardTitle className="flex items-center gap-2 text-xl">
                  <CheckCircle className="w-6 h-6" />
                  Status
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 p-6">
                <div className="p-4 bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl">
                  <label className="text-sm font-medium text-gray-600">Current Status</label>
                  <div className="mt-2">
                    <Badge 
                      className={`${teacher.is_currently_active ? 'bg-green-500 hover:bg-green-600' : 'bg-gray-500'} text-white px-4 py-1`}
                    >
                      {teacher.is_currently_active ? '✓ Active' : 'Inactive'}
                    </Badge>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500 flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    Joining Date
                  </label>
                  <p className="text-gray-900 font-medium mt-1">{renderValue(teacher.joining_date)}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500 flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    Last Updated
                  </label>
                  <p className="text-gray-900 font-medium mt-1">{renderValue(teacher.updated_at)}</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}