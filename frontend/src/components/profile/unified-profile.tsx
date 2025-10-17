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
  CheckCircle,
  ArrowLeft,
  Users,
  BookOpen,
  Award,
  Briefcase
} from "lucide-react"
import { getCurrentUserProfile } from "@/lib/api"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import { useRouter } from "next/navigation"

interface ProfileData {
  id: number
  username: string
  email: string
  first_name: string
  last_name: string
  role: string
  campus?: {
    id: number
    campus_name: string
    campus_code: string
  }
  // Teacher specific
  teacher_id?: number
  full_name?: string
  dob?: string
  gender?: string
  contact_number?: string
  cnic?: string
  permanent_address?: string
  education_level?: string
  institution_name?: string
  year_of_passing?: number
  total_experience_years?: number
  profile_image?: string
  employee_code?: string
  joining_date?: string
  is_class_teacher?: boolean
  is_currently_active?: boolean
  assigned_classroom?: {
    id: number
    name: string
    grade: string
    section: string
    shift: string
  }
  current_campus?: {
    id: number
    campus_name: string
    campus_code: string
  }
  created_at?: string
  updated_at?: string
  // Coordinator specific
  coordinator_id?: number
  can_assign_class_teachers?: boolean
  level?: {
    id: number
    name: string
    code: string
  }
  // Principal specific
  principal_id?: number
  shift?: string
  // Student specific
  student_id?: number
  name?: string
  father_name?: string
  father_cnic?: string
  father_contact?: string
  father_occupation?: string
  mother_name?: string
  mother_cnic?: string
  mother_contact?: string
  mother_occupation?: string
  guardian_name?: string
  guardian_contact?: string
  guardian_relation?: string
  photo?: string
  student_id_number?: string
  admission_date?: string
  current_state?: string
  classroom?: {
    id: number
    name: string
    grade: string
    section: string
    shift: string
  }
}

const ProfileSection = ({ title, children, icon: Icon }: { title: string, children: React.ReactNode, icon?: any }) => (
  <Card className="mb-6">
    <CardHeader>
      <CardTitle className="flex items-center gap-2 text-lg">
        {Icon && <Icon className="w-5 h-5" />}
        {title}
      </CardTitle>
    </CardHeader>
    <CardContent>
      {children}
    </CardContent>
  </Card>
)

const InfoField = ({ label, value, icon: Icon }: { label: string, value: any, icon?: any }) => {
  if (!value || value === '') return null
  
  return (
    <div className="flex items-center gap-3 py-2">
      {Icon && <Icon className="w-4 h-4 text-gray-400" />}
      <div className="flex-1 min-w-0">
        <p className="text-xs text-gray-500">{label}</p>
        <p className="text-sm font-medium">{value}</p>
      </div>
    </div>
  )
}

const getRoleIcon = (role: string) => {
  switch (role) {
    case 'teacher': return <GraduationCap className="w-4 h-4" />
    case 'coordinator': return <Users className="w-4 h-4" />
    case 'principal': return <Shield className="w-4 h-4" />
    case 'student': return <BookOpen className="w-4 h-4" />
    default: return <User className="w-4 h-4" />
  }
}

const getRoleColor = (role: string) => {
  switch (role) {
    case 'teacher': return 'bg-blue-100 text-blue-800 border-blue-200'
    case 'coordinator': return 'bg-green-100 text-green-800 border-green-200'
    case 'principal': return 'bg-purple-100 text-purple-800 border-purple-200'
    case 'student': return 'bg-orange-100 text-orange-800 border-orange-200'
    default: return 'bg-gray-100 text-gray-800 border-gray-200'
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

const getInitials = (name: string) => {
  return name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || 'U'
}

export default function UnifiedProfile() {
  const [profile, setProfile] = useState<ProfileData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  useEffect(() => {
    async function fetchProfile() {
      try {
        const data = await getCurrentUserProfile()
        if (data) {
          setProfile(data as ProfileData)
        } else {
          setError('Failed to load profile data')
        }
      } catch (err: any) {
        setError(err.message || 'Failed to load profile')
      } finally {
        setLoading(false)
      }
    }

    fetchProfile()
  }, [])

  if (loading) {
    return <LoadingSpinner message="Loading profile..." />
  }

  if (error || !profile) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="p-6 text-center">
            <div className="text-red-500 mb-4">
              <User className="w-12 h-12 mx-auto" />
            </div>
            <h2 className="text-xl font-semibold mb-2">Profile Not Found</h2>
            <p className="text-gray-600 mb-4">{error || 'Unable to load profile data'}</p>
            <Button onClick={() => router.back()} variant="outline">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Go Back
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  const displayName = profile.full_name || profile.name || `${profile.first_name} ${profile.last_name}`.trim() || profile.username
  const profileImage = profile.profile_image || profile.photo || null
  const role = profile.role

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-6">
          <Button 
            onClick={() => router.back()} 
            variant="outline" 
            className="mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <h1 className="text-3xl font-bold text-gray-900">My Profile</h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Profile Header & Basic Info */}
          <div className="lg:col-span-1">
            {/* Profile Header Card */}
            <Card className="mb-6 shadow-lg">
              <CardContent className="p-6">
                <div className="text-center">
                  {/* Profile Image */}
                  <div className="relative mb-4">
                    {profileImage ? (
                      <img 
                        src={profileImage} 
                        alt={displayName}
                        className="w-24 h-24 rounded-full mx-auto object-cover border-4 border-white shadow-lg"
                      />
                    ) : (
                      <div 
                        className="w-24 h-24 rounded-full mx-auto flex items-center justify-center text-2xl font-bold text-white border-4 border-white shadow-lg"
                        style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}
                      >
                        {getInitials(displayName)}
                      </div>
                    )}
                    <div className="absolute -bottom-1 -right-1 w-8 h-8 bg-green-500 rounded-full flex items-center justify-center border-4 border-white">
                      <CheckCircle className="w-5 h-5 text-white" />
                    </div>
                  </div>

                  {/* Name and Role */}
                  <h2 className="text-xl font-bold text-gray-900 mb-2">{displayName}</h2>
                  <div className="flex items-center justify-center gap-2 mb-4">
                    {getRoleIcon(role)}
                    <Badge className={`${getRoleColor(role)} border text-xs`}>
                      {role.charAt(0).toUpperCase() + role.slice(1)}
                    </Badge>
                  </div>

                  {/* Status */}
                  {profile.is_currently_active !== undefined && (
                    <Badge 
                      variant={profile.is_currently_active ? "default" : "secondary"}
                      className={`${profile.is_currently_active 
                        ? 'bg-green-500 text-white border-green-500' 
                        : 'bg-gray-500 text-white border-gray-500'
                      }`}
                    >
                      {profile.is_currently_active ? 'Active' : 'Inactive'}
                    </Badge>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Contact Information */}
            <ProfileSection title="Contact Information" icon={Phone}>
              <div className="space-y-1">
                <InfoField 
                  label="Email" 
                  value={profile.email} 
                  icon={Mail} 
                />
                <InfoField 
                  label="Phone" 
                  value={profile.contact_number} 
                  icon={Phone} 
                />
                <InfoField 
                  label="Address" 
                  value={profile.permanent_address} 
                  icon={MapPin} 
                />
                <InfoField 
                  label="CNIC" 
                  value={profile.cnic} 
                  icon={Shield} 
                />
              </div>
            </ProfileSection>
          </div>

          {/* Right Column - Detailed Information */}
          <div className="lg:col-span-2">
            {/* Personal Information */}
            <ProfileSection title="Personal Information" icon={User}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <InfoField 
                  label="Date of Birth" 
                  value={profile.dob ? formatDate(profile.dob) : 'Not provided'} 
                  icon={Calendar} 
                />
                <InfoField 
                  label="Gender" 
                  value={profile.gender} 
                />
                <InfoField 
                  label="Employee Code" 
                  value={profile.employee_code || profile.student_id_number} 
                  icon={Award} 
                />
                <InfoField 
                  label="Joining Date" 
                  value={profile.joining_date ? formatDate(profile.joining_date) : profile.admission_date ? formatDate(profile.admission_date) : 'Not provided'} 
                  icon={Calendar} 
                />
              </div>
            </ProfileSection>

            {/* Professional Information */}
            <ProfileSection title="Professional Information" icon={Briefcase}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <InfoField 
                  label="Education Level" 
                  value={profile.education_level} 
                  icon={GraduationCap} 
                />
                <InfoField 
                  label="Institution" 
                  value={profile.institution_name} 
                  icon={Building2} 
                />
                <InfoField 
                  label="Year of Passing" 
                  value={profile.year_of_passing} 
                />
                <InfoField 
                  label="Experience" 
                  value={profile.total_experience_years ? `${profile.total_experience_years} years` : 'Not provided'} 
                  icon={Clock} 
                />
              </div>
            </ProfileSection>

            {/* Role-specific Information */}
            {role === 'teacher' && (
              <ProfileSection title="Teaching Information" icon={GraduationCap}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <InfoField 
                    label="Class Teacher" 
                    value={profile.is_class_teacher ? 'Yes' : 'No'} 
                  />
                  <InfoField 
                    label="Assigned Classroom" 
                    value={profile.assigned_classroom ? `${profile.assigned_classroom.grade} - ${profile.assigned_classroom.section} (${profile.assigned_classroom.shift})` : 'Not assigned'} 
                  />
                  <InfoField 
                    label="Current Campus" 
                    value={profile.current_campus?.campus_name} 
                    icon={Building2} 
                  />
                </div>
              </ProfileSection>
            )}

            {role === 'coordinator' && (
              <ProfileSection title="Coordination Information" icon={Users}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <InfoField 
                    label="Assigned Level" 
                    value={profile.level ? `${profile.level.name} (${profile.level.code})` : 'Not assigned'} 
                  />
                  <InfoField 
                    label="Campus" 
                    value={profile.campus?.campus_name} 
                    icon={Building2} 
                  />
                  <InfoField 
                    label="Can Assign Teachers" 
                    value={profile.can_assign_class_teachers ? 'Yes' : 'No'} 
                  />
                </div>
              </ProfileSection>
            )}

            {role === 'principal' && (
              <ProfileSection title="Principal Information" icon={Shield}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <InfoField 
                    label="Campus" 
                    value={profile.campus?.campus_name} 
                    icon={Building2} 
                  />
                  <InfoField 
                    label="Shift" 
                    value={profile.shift} 
                  />
                </div>
              </ProfileSection>
            )}

            {role === 'student' && (
              <ProfileSection title="Student Information" icon={BookOpen}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <InfoField 
                    label="Student ID" 
                    value={profile.student_id_number} 
                  />
                  <InfoField 
                    label="Current State" 
                    value={profile.current_state} 
                  />
                  <InfoField 
                    label="Classroom" 
                    value={profile.classroom ? `${profile.classroom.grade} - ${profile.classroom.section} (${profile.classroom.shift})` : 'Not assigned'} 
                  />
                  <InfoField 
                    label="Campus" 
                    value={profile.campus?.campus_name} 
                    icon={Building2} 
                  />
                </div>
              </ProfileSection>
            )}

            {/* Family Information (for students) */}
            {role === 'student' && (
              <ProfileSection title="Family Information" icon={Users}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <InfoField 
                    label="Father's Name" 
                    value={profile.father_name} 
                  />
                  <InfoField 
                    label="Father's CNIC" 
                    value={profile.father_cnic} 
                  />
                  <InfoField 
                    label="Father's Contact" 
                    value={profile.father_contact} 
                  />
                  <InfoField 
                    label="Father's Occupation" 
                    value={profile.father_occupation} 
                  />
                  <InfoField 
                    label="Mother's Name" 
                    value={profile.mother_name} 
                  />
                  <InfoField 
                    label="Mother's CNIC" 
                    value={profile.mother_cnic} 
                  />
                  <InfoField 
                    label="Mother's Contact" 
                    value={profile.mother_contact} 
                  />
                  <InfoField 
                    label="Mother's Occupation" 
                    value={profile.mother_occupation} 
                  />
                  <InfoField 
                    label="Guardian's Name" 
                    value={profile.guardian_name} 
                  />
                  <InfoField 
                    label="Guardian's Contact" 
                    value={profile.guardian_contact} 
                  />
                  <InfoField 
                    label="Guardian's Relation" 
                    value={profile.guardian_relation} 
                  />
                </div>
              </ProfileSection>
            )}

            {/* System Information */}
            <ProfileSection title="System Information" icon={Clock}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <InfoField 
                  label="Created" 
                  value={profile.created_at ? formatDate(profile.created_at) : 'Not available'} 
                  icon={Calendar} 
                />
                <InfoField 
                  label="Last Updated" 
                  value={profile.updated_at ? formatDate(profile.updated_at) : 'Not available'} 
                  icon={Clock} 
                />
              </div>
            </ProfileSection>
          </div>
        </div>
      </div>
    </div>
  )
}
