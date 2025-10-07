"use client"

import React, { useState, useEffect, useRef } from "react"
import { Card, CardContent } from "@/components/ui/card"
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
  Settings,
  LogOut,
  ChevronDown,
  CheckCircle
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
    campus_name: string
    campus_code: string
  }
  phone_number?: string
  is_verified: boolean
  is_active: boolean
  last_login?: string
  created_at: string
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
  is_currently_active: boolean
}

export function UserProfilePopup() {
  const router = useRouter()
  const [isOpen, setIsOpen] = useState(false)
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null)
  const [teacherData, setTeacherData] = useState<TeacherData | null>(null)
  const [loading, setLoading] = useState(false)
  const [isClient, setIsClient] = useState(false)
  const popupRef = useRef<HTMLDivElement>(null)

  // Ensure client-side only rendering
  useEffect(() => {
    setIsClient(true)
  }, [])

  // Close popup when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (popupRef.current && !popupRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen])

  // Load user data when popup opens
  useEffect(() => {
    if (isClient && isOpen && !userProfile) {
      fetchUserProfile()
    }
  }, [isClient, isOpen, userProfile])

  const fetchUserProfile = async () => {
    try {
      setLoading(true)
      
      // Get current user from localStorage
      const currentUser = getCurrentUser()
      if (!currentUser) {
        router.push("/Universal_Login")
        return
      }

      // Fetch detailed user profile from API
      const profileData = await apiGet("/api/profile/") as UserProfile
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
      // Fallback to localStorage data
      const currentUser = getCurrentUser()
      if (currentUser) {
        setUserProfile({
          id: 0,
          username: currentUser.username || '',
          email: currentUser.email || '',
          first_name: currentUser.first_name || '',
          last_name: currentUser.last_name || '',
          role: currentUser.role || '',
          role_display: currentUser.role || '',
          is_verified: false,
          is_active: true,
          created_at: new Date().toISOString()
        })
      }
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
        return <Shield className="w-4 h-4" />
      case 'principal':
        return <GraduationCap className="w-4 h-4" />
      case 'coordinator':
        return <User className="w-4 h-4" />
      case 'teacher':
        return <GraduationCap className="w-4 h-4" />
      default:
        return <User className="w-4 h-4" />
    }
  }

  const formatDate = (dateString: string) => {
    if (!dateString) return 'Not available'
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const handleLogout = () => {
    window.localStorage.removeItem("sis_user")
    window.localStorage.removeItem("sis_access_token")
    window.localStorage.removeItem("sis_refresh_token")
    router.push("/Universal_Login")
  }

  const [currentUser, setCurrentUser] = useState<any>(null)
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
    setCurrentUser(getCurrentUser())
  }, [])

  if (!isClient || !currentUser) return null

  // Don't render until client-side
  if (!isClient) {
    return (
      <div className="flex items-center gap-3 p-2 rounded-lg">
        <div className="h-8 w-8 bg-gray-200 rounded-full animate-pulse"></div>
        <div className="h-4 w-20 bg-gray-200 rounded animate-pulse"></div>
      </div>
    )
  }

  return (
    <div className="relative" ref={popupRef}>
      {/* Profile Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-100 transition-colors"
      >
        <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white font-semibold text-sm">
          {currentUser.first_name?.[0] || currentUser.username?.[0] || 'U'}
        </div>
        <div className="hidden md:block text-left">
          <p className="text-sm font-medium text-gray-900">
            {currentUser.first_name && currentUser.last_name 
              ? `${currentUser.first_name} ${currentUser.last_name}`
              : currentUser.username
            }
          </p>
          <p className="text-xs text-gray-500">{currentUser.role}</p>
        </div>
        <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {/* Popup */}
      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-80 bg-white rounded-xl shadow-2xl border border-gray-200 z-50 overflow-hidden">
          <Card className="border-0 shadow-none">
            <CardContent className="p-0">
              {/* Header */}
              <div className="bg-gradient-to-r from-blue-600 to-indigo-700 p-6 text-white">
                <div className="flex items-center gap-4">
                  <div className="relative">
                    <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center text-2xl font-bold text-white border-2 border-white/30">
                      {userProfile?.first_name?.[0] || currentUser.first_name?.[0] || currentUser.username?.[0] || 'U'}
                    </div>
                    <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center border-2 border-white">
                      <CheckCircle className="w-4 h-4 text-white" />
                    </div>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-bold">
                      {userProfile?.first_name && userProfile?.last_name 
                        ? `${userProfile.first_name} ${userProfile.last_name}`
                        : userProfile?.username || currentUser.username
                      }
                    </h3>
                    <div className="flex items-center gap-2 mt-1">
                      {getRoleIcon(userProfile?.role || currentUser.role)}
                      <Badge className={`${getRoleColor(userProfile?.role || currentUser.role)} border text-xs`}>
                        {userProfile?.role_display || currentUser.role}
                      </Badge>
                    </div>
                  </div>
                </div>
              </div>

              {/* Content */}
              <div className="p-4 space-y-4 max-h-96 overflow-y-auto">
                {loading ? (
                  <div className="text-center py-4">
                    <div className="w-6 h-6 border-2 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-2"></div>
                    <p className="text-sm text-gray-500">Loading profile...</p>
                  </div>
                ) : (
                  <>
                    {/* Basic Info */}
                    <div className="space-y-3">
                      <div className="flex items-center gap-3">
                        <Mail className="w-4 h-4 text-gray-400" />
                        <div className="flex-1 min-w-0">
                          <p className="text-xs text-gray-500">Email</p>
                          <p className="text-sm font-medium truncate">{userProfile?.email || currentUser.email}</p>
                        </div>
                      </div>

                      {userProfile?.phone_number && (
                        <div className="flex items-center gap-3">
                          <Phone className="w-4 h-4 text-gray-400" />
                          <div className="flex-1 min-w-0">
                            <p className="text-xs text-gray-500">Phone</p>
                            <p className="text-sm font-medium">{userProfile.phone_number}</p>
                          </div>
                        </div>
                      )}

                      <div className="flex items-center gap-3">
                        <Building2 className="w-4 h-4 text-gray-400" />
                        <div className="flex-1 min-w-0">
                          <p className="text-xs text-gray-500">Campus</p>
                          <p className="text-sm font-medium truncate">
                            {userProfile?.campus?.campus_name || 'Not Assigned'}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <Calendar className="w-4 h-4 text-gray-400" />
                        <div className="flex-1 min-w-0">
                          <p className="text-xs text-gray-500">Member Since</p>
                          <p className="text-sm font-medium">
                            {userProfile?.created_at ? formatDate(userProfile.created_at) : 'Unknown'}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Teacher Specific Info */}
                    {userProfile?.role === 'teacher' && teacherData && (
                      <div className="border-t pt-3 space-y-3">
                        <h4 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                          <GraduationCap className="w-4 h-4" />
                          Teaching Info
                        </h4>
                        
                        {teacherData.current_subjects && (
                          <div className="flex items-center gap-3">
                            <GraduationCap className="w-4 h-4 text-gray-400" />
                            <div className="flex-1 min-w-0">
                              <p className="text-xs text-gray-500">Subjects</p>
                              <p className="text-sm font-medium truncate">{teacherData.current_subjects}</p>
                            </div>
                          </div>
                        )}

                        {teacherData.current_classes_taught && (
                          <div className="flex items-center gap-3">
                            <User className="w-4 h-4 text-gray-400" />
                            <div className="flex-1 min-w-0">
                              <p className="text-xs text-gray-500">Classes</p>
                              <p className="text-sm font-medium truncate">{teacherData.current_classes_taught}</p>
                            </div>
                          </div>
                        )}

                        {teacherData.total_experience_years && (
                          <div className="flex items-center gap-3">
                            <Clock className="w-4 h-4 text-gray-400" />
                            <div className="flex-1 min-w-0">
                              <p className="text-xs text-gray-500">Experience</p>
                              <p className="text-sm font-medium">{teacherData.total_experience_years} years</p>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </>
                )}
              </div>

              {/* Actions */}
              <div className="border-t bg-gray-50 p-4 space-y-2">
                <Button 
                  variant="ghost" 
                  className="w-full justify-start text-sm text-red-600 hover:text-red-700 hover:bg-red-50"
                  onClick={handleLogout}
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  Logout
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
