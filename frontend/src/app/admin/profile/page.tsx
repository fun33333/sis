"use client"

import React, { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Calendar, 
  GraduationCap, 
  Building2, 
  Shield, 
  Clock,
  Edit,
  CheckCircle,
  AlertCircle
} from "lucide-react"
import { getCurrentUser, getCurrentUserRole } from "@/lib/permissions"
import { apiGet } from "@/lib/api"
import { useRouter } from "next/navigation"

interface UserProfile {
  id: number
  username: string
  email: string
  first_name: string
  last_name: string
  role: string
  role_display: string
  campus?: {
    id: number
    name: string
    campus_name: string
    campus_code: string
  }
  phone_number?: string
  is_verified: boolean
  is_active: boolean
  last_login?: string
  created_at: string
  updated_at: string
}

interface TeacherData {
  id: number
  full_name: string
  current_subjects?: string
  current_classes_taught?: string
  current_campus?: {
    id: number
    name: string
    campus_name: string
  }
  total_experience_years?: number
  education_level?: string
  joining_date?: string
  is_currently_active: boolean
}

export default function UserProfilePage() {
  const router = useRouter()
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null)
  const [teacherData, setTeacherData] = useState<TeacherData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    document.title = "My Profile | IAK SMS"
    fetchUserProfile()
  }, [])

  const fetchUserProfile = async () => {
    try {
      setLoading(true)
      setError(null)
      
      // Get current user from localStorage
      const currentUser = getCurrentUser()
      if (!currentUser) {
        router.push("/Universal_Login")
        return
      }

      // Fetch detailed user profile from API
      const profileData = await apiGet("/api/users/profile/") as UserProfile
      setUserProfile(profileData)

      // If user is a teacher, fetch additional teacher data
      if (profileData.role === 'teacher') {
        try {
          const teachers = await apiGet("/api/teachers/")
          const teacher = Array.isArray(teachers) 
            ? teachers.find((t: any) => t.email === profileData.email)
            : null
          if (teacher) {
            setTeacherData(teacher as TeacherData)
          }
        } catch (err) {
          console.log("Teacher data not found or not accessible")
        }
      }

    } catch (err: any) {
      console.error("Error fetching profile:", err)
      setError(err.message || "Failed to load profile")
    } finally {
      setLoading(false)
    }
  }

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'superadmin':
        return 'bg-red-100 text-red-800 border-red-200'
      case 'principal':
        return 'bg-purple-100 text-purple-800 border-purple-200'
      case 'coordinator':
        return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'teacher':
        return 'bg-green-100 text-green-800 border-green-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'superadmin':
        return <Shield className="w-5 h-5" />
      case 'principal':
        return <GraduationCap className="w-5 h-5" />
      case 'coordinator':
        return <User className="w-5 h-5" />
      case 'teacher':
        return <GraduationCap className="w-5 h-5" />
      default:
        return <User className="w-5 h-5" />
    }
  }

  const formatDate = (dateString: string) => {
    if (!dateString) return 'Not available'
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const formatDateTime = (dateString: string) => {
    if (!dateString) return 'Not available'
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-lg text-gray-600">Loading your profile...</p>
        </div>
      </div>
    )
  }

  if (error || !userProfile) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-pink-100">
        <Card className="w-full max-w-md">
          <CardContent className="p-6 text-center">
            <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Profile Not Found</h2>
            <p className="text-gray-600 mb-4">{error || "Unable to load your profile"}</p>
            <Button onClick={() => window.location.reload()} variant="outline">
              Try Again
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-100 p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">My Profile</h1>
          <p className="text-gray-600">View and manage your account information</p>
        </div>

        {/* Main Profile Card */}
        <Card className="overflow-hidden shadow-xl border-0">
          <div className="bg-gradient-to-r from-blue-600 to-indigo-700 p-8 text-white">
            <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
              {/* Profile Avatar */}
              <div className="relative">
                <div className="w-24 h-24 bg-white/20 rounded-full flex items-center justify-center text-4xl font-bold text-white border-4 border-white/30">
                  {userProfile.first_name?.[0] || userProfile.username?.[0] || 'U'}
                </div>
                <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-green-500 rounded-full flex items-center justify-center border-2 border-white">
                  <CheckCircle className="w-5 h-5 text-white" />
                </div>
              </div>

              {/* Profile Info */}
              <div className="flex-1">
                <h2 className="text-2xl font-bold mb-2">
                  {userProfile.first_name && userProfile.last_name 
                    ? `${userProfile.first_name} ${userProfile.last_name}`
                    : userProfile.username
                  }
                </h2>
                <div className="flex items-center gap-2 mb-3">
                  {getRoleIcon(userProfile.role)}
                  <Badge className={`${getRoleColor(userProfile.role)} border`}>
                    {userProfile.role_display}
                  </Badge>
                  {userProfile.is_verified && (
                    <Badge className="bg-green-100 text-green-800 border-green-200">
                      Verified
                    </Badge>
                  )}
                </div>
                <p className="text-blue-100 text-lg">
                  {userProfile.campus?.campus_name || userProfile.campus?.name || 'No Campus Assigned'}
                </p>
              </div>

              {/* Action Button */}
              <Button 
                variant="outline" 
                className="bg-white/10 border-white/30 text-white hover:bg-white/20"
                onClick={() => {/* TODO: Add edit functionality */}}
              >
                <Edit className="w-4 h-4 mr-2" />
                Edit Profile
              </Button>
            </div>
          </div>

          <CardContent className="p-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              
              {/* Personal Information */}
              <div className="space-y-6">
                <h3 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                  <User className="w-5 h-5 text-blue-600" />
                  Personal Information
                </h3>
                
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <Mail className="w-5 h-5 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-500">Email Address</p>
                      <p className="font-medium">{userProfile.email}</p>
                    </div>
                  </div>

                  {userProfile.phone_number && (
                    <div className="flex items-center gap-3">
                      <Phone className="w-5 h-5 text-gray-400" />
                      <div>
                        <p className="text-sm text-gray-500">Phone Number</p>
                        <p className="font-medium">{userProfile.phone_number}</p>
                      </div>
                    </div>
                  )}

                  <div className="flex items-center gap-3">
                    <Building2 className="w-5 h-5 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-500">Campus</p>
                      <p className="font-medium">
                        {userProfile.campus?.campus_name || userProfile.campus?.name || 'Not Assigned'}
                        {userProfile.campus?.campus_code && (
                          <span className="text-gray-500 ml-2">({userProfile.campus.campus_code})</span>
                        )}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <Calendar className="w-5 h-5 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-500">Member Since</p>
                      <p className="font-medium">{formatDate(userProfile.created_at)}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Role-Specific Information */}
              <div className="space-y-6">
                <h3 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                  <Shield className="w-5 h-5 text-blue-600" />
                  {userProfile.role === 'teacher' ? 'Teaching Information' : 'Role Information'}
                </h3>

                {userProfile.role === 'teacher' && teacherData ? (
                  <div className="space-y-4">
                    {teacherData.current_subjects && (
                      <div className="flex items-center gap-3">
                        <GraduationCap className="w-5 h-5 text-gray-400" />
                        <div>
                          <p className="text-sm text-gray-500">Subjects</p>
                          <p className="font-medium">{teacherData.current_subjects}</p>
                        </div>
                      </div>
                    )}

                    {teacherData.current_classes_taught && (
                      <div className="flex items-center gap-3">
                        <User className="w-5 h-5 text-gray-400" />
                        <div>
                          <p className="text-sm text-gray-500">Classes</p>
                          <p className="font-medium">{teacherData.current_classes_taught}</p>
                        </div>
                      </div>
                    )}

                    {teacherData.total_experience_years && (
                      <div className="flex items-center gap-3">
                        <Clock className="w-5 h-5 text-gray-400" />
                        <div>
                          <p className="text-sm text-gray-500">Experience</p>
                          <p className="font-medium">{teacherData.total_experience_years} years</p>
                        </div>
                      </div>
                    )}

                    {teacherData.education_level && (
                      <div className="flex items-center gap-3">
                        <GraduationCap className="w-5 h-5 text-gray-400" />
                        <div>
                          <p className="text-sm text-gray-500">Education</p>
                          <p className="font-medium">{teacherData.education_level}</p>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <Shield className="w-5 h-5 text-gray-400" />
                      <div>
                        <p className="text-sm text-gray-500">Role</p>
                        <p className="font-medium">{userProfile.role_display}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <CheckCircle className="w-5 h-5 text-gray-400" />
                      <div>
                        <p className="text-sm text-gray-500">Status</p>
                        <p className="font-medium">
                          {userProfile.is_active ? 'Active' : 'Inactive'}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Last Login */}
                <div className="flex items-center gap-3">
                  <Clock className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-500">Last Login</p>
                    <p className="font-medium">
                      {userProfile.last_login ? formatDateTime(userProfile.last_login) : 'Never'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="text-xl text-gray-900">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Button 
                variant="outline" 
                className="h-16 flex flex-col items-center gap-2"
                onClick={() => router.push('/admin')}
              >
                <Building2 className="w-6 h-6" />
                <span>Dashboard</span>
              </Button>
              
              {userProfile.role === 'teacher' && (
                <Button 
                  variant="outline" 
                  className="h-16 flex flex-col items-center gap-2"
                  onClick={() => router.push('/admin/students/student-list')}
                >
                  <User className="w-6 h-6" />
                  <span>My Students</span>
                </Button>
              )}
              
              <Button 
                variant="outline" 
                className="h-16 flex flex-col items-center gap-2"
                onClick={() => {/* TODO: Add settings */}}
              >
                <Edit className="w-6 h-6" />
                <span>Settings</span>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
